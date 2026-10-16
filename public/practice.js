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
  // İngilizce: "twenty one" iki kelime gelir (tire noktalama olarak silinir); onluk + birlik birleştirilir.
  const EN_UNITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const EN_TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };
  function enNumbers(words) {
    const out = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i], u = EN_UNITS.indexOf(w);
      if (w in EN_TENS) {
        const nu = EN_UNITS.indexOf(words[i + 1] || "");
        if (EN_TENS[w] < 100 && nu > 0 && nu < 10) { out.push(String(EN_TENS[w] + nu)); i++; } else out.push(String(EN_TENS[w]));
      } else out.push(u >= 0 ? String(u) : w);
    }
    return out;
  }
  // İngilizce kısaltmalar açılır: tanıma "I'm" yazar, kural "i am" bekler.
  const enExpand = (s) => s.replace(/[’']/g, "'").replace(/\bcan't\b/g, "can not").replace(/\bwon't\b/g, "will not").replace(/n't\b/g, " not")
    .replace(/'m\b/g, " am").replace(/'re\b/g, " are").replace(/'ve\b/g, " have").replace(/'ll\b/g, " will").replace(/'d\b/g, " would").replace(/'s\b/g, " is");
  function norm(s, lang = LANG) {
    if (lang.startsWith("en")) s = enExpand(String(s ?? "").toLowerCase());
    const words = String(s ?? "").toLowerCase().replace(/ß/g, "ss").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
    if (lang.startsWith("en")) return enNumbers(words).join(" ");
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
  let root = null, hooks = {}, P = null, LANG = "de-DE", kind = "konusma", st = { set: null, i: 0 }, rec = null, listening = false;
  const tasks = () => (P.konusma.find((s) => s.id === st.set) || {}).gorevler || [];

  function mount(el, practice, k, h) {
    root = el; P = practice; LANG = practice.lang || "de-DE"; kind = k; hooks = h || {};
    if (st.kind !== k) st = { kind: k, set: null, i: 0, res: null, heard: "", text: {}, mode: null };
    draw();
  }
  function stopRec() { if (rec) { try { rec.abort(); } catch (_) {} rec = null; } listening = false; }

  // ---------- Konuşma ----------
  function setList() {
    const done = hooks.done || (() => false);
    return `<div class="pr-intro"><h2>Konuşma pratiği</h2>
      <p class="muted">Görevi oku ya da dinle, sonra 🎤 düğmesine basıp ${esc(P.dil || "Almanca")} söyle. Söylediğin metne çevrilir ve kontrol edilir.</p>
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
      ${g.kart ? `<div class="pr-card"><small>Kart</small><b lang="${LANG.slice(0, 2)}">${esc(g.kart)}</b>${g.kelime ? `<span lang="${LANG.slice(0, 2)}">${esc(g.kelime)}</span>` : ""}</div>` : ""}
      <p class="pr-q">${esc(g.gorev)}</p>
      ${g.soru ? `<div class="pr-prompt"><span lang="${LANG.slice(0, 2)}">${esc(g.soru.text)}</span>${sayBtn(g.soru)}</div>` : ""}
      ${g.tekrar ? `<div class="pr-prompt"><span lang="${LANG.slice(0, 2)}" class="pr-big">${esc(g.tekrar)}</span>${sayBtn({ lang: LANG, text: g.tekrar })}${g.tr ? `<small>${esc(g.tr)}</small>` : ""}</div>` : ""}
      ${mic}
      ${st.heard ? `<p class="pr-heard"><small>Anlaşılan:</small> <span lang="${LANG.slice(0, 2)}">${esc(st.heard)}</span></p>` : ""}
      ${result}
      ${g.ornek && (r || !SR) ? `<div class="pr-example"><small>Örnek cevap</small><span lang="${LANG.slice(0, 2)}">${esc(g.ornek)}</span>${sayBtn({ lang: LANG, text: g.ornek })}</div>` : ""}
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
    // Sonucun yazıldığı alan: setin alanı, yoksa içeriğin konuşma alanı (Almanca: Sprechen).
    const set = P.konusma.find((s) => s.id === st.set);
    hooks.onResult?.(set?.alan || P.alanlar?.konusma || "Sprechen", `konus:${g.id}`, res.ok);
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
    rec.lang = LANG; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = false;
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
        <blockquote class="pr-text" lang="${LANG.slice(0, 2)}">${esc(w.metin)}</blockquote>
        <form class="pr-form" data-pr-form="${esc(w.id)}">${w.alanlar.map((a, i) => {
          const res = r?.fields?.[i];
          return `<label><span lang="${LANG.slice(0, 2)}">${esc(a.etiket)}</span><input name="f${i}" value="${esc(v["f" + i] || "")}" autocomplete="off" class="${res ? (res.ok ? "hit" : "miss") : ""}">${res && !res.ok ? `<small>Doğrusu: <b lang="${LANG.slice(0, 2)}">${esc(a.cevap[0])}</b>${a.ipucu ? ` · ${esc(a.ipucu)}` : ""}</small>` : ""}</label>`;
        }).join("")}
        <div class="q-actions"><button class="btn btn-primary">Kontrol et</button><button type="button" class="btn btn-outline" data-pr="wlist">Görevlere dön</button></div></form>
        ${r ? `<div class="explain ${r.ok ? "ok" : "no"}"><strong>${r.fields.filter((f) => f.ok).length} / ${r.fields.length} alan doğru</strong></div>` : ""}</div>`;
    }
    const n = words(v.msg || "");
    return `<div class="pr-task"><div class="q-top"><div class="chips"><span class="chip chip-line">${w.resmi ? "Resmî mesaj" : "Samimi mesaj"}</span></div></div>
      <h3>${esc(w.baslik)}</h3><p class="pr-q">${esc(w.gorev)}</p>
      <ol class="pr-points">${w.noktalar.map((p) => `<li>${esc(p.metin)}</li>`).join("")}</ol>
      <form class="pr-form" data-pr-form="${esc(w.id)}">
        <textarea name="msg" rows="7" maxlength="420" lang="${LANG.slice(0, 2)}" spellcheck="false" placeholder="Mesajını ${esc(P.dil || "Almanca")} yaz…">${esc(v.msg || "")}</textarea>
        <p class="muted num pr-count">${n} kelime · hedef yaklaşık 30</p>
        <div class="q-actions"><button class="btn btn-primary">Kontrol et</button><button type="button" class="btn btn-outline" data-pr="mac">Mac'e kontrol ettir</button><button type="button" class="btn btn-outline" data-pr="wlist">Görevlere dön</button></div>
      </form>
      ${r ? `<div class="explain ${r.ok ? "ok" : "no"}"><strong>${r.ok ? "Temel kontroller tamam" : "Gözden geçir"}</strong>
        <ul class="pr-checks">${r.checks.map((c) => `<li class="${c.ok ? "hit" : "miss"}">${c.ok ? "✓" : "✗"} ${esc(c.t)}</li>`).join("")}</ul>
        <span>Otomatik kontrol dilbilgisini değerlendirmez. Örnek mesajla karşılaştır.</span></div>
        <details class="pr-example"><summary>Örnek mesajı göster</summary><p lang="${LANG.slice(0, 2)}" class="pr-sample">${esc(w.ornek)}</p></details>` : ""}
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


  // ---------- Kelime (aralıklı tekrar) ----------
  // Leitner kutuları: bilinen kelime bir üst kutuya geçer ve kutunun aralığı kadar gün sonra tekrar gelir;
  // bilinmeyen 0. kutuya döner ve aynı oturumda yeniden sorulur. Günde en çok NEW_PER_DAY yeni kelime.
  const DAY_MS = 86400000, INTERVAL = [0, 1, 3, 7, 14, 30], NEW_PER_DAY = 10, LEARNED_BOX = 2;
  const ART = ["der", "die", "das"];
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const allWords = () => P.kelime.flatMap((t) => t.kelimeler.map(([de, tr, pl]) => ({ id: norm(de), de, tr, pl: pl === "pl", tema: t.id })));
  const vs = () => { const s = hooks.vocab(); s.cards ||= {}; if (s.day !== today()) { s.day = today(); s.yeni = 0; } return s; };
  const nounOf = (w) => { const [a, ...rest] = w.de.split(" "); return !w.pl && ART.includes(a) && rest.length ? { art: a, noun: rest.join(" ") } : null; };
  function artHint(w) {
    const n = nounOf(w); if (!n) return "";
    if (/(ung|heit|keit|ion)$/.test(n.noun)) return "-ung, -heit, -keit, -ion ile biten isimler die alır.";
    if (/chen$/.test(n.noun)) return "-chen ile biten isimler das alır.";
    if (w.tema === "zaman" || w.tema === "aylar") return "Günler, aylar ve mevsimler der alır.";
    return "";
  }

  function vocabHome() {
    const s = vs(), words = allWords(), now = Date.now();
    const due = words.filter((w) => s.cards[w.id] && s.cards[w.id].d <= now).length;
    const fresh = Math.max(0, NEW_PER_DAY - s.yeni);
    const learned = words.filter((w) => (s.cards[w.id]?.b || 0) >= LEARNED_BOX).length;
    return `<div class="pr-intro"><h2>Kelime</h2>
      <p class="muted">A1 sınavında sık geçen ${words.length} kelime ve kalıp, ${P.kelime.length} temada. Kartlar aralıklı tekrarla gelir: bildiğin kelime 1, 3, 7, 14 ve 30 gün sonra yeniden sorulur.</p></div>
      <div class="pr-vstats"><div><b class="num">${due}</b><span>bugün tekrar</span></div><div><b class="num">${fresh}</b><span>yeni kelime hakkı</span></div><div><b class="num">${learned}</b><span>öğrenilen</span></div></div>
      <div class="q-actions"><button class="btn btn-primary" data-pr="vstart" data-tema="">Bugünün kartlarına başla</button><button class="btn btn-outline" data-pr="art">Artikel alıştırması (der, die, das)</button></div>
      <h3 class="pr-h">Temalar</h3>
      <div class="pr-sets">${P.kelime.map((t) => {
        const ws = words.filter((w) => w.tema === t.id), k = ws.filter((w) => (s.cards[w.id]?.b || 0) >= LEARNED_BOX).length;
        return `<button type="button" class="pr-set" data-pr="vstart" data-tema="${esc(t.id)}"><b>${esc(t.tema)}</b><span class="pr-bar"><i style="width:${(k / ws.length) * 100}%"></i></span><small class="num">${k} / ${ws.length} öğrenildi</small></button>`;
      }).join("")}</div>`;
  }
  function vocabStart(tema) {
    const s = vs(), now = Date.now(), words = allWords();
    const due = words.filter((w) => s.cards[w.id] && s.cards[w.id].d <= now && (!tema || w.tema === tema)).sort((a, b) => s.cards[a.id].d - s.cards[b.id].d);
    const fresh = words.filter((w) => !s.cards[w.id] && (!tema || w.tema === tema)).slice(0, Math.max(0, NEW_PER_DAY - s.yeni));
    st.v = { queue: [...due, ...fresh.map((w) => ({ ...w, yeni: true }))], i: 0, show: false, ok: 0, miss: 0, tema };
  }
  function vocabCard() {
    const v = st.v, w = v.queue[v.i];
    if (!w) return `<div class="pr-done"><h3>${v.queue.length ? "Bugünlük bu kadar" : "Şu an tekrar edilecek kart yok"}</h3>
      <p>${v.queue.length ? `${v.ok} kartı bildin, ${v.miss} kart tekrar edilecek.` : "Yeni kelime hakkın da doldu ya da bu temadaki kelimelerin hepsi sırada değil. Yarın tekrar gel ya da artikel alıştırması yap."}</p>
      <div class="q-actions"><button class="btn btn-primary" data-pr="vhome">Kelime sayfasına dön</button><button class="btn btn-outline" data-pr="art">Artikel alıştırması</button></div></div>`;
    return `<div class="pr-task pr-flash">
      <div class="q-top"><div class="chips"><span class="chip chip-line">${esc(P.kelime.find((t) => t.id === w.tema).tema)}</span>${w.yeni ? `<span class="chip chip-brand">Yeni</span>` : ""}</div><span class="muted num">${v.i + 1} / ${v.queue.length}</span></div>
      <div class="progress" aria-hidden="true"><i style="width:${(v.i / v.queue.length) * 100}%"></i></div>
      <div class="pr-word"><span lang="${LANG.slice(0, 2)}">${esc(w.de)}</span>${sayBtn({ lang: LANG, text: w.de })}</div>
      ${v.show ? `<p class="pr-mean">${esc(w.tr)}${w.pl ? " <small>(çoğul)</small>" : ""}</p>
        <div class="q-actions"><button class="btn btn-primary" data-pr="vknow" data-ok="1">Bildim</button><button class="btn btn-outline" data-pr="vknow" data-ok="0">Bilemedim</button></div>`
        : `<div class="q-actions"><button class="btn btn-primary" data-pr="vshow">Anlamını göster</button><button class="btn btn-outline" data-pr="vhome">Bitir</button></div>`}
    </div>`;
  }
  function vocabAnswer(ok) {
    const s = vs(), v = st.v, w = v.queue[v.i], c = s.cards[w.id] || { b: 0, d: 0 };
    if (!s.cards[w.id]) s.yeni++;
    if (ok) { c.b = Math.min(c.b + 1, INTERVAL.length - 1); c.d = today() + INTERVAL[c.b] * DAY_MS; v.ok++; }
    else { c.b = 0; c.d = Date.now(); v.miss++; if (!w.tekrar) v.queue.push({ ...w, yeni: false, tekrar: true }); }
    s.cards[w.id] = c; hooks.save?.();
    v.i++; v.show = false; draw();
    const nx = v.queue[v.i]; if (nx) window.VOICE?.say(LANG, nx.de);
  }
  function artStart() {
    const ns = allWords().filter(nounOf);
    for (let i = ns.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ns[i], ns[j]] = [ns[j], ns[i]]; }
    st.a = { list: ns.slice(0, 10), i: 0, pick: null, ok: 0 };
  }
  function artView() {
    const a = st.a, w = a.list[a.i];
    if (!w) return `<div class="pr-done"><h3>Artikel alıştırması bitti</h3><p>10 isimden <b>${a.ok}</b> tanesinin artikelini bildin.</p>
      <div class="q-actions"><button class="btn btn-primary" data-pr="art">Yeni 10 isim</button><button class="btn btn-outline" data-pr="vhome">Kelime sayfasına dön</button></div></div>`;
    const n = nounOf(w), done = a.pick !== null;
    return `<div class="pr-task">
      <div class="q-top"><div class="chips"><span class="chip chip-line">Artikel</span></div><span class="muted num">${a.i + 1} / ${a.list.length}</span></div>
      <div class="progress" aria-hidden="true"><i style="width:${(a.i / a.list.length) * 100}%"></i></div>
      <div class="pr-word"><span lang="${LANG.slice(0, 2)}">${done ? esc(w.de) : `___ ${esc(n.noun)}`}</span><small>${esc(w.tr)}</small></div>
      <div class="pr-arts">${ART.map((x) => `<button type="button" class="opt ${done ? (x === n.art ? "correct" : x === a.pick ? "wrong" : "") : ""}" data-pr="apick" data-a="${x}" ${done ? "disabled" : ""}>${x}</button>`).join("")}</div>
      ${done ? `<div class="explain ${a.pick === n.art ? "ok" : "no"}"><strong>${a.pick === n.art ? "Doğru" : `Doğrusu: ${n.art}`}</strong>${artHint(w) ? `<span>${esc(artHint(w))}</span>` : ""}</div>
        <div class="q-actions"><button class="btn btn-primary" data-pr="anext">${a.i + 1 >= a.list.length ? "Bitir" : "Sonraki"}</button>${sayBtn({ lang: LANG, text: w.de })}</div>` : ""}
    </div>`;
  }

  // ---------- Çizim ve olaylar ----------
  function draw() {
    if (!root) return;
    if (kind === "kelime") root.innerHTML = st.mode === "art" ? artView() : st.mode === "kart" ? vocabCard() : vocabHome();
    else if (kind === "konusma") root.innerHTML = st.set ? taskView() : setList();
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
    if (a === "vstart") { vocabStart(el.dataset.tema || ""); st.mode = "kart"; draw(); const w = st.v.queue[0]; if (w) window.VOICE?.say(LANG, w.de); return; }
    if (a === "vshow") { st.v.show = true; draw(); return; }
    if (a === "vknow") { vocabAnswer(el.dataset.ok === "1"); return; }
    if (a === "vhome") { st.mode = null; draw(); return; }
    if (a === "art") { artStart(); st.mode = "art"; draw(); return; }
    if (a === "apick") { const w = st.a.list[st.a.i]; st.a.pick = el.dataset.a; if (st.a.pick === nounOf(w).art) st.a.ok++; draw(); window.VOICE?.say(LANG, w.de); return; }
    if (a === "anext") { st.a.i++; st.a.pick = null; draw(); return; }
    if (a === "self") { const g = tasks()[st.i]; finish(g, { mode: "oz", ok: el.dataset.ok === "1" }); return; }
    if (a === "mac") {
      const w = P.yazma.find((x) => x.id === st.set), msg = root.querySelector("textarea")?.value.trim();
      if (!msg) return;
      // Mac'e giden mesaj 600 karakterle sınırlı: öğrencinin metni sona konur, görev metni gerekirse kısaltılır.
      const tail = `\nMesajım:\n${msg}`;
      const head = `${P.ad || "A1 Almanca"} kısa mesajımı kontrol et; hataları Türkçe açıkla ve düzeltilmiş hâlini yaz. Görev: ${w.gorev} Noktalar: ${w.noktalar.map((p) => p.metin).join(" ")}`;
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
    hooks.onResult?.(P.alanlar?.yazma || "Schreiben", `yaz:${w.id}`, st.res.ok);
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
    if (kind === "konusma") { const g = tasks()[st.i]; return g ? { page: "Konuşma pratiği", context: `${P.ad || "Almanca A1"} konuşma görevi: ${g.gorev} ${g.soru?.text || g.tekrar || g.kart || ""}` } : null; }
    const w = P.yazma.find((x) => x.id === st.set);
    return w ? { page: "Yazma pratiği", context: `${P.ad || "Almanca A1"} yazma görevi: ${w.gorev} ${w.noktalar ? w.noktalar.map((p) => p.metin).join("; ") : ""}` } : null;
  };
  return { mount, stop: stopRec, norm, compare, checkRules, context, supported: !!SR };
})();
