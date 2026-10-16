// Dil derslerinde ve dinleme sorularında cümleleri seslendirir. Önce önceden üretilmiş dosya
// (ElevenLabs, public/audio/, tools/tts_build.mjs), yoksa tarayıcının konuşma sentezi.
// Dosya anahtarı: "<dil>|<metin>"; metin norm() ile sadeleştirilir, üretim betiği de aynısını kullanır.
window.VOICE = (() => {
  const norm = (s) => String(s ?? "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  const browserOk = "speechSynthesis" in window;
  let manifest = null;
  const load = () => (manifest ||= fetch("audio/manifest.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  let audio = null, gen = 0;

  function browser(lang, text) {
    if (!browserOk) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find((x) => x.lang.replace("_", "-").startsWith(lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function stop() {
    gen++;
    if (audio) audio.pause();
    if (browserOk) speechSynthesis.cancel();
  }
  async function say(lang, text) {
    const t = norm(text);
    if (!t) return;
    stop();
    const g = gen;
    const file = (await load())[`${lang}|${t}`];
    if (g !== gen) return;
    if (file) {
      audio ||= new Audio();
      audio.src = file;
      try { await audio.play(); return; } catch (_) { /* dosya çalınamadı: tarayıcı sesine düş */ }
    }
    browser(lang, t);
  }
  load();
  window.addEventListener("hashchange", stop);
  return { say, stop, norm, browserOk };
})();
