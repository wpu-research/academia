(() => {
  const A = window.ACADEMIA, E = window.ENGINE, P = window.PROGRESS;
  const $app = document.getElementById("app");
  const KEY = "academia.v1";
  const LETTERS = "ABCDE";
  const DIAG_SIZE = 10, EXAM_SIZE = 12, BUDGET_DEFAULT = 20;
  const WHY = ["Bilgi eksiği", "Kavram karışıklığı", "Soruyu yanlış okudum", "İstisnayı kaçırdım", "Süre baskısı", "Tahmin ettim"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const REASON_TXT = { ...E.REASONS, sinav: "Sınav öncesi pekiştirme", hata: "Hata defterinden" };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (x) => Math.round(x * 100);
  const ACTIVE = A.programs.filter((p) => p.active !== false);
  const PASSIVE = A.programs.filter((p) => p.active === false);
  const bySlug = Object.fromEntries(ACTIVE.filter((p) => !p.soon).map((p) => [p.slug, p]));
  const MODULES = ["matematik", "kodlama", "muzik"];
  const METHOD_PROGS = ["hmgs", "tus", "yds", "matematik"];
  const examOn = (id) => !!A.exams[id] && A.exams[id].active !== false;
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
    return { sample: true, attempts, diagDone: true, budget: BUDGET_DEFAULT, denemeler: [], badges: {} };
  }
  const emptyData = () => ({ sample: false, attempts: [], diagDone: false, budget: BUDGET_DEFAULT, denemeler: [], badges: {} });

  let store = { exam: "tus", tab: "panel", data: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) store = { ...store, ...JSON.parse(raw) }; } catch (_) {}
  if (!examOn(store.exam)) store.exam = "tus";
  for (const id of Object.keys(A.exams)) if (!store.data[id]) store.data[id] = sampleData(id);
  for (const dt of Object.values(store.data)) { dt.denemeler = dt.denemeler || []; dt.badges = dt.badges || {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (_) {} };

  // ---------- Türetilmiş durum ----------
  function derive(examId, data) {
    const exam = A.exams[examId];
    const sh = E.shares(exam.blueprint);
    const mastery = {}, attemptsByAlan = {}, cards = {};
    const bank = new Set(exam.items.map((i) => i.id));
    for (const a of Object.keys(sh)) mastery[a] = { ...E.PRIOR };
    const answered = new Set();
    let correct = 0;
    for (const at of data.attempts) {
      mastery[at.alan] = E.updateMastery(mastery[at.alan], at.correct, at.skipped ? null : at.conf);
      attemptsByAlan[at.alan] = (attemptsByAlan[at.alan] || 0) + 1;
      answered.add(at.id);
      if (at.correct) correct++;
      if (!bank.has(at.id)) continue;
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
  function passiveCard(p) {
    return `<div class="card is-passive" aria-disabled="true">
      <div class="card-img"><img src="${p.image || `img/${p.slug}.jpg`}" alt="" loading="lazy" width="800" height="500"></div>
      <div class="card-body"><h3>${esc(p.title)}</h3><div class="card-meta"><span>${esc(p.fact)}</span></div><p>${esc(p.summary)}</p><span class="chip chip-line soon">Yakında</span></div></div>`;
  }

  function gameStats(data) {
    let xp = 0, run = 0;
    for (const at of data.attempts) { if (at.correct) { xp += at.conf === 3 ? 15 : 10; run++; } else run = 0; }
    return { xp, level: 1 + Math.floor(xp / 100), into: xp % 100, streak: run };
  }

  function card(p) {
    return `<a class="card" href="#p-${p.slug}">
      <div class="card-img"><img src="${p.image || `img/${p.slug}.jpg`}" alt="" loading="lazy" width="800" height="500"></div>
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
    { eyebrow: "Robotik", h: "Kodlamadan robota, <em>tarayıcıda</em> öğren.", p: "Blokla kodlamadan Arduino'ya ve yapay zekâya: 8 modül, 241 ders, donanım gerekmeden sanal laboratuvarda." },
  ];
  let slideIdx = 0, slideTimer = null;

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
          <p>Çalışma motoru ilk olarak HMGS için geliştirildi. Bugün TUS, HMGS ve YDS'de aynı mantıkla çalışıyor. <a href="#yontem">Yöntemimizin ayrıntıları →</a></p></div>
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
        <div class="section-head"><div><span class="eyebrow">Eğitimler</span><h2>Programlarımız</h2></div>
          <p>Her programda seviye tespiti, kişisel plan ve ilerleme takibi. Kodlama ve Matematik'te her seviye oyunlu.</p></div>
        <div class="cards cards-3">${ACTIVE.filter((p) => !p.featured).map(card).join("")}</div>
        <details class="soon-fold">
        <summary class="soon-head"><h3>Yeni Deneyimler</h3><p class="muted">Kamerayla hareket, mikrofonla konuşma, tarayıcıda müzik ve deney.</p></summary>
        <div class="cards cards-3">${ACTIVE.filter((p) => p.featured).map((p) => p.soon
          ? `<div class="card card-soon" aria-disabled="true"><div class="card-img"><img src="${p.image}" alt="" loading="lazy" width="800" height="500"></div><div class="card-body"><h3>${esc(p.title)}</h3><div class="card-meta"><span>${esc(p.fact)}</span></div><p>${esc(p.summary)}</p><span class="chip chip-soon soon">Yakında</span></div></div>`
          : card(p)).join("")}</div>
        </details>
        <details class="soon-fold">
        <summary class="soon-head"><h3>Yakında</h3><p class="muted">Bu programlar hazırlanıyor.</p></summary>
        <div class="cards cards-passive">
          ${PASSIVE.map(passiveCard).join("")}
          <div class="card card-cta is-passive" aria-disabled="true"><div><span class="eyebrow">Ücretsiz</span><h3>Seviyeni 15 dakikada ölç</h3></div><p>Seviye tespitini çöz, alan alan durumunu ve 14 günlük planını gör.</p><span class="chip chip-line soon">Yakında</span></div>
          <div class="card card-cta is-passive" aria-disabled="true"><div><span class="eyebrow">Kurumlar</span><h3>Okullar ve kurumlar için</h3></div><p>Sınıf yönetimi, ödev takvimi ve öğrenci ilerleme raporları.</p><span class="chip chip-line soon">Yakında</span></div>
        </div>
        </details>
      </div>
    </section>

    <section class="section" id="danismanlar">
      <div class="wrap">
        <div class="section-head"><div><span class="eyebrow">Ekibimiz</span><h2>Danışmanlarımız</h2></div>
          <p>Her programın içeriğini alanında uzman bir danışman yönlendirir.</p></div>
        <div class="advisors">${A.advisors.map((p) => `<figure class="advisor">
          <img src="img/team/${p.photo}.jpg" alt="${esc(p.name)}" width="320" height="320" loading="lazy">
          <figcaption><b>${p.title === "Dr." ? "Dr. " : ""}${esc(p.name)}${p.title === "PhD" ? ", PhD" : ""}</b><span class="chip chip-brand">${esc(p.field)}</span></figcaption></figure>`).join("")}</div>
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
          <li><span>Sınıf, şube ve öğrenci yönetimi</span><span class="chip chip-ready">Robotik'te hazır</span></li>
          <li><span>Ödev atama ve yıllık ödev takvimi</span><span class="chip chip-ready">Robotik'te hazır</span></li>
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
          <p class="muted">Macademia'nın çalışma motoru ilk olarak Hukuk Mesleklerine Giriş Sınavı için geliştirildi. Aynı motor bugün TUS'ta ve YDS'de de seviye tespitinden günlük plana kadar her adımı yönetiyor.</p>
          <p class="muted">Robotik programımız da aynı ölçme anlayışıyla çalışır: önce nerede olduğunu ölçeriz, sonra planı ona göre kurarız.</p>
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
          <label class="field full">İlgilendiğiniz program<select id="c-prog" name="prog">${ACTIVE.filter((p) => !p.soon).map((p) => `<option>${esc(p.title)}</option>`).join("")}<option>Kurumsal eğitim</option></select></label>
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
    const others = ACTIVE.filter((o) => o.group === p.group && o.slug !== p.slug).slice(0, 4);
    let cta;
    if (p.engine) cta = `<div class="box accent"><h3>Seviyeni ölç</h3><p class="note">${DIAG_SIZE} soruluk seviye tespitiyle alan alan durumunu gör. Ardından 14 günlük planın hazır.</p><a class="btn btn-primary" href="#ogren-${p.engine}">Seviye tespitine başla</a></div>`;
    else if (p.slug === "muzik") cta = `<div class="box accent"><h3>Stüdyoyu aç</h3><p class="note">Ritim makinesi ve DJ mikseriyle serbestçe çalış.</p><a class="btn btn-primary" href="#studyo">Stüdyoya git</a></div>`;
    else if (p.link) cta = `<div class="box accent"><h3>Programı dene</h3><p class="note">Robotik dersleri kendi sanal laboratuvarında çalışır. Bağlantı yeni sekmede açılır.</p><a class="btn btn-primary" href="${p.link.href}" target="_blank" rel="noopener">${esc(p.link.label)}</a></div>`;
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
        <div class="card-img"><img src="${p.image || `img/${p.slug}.jpg`}" alt="" width="800" height="500"></div>
      </div>
    </div>
    <div class="section soft" style="padding-block:0"><div class="wrap prog-grid">
      <div class="prose">
        ${p.body.map((b) => `<p>${esc(b)}</p>`).join("")}
        ${p.status ? `<p class="note">${esc(p.status)}</p>` : ""}
        ${p.structure ? `<h2>Sınav yapısı</h2>
          <div class="table-wrap"><table><tbody>${rows(p.structure)}</tbody></table></div>${p.structureNote ? `<p class="note">${esc(p.structureNote)}</p>` : ""}` : ""}
        ${p.levelsTable ? `<h2>Seviyeler</h2><div class="table-wrap"><table><thead><tr><th>Seviye</th><th>Kimler için</th><th>Konular</th></tr></thead><tbody>${rows(p.levelsTable)}</tbody></table></div>` : ""}
        ${p.game ? `<h2>Nasıl oynanır</h2><ul>${p.game.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
        ${MODULES.includes(p.slug) ? `<h2>Dersler</h2><div class="lesson-list" id="lesson-list"><p class="muted">Dersler yükleniyor…</p></div>
          <h2>Müfredat</h2><div class="cur" id="curriculum"><p class="muted">Müfredat yükleniyor…</p></div>` : ""}
        ${p.modules ? `<h2>Modüller</h2><div class="table-wrap"><table><tbody>${p.modules.map((m, i) => `<tr><td class="num">${i + 1}</td><td><a href="#m-${m.slug}">${esc(m.title)}</a><br><small class="muted">${esc(m.desc)}</small></td><td>${esc(m.age)}</td><td class="num">${m.lessons}</td></tr>`).join("")}</tbody></table></div>` : ""}
      </div>
      <aside class="aside">
        ${programCountdown(p)}
        ${cta}
        ${METHOD_PROGS.includes(p.slug) ? `<div class="box"><h3>Soru Zekâsı</h3><p class="note">Bu programda konular en küçük birimine ayrılır, geçmiş sorular ölçülür ve planın her gün sınav ağırlığı ile senin zayıflığına göre yeniden kurulur.</p><a href="#yontem">Yöntemimizi incele →</a></div>` : ""}
        ${others.length ? `<div class="box"><h3>${esc(groupLabel[p.group])}</h3>${others.map((o) => `<a href="#p-${o.slug}">${esc(o.title)}</a>`).join("")}</div>` : ""}
      </aside>
    </div></div>`;
  }

  function renderModule(slug) {
    const p = bySlug.robotik, mods = p.modules, m = mods.find((x) => x.slug === slug);
    $app.innerHTML = `
    <div class="wrap"><nav class="crumbs" aria-label="Konum"><a href="#ana">Anasayfa</a> / <a href="#p-robotik">Robotik</a> / ${esc(m.title)}</nav>
      <div class="prog-hero">
        <div>
          <span class="eyebrow">Robotik · Modül ${mods.indexOf(m) + 1} / ${mods.length}</span>
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
      <aside class="aside"><div class="box accent"><h3>Modülü başlat</h3><p class="note">Dersler Robotik'in sanal laboratuvarında açılır. Bağlantı yeni sekmede açılır.</p><a class="btn btn-primary" href="${p.link.href}" target="_blank" rel="noopener">${esc(p.link.label)}</a></div></aside>
    </div></div>`;
  }

  function renderStudio() {
    $app.innerHTML = `<div class="wrap"><nav class="crumbs" aria-label="Konum"><a href="#ana">Anasayfa</a> / <a href="#p-muzik">DJ ve Prodüksiyon</a> / Stüdyo</nav>
      <div class="studio-head"><span class="eyebrow">Serbest stüdyo · prototip</span><h1>Stüdyo</h1><p class="lead muted">Ritim makinesinde ritim kur, mikserde iki desteyi birleştir. Ses için önce bir düğmeye bas; tarayıcılar ancak dokunuştan sonra ses çalmaya izin verir.</p></div>
      <section class="studio-box"><h2>Ritim makinesi</h2><div id="st-rm"></div></section>
      <section class="studio-box"><h2>DJ mikseri</h2><div id="st-dj"></div></section></div>`;
    LESSONS.sims["ritim-makinesi"](document.getElementById("st-rm"), { bpm: 120, pattern: { kick: [0, 4, 8, 12], clap: [4, 12], hat: [2, 6, 10, 14] } }, () => {});
    LESSONS.sims["dj-mikser"](document.getElementById("st-dj"), {}, () => {});
  }

  // ---------- Yöntem: Soru Zekâsı ----------
  const ANSWER_SPREAD = [["A", 64], ["B", 61], ["C", 72], ["D", 77], ["E", 66]]; // 340 HMGS sorusu, doğru şık sayıları
  function renderMethod() {
    const maxN = Math.max(...ANSWER_SPREAD.map(([, n]) => n));
    const layers = [
      ["Konu", "Konuları en küçük birimine ayırırız"],
      ["Soru", "Geçmiş soruları ölçeriz"],
      ["Öğrenci", "Her cevabı birime ve tuzağa bağlarız"],
      ["Üretim", "Yeni soruyu altı kontrolden geçiririz"],
      ["Öncelik", "Neye önce çalışılacağını sınarız"],
    ];
    $app.innerHTML = `
    <div class="wrap"><nav class="crumbs" aria-label="Konum"><a href="#ana">Anasayfa</a> / Yöntemimiz</nav>
      <div class="prog-hero method-hero">
        <div>
          <span class="eyebrow">Yöntemimiz · Soru Zekâsı</span>
          <h1>Sınavı ölçer, öğrenciyi izler, planı her gün yeniden kurarız.</h1>
          <p class="lead">Soru Zekâsı, sınav programlarımızın arkasındaki sistemdir. Konuyu en küçük parçasına ayırır, geçmiş soruların o parçaları nasıl sorduğunu ölçer, öğrencinin her cevabını aynı parçalara bağlar. Plan bu üç ölçümden çıkar.</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#basla">Seviyeni Ölç</a><a class="btn btn-outline" href="#yontem" data-to="vaat">Ne vaat etmiyoruz</a></div>
        </div>
        <ol class="layer-stack" aria-label="Soru Zekâsı'nın beş katmanı">
          ${layers.map(([k, t], i) => `<li><a href="#yontem" data-to="katman-${i + 1}"><span class="ln">${i + 1}</span><span><b>${k}</b><small>${t}</small></span></a></li>`).join("")}
          <li class="loop" aria-hidden="true">Her cevap ölçüme geri döner</li>
        </ol>
      </div>
    </div>

    <section class="section soft">
      <div class="wrap">
        <div class="section-head"><div><span class="eyebrow">Öğrencinin yolu</span><h2>Beş adımlık döngü</h2></div>
          <p>Döngü bir kez dönüp bitmez. Her deneme ve her tekrar, bir sonraki günün planını değiştirir.</p></div>
        <div class="steps steps-5">
          <div class="step"><h3>Seviye tespiti</h3><p>Sınavdaki ağırlıklara göre seçilmiş kısa bir testle başlarsın.</p></div>
          <div class="step"><h3>Zayıf noktalar</h3><p>Hangi konuda, hangi soru kalıbında ve hangi tuzakta zorlandığın ortaya çıkar.</p></div>
          <div class="step"><h3>Kişisel plan</h3><p>Sınavda çok sorulan ve senin zayıf olduğun yerler öne alınır.</p></div>
          <div class="step"><h3>Çözüm ve tekrar</h3><p>Yanlışların ve unutmaya başladığın konular zamanı gelince geri gelir.</p></div>
          <div class="step"><h3>Yeniden ölçüm</h3><p>Kişisel denemeler ilerlemeni ölçer, plan yeniden hesaplanır.</p></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap method">
        <article class="layer" id="katman-1">
          <div class="layer-head"><span class="ln">1</span><div><span class="eyebrow">Konu</span><h2>Konuları en küçük birimine ayırırız</h2></div></div>
          <div class="layer-body prose">
            <p>“Medeni Hukuk” ya da “Fonksiyonlar” bir öğrenciye ne çalışacağını söylemez. Bu yüzden her sınavı, soruların gerçekten dayandığı en küçük birime kadar böleriz. Sorular, öğrencinin cevapları ve çalışma planı hep bu birimlere bağlanır.</p>
            <div class="table-wrap"><table>
              <thead><tr><th>Program</th><th>En küçük birim</th><th>İçeriği onaylayan</th><th>Durum</th></tr></thead>
              <tbody>
                <tr><td><b>HMGS</b></td><td>Kanun maddesi, fıkra ve bent; yürürlük tarihleriyle</td><td>Hukukçu</td><td><span class="chip chip-soon">İlk analiz tamam</span></td></tr>
                <tr><td><b>TUS</b></td><td>Tıbbi konu ve dayandığı güncel kılavuz</td><td>Hekim</td><td><span class="chip chip-line">Planlandı</span></td></tr>
                <tr><td><b>YDS</b></td><td>Dilbilgisi yapısı ve soru tipi (okuma, boşluk doldurma, çeviri…)</td><td>İngilizce uzmanı</td><td><span class="chip chip-line">Planlandı</span></td></tr>
                <tr><td><b>Matematik TYT/AYT</b></td><td>MEB kazanımı</td><td>Matematik öğretmeni</td><td><span class="chip chip-line">Planlandı</span></td></tr>
              </tbody></table></div>
          </div>
        </article>

        <article class="layer" id="katman-2">
          <div class="layer-head"><span class="ln">2</span><div><span class="eyebrow">Soru</span><h2>Geçmiş soruları ölçeriz</h2></div></div>
          <div class="layer-body prose">
            <p>Bu katmanda yapay zekâ tahmini değil, sayım vardır. Geçmiş sınavlardaki her soru, dayandığı birimle ve aşağıdaki özellikleriyle etiketlenir. Bu etiketler yalnız iç analiz içindir; geçmiş sınav sorularını yayımlamayız.</p>
            <div class="trio">
              <div><h3>Soru ağırlıkları</h3><p>Hangi alan, konu ve maddeden kaç soru geldiği; bu payın oturumdan oturuma nasıl değiştiği.</p></div>
              <div><h3>Kalıp ve cümle yapısı</h3><p>Olumsuz kök (“…değildir”, “…yanlıştır”), I-II-III öncüllü sorular, vaka soruları, şıkların uzunluk dengesi.</p></div>
              <div><h3>Soru yazarının düşünme biçimi</h3><p>Yazarın bir birimi soruya nasıl çevirdiği: birimin hangi öğesini sorduğu, hangi kalıbı seçtiği, yanlış şıkları nereden ürettiği.</p></div>
            </div>
            <div class="flow" aria-label="Soru yazarının adımları">
              <span>Birim</span><i aria-hidden="true">→</i><span>Sorulan öğe<small>süre, sayı, istisna, tanım…</small></span><i aria-hidden="true">→</i><span>Kalıp</span><i aria-hidden="true">→</i><span>Çeldirici<small>yanlış şıkların kaynağı</small></span>
            </div>
            <div class="box findings">
              <div class="findings-head"><h3>HMGS'de ilk analizden bulgular</h3><span class="chip chip-ready">İlk analiz · örneklem hukukçu onaylı</span></div>
              <ul>
                <li>Doğru cevap şıklara eşit dağılıyor. “Çoğu soruda cevap B” gibi bir kalıp yok; bu yüzden şık konumuna dayalı taktik öğretmeyiz.</li>
                <li>Soruyu belirleyen, sorulan öğe. Örneğin bir listeden eleman çıkaran sorular hep “…değildir” kalıbında geliyor.</li>
                <li>Yanlış şıklar çoğunlukla aynı maddeden ya da yakın maddelerden geliyor. Sayı sorularında yanlış seçenekler kanundaki başka sayılardan seçiliyor.</li>
                <li>Aynı madde nadiren tekrar soruluyor, aynı madde öbeği ise sık geliyor. Bu bilgiyi çalışma sırasını kurmak için kullanırız, tek soru tahmini için değil.</li>
              </ul>
              <figure class="spread">
                <figcaption>Geçmiş 340 HMGS sorusunda doğru şıkkın dağılımı</figcaption>
                <div class="spread-bars" role="img" aria-label="${ANSWER_SPREAD.map(([l, n]) => `${l} ${n}`).join(", ")}">
                  ${ANSWER_SPREAD.map(([l, n]) => `<div><span class="v">${n}</span><span class="bar" style="height:${(n / maxN) * 100}%"></span><span class="l">${l}</span></div>`).join("")}
                </div>
                <p class="note">Farklar şans eseri beklenen aralıkta kalıyor (ki-kare testi, %5 düzeyinde anlamlı değil).</p>
              </figure>
            </div>
          </div>
        </article>

        <article class="layer" id="katman-3">
          <div class="layer-head"><span class="ln">3</span><div><span class="eyebrow">Öğrenci</span><h2>Her cevabı birime ve tuzağa bağlarız</h2></div></div>
          <div class="layer-body prose">
            <p>Bir öğrenciye “Ticaret Hukuku'nda %60'tasın” demek eksik bilgidir. Aynı öğrenci süre sorularında hep yanılıyor, olumsuz köklü soruları ise yanlış okuyor olabilir. Bu yüzden ustalığı üç eksende izleriz.</p>
            <div class="trio">
              <div><h3>Konu ve birim</h3><p>Hangi madde, kazanım ya da konuda ne kadar hazır olduğun.</p></div>
              <div><h3>Soru kalıbı</h3><p>Olumsuz kökte, öncüllü sorularda ya da vaka sorularında nasıl performans gösterdiğin.</p></div>
              <div><h3>Tuzak türü</h3><p>Hangi yanlış şık türüne düştüğün: komşu maddedeki sayı, ters çevrilmiş kural, eklenmiş şart…</p></div>
            </div>
            <p>Ustalık tek bir sayı olarak değil, belirsizlik aralığıyla gösterilir. Az soru çözdüğün bir konuda aralık geniştir; veri yoksa “veri yok” yazar. Emin olduğunu söyleyip yanlış yaptığın sorular daha ağır sayılır, çünkü bunlar yanlış öğrenilmiş bilgiye işaret eder.</p>
            <div class="formula" aria-label="Çalışma planındaki ağırlığın hesabı">
              <span class="lhs"><b>Plandaki ağırlık</b><span class="op">=</span></span>
              <span class="term"><b>Sınavdaki ağırlık</b><small>o birim sınavda ne kadar soruluyor</small></span>
              <span class="op">×</span>
              <span class="term"><b>Senin zayıflığın</b><small>o birimde ne kadar eksiğin var</small></span>
            </div>
            <p>Plan her gün yeniden kurulur. Günlük soru sayını sen belirlersin. Yanlış yaptığın ya da unutmaya başladığın sorular aralıklı tekrarla geri gelir: doğru cevapladıkça aralık uzar, yanılınca kısalır.</p>
          </div>
        </article>

        <article class="layer" id="katman-4">
          <div class="layer-head"><span class="ln">4</span><div><span class="eyebrow">Üretim</span><h2>Yeni soruyu altı kontrolden geçiririz</h2></div></div>
          <div class="layer-body prose">
            <p>Yeni sorular, ikinci katmandaki ölçümlerden çıkan kurallarla yazılır: bir birim, sorulacak bir öğe, bir kalıp ve yanlış şıkların nasıl kurulacağı. Yapay zekâ yalnız taslak yazar. Taslak sırayla şu kontrollerden geçmeden öğrenciye ulaşmaz:</p>
            <ol class="checks">
              <li><span><b>Dayanak kontrolü.</b> Doğru cevabın dayandığı madde ya da kaynak, metninden alıntıyla gösterilir.</span></li>
              <li><span><b>Bağımsız çözüm.</b> Cevabı görmeyen ayrı bir model soruyu çözer. Farklı şıkka varırsa soru geri döner.</span></li>
              <li><span><b>Kalıp uyumu.</b> Soru, seçilen kalıba ve sınavın dil yapısına uyuyor mu?</span></li>
              <li><span><b>İpucu sızıntısı.</b> Doğru şık uzunluğundan, kelime seçiminden ya da konumundan belli oluyor mu? Doğru cevaplar şıklara eşit dağıtılır.</span></li>
              <li><span><b>Benzerlik eşiği.</b> Gerçek sınav sorularına fazla benzeyen taslak elenir. Kopya ya da az değiştirilmiş soru yayımlamayız.</span></li>
              <li><span><b>Uzman onayı.</b> Son karar alanında uzman bir kişinindir. Onaylanmayan soru yayına girmez.</span></li>
            </ol>
          </div>
        </article>

        <article class="layer" id="katman-5">
          <div class="layer-head"><span class="ln">5</span><div><span class="eyebrow">Öncelik</span><h2>Neye önce çalışılacağını sınarız</h2></div></div>
          <div class="layer-body prose">
            <p>Soru ağırlıkları ve yazar modeli birleşince her birim için bir öncelik puanı çıkar. Bu puanı kullanmadan önce geçmişte sınarız: yalnız eski oturumlara bakarak hesaplanan liste, bir sonraki gerçek sınavın sorularını ne kadar kapsıyordu?</p>
            <p>Listeyi iki basit yöntemle karşılaştırırız: yalnız alan ağırlıklarına bakmak ve geçen sınavda sorulanları tekrar etmek. Liste ikisini de geçmezse yayına girmez. Geçerse “bu listedeki birimler, geçmiş sınavlarda soruların şu kadarını kapsadı” biçiminde, yani <b>kapsama oranı</b> olarak sunulur.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="band" id="vaat">
      <div class="wrap">
        <div>
          <span class="eyebrow">Dürüstlük</span>
          <h2>Ne vaat etmiyoruz</h2>
          <p>Bir sistemin neyi yapamadığını söylemesi, yapabildiklerine güvenmenin ön şartıdır.</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#basla">Seviyeni Ölç</a></div>
        </div>
        <ul class="feature-list promise-list">
          <li><span><b>Çıkacak soruyu tahmin etmeyiz.</b> Öncelik listesi bir çalışma sırasıdır, soru listesi değildir.</span></li>
          <li><span><b>Şık kalıplarına dayanmayız.</b> Geçmiş sorularda doğru cevap şıklara eşit dağılıyor; “B'yi işaretle” türü taktik yoktur.</span></li>
          <li><span><b>Gerçek sınav sorusu yayımlamayız.</b> Geçmiş sorular yalnız iç analizde kullanılır.</span></li>
          <li><span><b>Uydurma puan göstermeyiz.</b> Ustalık belirsizlik aralığıyla gösterilir; veri yoksa “veri yok” yazar.</span></li>
          <li><span><b>Uzman onayı olmadan soru yayımlamayız.</b> Yapay zekâ taslak yazar, karar uzmanındır.</span></li>
        </ul>
      </div>
    </section>`;
  }

  // ---------- Öğrenme alanı ----------
  let session = null; // { kind: 'tani'|'coz'|'deneme', ... }
  let resetArmed = false;

  const TABS = [["panel", "Panel"], ["tani", "Seviye tespiti"], ["coz", "Soru çöz"], ["plan", "Çalışma planı"], ["deneme", "Kişisel deneme"], ["hata", "Hata defteri"], ["rapor", "Haftalık rapor"]];

  function renderApp() {
    const examId = store.exam, data = store.data[examId], d = derive(examId, data);
    let body = "";
    if (store.tab === "panel") body = viewPanel(d, data);
    else if (store.tab === "tani") body = viewTani(d, data);
    else if (store.tab === "coz") body = viewCoz(d, data);
    else if (store.tab === "plan") body = viewPlan(d, data);
    else if (store.tab === "hata") body = viewHata(d, data);
    else if (store.tab === "rapor") body = viewRapor(d, data);
    else body = viewDeneme(d, data);
    $app.innerHTML = `
    <div class="app-head"><div class="wrap">
      <div><span class="eyebrow">Öğrenme alanı</span><h1>${esc(d.exam.name)}</h1></div>
      <p>Bu alan HMGS için geliştirdiğimiz çalışma motorunun aynısıyla çalışır. İlerlemen yalnız bu tarayıcıda saklanır.</p>
      <div class="seg" role="group" aria-label="Sınav seç">${Object.entries(A.exams).sort((x, y) => examOn(y[0]) - examOn(x[0])).map(([id, x]) => examOn(id) ? `<button type="button" data-act="exam" data-id="${id}" aria-pressed="${id === examId}">${x.short}</button>` : `<button type="button" class="is-off" disabled title="Yakında">${x.short}</button>`).join("")}</div>
      <div class="tabs" role="tablist">${TABS.map(([id, l]) => `<button type="button" role="tab" data-act="tab" data-id="${id}" aria-selected="${store.tab === id}">${l}</button>`).join("")}</div>
    </div></div>
    <div class="wrap app-body">
      ${data.sample ? `<div class="sample-bar"><span>Örnek öğrenci verisi gösteriliyor. Rakamlar demo amaçlıdır.</span><button class="btn btn-small" data-act="own">Kendi verimle başla</button></div>` : ""}
      ${body}
    </div>`;
    afterAppRender(examId, data, d);
  }

  function viewPanel(d, data) {
    const act = nextAction(d, data);
    const diagCount = data.attempts.filter((a) => a.mode === "tani").length;
    const cd = P.countdown(store.exam);
    const { list: badges } = P.syncBadges(store.exam, data, d);
    return `
    <div class="next-card"><span class="eyebrow">Bugünün planı</span><h2>${esc(act.title)}</h2><p class="muted">${esc(act.text)}</p>
      <div><button class="btn btn-primary" data-act="tab" data-id="${act.tab}">${esc(act.btn)}</button></div></div>
    ${cd ? countdownCard(cd, d, data) : todayGoalCard(d, data)}
    ${d.exam.game ? gameStrip(gameStats(data)) : ""}
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
    ${scoreBoard(data)}
    ${badgeShelf(badges)}
    ${data.sample ? "" : `<div><button class="btn btn-outline btn-small" data-act="reset">${resetArmed ? "Emin misin? Tüm ilerleme silinecek" : "İlerlememi sıfırla"}</button></div>`}`;
  }

  // ---------- Geri sayım ve günlük hedef ----------
  const EXAM_WEEK_REVIEW = 0.7; // sınav haftasında boş kapasitenin tekrara ayrılan payı
  function todayPlan(d, data, cd) {
    const sched = E.buildSchedule(Object.values(d.due), startOfDay(Date.now()), data.budget);
    const day = sched.days[0];
    const extra = cd && !cd.pending && cd.examWeek && cd.days > 0 ? Math.round(day.spare * EXAM_WEEK_REVIEW) : 0;
    return { total: data.budget, review: day.planned, extra, fresh: day.spare - extra, done: P.todayCount(data.attempts) };
  }
  function goalLine(t) {
    const parts = [`${t.review} tekrar`, ...(t.extra ? [`${t.extra} ek tekrar`] : []), `${t.fresh} yeni`].join(" + ");
    const w = Math.min(100, (t.done / t.total) * 100);
    return `<div class="cd-goal"><div class="cd-goal-top"><span>Bugünkü hedef: <b>${t.total} soru</b> <span class="muted">(${parts})</span></span><span class="num">${t.done >= t.total ? "Tamamlandı" : `Bugün ${t.done}/${t.total}`}</span></div>
      <div class="progress" role="progressbar" aria-label="Bugünkü hedef" aria-valuemin="0" aria-valuemax="${t.total}" aria-valuenow="${Math.min(t.done, t.total)}"><i style="width:${w}%"></i></div></div>`;
  }
  function todayGoalCard(d, data) {
    return `<div class="panel-box cd-card cd-plain">${goalLine(todayPlan(d, data, null))}<p class="note">Günlük hedefi Çalışma planı sekmesinden değiştirebilirsin.</p></div>`;
  }
  function cdHead(cd, short) {
    if (cd.pending) return { num: "?", h: "Tarih bekleniyor", sub: `Bir sonraki ${short} oturumunun tarihi henüz resmî olarak açıklanmadı (ÖSYM takvimi açıklanınca güncellenecek).${cd.last ? ` Son oturum: ${cd.last.name}, ${P.fmtDate(new Date(cd.last.date + "T12:00").getTime())}.` : ""}` };
    return { num: cd.days, h: cd.days === 0 ? "Sınav bugün" : `Sınava ${cd.days} gün`, sub: `${cd.name} · ${P.fmtDate(cd.date)}${cd.time ? `, saat ${cd.time}` : ""}` };
  }
  const srcLine = (cd) => `<small class="cd-src">Kaynak: <a href="${esc(cd.src.url)}" target="_blank" rel="noopener">${esc(cd.src.label)}</a> · kontrol ${esc(cd.src.checked.split("-").reverse().join("."))}</small>`;
  function countdownCard(cd, d, data) {
    const h = cdHead(cd, d.exam.short), t = todayPlan(d, data, cd);
    return `<section class="cd-card ${cd.examWeek ? "is-week" : ""}" aria-label="Sınav geri sayımı">
      <div class="cd-num ${cd.pending ? "is-pending" : ""}"><b class="num">${h.num}</b><span>${cd.pending ? "tarih yok" : "gün"}</span></div>
      <div class="cd-body">
        <span class="eyebrow">Sınav geri sayımı</span>
        <h2>${esc(h.h)}</h2>
        <p class="muted">${esc(h.sub)}</p>
        ${goalLine(t)}
        ${cd.pending ? "" : cd.examWeek
          ? `<p class="cd-week"><b>Sınav haftası modu açık.</b> Sınava ${P.EXAM_WEEK_DAYS} gün ya da daha az kaldığı için plan tekrar ağırlıklı çalışıyor: yeni konu payı azaldı, boş kapasitenin %${pct(EXAM_WEEK_REVIEW)}'i zayıf alanlarına ve unutmaya başladığın sorulara ayrıldı.</p>`
          : `<p class="note">Bu hedefle sınava kadar yaklaşık ${(cd.days * data.budget).toLocaleString("tr-TR")} soru çözersin. Sınava ${P.EXAM_WEEK_DAYS} gün kalınca plan kendiliğinden tekrar ağırlıklı moda geçer.</p>`}
        ${srcLine(cd)}
      </div></section>`;
  }

  // ---------- Skor tablosu (yalnız kendi rekorların) ----------
  function scoreBoard(data) {
    const r = P.records(data);
    const wk = P.weeks(data.attempts, 8);
    const max = Math.max(1, ...wk.map((w) => w.n));
    const short = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
    const [cur, prev] = wk;
    const rate = (w) => (w.n ? pct(w.k / w.n) : null);
    const delta = (a, b, unit = "") => {
      if (a === null || b === null) return `<span class="muted">–</span>`;
      const x = a - b;
      return x === 0 ? `<span class="muted">aynı</span>` : `<span class="${x > 0 ? "up" : "down"}">${x > 0 ? "+" : "−"}${Math.abs(x)}${unit}</span>`;
    };
    const row = (label, a, b, unit = "", fmt = (v) => v) => `<tr><td>${label}</td><td class="num">${b === null ? "–" : fmt(b)}</td><td class="num"><b>${a === null ? "–" : fmt(a)}</b></td><td class="num">${delta(a, b, unit)}</td></tr>`;
    return `<div class="panel-box">
      <header><h3>Skor tablon</h3><span class="muted" style="font-size:13px">Yalnız senin rekorların</span></header>
      <div class="tiles tiles-3">
        <div class="tile"><b>${r.bestDay ? r.bestDay.k : "–"}</b><span>En yüksek günlük doğru${r.bestDay ? ` · ${esc(short.format(new Date(r.bestDay.t)))}` : ""}</span></div>
        <div class="tile"><b>${r.longest ? `${r.longest} gün` : "–"}</b><span>En uzun seri${r.current ? ` · şu an ${r.current} gün` : ""}</span></div>
        <div class="tile"><b>${r.bestDeneme ? `%${pct(r.bestDeneme.k / r.bestDeneme.n)}` : "–"}</b><span>En iyi deneme${r.bestDeneme ? ` · ${r.bestDeneme.k}/${r.bestDeneme.n} doğru` : ""}</span></div>
      </div>
      <div class="score-grid">
        <figure class="wk">
          <figcaption>Haftalık gelişim <span class="muted">(son 8 hafta, çözülen ve doğru)</span></figcaption>
          <div class="wk-bars" role="img" aria-label="${wk.slice().reverse().map((w) => `${short.format(new Date(w.from))} haftası: ${w.n} soru, ${w.k} doğru`).join("; ")}">
            ${wk.slice().reverse().map((w, i, arr) => `<div class="wk-col"><span class="wk-v num">${w.n || ""}</span><span class="wk-bar" style="height:${(w.n / max) * 100}%"><i style="height:${w.n ? (w.k / w.n) * 100 : 0}%"></i></span><span class="wk-l">${i === arr.length - 1 ? "Bu hafta" : esc(short.format(new Date(w.from)))}</span></div>`).join("")}
          </div>
          <div class="legend"><span><i style="background:var(--brand-soft);box-shadow:inset 0 0 0 1px var(--brand)"></i>Çözülen</span><span><i style="background:var(--brand)"></i>Doğru</span></div>
        </figure>
        <div class="vs">
          <h4>Geçen haftaki sen</h4>
          <div class="table-wrap"><table><thead><tr><th></th><th class="num">Geçen hafta</th><th class="num">Bu hafta</th><th class="num">Fark</th></tr></thead><tbody>
            ${row("Çözülen soru", cur.n, prev.n)}
            ${row("Doğru oranı", rate(cur), rate(prev), " puan", (v) => `%${v}`)}
            ${row("Çalışılan gün", cur.days, prev.days)}
          </tbody></table></div>
          <p class="note">Haftalar bugünle biten 7 günlük dilimlerdir.</p>
        </div>
      </div>
      <p class="league"><b>Arkadaşlarınla lig:</b> hesaplar açıldığında. Şimdilik yalnız kendinle yarışıyorsun; başka öğrencilerin adı ya da puanı gösterilmez.</p>
    </div>`;
  }

  // ---------- Rozet rafı ----------
  function badgeShelf(list) {
    const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
    const on = list.filter((b) => b.ok).length;
    return `<div class="panel-box">
      <header><h3>Rozetler</h3><span class="muted num" style="font-size:13px">${on}/${list.length} kazanıldı</span></header>
      <ul class="badges">${list.map((b) => `<li class="badge ${b.ok ? "is-on" : "is-off"}">
        <span class="badge-icon" aria-hidden="true">${esc(b.icon)}</span>
        <span class="badge-text"><b>${esc(b.title)}</b><small>${b.ok ? `Kazanıldı${b.t ? ` · ${esc(fmt.format(new Date(b.t)))}` : ""}` : esc(b.how)}</small>${b.ok ? "" : `<small class="badge-prog num">${esc(b.prog)}</small>`}</span>
        <span class="sr-only">${b.ok ? "kazanıldı" : "henüz kazanılmadı"}</span></li>`).join("")}</ul>
      <p class="note">Rozetler yalnız bu tarayıcıdaki çalışmandan hesaplanır.</p>
    </div>`;
  }

  function gameStrip(g) {
    return `<div class="game-strip">
      <div class="game-lvl"><span>Seviye</span><b class="num">${g.level}</b></div>
      <div class="game-xp"><div class="game-xp-top"><b class="num">${g.xp} puan</b><span class="muted num">Sonraki seviyeye ${100 - g.into} puan</span></div><div class="progress"><i style="width:${g.into}%"></i></div></div>
      <div class="game-streak"><b class="num">${g.streak}</b><span>doğru seri</span></div></div>`;
  }

  // Dinleme soruları: metin tarayıcının sesiyle okunur; ses yoksa döküm açık gelir.
  const canSpeak = "speechSynthesis" in window;
  function speak({ lang, text }) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find((x) => x.lang.replace("_", "-").startsWith(lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function sayBox(s) {
    return `<div class="say">${canSpeak ? `<button type="button" class="btn btn-outline" data-act="say">▶ Dinle</button>` : ""}
      <details ${canSpeak ? "" : "open"}><summary>Metni göster</summary><p lang="${esc(s.lang)}">${esc(s.text)}</p></details></div>`;
  }

  function questionView(q, { mode, progress, showReason }) {
    const it = q.item;
    const ex = mode === "deneme";
    const chips = `<span class="chip chip-line">${esc(it.alan)}</span>${showReason ? `<span class="chip chip-brand">${esc(REASON_TXT[q.reason] || "")}</span>` : ""}`;
    const opts = it.o.map((o, i) => {
      let cls = "";
      if (q.done && !ex) { if (i === it.a) cls = "correct"; else if (i === q.chosen) cls = "wrong"; }
      return `<button type="button" class="opt ${cls}" data-act="choose" data-i="${i}" aria-pressed="${q.chosen === i}" ${q.done || (!ex && !q.conf) ? "disabled" : ""}><span class="letter">${LETTERS[i]}</span><span>${esc(o)}</span></button>`;
    }).join("");
    const conf = ex ? "" : `<div class="conf" role="group" aria-label="Ne kadar eminsin"><span>Cevaplamadan önce: ne kadar eminsin?</span>${[[1, "Az"], [2, "Orta"], [3, "Çok"]].map(([v, l]) => `<button type="button" data-act="conf" data-v="${v}" aria-pressed="${q.conf === v}" ${q.done ? "disabled" : ""}>${l}</button>`).join("")}</div>`;
    let after = "";
    if (q.done && !ex) {
      const ok = q.correct;
      const reward = q.points ? `<span class="xp-pop">+${q.points} puan${q.streak >= 3 ? ` · ${q.streak} doğru seri` : ""}</span>` : "";
      after = `<div class="explain ${ok ? "ok" : "no"}"><strong>${q.skipped ? "Boş bıraktın" : ok ? "Doğru" : "Yanlış"}. Doğru cevap ${LETTERS[it.a]}. ${reward}</strong><span>${esc(it.e)}</span></div>
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
      ${it.say ? sayBox(it.say) : ""}<p class="q-text">${esc(it.q)}</p>${it.code ? `<pre class="q-code"><code>${esc(it.code)}</code></pre>` : ""}${conf}<div class="opts">${opts}</div>${after}<div class="q-actions">${actions}</div></div>`;
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
    const base = E.selectNext({ mode: "pratik", items: d.exam.items, recent: d.recent, answered: d.answered, due: d.due, mastery: d.mastery, attemptsByAlan: d.attemptsByAlan, sh: d.sh, now: Date.now() });
    // Sınav haftası: tekrar ve zayıf alan seçimi motorda kalır; yeni soru yerine 10 seçimin 7'sinde
    // tekrar zamanı en yakın (unutulmaya en yakın) çözülmüş soru öne alınır.
    const cd = P.countdown(store.exam);
    if (!base || !cd || cd.pending || !cd.examWeek || base.reason === "tekrar" || base.reason === "zayif") return base;
    if (P.todayCount(store.data[store.exam].attempts) % 10 >= Math.round(EXAM_WEEK_REVIEW * 10)) return base;
    const recent = new Set(d.recent.slice(0, 10));
    const bank = new Map(d.exam.items.map((i) => [i.id, i]));
    const soon = Object.entries(d.due).filter(([id]) => bank.has(id) && !recent.has(id)).sort((a, b) => a[1] - b[1]);
    return soon.length ? { item: bank.get(soon[0][0]), reason: "sinav" } : base;
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
    const cd = P.countdown(store.exam);
    const week = cd && !cd.pending && cd.examWeek;
    const weakest = ranked.filter((r) => r.mean !== null).sort((x, y) => x.mean - y.mean)[0];
    const dayCell = (day, i) => {
      const examDay = cd && !cd.pending && i === cd.days;
      const after = cd && !cd.pending && i > cd.days;
      const extra = week && !after ? Math.round(day.spare * EXAM_WEEK_REVIEW) : 0;
      const fresh = day.spare - extra;
      return `<div class="day ${i === 0 ? "today" : ""} ${examDay ? "exam-day" : ""}"><b>${i === 0 ? "Bugün" : esc(fmt.format(new Date(startOfDay(Date.now()) + i * E.DAY)))}</b>
        ${examDay ? `<span class="x">Sınav günü</span>` : after ? `<span class="muted">Sınav sonrası</span>` : `<span class="r num">Tekrar ${day.planned}</span>${extra > 0 ? `<span class="p num">Ek tekrar ${extra}${weakest ? ` · ${esc(weakest.alan)}` : ""}</span>` : ""}${fresh > 0 ? `<span class="n num">Yeni ${fresh} · ${esc(seq[i])}</span>` : ""}`}</div>`;
    };
    return `${week ? `<div class="cd-week-box"><b>Sınav haftası modu: sınava ${cd.days} gün kaldı.</b> Plan tekrar ağırlıklı moda geçti. Her gün önce tekrarlar yerleşir; kalan kapasitenin %${pct(EXAM_WEEK_REVIEW)}'i zayıf alanına ve unutmaya başladığın sorulara (ek tekrar), yalnız %${100 - pct(EXAM_WEEK_REVIEW)}'i yeni konuya ayrılır.</div>` : ""}
    <div class="panel-box">
      <header><h3>Günlük soru bütçen</h3>
        <label class="inline-field" for="budget">Günde <input id="budget" type="number" min="5" max="200" step="1" value="${budget}" inputmode="numeric"> soru</label></header>
      <p class="muted">Tekrarlar önce yerleşir. Bütçeyi aşan tekrar ertesi güne kayar, kalan kapasite öncelikli alanlara ayrılır.</p>
    </div>
    <div class="grid-2">
      <div class="panel-box"><h3>14 günlük plan</h3>
        <div class="days">${sched.days.map(dayCell).join("")}</div>
        ${cd && !cd.pending && !week ? `<p class="note">Sınava ${cd.days} gün var. ${P.EXAM_WEEK_DAYS} gün kalınca plan kendiliğinden tekrar ağırlıklı moda geçer.</p>` : ""}
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

  // ---------- Hata defteri ----------
  // Bir soru, son denemesi yanlış ya da boşsa defterdedir; doğru çözülünce defterden çıkar.
  const HATA_GROUPS = [["kalip", "Soru kalıbı"], ["neden", "Hata nedeni"], ["alan", "Alan"]];
  // Öğrenci seçmediyse: hataların en az yarısında kalıp bulunuyorsa kalıba, yoksa alana göre grupla.
  function hataBy(open) {
    if (HATA_GROUPS.some(([g]) => g === store.hataBy)) return store.hataBy;
    const withPattern = open.filter((e) => P.patternOf(e.item).id !== "diger").length;
    return withPattern * 2 >= open.length ? "kalip" : "alan";
  }
  function viewHata(d, data) {
    if (session && session.kind === "hata") {
      if (session.finished) {
        const ok = session.results.filter(Boolean).length;
        return `<div class="panel-box"><span class="eyebrow">Tekrar tamamlandı</span><h3>${ok}/${session.results.length} soruyu bu kez doğru çözdün</h3>
          <p class="muted">Doğru çözdüğün sorular hata defterinden çıktı. Yanlış kalanlar aralıklı tekrarla yarın yeniden gelir.</p>
          <div class="q-actions"><button class="btn btn-primary" data-act="hata-back">Hata defterine dön</button><button class="btn btn-outline" data-act="tab" data-id="panel">Panele dön</button></div></div>`;
      }
      return questionView(session.q, { mode: "coz", progress: [session.idx + 1, session.queue.length], showReason: true });
    }
    const eb = P.errorBook(d.exam, data.attempts);
    if (!eb.open.length) {
      return `<div class="panel-box"><h3>Hata defterin boş</h3>
        <p class="muted">${eb.everWrong ? `Şimdiye kadar yanlış yaptığın ${eb.everWrong} sorunun hepsini sonradan doğru çözdün.` : "Yanlış yaptığın sorular burada toplanır. Her yanlıştan sonra nedenini işaretlersen defter hata türüne göre de gruplanır."}</p>
        <div><button class="btn btn-primary" data-act="tab" data-id="coz">Soru çöz</button></div></div>`;
    }
    const by = hataBy(eb.open);
    const groups = P.groupErrors(eb.open, by);
    return `<div class="panel-box">
      <header><h3>Hata defteri <span class="muted num" style="font-weight:400;font-size:14px">${eb.open.length} açık · ${eb.cleared} temizlendi</span></h3>
        <button class="btn btn-primary btn-small" data-act="hata-all">Hepsini tekrar çöz</button></header>
      <div class="seg seg-light" role="group" aria-label="Grupla">${HATA_GROUPS.map(([g, l]) => `<button type="button" data-act="hata-by" data-id="${g}" aria-pressed="${g === by}">${l}</button>`).join("")}</div>
      <p class="note">${by === "kalip" ? "Kalıp, soru kökünden bulunur (ör. “…değildir” ile biten olumsuz kök). Sorularda henüz uzman etiketli tuzak türü yok; etiketler geldikçe bu gruplama tuzak türüne göre yapılacak." : by === "neden" ? "Neden, yanlış cevaptan sonra senin işaretlediğin seçimdir." : "Sorunun ait olduğu sınav alanı."}</p>
      <div class="hata-sum">${groups.map(([k, list]) => `<span class="chip chip-line">${esc(k)}: <b class="num">${list.length}</b> yanlış</span>`).join("")}</div>
    </div>
    ${groups.map(([k, list], gi) => `<section class="panel-box hata-group">
      <header><h3>${esc(k)} <span class="muted num" style="font-weight:400">· ${list.length} yanlış</span></h3><button class="btn btn-outline btn-small" data-act="hata-group" data-i="${gi}">Bu grubu tekrar çöz</button></header>
      <ul class="hata-list">${list.map((e) => `<li>
        <div class="hata-q">${esc(e.item.q.length > 220 ? e.item.q.slice(0, 220) + "…" : e.item.q)}</div>
        <div class="hata-meta"><span class="chip chip-line">${esc(e.item.alan)}</span>${e.wrong > 1 ? `<span class="chip chip-soon">${e.wrong} kez yanlış</span>` : ""}${e.skipped ? `<span class="chip chip-line">Boş bırakıldı</span>` : e.chosen !== null ? `<span class="chip chip-line">Son cevabın: ${LETTERS[e.chosen]}</span>` : ""}${by !== "neden" && e.why ? `<span class="chip chip-brand">${esc(e.why)}</span>` : ""}
          <button class="btn btn-small btn-outline" data-act="hata-one" data-id="${esc(e.item.id)}">Tekrar çöz</button></div></li>`).join("")}</ul>
    </section>`).join("")}`;
  }

  function startHata(items) {
    if (!items.length) return;
    session = { kind: "hata", queue: items, idx: 0, results: [], finished: false, q: newQ({ item: items[0], reason: "hata" }) };
    store.tab = "hata"; save(); renderApp(); window.scrollTo({ top: 0 });
  }

  // ---------- Haftalık rapor (veli / kurum) ----------
  function viewRapor(d, data) {
    const w = P.weekReport(data);
    const cd = P.countdown(store.exam);
    const all = P.syncBadges(store.exam, data, d).list;
    const earnedWeek = all.filter((b) => w.badges.includes(b.id));
    const earnedAll = all.filter((b) => b.ok);
    const f = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });
    const range = `${f.format(new Date(w.cur.from))} – ${f.format(new Date(w.cur.to - 1))}`;
    const rate = w.cur.n ? `%${pct(w.cur.k / w.cur.n)}` : "–";
    const eb = P.errorBook(d.exam, data.attempts);
    const st = P.streaks(data.attempts);
    let cdText = "";
    if (cd) { const h = cdHead(cd, d.exam.short); cdText = `<div class="rp-row"><span>Sınav</span><span><b>${esc(h.h)}</b><br><small class="muted">${esc(h.sub)}</small></span></div>`; }
    return `<article class="panel-box report" aria-label="Haftalık rapor">
      <header class="rp-head"><div><span class="eyebrow">Haftalık rapor · veli ve kurum için</span><h2>${esc(d.exam.name)}</h2><p class="muted">${esc(range)} (son 7 gün)</p></div></header>
      <div class="tiles">
        <div class="tile"><b>${w.cur.days}/7</b><span>Çalışılan gün</span></div>
        <div class="tile"><b>${w.cur.n}</b><span>Çözülen soru</span></div>
        <div class="tile"><b>${rate}</b><span>Doğru oranı</span></div>
        <div class="tile"><b>${w.met}/7</b><span>Günlük hedefin (${data.budget} soru) tuttuğu gün</span></div>
      </div>
      <div class="rp-rows">
        ${cdText}
        <div class="rp-row"><span>Geçen haftaya göre</span><span>${w.prev.n ? `${w.cur.n - w.prev.n >= 0 ? "+" : "−"}${Math.abs(w.cur.n - w.prev.n)} soru (geçen hafta ${w.prev.n})` : "Geçen hafta çalışma yok"}</span></div>
        <div class="rp-row"><span>Seri</span><span>${st.current ? `${st.current} gündür aralıksız` : "Şu an seri yok"} · en uzun ${st.longest} gün</span></div>
        <div class="rp-row"><span>Deneme</span><span>${w.denemeler.length ? w.denemeler.map((x) => `${x.full ? "Tam" : "Kısa"} deneme ${x.k}/${x.n}`).join(", ") : "Bu hafta deneme yok"}</span></div>
        <div class="rp-row"><span>Hata defteri</span><span>${eb.open.length} açık soru · ${eb.cleared} soru sonradan doğru çözüldü</span></div>
        <div class="rp-row"><span>Rozetler</span><span>${earnedWeek.length ? `Bu hafta: ${earnedWeek.map((b) => esc(b.title)).join(", ")}` : "Bu hafta yeni rozet yok"} · toplam ${earnedAll.length}/${all.length}</span></div>
      </div>
      <h3>${d.exam.levels ? "Seviye ustalıkları" : "Alan ustalıkları"} ${levelChip(d)}</h3>
      ${masteryRows(d)}
      <p class="note">Ustalık oranları tahmindir ve belirsizlik aralığıyla gösterilir; sınav puanı tahmini değildir. Bu rapor yalnız bu tarayıcıdaki çalışmadan hesaplanır, hiçbir yere gönderilmez.</p>
    </article>`;
  }

  // ---------- Kişisel deneme ----------
  // Süre, gerçek sınavın soru başına süresinden çıkar (ör. YDS: 180 dk / 80 soru). Format yoksa süre tutulmaz.
  function denemePlan(d, full) {
    const fmt = A.examCalendar?.format?.[store.exam];
    const n = full ? Math.min(d.exam.items.length, fmt ? fmt.questions : d.exam.items.length) : Math.min(EXAM_SIZE, d.exam.items.length);
    const quota = quotaTable(d, n);
    const total = Object.values(quota).reduce((a, b) => a + b, 0);
    const sec = fmt ? Math.ceil((total * fmt.minutes * 60) / fmt.questions / 60) * 60 : 0;
    return { quota, total, sec, fmt };
  }
  const mmss = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return `${h ? h + ":" + String(m).padStart(2, "0") : m}:${String(x).padStart(2, "0")}`; };

  function viewDeneme(d, data) {
    if (session && session.kind === "deneme") {
      if (session.finished) return denemeResult(session, d);
      const left = session.deadline ? (session.deadline - Date.now()) / 1000 : null;
      const timer = left !== null ? `<div class="dn-timer ${left < 60 ? "is-low" : ""}"><span>${session.full ? "Tam deneme" : "Kısa deneme"} · kalan süre</span><b class="num" id="dn-left">${mmss(left)}</b></div>` : "";
      return timer + questionView(session.q, { mode: "deneme", progress: [session.idx + 1, session.items.length] });
    }
    const short = denemePlan(d, false), full = denemePlan(d, true);
    const past = (data.denemeler || []).slice(-5).reverse();
    const dfmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    return `<div class="grid-2">
      <div class="panel-box"><h3>Kişisel deneme</h3>
        <p class="muted">Sorular sınavdaki alan paylarına göre dağıtılır. Cevaplar ve açıklamalar sonda gösterilir; sonunda alan alan rapor ve zayıf alanların çıkar.</p>
        ${full.fmt ? `<p class="note">Gerçek sınav: ${esc(full.fmt.label)} (<a href="${esc(full.fmt.src)}" target="_blank" rel="noopener">ÖSYM kılavuzu</a>). Deneme aynı soru başına süreyle çalışır; süre bitince deneme kendiliğinden biter.</p>` : `<p class="note">Bu programda resmî sınav süresi olmadığı için deneme süresizdir.</p>`}
        <div class="table-wrap"><table><thead><tr><th>Alan</th><th class="num">Sınavdaki pay</th><th class="num">Kısa</th><th class="num">Tam</th></tr></thead><tbody>
          ${Object.keys(d.sh).map((a) => `<tr><td>${esc(a)}</td><td class="num">%${pct(d.sh[a])}</td><td class="num">${short.quota[a] || 0}</td><td class="num">${full.quota[a] || 0}</td></tr>`).join("")}
          <tr><td><b>Toplam</b></td><td></td><td class="num"><b>${short.total}</b></td><td class="num"><b>${full.total}</b></td></tr></tbody></table></div>
        <div class="dn-choices">
          <button class="btn btn-primary" data-act="start-deneme" data-full="1">Tam denemeyi başlat · ${full.total} soru${full.sec ? `, ${full.sec / 60} dk` : ""}</button>
          <button class="btn btn-outline" data-act="start-deneme" data-full="0">Kısa deneme · ${short.total} soru${short.sec ? `, ${short.sec / 60} dk` : ""}</button>
        </div>
        ${full.fmt && full.total < full.fmt.questions ? `<p class="note">Demo soru bankası küçük olduğu için tam deneme bankadaki ${full.total} soruyla yapılır; gerçek sınav ${full.fmt.questions} sorudur. Alan dağılımı ve soru başına süre gerçek sınavla aynıdır.</p>` : ""}
      </div>
      <div class="panel-box"><h3>Son denemelerin</h3>
        ${past.length ? `<div class="table-wrap"><table><thead><tr><th>Tarih</th><th>Tür</th><th class="num">Doğru</th><th class="num">Süre</th></tr></thead><tbody>
          ${past.map((x) => `<tr><td>${esc(dfmt.format(new Date(x.t)))}</td><td>${x.full ? "Tam" : "Kısa"}</td><td class="num">${x.k}/${x.n}</td><td class="num">${x.sec ? mmss(x.used) + " / " + mmss(x.sec) : mmss(x.used)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Henüz deneme çözmedin.</p>`}
        <h3>Deneme soruları nereden geliyor?</h3>
        <p class="muted">Gerçek üründe deneme soruları, sınavın alan dağılımına ve senin zayıf konularına göre yapay zekâ ile taslak olarak hazırlanır. Her taslak, öğrenciye gitmeden önce alanında uzman biri tarafından kontrol edilir.</p>
        <p class="muted">Denemeler hangi soruların çıkacağını tahmin etmez. Amaç, gerçek sınavla aynı dağılımda kendini ölçmendir. Bu demoda sorular örnek soru bankasından seçilir.</p></div>
    </div>`;
  }

  function denemeResult(s, d) {
    const n = s.items.length;
    const k = s.answers.filter((a, i) => a !== null && a === s.items[i].a).length;
    const blank = n - s.answers.filter((a) => a !== null).length;
    const [lo, hi] = E.wilson(k, n);
    const byArea = {};
    s.items.forEach((it, i) => {
      const r = byArea[it.alan] = byArea[it.alan] || { k: 0, w: 0, b: 0, n: 0 };
      r.n++; const a = s.answers[i];
      if (a === undefined || a === null) r.b++; else if (a === it.a) r.k++; else r.w++;
    });
    const rows = Object.keys(d.sh).filter((a) => byArea[a]).map((a) => [a, byArea[a]]);
    const weak = rows.filter(([, r]) => r.k / r.n < E.WEAK_MEAN).sort((x, y) => x[1].k / x[1].n - y[1].k / y[1].n);
    return `<div class="panel-box">
      <span class="eyebrow">${s.full ? "Tam deneme" : "Kısa deneme"} sonucu${s.timedOut ? " · süre doldu" : ""}</span>
      <div class="result-head num"><div><b>${k}</b> doğru</div><div><b>${n - k - blank}</b> yanlış</div><div><b>${blank}</b> boş</div>${s.limitSec ? `<div><b>${mmss(s.used)}</b> / ${mmss(s.limitSec)}</div>` : ""}</div>
      <p class="muted">Doğru oranın %${pct(k / n)}. ${n} soruluk bir denemede bu oranın %95 güven aralığı %${pct(lo)} ile %${pct(hi)} arasıdır. Soru sayısı arttıkça aralık daralır. Bu sonuçtan sınav puanı tahmini yapmıyoruz.</p>
      <h3>Alan alan rapor</h3>
      <div class="table-wrap"><table><thead><tr><th>Alan</th><th class="num">Doğru</th><th class="num">Yanlış</th><th class="num">Boş</th><th class="num">Oran</th></tr></thead><tbody>
        ${rows.map(([a, r]) => `<tr class="${r.k / r.n < E.WEAK_MEAN ? "row-weak" : ""}"><td>${esc(a)}</td><td class="num">${r.k}</td><td class="num">${r.w}</td><td class="num">${r.b}</td><td class="num">%${pct(r.k / r.n)}</td></tr>`).join("")}</tbody></table></div>
      ${weak.length ? `<div class="weak-list"><h3>Zayıf alanların</h3><p class="muted">Bu denemede %60'ın altında kaldığın alanlar. Alan başına soru az olduğu için tek denemeye göre değil, alan ustalığıyla birlikte değerlendir.</p>
        <ul>${weak.map(([a, r]) => `<li><span><b>${esc(a)}</b> <span class="muted num">${r.k}/${r.n} doğru</span></span><button class="btn btn-small btn-outline" data-act="tab" data-id="coz">Soru çöz</button></li>`).join("")}</ul></div>`
        : `<p class="cd-week">Bu denemede %60'ın altında kaldığın alan yok.</p>`}
      <details class="how"><summary>Cevap anahtarı ve açıklamalar</summary><ul>
        ${s.items.map((it, i) => `<li><b>${i + 1}. ${esc(it.alan)}</b>: senin cevabın ${s.answers[i] === null || s.answers[i] === undefined ? "boş" : LETTERS[s.answers[i]]}, doğru cevap ${LETTERS[it.a]}. ${esc(it.e)}</li>`).join("")}
      </ul></details>
      <div class="q-actions"><button class="btn btn-primary" data-act="tab" data-id="panel">Panele dön</button><button class="btn btn-outline" data-act="tab" data-id="hata">Hata defterine git</button><button class="btn btn-outline" data-act="start-deneme" data-full="${s.full ? 1 : 0}">Yeni deneme</button></div>
    </div>`;
  }

  function finishDeneme(timedOut) {
    const s = session, data = store.data[store.exam];
    s.finished = true; s.timedOut = !!timedOut;
    s.used = Math.round((Date.now() - s.start) / 1000);
    if (s.limitSec) s.used = Math.min(s.used, s.limitSec);
    const n = s.items.length, k = s.answers.filter((a, i) => a !== null && a === s.items[i].a).length;
    data.denemeler = data.denemeler || [];
    data.denemeler.push({ t: Date.now(), n, k, blank: n - s.answers.filter((a) => a !== null).length, full: s.full, sec: s.limitSec, used: s.used });
    save();
  }

  let denemeTick = null;
  function tickDeneme() {
    clearInterval(denemeTick);
    denemeTick = setInterval(() => {
      if (!session || session.kind !== "deneme" || session.finished || !session.deadline) { clearInterval(denemeTick); return; }
      const left = (session.deadline - Date.now()) / 1000;
      const el = document.getElementById("dn-left");
      if (el) { el.textContent = mmss(left); el.parentElement.classList.toggle("is-low", left < 60); }
      if (left <= 0) {
        clearInterval(denemeTick);
        finishDeneme(true);
        if (route().view === "app" && store.tab === "deneme") { renderApp(); window.scrollTo({ top: 0 }); }
      }
    }, 1000);
  }

  function record(item, correct, conf, skipped, mode, ch) {
    const data = store.data[store.exam];
    const t = Date.now() + Math.random();
    data.attempts.push({ id: item.id, alan: item.alan, correct, conf, skipped, mode, t, ...(ch !== null && ch !== undefined ? { ch } : {}) });
    save();
    return t;
  }

  // ---------- Rozet kutlaması ve Mac ipuçları ----------
  const solving = () => !!(session && !session.finished && (session.kind !== "coz" || store.tab === "coz"));
  function afterAppRender(examId, data, d) {
    if (solving()) MAC.hideTip();
    // Deneme sırasında kutlama araya girmez; deneme bitince gösterilir.
    if (!(session && session.kind === "deneme" && !session.finished)) {
      const { fresh } = P.syncBadges(examId, data, d);
      if (fresh.length) { for (const b of fresh) data.badges[b.id].shown = true; if (!data.sample) celebrate(fresh); }
    }
    save();
    scheduleTip("app");
  }

  let toastTimer = null;
  function celebrate(list) {
    let el = document.getElementById("badge-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "badge-toast"; el.className = "badge-toast"; el.setAttribute("role", "status");
      el.addEventListener("click", (e) => { if (e.target.closest("[data-toast]")) el.hidden = true; });
      document.body.appendChild(el);
    }
    el.innerHTML = `<span class="badge-icon" aria-hidden="true">${esc(list[0].icon)}</span>
      <div><b>${list.length > 1 ? "Yeni rozetler" : "Yeni rozet"}</b><span>${list.map((b) => esc(b.title)).join(", ")}</span></div>
      <button type="button" data-toast="close" aria-label="Kapat">×</button>`;
    el.hidden = false;
    el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 7000);
  }

  // Sıklık: Mac en fazla 2 balon/oturum (mac.js sayar); soru çözerken, denemede ve derste çıkmaz.
  let tipTimer = null, tipIdx = 0;
  const TIP_TABS = ["panel", "plan", "hata", "rapor"];
  function scheduleTip(kind, examId) {
    clearTimeout(tipTimer);
    if (!MAC.tipsAvailable()) return;
    tipTimer = setTimeout(() => {
      const r = route();
      if (kind === "app" && (r.view !== "app" || !TIP_TABS.includes(store.tab) || solving())) return;
      if (kind === "program" && (r.view !== "program" || bySlug[r.slug]?.engine !== examId)) return;
      const t = pickTip(kind === "app" ? store.exam : examId, kind);
      if (t && MAC.tip(t.text, t)) tipIdx++;
    }, 3500);
  }

  function pickTip(examId, kind) {
    const ex = A.exams[examId];
    if (!ex) return null;
    const data = store.data[examId], d = derive(examId, data);
    const cd = P.countdown(examId);
    const mine = [], facts = (A.examFacts?.[examId] || []).map((text) => ({ text, mood: "think" }));
    if (cd && !cd.pending) {
      if (cd.examWeek) mine.push({ text: `Sınava ${cd.days} gün kaldı. Planın artık tekrar ağırlıklı: yeni konu azaldı, zayıf ve unutmaya başladığın konular arttı.` });
      else if (cd.days <= 45) mine.push({ text: `Sınava ${cd.days} gün kaldı. ${P.EXAM_WEEK_DAYS} gün kalınca plan kendiliğinden tekrar ağırlıklı moda geçecek.` });
      else mine.push({ text: `Sınava ${cd.days} gün var. Günde ${data.budget} soruyla sınava kadar yaklaşık ${(cd.days * data.budget).toLocaleString("tr-TR")} soru eder.` });
    } else if (cd && cd.pending) mine.push({ text: `Bir sonraki ${ex.short} tarihi henüz açıklanmadı. ÖSYM takvimi açıklanınca geri sayım güncellenecek; o zamana kadar düzenli tekrar en iyi hazırlık.` });
    if (!data.sample && kind === "app") {
      const weak = Object.keys(d.sh).filter((a) => d.attemptsByAlan[a] && E.stats(d.mastery[a]).mean < E.WEAK_MEAN).sort((a, b) => E.weakness(d.mastery[b]) - E.weakness(d.mastery[a]))[0];
      if (weak) mine.unshift({ text: `${weak} alanında ustalık tahminin %${pct(E.stats(d.mastery[weak]).mean)}. Soru çözünce sorular önce oradan gelecek.` });
      const st = P.streaks(data.attempts);
      if (st.current >= 2) mine.push({ text: `${st.current} gündür aralıksız çalışıyorsun.${st.activeToday ? " Bugünkü payını da aldın." : " Bugün bir soru çözersen seri sürer."}` });
      const open = P.errorBook(d.exam, data.attempts).open.length;
      if (open) mine.push({ text: `Hata defterinde ${open} soru var. Doğru çözdüğün soru defterden çıkar.` });
    }
    // İlk balon öğrencinin kendi durumundan, ikincisi (varsa) doğrulanmış bir sınav bulgusundan.
    const pool = tipIdx % 2 === 0 ? (mine.length ? mine : facts) : (facts.length ? facts : mine);
    const t = pool.length ? pool[Math.floor(Math.random() * Math.min(pool.length, tipIdx % 2 === 0 ? 2 : pool.length))] : null;
    if (t && kind === "program") t.action = { label: "Öğrenme alanına git", href: `#ogren-${examId}` };
    return t;
  }

  // Program sayfasındaki geri sayım kutusu (TUS, HMGS, YDS).
  function programCountdown(p) {
    const cd = p.engine && examOn(p.engine) ? P.countdown(p.engine) : null;
    if (!cd) return "";
    const data = store.data[p.engine], d = derive(p.engine, data);
    const h = cdHead(cd, A.exams[p.engine].short), t = todayPlan(d, data, cd);
    return `<div class="box cd-box">
      <span class="eyebrow">Sınav geri sayımı</span>
      <div class="cd-box-top"><b class="num">${h.num}</b><span>${cd.pending ? "" : "gün"}</span></div>
      <h3>${esc(h.h)}</h3>
      <p class="note">${esc(h.sub)}</p>
      <p class="cd-box-goal">Bugünkü hedefin: <b>${t.total} soru</b>${data.sample ? ` <span class="chip chip-soon">örnek veri</span>` : ` · bugün ${t.done} çözdün`}</p>
      ${cd.examWeek ? `<p class="note">Sınav haftası: planın tekrar ağırlıklı.</p>` : ""}
      ${srcLine(cd)}
    </div>`;
  }

  // ---------- Etkileşimler ----------
  $app.addEventListener("click", (ev) => {
    const jump = ev.target.closest("a[data-to]");
    if (jump) { ev.preventDefault(); document.getElementById(jump.dataset.to)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); return; }
    const el = ev.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    const examId = store.exam;
    const data = store.data[examId];

    if (act === "slide") { slideIdx = +el.dataset.i; updateSlide(); startSlides(); return; }
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
      const full = el.dataset.full === "1";
      const plan = denemePlan(d, full);
      const quota = plan.quota;
      const items = [];
      for (const [alan, n] of Object.entries(quota)) {
        const pool = d.exam.items.filter((i) => i.alan === alan).sort(() => Math.random() - 0.5);
        items.push(...pool.slice(0, n));
      }
      items.sort(() => Math.random() - 0.5);
      const start = Date.now();
      session = { kind: "deneme", items, idx: 0, answers: [], finished: false, q: { item: items[0], chosen: null }, full, start, limitSec: plan.sec, deadline: plan.sec ? start + plan.sec * 1000 : null };
      store.tab = "deneme"; save(); renderApp(); window.scrollTo({ top: 0 }); if (session.deadline) tickDeneme(); return;
    }

    if (act === "hata-by") { store.hataBy = el.dataset.id; save(); renderApp(); return; }
    if (act === "hata-back") { session = null; renderApp(); window.scrollTo({ top: 0 }); return; }
    if (act === "hata-all" || act === "hata-group" || act === "hata-one") {
      const d = derive(examId, data);
      const open = P.errorBook(d.exam, data.attempts).open;
      let list = open;
      if (act === "hata-one") list = open.filter((e) => e.item.id === el.dataset.id);
      if (act === "hata-group") {
        list = (P.groupErrors(open, hataBy(open))[+el.dataset.i] || [null, []])[1];
      }
      startHata(list.map((e) => e.item)); return;
    }

    if (!session) return;
    const q = session.q;
    if (act === "say") { if (q.item.say) speak(q.item.say); return; }
    if (act === "conf") { q.conf = +el.dataset.v; renderApp(); return; }
    if (act === "choose") { q.chosen = +el.dataset.i; renderApp(); return; }

    if (session.kind === "deneme" && (act === "answer" || act === "skip")) {
      const ans = act === "skip" ? null : q.chosen;
      session.answers.push(ans);
      record(q.item, ans === q.item.a, 2, ans === null, "deneme", ans);
      session.idx++;
      if (session.idx >= session.items.length) finishDeneme(false);
      else session.q = { item: session.items[session.idx], chosen: null };
      renderApp(); window.scrollTo({ top: 0 }); return;
    }

    if (act === "answer" || act === "skip") {
      const skipped = act === "skip";
      q.done = true; q.skipped = skipped; q.correct = !skipped && q.chosen === q.item.a;
      q.t = record(q.item, q.correct, skipped ? null : q.conf, skipped, session.kind === "tani" ? "tani" : session.kind === "hata" ? "hata" : "pratik", skipped ? null : q.chosen);
      if (A.exams[examId].game && q.correct) { q.points = q.conf === 3 ? 15 : 10; q.streak = gameStats(data).streak; }
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
      } else if (session.kind === "hata") {
        session.results.push(!!q.correct);
        session.idx++;
        if (session.idx >= session.queue.length) session.finished = true;
        else session.q = { ...newQ({ item: session.queue[session.idx], reason: "hata" }) };
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
    const links = g.id === "deneyim"
      ? A.programs.filter((p) => p.group === g.id).map((p) => p.soon ? `<span class="mega-off" aria-disabled="true">${esc(p.title)} <small>Yakında</small></span>` : `<a href="#p-${p.slug}">${esc(p.title)}</a>`).join("")
      : g.id === "dijital"
      ? `<a href="#p-robotik">Genel bakış</a>${bySlug.robotik.modules.map((m) => `<a href="#m-${m.slug}">${esc(m.title)}</a>`).join("")}`
      : A.programs.filter((p) => p.group === g.id).map((p) => p.active === false ? `<span class="mega-off" aria-disabled="true">${esc(p.title)} <small>Yakında</small></span>` : `<a href="#p-${p.slug}">${esc(p.title)}</a>`).join("");
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
    if (h.startsWith("anlatim-") && h.includes(".")) { const [mod, id] = h.slice(8).split("."); if (MODULES.includes(mod)) return { view: "anlatim", mod, id }; }
    if (h.startsWith("ders-") && h.includes(".")) { const [mod, id] = h.slice(5).split("."); if (MODULES.includes(mod)) return { view: "lesson", mod, id }; }
    if (h.startsWith("m-") && bySlug.robotik.modules.some((m) => m.slug === h.slice(2))) return { view: "module", slug: h.slice(2) };
    if (h === "ogren" || h.startsWith("ogren-")) return { view: "app", exam: h.slice(6) };
    if (h === "basla") return { view: "basla" };
    if (h === "studyo") return { view: "studyo" };
    if (h === "yontem") return { view: "yontem" };
    return { view: "home", section: SECTIONS.includes(h) ? h : null };
  }
  function render() {
    const r = route();
    clearTimeout(tipTimer);
    setMega(false); nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
    const key = r.view + (r.slug || "") + (r.id || "");
    if (r.view === "app") {
      if (r.exam && examOn(r.exam) && r.exam !== store.exam) { store.exam = r.exam; session = null; save(); }
      if (r.exam && examOn(r.exam) && current !== key) { const dt = store.data[r.exam]; store.tab = dt.diagDone ? "panel" : "tani"; }
      renderApp();
    } else if (r.view === "program") { renderProgram(bySlug[r.slug]); if (bySlug[r.slug].engine && A.examCalendar?.sessions[bySlug[r.slug].engine]) scheduleTip("program", bySlug[r.slug].engine); }
    else if (r.view === "module") renderModule(r.slug);
    else if (r.view === "basla") MAC.renderOnboarding($app);
    else if (r.view === "studyo") renderStudio();
    else if (r.view === "yontem") renderMethod();
    else if (r.view === "anlatim") { $app.innerHTML = `<div class="wrap"><div id="la-root"></div></div>`; LESSONS.openAnlatim(document.getElementById("la-root"), r.mod, r.id, anlatimHooks); }
    else if (r.view === "lesson") { $app.innerHTML = `<div class="wrap"><div id="lp-root"></div></div>`; LESSONS.open(document.getElementById("lp-root"), r.mod, r.id, lessonHooks); }
    else if (current !== "home" || !$app.querySelector(".hero")) renderHome();
    if (r.view === "program" && MODULES.includes(r.slug)) { fillLessons(r.slug); fillCurriculum(r.slug); }
    if (r.view === "home" && r.section) document.getElementById(r.section)?.scrollIntoView({ behavior: current === "home" && !reduceMotion ? "smooth" : "auto" });
    else if (current !== key || r.view === "home") window.scrollTo({ top: 0, behavior: current === "home" && !reduceMotion ? "smooth" : "auto" });
    current = key;
    document.querySelectorAll(".main-nav > a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + (r.section || (r.view === "home" ? "ana" : r.view === "yontem" ? "yontem" : ""))));
  }
  window.addEventListener("hashchange", render);
  // Adres zaten #ana iken hashchange tetiklenmez; linki yine de çalıştır.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href="#ana"]');
    if (a && (location.hash === "#ana" || location.hash === "")) { e.preventDefault(); render(); }
  });
  if (MAC.needsOnboarding() && (location.hash === "" || location.hash === "#ana")) history.replaceState(null, "", "#basla");

  // ---------- Dersler (modüller) ----------
  function lessonDone(mod, id) { return store.lessons?.[mod]?.[id]; }
  function fillLessons(mod) {
    LESSONS.manifest(mod).then((man) => {
      const host = document.getElementById("lesson-list"); if (!host) return;
      host.innerHTML = man.lessons.map((l, i) => {
        const done = lessonDone(mod, l.id);
        return `<a class="lesson-card${done ? " done" : ""}" href="#ders-${mod}.${l.id}">
          <span class="lc-num num">${done ? "✓" : i + 1}</span>
          <span class="lc-body"><b>${esc(l.title)}</b><small>${esc(l.level)} · ${l.minutes} dk${done ? ` · ${done.points} puan` : ""}</small><span>${esc(l.summary)}</span></span></a>`;
      }).join("");
    }).catch(() => {});
  }
  // ---------- Müfredat ----------
  const SIM_LABEL = { "sayi-dogrusu": "Sayı doğrusu", "onluk-bloklar": "Onluk bloklar", "kesir-cubugu": "Kesir çubuğu", "alan-modeli": "Alan modeli", "denklem-terazisi": "Denklem terazisi",
    "koordinat-duzlemi": "Koordinat düzlemi", "fonksiyon-grafigi": "Fonksiyon grafiği", "geometri-tahtasi": "Geometri tahtası", "aci-olcer": "Açı ölçer", "donusum": "Dönüşüm",
    "kati-cisim": "Katı cisim", "olcme": "Ölçme", "saat": "Saat", "para": "Para", "oruntu": "Örüntü", "veri-grafigi": "Veri grafiği", "olasilik-sim": "Olasılık deneyi",
    "oran-karistirma": "Oran karıştırma", "birim-cember": "Birim çember", "limit-yaklasim": "Limit yaklaşımı", "turev-teget": "Teğet ve türev", "integral-alan": "İntegral alanı",
    "dizi-gorsel": "Dizi görseli", "kume-venn": "Venn şeması", "mantik-tablosu": "Doğruluk tablosu", "karmasik-duzlem": "Karmaşık düzlem",
    "ritim-makinesi": "Ritim makinesi", "dj-mikser": "DJ mikseri", "synth": "Synthesizer", "aranjman": "Aranjman",
    "kod-izleyici": "Kod izleyici", "cikti-tahmin": "Çıktı tahmini", "parsons": "Satır dizme", "bosluk-doldur": "Boşluk doldurma", "hata-bul": "Hata bulma", "kod-yaz": "Kod yazma", "gorsel-veri-yapisi": "Veri yapısı görseli" };
  const READY = new Set(["ritim-makinesi", "dj-mikser", "olcme", "kati-cisim", "oruntu", "donusum", "saat", "para", "oran-karistirma", "kume-venn", "mantik-tablosu", "dizi-gorsel", "limit-yaklasim", "karmasik-duzlem", "sayi-dogrusu", "kesir-cubugu", "olasilik-sim", "koordinat-duzlemi", "turev-teget", "onluk-bloklar", "alan-modeli", "denklem-terazisi", "aci-olcer", "geometri-tahtasi", "veri-grafigi", "fonksiyon-grafigi", "birim-cember", "integral-alan", "kod-izleyici", "cikti-tahmin", "parsons", "bosluk-doldur", "hata-bul", "gorsel-veri-yapisi"]);
  const simChip = (k) => k ? `<span class="chip ${READY.has(k) ? "chip-ready" : "chip-line"}" title="${READY.has(k) ? "Hazır" : "Planlandı"}">${READY.has(k) ? "● " : "○ "}${esc(SIM_LABEL[k] || k)}</span>` : "";
  const dersLink = (mod, id) => id ? `<a class="chip chip-brand" href="#ders-${mod}.${id}">Derse git →</a>` : "";
  let anlatimSet = new Set();
  const anlatimLink = (mod, id) => anlatimSet.has(id) ? `<a class="chip chip-ready" href="#anlatim-${mod}.${id}">Konu anlatımı →</a>` : "";
  const codeList = (k) => k.kod ? k.kod : (k.kazanim || []).filter((x) => /^[A-Z]+\.?\d/.test(x)).join(", ");

  function fillCurriculum(mod) {
    Promise.all([fetch(`modules/${mod}/curriculum.json`).then((r) => r.json()), mod === "matematik" ? LESSONS.anlatimIndex(mod).catch(() => ({ konular: [] })) : { konular: [] }]).then(([c, ai]) => {
      anlatimSet = new Set(ai.konular.map((k) => k.id));
      const host = document.getElementById("curriculum"); if (!host) return;
      const legend = `<p class="cur-legend"><span class="chip chip-ready">● Hazır simülasyon</span><span class="chip chip-line">○ Planlandı</span>${mod === "matematik" ? `<span class="chip chip-ready">Konu anlatımı →</span> simülasyonlu anlatım` : ""}<span class="chip chip-brand">Derse git →</span> oyunlu ders</p>`;
      if (mod === "matematik") {
        const count = (g) => g.temalar.reduce((n, t) => n + t.konular.length, 0);
        const total = c.asamalar.reduce((n, st) => n + st.siniflar.reduce((m, g) => m + count(g), 0), 0);
        host.innerHTML = `<p class="muted">İlkokuldan üniversiteye hazırlığa <b>${total} konu</b>. Konular MEB öğretim programlarından (Türkiye Yüzyılı Maarif Modeli ve 2018 programı), sınav dağılımları son yılların TYT ve AYT sınavlarından alındı.</p>${legend}
          ${c.asamalar.map((st) => `<details class="cur-stage" ${st.ad === "İlkokul" ? "open" : ""}><summary><b>${esc(st.ad)}</b><span>${st.siniflar.length} sınıf · ${st.siniflar.reduce((m, g) => m + count(g), 0)} konu</span></summary>
            ${st.siniflar.map((g) => `<details class="cur-grade"><summary><b>${g.sinif}. sınıf</b><span>${esc(/TYMM|Maarif/i.test(g.program) ? "Maarif Modeli" : "2018 programı")} · ${count(g)} konu</span></summary>
              ${g.temalar.map((t) => `<div class="cur-theme"><h4>${esc(t.baslik)}</h4><ul>${t.konular.map((k) => `<li><span class="cur-t">${esc(k.baslik)}${codeList(k) ? `<small>${esc(codeList(k))}</small>` : ""}</span><span class="cur-chips">${k.lgs ? '<span class="chip chip-line">LGS</span>' : ""}${(k.yks || []).map((y) => `<span class="chip chip-line">${y}</span>`).join("")}${simChip(k.sim)}${anlatimLink(mod, k.id)}${dersLink(mod, k.ders)}</span></li>`).join("")}</ul></div>`).join("")}
            </details>`).join("")}</details>`).join("")}
          ${c.yks ? `<details class="cur-stage"><summary><b>Üniversiteye hazırlık (YKS)</b><span>TYT ${c.yks.TYT.length} · AYT ${c.yks.AYT.length} konu</span></summary>
            <p class="note">${esc(c.yks.aciklama || "")}</p>
            ${["TYT", "AYT"].map((part) => `<h4 class="cur-h">${part} Matematik</h4><div class="table-wrap"><table><thead><tr><th>Konu</th><th class="num">Soru (2023–2025)</th><th>Görselleştirme</th></tr></thead><tbody>
              ${c.yks[part].map((k) => `<tr><td>${esc(k.konu)}${k.ders ? ` ${dersLink(mod, k.ders)}` : ""}</td><td class="num">${esc(k.soru_araligi || "–")}</td><td>${simChip(k.sim)}</td></tr>`).join("")}</tbody></table></div>`).join("")}
          </details>` : ""}
          <details class="cur-src"><summary>Kaynaklar ve program durumu</summary><ul>${Object.entries(c.program_durumu).filter(([k]) => k !== "not").map(([k, v]) => `<li>${/^\d+$/.test(k) ? `${k}. sınıf` : esc(k)}: ${esc(v)}</li>`).join("")}</ul><ul>${c.kaynaklar.map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join("")}</ul></details>`;
      } else {
        const n = c.seviyeler.reduce((a, l) => a + l.uniteler.reduce((b, u) => b + u.konular.length, 0), 0);
        host.innerHTML = `<p class="muted">${c.intro ? esc(c.intro) : `Python: ilk programdan algoritma ve problem çözmeye <b>${n} konu</b>, 6 seviye. Her konunun örnek kodu çalıştırılarak doğrulandı.`}</p>${legend}
          ${c.seviyeler.map((lv) => `<details class="cur-stage" ${lv.seviye === 1 ? "open" : ""}><summary><b>Seviye ${lv.seviye} · ${esc(lv.ad)}</b><span>${esc(lv.yas || "")} · ${lv.uniteler.reduce((b, u) => b + u.konular.length, 0)} konu</span></summary>
            ${lv.uniteler.map((u) => `<div class="cur-theme"><h4>${esc(u.baslik)}</h4><ul>${u.konular.map((k) => `<li><span class="cur-t">${esc(k.baslik)}<small>${esc(k.hedef || "")}</small>
              ${k.ornek ? `<details class="cur-ex"><summary>Örnek</summary><pre class="q-code"><code>${esc(k.ornek)}</code></pre>${k.cikti !== undefined ? `<pre class="cur-out">${esc(k.cikti) || "(çıktı yok)"}</pre>` : ""}</details>` : ""}</span>
              <span class="cur-chips">${simChip(k.etkilesim)}${dersLink(mod, k.ders)}</span></li>`).join("")}</ul></div>`).join("")}</details>`).join("")}
          <details class="cur-src" ${(c.kaynaklar || []).length ? "" : "hidden"}><summary>Kaynaklar</summary><ul>${(c.kaynaklar || []).map((u) => `<li><a href="${esc(typeof u === "string" ? u : u.url)}" target="_blank" rel="noopener">${esc(typeof u === "string" ? u : (u.ad || u.url))}</a></li>`).join("")}</ul></details>`;
      }
    }).catch(() => { const h = document.getElementById("curriculum"); if (h) h.innerHTML = `<p class="muted">Müfredat yüklenemedi.</p>`; });
  }

  const anlatimHooks = {
    onTask: (d) => { store.anlatim = store.anlatim || {}; store.anlatim[d.id] = { ...(store.anlatim[d.id] || {}), gorev: 1 }; save(); },
    onQuiz: (d) => { store.anlatim = store.anlatim || {}; store.anlatim[d.id] = { ...(store.anlatim[d.id] || {}), kontrol: 1 }; save(); },
  };
  const lessonHooks = {
    onAttempt(les, step, correct) {
      const mod = route().mod, ex = A.exams[mod] ? mod : null;
      if (!ex) return;
      if (store.data[ex].sample) store.data[ex] = emptyData();
      store.data[ex].attempts.push({ id: `ders:${les.id}:${step.id}`, alan: les.alan, correct, conf: 2, skipped: false, mode: "ders", t: Date.now() + Math.random() });
      save();
    },
    onFinish(les, res) {
      const mod = route().mod;
      store.lessons = store.lessons || {}; store.lessons[mod] = store.lessons[mod] || {};
      const prev = store.lessons[mod][les.id];
      store.lessons[mod][les.id] = { points: Math.max(res.points, prev?.points || 0), correct: res.correct, total: res.total, at: Date.now() };
      save();
    },
  };

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
    const lc = LESSONS.context() || LESSONS.anlatimContext(); if (lc) return lc;
    const r = route();
    if (r.view === "program") { const p = bySlug[r.slug]; return { page: `Program sayfası: ${p.title}`, context: `${p.summary} ${p.body.join(" ")}` }; }
    if (r.view === "module") { const m = bySlug.robotik.modules.find((x) => x.slug === r.slug); return { page: `Robotik modülü: ${m.title}`, context: `${m.desc} Yaş: ${m.age}. Ders sayısı: ${m.lessons}.` }; }
    if (r.view === "app") {
      const ex = A.exams[store.exam];
      const tabName = (TABS.find((t) => t[0] === store.tab) || [])[1];
      let context = `Öğrenme alanı, sınav: ${ex.name}. Açık sekme: ${tabName}. Alanlar: ${Object.keys(ex.blueprint).join(", ")}.`;
      const q = session && !session.finished && session.q;
      if (q) {
        const it = q.item;
        context += ` Öğrencinin ekranındaki soru (${it.alan}): ${it.q}${it.code ? ` Kod:\n${it.code}\n` : ""} Şıklar: ${it.o.map((o, i) => `${LETTERS[i]}) ${o}`).join(" ")}.`;
        context += q.done && session.kind !== "deneme" ? ` Öğrenci cevapladı (${q.correct ? "doğru" : "yanlış"}). Doğru cevap ${LETTERS[it.a]}. Açıklama: ${it.e}` : " Öğrenci henüz cevaplamadı: doğru cevabı söyleme, düşünmesini sağla.";
        const open = !(q.done && session.kind !== "deneme");
        return { page: "Soru çözme ekranı", context, question: true, hide: open ? [it.o[it.a], LETTERS[it.a]] : null };
      }
      return { page: "Öğrenme alanı", context };
    }
    return { page: "Ana sayfa", context: `Programlar: ${ACTIVE.filter((p) => !p.soon).map((p) => p.title).join(", ")}. Yakında: ${PASSIVE.map((p) => p.title).join(", ")}.` };
  });

  // ---------- Fotoğraf kaynakları ----------
  const LIC = { by: "CC BY", "by-sa": "CC BY-SA", cc0: "CC0", pdm: "Kamu malı" };
  fetch("img/credits.json").then((r) => r.json()).then((list) => {
    document.getElementById("credit-list").innerHTML = list.map((c) =>
      `<li><a href="${esc(c.foreign_landing_url)}" target="_blank" rel="noopener">${esc(c.title || "Adsız")}</a>, ${esc(c.creator || "bilinmiyor")} · <a href="${esc(c.license_url)}" target="_blank" rel="noopener">${LIC[c.license] || esc(c.license)} ${c.license === "cc0" || c.license === "pdm" ? "" : esc(c.license_version || "")}</a></li>`).join("");
  }).catch(() => {});
  // İlk çizim en sonda: sayfa kancaları (ders, konu anlatımı) tanımlandıktan sonra.
  render();
})();
