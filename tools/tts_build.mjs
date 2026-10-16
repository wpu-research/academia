// Dil cümlelerini Mac'in sesiyle (ElevenLabs) önceden MP3'e çevirir: public/audio/<dil>/<özet>.mp3 + public/audio/manifest.json.
// Kaynaklar: data.js'teki soruların `say` alanları ve modules/*/anlatim/*.json içindeki "ses" bölümleri.
// Var olan dosya yeniden üretilmez; metni değişen cümle yeni dosya alır, artık kullanılmayanlar --prune ile silinir.
//
// Kullanım:
//   node tools/tts_build.mjs                 # anahtar yoksa yalnız sayım (kaç cümle, kaç karakter eksik)
//   ELEVENLABS_API_KEY=... node tools/tts_build.mjs [--lang de-DE] [--prune]
// Ses ayarları ask-robotic/lib/tts/providers.ts ile aynı: TTS_VOICE (varsayılan Mac'in sesi), ELEVENLABS_MODEL.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../public");
const OUT = path.join(ROOT, "audio");
const KEY = process.env.ELEVENLABS_API_KEY?.trim();
const BASE = process.env.ELEVENLABS_BASE_URL?.trim() || "https://api.elevenlabs.io"; // testte sahte sunucu
const VOICE = process.env.TTS_VOICE?.trim() || "21m00Tcm4TlvDq8ikWAM";
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
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8"), sandbox);
  for (const ex of Object.values(sandbox.ACADEMIA.exams)) for (const it of ex.items) if (it.say) add(it.say.lang, it.say.text);
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
  const h = crypto.createHash("sha256").update(`${VOICE}|${MODEL}|${SPEED}|${lang}|${text}`).digest("hex").slice(0, 16);
  return `audio/${lang.slice(0, 2)}/${h}.mp3`;
};

async function synth({ text }) {
  const body = { text, model_id: MODEL, voice_settings: { speed: SPEED } };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${BASE}/v1/text-to-speech/${encodeURIComponent(VOICE)}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "content-type": "application/json", "xi-api-key": KEY, accept: "audio/mpeg" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error("boş ses");
      return buf;
    }
    const msg = (await res.text().catch(() => "")).slice(0, 300);
    if (res.status === 401 || res.status === 403) throw new Error(`yetki hatası (${res.status}): ${msg}`);
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
console.log(`${all.size} cümle · hazır ${all.size - todo.length} · eksik ${todo.length} (${chars} karakter) · ses ${VOICE} · model ${MODEL}`);
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
      if (/yetki/.test(e.message)) { queue.length = 0; }
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
