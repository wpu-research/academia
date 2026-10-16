// Ders oynatıcısı ve simülasyonlar. Dersler modules/<modül>/lessons/<id>.json dosyalarındaki veridir;
// cevap kontrolü bildirimseldir (check), böylece aynı ders API üzerinden de çalıştırılabilir.
window.LESSONS = (() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  const NS = "http://www.w3.org/2000/svg";
  const cache = {};
  const getJSON = (url) => (cache[url] ||= fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.json(); }));
  const manifest = (mod) => getJSON(`modules/${mod}/manifest.json`);
  const lesson = (mod, id) => getJSON(`modules/${mod}/lessons/${id}.json`);

  // ---------- Bildirimsel kontrol ----------
  function check(rule, st) {
    if (!rule) return true;
    if (rule.all) return rule.all.every((r) => check(r, st));
    const v = st[rule.key];
    if (v === undefined || v === null) return false;
    if ("eq" in rule) return Math.abs(v - rule.eq) <= (rule.tol ?? 1e-9);
    if ("gte" in rule) return v >= rule.gte;
    if ("lt" in rule) return v < rule.lt;
    return false;
  }

  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  function fracLabel(v, den) {
    const num = Math.round(v * den);
    if (num % den === 0) return String(num / den);
    const g = gcd(num, den);
    return `${num / g}/${den / g}`;
  }
  const fmt = (x, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString("tr-TR");
  function svgEl(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  }
  function svgPoint(svg, ev) {
    const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  // ---------- Simülasyonlar ----------
  const SIMS = {};

  // Kesir çubuğu: parçalara dokunarak boyama; isteğe bağlı payda kaydırıcısı.
  SIMS["kesir-cubugu"] = (el, cfg, changed) => {
    const bars = cfg.bars.map((b) => ({ ...b, on: new Set([...Array(b.shaded || 0).keys()]) }));
    const W = 600, H = 52, G = 26;
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W + 80} ${bars.length * (H + G)}`, class: "sim-svg", role: "group", "aria-label": "Kesir çubukları" });
      bars.forEach((b, bi) => {
        const y = bi * (H + G) + 6, pw = W / b.n;
        for (let i = 0; i < b.n; i++) {
          const r = svgEl("rect", { x: i * pw + 1, y, width: pw - 2, height: H, rx: 4, class: `fb-part${b.on.has(i) ? " on" : ""}${b.interactive ? " tap" : ""}` }, svg);
          if (b.interactive) {
            r.setAttribute("tabindex", "0"); r.setAttribute("role", "checkbox"); r.setAttribute("aria-checked", b.on.has(i));
            r.setAttribute("aria-label", `${b.n} parçadan ${i + 1}. parça`);
            const toggle = () => { b.on.has(i) ? b.on.delete(i) : b.on.add(i); draw(); changed(); el.querySelector(`[data-p="${bi}-${i}"]`)?.focus(); };
            r.dataset.p = `${bi}-${i}`;
            r.addEventListener("click", toggle);
            r.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
          }
        }
        const t = svgEl("text", { x: W + 16, y: y + H / 2 + 7, class: "fb-label" }, svg);
        t.textContent = b.label && !b.interactive ? b.label : `${b.on.size}/${b.n}`;
      });
      el.replaceChildren(svg);
      if (cfg.slider) {
        const wrap = document.createElement("label"); wrap.className = "sim-slider";
        wrap.innerHTML = `<span>${esc(cfg.slider.label)}: <b>${bars[0].n}</b></span><input type="range" min="${cfg.slider.min}" max="${cfg.slider.max}" step="1" value="${bars[0].n}">`;
        wrap.querySelector("input").addEventListener("input", (e) => { bars[0].n = +e.target.value; bars[0].on = new Set([0]); draw(); changed(); });
        el.appendChild(wrap);
      }
    }
    draw();
    return () => Object.fromEntries(bars.flatMap((b, i) => [[`shaded${i}`, b.on.size], [`n${i}`, b.n]]));
  };

  // Sayı doğrusu: işaretçi sürüklenir ya da ok tuşlarıyla 1/payda adımlarla ilerler.
  SIMS["sayi-dogrusu"] = (el, cfg, changed) => {
    const W = 640, L = 36, R = W - 36, Y = 70;
    let value = cfg.value ?? cfg.min;
    const x = (v) => L + ((v - cfg.min) / (cfg.max - cfg.min)) * (R - L);
    const snap = (v) => Math.min(cfg.max, Math.max(cfg.min, Math.round(v * cfg.den) / cfg.den));
    const svg = svgEl("svg", { viewBox: `0 0 ${W} 120`, class: "sim-svg nl" + (cfg.fixed ? "" : " drag") });
    svgEl("line", { x1: L - 14, y1: Y, x2: R + 14, y2: Y, class: "nl-axis" }, svg);
    const steps = Math.round((cfg.max - cfg.min) * cfg.den);
    for (let i = 0; i <= steps; i++) {
      const v = cfg.min + i / cfg.den, whole = Math.abs(v - Math.round(v)) < 1e-9;
      svgEl("line", { x1: x(v), y1: Y - (whole ? 14 : 8), x2: x(v), y2: Y + (whole ? 14 : 8), class: whole ? "nl-major" : "nl-minor" }, svg);
      if (whole) { const t = svgEl("text", { x: x(v), y: Y + 36, class: "nl-num" }, svg); t.textContent = Math.round(v); }
    }
    for (const [v, lab] of cfg.marks || []) {
      svgEl("circle", { cx: x(v), cy: Y, r: 6, class: "nl-mark" }, svg);
      const t = svgEl("text", { x: x(v), y: Y - 22, class: "nl-marklab" }, svg); t.textContent = lab;
    }
    let knob = null, klab = null;
    if (!cfg.marks) {
      knob = svgEl("circle", { cy: Y, r: 12, class: "nl-knob", tabindex: cfg.fixed ? -1 : 0, role: "slider", "aria-label": "Sayı doğrusundaki nokta" }, svg);
      klab = svgEl("text", { y: Y - 24, class: "nl-klab" }, svg);
    }
    function place() {
      if (!knob) return;
      knob.setAttribute("cx", x(value)); klab.setAttribute("x", x(value));
      klab.textContent = fracLabel(value, cfg.den);
      knob.setAttribute("aria-valuetext", klab.textContent);
    }
    place();
    if (!cfg.fixed && knob) {
      let drag = false;
      const move = (ev) => { value = snap(cfg.min + ((svgPoint(svg, ev).x - L) / (R - L)) * (cfg.max - cfg.min)); place(); changed(); };
      svg.addEventListener("pointerdown", (ev) => { drag = true; svg.setPointerCapture(ev.pointerId); move(ev); });
      svg.addEventListener("pointermove", (ev) => { if (drag) move(ev); });
      svg.addEventListener("pointerup", () => { drag = false; });
      knob.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
        if (d) { e.preventDefault(); value = snap(value + d / cfg.den); place(); changed(); }
      });
    }
    el.replaceChildren(svg);
    return () => ({ value });
  };

  // Zar deneyi: tek zarda yüzlerin, iki zarda toplamların göreli sıklığı; kesikli çizgiler teorik olasılık.
  SIMS["olasilik-sim"] = (el, cfg) => {
    const two = cfg.dice === 2;
    const keys = two ? [...Array(11).keys()].map((i) => i + 2) : [1, 2, 3, 4, 5, 6];
    const theo = (k) => (two ? (6 - Math.abs(k - 7)) / 36 : 1 / 6);
    const count = Object.fromEntries(keys.map((k) => [k, 0]));
    let total = 0, last = "–";
    const roll = () => 1 + Math.floor(Math.random() * 6);
    el.innerHTML = `<div class="dice-ctrl"><button type="button" class="btn btn-outline btn-small" data-n="1">1 kez at</button><button type="button" class="btn btn-outline btn-small" data-n="10">10 kez at</button><button type="button" class="btn btn-outline btn-small" data-n="100">100 kez at</button><span class="dice-info"></span></div><div class="dice-chart"></div>`;
    const chart = el.querySelector(".dice-chart"), info = el.querySelector(".dice-info");
    const W = 640, H = 230, B = 30, top = two ? 0.25 : 0.35;
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H + 40}`, class: "sim-svg", role: "img", "aria-label": `${total} atışın dağılımı` });
      const bw = (W - 40) / keys.length;
      [0, top / 2, top].forEach((g) => { const y = B + H - (g / top) * H; svgEl("line", { x1: 30, x2: W, y1: y, y2: y, class: "dc-grid" }, svg); const t = svgEl("text", { x: 26, y: y + 4, class: "dc-ax" }, svg); t.textContent = `%${Math.round(g * 100)}`; });
      keys.forEach((k, i) => {
        const f = total ? count[k] / total : 0, h = Math.min(1, f / top) * H, bx = 36 + i * bw;
        svgEl("rect", { x: bx + bw * 0.15, y: B + H - h, width: bw * 0.7, height: Math.max(h, 0), rx: 3, class: "dc-bar" }, svg);
        const ty = B + H - (theo(k) / top) * H;
        svgEl("line", { x1: bx + bw * 0.05, x2: bx + bw * 0.95, y1: ty, y2: ty, class: "dc-theo" }, svg);
        const t = svgEl("text", { x: bx + bw / 2, y: B + H + 22, class: "dc-key" }, svg); t.textContent = k;
      });
      chart.replaceChildren(svg);
      info.innerHTML = `Atış: <b class="num">${total}</b> · Son: <b>${last}</b>`;
    }
    el.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => {
      for (let i = 0; i < +b.dataset.n; i++) {
        const a = roll(), c = two ? roll() : 0;
        count[two ? a + c : a]++; total++; last = two ? `${a} + ${c} = ${a + c}` : String(a);
      }
      draw(); el.dispatchEvent(new Event("simchange", { bubbles: true }));
    }));
    draw();
    return () => ({ total });
  };

  // Koordinat düzlemi: y = mx + n, kaydırıcılarla.
  SIMS["koordinat-duzlemi"] = (el, cfg, changed) => {
    let m = cfg.m ?? 1, n = cfg.n ?? 0;
    const S = 28, O = 200, X = (v) => O + v * S, Y = (v) => O - v * S;
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl">
      <p class="eq"></p>
      <label class="sim-slider"><span>Eğim m: <b class="mv"></b></span><input type="range" min="-3" max="3" step="0.5" value="${m}" data-k="m"></label>
      <label class="sim-slider"><span>Kesişim n: <b class="nv"></b></span><input type="range" min="-5" max="5" step="1" value="${n}" data-k="n"></label></div></div>`;
    const host = el.querySelector(".plane");
    function draw() {
      const svg = svgEl("svg", { viewBox: "0 0 400 400", class: "sim-svg plane-svg", role: "img", "aria-label": `y = ${m}x + ${n} doğrusu` });
      for (let i = -7; i <= 7; i++) {
        svgEl("line", { x1: X(i), y1: 0, x2: X(i), y2: 400, class: i ? "pl-grid" : "pl-axis" }, svg);
        svgEl("line", { x1: 0, y1: Y(i), x2: 400, y2: Y(i), class: i ? "pl-grid" : "pl-axis" }, svg);
        if (i && i % 2 === 0 && Math.abs(i) < 7) { const a = svgEl("text", { x: X(i), y: O + 16, class: "pl-num" }, svg); a.textContent = i; const b = svgEl("text", { x: O - 8, y: Y(i) + 4, class: "pl-num pl-numy" }, svg); b.textContent = i; }
      }
      svgEl("line", { x1: X(-8), y1: Y(m * -8 + n), x2: X(8), y2: Y(m * 8 + n), class: "pl-line" }, svg);
      svgEl("circle", { cx: X(0), cy: Y(n), r: 5, class: "pl-int" }, svg);
      for (const [px, py] of cfg.points || []) {
        const hit = Math.abs(m * px + n - py) < 1e-6;
        svgEl("circle", { cx: X(px), cy: Y(py), r: 7, class: hit ? "pl-pt hit" : "pl-pt" }, svg);
        const t = svgEl("text", { x: X(px) + 10, y: Y(py) - 10, class: "pl-ptl" }, svg); t.textContent = `(${px}, ${py})`;
      }
      host.replaceChildren(svg);
      const num = (v) => fmt(Math.abs(v));
      const mx = m === 0 ? "" : `${m < 0 ? "−" : ""}${Math.abs(m) === 1 ? "" : num(m)}x`;
      const nn = m === 0 ? `${n < 0 ? "−" : ""}${num(n)}` : n === 0 ? "" : ` ${n < 0 ? "−" : "+"} ${num(n)}`;
      el.querySelector(".eq").textContent = `y = ${mx}${nn}`;
      el.querySelector(".mv").textContent = fmt(m); el.querySelector(".nv").textContent = fmt(n);
    }
    el.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", () => { if (inp.dataset.k === "m") m = +inp.value; else n = +inp.value; draw(); changed(); }));
    draw();
    return () => ({ m, n });
  };

  // Kesen ve teğet: f(x) = x² ya da x³ − 3x.
  SIMS["turev-teget"] = (el, cfg, changed) => {
    const F = cfg.f === "x3m3x"
      ? { f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, xr: [-2.5, 2.5], yr: [-5, 5], name: "f(x) = x³ − 3x" }
      : { f: (x) => x * x, d: (x) => 2 * x, xr: [-2, 3.5], yr: [-1.5, 10], name: "f(x) = x²" };
    const W = 480, H = 340;
    const X = (v) => ((v - F.xr[0]) / (F.xr[1] - F.xr[0])) * W, Y = (v) => H - ((v - F.yr[0]) / (F.yr[1] - F.yr[0])) * H;
    const secant = cfg.mode === "secant";
    let a = cfg.a, h = cfg.h ?? 1;
    const hFromS = (s) => 0.005 * 400 ** (s / 100), sFromH = (hh) => (Math.log(hh / 0.005) / Math.log(400)) * 100;
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl"><p class="eq">${F.name}</p><p class="slope"></p>
      ${secant ? `<label class="sim-slider"><span>h = <b class="hv"></b></span><input type="range" min="0" max="100" step="1" value="${Math.round(sFromH(h))}"></label>`
        : `<label class="sim-slider"><span>x = <b class="av"></b></span><input type="range" min="${Math.round((F.xr[0] + 0.5) * 10)}" max="${Math.round((F.xr[1] - 0.5) * 10)}" step="1" value="${Math.round(a * 10)}"></label>`}</div></div>`;
    const host = el.querySelector(".plane");
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg plane-svg", role: "img", "aria-label": F.name });
      svgEl("line", { x1: X(F.xr[0]), y1: Y(0), x2: X(F.xr[1]), y2: Y(0), class: "pl-axis" }, svg);
      svgEl("line", { x1: X(0), y1: 0, x2: X(0), y2: H, class: "pl-axis" }, svg);
      let d = "";
      for (let i = 0; i <= 240; i++) { const xx = F.xr[0] + (i / 240) * (F.xr[1] - F.xr[0]); d += `${i ? "L" : "M"}${X(xx).toFixed(1)},${Y(F.f(xx)).toFixed(1)}`; }
      svgEl("path", { d, class: "tg-curve" }, svg);
      const slope = secant ? (F.f(a + h) - F.f(a)) / h : F.d(a);
      const line = (x0, y0, s) => svgEl("line", { x1: X(F.xr[0] - 1), y1: Y(y0 + s * (F.xr[0] - 1 - x0)), x2: X(F.xr[1] + 1), y2: Y(y0 + s * (F.xr[1] + 1 - x0)), class: secant ? "tg-secant" : Math.abs(slope) < 1e-9 ? "tg-tangent flat" : "tg-tangent" }, svg);
      line(a, F.f(a), slope);
      svgEl("circle", { cx: X(a), cy: Y(F.f(a)), r: 6, class: "tg-p" }, svg);
      if (secant) svgEl("circle", { cx: X(a + h), cy: Y(F.f(a + h)), r: 6, class: "tg-q" }, svg);
      host.replaceChildren(svg);
      el.querySelector(".slope").innerHTML = secant ? `Kesenin eğimi: <b class="num">${fmt(slope, 3)}</b>` : `Teğetin eğimi f'(${fmt(a, 1)}) = <b class="num">${fmt(slope, 2)}</b>`;
      if (secant) el.querySelector(".hv").textContent = fmt(h, 3); else el.querySelector(".av").textContent = fmt(a, 1);
    }
    el.querySelector("input").addEventListener("input", (e) => { if (secant) h = hFromS(+e.target.value); else a = Math.round(+e.target.value) / 10; draw(); changed(); });
    draw();
    return () => (secant ? { h } : { a });
  };

  // Liste görseli: kutular, üstte indeks, altta eksi indeks.
  SIMS["liste-gorsel"] = (el, cfg) => { el.innerHTML = listBoxes(cfg.items, cfg.name); return () => ({}); };
  function listBoxes(items, name) {
    return `<div class="lv">${name ? `<span class="lv-name">${esc(name)} =</span>` : ""}<div class="lv-row">${items.map((v, i) => `<div class="lv-cell"><small>${i}</small><span>${esc(v)}</span><small class="neg">${i - items.length}</small></div>`).join("")}</div></div>`;
  }

  // ---------- Kod izleyici ve satır dizme ----------
  function tracer(el, step, changed) {
    let i = 0;
    const lines = step.code.split("\n"), last = step.trace.length - 1;
    el.innerHTML = `<div class="tr"><pre class="tr-code">${lines.map((l, k) => `<span class="tr-line" data-l="${k}"><i>${k + 1}</i>${esc(l) || " "}</span>`).join("")}</pre>
      <div class="tr-side"><div class="tr-box"><h4>Değişkenler</h4><div class="tr-vars"></div></div><div class="tr-box"><h4>Çıktı</h4><pre class="tr-out"></pre></div></div>
      <div class="tr-ctrl"><button type="button" class="btn btn-outline btn-small" data-t="-1">Önceki</button><button type="button" class="btn btn-primary btn-small" data-t="1">Sonraki adım</button><button type="button" class="btn btn-outline btn-small" data-t="0">Baştan</button><span class="tr-pos num"></span></div></div>`;
    function draw() {
      const s = step.trace[i];
      el.querySelectorAll(".tr-line").forEach((n) => n.classList.toggle("cur", +n.dataset.l === s.line));
      const vars = Object.entries(s.vars);
      el.querySelector(".tr-vars").innerHTML = vars.length ? vars.map(([k, v]) => `<div class="tr-var"><code>${esc(k)}</code>${/^\[.*\]$/.test(v) ? listBoxes(v.slice(1, -1).split(", ").filter(Boolean)) : `<b>${esc(v)}</b>`}</div>`).join("") : `<span class="muted">Henüz değişken yok</span>`;
      el.querySelector(".tr-out").textContent = s.out || " ";
      el.querySelector(".tr-pos").textContent = s.line < 0 ? "Program bitti" : `Sıradaki satır: ${s.line + 1}`;
      el.querySelector('[data-t="1"]').disabled = i === last;
      el.querySelector('[data-t="-1"]').disabled = i === 0;
    }
    el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { const t = +b.dataset.t; i = t === 0 ? 0 : Math.min(last, Math.max(0, i + t)); draw(); changed(); }));
    draw();
    return () => ({ done: i === last ? 1 : 0 });
  }

  function parsons(el, step, changed, seed) {
    const order = step.lines.map((_, k) => k);
    let r = seed;
    for (let k = order.length - 1; k > 0; k--) { r = (r * 9301 + 49297) % 233280; const j = Math.floor((r / 233280) * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
    if (order.every((v, k) => v === k)) order.reverse();
    let pool = [...order], placed = [];
    function draw() {
      el.innerHTML = `<div class="ps"><div class="ps-col"><h4>Satırlar</h4>${pool.map((k) => `<button type="button" class="ps-line" data-k="${k}">${esc(step.lines[k])}</button>`).join("") || `<span class="muted">Hepsi yerleşti</span>`}</div>
        <div class="ps-col ps-ans"><h4>Programın</h4>${placed.map((k, p) => `<button type="button" class="ps-line placed" data-p="${p}"><i>${p + 1}</i>${esc(step.lines[k])}</button>`).join("") || `<span class="muted">Satırlara dokunarak buraya ekle</span>`}</div></div>`;
      el.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { const k = +b.dataset.k; pool = pool.filter((x) => x !== k); placed.push(k); draw(); changed(); }));
      el.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { const p = +b.dataset.p; pool.push(placed[p]); placed.splice(p, 1); draw(); changed(); }));
    }
    draw();
    return () => ({ placed: placed.length, ok: placed.length === step.lines.length && placed.every((k, p) => step.lines[k] === step.lines[p]) ? 1 : 0 });
  }

  // ---------- Oynatıcı ----------
  let cur = null;

  function open(root, mod, id, hooks) {
    root.innerHTML = `<div class="lp"><p class="muted">Ders yükleniyor…</p></div>`;
    Promise.all([manifest(mod), lesson(mod, id)]).then(([man, les]) => {
      cur = { root, mod, man, les, hooks, idx: 0, points: 0, firstOk: 0, scored: 0, tries: 0, phase: "ask", chosen: null, state: () => ({}), showWhy: false };
      drawStep();
    }).catch(() => { root.innerHTML = `<div class="lp"><p>Ders bulunamadı.</p><a class="btn btn-outline" href="#ana">Ana sayfaya dön</a></div>`; });
  }

  function drawStep() {
    const c = cur, s = c.les.steps[c.idx];
    if (!s) return drawEnd();
    c.tries = 0; c.phase = "ask"; c.chosen = null; c.showWhy = false;
    const pct = Math.round((c.idx / c.les.steps.length) * 100);
    c.root.innerHTML = `<div class="lp">
      <div class="lp-top"><a class="lp-x" href="#p-${c.mod}" aria-label="Dersten çık">×</a><div class="progress lp-prog"><i style="width:${pct}%"></i></div><span class="lp-pts num">${c.points} puan</span></div>
      <p class="lp-eyebrow">${esc(c.les.title)} · ${c.idx + 1} / ${c.les.steps.length}</p>
      <div class="lp-prompt">${md(s.prompt)}</div>
      ${s.code && s.type !== "trace" ? `<pre class="q-code"><code>${esc(s.code)}</code></pre>` : ""}
      <div class="lp-sim"></div>
      ${s.options ? `<div class="opts lp-opts">${s.options.map((o, i) => `<button type="button" class="opt" data-o="${i}" aria-pressed="false"><span class="letter">${"ABCDE"[i]}</span>${s.codeOptions ? `<pre>${esc(o)}</pre>` : `<span>${md(o)}</span>`}</button>`).join("")}</div>` : ""}
      ${s.goal ? `<p class="lp-goal"><i></i>${esc(s.goal)}</p>` : ""}
      <div class="lp-foot"></div></div>`;
    const simEl = c.root.querySelector(".lp-sim");
    const changed = () => { updateGoal(); updateFoot(); };
    if (s.type === "trace") c.state = tracer(simEl, s, changed);
    else if (s.type === "parsons") c.state = parsons(simEl, s, changed, c.les.id.length * 7 + c.idx);
    else if (s.sim) c.state = SIMS[s.sim.kind](simEl, s.sim, changed);
    else { simEl.remove(); c.state = () => ({}); }
    simEl.addEventListener?.("simchange", changed);
    c.root.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => {
      if (c.phase === "right" || c.phase === "revealed") return;
      c.chosen = +b.dataset.o;
      c.root.querySelectorAll("[data-o]").forEach((x) => { x.setAttribute("aria-pressed", x === b); x.classList.remove("wrong"); });
      if (c.phase === "wrong") c.phase = "ask";
      updateFoot();
    }));
    updateGoal(); updateFoot();
    window.MAC?.refresh();
  }

  const ok = (s) => (s.type === "choice" ? cur.chosen === s.answer : s.type === "parsons" ? cur.state().ok === 1 : check(s.check, cur.state()));
  const graded = (s) => s.type === "choice" || s.type === "parsons" || (s.type === "sim" && s.check);

  function updateGoal() {
    const s = cur.les.steps[cur.idx], g = cur.root.querySelector(".lp-goal");
    if (g && s.check) g.classList.toggle("met", check(s.check, cur.state()));
  }

  function updateFoot() {
    const c = cur, s = c.les.steps[c.idx], foot = c.root.querySelector(".lp-foot");
    if (!foot) return;
    const mac = (mood) => window.MAC ? window.MAC.svg(mood, 56) : "";
    if (c.phase === "ask") {
      if (s.type === "info") { foot.innerHTML = `<button class="btn btn-primary" data-f="next">Devam</button>`; }
      else {
        const ready = s.type === "choice" ? c.chosen !== null : s.type === "parsons" ? c.state().placed === s.lines.length : true;
        foot.innerHTML = `<button class="btn btn-primary" data-f="check" ${ready ? "" : "disabled"}>Kontrol et</button>`;
      }
    } else {
      const right = c.phase === "right";
      const msg = right ? (c.tries === 1 ? "Harika!" : "Oldu!") : c.phase === "revealed" ? "Bu sefer olmadı, birlikte bakalım." : "Henüz değil.";
      const extra = c.phase === "wrong" ? (s.hint ? md(s.hint) : "Bir daha dene.") : c.showWhy || c.phase === "revealed" ? md(s.why || "") : "";
      foot.innerHTML = `<div class="lp-fb ${right ? "ok" : "no"}">${mac(right ? "happy" : c.phase === "wrong" ? "think" : "oops")}
        <div><b>${msg}${right && c.gain ? ` <span class="xp-pop">+${c.gain} puan</span>` : ""}</b>${extra ? `<p>${extra}</p>` : ""}</div>
        <div class="lp-fb-btns">${c.phase === "wrong" ? `<button class="btn btn-primary" data-f="retry">Tekrar dene</button>` : `${right && s.why && !c.showWhy ? `<button class="btn btn-outline" data-f="why">Neden?</button>` : ""}<button class="btn btn-primary" data-f="next">Devam</button>`}</div></div>`;
    }
    foot.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => act(b.dataset.f)));
  }

  function act(a) {
    const c = cur, s = c.les.steps[c.idx];
    if (a === "next") { c.idx++; return drawStep(); }
    if (a === "why") { c.showWhy = true; return updateFoot(); }
    if (a === "retry") { c.phase = "ask"; return updateFoot(); }
    if (a === "check") {
      c.tries++;
      const good = ok(s);
      if (graded(s) && c.tries === 1) { c.scored++; if (good) c.firstOk++; c.hooks.onAttempt?.(c.les, s, good); }
      if (good) { c.gain = c.tries === 1 ? 10 : 5; c.points += c.gain; c.phase = "right"; }
      else if (c.tries >= 2) { c.gain = 0; c.phase = "revealed"; }
      else c.phase = "wrong";
      if (s.type === "choice") c.root.querySelectorAll("[data-o]").forEach((x) => {
        const i = +x.dataset.o;
        x.classList.toggle("correct", c.phase !== "wrong" && i === s.answer);
        x.classList.toggle("wrong", !good && i === c.chosen);
        if (c.phase !== "wrong") x.disabled = true;
      });
      c.root.querySelector(".lp-pts").textContent = `${c.points} puan`;
      updateFoot();
    }
  }

  function drawEnd() {
    const c = cur, list = c.man.lessons, k = list.findIndex((l) => l.id === c.les.id), next = list[k + 1];
    c.hooks.onFinish?.(c.les, { points: c.points, correct: c.firstOk, total: c.scored });
    c.root.innerHTML = `<div class="lp lp-end">${window.MAC ? window.MAC.svg("happy", 110) : ""}
      <h2>Ders tamamlandı!</h2><p class="lp-prompt">${esc(c.les.title)}</p>
      <div class="lp-stats"><div><b class="num">${c.points}</b><span>puan</span></div><div><b class="num">${c.firstOk}/${c.scored}</b><span>ilk denemede doğru</span></div></div>
      <div class="ob-actions">${next ? `<a class="btn btn-primary" href="#ders-${c.mod}.${next.id}">Sıradaki ders: ${esc(next.title)}</a>` : ""}<a class="btn btn-outline" href="#p-${c.mod}">Programa dön</a></div></div>`;
    cur = null;
    window.MAC?.refresh();
  }

  // Mac için bağlam: cevaplanmamış adımda doğru cevap gizlenir.
  function context() {
    if (!cur) return null;
    const s = cur.les.steps[cur.idx]; if (!s) return null;
    const open = cur.phase === "ask" || cur.phase === "wrong";
    let ctx = `Ders: ${cur.les.title} (${cur.les.level}). Adım ${cur.idx + 1}/${cur.les.steps.length}: ${s.prompt}`;
    if (s.code) ctx += ` Kod:\n${s.code}\n`;
    if (s.options) ctx += ` Şıklar: ${s.options.join(" | ")}.`;
    if (s.goal) ctx += ` Hedef: ${s.goal}.`;
    ctx += open ? " Öğrenci henüz doğru cevaba ulaşmadı: cevabı söyleme, ipucu ver." : ` Açıklama: ${s.why || ""}`;
    const hide = open && s.type === "choice" ? [s.options[s.answer], "ABCDE"[s.answer]] : null;
    return { page: `Ders: ${cur.les.title}`, context: ctx, question: true, hide };
  }

  return { manifest, lesson, open, context };
})();
