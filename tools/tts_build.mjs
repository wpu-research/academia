// Dil cümlelerini ElevenLabs ile önceden MP3'e çevirir: public/audio/<dil>/<özet>.mp3 + public/audio/manifest.json.
// Kaynaklar: data.js'teki soruların `say` alanları ve modules/*/anlatim/*.json içindeki "ses" bölümleri.
// Var olan dosya yeniden üretilmez; metni değişen cümle yeni dosya alır, artık kullanılmayanlar --prune ile silinir.
//
// Kullanım:
//   node tools/tts_build.mjs                 # anahtar yoksa yalnız sayım (kaç cümle, kaç karakter eksik)
//   ELEVENLABS_API_KEY=anahtar1,anahtar2 node tools/tts_build.mjs [--lang de-DE] [--prune]
// Birden çok anahtar virgülle verilebilir: birinin kotası dolunca sıradakine geçilir.
// Ücretsiz ElevenLabs planı yalnız varsayılan sesleri API'den kullandırır (kütüphane sesleri 402 döner) ve
// ElevenLabs'in anılmasını ister; sayfalarda "Seslendirme: ElevenLabs" notu bu yüzden var.
// Ses seçimi: TTS_VOICE_DE, TTS_VOICE_EN (dile göre) ya da TTS_VOICE (hepsi için); model ELEVENLABS_MODEL.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../public");
const OUT = path.join(ROOT, "audio");
const KEYS = (process.env.ELEVENLABS_API_KEY || "").split(",").map((k) => k.trim()).filter(Boolean);
let keyIdx = 0;
const KEY = KEYS[0];
const BASE = process.env.ELEVENLABS_BASE_URL?.trim() || "https://api.elevenlabs.io"; // testte sahte sunucu
// Ücretsiz planda kullanılabilen varsayılan sesler: Almanca için Sarah, İngilizce (Birleşik Krallık) için Alice.
const DEFAULT_VOICE = { de: "EXAVITQu4vr4xnSDxMaL", en: "Xb7hH8MSUJpSbSDYk0k2" };
const voiceFor = (lang) => { const l = lang.slice(0, 2); return process.env[`TTS_VOICE_${l.toUpperCase()}`]?.trim() || process.env.TTS_VOICE?.trim() || DEFAULT_VOICE[l] || DEFAULT_VOICE.en; };
const MODEL = process.env.ELEVENLABS_MODEL?.trim() || "eleven_multilingual_v2";
const SPEED = Number(process.env.TTS_SPEED) || 0.9; // öğrenenler için biraz yavaş
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const ONLY = arg("--lang");
const PRUNE = process.argv.includes("--prune");

// voice.js'teki norm() ile aynı olmalı.
const norm = (s) => String(s ?? "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function collect() {
  const out = new Map();
  const add = (lang, text) => { const t = norm(text); if (lang && t && (!ONLY || lang === ONLY)) out.set(`${lang}|${t}`, { lang, text: t }); };
  const sandbox = {}; sandbox.window = sandbox; // tarayıcıdaki gibi: window.X = global X
  vm.createContext(sandbox);
  for (const f of ["data.js", "data-practice.js"]) if (fs.existsSync(path.join(ROOT, f))) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox);
  for (const ex of Object.values(sandbox.ACADEMIA.exams)) for (const it of ex.items) if (it.say) add(it.say.lang, it.say.text);
  // Konuşma pratiği: soru, tekrar cümlesi ve örnek cevap dinlenebilir (şimdilik yalnız Almanca içerik var).
  for (const p of Object.values(sandbox.ACADEMIA.practice || {})) for (const s of p.konusma || []) for (const g of s.gorevler) {
    if (g.soru) add(g.soru.lang, g.soru.text);
    if (g.tekrar) add("de-DE", g.tekrar);
    if (g.ornek) add("de-DE", g.ornek);
  }
  const mods = path.join(ROOT, "modules");
  for (const m of fs.readdirSync(mods)) {
    const dir = path.join(mods, m, "anlatim");
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json") || f === "index.json") continue;
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      for (const b of d.bolumler || []) if (b.tur === "ses") for (const s of b.satirlar) add(b.lang, s.metin);
    }
  }
  return out;
}

const fileFor = ({ lang, text }) => {
  const h = crypto.createHash("sha256").update(`${voiceFor(lang)}|${MODEL}|${SPEED}|${lang}|${text}`).digest("hex").slice(0, 16);
  return `audio/${lang.slice(0, 2)}/${h}.mp3`;
};

async function synth({ lang, text }) {
  const body = { text, model_id: MODEL, voice_settings: { speed: SPEED } };
  for (let attempt = 1; ; attempt++) {
    const used = keyIdx;
    const res = await fetch(`${BASE}/v1/text-to-speech/${encodeURIComponent(voiceFor(lang))}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "content-type": "application/json", "xi-api-key": KEYS[used], accept: "audio/mpeg" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error("boş ses");
      return buf;
    }
    const msg = (await res.text().catch(() => "")).slice(0, 300);
    // Kota doldu: sıradaki anahtarla aynı cümleyi yeniden dene.
    // Eşzamanlı işçilerden biri anahtarı zaten değiştirdiyse yalnız yeniden dene.
    if (/quota_exceeded/.test(msg) && (used < keyIdx || used + 1 < KEYS.length)) {
      if (used === keyIdx) { keyIdx++; console.log(`  kota doldu, ${keyIdx + 1}. anahtara geçildi`); }
      attempt = 0; continue;
    }
    // Yetki ya da plan hatası her cümlede tekrarlanır: ilkinde dur.
    if (res.status === 401 || res.status === 402 || res.status === 403) throw Object.assign(new Error(`ElevenLabs ${res.status}: ${msg}`), { fatal: true });
    if ((res.status === 429 || res.status >= 500) && attempt < 5) { await new Promise((r) => setTimeout(r, 2000 * attempt)); continue; }
    throw new Error(`ElevenLabs ${res.status}: ${msg}`);
  }
}

const all = collect();
const manifestPath = path.join(OUT, "manifest.json");
const old = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
const manifest = {};
const todo = [];
for (const [k, v] of all) {
  const rel = fileFor(v);
  if (fs.existsSync(path.join(ROOT, rel))) manifest[k] = rel; else todo.push({ k, v, rel });
}
// --lang ile çalışınca diğer dillerin kayıtları korunur.
if (ONLY) for (const [k, rel] of Object.entries(old)) if (!k.startsWith(`${ONLY}|`) && fs.existsSync(path.join(ROOT, rel))) manifest[k] = rel;

const chars = todo.reduce((n, x) => n + x.v.text.length, 0);
const langs = [...new Set([...all.values()].map((v) => v.lang))];
console.log(`${all.size} cümle · hazır ${all.size - todo.length} · eksik ${todo.length} (${chars} karakter) · ses ${langs.map((l) => `${l}=${voiceFor(l)}`).join(", ")} · model ${MODEL} · ${KEYS.length} anahtar`);
const writeManifest = () => {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => (a < b ? -1 : 1)));
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 1) + "\n");
  return sorted;
};
if (!KEY) {
  writeManifest();
  if (todo.length) console.log("ELEVENLABS_API_KEY tanımlı değil: dosya üretilmedi. Eksikler tarayıcı sesiyle çalınır.");
  process.exit(0);
}

// Kota raporu: user_read izni olan anahtarların kalan karakteri okunur, en çok kalandan başlanır.
async function remaining(key) {
  try {
    const r = await fetch(`${BASE}/v1/user/subscription`, { headers: { "xi-api-key": key }, signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return null;
    const s = await r.json();
    return typeof s.character_limit === "number" ? s.character_limit - s.character_count : null;
  } catch (_) { return null; }
}
const quota = await Promise.all(KEYS.map(remaining));
KEYS.forEach((k, i) => console.log(`  anahtar ${i + 1} (${k.slice(0, 7)}…): ${quota[i] === null ? "kalan okunamadı (user_read izni yok)" : `${quota[i]} karakter kalan`}`));
const order = KEYS.map((k, i) => ({ k, q: quota[i] })).sort((x, y) => (y.q ?? -1) - (x.q ?? -1));
KEYS.splice(0, KEYS.length, ...order.map((x) => x.k));
const known = quota.filter((q) => q !== null);
if (known.length === KEYS.length && known.reduce((a, b) => a + b, 0) < chars) console.log(`  uyarı: eksik ${chars} karakter, anahtarlarda toplam ${known.reduce((a, b) => a + b, 0)} kalan`);

let done = 0, failed = 0;
const queue = todo.slice();
async function worker() {
  for (let x; (x = queue.shift()); ) {
    try {
      const buf = await synth(x.v);
      fs.mkdirSync(path.dirname(path.join(ROOT, x.rel)), { recursive: true });
      fs.writeFileSync(path.join(ROOT, x.rel), buf);
      manifest[x.k] = x.rel;
      done++;
      if (done % 20 === 0) console.log(`  ${done}/${todo.length}`);
    } catch (e) {
      failed++;
      console.error(`  hata: "${x.v.text.slice(0, 50)}" → ${e.message}`);
      if (e.fatal) { queue.length = 0; }
    }
  }
}
await Promise.all([worker(), worker(), worker()]);

const sorted = writeManifest();

if (PRUNE) {
  const keep = new Set(Object.values(sorted));
  let removed = 0;
  for (const lang of fs.readdirSync(OUT)) {
    const dir = path.join(OUT, lang);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (!keep.has(`audio/${lang}/${f}`)) { fs.unlinkSync(path.join(dir, f)); removed++; }
  }
  console.log(`kullanılmayan ${removed} dosya silindi`);
}
console.log(`üretilen ${done} · hata ${failed} · manifest ${Object.keys(sorted).length} kayıt`);
process.exit(failed ? 1 : 0);
