// Dil cümlelerini önceden MP3'e çevirir: public/audio/<dil>/<özet>.mp3 + public/audio/manifest.json.
// Kaynaklar: data.js'teki soruların `say` alanları, data-practice.js (konuşma ve kelime) ve
// modules/*/anlatim/*.json içindeki "ses" bölümleri.
// Var olan dosya yeniden üretilmez; metni değişen cümle yeni dosya alır, artık kullanılmayanlar --prune ile silinir.
//
// Sağlayıcı (TTS_PROVIDER):
//   piper (varsayılan): yerel, ücretsiz, açık kaynak. piper-tts Python paketi, ffmpeg ve ses modelleri gerekir:
//     modeller PIPER_VOICES klasöründe (varsayılan ~/.local/share/piper/voices), <ad>.onnx + <ad>.onnx.json.
//     Sesler: de_DE-thorsten-medium (veri seti CC0), en_GB-cori-high (LibriVox, kamu malı).
//     faster-whisper kuruluysa her kayıt metne çevrilip denetlenir, anlaşılmayan kayıt yeniden üretilir
//     (tools/piper_synth.py). Kapatmak için PIPER_VERIFY=0.
//   elevenlabs: ELEVENLABS_API_KEY ile tek hesap; ses TTS_VOICE_DE / TTS_VOICE_EN.
//
// Kullanım:
//   node tools/tts_build.mjs [--lang de-DE] [--prune] [--dry-run]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const TOOLS = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(TOOLS, "../public");
const OUT = path.join(ROOT, "audio");
const env = (k) => process.env[k]?.trim() || undefined;
const PROVIDER = (env("TTS_PROVIDER") || "piper").toLowerCase();
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const ONLY = arg("--lang");
const PRUNE = process.argv.includes("--prune");
const DRY = process.argv.includes("--dry-run");

// ---------- Sağlayıcılar ----------
const PIPER_DIR = env("PIPER_VOICES") || path.join(os.homedir(), ".local/share/piper/voices");
// Almanca: thorsten-medium kısa kelimelerde high sürümünden daha anlaşılır çıktı (Whisper ile ölçüldü).
const PIPER_VOICE = { de: "de_DE-thorsten-medium", en: "en_GB-cori-high" };
const PIPER_VERIFY = env("PIPER_VERIFY") !== "0";
const PIPER_LENGTH = Number(env("PIPER_LENGTH_SCALE")) || 1.1; // >1 daha yavaş: öğrenenler için
const EL_KEY = env("ELEVENLABS_API_KEY");
const EL_BASE = env("ELEVENLABS_BASE_URL") || "https://api.elevenlabs.io"; // testte sahte sunucu
const EL_VOICE = { de: "EXAVITQu4vr4xnSDxMaL", en: "Xb7hH8MSUJpSbSDYk0k2" };
const EL_MODEL = env("ELEVENLABS_MODEL") || "eleven_multilingual_v2";
const EL_SHORT_MODEL = env("ELEVENLABS_SHORT_MODEL") || "eleven_flash_v2_5"; // dili zorlanabilir; tek kelimeler için
const EL_SPEED = Number(env("TTS_SPEED")) || 0.9;
const isShort = (text) => text.split(" ").length <= 3;
const l2 = (lang) => lang.slice(0, 2);
const voiceFor = (lang) => PROVIDER === "piper"
  ? env(`PIPER_VOICE_${l2(lang).toUpperCase()}`) || PIPER_VOICE[l2(lang)]
  : env(`TTS_VOICE_${l2(lang).toUpperCase()}`) || EL_VOICE[l2(lang)];
// Dosya adı sağlayıcı, ses ve ayarları da içerir: ses değişince dosyalar yeniden üretilir.
const settings = (text) => PROVIDER === "piper" ? `piper|${PIPER_LENGTH}|n0.333` : `elevenlabs|${isShort(text) ? EL_SHORT_MODEL : EL_MODEL}|${EL_SPEED}`;
if (!["piper", "elevenlabs"].includes(PROVIDER)) { console.error(`Bilinmeyen TTS_PROVIDER: ${PROVIDER}`); process.exit(2); }
if (PROVIDER === "elevenlabs" && EL_KEY?.includes(",")) { console.error("ELEVENLABS_API_KEY tek bir anahtar olmalı."); process.exit(2); }

// voice.js'teki norm() ile aynı olmalı.
const norm = (s) => String(s ?? "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function collect() {
  const out = new Map();
  const add = (lang, text) => { const t = norm(text); if (lang && t && (!ONLY || lang === ONLY)) out.set(`${lang}|${t}`, { lang, text: t }); };
  const sandbox = {}; sandbox.window = sandbox; // tarayıcıdaki gibi: window.X = global X
  vm.createContext(sandbox);
  for (const f of ["data.js", "data-practice.js"]) if (fs.existsSync(path.join(ROOT, f))) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox);
  for (const ex of Object.values(sandbox.ACADEMIA.exams)) for (const it of ex.items) if (it.say) add(it.say.lang, it.say.text);
  // Pratik içeriğinin dili practice.<sınav>.lang'dir (yoksa Almanca).
  for (const p of Object.values(sandbox.ACADEMIA.practice || {})) {
    const L = p.lang || "de-DE";
    for (const s of p.konusma || []) for (const g of s.gorevler) {
      if (g.soru) add(g.soru.lang, g.soru.text);
      if (g.tekrar) add(L, g.tekrar);
      if (g.ornek) add(L, g.ornek);
    }
    for (const t of p.kelime || []) for (const [w] of t.kelimeler) add(L, w);
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
  const h = crypto.createHash("sha256").update(`${settings(text)}|${voiceFor(lang)}|${lang}|${text}`).digest("hex").slice(0, 16);
  return `audio/${l2(lang)}/${h}.mp3`;
};

async function elevenlabs({ lang, text }) {
  const body = { text, model_id: isShort(text) ? EL_SHORT_MODEL : EL_MODEL, voice_settings: { speed: EL_SPEED } };
  if (isShort(text)) body.language_code = l2(lang);
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(`${EL_BASE}/v1/text-to-speech/${encodeURIComponent(voiceFor(lang))}?output_format=mp3_44100_64`, {
        method: "POST",
        headers: { "content-type": "application/json", "xi-api-key": EL_KEY, accept: "audio/mpeg" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (e) {
      if (attempt < 5) { await new Promise((r) => setTimeout(r, 2000 * attempt)); continue; } // ağ hatası
      throw e;
    }
    if (res.ok) { const buf = Buffer.from(await res.arrayBuffer()); if (!buf.length) throw new Error("boş ses"); return buf; }
    const msg = (await res.text().catch(() => "")).slice(0, 300);
    // Yetki, plan ya da kota hatası her cümlede tekrarlanır: ilkinde dur.
    if ([401, 402, 403].includes(res.status)) throw Object.assign(new Error(`ElevenLabs ${res.status}: ${msg}`), { fatal: true });
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
console.log(`${all.size} cümle · hazır ${all.size - todo.length} · eksik ${todo.length} (${chars} karakter) · ${PROVIDER}: ${langs.map((l) => `${l}=${voiceFor(l)}`).join(", ")}`);
const writeManifest = () => {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => (a < b ? -1 : 1)));
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 1) + "\n");
  return sorted;
};
const prune = (sorted) => {
  const keep = new Set(Object.values(sorted));
  let removed = 0;
  for (const lang of fs.readdirSync(OUT)) {
    const dir = path.join(OUT, lang);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (!keep.has(`audio/${lang}/${f}`)) { fs.unlinkSync(path.join(dir, f)); removed++; }
  }
  console.log(`kullanılmayan ${removed} dosya silindi`);
};
const unavailable = DRY || (PROVIDER === "elevenlabs" && !EL_KEY);
if (unavailable || !todo.length) {
  if (DRY) process.exit(0); // deneme: hiçbir dosyaya dokunma
  const sorted = writeManifest();
  if (PRUNE) prune(sorted);
  if (todo.length && PROVIDER === "elevenlabs" && !EL_KEY) console.log("ELEVENLABS_API_KEY tanımlı değil: dosya üretilmedi. Eksikler tarayıcı sesiyle çalınır.");
  process.exit(0);
}

let done = 0, failed = 0;
if (PROVIDER === "piper") {
  for (const l of new Set(todo.map((x) => l2(x.v.lang)))) {
    const f = path.join(PIPER_DIR, `${voiceFor(l)}.onnx`);
    if (!fs.existsSync(f)) { console.error(`Piper ses modeli yok: ${f}`); process.exit(2); }
  }
  const jobsFile = path.join(os.tmpdir(), `tts-jobs-${process.pid}.json`);
  fs.writeFileSync(jobsFile, JSON.stringify(todo.map((x) => ({ voice: voiceFor(x.v.lang), lang: x.v.lang, text: x.v.text, out: path.join(ROOT, x.rel) }))));
  const r = spawnSync("python3", [path.join(TOOLS, "piper_synth.py"), jobsFile, PIPER_DIR, String(PIPER_LENGTH), ...(PIPER_VERIFY ? ["verify"] : [])], { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });
  fs.rmSync(jobsFile, { force: true });
  process.stdout.write(r.stdout.split("\n").filter((l) => !l.startsWith("{")).join("\n"));
  for (const x of todo) if (fs.existsSync(path.join(ROOT, x.rel))) { manifest[x.k] = x.rel; done++; } else failed++;
} else {
  const queue = todo.slice();
  const worker = async () => {
    for (let x; (x = queue.shift()); ) {
      try {
        const buf = await elevenlabs(x.v);
        fs.mkdirSync(path.dirname(path.join(ROOT, x.rel)), { recursive: true });
        fs.writeFileSync(path.join(ROOT, x.rel), buf);
        manifest[x.k] = x.rel; done++;
        if (done % 20 === 0) console.log(`  ${done}/${todo.length}`);
      } catch (e) {
        failed++;
        console.error(`  hata: "${x.v.text.slice(0, 50)}" → ${e.message}`);
        if (e.fatal) queue.length = 0;
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
}

const sorted = writeManifest();
if (PRUNE) prune(sorted);
console.log(`üretilen ${done} · hata ${failed} · manifest ${Object.keys(sorted).length} kayıt`);
process.exit(failed ? 1 : 0);
