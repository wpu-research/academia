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

  // Ortak: kaydırıcı satırı (etiket + değer + range).
  function slider(label, key, min, max, step, value) {
    return `<label class="sim-slider"><span>${label}: <b data-v="${key}">${fmt(value)}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-k="${key}"></label>`;
  }

  // Onluk bloklar: yüzlük, onluk, birlik; ekle, çıkar, grupla ve çöz.
  SIMS["onluk-bloklar"] = (el, cfg, changed) => {
    const c = { h: cfg.h ?? 0, t: cfg.t ?? 0, o: cfg.o ?? 0 };
    const MAX = { h: 9, t: 19, o: 19 };
    const NAME = { h: "Yüzlük", t: "Onluk", o: "Birlik" };
    function strip(k) {
      const n = c[k];
      if (k === "h") return `<svg viewBox="0 0 ${Math.max(1, n) * 62} 58" class="bb-strip" style="width:${Math.max(1, n) * 62}px">${[...Array(n)].map((_, i) => `<g transform="translate(${i * 62},1)"><rect width="56" height="56" class="bb-h"/>${[...Array(9)].map((_, j) => `<line x1="${(j + 1) * 5.6}" y1="0" x2="${(j + 1) * 5.6}" y2="56" class="bb-l"/><line y1="${(j + 1) * 5.6}" x1="0" y2="${(j + 1) * 5.6}" x2="56" class="bb-l"/>`).join("")}</g>`).join("")}</svg>`;
      if (k === "t") return `<svg viewBox="0 0 ${Math.max(1, n) * 12} 58" class="bb-strip" style="width:${Math.max(1, n) * 12}px">${[...Array(n)].map((_, i) => `<g transform="translate(${i * 12},1)"><rect width="8" height="56" class="bb-t"/>${[...Array(9)].map((_, j) => `<line x1="0" x2="8" y1="${(j + 1) * 5.6}" y2="${(j + 1) * 5.6}" class="bb-l"/>`).join("")}</g>`).join("")}</svg>`;
      return `<svg viewBox="0 0 ${Math.max(1, Math.ceil(n / 2)) * 13} 26" class="bb-strip" style="width:${Math.max(1, Math.ceil(n / 2)) * 13}px">${[...Array(n)].map((_, i) => `<rect x="${Math.floor(i / 2) * 13}" y="${(i % 2) * 13}" width="10" height="10" class="bb-o"/>`).join("")}</svg>`;
    }
    function draw() {
      const value = c.h * 100 + c.t * 10 + c.o;
      el.innerHTML = `<div class="bb">${["h", "t", "o"].map((k) => `<div class="bb-row"><span class="bb-name">${NAME[k]} <b class="num">${c[k]}</b></span>
        <span class="bb-btns"><button type="button" class="btn btn-outline btn-small" data-a="-${k}" aria-label="${NAME[k]} çıkar" ${c[k] ? "" : "disabled"}>−</button><button type="button" class="btn btn-outline btn-small" data-a="+${k}" aria-label="${NAME[k]} ekle" ${c[k] < MAX[k] ? "" : "disabled"}>+</button></span>
        <div class="bb-vis">${strip(k)}</div></div>`).join("")}
        <div class="bb-ex">
          <button type="button" class="btn btn-small btn-outline" data-a="g-o" ${c.o >= 10 && c.t < MAX.t ? "" : "disabled"}>10 birlik → 1 onluk</button>
          <button type="button" class="btn btn-small btn-outline" data-a="g-t" ${c.t >= 10 && c.h < MAX.h ? "" : "disabled"}>10 onluk → 1 yüzlük</button>
          <button type="button" class="btn btn-small btn-outline" data-a="c-t" ${c.t >= 1 && c.o <= MAX.o - 10 ? "" : "disabled"}>1 onluk → 10 birlik</button>
        </div>
        <p class="bb-val"><b class="num">${value}</b> = ${c.h} yüzlük + ${c.t} onluk + ${c.o} birlik</p></div>`;
      el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a[0] === "+") c[a[1]]++; else if (a[0] === "-") c[a[1]]--;
        else if (a === "g-o") { c.o -= 10; c.t++; } else if (a === "g-t") { c.t -= 10; c.h++; } else if (a === "c-t") { c.t--; c.o += 10; }
        draw(); changed();
        el.querySelector(`[data-a="${a}"]`)?.focus();
      }));
    }
    draw();
    return () => ({ value: c.h * 100 + c.t * 10 + c.o, h: c.h, t: c.t, o: c.o, canonical: c.o < 10 && c.t < 10 ? 1 : 0 });
  };

  // Alan modeli: satır × sütun dikdörtgen; isteğe bağlı sütunları onluk ve birlik diye ayırır.
  SIMS["alan-modeli"] = (el, cfg, changed) => {
    let rows = cfg.rows ?? 3, cols = cfg.cols ?? 4;
    el.innerHTML = `<div class="plane-wrap"><div class="am-host"></div><div class="plane-ctrl"><p class="eq"></p><p class="slope am-split"></p>
      ${cfg.fixed ? "" : slider("Satır", "rows", 1, cfg.max ?? 12, 1, rows) + slider("Sütun", "cols", 1, cfg.max ?? 12, 1, cols)}</div></div>`;
    function draw() {
      const s = 24, split = cfg.split && cols > 10 ? 10 : null;
      const svg = svgEl("svg", { viewBox: `0 0 ${12 * s + 4} ${12 * s + 4}`, class: "sim-svg", role: "img", "aria-label": `${rows} × ${cols} dikdörtgen` });
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) svgEl("rect", { x: 2 + k * s, y: 2 + r * s, width: s - 2, height: s - 2, rx: 3, class: split !== null && k >= split ? "am-b" : "am-a" }, svg);
      el.querySelector(".am-host").replaceChildren(svg);
      el.querySelector(".eq").textContent = `${rows} × ${cols} = ${rows * cols}`;
      el.querySelector(".am-split").textContent = split !== null ? `${rows} × ${split} + ${rows} × ${cols - split} = ${rows * split} + ${rows * (cols - split)}` : "Her kare 1 birimkare.";
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = b.dataset.v === "rows" ? rows : cols; });
    }
    el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { if (i.dataset.k === "rows") rows = +i.value; else cols = +i.value; draw(); changed(); }));
    draw();
    return () => ({ rows, cols, area: rows * cols });
  };

  // Denklem terazisi: ax + b = c. İki tarafa aynı işlem dengeyi korur; tek tarafa işlem terazinin eğilmesine yol açar.
  SIMS["denklem-terazisi"] = (el, cfg, changed) => {
    const X = (cfg.c - cfg.b) / cfg.a;
    let a = cfg.a, L = cfg.b, R = cfg.c, tilt = 0, msg = "";
    const hist = [];
    function draw() {
      const ang = tilt ? Math.max(-12, Math.min(12, tilt * 4)) : 0;
      const svg = svgEl("svg", { viewBox: "0 0 640 250", class: "sim-svg", role: "img", "aria-label": `${a}x + ${L} = ${R}` });
      svgEl("polygon", { points: "300,240 340,240 320,120", class: "bl-stand" }, svg);
      const g = svgEl("g", { transform: `rotate(${ang} 320 120)` }, svg);
      svgEl("line", { x1: 80, y1: 120, x2: 560, y2: 120, class: "bl-beam" }, g);
      const pan = (cx, xs, ones) => {
        svgEl("line", { x1: cx - 90, y1: 120, x2: cx - 90, y2: 150, class: "bl-str" }, g); svgEl("line", { x1: cx + 90, y1: 120, x2: cx + 90, y2: 150, class: "bl-str" }, g);
        svgEl("rect", { x: cx - 100, y: 150, width: 200, height: 10, rx: 4, class: "bl-pan" }, g);
        let k = 0;
        for (let i = 0; i < xs; i++, k++) { const x = cx - 92 + (k % 6) * 31, y = 118 - Math.floor(k / 6) * 31 + 30; svgEl("rect", { x, y: y - 2, width: 28, height: 28, rx: 4, class: "bl-x" }, g); const t = svgEl("text", { x: x + 14, y: y + 17, class: "bl-xt" }, g); t.textContent = "x"; }
        for (let i = 0; i < ones; i++, k++) { const x = cx - 92 + (k % 6) * 31 + 14, y = 118 - Math.floor(k / 6) * 31 + 44; svgEl("circle", { cx: x, cy: y, r: 12, class: "bl-one" }, g); const t = svgEl("text", { x, y: y + 5, class: "bl-ot" }, g); t.textContent = "1"; }
      };
      pan(180, a, L); pan(460, 0, R);
      const eqTxt = `${a === 1 ? "" : a}x${L ? ` + ${L}` : ""} = ${R}`;
      el.innerHTML = `<div class="bl-host"></div><p class="eq bl-eq">${tilt ? "Terazi bozuldu!" : eqTxt}</p>
        <div class="bb-ex"><button type="button" class="btn btn-small btn-outline" data-a="both1" ${L > 0 && R > 0 && !tilt ? "" : "disabled"}>İki taraftan 1 çıkar</button>
        <button type="button" class="btn btn-small btn-outline" data-a="div" ${L === 0 && a > 1 && !tilt && R % a === 0 ? "" : "disabled"}>İki tarafı ${a}'ye böl</button>
        <button type="button" class="btn btn-small btn-outline" data-a="left1" ${L > 0 && !tilt ? "" : "disabled"}>Yalnız soldan 1 çıkar</button>
        <button type="button" class="btn btn-small btn-outline" data-a="undo" ${hist.length ? "" : "disabled"}>Geri al</button></div>${msg ? `<p class="note">${msg}</p>` : ""}`;
      el.querySelector(".bl-host").replaceChildren(svg);
      el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
        const act = b.dataset.a;
        if (act === "undo") { [a, L, R, tilt] = hist.pop(); msg = ""; }
        else {
          hist.push([a, L, R, tilt]);
          if (act === "both1") { L--; R--; msg = ""; }
          else if (act === "div") { R /= a; a = 1; msg = ""; }
          else if (act === "left1") { L--; tilt = -1 * ((a * X + L) - R); msg = "Yalnız bir taraftan çıkarınca iki taraf artık eşit değil. Geri al ve iki taraftan birlikte çıkar."; }
        }
        draw(); changed();
      }));
    }
    draw();
    return () => ({ solved: a === 1 && L === 0 && !tilt ? 1 : 0, x: a === 1 && L === 0 && !tilt ? R : null });
  };

  // Açı ölçer: sabit ışın sağa doğru; ikinci ışın sürüklenir.
  SIMS["aci-olcer"] = (el, cfg, changed) => {
    let ang = cfg.angle ?? 40;
    const CX = 320, CY = 230, R = 180;
    const type = (d) => (d === 0 ? "sıfır açı" : d < 90 ? "dar açı" : d === 90 ? "dik açı" : d < 180 ? "geniş açı" : "doğru açı");
    const svg = svgEl("svg", { viewBox: "0 0 640 260", class: "sim-svg drag", role: "slider", tabindex: 0, "aria-label": "Açı" });
    for (let d = 0; d <= 180; d += 10) {
      const r = (d * Math.PI) / 180, big = d % 30 === 0;
      svgEl("line", { x1: CX + Math.cos(r) * (R + 4), y1: CY - Math.sin(r) * (R + 4), x2: CX + Math.cos(r) * (R + (big ? 18 : 10)), y2: CY - Math.sin(r) * (R + (big ? 18 : 10)), class: "ao-tick" }, svg);
      if (big) { const t = svgEl("text", { x: CX + Math.cos(r) * (R + 34), y: CY - Math.sin(r) * (R + 34) + 5, class: "ao-num" }, svg); t.textContent = d; }
    }
    svgEl("path", { d: `M${CX - R},${CY} A${R},${R} 0 0 1 ${CX + R},${CY}`, class: "ao-arc" }, svg);
    svgEl("line", { x1: CX, y1: CY, x2: CX + R, y2: CY, class: "ao-ray" }, svg);
    const fill = svgEl("path", { class: "ao-fill" }, svg);
    const ray = svgEl("line", { x1: CX, y1: CY, class: "ao-ray move" }, svg);
    const knob = svgEl("circle", { r: 12, class: "nl-knob" }, svg);
    svgEl("circle", { cx: CX, cy: CY, r: 5, class: "ao-v" }, svg);
    const lab = svgEl("text", { x: 24, y: 34, class: "ao-lab" }, svg);
    function place() {
      const r = (ang * Math.PI) / 180, x = CX + Math.cos(r) * R, y = CY - Math.sin(r) * R;
      ray.setAttribute("x2", x); ray.setAttribute("y2", y); knob.setAttribute("cx", x); knob.setAttribute("cy", y);
      const rr = 60, ex = CX + Math.cos(r) * rr, ey = CY - Math.sin(r) * rr;
      fill.setAttribute("d", `M${CX},${CY} L${CX + rr},${CY} A${rr},${rr} 0 0 0 ${ex},${ey} Z`);
      lab.textContent = `${ang}° · ${type(ang)}`;
      svg.setAttribute("aria-valuetext", lab.textContent);
    }
    let drag = false;
    const move = (ev) => { const p = svgPoint(svg, ev); let d = Math.round((Math.atan2(CY - p.y, p.x - CX) * 180) / Math.PI); if (d < 0) d = d < -90 ? 180 : 0; ang = Math.min(180, Math.max(0, d)); place(); changed(); };
    svg.addEventListener("pointerdown", (ev) => { drag = true; svg.setPointerCapture(ev.pointerId); move(ev); });
    svg.addEventListener("pointermove", (ev) => { if (drag) move(ev); });
    svg.addEventListener("pointerup", () => { drag = false; });
    svg.addEventListener("keydown", (e) => { const s = e.shiftKey ? 10 : 1, d = e.key === "ArrowRight" || e.key === "ArrowDown" ? -s : e.key === "ArrowLeft" || e.key === "ArrowUp" ? s : 0; if (d) { e.preventDefault(); ang = Math.min(180, Math.max(0, ang + d)); place(); changed(); } });
    el.replaceChildren(svg); place();
    return () => ({ angle: ang });
  };

  // Geometri tahtası: köşeleri tamsayı noktalara oturan çokgen; alan (shoelace) ve iç açılar.
  SIMS["geometri-tahtasi"] = (el, cfg, changed) => {
    const pts = cfg.points.map((p) => [...p]);
    const S = 48, W = 8, H = 6, P = 24, X = (v) => P + v * S, Y = (v) => P + (H - v) * S;
    const area = () => Math.abs(pts.reduce((s, [x1, y1], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x1 * y2 - x2 * y1; }, 0)) / 2;
    const angles = () => pts.map((p, i) => {
      const a = pts[(i + pts.length - 1) % pts.length], b = pts[(i + 1) % pts.length];
      const v1 = [a[0] - p[0], a[1] - p[1]], v2 = [b[0] - p[0], b[1] - p[1]];
      const c = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1);
      return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
    });
    el.innerHTML = `<div class="plane-wrap"><div class="gb-host"></div><div class="plane-ctrl"><p class="eq gb-area"></p><p class="slope gb-ang"></p><p class="note">Köşeleri sürükle; köşeler noktalara oturur.</p></div></div>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${2 * P + W * S} ${2 * P + H * S}`, class: "sim-svg drag", role: "img", "aria-label": "Geometri tahtası" });
    el.querySelector(".gb-host").replaceChildren(svg);
    let dragI = -1;
    function draw() {
      svg.replaceChildren();
      for (let x = 0; x <= W; x++) for (let y = 0; y <= H; y++) svgEl("circle", { cx: X(x), cy: Y(y), r: 3, class: "gb-peg" }, svg);
      svgEl("polygon", { points: pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(" "), class: "gb-poly" }, svg);
      const an = angles();
      pts.forEach(([x, y], i) => {
        svgEl("circle", { cx: X(x), cy: Y(y), r: 11, class: "nl-knob", "data-i": i }, svg);
        if (cfg.angles) { const t = svgEl("text", { x: X(x), y: Y(y) - 16, class: "gb-al" }, svg); t.textContent = `${Math.round(an[i])}°`; }
      });
      el.querySelector(".gb-area").textContent = `Alan = ${fmt(area(), 1)} birimkare`;
      el.querySelector(".gb-ang").textContent = cfg.angles ? `İç açılar toplamı = ${Math.round(an.reduce((s, v) => s + v, 0))}°` : "";
    }
    const snapTo = (ev) => { const p = svgPoint(svg, ev); return [Math.max(0, Math.min(W, Math.round((p.x - P) / S))), Math.max(0, Math.min(H, Math.round(H - (p.y - P) / S)))]; };
    svg.addEventListener("pointerdown", (ev) => { const k = ev.target.dataset?.i; if (k === undefined) return; dragI = +k; svg.setPointerCapture(ev.pointerId); });
    svg.addEventListener("pointermove", (ev) => { if (dragI < 0) return; const q = snapTo(ev); if (pts.some((p, j) => j !== dragI && p[0] === q[0] && p[1] === q[1])) return; pts[dragI] = q; draw(); changed(); });
    svg.addEventListener("pointerup", () => { dragI = -1; });
    draw();
    return () => { const an = angles(); return { area: area(), angleSum: Math.round(an.reduce((s, v) => s + v, 0)), n: pts.length }; };
  };

  // Veri grafiği: çubuklara dokunarak/sürükleyerek değer ver; ortalama, ortanca, tepe değer canlı.
  SIMS["veri-grafigi"] = (el, cfg, changed) => {
    const vals = [...cfg.values], max = cfg.max ?? 10;
    const W = 600, H = 220, B = 20, L = 34;
    const bw = (W - L) / vals.length;
    const stats = () => {
      const s = [...vals].sort((x, y) => x - y), n = s.length, mean = vals.reduce((a, b) => a + b, 0) / n;
      const median = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
      const cnt = {}; vals.forEach((v) => (cnt[v] = (cnt[v] || 0) + 1));
      const top = Math.max(...Object.values(cnt)), modes = Object.keys(cnt).filter((k) => cnt[k] === top).map(Number);
      return { mean, median, mode: modes.length === 1 && top > 1 ? modes[0] : null, total: mean * n, range: s[n - 1] - s[0] };
    };
    el.innerHTML = `<div class="vg-host"></div><p class="vg-stats"></p>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H + B + 26}`, class: "sim-svg drag", role: "img", "aria-label": "Veri grafiği" });
    el.querySelector(".vg-host").replaceChildren(svg);
    const Yv = (v) => B + H - (v / max) * H;
    let dragI = -1;
    function draw() {
      svg.replaceChildren();
      for (let v = 0; v <= max; v += 2) { svgEl("line", { x1: L, x2: W, y1: Yv(v), y2: Yv(v), class: "dc-grid" }, svg); const t = svgEl("text", { x: L - 6, y: Yv(v) + 4, class: "dc-ax" }, svg); t.textContent = v; }
      vals.forEach((v, i) => {
        svgEl("rect", { x: L + i * bw + bw * 0.18, y: Yv(v), width: bw * 0.64, height: Yv(0) - Yv(v), rx: 3, class: "dc-bar", "data-i": i }, svg);
        const t = svgEl("text", { x: L + i * bw + bw / 2, y: Yv(v) - 6, class: "dc-key" }, svg); t.textContent = v;
        const k = svgEl("text", { x: L + i * bw + bw / 2, y: H + B + 20, class: "dc-ax vg-lab" }, svg); k.textContent = cfg.labels[i];
      });
      const st = stats();
      svgEl("line", { x1: L, x2: W, y1: Yv(st.mean), y2: Yv(st.mean), class: "dc-theo" }, svg);
      el.querySelector(".vg-stats").innerHTML = `Ortalama <b class="num">${fmt(st.mean)}</b> · Ortanca <b class="num">${fmt(st.median)}</b> · Tepe değer <b class="num">${st.mode ?? "yok"}</b> · Açıklık <b class="num">${st.range}</b> <span class="muted">(yeşil kesikli çizgi: ortalama)</span>`;
    }
    const setFrom = (ev) => { const p = svgPoint(svg, ev); const i = dragI >= 0 ? dragI : Math.floor((p.x - L) / bw); if (i < 0 || i >= vals.length) return; dragI = i; vals[i] = Math.max(0, Math.min(max, Math.round(((B + H - p.y) / H) * max))); draw(); changed(); };
    svg.addEventListener("pointerdown", (ev) => { dragI = -1; svg.setPointerCapture(ev.pointerId); setFrom(ev); });
    svg.addEventListener("pointermove", (ev) => { if (dragI >= 0 && ev.buttons) setFrom(ev); });
    svg.addEventListener("pointerup", () => { dragI = -1; });
    draw();
    return () => stats();
  };

  // Fonksiyon grafiği: f(x) = a·g(x − h) + k; g ∈ {x², |x|, √x, sin x}.
  SIMS["fonksiyon-grafigi"] = (el, cfg, changed) => {
    const G = { kare: [(x) => x * x, (u) => (u === "x" ? "x²" : `(${u})²`)], mutlak: [(x) => Math.abs(x), (u) => `|${u}|`], kok: [(x) => (x >= 0 ? Math.sqrt(x) : NaN), (u) => (u === "x" ? "√x" : `√(${u})`)], sin: [(x) => Math.sin(x), (u) => (u === "x" ? "sin x" : `sin(${u})`)] }[cfg.g || "kare"];
    let a = cfg.a ?? 1, h = cfg.h ?? 0, k = cfg.k ?? 0;
    const S = 28, O = 200, X = (v) => O + v * S, Y = (v) => O - v * S;
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl"><p class="eq"></p>${slider("a", "a", -3, 3, 0.5, a)}${slider("h", "h", -4, 4, 1, h)}${slider("k", "k", -4, 4, 1, k)}</div></div>`;
    function curve(fn, cls, svg) { let d = "", pen = false; for (let i = 0; i <= 300; i++) { const x = -7.2 + (i / 300) * 14.4, y = fn(x); if (!isFinite(y) || Math.abs(y) > 20) { pen = false; continue; } d += `${pen ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`; pen = true; } svgEl("path", { d, class: cls }, svg); }
    function draw() {
      const svg = svgEl("svg", { viewBox: "0 0 400 400", class: "sim-svg plane-svg", role: "img", "aria-label": "Fonksiyon grafiği" });
      for (let i = -7; i <= 7; i++) { svgEl("line", { x1: X(i), y1: 0, x2: X(i), y2: 400, class: i ? "pl-grid" : "pl-axis" }, svg); svgEl("line", { x1: 0, y1: Y(i), x2: 400, y2: Y(i), class: i ? "pl-grid" : "pl-axis" }, svg); }
      curve(G[0], "fg-parent", svg);
      curve((x) => a * G[0](x - h) + k, "pl-line fg-curve", svg);
      if (cfg.target) { const [tx, ty] = cfg.target, hit = h === tx && k === ty; svgEl("circle", { cx: X(tx), cy: Y(ty), r: 8, class: hit ? "pl-pt hit" : "pl-pt" }, svg); const t = svgEl("text", { x: X(tx) + 10, y: Y(ty) - 10, class: "pl-ptl" }, svg); t.textContent = `(${tx}, ${ty})`; }
      el.querySelector(".plane").replaceChildren(svg);
      const sg = (v) => (v < 0 ? ` − ${fmt(-v)}` : ` + ${fmt(v)}`);
      const inner = h === 0 ? "x" : h > 0 ? `x − ${fmt(h)}` : `x + ${fmt(-h)}`;
      const coef = a === 1 ? "" : a === -1 ? "−" : `${a < 0 ? "−" : ""}${fmt(Math.abs(a))}`;
      el.querySelector(".eq").textContent = `f(x) = ${coef}${G[1](inner)}${k ? sg(k) : ""}`;
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = fmt({ a, h, k }[b.dataset.v]); });
    }
    el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { ({ a: () => (a = +i.value), h: () => (h = +i.value), k: () => (k = +i.value) })[i.dataset.k](); draw(); changed(); }));
    draw();
    return () => ({ a, h, k });
  };

  // Birim çember: açıyı sürükle; kosinüs yatay, sinüs dikey parça.
  SIMS["birim-cember"] = (el, cfg, changed) => {
    let deg = cfg.deg ?? 30;
    const CX = 200, CY = 190, R = 150;
    const radText = (d) => { const g = gcd(d, 180), n = d / g, m = 180 / g; return d === 0 ? "0" : `${n === 1 ? "" : n}π${m === 1 ? "" : "/" + m}`; };
    el.innerHTML = `<div class="plane-wrap"><div class="uc-host"></div><div class="plane-ctrl"><p class="eq uc-deg"></p><p class="slope uc-vals"></p><p class="note">Noktayı çember üzerinde sürükle ya da ok tuşlarını kullan (5° adım).</p></div></div>`;
    const svg = svgEl("svg", { viewBox: "0 0 400 380", class: "sim-svg drag", tabindex: 0, role: "slider", "aria-label": "Birim çemberdeki açı" });
    el.querySelector(".uc-host").replaceChildren(svg);
    function draw() {
      svg.replaceChildren();
      svgEl("line", { x1: 20, y1: CY, x2: 380, y2: CY, class: "pl-axis" }, svg); svgEl("line", { x1: CX, y1: 20, x2: CX, y2: 360, class: "pl-axis" }, svg);
      svgEl("circle", { cx: CX, cy: CY, r: R, class: "uc-c" }, svg);
      const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r), px = CX + c * R, py = CY - s * R;
      const rr = 34; svgEl("path", { d: `M${CX},${CY} L${CX + rr},${CY} A${rr},${rr} 0 ${deg > 180 ? 1 : 0} 0 ${CX + Math.cos(r) * rr},${CY - Math.sin(r) * rr} Z`, class: "ao-fill" }, svg);
      svgEl("line", { x1: CX, y1: CY, x2: px, y2: py, class: "uc-r" }, svg);
      svgEl("line", { x1: CX, y1: CY, x2: px, y2: CY, class: "uc-cos" }, svg);
      svgEl("line", { x1: px, y1: CY, x2: px, y2: py, class: "uc-sin" }, svg);
      svgEl("circle", { cx: px, cy: py, r: 11, class: "nl-knob" }, svg);
      [["1", CX + R + 8, CY + 18], ["−1", CX - R - 22, CY + 18], ["1", CX + 8, CY - R - 6], ["−1", CX + 8, CY + R + 18]].forEach(([t, x, y]) => { const e = svgEl("text", { x, y, class: "pl-num" }, svg); e.textContent = t; });
      const f3 = (v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 3);
      el.querySelector(".uc-deg").textContent = `${deg}° = ${radText(deg)} rad`;
      el.querySelector(".uc-vals").innerHTML = `<span class="uc-k cos">cos ${deg}° = <b class="num">${f3(c)}</b></span><br><span class="uc-k sin">sin ${deg}° = <b class="num">${f3(s)}</b></span><br><span class="muted">sin² + cos² = ${f3(s * s + c * c)}</span>`;
    }
    let drag = false;
    const move = (ev) => { const p = svgPoint(svg, ev); let d = Math.round((Math.atan2(CY - p.y, p.x - CX) * 180) / Math.PI / 5) * 5; if (d < 0) d += 360; deg = d % 360; draw(); changed(); };
    svg.addEventListener("pointerdown", (ev) => { drag = true; svg.setPointerCapture(ev.pointerId); move(ev); });
    svg.addEventListener("pointermove", (ev) => { if (drag) move(ev); });
    svg.addEventListener("pointerup", () => { drag = false; });
    svg.addEventListener("keydown", (e) => { const d = e.key === "ArrowLeft" || e.key === "ArrowUp" ? 5 : e.key === "ArrowRight" || e.key === "ArrowDown" ? -5 : 0; if (d) { e.preventDefault(); deg = (deg + d + 360) % 360; draw(); changed(); } });
    draw();
    return () => ({ deg, sin: Math.sin((deg * Math.PI) / 180), cos: Math.cos((deg * Math.PI) / 180) });
  };

  // İntegral alanı: f(x) = x², [0, b] aralığında n dikdörtgenle Riemann toplamı.
  SIMS["integral-alan"] = (el, cfg, changed) => {
    const b = cfg.b ?? 2, f = (x) => x * x, exact = b ** 3 / 3;
    let n = cfg.n ?? 4, mode = cfg.mode ?? "sag";
    const W = 480, H = 320, X = (v) => 30 + (v / (b + 0.3)) * (W - 40), Y = (v) => H - 20 - (v / (b * b + 0.5)) * (H - 40);
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl"><p class="eq">f(x) = x², 0 ≤ x ≤ ${b}</p>
      <div class="seg-light" role="group" aria-label="Yükseklik noktası">${[["sol", "Sol uç"], ["orta", "Orta nokta"], ["sag", "Sağ uç"]].map(([k, l]) => `<button type="button" data-m="${k}" aria-pressed="${k === mode}">${l}</button>`).join("")}</div>
      ${slider("Dikdörtgen sayısı n", "n", 1, 100, 1, n)}<p class="slope ia-vals"></p></div></div>`;
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "Riemann toplamı" });
      svgEl("line", { x1: 20, y1: Y(0), x2: W, y2: Y(0), class: "pl-axis" }, svg); svgEl("line", { x1: X(0), y1: 0, x2: X(0), y2: H, class: "pl-axis" }, svg);
      const dx = b / n; let sum = 0;
      for (let i = 0; i < n; i++) {
        const xs = mode === "sol" ? i * dx : mode === "sag" ? (i + 1) * dx : (i + 0.5) * dx, hgt = f(xs); sum += hgt * dx;
        svgEl("rect", { x: X(i * dx), y: Y(hgt), width: Math.max(0.5, X((i + 1) * dx) - X(i * dx)), height: Y(0) - Y(hgt), class: "ia-rect" }, svg);
      }
      let d = ""; for (let i = 0; i <= 200; i++) { const x = (i / 200) * (b + 0.25); d += `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`; }
      svgEl("path", { d, class: "tg-curve" }, svg);
      const t = svgEl("text", { x: X(b), y: Y(0) + 16, class: "pl-num" }, svg); t.textContent = b;
      el.querySelector(".plane").replaceChildren(svg);
      el.querySelector(".ia-vals").innerHTML = `Dikdörtgenlerin toplamı: <b class="num">${fmt(sum, 4)}</b><br>Gerçek alan (${b}³/3): <b class="num">${fmt(exact, 4)}</b><br>Fark: <b class="num">${fmt(Math.abs(sum - exact), 4)}</b>`;
      el.querySelector('[data-v="n"]').textContent = n;
      el._sum = sum;
    }
    el.querySelector("input[data-k=n]").addEventListener("input", (e) => { n = +e.target.value; draw(); changed(); });
    el.querySelectorAll("[data-m]").forEach((btn) => btn.addEventListener("click", () => { mode = btn.dataset.m; el.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", x === btn)); draw(); changed(); }));
    draw();
    return () => ({ n, sum: el._sum, err: Math.abs(el._sum - exact) });
  };

  // Kaydırıcıları tek yerden bağlar: değerleri st nesnesine yazar, draw ve changed çağırır.
  function bindSliders(el, st, draw, changed) {
    el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); changed(); }));
  }
  const setVals = (el, st) => el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = fmt(st[b.dataset.v]); });

  // Ölçme: cetvel ve sürüklenen nesne; ölçmeye sıfırdan başlamayı öğretir.
  SIMS["olcme"] = (el, cfg, changed) => {
    let start = cfg.start ?? 2;
    const len = cfg.length ?? 7, U = 38, L = 20;
    const svg = svgEl("svg", { viewBox: `0 0 ${L * 2 + 15 * U} 150`, class: "sim-svg drag", role: "img", "aria-label": "Cetvel" });
    el.replaceChildren(svg);
    function draw() {
      svg.replaceChildren();
      svgEl("rect", { x: L - 10, y: 80, width: 15 * U + 20, height: 56, rx: 4, class: "ol-ruler" }, svg);
      for (let mm = 0; mm <= 150; mm++) {
        const x = L + (mm / 10) * U, h = mm % 10 === 0 ? 20 : mm % 5 === 0 ? 14 : 8;
        svgEl("line", { x1: x, x2: x, y1: 80, y2: 80 + h, class: "ol-tick" }, svg);
        if (mm % 10 === 0) { const t = svgEl("text", { x, y: 120, class: "ol-num" }, svg); t.textContent = mm / 10; }
      }
      const x0 = L + start * U;
      svgEl("rect", { x: x0, y: 34, width: len * U, height: 30, rx: 6, class: "ol-obj", "data-drag": 1 }, svg);
      svgEl("polygon", { points: `${x0 + len * U},34 ${x0 + len * U + 26},49 ${x0 + len * U},64`, class: "ol-tip" }, svg);
      [x0, x0 + len * U].forEach((x) => svgEl("line", { x1: x, x2: x, y1: 30, y2: 84, class: "ol-guide" }, svg));
      const t = svgEl("text", { x: L, y: 20, class: "ol-read" }, svg); t.textContent = `Başlangıç: ${fmt(start, 1)} cm · Bitiş: ${fmt(start + len, 1)} cm`;
    }
    let drag = null;
    svg.addEventListener("pointerdown", (ev) => { if (!ev.target.dataset?.drag) return; drag = svgPoint(svg, ev).x - (L + start * U); svg.setPointerCapture(ev.pointerId); });
    svg.addEventListener("pointermove", (ev) => { if (drag === null) return; start = Math.max(0, Math.min(15 - len, Math.round(((svgPoint(svg, ev).x - drag - L) / U) * 2) / 2)); draw(); changed(); });
    svg.addEventListener("pointerup", () => { drag = null; });
    draw();
    return () => ({ start, end: start + len });
  };

  // Katı cisim: birim küplerden dikdörtgenler prizması; hacim, yüzey alanı ve açınım.
  SIMS["kati-cisim"] = (el, cfg, changed) => {
    const st = { a: cfg.a ?? 3, b: cfg.b ?? 2, c: cfg.c ?? 2 };
    let net = false;
    el.innerHTML = `<div class="plane-wrap"><div class="kc-host"></div><div class="plane-ctrl"><p class="eq kc-v"></p><p class="slope kc-s"></p>
      ${slider("Uzunluk a", "a", 1, 6, 1, st.a)}${slider("Genişlik b", "b", 1, 6, 1, st.b)}${slider("Yükseklik c", "c", 1, 6, 1, st.c)}
      <button type="button" class="btn btn-outline btn-small kc-net">Açınımı göster</button></div></div>`;
    const host = el.querySelector(".kc-host");
    const iso = (x, y, z, s) => [200 + (x - y) * s * 0.866, 230 + (x + y) * s * 0.5 - z * s];
    function draw() {
      const { a, b, c } = st, svg = svgEl("svg", { viewBox: "0 0 400 300", class: "sim-svg", role: "img", "aria-label": `${a} × ${b} × ${c} prizma` });
      if (!net) {
        const s = Math.min(30, 200 / (a + b + c));
        const face = (pts, cls) => svgEl("polygon", { points: pts.map((p) => p.join(",")).join(" "), class: cls }, svg);
        for (let z = 0; z < c; z++) for (let y = b - 1; y >= 0; y--) for (let x = a - 1; x >= 0; x--) {
          if (x !== a - 1 && y !== b - 1 && z !== c - 1) continue;
          face([iso(x, y, z + 1, s), iso(x + 1, y, z + 1, s), iso(x + 1, y + 1, z + 1, s), iso(x, y + 1, z + 1, s)], "kc-top");
          face([iso(x + 1, y, z, s), iso(x + 1, y + 1, z, s), iso(x + 1, y + 1, z + 1, s), iso(x + 1, y, z + 1, s)], "kc-r");
          face([iso(x, y + 1, z, s), iso(x + 1, y + 1, z, s), iso(x + 1, y + 1, z + 1, s), iso(x, y + 1, z + 1, s)], "kc-l");
        }
      } else {
        const s = Math.min(22, 380 / (2 * a + 2 * b), 280 / (2 * b + c)), ox = (400 - (2 * a + 2 * b) * s) / 2, oy = (300 - (2 * b + c) * s) / 2;
        const rect = (x, y, w, h, lab) => { svgEl("rect", { x: ox + x * s, y: oy + y * s, width: w * s, height: h * s, class: "kc-net-f" }, svg); const t = svgEl("text", { x: ox + (x + w / 2) * s, y: oy + (y + h / 2) * s + 4, class: "pl-num" }, svg); t.textContent = lab; };
        rect(b, 0, a, b, `${a}×${b}`); rect(0, b, b, c, `${b}×${c}`); rect(b, b, a, c, `${a}×${c}`); rect(a + b, b, b, c, `${b}×${c}`); rect(2 * b + a, b, a, c, `${a}×${c}`); rect(b, b + c, a, b, `${a}×${b}`);
      }
      host.replaceChildren(svg);
      el.querySelector(".kc-v").textContent = `Hacim = ${a} × ${b} × ${c} = ${a * b * c} birimküp`;
      el.querySelector(".kc-s").textContent = `Yüzey alanı = 2 × (${a}×${b} + ${b}×${c} + ${a}×${c}) = ${2 * (a * b + b * c + a * c)} birimkare`;
      el.querySelector(".kc-net").textContent = net ? "Prizmayı göster" : "Açınımı göster";
      setVals(el, st);
    }
    el.querySelector(".kc-net").addEventListener("click", () => { net = !net; draw(); });
    bindSliders(el, st, draw, changed); draw();
    return () => ({ ...st, volume: st.a * st.b * st.c, surface: 2 * (st.a * st.b + st.b * st.c + st.a * st.c) });
  };

  // Örüntü: n. adımdaki şekil; kural a·n + b nokta (a sütun uzar, b sabit).
  SIMS["oruntu"] = (el, cfg, changed) => {
    const st = { n: cfg.n ?? 1 }, a = cfg.a ?? 3, b = cfg.b ?? 1;
    el.innerHTML = `<div class="or-host"></div>${slider("Adım n", "n", 1, cfg.max ?? 8, 1, st.n)}<p class="slope or-t"></p>`;
    function draw() {
      const svg = svgEl("svg", { viewBox: "0 0 600 170", class: "sim-svg", role: "img", "aria-label": "Örüntü" });
      const show = Math.min(st.n, 4), start = st.n - show + 1;
      for (let k = 0; k < show; k++) {
        const n = start + k, ox = 20 + k * 150;
        for (let i = 0; i < b; i++) svgEl("circle", { cx: ox + 8, cy: 140 - i * 16, r: 6, class: "or-b" }, svg);
        for (let col = 0; col < n; col++) for (let r = 0; r < a; r++) svgEl("circle", { cx: ox + 24 + col * (n > 6 ? 10 : 16), cy: 140 - r * 16, r: n > 6 ? 4 : 6, class: "or-a" }, svg);
        const t = svgEl("text", { x: ox + 50, y: 18, class: "pl-ptl" }, svg); t.textContent = `${n}. adım: ${a * n + b}`;
      }
      el.querySelector(".or-host").replaceChildren(svg);
      el.querySelector(".or-t").innerHTML = `${st.n}. adımda <b>${a * st.n + b}</b> nokta var. Gri noktalar her adımda aynı, kahverengi noktalar her adımda ${a} artıyor.`;
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => ({ n: st.n, count: a * st.n + b });
  };

  // Dönüşüm: L şeklini öteleme, yansıma ve döndürme ile hedefe oturt.
  SIMS["donusum"] = (el, cfg, changed) => {
    const base = cfg.shape || [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]];
    let pts = base.map((p) => [...p]);
    const target = cfg.target || null;
    const S = 26, O = 182, X = (v) => O + v * S, Y = (v) => O - v * S;
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl">
      <div class="bb-ex"><button type="button" class="btn btn-small btn-outline" data-t="L">← 1</button><button type="button" class="btn btn-small btn-outline" data-t="R">1 →</button><button type="button" class="btn btn-small btn-outline" data-t="U">↑ 1</button><button type="button" class="btn btn-small btn-outline" data-t="D">↓ 1</button></div>
      <div class="bb-ex"><button type="button" class="btn btn-small btn-outline" data-t="mx">x eksenine göre yansıt</button><button type="button" class="btn btn-small btn-outline" data-t="my">y eksenine göre yansıt</button><button type="button" class="btn btn-small btn-outline" data-t="rot">Orijin etrafında 90° döndür</button><button type="button" class="btn btn-small btn-outline" data-t="0">Baştan</button></div>
      <p class="slope dn-st"></p></div></div>`;
    const key = (ps) => ps.map((p) => p.join(",")).sort().join(" ");
    function draw() {
      const svg = svgEl("svg", { viewBox: "0 0 364 364", class: "sim-svg plane-svg", role: "img", "aria-label": "Dönüşüm" });
      for (let i = -7; i <= 7; i++) { svgEl("line", { x1: X(i), y1: 0, x2: X(i), y2: 364, class: i ? "pl-grid" : "pl-axis" }, svg); svgEl("line", { x1: 0, y1: Y(i), x2: 364, y2: Y(i), class: i ? "pl-grid" : "pl-axis" }, svg); }
      if (target) svgEl("polygon", { points: target.map(([x, y]) => `${X(x)},${Y(y)}`).join(" "), class: "dn-target" }, svg);
      svgEl("polygon", { points: pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(" "), class: "gb-poly" }, svg);
      el.querySelector(".plane").replaceChildren(svg);
      el.querySelector(".dn-st").textContent = target ? (key(pts) === key(target) ? "Şekil hedefin üzerinde!" : "Kesikli çizgili hedefe oturt.") : "";
    }
    el.querySelectorAll("[data-t]").forEach((btn) => btn.addEventListener("click", () => {
      const t = btn.dataset.t;
      pts = t === "0" ? base.map((p) => [...p]) : pts.map(([x, y]) => ({ L: [x - 1, y], R: [x + 1, y], U: [x, y + 1], D: [x, y - 1], mx: [x, -y], my: [-x, y], rot: [-y, x] })[t]);
      draw(); changed();
    }));
    draw();
    return () => ({ match: target && key(pts) === key(target) ? 1 : 0 });
  };

  // Saat: yelkovanı sürükle (5 dakikalık adım); akrep onu izler.
  SIMS["saat"] = (el, cfg, changed) => {
    let total = (cfg.h ?? 3) * 60 + (cfg.m ?? 0);
    const C = 150, R = 120;
    const svg = svgEl("svg", { viewBox: "0 0 300 300", class: "sim-svg drag", tabindex: 0, role: "slider", "aria-label": "Saat" });
    el.innerHTML = `<div class="plane-wrap"><div class="sa-host"></div><div class="plane-ctrl"><p class="eq sa-d"></p><p class="note">Uzun ibreyi (yelkovan) sürükle ya da ok tuşlarını kullan. Kısa ibre (akrep) kendiliğinden ilerler.</p></div></div>`;
    el.querySelector(".sa-host").replaceChildren(svg);
    let lastAng = null;
    function draw() {
      svg.replaceChildren();
      svgEl("circle", { cx: C, cy: C, r: R + 12, class: "sa-face" }, svg);
      for (let i = 0; i < 60; i++) { const r = (i * 6 * Math.PI) / 180, big = i % 5 === 0; svgEl("line", { x1: C + Math.sin(r) * (R + 2), y1: C - Math.cos(r) * (R + 2), x2: C + Math.sin(r) * (R - (big ? 12 : 5)), y2: C - Math.cos(r) * (R - (big ? 12 : 5)), class: "ao-tick" }, svg); }
      for (let hh = 1; hh <= 12; hh++) { const r = (hh * 30 * Math.PI) / 180, t = svgEl("text", { x: C + Math.sin(r) * (R - 30), y: C - Math.cos(r) * (R - 30) + 7, class: "sa-num" }, svg); t.textContent = hh; }
      const m = ((total % 60) + 60) % 60, h = (((total / 60) % 12) + 12) % 12;
      const hr = (h * 30 * Math.PI) / 180, mr = (m * 6 * Math.PI) / 180;
      svgEl("line", { x1: C, y1: C, x2: C + Math.sin(hr) * 62, y2: C - Math.cos(hr) * 62, class: "sa-h" }, svg);
      svgEl("line", { x1: C, y1: C, x2: C + Math.sin(mr) * 100, y2: C - Math.cos(mr) * 100, class: "sa-m" }, svg);
      svgEl("circle", { cx: C + Math.sin(mr) * 100, cy: C - Math.cos(mr) * 100, r: 10, class: "nl-knob" }, svg);
      svgEl("circle", { cx: C, cy: C, r: 6, class: "ao-v" }, svg);
      const hh = Math.floor(h) === 0 ? 12 : Math.floor(h);
      el.querySelector(".sa-d").textContent = `${String(hh).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
    }
    let drag = false;
    const move = (ev) => {
      const p = svgPoint(svg, ev); let ang = (Math.atan2(p.x - C, C - p.y) * 180) / Math.PI; if (ang < 0) ang += 360;
      const mins = Math.round(ang / 30) * 5 % 60, cur = ((total % 60) + 60) % 60;
      let d = mins - cur; if (d > 30) d -= 60; if (d < -30) d += 60;
      total += d; draw(); changed();
    };
    svg.addEventListener("pointerdown", (ev) => { drag = true; svg.setPointerCapture(ev.pointerId); move(ev); });
    svg.addEventListener("pointermove", (ev) => { if (drag) move(ev); });
    svg.addEventListener("pointerup", () => { drag = false; });
    svg.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 5 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -5 : 0; if (d) { e.preventDefault(); total += d; draw(); changed(); } });
    draw();
    return () => { const m = ((total % 60) + 60) % 60, h = Math.floor((((total / 60) % 12) + 12) % 12); return { h: h === 0 ? 12 : h, m }; };
  };

  // Para: Türk lirası madeni para ve banknotlarla tutar oluştur.
  SIMS["para"] = (el, cfg, changed) => {
    const D = [[200, "200 TL", "n"], [100, "100 TL", "n"], [50, "50 TL", "n"], [20, "20 TL", "n"], [10, "10 TL", "n"], [5, "5 TL", "n"], [1, "1 TL", "c"], [0.5, "50 kr", "c"], [0.25, "25 kr", "c"]].filter((d) => !cfg.only || cfg.only.includes(d[0]));
    const cnt = Object.fromEntries(D.map((d) => [d[0], 0]));
    function draw() {
      const total = Math.round(D.reduce((s, [v]) => s + v * cnt[v], 0) * 100) / 100, count = Object.values(cnt).reduce((a, b) => a + b, 0);
      el.innerHTML = `<div class="pa-pick">${D.map(([v, l, k]) => `<button type="button" class="pa-${k}" data-add="${v}">${l}</button>`).join("")}</div>
        <div class="pa-tray">${D.filter(([v]) => cnt[v]).map(([v, l, k]) => `<span class="pa-${k} pa-in">${l} × ${cnt[v]}<button type="button" data-rem="${v}" aria-label="${l} çıkar">−</button></span>`).join("") || `<span class="muted">Para eklemek için yukarıdakilere dokun.</span>`}</div>
        <p class="bb-val"><b class="num">${total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</b> · ${count} parça</p>`;
      el.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => { cnt[b.dataset.add]++; draw(); changed(); }));
      el.querySelectorAll("[data-rem]").forEach((b) => b.addEventListener("click", () => { cnt[b.dataset.rem]--; draw(); changed(); }));
    }
    draw();
    return () => ({ total: Math.round(D.reduce((s, [v]) => s + v * cnt[v], 0) * 100) / 100, count: Object.values(cnt).reduce((a, b) => a + b, 0) });
  };

  // Oran karıştırma: kırmızı ve beyaz boya ölçekleri; oluşan ton ve oran.
  SIMS["oran-karistirma"] = (el, cfg, changed) => {
    const st = { r: cfg.r ?? 1, w: cfg.w ?? 1 };
    el.innerHTML = `<div class="plane-wrap"><div class="ok-host"></div><div class="plane-ctrl"><p class="eq ok-t"></p>${slider("Kırmızı ölçek", "r", 0, 12, 1, st.r)}${slider("Beyaz ölçek", "w", 0, 12, 1, st.w)}${cfg.target ? `<p class="slope">Hedef ton: kırmızı : beyaz = ${cfg.target[0]} : ${cfg.target[1]}</p>` : ""}</div></div>`;
    const mix = (r, w) => { const t = r + w ? r / (r + w) : 0; const c = (a, b) => Math.round(a + (b - a) * t); return `rgb(${c(255, 200)},${c(255, 38)},${c(255, 45)})`; };
    function draw() {
      const svg = svgEl("svg", { viewBox: "0 0 320 220", class: "sim-svg", role: "img", "aria-label": "Boya karışımı" });
      for (let i = 0; i < st.r; i++) svgEl("rect", { x: 14 + (i % 6) * 22, y: 14 + Math.floor(i / 6) * 22, width: 18, height: 18, rx: 4, class: "ok-r" }, svg);
      for (let i = 0; i < st.w; i++) svgEl("rect", { x: 14 + (i % 6) * 22, y: 70 + Math.floor(i / 6) * 22, width: 18, height: 18, rx: 4, class: "ok-w" }, svg);
      svgEl("circle", { cx: 230, cy: 110, r: 70, fill: mix(st.r, st.w), class: "ok-mix" }, svg);
      if (cfg.target) { svgEl("circle", { cx: 230, cy: 110, r: 80, fill: "none", stroke: mix(...cfg.target), "stroke-width": 10, class: "ok-ring" }, svg); }
      el.querySelector(".ok-host").replaceChildren(svg);
      const g = gcd(st.r, st.w) || 1;
      el.querySelector(".ok-t").textContent = `${st.r} : ${st.w}${g > 1 ? ` = ${st.r / g} : ${st.w / g}` : ""}`;
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => ({ r: st.r, w: st.w, ratio: st.w ? st.r / st.w : null, total: st.r + st.w });
  };

  // Venn şeması: bölgelere dokunarak tara. Bölge bitleri: yalnız A=1, A∩B=2, yalnız B=4, dışarısı=8.
  SIMS["kume-venn"] = (el, cfg, changed) => {
    let mask = 0;
    const svg = svgEl("svg", { viewBox: "0 0 420 260", class: "sim-svg", role: "group", "aria-label": "Venn şeması" });
    el.replaceChildren(svg);
    const regions = [[8, "Dışarısı"], [1, "Yalnız A"], [4, "Yalnız B"], [2, "A ∩ B"]];
    function draw() {
      svg.replaceChildren();
      const defs = svgEl("defs", {}, svg);
      const ca = svgEl("clipPath", { id: "vA" }, defs); svgEl("circle", { cx: 160, cy: 130, r: 90 }, ca);
      const cb = svgEl("clipPath", { id: "vB" }, defs); svgEl("circle", { cx: 260, cy: 130, r: 90 }, cb);
      const mA = svgEl("mask", { id: "mNotB" }, defs); svgEl("rect", { width: 420, height: 260, fill: "#fff" }, mA); svgEl("circle", { cx: 260, cy: 130, r: 90, fill: "#000" }, mA);
      const mB = svgEl("mask", { id: "mNotA" }, defs); svgEl("rect", { width: 420, height: 260, fill: "#fff" }, mB); svgEl("circle", { cx: 160, cy: 130, r: 90, fill: "#000" }, mB);
      const mO = svgEl("mask", { id: "mOut" }, defs); svgEl("rect", { width: 420, height: 260, fill: "#fff" }, mO); svgEl("circle", { cx: 160, cy: 130, r: 90, fill: "#000" }, mO); svgEl("circle", { cx: 260, cy: 130, r: 90, fill: "#000" }, mO);
      const reg = (bit, attrs) => { const r = svgEl("rect", { x: 4, y: 4, width: 412, height: 252, rx: 8, ...attrs, class: `vn-r${mask & bit ? " on" : ""}`, tabindex: 0, role: "checkbox", "aria-checked": !!(mask & bit), "aria-label": regions.find((x) => x[0] === bit)[1] }, svg);
        const tog = () => { mask ^= bit; draw(); changed(); svg.querySelector(`[aria-label="${regions.find((x) => x[0] === bit)[1]}"]`)?.focus(); };
        r.addEventListener("click", tog); r.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); tog(); } }); };
      reg(8, { mask: "url(#mOut)" });
      reg(1, { "clip-path": "url(#vA)", mask: "url(#mNotB)" });
      reg(4, { "clip-path": "url(#vB)", mask: "url(#mNotA)" });
      const g = svgEl("g", { "clip-path": "url(#vA)" }, svg); const inter = svgEl("rect", { x: 4, y: 4, width: 412, height: 252, class: `vn-r${mask & 2 ? " on" : ""}`, "clip-path": "url(#vB)", tabindex: 0, role: "checkbox", "aria-checked": !!(mask & 2), "aria-label": "A ∩ B" }, g);
      const togI = () => { mask ^= 2; draw(); changed(); }; inter.addEventListener("click", togI); inter.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); togI(); } });
      svgEl("circle", { cx: 160, cy: 130, r: 90, class: "vn-c" }, svg); svgEl("circle", { cx: 260, cy: 130, r: 90, class: "vn-c" }, svg);
      [["A", 90, 50], ["B", 330, 50]].forEach(([t, x, y]) => { const e = svgEl("text", { x, y, class: "vn-l" }, svg); e.textContent = t; });
      const elems = cfg.elements || {};
      [[1, 120, 130], [2, 210, 130], [4, 300, 130], [8, 40, 230]].forEach(([bit, x, y]) => { const e = svgEl("text", { x, y, class: "vn-e" }, svg); e.textContent = (elems[bit] || []).join(", "); });
    }
    draw();
    return () => ({ mask });
  };

  // Doğruluk tablosu: sonuç sütununu D/Y diye doldur.
  SIMS["mantik-tablosu"] = (el, cfg, changed) => {
    const OPS = { ve: ["p ∧ q", (p, q) => p && q], veya: ["p ∨ q", (p, q) => p || q], ise: ["p ⇒ q", (p, q) => !p || q], ancak: ["p ⇔ q", (p, q) => p === q] };
    const [label, fn] = OPS[cfg.op || "ve"];
    const rows = [[true, true], [true, false], [false, true], [false, false]], ans = [null, null, null, null];
    const T = (v) => (v ? "D" : "Y");
    function draw() {
      el.innerHTML = `<div class="table-wrap"><table class="mt"><thead><tr><th>p</th><th>q</th><th>${label}</th></tr></thead><tbody>${rows.map(([p, q], i) => `<tr><td>${T(p)}</td><td>${T(q)}</td><td><button type="button" class="mt-cell ${ans[i] === null ? "" : ans[i] ? "d" : "y"}" data-i="${i}" aria-label="${i + 1}. satırın sonucu">${ans[i] === null ? "?" : T(ans[i])}</button></td></tr>`).join("")}</tbody></table></div><p class="note">Hücreye dokundukça D (doğru) ve Y (yanlış) arasında değişir.</p>`;
      el.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.i; ans[i] = ans[i] === null ? true : !ans[i]; draw(); changed(); el.querySelector(`[data-i="${i}"]`)?.focus(); }));
    }
    draw();
    return () => ({ filled: ans.filter((v) => v !== null).length, ok: rows.every(([p, q], i) => ans[i] === fn(p, q)) ? 1 : 0 });
  };

  // Diziler: aritmetik ya da geometrik dizinin terimleri çubuk olarak; n. terim ve toplam.
  SIMS["dizi-gorsel"] = (el, cfg, changed) => {
    const geo = cfg.type === "geo";
    const st = { a1: cfg.a1 ?? 2, d: cfg.d ?? (geo ? 2 : 3), n: cfg.n ?? 6 };
    el.innerHTML = `<div class="dz-host"></div><div class="plane-ctrl">${slider("İlk terim a₁", "a1", 1, 10, 1, st.a1)}${slider(geo ? "Ortak çarpan r" : "Ortak fark d", "d", geo ? 1 : -3, geo ? 3 : 6, geo ? 0.5 : 1, st.d)}${slider("Terim sayısı n", "n", 1, 10, 1, st.n)}<p class="slope dz-t"></p></div>`;
    const term = (k) => (geo ? st.a1 * st.d ** (k - 1) : st.a1 + (k - 1) * st.d);
    function draw() {
      const ts = [...Array(st.n)].map((_, i) => term(i + 1)), mx = Math.max(1, ...ts.map(Math.abs)), W = 600, H = 170, bw = W / 10;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H + 40}`, class: "sim-svg", role: "img", "aria-label": "Dizi" });
      const zero = ts.some((v) => v < 0) ? H / 2 + 10 : H + 10;
      svgEl("line", { x1: 0, x2: W, y1: zero, y2: zero, class: "pl-axis" }, svg);
      ts.forEach((v, i) => {
        const h = (Math.abs(v) / mx) * (zero - 20);
        svgEl("rect", { x: i * bw + 8, y: v >= 0 ? zero - h : zero, width: bw - 16, height: Math.max(1, h), rx: 3, class: "dc-bar" }, svg);
        const t = svgEl("text", { x: i * bw + bw / 2, y: v >= 0 ? zero - h - 6 : zero + h + 16, class: "dc-key" }, svg); t.textContent = fmt(v);
        const k = svgEl("text", { x: i * bw + bw / 2, y: H + 34, class: "dc-ax vg-lab" }, svg); k.textContent = `a${i + 1}`;
      });
      el.querySelector(".dz-host").replaceChildren(svg);
      const sum = ts.reduce((a, b) => a + b, 0);
      el.querySelector(".dz-t").innerHTML = `${geo ? `aₙ = a₁ · r<sup>n−1</sup>` : `aₙ = a₁ + (n − 1) · d`} · a${st.n} = <b class="num">${fmt(term(st.n))}</b> · Toplam S${st.n} = <b class="num">${fmt(sum)}</b>`;
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => ({ ...st, an: term(st.n), sum: [...Array(st.n)].reduce((s, _, i) => s + term(i + 1), 0) });
  };

  // Limit: f(x) = (x² − 1)/(x − 1); x = 1'de tanımsız ama değerler 2'ye yaklaşır.
  SIMS["limit-yaklasim"] = (el, cfg, changed) => {
    let s = cfg.s ?? -100;
    const f = (x) => (x * x - 1) / (x - 1), W = 480, H = 320;
    const X = (v) => 40 + ((v + 0.5) / 3.5) * (W - 60), Y = (v) => H - 30 - ((v + 0.5) / 4.5) * (H - 50);
    // Kaydırıcının uçları 1'den uzak (x = 0 ve x = 2), ortaya yaklaştıkça x 1'e yaklaşır; tam ortada x = 1 tanımsızdır.
    const xFrom = (sv) => (sv === 0 ? null : 1 + Math.sign(sv) * 0.001 * 1000 ** ((Math.abs(sv) - 1) / 99));
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl"><p class="eq">f(x) = (x² − 1) / (x − 1)</p>
      <label class="sim-slider"><span>x = <b class="lx"></b></span><input type="range" min="-100" max="100" step="1" value="${s}"></label><p class="slope li-t"></p></div></div>`;
    function draw() {
      const x = xFrom(s);
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "Limit" });
      svgEl("line", { x1: 20, y1: Y(0), x2: W, y2: Y(0), class: "pl-axis" }, svg); svgEl("line", { x1: X(0), y1: 0, x2: X(0), y2: H, class: "pl-axis" }, svg);
      svgEl("line", { x1: X(-0.5), y1: Y(0.5), x2: X(3), y2: Y(4), class: "tg-curve" }, svg);
      svgEl("circle", { cx: X(1), cy: Y(2), r: 7, class: "li-hole" }, svg);
      [[1, "1"], [2, "2"]].forEach(([v, t]) => { const a = svgEl("text", { x: X(v), y: Y(0) + 18, class: "pl-num" }, svg); a.textContent = t; });
      const b = svgEl("text", { x: X(0) - 10, y: Y(2) + 4, class: "pl-num pl-numy" }, svg); b.textContent = "2";
      if (x !== null) {
        svgEl("line", { x1: X(x), y1: Y(0), x2: X(x), y2: Y(f(x)), class: "ol-guide" }, svg);
        svgEl("line", { x1: X(0), y1: Y(f(x)), x2: X(x), y2: Y(f(x)), class: "ol-guide" }, svg);
        svgEl("circle", { cx: X(x), cy: Y(f(x)), r: 7, class: "tg-p" }, svg);
      }
      el.querySelector(".plane").replaceChildren(svg);
      el.querySelector(".lx").textContent = x === null ? "1 (tanımsız)" : x.toFixed(4).replace(".", ",");
      el.querySelector(".li-t").innerHTML = x === null ? "x = 1'de payda 0 olur; f(1) tanımsızdır. Boş daire bunu gösterir." : `f(x) = <b class="num">${f(x).toFixed(4).replace(".", ",")}</b><br><span class="muted">${x < 1 ? "1'e soldan" : "1'e sağdan"} yaklaşıyorsun.</span>`;
    }
    el.querySelector("input").addEventListener("input", (e) => { s = +e.target.value; draw(); changed(); });
    draw();
    return () => { const x = xFrom(s); return { x, dist: x === null ? 0 : Math.abs(x - 1), side: s < 0 ? -1 : s > 0 ? 1 : 0 }; };
  };

  // Karmaşık düzlem: z = a + bi vektörü; |z| ve i ile çarpma (90° dönme).
  SIMS["karmasik-duzlem"] = (el, cfg, changed) => {
    const st = { a: cfg.a ?? 2, b: cfg.b ?? 1 };
    const S = 26, O = 182, X = (v) => O + v * S, Y = (v) => O - v * S;
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl"><p class="eq kd-z"></p><p class="slope kd-m"></p>${slider("Gerçel kısım a", "a", -6, 6, 1, st.a)}${slider("Sanal kısım b", "b", -6, 6, 1, st.b)}<button type="button" class="btn btn-outline btn-small kd-i">i ile çarp</button></div></div>`;
    function draw() {
      const svg = svgEl("svg", { viewBox: "0 0 364 364", class: "sim-svg plane-svg", role: "img", "aria-label": "Karmaşık düzlem" });
      for (let i = -7; i <= 7; i++) { svgEl("line", { x1: X(i), y1: 0, x2: X(i), y2: 364, class: i ? "pl-grid" : "pl-axis" }, svg); svgEl("line", { x1: 0, y1: Y(i), x2: 364, y2: Y(i), class: i ? "pl-grid" : "pl-axis" }, svg); }
      [["Re", 340, O - 8], ["Im", O + 8, 16]].forEach(([t, x, y]) => { const e = svgEl("text", { x, y, class: "pl-ptl" }, svg); e.textContent = t; });
      svgEl("line", { x1: X(0), y1: Y(0), x2: X(st.a), y2: Y(st.b), class: "pl-line" }, svg);
      svgEl("line", { x1: X(st.a), y1: Y(0), x2: X(st.a), y2: Y(st.b), class: "ol-guide" }, svg);
      svgEl("circle", { cx: X(st.a), cy: Y(st.b), r: 7, class: "tg-p" }, svg);
      el.querySelector(".plane").replaceChildren(svg);
      el.querySelector(".kd-z").textContent = `z = ${st.a}${st.b < 0 ? " − " : " + "}${Math.abs(st.b) === 1 ? "" : Math.abs(st.b)}i`;
      el.querySelector(".kd-m").innerHTML = `|z| = √(${st.a}² + ${st.b}²) = <b class="num">${fmt(Math.hypot(st.a, st.b), 3)}</b>`;
      el.querySelectorAll("input[data-k]").forEach((i) => { i.value = st[i.dataset.k]; });
      setVals(el, st);
    }
    el.querySelector(".kd-i").addEventListener("click", () => { [st.a, st.b] = [-st.b, st.a]; draw(); changed(); });
    bindSliders(el, st, draw, changed); draw();
    return () => ({ a: st.a, b: st.b, mod: Math.hypot(st.a, st.b) });
  };

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
    window.AUDIO?.stopAll();
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

  window.addEventListener("hashchange", () => window.AUDIO?.stopAll());
  const registerSim = (kind, fn) => { SIMS[kind] = fn; };
  return { manifest, lesson, open, context, registerSim, sims: SIMS };
})();
