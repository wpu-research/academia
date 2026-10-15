// Robi: rehber robot (ASK Robotik'ten). Tanışma akışı (#basla) ve sağ alttaki sohbet paneli.
window.ROBI = (() => {
  const PROFILE_KEY = "academia:profile:v1";
  const SKIP_KEY = "academia:onboarding-skipped";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const get = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };

  function svg(mood = "idle", size = 56) {
    const eye = mood === "happy" ? "M-6 1 q6 -6 12 0" : mood === "oops" ? "M-5 -3 l10 6 M5 -3 l-10 6" : null;
    const eyes = [24, 40].map((x) => `<g transform="translate(${x} 33)">${eye ? `<path d="${eye}" class="robi-eye-line"/>` : `<rect x="-3.5" y="${mood === "think" ? -6 : -4.5}" width="7" height="9" rx="3.5" class="robi-eye"/>`}</g>`).join("");
    return `<svg class="robi robi-${mood}" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
      <line x1="32" y1="6" x2="32" y2="14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <circle class="robi-light" cx="32" cy="6" r="4.5"/>
      <rect x="8" y="14" width="48" height="38" rx="14" class="robi-head"/>
      <rect x="14" y="22" width="36" height="22" rx="9" class="robi-face"/>${eyes}
      <rect x="2" y="27" width="6" height="12" rx="3" class="robi-ear"/><rect x="56" y="27" width="6" height="12" rx="3" class="robi-ear"/>
      <rect x="22" y="54" width="20" height="6" rx="3" class="robi-neck"/></svg>`;
  }

  // ---------- Profil ve öneri ----------
  const ROBOTICS = ["kodlama", "oyun", "elektronik", "robotik", "yz"];
  const INTERESTS = [
    ["kodlama", "⌨️", "Kodlama"], ["oyun", "🎮", "Oyun yapmak"], ["elektronik", "💡", "Elektronik"], ["robotik", "🤖", "Robotik"], ["yz", "🧠", "Yapay zekâ"],
    ["ingilizce", "🇬🇧", "İngilizce"], ["ielts", "🌍", "IELTS / TOEFL"], ["yds", "🎓", "YDS"], ["tus", "🩺", "TUS", 18], ["hmgs", "⚖️", "HMGS", 18],
  ];
  function band(age) {
    if (age <= 7) return "Minikler"; if (age <= 9) return "Kâşifler"; if (age <= 11) return "Yapıcılar";
    if (age <= 13) return "Mühendis Adayları"; if (age <= 17) return "Mühendisler"; return "Yetişkin";
  }
  const MOD = { "blokla-kodlama": "Blokla Kodlamaya İlk Adım", scratch: "Scratch ile Kendi Oyununu Yap", arduino: "Arduino Temelleri", sensorler: "Sensörler ve Projeler", "robotik-modul": "Robotik", "yapay-zeka": "Yapay Zekâ Mühendisliği", "mikro-kart": "Mikro Kart", "oyun-atolyesi": "Oyun Atölyesi" };
  // ASK Robotik recommend() kuralları
  function robotModule(p) {
    const i = new Set(p.interests), adv = p.level === "orta" || p.level === "ileri";
    if (p.age <= 7) return ["blokla-kodlama", "Okuma gerektirmeyen bloklarla, oynayarak başlamak için en uygun modül."];
    if (p.age <= 11) {
      if ((i.has("elektronik") || i.has("robotik")) && !i.has("oyun")) return ["mikro-kart", "Elektroniği merak ettiğin için düğmeli, ışıklı tek bir kartla başlıyoruz."];
      if (adv) return ["oyun-atolyesi", "Blok kodlamayı bildiğin için doğrudan kendi oyunlarını yapacaksın."];
      return ["scratch", "Scratch ile animasyon ve oyun yaparak kodlamanın temellerini öğreneceksin."];
    }
    const robo = ROBOTICS.filter((x) => i.has(x));
    if (p.age >= 13 && robo.length === 1 && robo[0] === "yz") return ["yapay-zeka", "Yapay zekâyı merak ettiğin için dil modelleri ve prompt yazımıyla başlıyoruz."];
    if (p.age >= 13 && i.has("robotik") && p.level === "ileri") return ["robotik-modul", "Programlamayı bildiğin için doğrudan robot hareketi ve sensörlerle başlıyoruz."];
    if (p.level === "ileri") return ["sensorler", "Deneyimli olduğun için sensörlerle haftalık projelere geçiyoruz."];
    return ["arduino", "Arduino ile devre kurmayı ve kod yazmayı sıfırdan öğreneceksin."];
  }
  const EXAM = {
    tus: ["tus", "TUS Hazırlık", "Temel Tıp Bilimleri seviye tespitiyle hangi alanda ne kadar hazır olduğunu göreceksin."],
    hmgs: ["hmgs", "HMGS Hazırlık", "Sekiz hukuk alanında seviye tespiti, ardından zayıf alanlarına göre günlük plan."],
    yds: ["yds", "YDS Hazırlık", "Yedi soru tipinde nerede puan kaybettiğini bulup çalışma süreni oraya kaydıracağız."],
    ielts: ["ielts", "IELTS Hazırlık", "Listening, Reading ve Writing'de kısa ölçümle başlıyoruz."],
    ingilizce: ["ingilizce", "İngilizce Seviye Tespiti", "A1'den C1'e kısa bir testle seviyeni bulup programını ona göre kuracağız."],
  };
  function recommend(p) {
    const recs = [];
    let robotDone = false;
    const order = p.interests.length ? p.interests : ["robotik"];
    for (const k of order) {
      if (ROBOTICS.includes(k)) {
        if (robotDone) continue; robotDone = true;
        const [slug, why] = robotModule(p);
        recs.push({ kind: "module", slug, title: `ASK Robotik · ${MOD[slug]}`, why, href: `#m-${slug}` });
      } else if (EXAM[k]) {
        const [exam, title, why] = EXAM[k];
        recs.push({ kind: "exam", exam, title, why, href: `#ogren-${exam}` });
      }
    }
    return recs;
  }

  // ---------- Tanışma akışı ----------
  const STEPS = ["hello", "who", "school", "age", "interests", "level", "goal", "time", "building", "plan"];
  const PROGRESS = { hello: 5, who: 15, school: 15, age: 30, interests: 45, level: 60, goal: 75, time: 88, building: 96, plan: 100 };
  let ob = null;
  const kid = () => ob.p.who === "cocugum";

  function startOnboarding() { ob = { step: "hello", hist: [], p: { who: null, age: null, interests: [], level: null, goalMin: null, time: null } }; }

  function nextStep(from) {
    const p = ob.p;
    if (from === "hello") return "who";
    if (from === "who") return p.who === "okulum" ? "school" : "age";
    if (from === "school") return "age";
    if (from === "age") return p.age <= 7 ? "goal" : "interests";
    if (from === "interests") return "level";
    if (from === "level") return "goal";
    if (from === "goal") return "time";
    if (from === "time") return "building";
    return "plan";
  }
  function go(step) { ob.hist.push(ob.step); ob.step = step; draw(); }

  function card(attrs, inner, sel) { return `<button type="button" class="ob-card" ${attrs} aria-pressed="${!!sel}">${inner}</button>`; }

  function stepHtml() {
    const p = ob.p, s = ob.step;
    const you = kid() ? "Çocuğunuz" : "Sen";
    if (s === "hello") return `<div class="ob-hero">${svg("happy", 120)}<h1>Merhaba, ben Robi!</h1>
      <p class="ob-lead">Robotikten tıpta uzmanlığa, İngilizceden hukuka kadar Academia'daki yolculuğunda rehberin olacağım. Seni biraz tanıyıp sana özel bir plan çıkaralım.</p>
      <button class="btn btn-primary" data-ob="next">Başlayalım</button></div>`;
    if (s === "who") return q("Academia'yı kim için kullanacaksın?", "", `<div class="ob-grid">${[["kendim", "🙋", "Kendim için"], ["cocugum", "👨‍👧", "Çocuğum için"], ["okulum", "🏫", "Okulum / kurumum için"]].map(([v, e, l]) => card(`data-ob="who" data-v="${v}"`, `<span class="ob-emoji">${e}</span><b>${l}</b>`, p.who === v)).join("")}</div>`);
    if (s === "school") return q("Okullar ve kurumlar için Academia", "Sınıf yönetimi, ödev atama, beceri raporları ve hazır ders planları. Robotik derslerinde donanım gerekmez; her öğrenci tarayıcıda kendi laboratuvarında çalışır.",
      `<div class="ob-actions"><a class="btn btn-primary" href="#kurumsal" data-ob="done-skip">Kurum tekliflerini incele</a><button class="btn btn-outline" data-ob="next">Öğrenci gibi dene</button></div>`);
    if (s === "age") return q(kid() ? "Çocuğunuz kaç yaşında?" : "Kaç yaşındasın?", "Yaşa uygun programları seçmek için soruyoruz; başka bir amaçla kullanılmaz.",
      `<form class="ob-age" data-ob-form="age"><input id="ob-age" type="number" inputmode="numeric" min="4" max="99" value="${p.age ?? ""}" aria-label="Yaş" required><button class="btn btn-primary" type="submit">Devam</button></form><p class="ob-err" id="ob-err" hidden>4 ile 99 arasında bir yaş gir.</p>`);
    if (s === "interests") return q(`${you} en çok neyi merak ediyor${kid() ? "" : "sun"}?`, "Birden fazla seçebilirsin.",
      `<div class="ob-grid">${INTERESTS.filter((x) => !x[3] || p.age >= x[3]).map(([v, e, l]) => card(`data-ob="interest" data-v="${v}"`, `<span class="ob-emoji">${e}</span><b>${l}</b>`, p.interests.includes(v))).join("")}</div>
       <div class="ob-actions"><button class="btn btn-primary" data-ob="next" ${p.interests.length ? "" : "disabled"}>Devam</button></div>`);
    if (s === "level") {
      const robo = p.interests.some((x) => ROBOTICS.includes(x));
      const young = p.age < 12;
      const opts = robo
        ? (young
          ? [["baslangic", "Başlangıç", "Hiç blok kodlamadım.", "▶ başla"], ["acemi", "Acemi", "Birkaç blok denedim.", "➡️ 10 adım ilerle"], ["orta", "Orta", "Döngü ve olay kullanırım.", "🔁 4 kez tekrarla"], ["ileri", "İleri", "Kendi oyunumu yaptım.", "🎮 skor + 1"]]
          : [["baslangic", "Başlangıç", "Temelden başlamak istiyorum.", ""], ["acemi", "Acemi", "Kod gördüm ama yazmadım.", 'print("merhaba")'], ["orta", "Orta", "Döngülü küçük programlar yazarım.", "for (int i = 0; i < 5; i++)"], ["ileri", "İleri", "Uzun programlar yazdım.", "digitalWrite(13, HIGH);"]])
        : [["baslangic", "Başlangıç", "Yeni başlıyorum.", ""], ["acemi", "Acemi", "Konuları bir kez gördüm.", ""], ["orta", "Orta", "Düzenli soru çözüyorum.", ""], ["ileri", "İleri", "Deneme sınavlarına giriyorum.", ""]];
      const title = robo ? (young ? "Blok kodlamada ne kadar deneyimli?" : "Programlamada hangi seviyedesin?") : "Hazırlıkta neredesin?";
      return q(title, "", `<div class="ob-grid ob-grid-2">${opts.map(([v, l, d, code]) => card(`data-ob="level" data-v="${v}"`, `<b>${l}</b><span>${esc(d)}</span>${code ? `<code>${esc(code)}</code>` : ""}`, p.level === v)).join("")}</div>`);
    }
    if (s === "goal") return q("Günlük hedefin ne olsun?", "", `<div class="ob-grid ob-grid-4">${[[10, "Rahat"], [15, "Düzenli"], [20, "Ciddi"], [30, "Yoğun"]].map(([v, l]) => card(`data-ob="goal" data-v="${v}"`, `<b class="ob-big">${v} dk</b><span>${l}</span>`, p.goalMin === v)).join("")}</div>`);
    if (s === "time") return q("Öğrenmeyi gününün neresine koyalım?", "", `<div class="ob-grid ob-grid-4">${[["sabah", "🌅", "Sabah"], ["sonra", "🎒", p.age < 18 ? "Okuldan sonra" : "İşten sonra"], ["aksam", "🌙", "Akşam"], ["fark", "🔄", "Fark etmez"]].map(([v, e, l]) => card(`data-ob="time" data-v="${v}"`, `<span class="ob-emoji">${e}</span><b>${l}</b>`, p.time === v)).join("")}</div>
      <div class="ob-actions"><button class="btn btn-primary" data-ob="build" ${p.time ? "" : "disabled"}>Planımı oluştur</button></div>`);
    if (s === "building") return `<div class="ob-hero">${svg("think", 120)}<h2>Öğrenme planın hazırlanıyor…</h2></div>`;
    // plan
    const recs = recommend(p);
    const first = recs[0];
    return `<div class="ob-plan">
      <p class="eyebrow">Öğrenme planın · ${band(p.age)} (${p.age})</p>
      <h1>${esc(first.title)}</h1><p class="ob-lead">${esc(first.why)}</p>
      <ol class="ob-recs">${recs.map((r, i) => `<li>${i === 0 ? '<span class="chip chip-brand">BURADAN BAŞLA</span>' : ""}<b>${esc(r.title)}</b><span class="muted">${esc(r.why)}</span></li>`).join("")}</ol>
      <div class="ob-loop"><div><b>Öğren</b><span>Kısa anlatım ve örnek</span></div><div><b>Pekiştir</b><span>Sana göre seçilen sorular</span></div><div><b>Ölç</b><span>Seviye tespiti ve deneme</span></div></div>
      <p class="note">Günde ${p.goalMin} dakika · Planın yalnız bu tarayıcıda saklanır.</p>
      <div class="ob-actions"><button class="btn btn-primary" data-ob="begin">Öğrenmeye başla</button><button class="btn btn-outline" data-ob="restart">Baştan başla</button></div></div>`;
  }

  function q(title, note, body) {
    return `<div class="ob-q"><div class="ob-ask">${svg("idle", 64)}<div><h2>${esc(title)}</h2>${note ? `<p class="muted">${esc(note)}</p>` : ""}</div></div>${body}</div>`;
  }

  let $root = null;
  function draw() {
    const pct = PROGRESS[ob.step];
    $root.innerHTML = `<section class="ob">
      <div class="ob-top wrap">
        <button class="ob-back" data-ob="back" aria-label="Geri" ${ob.hist.length && ob.step !== "building" ? "" : "disabled"}>←</button>
        <div class="progress ob-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
        <button class="ob-skip" data-ob="skip">Şimdilik geç</button>
      </div>
      <div class="wrap ob-body">${stepHtml()}</div></section>`;
    if (ob.step === "age") $root.querySelector("#ob-age")?.focus();
    if (ob.step === "building") setTimeout(() => { if (ob && ob.step === "building") { set(PROFILE_KEY, { ...ob.p, createdAt: Date.now() }); ob.step = "plan"; draw(); } }, 1400);
  }

  function renderOnboarding(root) {
    $root = root;
    if (!ob) startOnboarding();
    draw();
  }

  function onClick(e) {
    const el = e.target.closest("[data-ob]");
    if (!el || !ob || !$root.contains(el) || el.disabled) return;
    const a = el.dataset.ob, p = ob.p;
    if (a === "next") return go(nextStep(ob.step));
    if (a === "back") { ob.step = ob.hist.pop() || "hello"; return draw(); }
    if (a === "skip" || a === "done-skip") { set(SKIP_KEY, true); if (a === "skip") location.hash = "ana"; return; }
    if (a === "who") { p.who = el.dataset.v; return go(nextStep("who")); }
    if (a === "interest") { const v = el.dataset.v; p.interests = p.interests.includes(v) ? p.interests.filter((x) => x !== v) : [...p.interests, v]; return draw(); }
    if (a === "level") { p.level = el.dataset.v; return go("goal"); }
    if (a === "goal") { p.goalMin = +el.dataset.v; return go("time"); }
    if (a === "time") { p.time = el.dataset.v; return draw(); }
    if (a === "build") return go("building");
    if (a === "restart") { startOnboarding(); return draw(); }
    if (a === "begin") {
      const r = recommend(p)[0];
      ob = null;
      if (r.kind === "exam") window.ACADEMIA_APP.begin(r.exam, p.goalMin);
      else location.hash = r.href.slice(1);
    }
  }
  function onSubmit(e) {
    if (!ob || e.target.dataset.obForm !== "age") return;
    e.preventDefault();
    const v = Math.round(+document.getElementById("ob-age").value);
    if (!(v >= 4 && v <= 99)) { document.getElementById("ob-err").hidden = false; return; }
    ob.p.age = v;
    if (v < 18) ob.p.interests = ob.p.interests.filter((x) => x !== "tus" && x !== "hmgs");
    if (v <= 7) ob.p.interests = [];
    go(nextStep("age"));
  }
  document.addEventListener("click", onClick);
  document.addEventListener("submit", onSubmit);

  const needsOnboarding = () => !get(PROFILE_KEY) && !get(SKIP_KEY);

  // ---------- Sohbet paneli ----------
  const GREETING = "Merhaba, ben Robi! Bu sayfayla ilgili ne merak ediyorsun? Birlikte bakalım.";
  const chat = { open: false, busy: false, msgs: [], remaining: null };
  let pageContext = () => ({ page: "Academia", context: "" });

  const dock = document.createElement("div");
  dock.className = "robi-dock";
  document.body.appendChild(dock);

  function chips() {
    const base = ["Burada ne yapabilirim?", "Basitçe anlatır mısın?", "Bana bir soru sor"];
    const ctx = pageContext();
    return ctx.question ? ["İpucu ver", "Bunu açıklar mısın?", ...base.slice(1)] : base;
  }

  function drawDock() {
    if (location.hash === "#basla") { dock.hidden = true; return; }
    dock.hidden = false;
    if (!chat.open) {
      dock.innerHTML = `<button class="robi-fab" data-robi="open" aria-label="Robi'ye sor">${svg("idle", 44)}</button>`;
      return;
    }
    const mood = chat.busy ? "think" : chat.error ? "oops" : "happy";
    dock.innerHTML = `<div class="robi-panel" role="dialog" aria-label="Robi">
      <header>${svg(mood, 36)}<div><b>Robi</b><small>${chat.busy ? "Düşünüyor…" : "Academia rehberin"}</small></div><button class="robi-x" data-robi="close" aria-label="Kapat">×</button></header>
      <div class="robi-log" id="robi-log" aria-live="polite">
        <div class="robi-msg bot">${esc(GREETING)}</div>
        ${chat.msgs.map((m) => `<div class="robi-msg ${m.role === "user" ? "me" : "bot"}">${fmt(m.content)}</div>`).join("")}
      </div>
      ${chat.busy ? "" : `<div class="robi-chips">${chips().map((c) => `<button type="button" class="chip chip-line" data-robi="chip" data-t="${esc(c)}">${esc(c)}</button>`).join("")}</div>`}
      <form class="robi-form" data-robi-form><input id="robi-input" maxlength="600" placeholder="Robi'ye sor…" autocomplete="off" ${chat.busy ? "disabled" : ""}><button class="btn btn-primary btn-small" ${chat.busy ? "disabled" : ""}>Gönder</button></form>
      <small class="robi-left">Robi yapay zekâdır ve yanılabilir. Sınav bilgisini soru açıklamalarından doğrula.${chat.remaining !== null ? ` Bugün kalan mesaj: ${chat.remaining}.` : ""}</small>
    </div>`;
    const log = dock.querySelector("#robi-log"); log.scrollTop = log.scrollHeight;
  }
  const fmt = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");

  async function send(text) {
    text = text.trim().slice(0, 600);
    if (!text || chat.busy) return;
    chat.msgs.push({ role: "user", content: text });
    chat.busy = true; chat.error = false;
    const reply = { role: "assistant", content: "" };
    chat.msgs.push(reply);
    drawDock();
    const ctx = pageContext();
    const prof = get(PROFILE_KEY);
    try {
      const res = await fetch("/api/robi", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ page: ctx.page, context: ctx.context, hide: ctx.hide || null, age: prof?.age ?? null, messages: chat.msgs.slice(0, -1).slice(-12) }),
      });
      const left = res.headers.get("x-robi-remaining"); if (left !== null) chat.remaining = +left;
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader(), dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        const cut = chunk.lastIndexOf("\u001e");
        if (cut >= 0) { reply.content = chunk.slice(cut + 1); chat.error = true; } else reply.content += chunk;
        const el = dock.querySelector("#robi-log .robi-msg:last-child"); if (el) el.innerHTML = fmt(reply.content);
      }
      if (!reply.content.trim()) { reply.content = "Şu an cevap veremedim. Sorunu biraz farklı sorar mısın?"; chat.error = true; }
    } catch (_) {
      reply.content = "Robi'ye şu an ulaşılamıyor. Bu önizlemede Robi çalışmaz; canlı sitede tekrar dene.";
      chat.error = true;
    }
    chat.busy = false;
    drawDock();
    dock.querySelector("#robi-input")?.focus();
  }

  dock.addEventListener("click", (e) => {
    const el = e.target.closest("[data-robi]"); if (!el) return;
    const a = el.dataset.robi;
    if (a === "open") { chat.open = true; drawDock(); dock.querySelector("#robi-input")?.focus(); }
    if (a === "close") { chat.open = false; drawDock(); }
    if (a === "chip") send(el.dataset.t);
  });
  dock.addEventListener("submit", (e) => { e.preventDefault(); const i = dock.querySelector("#robi-input"); send(i.value); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && chat.open) { chat.open = false; drawDock(); } });
  window.addEventListener("hashchange", drawDock);
  drawDock();

  return { svg, renderOnboarding, needsOnboarding, setContext: (fn) => { pageContext = fn; }, refresh: drawDock };
})();
