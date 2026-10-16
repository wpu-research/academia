// Konuşma ve yazma pratiği (öğrenme alanındaki "Konuşma" ve "Yazma" sekmeleri). İçerik: data-practice.js.
// Konuşma, tarayıcının konuşma tanımasıyla metne çevrilir ve kurallarla (düzenli ifade) kontrol edilir;
// tanıma yoksa öğrenci örneği dinleyip kendini değerlendirir. Sonuçlar hooks.onResult ile çalışma motoruna gider.
window.PRACTICE = (() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SR_OK_KEY = "academia:sr-ok";

  // ---------- Metin karşılaştırma ----------
  // Küçük harf, ß → ss, noktalama yok; sayı kelimeleri rakama çevrilir (tanıma çoğu zaman rakam yazar).
  const UNITS = { null: 0, eins: 1, zwei: 2, zwo: 2, drei: 3, vier: 4, "fünf": 5, sechs: 6, sieben: 7, acht: 8, neun: 9 };
  const TEENS = { zehn: 10, elf: 11, "zwölf": 12, dreizehn: 13, vierzehn: 14, "fünfzehn": 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19 };
  const TENS = { zwanzig: 20, dreissig: 30, vierzig: 40, "fünfzig": 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90, hundert: 100, einhundert: 100 };
  const UNIT_RE = "ein|zwei|drei|vier|fünf|sechs|sieben|acht|neun";
  const TENS_RE = "zwanzig|dreissig|vierzig|fünfzig|sechzig|siebzig|achtzig|neunzig";
  function numWord(w) {
    if (w in UNITS) return UNITS[w];
    if (w in TEENS) return TEENS[w];
    if (w in TENS) return TENS[w];
    const m = w.match(new RegExp(`^(${UNIT_RE})und(${TENS_RE})$`));
    if (m) return (m[1] === "ein" ? 1 : UNITS[m[1]]) + TENS[m[2]];
    return null;
  }
  function norm(s) {
    const words = String(s ?? "").toLowerCase().replace(/ß/g, "ss").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
    return words.map((w) => { const n = numWord(w); return n === null ? w : String(n); }).join(" ");
  }
  const flat = (w) => w.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 2;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const same = (a, b) => a === b || flat(a) === flat(b) || (a.length >= 5 && lev(flat(a), flat(b)) <= 1);
  // Tekrar görevi: hedef cümlenin her kelimesi söylenende var mı?
  function compare(target, said) {
    const heard = norm(said).split(" ").filter(Boolean), used = new Set();
    const words = norm(target).split(" ").filter(Boolean).map((w) => {
      const i = heard.findIndex((h, k) => !used.has(k) && same(w, h));
      if (i >= 0) { used.add(i); return { w, ok: true }; }
      // Tanıma birleşik kelimeyi bölebilir: "geradeaus" → "gerade aus".
      const j = heard.findIndex((h, k) => k + 1 < heard.length && !used.has(k) && !used.has(k + 1) && same(w, h + heard[k + 1]));
      if (j >= 0) { used.add(j); used.add(j + 1); return { w, ok: true }; }
      return { w, ok: false };
    });
    return { words, score: words.length ? words.filter((x) => x.ok).length / words.length : 0 };
  }
  // Kural görevi: her kural bir düzenli ifade (norm() edilmiş metne uygulanır) ve bir Türkçe ipucu.
  const checkRules = (rules, text) => { const t = norm(text); return rules.map((r) => ({ ...r, ok: new RegExp(r.re, "u").test(t) })); };

  // ---------- Durum ----------
  let root = null, hooks = {}, P = null, kind = "konusma", st = { set: null, i: 0 }, rec = null, listening = false;
  const tasks = () => (P.konusma.find((s) => s.id === st.set) || {}).gorevler || [];

  function mount(el, practice, k, h) {
    root = el; P = practice; kind = k; hooks = h || {};
    if (st.kind !== k) st = { kind: k, set: null, i: 0, res: null, heard: "", text: {} };
    draw();
  }
  function stopRec() { if (rec) { try { rec.abort(); } catch (_) {} rec = null; } listening = false; }

  // ---------- Konuşma ----------
  function setList() {
    const done = hooks.done || (() => false);
    return `<div class="pr-intro"><h2>Konuşma pratiği</h2>
      <p class="muted">Görevi oku ya da dinle, sonra 🎤 düğmesine basıp Almanca söyle. Söylediğin metne çevrilir ve kontrol edilir.</p>
      ${SR ? `<p class="note">Konuşma tanıma tarayıcının hizmetiyle yapılır; Chrome'da sesin metne çevrilmek için Google'a gönderilir. Biz ses kaydı saklamayız.</p>`
        : `<p class="note">Bu tarayıcı konuşma tanımayı desteklemiyor (Chrome ya da Edge'de çalışır). Yine de görevleri yapabilirsin: cümleyi sesli söyle, örnek cevabı dinle ve kendini değerlendir.</p>`}</div>
      <div class="pr-sets">${P.konusma.map((s) => {
        const n = s.gorevler.filter((g) => done(g.id)).length;
        return `<button type="button" class="pr-set" data-pr="set" data-id="${esc(s.id)}"><b>${esc(s.baslik)}</b><span>${esc(s.aciklama)}</span><small class="num">${n} / ${s.gorevler.length} tamamlandı</small></button>`;
      }).join("")}</div>`;
  }
  function sayBtn(say, label = "▶ Dinle") { return `<button type="button" class="btn btn-outline btn-small" data-pr="say" data-lang="${esc(say.lang)}" data-text="${esc(say.text)}">${label}</button>`; }

  function taskView() {
    const list = tasks(), g = list[st.i], set = P.konusma.find((s) => s.id === st.set);
    if (!g) return `<div class="pr-done"><h3>${esc(set.baslik)} bitti</h3><p>Bu setteki ${list.length} görevi tamamladın. Zorlandıklarını tekrar et ya da başka bir sete geç.</p>
      <div class="q-actions"><button class="btn btn-primary" data-pr="restart">Seti baştan al</button><button class="btn btn-outline" data-pr="sets">Setlere dön</button></div></div>`;
    const r = st.res;
    let result = "";
    if (r && r.mode === "tekrar") {
      result = `<div class="explain ${r.ok ? "ok" : "no"}"><strong>${r.ok ? "Çok iyi" : "Biraz daha"} · %${Math.round(r.score * 100)}</strong>
        <p class="pr-words">${r.words.map((w) => `<span class="${w.ok ? "hit" : "miss"}">${esc(w.w)}</span>`).join(" ")}</p>
        <span>${r.ok ? "Kelimelerin hepsine yakını anlaşıldı." : "Kırmızı kelimeler anlaşılmadı. Örneği dinleyip yavaşça tekrar et."}</span></div>`;
    } else if (r && r.mode === "kural") {
      result = `<div class="explain ${r.ok ? "ok" : "no"}"><strong>${r.ok ? "Görev tamam" : "Eksik var"}</strong>
        <ul class="pr-checks">${r.rules.map((x) => `<li class="${x.ok ? "hit" : "miss"}">${x.ok ? "✓" : "✗"} ${esc(x.ipucu)}</li>`).join("")}</ul></div>`;
    } else if (r && r.mode === "oz") {
      result = `<div class="explain ${r.ok ? "ok" : "no"}"><strong>${r.ok ? "Kaydedildi: söyleyebildim" : "Kaydedildi: zorlandım"}</strong><span>Örneği bir kez daha dinleyip sesli tekrar et.</span></div>`;
    }
    const mic = SR
      ? `<button type="button" class="pr-mic ${listening ? "on" : ""}" data-pr="mic" aria-pressed="${listening}">${listening ? "■ Dinliyorum… bitirmek için bas" : "🎤 Konuş"}</button>`
      : `<div class="q-actions"><button class="btn btn-outline" data-pr="self" data-ok="1">Söyleyebildim</button><button class="btn btn-outline" data-pr="self" data-ok="0">Zorlandım</button></div>`;
    return `<div class="pr-task">
      <div class="q-top"><div class="chips"><span class="chip chip-line">${esc(set.baslik)}</span></div><span class="muted num">Görev ${st.i + 1} / ${list.length}</span></div>
      <div class="progress" aria-hidden="true"><i style="width:${(st.i / list.length) * 100}%"></i></div>
      ${g.kart ? `<div class="pr-card"><small>Kart</small><b lang="de">${esc(g.kart)}</b>${g.kelime ? `<span lang="de">${esc(g.kelime)}</span>` : ""}</div>` : ""}
      <p class="pr-q">${esc(g.gorev)}</p>
      ${g.soru ? `<div class="pr-prompt"><span lang="de">${esc(g.soru.text)}</span>${sayBtn(g.soru)}</div>` : ""}
      ${g.tekrar ? `<div class="pr-prompt"><span lang="de" class="pr-big">${esc(g.tekrar)}</span>${sayBtn({ lang: "de-DE", text: g.tekrar })}${g.tr ? `<small>${esc(g.tr)}</small>` : ""}</div>` : ""}
      ${mic}
      ${st.heard ? `<p class="pr-heard"><small>Anlaşılan:</small> <span lang="de">${esc(st.heard)}</span></p>` : ""}
      ${result}
      ${g.ornek && (r || !SR) ? `<div class="pr-example"><small>Örnek cevap</small><span lang="de">${esc(g.ornek)}</span>${sayBtn({ lang: "de-DE", text: g.ornek })}</div>` : ""}
      <div class="q-actions">${r ? `<button class="btn btn-primary" data-pr="next">${st.i + 1 >= list.length ? "Seti bitir" : "Sonraki görev"}</button><button class="btn btn-outline" data-pr="again">Tekrar dene</button>` : ""}<button class="btn btn-outline" data-pr="sets">Setlere dön</button></div>
    </div>`;
  }

  function grade(g, said) {
    if (g.tekrar) { const c = compare(g.tekrar, said); return { mode: "tekrar", ...c, ok: c.score >= 0.85 }; }
    const rules = checkRules(g.kurallar, said);
    return { mode: "kural", rules, ok: rules.every((x) => x.ok) };
  }
  function finish(g, res) {
    st.res = res;
    hooks.onResult?.("Sprechen", `konus:${g.id}`, res.ok);
    draw();
  }
  function listen() {
    const g = tasks()[st.i];
    if (listening) { try { rec.stop(); } catch (_) {} return; }
    let ok = true; try { ok = localStorage.getItem(SR_OK_KEY) === "1"; } catch (_) {}
    if (!ok) {
      if (!confirm("Konuşman metne çevrilmek için tarayıcının konuşma tanıma hizmetine gönderilecek (Chrome'da Google). Biz ses kaydı saklamayız. Devam edilsin mi?")) return;
      try { localStorage.setItem(SR_OK_KEY, "1"); } catch (_) {}
    }
    window.VOICE?.stop();
    rec = new SR();
    rec.lang = "de-DE"; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = false;
    let finals = [], interim = "";
    rec.onresult = (e) => {
      interim = "";
      for (let k = e.resultIndex; k < e.results.length; k++) {
        const r = e.results[k];
        if (r.isFinal) finals.push([...r].map((a) => a.transcript)); else interim += r[0].transcript;
      }
      st.heard = (finals.map((f) => f[0]).join(" ") + " " + interim).trim();
      const el = root.querySelector(".pr-heard span"); if (el) el.textContent = st.heard; else draw();
    };
    rec.onerror = (e) => {
      listening = false; rec = null;
      st.heard = e.error === "not-allowed" ? "Mikrofon izni verilmedi. Tarayıcı ayarlarından izin verip tekrar dene."
        : e.error === "no-speech" ? "Ses duyulmadı. Mikrofona yakın konuşup tekrar dene." : "Konuşma tanınamadı. Tekrar dene.";
      draw();
    };
    rec.onend = () => {
      if (!listening) return;
      listening = false; rec = null;
      if (!finals.length && interim) finals.push([interim]);
      if (!finals.length) { draw(); return; }
      // Her alternatif ayrı denenir; en iyi sonuç sayılır.
      const cands = finals[0].map((_, a) => finals.map((f) => f[a] ?? f[0]).join(" "));
      let best = null;
      for (const c of cands) { const r = grade(g, c); const s = r.mode === "tekrar" ? r.score : r.rules.filter((x) => x.ok).length; if (!best || s > best.s) best = { r, s, c }; }
      st.heard = best.c;
      finish(g, best.r);
    };
    listening = true; st.res = null; st.heard = "";
    draw();
    try { rec.start(); } catch (_) { listening = false; rec = null; draw(); }
  }

  // ---------- Yazma ----------
  const words = (t) => (String(t).match(/[\p{L}\p{N}]+/gu) || []).length;
  function writeList() {
    const done = hooks.done || (() => false);
    return `<div class="pr-intro"><h2>Yazma pratiği</h2>
      <p class="muted">Sınavın yazma bölümündeki iki görev: form doldurma ve yaklaşık 30 kelimelik kısa mesaj. Otomatik kontrol yalnız ipucu verir; örnek mesajla karşılaştır ya da Mac'e kontrol ettir.</p></div>
      <div class="pr-sets">${P.yazma.map((w) => `<button type="button" class="pr-set" data-pr="wopen" data-id="${esc(w.id)}"><b>${esc(w.baslik)}</b><span>${esc(w.tur === "form" ? "Form doldurma" : w.resmi ? "Resmî mesaj" : "Samimi mesaj")}</span><small>${done(w.id) ? "✓ Tamamlandı" : "Başla →"}</small></button>`).join("")}</div>`;
  }
  function writeView(w) {
    const v = st.text[w.id] || {}, r = st.res;
    if (w.tur === "form") {
      return `<div class="pr-task"><div class="q-top"><div class="chips"><span class="chip chip-line">Form doldurma</span></div></div>
        <h3>${esc(w.baslik)}</h3><p class="pr-q">${esc(w.gorev)}</p>
        <blockquote class="pr-text" lang="de">${esc(w.metin)}</blockquote>
        <form class="pr-form" data-pr-form="${esc(w.id)}">${w.alanlar.map((a, i) => {
          const res = r?.fields?.[i];
          return `<label><span lang="de">${esc(a.etiket)}</span><input name="f${i}" value="${esc(v["f" + i] || "")}" autocomplete="off" class="${res ? (res.ok ? "hit" : "miss") : ""}">${res && !res.ok ? `<small>Doğrusu: <b lang="de">${esc(a.cevap[0])}</b>${a.ipucu ? ` · ${esc(a.ipucu)}` : ""}</small>` : ""}</label>`;
        }).join("")}
        <div class="q-actions"><button class="btn btn-primary">Kontrol et</button><button type="button" class="btn btn-outline" data-pr="wlist">Görevlere dön</button></div></form>
        ${r ? `<div class="explain ${r.ok ? "ok" : "no"}"><strong>${r.fields.filter((f) => f.ok).length} / ${r.fields.length} alan doğru</strong></div>` : ""}</div>`;
    }
    const n = words(v.msg || "");
    return `<div class="pr-task"><div class="q-top"><div class="chips"><span class="chip chip-line">${w.resmi ? "Resmî mesaj" : "Samimi mesaj"}</span></div></div>
      <h3>${esc(w.baslik)}</h3><p class="pr-q">${esc(w.gorev)}</p>
      <ol class="pr-points">${w.noktalar.map((p) => `<li>${esc(p.metin)}</li>`).join("")}</ol>
      <form class="pr-form" data-pr-form="${esc(w.id)}">
        <textarea name="msg" rows="7" maxlength="420" lang="de" spellcheck="false" placeholder="Mesajını Almanca yaz…">${esc(v.msg || "")}</textarea>
        <p class="muted num pr-count">${n} kelime · hedef yaklaşık 30</p>
        <div class="q-actions"><button class="btn btn-primary">Kontrol et</button><button type="button" class="btn btn-outline" data-pr="mac">Mac'e kontrol ettir</button><button type="button" class="btn btn-outline" data-pr="wlist">Görevlere dön</button></div>
      </form>
      ${r ? `<div class="explain ${r.ok ? "ok" : "no"}"><strong>${r.ok ? "Temel kontroller tamam" : "Gözden geçir"}</strong>
        <ul class="pr-checks">${r.checks.map((c) => `<li class="${c.ok ? "hit" : "miss"}">${c.ok ? "✓" : "✗"} ${esc(c.t)}</li>`).join("")}</ul>
        <span>Otomatik kontrol dilbilgisini değerlendirmez. Örnek mesajla karşılaştır.</span></div>
        <details class="pr-example"><summary>Örnek mesajı göster</summary><p lang="de" class="pr-sample">${esc(w.ornek)}</p></details>` : ""}
    </div>`;
  }
  function checkMessage(w, msg) {
    const t = norm(msg), n = words(msg);
    const open = w.resmi ? /^\s*sehr geehrte[r]? (frau|herr|damen)/ : /^\s*(liebe[r]?|hallo|hi) /;
    const close = w.resmi ? /mit freundlichen grüssen/ : /(viele|liebe|herzliche) grüsse|bis bald|tschüss|dein[e]? \p{L}+\s*$/u;
    const checks = [
      { t: `Uzunluk: ${n} kelime (yaklaşık 20–45 arası iyi)`, ok: n >= 20 && n <= 45 },
      { t: w.resmi ? "Resmî açılış (Sehr geehrte Frau … / Sehr geehrter Herr … / Sehr geehrte Damen und Herren)" : "Samimi açılış (Liebe … / Lieber … / Hallo …)", ok: open.test(t) },
      { t: w.resmi ? "Resmî kapanış (Mit freundlichen Grüßen)" : "Samimi kapanış (Viele Grüße / Liebe Grüße)", ok: close.test(t) },
      ...w.noktalar.map((p, i) => ({ t: `${i + 1}. nokta: ${p.metin}`, ok: new RegExp(p.re, "u").test(t) })),
    ];
    return { checks, ok: checks.every((c) => c.ok) };
  }

  // ---------- Çizim ve olaylar ----------
  function draw() {
    if (!root) return;
    if (kind === "konusma") root.innerHTML = st.set ? taskView() : setList();
    else { const w = P.yazma.find((x) => x.id === st.set); root.innerHTML = w ? writeView(w) : writeList(); }
  }
  function onClick(e) {
    const el = e.target.closest("[data-pr]"); if (!el || !root?.contains(el)) return;
    const a = el.dataset.pr;
    if (a === "say") { window.VOICE?.say(el.dataset.lang, el.dataset.text); return; }
    if (a === "set" || a === "wopen") { stopRec(); st.set = el.dataset.id; st.i = 0; st.res = null; st.heard = ""; draw(); root.scrollIntoView({ block: "start" }); return; }
    if (a === "sets" || a === "wlist") { stopRec(); st.set = null; st.res = null; st.heard = ""; draw(); return; }
    if (a === "restart") { st.i = 0; st.res = null; st.heard = ""; draw(); return; }
    if (a === "next") { stopRec(); st.i++; st.res = null; st.heard = ""; draw(); return; }
    if (a === "again") { stopRec(); st.res = null; st.heard = ""; draw(); return; }
    if (a === "mic") { listen(); return; }
    if (a === "self") { const g = tasks()[st.i]; finish(g, { mode: "oz", ok: el.dataset.ok === "1" }); return; }
    if (a === "mac") {
      const w = P.yazma.find((x) => x.id === st.set), msg = root.querySelector("textarea")?.value.trim();
      if (!msg) return;
      // Mac'e giden mesaj 600 karakterle sınırlı: öğrencinin metni sona konur, görev metni gerekirse kısaltılır.
      const tail = `\nMesajım:\n${msg}`;
      const head = `A1 Almanca kısa mesajımı kontrol et; hataları Türkçe açıkla ve düzeltilmiş hâlini yaz. Görev: ${w.gorev} Noktalar: ${w.noktalar.map((p) => p.metin).join(" ")}`;
      window.MAC?.ask?.(head.slice(0, Math.max(0, 600 - tail.length)) + tail);
    }
  }
  function onSubmit(e) {
    const f = e.target.closest("[data-pr-form]"); if (!f || !root?.contains(f)) return;
    e.preventDefault();
    const w = P.yazma.find((x) => x.id === f.dataset.prForm), data = Object.fromEntries(new FormData(f));
    st.text[w.id] = data;
    if (w.tur === "form") {
      const fields = w.alanlar.map((a, i) => ({ ok: a.cevap.some((c) => norm(c) === norm(data["f" + i] || "")) }));
      st.res = { fields, ok: fields.every((x) => x.ok) };
    } else st.res = checkMessage(w, data.msg || "");
    hooks.onResult?.("Schreiben", `yaz:${w.id}`, st.res.ok);
    draw();
  }
  function onInput(e) {
    if (e.target.name !== "msg" || !root?.contains(e.target)) return;
    const c = root.querySelector(".pr-count"); if (c) c.textContent = `${words(e.target.value)} kelime · hedef yaklaşık 30`;
    const w = P.yazma.find((x) => x.id === st.set); if (w) st.text[w.id] = { msg: e.target.value };
  }
  document.addEventListener("click", onClick);
  document.addEventListener("submit", onSubmit);
  document.addEventListener("input", onInput);
  window.addEventListener("hashchange", stopRec);

  const context = () => {
    if (!root || !P || !st.set) return null;
    if (kind === "konusma") { const g = tasks()[st.i]; return g ? { page: "Konuşma pratiği", context: `Almanca A1 konuşma görevi: ${g.gorev} ${g.soru?.text || g.tekrar || g.kart || ""}` } : null; }
    const w = P.yazma.find((x) => x.id === st.set);
    return w ? { page: "Yazma pratiği", context: `Almanca A1 yazma görevi: ${w.gorev} ${w.noktalar ? w.noktalar.map((p) => p.metin).join("; ") : ""}` } : null;
  };
  return { mount, stop: stopRec, norm, compare, checkRules, context, supported: !!SR };
})();
