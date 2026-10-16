"""Piper ile toplu ses üretimi (tools/tts_build.mjs çağırır).
Girdi: iş listesi JSON dosyası [{"voice": "<model adı>", "lang": "de-DE", "text": "...", "out": "<mp3 yolu>"}, ...]
Her ses modeli bir kez yüklenir; cümle önce WAV'a, sonra ffmpeg ile mono MP3'e çevrilir.

Kalite kapısı (verify): faster-whisper kuruluysa her kayıt metne çevrilip asıl metinle karşılaştırılır; anlaşılmayan
kayıt en çok TRIES kez yeniden üretilir ve en iyisi tutulur. Piper her üretimde biraz farklı okur, yeniden denemek
kısa kelimelerde (özellikle Almanca artikellerde) netliği belirgin artırır. Sayı içeren metinler denetlenmez:
Whisper sayıyı rakamla yazar, karşılaştırma yanıltıcı olur.
Kullanım: python3 tools/piper_synth.py jobs.json <ses klasörü> <length_scale> [verify]"""
import json, os, re, subprocess, sys, tempfile, unicodedata, wave

from piper import PiperVoice, SynthesisConfig

jobs_path, voice_dir, length_scale = sys.argv[1], sys.argv[2], float(sys.argv[3])
VERIFY = len(sys.argv) > 4 and sys.argv[4] == "verify"
TRIES = 4
jobs = json.load(open(jobs_path, encoding="utf-8"))
# Düşük gürültü: daha tutarlı ve net telaffuz (model varsayılanı 0.667 / 0.8).
cfg = SynthesisConfig(length_scale=length_scale, noise_scale=0.333, noise_w_scale=0.5)

asr = None
if VERIFY:
    try:
        from faster_whisper import WhisperModel
        asr = WhisperModel("small", device="cpu", compute_type="int8")
    except Exception as e:  # Whisper yoksa denetimsiz üret
        print(f"  uyarı: faster-whisper yüklenemedi ({e}); kayıtlar denetlenmeden üretilecek", file=sys.stderr)

NUMBER_WORDS = re.compile(r"\d|\b(null|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|\w+zehn|\w+zig|dreißig|hundert|"
                          r"zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\w+teen|\w+ty|hundred|half|quarter)\b", re.I)
def words(s):
    s = unicodedata.normalize("NFC", s.lower()).replace("ß", "ss")
    s = re.sub(r"[’']", "", s)
    return re.sub(r"[^\w\s]", " ", s).split()
def wer(ref, hyp):
    r, h = words(ref), words(hyp)
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1])); prev, d[j] = d[j], cur
    return d[len(h)] / max(1, len(r))
def good_enough(text, err):
    return err == 0 if len(text.split()) <= 3 else err <= 0.15

voices, done, failed, stats, unresolved = {}, 0, 0, {"ilk": 0, "tekrar": 0, "denetimsiz": 0, "çözülemeyen": 0}, []
with tempfile.TemporaryDirectory() as tmp:
    wav = os.path.join(tmp, "s.wav")
    def render(v, text, out):
        with wave.open(wav, "wb") as wf:
            v.synthesize_wav(text, wf, syn_config=cfg)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-b:a", "48k", out], check=True)
    for j in jobs:
        try:
            v = voices.get(j["voice"])
            if v is None:
                v = voices[j["voice"]] = PiperVoice.load(os.path.join(voice_dir, j["voice"] + ".onnx"))
            os.makedirs(os.path.dirname(j["out"]), exist_ok=True)
            text = j["text"]
            if not asr or NUMBER_WORDS.search(text):
                render(v, text, j["out"]); stats["denetimsiz"] += 1
            else:
                best, best_err = os.path.join(tmp, "best.mp3"), None
                for attempt in range(TRIES):
                    cand = os.path.join(tmp, "cand.mp3")
                    render(v, text, cand)
                    hyp = " ".join(s.text for s in asr.transcribe(cand, language=j["lang"][:2], beam_size=5)[0])
                    err = wer(text, hyp)
                    if best_err is None or err < best_err:
                        best_err = err; os.replace(cand, best)
                    if good_enough(text, err):
                        break
                os.replace(best, j["out"])
                if good_enough(text, best_err):
                    stats["ilk" if attempt == 0 else "tekrar"] += 1
                else:
                    stats["çözülemeyen"] += 1; unresolved.append(text)
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(jobs)}", flush=True)
        except Exception as e:  # bir cümlenin hatası diğerlerini durdurmaz
            failed += 1
            print(f"  hata: {j['text'][:50]!r} → {e}", file=sys.stderr, flush=True)
if asr:
    print(f"  denetim: ilk denemede {stats['ilk']}, yeniden deneyerek {stats['tekrar']}, denetimsiz (sayı) {stats['denetimsiz']}, çözülemeyen {stats['çözülemeyen']}", flush=True)
    for t in unresolved[:30]:
        print(f"    anlaşılmayan: {t!r}", flush=True)
print(json.dumps({"done": done, "failed": failed}), flush=True)
sys.exit(1 if failed else 0)
