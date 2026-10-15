(() => {
  const A = window.ACADEMIA, E = window.ENGINE;
  const $app = document.getElementById("app");
  const KEY = "academia.v1";
  const LETTERS = "ABCDE";
  const DIAG_SIZE = 10, EXAM_SIZE = 12, BUDGET_DEFAULT = 20;
  const WHY = ["Bilgi eksiği", "Kavram karışıklığı", "Soruyu yanlış okudum", "İstisnayı kaçırdım", "Süre baskısı", "Tahmin ettim"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (x) => Math.round(x * 100);
  const bySlug = Object.fromEntries(A.programs.map((p) => [p.slug, p]));
  const groupLabel = Object.fromEntries(A.groups.map((g) => [g.id, g.label]));

  // ---------- Kalıcı durum (yalnız bu tarayıcı) ----------
  function sampleData(examId) {
    const now = Date.now();
    const rows = A.sample[examId];
    const exam = A.exams[examId];
    const attempts = rows.map(([id, ok, conf], i) => ({
      id, alan: exam.items.find((x) => x.id === id).alan, correct: !!ok, conf, skipped: false,
      mode: i < DIAG_SIZE ? "tani" : "pratik", t: now - (rows.length - i) * 5 * 3600 * 1000,
    }));
    return { sample: true, attempts, diagDone: true, budget: BUDGET_DEFAULT };
  }
  const emptyData = () => ({ sample: false, attempts: [], diagDone: false, budget: BUDGET_DEFAULT });

  let store = { exam: "tus", tab: "panel", data: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) store = { ...store, ...JSON.parse(raw) }; } catch (_) {}
  for (const id of Object.keys(A.exams)) if (!store.data[id]) store.data[id] = sampleData(id);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (_) {} };

  // ---------- Türetilmiş durum ----------
  function derive(examId, data) {
    const exam = A.exams[examId];
    const sh = E.shares(exam.blueprint);
    const mastery = {}, attemptsByAlan = {}, cards = {};
    for (const a of Object.keys(sh)) mastery[a] = { ...E.PRIOR };
    const answered = new Set();
    let correct = 0;
    for (const at of data.attempts) {
      mastery[at.alan] = E.updateMastery(mastery[at.alan], at.correct, at.skipped ? null : at.conf);
      attemptsByAlan[at.alan] = (attemptsByAlan[at.alan] || 0) + 1;
      answered.add(at.id);
      if (at.correct) correct++;
      const prev = cards[at.id];
      const interval = E.nextInterval(prev && prev.interval, at.correct);
      cards[at.id] = { interval, due: at.t + interval * E.DAY };
    }
    const now = Date.now();
    const due = Object.fromEntries(Object.entries(cards).map(([id, c]) => [id, c.due]));
    const dueNow = Object.values(due).filter((t) => t <= now).length;
    const recent = data.attempts.map((a) => a.id).reverse();
    return { exam, sh, mastery, attemptsByAlan, answered, due, dueNow, recent, total: data.attempts.length, correct, now };
  }

  // ---------- Ortak parçalar ----------
  function card(p) {
    return `<a class="card" href="#p-${p.slug}">
      <div class="card-img"><img src="img/${p.slug}.jpg" alt="" loading="lazy" width="800" height="500"></div>
      <div class="card-body">
        <h3>${esc(p.title)}</h3>
        <div class="card-meta"><span>${esc(p.fact)}</span></div>
        <p>${esc(p.summary)}</p>
      </div></a>`;
  }

  function masteryRows(d, { limit } = {}) {
    const areas = Object.keys(d.sh).map((a) => ({ a, s: E.stats(d.mastery[a]), n: d.attemptsByAlan[a] || 0 }));
    if (!d.exam.levels) areas.sort((x, y) => (x.n ? 0 : 1) - (y.n ? 0 : 1) || x.s.mean - y.s.mean || (x.a < y.a ? -1 : 1));
    return areas.slice(0, limit ?? areas.length).map(({ a, s, n }) => {
      const note = d.exam.areaNote?.[a];
      const share = `Sınavda %${pct(d.sh[a])}`;
      if (!n) return `<div class="mrow"><div class="name">${esc(a)}<small>${share}</small></div><div class="mbar empty" role="img" aria-label="${esc(a)}: henüz veri yok"></div><div class="val">Veri yok</div></div>`;
      const lvl = s.mean < E.WEAK_MEAN ? "lvl-weak" : s.mean < 0.75 ? "lvl-mid" : "lvl-good";
      const lo = Math.max(0, s.mean - s.sd), hi = Math.min(1, s.mean + s.sd);
      return `<div class="mrow ${lvl}" ${note ? `title="${esc(note)}"` : ""}>
        <div class="name">${esc(a)}<small>${share} · ${n} soru</small></div>
        <div class="mbar" role="img" aria-label="${esc(a)}: ustalık yüzde ${pct(s.mean)}, artı eksi ${pct(s.sd)}">
          <span class="band" style="left:${lo * 100}%;width:${(hi - lo) * 100}%"></span><span class="fill" style="width:${s.mean * 100}%"></span>
        </div>
        <div class="val"><b>%${pct(s.mean)}</b> ±${pct(s.sd)}</div></div>`;
    }).join("");
  }

  // CEFR: %60 ve üzeri ustalığa ulaşılan en yüksek kesintisiz seviye.
  function estimatedLevel(d) {
    let est = null;
    for (const lv of Object.keys(d.sh)) {
      if (!d.attemptsByAlan[lv] || E.stats(d.mastery[lv]).mean < E.WEAK_MEAN) break;
      est = lv;
    }
    return est;
  }
  const levelChip = (d) => d.exam.levels ? `<span class="chip chip-brand">Tahmini seviye: ${estimatedLevel(d) || "A1 altı"}</span>` : "";

  function nextAction(d, data) {
    if (!data.diagDone) return { title: "Seviye tespitiyle başla", text: `Sınavdaki alan oranlarına göre seçilmiş ${DIAG_SIZE} soru. Sonunda hangi alanda ne kadar hazır olduğunu görürsün.`, btn: "Seviye tespitine başla", tab: "tani" };
    if (d.dueNow) return { title: `Bugün ${d.dueNow} tekrarın var`, text: "Daha önce yanlış yaptığın ya da tekrar zamanı gelen sorular önce gelir.", btn: "Tekrarlara başla", tab: "coz" };
    const weak = Object.keys(d.sh).filter((a) => d.attemptsByAlan[a] && E.stats(d.mastery[a]).mean < E.WEAK_MEAN)
      .sort((a, b) => E.weakness(d.mastery[b]) - E.weakness(d.mastery[a]));
    if (weak.length) {
      const s = E.stats(d.mastery[weak[0]]);
      return { title: `Bugün ${weak[0]} alanına odaklan`, text: `Bu alandaki ustalık tahminin %${pct(s.mean)}, sınavdaki payı %${pct(d.sh[weak[0]])}. Sorular önce buradan gelecek.`, btn: "Soru çözmeye başla", tab: "coz", area: weak[0] };
    }
    return { title: "Yeni sorularla devam et", text: "Zayıf alanın görünmüyor. Sınavdaki payı yüksek olup az çözdüğün alanlardan devam edeceğiz.", btn: "Soru çöz", tab: "coz" };
  }

  // ---------- Ana sayfa ----------
  const slides = [
    { eyebrow: "Kişisel çalışma planı", h: "Sınava <em>kendi eksiklerinden</em> başla.", p: "Kısa bir seviye tespitiyle hangi alanda ne kadar hazır olduğunu gör. Planın çözdüğün her soruyla yeniden hesaplanır." },
    { eyebrow: "Dil eğitimi", h: "İngilizceyi <em>yaşına ve hedefine göre</em> öğren.", p: "Çocuklar için hikâyelerden YDS ve IELTS'e kadar her seviyede aynı ölçme ve takip sistemi." },
  ];
  let slideIdx = 0, slideTimer = null, filter = "all";

  function renderHome() {
    const d = derive("tus", sampleData("tus"));
    const act = nextAction({ ...d, dueNow: 0 }, { diagDone: true });
    const s = slides[slideIdx];
    $app.innerHTML = `
    <section class="hero" aria-label="Tanıtım">
      <div class="wrap">
        <div class="hero-slide" aria-live="polite">
          <span class="eyebrow">${s.eyebrow}</span>
          <h1>${s.h}</h1>
          <p>${s.p}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#basla">Seviyeni Ölç</a>
            <a class="btn btn-outline" href="#egitimler">Programları İncele</a>
          </div>
          <div class="hero-dots" role="group" aria-label="Slaytlar">
            ${slides.map((_, i) => `<button type="button" data-act="slide" data-i="${i}" aria-label="Slayt ${i + 1}" aria-current="${i === slideIdx}"></button>`).join("")}
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-photo"><img src="img/hero.jpg" alt="Masa başında birlikte çalışan öğrenciler" width="1600" height="900"></div>
          <div class="today-card" aria-label="Örnek öğrenci planı">
            <div class="label"><span>Bugünün planı</span><span class="chip chip-line">TUS örneği</span></div>
            <strong>${esc(act.title)}</strong>
            ${masteryRows(d, { limit: 3 }).replace(/<small>.*?<\/small>/g, "")}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head"><div><span class="eyebrow">Nasıl çalışır</span><h2>Her programda aynı dört adım</h2></div>
          <p>Çalışma motoru ilk olarak HMGS için geliştirildi. Bugün TUS'tan dil programlarına kadar her sınavda aynı mantıkla çalışıyor.</p></div>
        <div class="steps">
          <div class="step"><h3>Seviye tespiti</h3><p>Sınavdaki alan oranlarına göre seçilmiş kısa bir testle başlarsın.</p></div>
          <div class="step"><h3>Alan ustalığı</h3><p>Her cevap o alandaki ustalık tahminini günceller. Emin olup yanlış yaptığın konular daha ağır sayılır.</p></div>
          <div class="step"><h3>Kişisel plan</h3><p>Günlük soru sayını sen belirlersin. Tekrarlar ve zayıf alanlar bu bütçeye yerleşir.</p></div>
          <div class="step"><h3>Kişisel deneme</h3><p>Sınavın alan dağılımına göre hazırlanan denemelerle ilerlemeni ölçersin.</p></div>
        </div>
      </div>
    </section>

    <section class="section soft" id="egitimler">
      <div class="wrap">
        <div class="section-head"><div><span class="eyebrow">Eğitimler</span><h2>En çok tercih edilen programlar</h2></div>
          <div class="filters" role="group" aria-label="Program filtresi">
            ${[["all", "Tümü"], ...A.groups.map((g) => [g.id, g.label])].map(([id, l]) => `<button type="button" data-act="filter" data-f="${id}" aria-pressed="${filter === id}">${l}</button>`).join("")}
          </div></div>
        <div class="cards">
          ${A.programs.filter((p) => filter === "all" || p.group === filter).map(card).join("")}
          ${filter === "all" ? `
          <a class="card card-cta" href="#ogren"><div><span class="eyebrow">Ücretsiz</span><h3>Seviyeni 15 dakikada ölç</h3></div><p>TUS, HMGS, YDS, IELTS ya da İngilizce için seviye tespitini çöz, alan alan durumunu ve 14 günlük planını gör.</p><span class="go">Seviye tespitine başla →</span></a>
          <a class="card card-cta" href="#kurumsal"><div><span class="eyebrow">Kurumlar</span><h3>Okullar ve kurumlar için</h3></div><p>Sınıf yönetimi, ödev takvimi ve öğrenci ilerleme raporları.</p><span class="go">Kurumsal eğitimler →</span></a>` : ""}
        </div>
      </div>
    </section>

    <section class="band" id="kurumsal">
      <div class="wrap">
        <div>
          <span class="eyebrow">Kurumsal Eğitimler</span>
          <h2>Okullar ve kurumlar için öğretmen paneli</h2>
          <p>Sınıfları, ödevleri ve öğrenci ilerlemesini tek yerden yönetin. Panel öğretmenin yerine geçmek için değil, işini kolaylaştırmak için tasarlandı.</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#iletisim">Teklif isteyin</a></div>
        </div>
        <ul class="feature-list">
          <li><span>Sınıf, şube ve öğrenci yönetimi</span><span class="chip chip-ready">ASK Robotik'te hazır</span></li>
          <li><span>Ödev atama ve yıllık ödev takvimi</span><span class="chip chip-ready">ASK Robotik'te hazır</span></li>
          <li><span>Alan bazında ustalık ve hata raporu</span><span class="chip chip-soon">Geliştiriliyor</span></li>
          <li><span>Konuşma pratiği raporu (süre, kelime çeşitliliği)</span><span class="chip chip-soon">Geliştiriliyor</span></li>
          <li><span>Kampüs karşılaştırması ve Excel çıktısı</span><span class="chip chip-line">Planlandı</span></li>
        </ul>
      </div>
    </section>

    <section class="section" id="hakkimizda">
      <div class="wrap about">
        <div class="prose">
          <span class="eyebrow">Hakkımızda</span>
          <h2 style="font-size:clamp(26px,3vw,36px);margin:0">Bir sınav için kurduk, her programa taşıyoruz.</h2>
          <p class="muted">Macademia'nın çalışma motoru ilk olarak Hukuk Mesleklerine Giriş Sınavı için geliştirildi. Aynı motor bugün TUS'ta, YDS'de ve dil programlarında seviye tespitinden günlük plana kadar her adımı yönetiyor.</p>
          <p class="muted">ASK Robotik programımız da aynı ölçme anlayışıyla çalışır: önce nerede olduğunu ölçeriz, sonra planı ona göre kurarız.</p>
        </div>
        <div class="principles">
          <div><h3>Uydurma puan göstermeyiz</h3><p>Ustalık tahmini her zaman belirsizlik aralığıyla gösterilir. Veri yoksa “veri yok” yazar.</p></div>
          <div><h3>Soruların dayanağı bellidir</h3><p>Her sorunun açıklaması vardır. Yapay zekâ ile hazırlanan taslaklar uzman onayı olmadan yayına girmez.</p></div>
          <div><h3>Çıkacak soruyu tahmin etmeyiz</h3><p>Denemeler sınavın gerçek alan dağılımına göre hazırlanır. Belirli soruların çıkacağını vaat etmeyiz.</p></div>
        </div>
      </div>
    </section>

    <section class="section soft" id="iletisim">
      <div class="wrap contact">
        <div class="prose">
          <span class="eyebrow">İletişim</span>
          <h2 style="font-size:clamp(26px,3vw,36px);margin:0">Size ulaşalım</h2>
          <p class="muted">Program seçimi, kurum teklifi ya da birebir ders için bilgilerinizi bırakın.</p>
        </div>
        <form class="panel" id="contact-form" novalidate>
          <label class="field">Ad soyad<input id="c-name" name="name" autocomplete="name" required></label>
          <label class="field">Telefon veya e-posta<input id="c-reach" name="reach" required></label>
          <label class="field full">İlgilendiğiniz program<select id="c-prog" name="prog">${A.programs.map((p) => `<option>${esc(p.title)}</option>`).join("")}<option>Kurumsal eğitim</option></select></label>
          <label class="field full">Mesajınız<textarea id="c-msg" name="msg"></textarea></label>
          <div class="full"><button class="btn btn-primary" type="submit">Gönder</button></div>
          <p class="form-note full" id="c-note" hidden></p>
        </form>
      </div>
    </section>`;
    startSlides();
  }

  function startSlides() {
    clearInterval(slideTimer);
    if (reduceMotion) return;
    slideTimer = setInterval(() => {
      if (route().view !== "home" || document.hidden) return;
      slideIdx = (slideIdx + 1) % slides.length;
      updateSlide();
    }, 8000);
  }
  function updateSlide() {
    const s = slides[slideIdx], el = $app.querySelector(".hero-slide");
    if (!el) return;
    el.querySelector(".eyebrow").textContent = s.eyebrow;
    el.querySelector("h1").innerHTML = s.h;
    el.querySelector("p").textContent = s.p;
    el.querySelectorAll(".hero-dots button").forEach((b, i) => b.setAttribute("aria-current", i === slideIdx));
  }

  // ---------- Program sayfası ----------
  function renderProgram(p) {
    const rows = (r) => r.map((c) => `<tr>${c.map((x, i) => `<td${i && /^\d+$/.test(x) ? ' class="num"' : ""}>${esc(x)}</td>`).join("")}</tr>`).join("");
    const others = A.programs.filter((o) => o.group === p.group && o.slug !== p.slug).slice(0, 4);
    let cta;
    if (p.engine) cta = `<div class="box accent"><h3>Seviyeni ölç</h3><p class="note">${DIAG_SIZE} soruluk seviye tespitiyle alan alan durumunu gör. Ardından 14 günlük planın hazır.</p><a class="btn btn-primary" href="#ogren-${p.engine}">Seviye tespitine başla</a></div>`;
    else if (p.link) cta = `<div class="box accent"><h3>Programı dene</h3><p class="note">ASK Robotik kendi sanal laboratuvarında çalışır. Bağlantı yeni sekmede açılır.</p><a class="btn btn-primary" href="${p.link.href}" target="_blank" rel="noopener">${esc(p.link.label)}</a></div>`;
    else cta = `<div class="box accent"><h3>Ücretsiz seviye tespiti</h3><p class="note">Bilgilerini bırak, programa uygun seviye tespiti için seninle iletişime geçelim.</p><a class="btn btn-primary" href="#iletisim">Bilgi bırak</a></div>`;

    $app.innerHTML = `
    <div class="wrap"><nav class="crumbs" aria-label="Konum"><a href="#ana">Anasayfa</a> / <a href="#egitimler">Eğitimler</a> / ${esc(p.title)}</nav>
      <div class="prog-hero">
        <div>
          <span class="eyebrow">${esc(groupLabel[p.group])}</span>
          <h1>${esc(p.title)}</h1>
          <p class="lead">${esc(p.summary)}</p>
          <div class="hero-actions"><span class="chip chip-brand">${esc(p.fact)}</span>${p.status ? `<span class="chip chip-soon">${esc(p.status.split(".")[0])}</span>` : ""}</div>
        </div>
        <div class="card-img"><img src="img/${p.slug}.jpg" alt="" width="800" height="500"></div>
      </div>
    </div>
    <div class="section soft" style="padding-block:0"><div class="wrap prog-grid">
      <div class="prose">
        ${p.body.map((b) => `<p>${esc(b)}</p>`).join("")}
        ${p.status ? `<p class="note">${esc(p.status)}</p>` : ""}
        ${p.structure ? `<h2>Sınav yapısı</h2>
          <div class="table-wrap"><table><tbody>${rows(p.structure)}</tbody></table></div>${p.structureNote ? `<p class="note">${esc(p.structureNote)}</p>` : ""}` : ""}
        ${p.modules ? `<h2>Modüller</h2><div class="table-wrap"><table><tbody>${p.modules.map((m, i) => `<tr><td class="num">${i + 1}</td><td><a href="#m-${m.slug}">${esc(m.title)}</a><br><small class="muted">${esc(m.desc)}</small></td><td>${esc(m.age)}</td><td class="num">${m.lessons}</td></tr>`).join("")}</tbody></table></div>` : ""}
      </div>
      <aside class="aside">
        ${cta}
        ${others.length ? `<div class="box"><h3>${esc(groupLabel[p.group])}</h3>${others.map((o) => `<a href="#p-${o.slug}">${esc(o.title)}</a>`).join("")}</div>` : ""}
      </aside>
    </div></div>`;
  }

  function renderModule(slug) {
    const p = bySlug.robotik, mods = p.modules, m = mods.find((x) => x.slug === slug);
    $app.innerHTML = `
    <div class="wrap"><nav class="crumbs" aria-label="Konum"><a href="#ana">Anasayfa</a> / <a href="#p-robotik">ASK Robotik</a> / ${esc(m.title)}</nav>
      <div class="prog-hero">
        <div>
          <span class="eyebrow">ASK Robotik · Modül ${mods.indexOf(m) + 1} / ${mods.length}</span>
          <h1>${esc(m.title)}</h1>
          <p class="lead">${esc(m.desc)}</p>
          <div class="hero-actions"><span class="chip chip-brand">${m.lessons} ders</span><span class="chip chip-line">${esc(m.age)}</span></div>
        </div>
        <div class="card-img"><img src="img/robotik.jpg" alt="" width="800" height="500"></div>
      </div>
    </div>
    <div class="section soft" style="padding-block:0"><div class="wrap prog-grid">
      <div class="prose">
        ${m.topics ? `<h2>Neler öğrenilir</h2><ul>${m.topics.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        <h2>Tüm modüller</h2>
        <div class="table-wrap"><table><tbody>${mods.map((x, i) => `<tr><td class="num">${i + 1}</td><td>${x.slug === m.slug ? `<b>${esc(x.title)}</b>` : `<a href="#m-${x.slug}">${esc(x.title)}</a>`}</td><td class="num">${x.lessons} ders</td></tr>`).join("")}</tbody></table></div>
      </div>
      <aside class="aside"><div class="box accent"><h3>Modülü başlat</h3><p class="note">Dersler ASK Robotik'in sanal laboratuvarında açılır. Bağlantı yeni sekmede açılır.</p><a class="btn btn-primary" href="${p.link.href}" target="_blank" rel="noopener">${esc(p.link.label)}</a></div></aside>
    </div></div>`;
  }

  // ---------- Öğrenme alanı ----------
  let session = null; // { kind: 'tani'|'coz'|'deneme', ... }
  let resetArmed = false;

  const TABS = [["panel", "Panel"], ["tani", "Seviye tespiti"], ["coz", "Soru çöz"], ["plan", "Çalışma planı"], ["deneme", "Kişisel deneme"]];

  function renderApp() {
    const examId = store.exam, data = store.data[examId], d = derive(examId, data);
    let body = "";
    if (store.tab === "panel") body = viewPanel(d, data);
    else if (store.tab === "tani") body = viewTani(d, data);
    else if (store.tab === "coz") body = viewCoz(d, data);
    else if (store.tab === "plan") body = viewPlan(d, data);
    else body = viewDeneme(d, data);
    $app.innerHTML = `
    <div class="app-head"><div class="wrap">
      <div><span class="eyebrow">Öğrenme alanı</span><h1>${esc(d.exam.name)}</h1></div>
      <p>Bu alan HMGS için geliştirdiğimiz çalışma motorunun aynısıyla çalışır. İlerlemen yalnız bu tarayıcıda saklanır.</p>
      <div class="seg" role="group" aria-label="Sınav seç">${Object.entries(A.exams).map(([id, x]) => `<button type="button" data-act="exam" data-id="${id}" aria-pressed="${id === examId}">${x.short}</button>`).join("")}</div>
      <div class="tabs" role="tablist">${TABS.map(([id, l]) => `<button type="button" role="tab" data-act="tab" data-id="${id}" aria-selected="${store.tab === id}">${l}</button>`).join("")}</div>
    </div></div>
    <div class="wrap app-body">
      ${data.sample ? `<div class="sample-bar"><span>Örnek öğrenci verisi gösteriliyor. Rakamlar demo amaçlıdır.</span><button class="btn btn-small" data-act="own">Kendi verimle başla</button></div>` : ""}
      ${body}
    </div>`;
  }

  function viewPanel(d, data) {
    const act = nextAction(d, data);
    const diagCount = data.attempts.filter((a) => a.mode === "tani").length;
    return `
    <div class="next-card"><span class="eyebrow">Bugünün planı</span><h2>${esc(act.title)}</h2><p class="muted">${esc(act.text)}</p>
      <div><button class="btn btn-primary" data-act="tab" data-id="${act.tab}">${esc(act.btn)}</button></div></div>
    <div class="tiles">
      <div class="tile"><b>${d.total}</b><span>Çözülen soru</span></div>
      <div class="tile"><b>${d.total ? "%" + pct(d.correct / d.total) : "–"}</b><span>Doğru oranı</span></div>
      <div class="tile"><b>${d.dueNow}</b><span>Bekleyen tekrar</span></div>
      <div class="tile"><b>${data.diagDone ? "Tamam" : `${Math.min(diagCount, DIAG_SIZE)}/${DIAG_SIZE}`}</b><span>Seviye tespiti</span></div>
    </div>
    <div class="panel-box">
      <header><h3>${d.exam.levels ? "Seviye ustalığı" : "Alan ustalığı"} ${levelChip(d)}</h3><div class="legend"><span><i style="background:var(--bad)"></i>Zayıf (%60 altı)</span><span><i style="background:var(--warn)"></i>Gelişiyor</span><span><i style="background:var(--good)"></i>İyi (%75 üstü)</span></div></header>
      ${masteryRows(d)}
      <details class="how"><summary>Bu oranlar nasıl hesaplanıyor?</summary><ul>
        <li>Her alan %50 belirsiz bir tahminle başlar. Doğru cevap tahmini yukarı, yanlış cevap aşağı çeker.</li>
        <li>Cevaptan önce ne kadar emin olduğunu sorarız. Az emin olduğun doğru cevap yarım, çok emin olduğun yanlış cevap bir buçuk kat sayılır.</li>
        <li>Çubuğun açık renkli kısmı belirsizliği gösterir. Soru çözdükçe daralır.</li>
        <li>%60'ın altındaki alanlar zayıf sayılır ve sorular önce oradan gelir.</li>
      </ul></details>
    </div>
    ${data.sample ? "" : `<div><button class="btn btn-outline btn-small" data-act="reset">${resetArmed ? "Emin misin? Tüm ilerleme silinecek" : "İlerlememi sıfırla"}</button></div>`}`;
  }

  function questionView(q, { mode, progress, showReason }) {
    const it = q.item;
    const ex = mode === "deneme";
    const chips = `<span class="chip chip-line">${esc(it.alan)}</span>${showReason ? `<span class="chip chip-brand">${esc(E.REASONS[q.reason])}</span>` : ""}`;
    const opts = it.o.map((o, i) => {
      let cls = "";
      if (q.done && !ex) { if (i === it.a) cls = "correct"; else if (i === q.chosen) cls = "wrong"; }
      return `<button type="button" class="opt ${cls}" data-act="choose" data-i="${i}" aria-pressed="${q.chosen === i}" ${q.done || (!ex && !q.conf) ? "disabled" : ""}><span class="letter">${LETTERS[i]}</span><span>${esc(o)}</span></button>`;
    }).join("");
    const conf = ex ? "" : `<div class="conf" role="group" aria-label="Ne kadar eminsin"><span>Cevaplamadan önce: ne kadar eminsin?</span>${[[1, "Az"], [2, "Orta"], [3, "Çok"]].map(([v, l]) => `<button type="button" data-act="conf" data-v="${v}" aria-pressed="${q.conf === v}" ${q.done ? "disabled" : ""}>${l}</button>`).join("")}</div>`;
    let after = "";
    if (q.done && !ex) {
      const ok = q.correct;
      after = `<div class="explain ${ok ? "ok" : "no"}"><strong>${q.skipped ? "Boş bıraktın" : ok ? "Doğru" : "Yanlış"}. Doğru cevap ${LETTERS[it.a]}.</strong><span>${esc(it.e)}</span></div>
        ${!ok ? `<div class="why"><span>Neden yanlış yaptın? Hata defterine kaydedilir.</span><div>${WHY.map((w) => `<button type="button" class="chip ${q.why === w ? "chip-brand" : "chip-line"}" data-act="why" data-w="${esc(w)}" style="cursor:pointer">${w}</button>`).join("")}</div></div>` : ""}`;
    }
    const actions = q.done && !ex
      ? `<button class="btn btn-primary" data-act="next">${progress && progress[0] >= progress[1] ? "Sonucu gör" : "Sonraki soru"}</button>`
      : ex
        ? `<button class="btn btn-primary" data-act="answer" ${q.chosen === null ? "disabled" : ""}>${progress[0] >= progress[1] ? "Denemeyi bitir" : "Sonraki"}</button><button class="btn btn-outline" data-act="skip">Boş bırak</button>`
        : `<button class="btn btn-primary" data-act="answer" ${q.chosen === null || !q.conf ? "disabled" : ""}>Cevapla</button><button class="btn btn-outline" data-act="skip">Boş bırak</button>`;
    return `<div class="question">
      ${progress ? `<div class="progress" aria-hidden="true"><i style="width:${(progress[0] / progress[1]) * 100}%"></i></div>` : ""}
      <div class="q-top"><div class="chips">${chips}</div>${progress ? `<span class="muted num">Soru ${progress[0]} / ${progress[1]}</span>` : ""}</div>
      <p class="q-text">${esc(it.q)}</p>${conf}<div class="opts">${opts}</div>${after}<div class="q-actions">${actions}</div></div>`;
  }

  function quotaTable(d, n) {
    const avail = {};
    for (const it of d.exam.items) avail[it.alan] = (avail[it.alan] || 0) + 1;
    return E.allocateQuota(d.sh, n, avail);
  }

  function viewTani(d, data) {
    if (session && session.kind === "tani") {
      if (session.finished) return taniSummary(d, session.ids);
      return questionView(session.q, { mode: "tani", progress: [session.asked, DIAG_SIZE] });
    }
    const quota = quotaTable(d, DIAG_SIZE);
    return `<div class="grid-2">
      <div class="panel-box"><h3>${data.diagDone ? "Seviye tespitini yeniden yap" : "Seviye tespiti"}</h3>
        <p class="muted">${DIAG_SIZE} soru, alanlara sınavdaki paylarına göre dağıtılır. Her sorudan sonra doğru cevabı ve açıklamasını görürsün.</p>
        ${d.exam.blueprintNote ? `<p class="note">${esc(d.exam.blueprintNote)}</p>` : ""}
        <div class="table-wrap"><table><thead><tr><th>Alan</th><th class="num">Sınavdaki pay</th><th class="num">Soru</th></tr></thead><tbody>
          ${Object.keys(d.sh).map((a) => `<tr><td>${esc(a)}</td><td class="num">%${pct(d.sh[a])}</td><td class="num">${quota[a] || 0}</td></tr>`).join("")}
        </tbody></table></div>
        <div><button class="btn btn-primary" data-act="start-tani">Başla</button></div></div>
      <div class="panel-box"><h3>Soru sayısı neden böyle dağıldı?</h3>
        <p class="muted">Soru sayısı “en büyük kalan” yöntemiyle alanlara bölünür. Önce her alan payının tam kısmını alır, kalan sorular küsuratı en büyük olan alanlara gider.</p>
        <p class="muted">Demo soru bankası küçük olduğu için seviye tespiti kısa tutuldu. Gerçek üründe test daha uzun ve her alanda birden çok konu kapsar.</p></div>
    </div>`;
  }

  function taniSummary(d, ids) {
    const rows = {};
    for (const at of store.data[store.exam].attempts.filter((a) => ids.includes(a.t))) {
      rows[at.alan] = rows[at.alan] || [0, 0];
      rows[at.alan][1]++; if (at.correct) rows[at.alan][0]++;
    }
    return `<div class="panel-box"><span class="eyebrow">Seviye tespiti tamamlandı</span><h3>Alan sonuçların ${levelChip(d)}</h3>
      <div class="table-wrap"><table><thead><tr><th>Alan</th><th class="num">Doğru</th><th class="num">Soru</th></tr></thead><tbody>
      ${Object.entries(rows).map(([a, [k, n]]) => `<tr><td>${esc(a)}</td><td class="num">${k}</td><td class="num">${n}</td></tr>`).join("")}</tbody></table></div>
      ${masteryRows(d)}
      <div class="q-actions"><button class="btn btn-primary" data-act="tab" data-id="plan">Planımı gör</button><button class="btn btn-outline" data-act="tab" data-id="coz">Soru çözmeye başla</button></div></div>`;
  }

  function viewCoz(d, data) {
    if (!session || session.kind !== "coz") {
      const sel = pickPractice(d);
      if (!sel) return `<div class="panel-box"><h3>Şu an uygun soru kalmadı</h3><p class="muted">Son çözdüğün sorular dışında soru kalmadı. Biraz sonra tekrar dene ya da kişisel deneme çöz.</p></div>`;
      session = { kind: "coz", q: newQ(sel) };
    }
    return questionView(session.q, { mode: "coz", showReason: true });
  }

  function pickPractice(d) {
    return E.selectNext({ mode: "pratik", items: d.exam.items, recent: d.recent, answered: d.answered, due: d.due, mastery: d.mastery, attemptsByAlan: d.attemptsByAlan, sh: d.sh, now: Date.now() });
  }
  const newQ = (sel) => ({ item: sel.item, reason: sel.reason, conf: null, chosen: null, done: false, why: null });

  function viewPlan(d, data) {
    const ranked = E.rankAreas(d.sh, d.mastery, d.attemptsByAlan);
    const top = ranked.slice(0, 3);
    const budget = data.budget;
    const sched = E.buildSchedule(Object.values(d.due), startOfDay(Date.now()), budget);
    // Boş kapasite, ilk üç alana öncelik puanı oranında gün gün dağıtılır.
    const dayQuota = E.allocateQuota(Object.fromEntries(top.map((r) => [r.alan, r.score])), 14, Object.fromEntries(top.map((r) => [r.alan, 14])));
    const seq = [];
    const left = { ...dayQuota };
    while (seq.length < 14) for (const r of top) if (left[r.alan] > 0 && seq.length < 14) { seq.push(r.alan); left[r.alan]--; }
    const fmt = new Intl.DateTimeFormat("tr-TR", { weekday: "short", day: "numeric", month: "short" });
    return `<div class="panel-box">
      <header><h3>Günlük soru bütçen</h3>
        <label class="inline-field" for="budget">Günde <input id="budget" type="number" min="5" max="200" step="1" value="${budget}" inputmode="numeric"> soru</label></header>
      <p class="muted">Tekrarlar önce yerleşir. Bütçeyi aşan tekrar ertesi güne kayar, kalan kapasite öncelikli alanlara ayrılır.</p>
    </div>
    <div class="grid-2">
      <div class="panel-box"><h3>14 günlük plan</h3>
        <div class="days">${sched.days.map((day, i) => `<div class="day ${i === 0 ? "today" : ""}"><b>${i === 0 ? "Bugün" : esc(fmt.format(new Date(startOfDay(Date.now()) + i * E.DAY)))}</b>
          <span class="r num">Tekrar ${day.planned}</span>${day.spare > 0 ? `<span class="n num">Yeni ${day.spare} · ${esc(seq[i])}</span>` : ""}</div>`).join("")}</div>
        ${sched.overflow ? `<p class="note">${sched.overflow} tekrar 14 günün dışına taştı. Günlük bütçeni artırmayı düşünebilirsin.</p>` : ""}
      </div>
      <div class="panel-box"><h3>Öncelikli alanlar</h3>
        <ol class="rank">${ranked.map((r) => `<li><span>${esc(r.alan)}<br><small class="muted">Sınavda %${pct(r.share)} · ${r.mean === null ? "henüz soru çözülmedi" : `ustalık %${pct(r.mean)}`}</small></span><span class="muted num">${r.score.toFixed(2)}</span></li>`).join("")}</ol>
        <details class="how"><summary>Sıralama nasıl yapılıyor?</summary><ul>
          <li>Öncelik puanı = sınavdaki pay × (1 − ustalık).</li>
          <li>Sınavda çok soru çıkan ve senin zayıf olduğun alan en üste çıkar.</li>
          <li>Henüz soru çözmediğin alanlarda ustalık %50 kabul edilir.</li>
          <li>Bu bir çalışma sırasıdır; hangi soruların çıkacağına dair bir tahmin değildir.</li>
        </ul></details>
      </div>
    </div>`;
  }

  function startOfDay(t) { const x = new Date(t); x.setHours(0, 0, 0, 0); return x.getTime(); }

  function viewDeneme(d, data) {
    if (session && session.kind === "deneme") {
      if (session.finished) return denemeResult(session);
      return questionView(session.q, { mode: "deneme", progress: [session.idx + 1, session.items.length] });
    }
    const quota = quotaTable(d, EXAM_SIZE);
    return `<div class="grid-2">
      <div class="panel-box"><h3>Kişisel deneme</h3>
        <p class="muted">${EXAM_SIZE} soru, sınavdaki alan paylarına göre dağıtılır. Cevaplar ve açıklamalar sonda gösterilir.</p>
        <div class="table-wrap"><table><thead><tr><th>Alan</th><th class="num">Soru</th></tr></thead><tbody>
          ${Object.keys(d.sh).map((a) => `<tr><td>${esc(a)}</td><td class="num">${quota[a] || 0}</td></tr>`).join("")}</tbody></table></div>
        <div><button class="btn btn-primary" data-act="start-deneme">Denemeyi başlat</button></div></div>
      <div class="panel-box"><h3>Deneme soruları nereden geliyor?</h3>
        <p class="muted">Gerçek üründe deneme soruları, sınavın alan dağılımına ve senin zayıf konularına göre yapay zekâ ile taslak olarak hazırlanır. Her taslak, öğrenciye gitmeden önce alanında uzman biri tarafından kontrol edilir.</p>
        <p class="muted">Denemeler hangi soruların çıkacağını tahmin etmez. Amaç, gerçek sınavla aynı dağılımda kendini ölçmendir. Bu demoda sorular örnek soru bankasından seçilir.</p></div>
    </div>`;
  }

  function denemeResult(s) {
    const n = s.items.length;
    const k = s.answers.filter((a, i) => a !== null && a === s.items[i].a).length;
    const blank = s.answers.filter((a) => a === null).length;
    const [lo, hi] = E.wilson(k, n);
    const byArea = {};
    s.items.forEach((it, i) => { byArea[it.alan] = byArea[it.alan] || [0, 0]; byArea[it.alan][1]++; if (s.answers[i] === it.a) byArea[it.alan][0]++; });
    return `<div class="panel-box">
      <span class="eyebrow">Deneme sonucu</span>
      <div class="result-head num"><div><b>${k}</b> doğru</div><div><b>${n - k - blank}</b> yanlış</div><div><b>${blank}</b> boş</div></div>
      <p class="muted">Doğru oranın %${pct(k / n)}. ${n} soruluk bir denemede bu oranın %95 güven aralığı %${pct(lo)} ile %${pct(hi)} arasıdır. Soru sayısı arttıkça aralık daralır. Bu sonuçtan sınav puanı tahmini yapmıyoruz.</p>
      <div class="table-wrap"><table><thead><tr><th>Alan</th><th class="num">Doğru</th><th class="num">Soru</th></tr></thead><tbody>
        ${Object.entries(byArea).map(([a, [x, m]]) => `<tr><td>${esc(a)}</td><td class="num">${x}</td><td class="num">${m}</td></tr>`).join("")}</tbody></table></div>
      <details class="how"><summary>Cevap anahtarı ve açıklamalar</summary><ul>
        ${s.items.map((it, i) => `<li><b>${i + 1}. ${esc(it.alan)}</b>: senin cevabın ${s.answers[i] === null ? "boş" : LETTERS[s.answers[i]]}, doğru cevap ${LETTERS[it.a]}. ${esc(it.e)}</li>`).join("")}
      </ul></details>
      <div class="q-actions"><button class="btn btn-primary" data-act="tab" data-id="panel">Panele dön</button><button class="btn btn-outline" data-act="start-deneme">Yeni deneme</button></div>
    </div>`;
  }

  function record(item, correct, conf, skipped, mode) {
    const data = store.data[store.exam];
    const t = Date.now() + Math.random();
    data.attempts.push({ id: item.id, alan: item.alan, correct, conf, skipped, mode, t });
    save();
    return t;
  }

  // ---------- Etkileşimler ----------
  $app.addEventListener("click", (ev) => {
    const el = ev.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    const examId = store.exam;
    const data = store.data[examId];

    if (act === "slide") { slideIdx = +el.dataset.i; updateSlide(); startSlides(); return; }
    if (act === "filter") { filter = el.dataset.f; renderHome(); return; }
    if (act === "exam") { store.exam = el.dataset.id; session = null; resetArmed = false; save(); location.hash = "ogren-" + store.exam; return; }
    if (act === "tab") { store.tab = el.dataset.id; if (session && (session.kind !== store.tab || session.finished)) session = null; resetArmed = false; save(); renderApp(); window.scrollTo({ top: 0 }); return; }
    if (act === "own") { store.data[examId] = emptyData(); session = null; store.tab = "tani"; save(); renderApp(); return; }
    if (act === "reset") {
      if (!resetArmed) { resetArmed = true; renderApp(); return; }
      store.data[examId] = emptyData(); resetArmed = false; session = null; save(); renderApp(); return;
    }

    if (act === "start-tani") {
      const d = derive(examId, data);
      session = { kind: "tani", quota: quotaTable(d, DIAG_SIZE), asked: 0, seen: new Set(), ids: [], finished: false };
      session.remaining = { ...session.quota };
      nextTani(); renderApp(); return;
    }
    if (act === "start-deneme") {
      const d = derive(examId, data);
      const quota = quotaTable(d, EXAM_SIZE);
      const items = [];
      for (const [alan, n] of Object.entries(quota)) {
        const pool = d.exam.items.filter((i) => i.alan === alan).sort(() => Math.random() - 0.5);
        items.push(...pool.slice(0, n));
      }
      items.sort(() => Math.random() - 0.5);
      session = { kind: "deneme", items, idx: 0, answers: [], finished: false, q: { item: items[0], chosen: null } };
      store.tab = "deneme"; save(); renderApp(); return;
    }

    if (!session) return;
    const q = session.q;
    if (act === "conf") { q.conf = +el.dataset.v; renderApp(); return; }
    if (act === "choose") { q.chosen = +el.dataset.i; renderApp(); return; }

    if (session.kind === "deneme" && (act === "answer" || act === "skip")) {
      const ans = act === "skip" ? null : q.chosen;
      session.answers.push(ans);
      record(q.item, ans === q.item.a, 2, ans === null, "deneme");
      session.idx++;
      if (session.idx >= session.items.length) session.finished = true;
      else session.q = { item: session.items[session.idx], chosen: null };
      renderApp(); window.scrollTo({ top: 0 }); return;
    }

    if (act === "answer" || act === "skip") {
      const skipped = act === "skip";
      q.done = true; q.skipped = skipped; q.correct = !skipped && q.chosen === q.item.a;
      q.t = record(q.item, q.correct, skipped ? null : q.conf, skipped, session.kind === "tani" ? "tani" : "pratik");
      if (session.kind === "tani") session.ids.push(q.t);
      renderApp(); return;
    }
    if (act === "why") {
      q.why = el.dataset.w;
      const at = data.attempts.find((a) => a.t === q.t); if (at) { at.why = q.why; save(); }
      renderApp(); return;
    }
    if (act === "next") {
      if (session.kind === "tani") {
        if (session.asked >= DIAG_SIZE) { session.finished = true; data.diagDone = true; save(); }
        else nextTani();
      } else {
        const sel = pickPractice(derive(examId, data));
        session = sel ? { kind: "coz", q: newQ(sel) } : null;
      }
      renderApp(); window.scrollTo({ top: 0 }); return;
    }
  });

  function nextTani() {
    const d = derive(store.exam, store.data[store.exam]);
    const sel = E.selectNext({ mode: "tani", items: d.exam.items, recent: [], answered: session.seen, diagRemaining: session.remaining });
    if (!sel) { session.finished = true; store.data[store.exam].diagDone = true; save(); return; }
    session.seen.add(sel.item.id);
    session.remaining[sel.item.alan]--;
    session.asked++;
    session.q = newQ(sel);
  }

  $app.addEventListener("change", (ev) => {
    if (ev.target.id === "budget") {
      const v = Math.round(+ev.target.value);
      if (v >= 5 && v <= 200) { store.data[store.exam].budget = v; save(); }
      renderApp();
    }
  });

  $app.addEventListener("submit", (ev) => {
    if (ev.target.id !== "contact-form") return;
    ev.preventDefault();
    const note = document.getElementById("c-note");
    const name = document.getElementById("c-name").value.trim(), reach = document.getElementById("c-reach").value.trim();
    note.hidden = false;
    if (!name || !reach) { note.textContent = "Ad soyad ve iletişim bilgisi gerekli."; note.style.background = "var(--bad-soft)"; note.style.color = "var(--bad)"; return; }
    note.style.background = ""; note.style.color = "";
    note.textContent = `Teşekkürler ${name}. Bu sayfa bir demo olduğu için bilgileriniz kaydedilmedi ve gönderilmedi.`;
  });

  // ---------- Menü ----------
  const mega = document.getElementById("mega"), dropBtn = document.getElementById("drop-btn");
  const nav = document.getElementById("main-nav"), toggle = document.getElementById("menu-toggle");
  mega.innerHTML = A.groups.map((g) => {
    const links = g.id === "dijital"
      ? `<a href="#p-robotik">ASK Robotik: genel bakış</a>${bySlug.robotik.modules.map((m) => `<a href="#m-${m.slug}">${esc(m.title)}</a>`).join("")}`
      : A.programs.filter((p) => p.group === g.id).map((p) => `<a href="#p-${p.slug}">${esc(p.title)}</a>`).join("");
    return `<div><h4>${g.label}</h4>${links}</div>`;
  }).join("");
  const setMega = (open) => { mega.hidden = !open; dropBtn.setAttribute("aria-expanded", open); };
  dropBtn.addEventListener("click", (e) => { e.stopPropagation(); setMega(mega.hidden); });
  const drop = dropBtn.parentElement;
  drop.addEventListener("mouseenter", () => { if (window.innerWidth > 960) setMega(true); });
  drop.addEventListener("mouseleave", () => { if (window.innerWidth > 960) setMega(false); });
  toggle.addEventListener("click", () => { const o = !nav.classList.contains("open"); nav.classList.toggle("open", o); toggle.setAttribute("aria-expanded", o); });
  document.addEventListener("click", (e) => { if (!drop.contains(e.target)) setMega(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMega(false); nav.classList.remove("open"); } });

  // ---------- Yönlendirme ----------
  const SECTIONS = ["egitimler", "kurumsal", "hakkimizda", "iletisim"];
  let current = null;
  function route() {
    const h = location.hash.replace(/^#/, "");
    if (h.startsWith("p-") && bySlug[h.slice(2)]) return { view: "program", slug: h.slice(2) };
    if (h.startsWith("m-") && bySlug.robotik.modules.some((m) => m.slug === h.slice(2))) return { view: "module", slug: h.slice(2) };
    if (h === "ogren" || h.startsWith("ogren-")) return { view: "app", exam: h.slice(6) };
    if (h === "basla") return { view: "basla" };
    return { view: "home", section: SECTIONS.includes(h) ? h : null };
  }
  function render() {
    const r = route();
    setMega(false); nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
    const key = r.view + (r.slug || "");
    if (r.view === "app") {
      if (r.exam && A.exams[r.exam] && r.exam !== store.exam) { store.exam = r.exam; session = null; save(); }
      if (r.exam && A.exams[r.exam] && current !== key) { const dt = store.data[r.exam]; store.tab = dt.diagDone ? "panel" : "tani"; }
      renderApp();
    } else if (r.view === "program") renderProgram(bySlug[r.slug]);
    else if (r.view === "module") renderModule(r.slug);
    else if (r.view === "basla") MAC.renderOnboarding($app);
    else if (current !== "home" || !$app.querySelector(".hero")) renderHome();
    if (r.view === "home" && r.section) document.getElementById(r.section)?.scrollIntoView({ behavior: current === "home" && !reduceMotion ? "smooth" : "auto" });
    else if (current !== key || r.view === "home") window.scrollTo({ top: 0, behavior: current === "home" && !reduceMotion ? "smooth" : "auto" });
    current = key;
    document.querySelectorAll(".main-nav > a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + (r.section || (r.view === "home" ? "ana" : ""))));
  }
  window.addEventListener("hashchange", render);
  // Adres zaten #ana iken hashchange tetiklenmez; linki yine de çalıştır.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href="#ana"]');
    if (a && (location.hash === "#ana" || location.hash === "")) { e.preventDefault(); render(); }
  });
  if (MAC.needsOnboarding() && (location.hash === "" || location.hash === "#ana")) history.replaceState(null, "", "#basla");
  render();

  window.ACADEMIA_APP = {
    begin(exam, budget) {
      if (store.data[exam].sample) store.data[exam] = emptyData();
      store.data[exam].budget = budget || BUDGET_DEFAULT;
      store.exam = exam; session = null;
      store.tab = store.data[exam].diagDone ? "panel" : "tani";
      save();
      if (location.hash === "#ogren-" + exam) render(); else location.hash = "ogren-" + exam;
    },
  };

  // Mac'in gördüğü sayfa bağlamı. Çözülmemiş sorunun doğru cevabı bağlama girmez.
  MAC.setContext(() => {
    const r = route();
    if (r.view === "program") { const p = bySlug[r.slug]; return { page: `Program sayfası: ${p.title}`, context: `${p.summary} ${p.body.join(" ")}` }; }
    if (r.view === "module") { const m = bySlug.robotik.modules.find((x) => x.slug === r.slug); return { page: `ASK Robotik modülü: ${m.title}`, context: `${m.desc} Yaş: ${m.age}. Ders sayısı: ${m.lessons}.` }; }
    if (r.view === "app") {
      const ex = A.exams[store.exam];
      const tabName = (TABS.find((t) => t[0] === store.tab) || [])[1];
      let context = `Öğrenme alanı, sınav: ${ex.name}. Açık sekme: ${tabName}. Alanlar: ${Object.keys(ex.blueprint).join(", ")}.`;
      const q = session && !session.finished && session.q;
      if (q) {
        const it = q.item;
        context += ` Öğrencinin ekranındaki soru (${it.alan}): ${it.q} Şıklar: ${it.o.map((o, i) => `${LETTERS[i]}) ${o}`).join(" ")}.`;
        context += q.done && session.kind !== "deneme" ? ` Öğrenci cevapladı (${q.correct ? "doğru" : "yanlış"}). Doğru cevap ${LETTERS[it.a]}. Açıklama: ${it.e}` : " Öğrenci henüz cevaplamadı: doğru cevabı söyleme, düşünmesini sağla.";
        const open = !(q.done && session.kind !== "deneme");
        return { page: "Soru çözme ekranı", context, question: true, hide: open ? [it.o[it.a], LETTERS[it.a]] : null };
      }
      return { page: "Öğrenme alanı", context };
    }
    return { page: "Ana sayfa", context: `Programlar: ${A.programs.map((p) => p.title).join(", ")}.` };
  });

  // ---------- Fotoğraf kaynakları ----------
  const LIC = { by: "CC BY", "by-sa": "CC BY-SA", cc0: "CC0", pdm: "Kamu malı" };
  fetch("img/credits.json").then((r) => r.json()).then((list) => {
    document.getElementById("credit-list").innerHTML = list.map((c) =>
      `<li><a href="${esc(c.foreign_landing_url)}" target="_blank" rel="noopener">${esc(c.title || "Adsız")}</a>, ${esc(c.creator || "bilinmiyor")} · <a href="${esc(c.license_url)}" target="_blank" rel="noopener">${LIC[c.license] || esc(c.license)} ${c.license === "cc0" || c.license === "pdm" ? "" : esc(c.license_version || "")}</a></li>`).join("");
  }).catch(() => {});
})();
