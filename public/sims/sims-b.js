// Konu anlatımı simülasyonları (grup b). LESSONS.registerSim ile kaydolur; lessons.js değişmez.
// 3. sınıf konuları: sayı doğrusunda sıçrama, tek-çift eşleme, tahmin, kesir dairesi, birim gruplama,
// kronometre, paylaştırma, işlem makinesi, eşitlik terazisi, geometrik cisimler, çokgen tahtası,
// simetri doğrusu, simetri ızgarası, sıvı ölçme, sıklık tablosu ve grafikler.
(() => {
  if (!window.LESSONS) return;
  const reg = window.LESSONS.registerSim;
  const NS = "http://www.w3.org/2000/svg";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (x, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString("tr-TR");
  const svgEl = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  };
  // font-size, CSS sınıfının boyutunu ezmesi için style olarak yazılır.
  const txt = (parent, x, y, s, cls, extra = {}) => {
    const { "font-size": fs, ...rest } = extra;
    const t = svgEl("text", { x, y, class: cls, ...rest, ...(fs ? { style: `font-size:${fs}px` } : {}) }, parent); t.textContent = s; return t;
  };
  const svgPt = (svg, ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const B = (label, attrs = "") => `<button type="button" class="btn btn-outline btn-small" ${attrs}>${label}</button>`;
  const slider = (label, key, min, max, step, value) => `<label class="sim-slider"><span>${label}: <b data-v="${key}">${fmt(value)}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-k="${key}"></label>`;
  const keyOf = (c, r) => `${c},${r}`;

  if (!document.getElementById("sb-style")) {
    const st = document.createElement("style");
    st.id = "sb-style";
    st.textContent = `
.sb { display: grid; gap: 12px; min-width: 0; }
.sb-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.sb-txt { margin: 0 !important; font-size: 16px; }
.sb-txt b, .sb-big b { color: var(--brand); }
.sb-big { margin: 0 !important; font-size: 20px !important; font-weight: 600; }
.sb-muted { color: var(--muted); font-size: 14px !important; margin: 0 !important; }
.sb-ok { color: var(--good); font-weight: 600; }
.sb-no { color: var(--bad); font-weight: 600; }
.sb-svg text { font-family: var(--font); }
.sb-axis { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; }
.sb-tick { stroke: var(--muted); stroke-width: 2; }
.sb-tick.big { stroke: var(--ink); stroke-width: 3; }
.sb-num { font-size: 21px; fill: var(--ink); text-anchor: middle; font-weight: 600; }
.sb-num.sm { font-size: 14px; fill: var(--muted); font-weight: 400; }
.sb-arc { fill: none; stroke: var(--brand); stroke-width: 3; }
.sb-arc.neg { stroke: var(--bad); }
.sb-arclab { font-size: 19px; font-weight: 700; fill: var(--brand); text-anchor: middle; }
.sb-arclab.neg { fill: var(--bad); }
.sb-knob { fill: var(--brand); stroke: var(--surface); stroke-width: 3; cursor: grab; }
.sb-knob:focus-visible { outline: none; stroke: var(--ink); }
.sb-klab { font-size: 24px; font-weight: 700; fill: var(--brand); text-anchor: middle; }
.sb-mark { fill: var(--good); }
.sb-marklab { font-size: 21px; font-weight: 700; fill: var(--good); text-anchor: middle; }
.sb-round { fill: none; stroke: var(--good); stroke-width: 3; stroke-dasharray: 5 4; }
.sb-dot { fill: var(--brand); }
.sb-dot.b { fill: var(--good); }
.sb-dot.odd { fill: var(--warn); }
.sb-pair { fill: none; stroke: var(--line); stroke-width: 2; }
.sb-pair.ok { stroke: var(--muted); }
.sb-lab { font-size: 15px; fill: var(--ink); }
.sb-lab.mid { text-anchor: middle; }
.sb-lab.b { font-weight: 700; }
.sb-field { fill: var(--bg-soft); stroke: var(--line); stroke-width: 2; }
.sb-zone { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 2; stroke-dasharray: 6 4; }
.sb-sep { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 5 5; }
.sb-sec { fill: var(--bg-soft); stroke: var(--brand); stroke-width: 2.5; transition: fill .15s; }
.sb-sec.on { fill: var(--brand); }
.sb-sec.tap { cursor: pointer; }
.sb-sec:focus-visible { outline: none; stroke: var(--ink); stroke-width: 5; }
.sb-cell { fill: var(--bg-soft); stroke: var(--line); stroke-width: 1; }
.sb-cell.on { fill: var(--brand); stroke: var(--brand-strong); }
.sb-cell.fix { fill: var(--good); stroke: var(--leaf-dark); }
.sb-cell.tap { cursor: pointer; }
.sb-cell.tap:hover { fill: var(--brand-soft); }
.sb-cell.on.tap:hover { fill: var(--brand-strong); }
.sb-cell.start { stroke: var(--ink); stroke-width: 3; }
.sb-cell:focus-visible { outline: none; stroke: var(--ink); stroke-width: 3; }
.sb-bar { fill: var(--brand); }
.sb-bar.part { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 1.5; }
.sb-bar.seg { fill: var(--brand); stroke: var(--surface); stroke-width: 1; }
.sb-bar.empty { fill: var(--bg-soft); stroke: var(--line); stroke-width: 1; }
.sb-bartxt { font-size: 15px; font-weight: 700; fill: var(--on-brand); text-anchor: middle; }
.sb-plate { fill: var(--bg-soft); stroke: var(--brand); stroke-width: 2.5; }
.sb-bag { fill: none; stroke: var(--muted); stroke-width: 2; stroke-dasharray: 6 4; }
.sb-box { fill: var(--surface); stroke: var(--brand); stroke-width: 2.5; }
.sb-box.op { fill: var(--brand); stroke: var(--brand-strong); }
.sb-boxtxt { font-size: 22px; font-weight: 700; fill: var(--ink); text-anchor: middle; }
.sb-boxtxt.op { fill: var(--on-brand); }
.sb-arrow { stroke: var(--muted); stroke-width: 3; fill: none; }
.sb-arrowhead { fill: var(--muted); }
.sb-beam { stroke: var(--ink); stroke-width: 6; stroke-linecap: round; }
.sb-stand { fill: var(--muted); }
.sb-pan { fill: var(--ink); }
.sb-str { stroke: var(--muted); stroke-width: 2; }
.sb-unit { fill: var(--warn); stroke: var(--surface); stroke-width: 1; }
.sb-unit.x { fill: var(--brand); }
.sb-face { fill: var(--brand); fill-opacity: .14; stroke: none; }
.sb-face.hi { fill-opacity: .45; }
.sb-edge { stroke: var(--ink); stroke-width: 2.5; stroke-linecap: round; }
.sb-edge.hid { stroke: var(--muted); stroke-dasharray: 6 5; stroke-width: 1.8; }
.sb-edge.hi { stroke: var(--brand); stroke-width: 5; }
.sb-edge.hid.hi { stroke-width: 3; }
.sb-vert { fill: var(--good); stroke: var(--surface); stroke-width: 2; }
.sb-vert.hid { fill-opacity: .55; }
.sb-curve { fill: var(--brand); fill-opacity: .14; stroke: var(--ink); stroke-width: 2.5; }
.sb-curve.hi { fill-opacity: .45; }
.sb-peg { fill: var(--muted); opacity: .55; }
.sb-peg.hit { cursor: pointer; fill: transparent; opacity: 1; }
.sb-peg.cur { fill: none; stroke: var(--ink); stroke-width: 2.5; opacity: 1; }
.sb-poly { fill: var(--brand); fill-opacity: .16; stroke: var(--brand); stroke-width: 3.5; stroke-linejoin: round; }
.sb-poly.open { fill: none; }
.sb-vtx { fill: var(--brand); stroke: var(--surface); stroke-width: 2; }
.sb-elab { font-size: 14px; font-weight: 700; fill: var(--ink); text-anchor: middle; paint-order: stroke; stroke: var(--surface); stroke-width: 4px; }
.sb-shape { fill: var(--brand); fill-opacity: .2; stroke: var(--brand); stroke-width: 3; stroke-linejoin: round; }
.sb-ghost { fill: none; stroke: var(--warn); stroke-width: 3; stroke-dasharray: 7 5; stroke-linejoin: round; }
.sb-ghost.ok { stroke: var(--good); }
.sb-cand { stroke: var(--muted); stroke-width: 2; stroke-dasharray: 3 6; }
.sb-cand.sel { stroke-dasharray: none; stroke-width: 3.5; }
.sb-cand.ok { stroke: var(--good); }
.sb-cand.bad { stroke: var(--bad); }
.sb-hit { stroke: transparent; stroke-width: 22; cursor: pointer; }
.sb-hit:focus-visible { outline: none; stroke: var(--brand); stroke-opacity: .25; }
.sb-axisline { stroke: var(--bad); stroke-width: 4; stroke-dasharray: 10 6; }
.sb-tank { fill: none; stroke: var(--ink); stroke-width: 3; }
.sb-water { fill: var(--brand); fill-opacity: .55; }
.sb-water.over { fill: var(--bad); fill-opacity: .55; }
.sb-gl { stroke: var(--ink); stroke-width: 2; }
.sb-gl.half { stroke: var(--muted); stroke-width: 1.5; }
.sb-target { stroke: var(--good); stroke-width: 3; stroke-dasharray: 8 5; }
.sb-grid { stroke: var(--line); stroke-width: 1; }
.sb-tally { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; }
.sb-tbl { width: 100%; border-collapse: collapse; font-size: 15px; }
.sb-tbl th, .sb-tbl td { border: 1px solid var(--line); padding: 5px 6px; text-align: left; vertical-align: middle; }
.sb-tbl th { background: var(--bg-soft); font-weight: 600; }
.sb-tbl td.n { text-align: center; font-weight: 700; color: var(--brand); width: 44px; }
.sb-tbl td:last-child { width: 1%; white-space: nowrap; }
.sb-tbl .bb-btns .btn { min-width: 34px; min-height: 34px; padding: 0; font-size: 18px; }
.sb-tbl svg { display: block; }
.sb-wrap { overflow-x: auto; min-width: 0; }
.sb-display { font: 700 34px var(--font); color: var(--ink); font-variant-numeric: tabular-nums; margin: 0 !important; }
.sb-pressed[aria-pressed="true"] { background: var(--brand); color: var(--on-brand); border-color: var(--brand); }
`;
    document.head.appendChild(st);
  }

  // ---------------------------------------------------------------------------
  // b-sicrama: tam sayı doğrusu; ileri/geri sıçramalar yay olarak çizilir. Nokta sürüklenebilir.
  // cfg: min, max, tick(1), label(etiket aralığı), start, hops:[10,1], geri(true), drag(true), marks:[[v,"etiket"]], yuvarla(10|100)
  reg("b-sicrama", (el, cfg, changed) => {
    const min = cfg.min ?? 0, max = cfg.max ?? 20, tick = cfg.tick ?? 1, lab = cfg.label ?? tick * 5;
    const hops = cfg.hops ?? [1], geri = cfg.geri !== false, canDrag = cfg.drag !== false && cfg.nokta !== false;
    let value = cfg.start ?? min, origin = value, arcs = [];
    const W = 640, X0 = 30, X1 = 610, Y = 120;
    const x = (v) => X0 + ((v - min) / (max - min)) * (X1 - X0);
    const nearest = (v, r) => Math.floor(v / r + 0.5) * r;
    el.innerHTML = `<div class="sb"><div class="sb-host"></div><div class="sb-row sb-hops"${hops.length ? "" : " hidden"}>${hops.map((h) => B(`+${h}`, `data-h="${h}"`) + (geri ? B(`−${h}`, `data-h="-${h}"`) : "")).join("")}${B("Baştan", 'data-h="0"')}</div><p class="sb-txt sb-expr"></p></div>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${cfg.marks ? 200 : 168}`, class: "sim-svg sb-svg" + (canDrag ? " drag" : ""), role: "img", "aria-label": `${min} ile ${max} arası sayı doğrusu` });
    el.querySelector(".sb-host").replaceChildren(svg);
    function draw() {
      svg.replaceChildren();
      svgEl("line", { x1: X0 - 14, y1: Y, x2: X1 + 14, y2: Y, class: "sb-axis" }, svg);
      for (let v = min; v <= max + 1e-9; v += tick) {
        const big = Math.abs(v / lab - Math.round(v / lab)) < 1e-9;
        svgEl("line", { x1: x(v), y1: Y - (big ? 12 : 7), x2: x(v), y2: Y + (big ? 12 : 7), class: big ? "sb-tick big" : "sb-tick" }, svg);
        if (big) txt(svg, x(v), Y + 38, String(v), "sb-num");
      }
      for (const [v, t] of cfg.marks || []) { svgEl("circle", { cx: x(v), cy: Y, r: 9, class: "sb-mark" }, svg); txt(svg, x(v), Y + 66, t, "sb-marklab"); }
      if (cfg.yuvarla) {
        const r = nearest(value, cfg.yuvarla);
        if (r >= min && r <= max) { svgEl("circle", { cx: x(r), cy: Y, r: 14, class: "sb-round" }, svg); }
      }
      arcs.slice(-10).forEach(([a, b], i) => {
        const xa = x(a), xb = x(b), h = Math.min(70, 18 + Math.abs(xb - xa) * 0.45), neg = b < a;
        svgEl("path", { d: `M${xa},${Y - 4} Q${(xa + xb) / 2},${Y - 4 - h * 2} ${xb},${Y - 4}`, class: "sb-arc" + (neg ? " neg" : "") }, svg);
        if (Math.abs(xb - xa) > 18 || i === arcs.slice(-10).length - 1) txt(svg, (xa + xb) / 2, Y - 8 - h, `${neg ? "−" : "+"}${Math.abs(b - a)}`, "sb-arclab" + (neg ? " neg" : ""));
      });
      const knob = cfg.nokta === false ? null : svgEl("circle", { cx: x(value), cy: Y, r: 12, class: "sb-knob", tabindex: canDrag ? 0 : -1, role: "slider", "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, "aria-label": "Sayı doğrusundaki nokta" }, svg);
      if (knob && !arcs.length) txt(svg, x(value), Y - 22, String(value), "sb-klab");
      if (knob && canDrag) knob.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? tick : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -tick : 0;
        if (d) { e.preventDefault(); setVal(Math.min(max, Math.max(min, value + d))); svg.querySelector(".sb-knob")?.focus(); }
      });
      const sum = arcs.map(([a, b]) => (b > a ? ` + ${b - a}` : ` − ${a - b}`)).join("");
      let s = arcs.length ? `${origin}${sum} = <b>${value}</b>` : cfg.nokta === false ? "Sayılar küçükten büyüğe soldan sağa dizilir." : `Nokta: <b>${value}</b>`;
      if (cfg.yuvarla) { const r = nearest(value, cfg.yuvarla); s += ` · En yakın ${cfg.yuvarla === 100 ? "yüzlük" : "onluk"}: <b>${r}</b>`; }
      el.querySelector(".sb-expr").innerHTML = s;
      el.querySelectorAll("[data-h]").forEach((b) => { const h = +b.dataset.h; b.disabled = h !== 0 && (value + h > max || value + h < min); });
    }
    function setVal(v) { value = v; origin = v; arcs = []; draw(); changed(); }
    el.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => {
      const h = +b.dataset.h;
      if (h === 0) { value = cfg.start ?? min; origin = value; arcs = []; }
      else { arcs.push([value, value + h]); value += h; }
      draw(); changed();
    }));
    if (canDrag) {
      let drag = false;
      const move = (ev) => { const p = svgPt(svg, ev); const v = Math.min(max, Math.max(min, min + Math.round(((p.x - X0) / (X1 - X0)) * (max - min) / tick) * tick)); if (v !== value || arcs.length) setVal(v); };
      svg.addEventListener("pointerdown", (ev) => { drag = true; svg.setPointerCapture(ev.pointerId); move(ev); });
      svg.addEventListener("pointermove", (ev) => { if (drag) move(ev); });
      svg.addEventListener("pointerup", () => { drag = false; });
    }
    draw();
    return () => ({ value, hops: arcs.length, origin, yakin: cfg.yuvarla ? nearest(value, cfg.yuvarla) : null });
  });

  // ---------------------------------------------------------------------------
  // b-ciftler: nesneleri ikişerli eşle. Tek grup (n) ya da iki grup (a, b) ve toplamları.
  reg("b-ciftler", (el, cfg, changed) => {
    const two = cfg.b !== undefined, max = cfg.max ?? 20;
    const st = two ? { a: cfg.a ?? 5, b: cfg.b ?? 3 } : { n: cfg.n ?? 7 };
    const tc = (n) => (n % 2 ? "tek" : "çift");
    el.innerHTML = `<div class="sb"><div class="sb-host sb-wrap"></div><p class="sb-txt sb-t"></p><div style="display:grid;gap:10px">${two ? slider("1. grup", "a", 0, max, 1, st.a) + slider("2. grup", "b", 0, max, 1, st.b) : slider("Nesne sayısı", "n", 1, max, 1, st.n)}</div></div>`;
    const S = 34, RH = 80;
    // items: "a" | "b" dizisi; ikişer ikişer sütunlara dizilir, eşsiz kalan turuncu görünür.
    function row(svg, y, items, label) {
      txt(svg, 4, y + 39, label, "sb-lab b", { "font-size": 19 });
      const ox = 130;
      for (let i = 0; i < items.length; i += 2) {
        const cx = ox + (i / 2) * S, pair = i + 1 < items.length;
        if (pair) svgEl("rect", { x: cx - 15, y: y + 2, width: 30, height: 62, rx: 15, class: "sb-pair ok" }, svg);
        svgEl("circle", { cx, cy: y + 18, r: 11, class: "sb-dot" + (items[i] === "b" ? " b" : "") + (pair ? "" : " odd") }, svg);
        if (pair) svgEl("circle", { cx, cy: y + 48, r: 11, class: "sb-dot" + (items[i + 1] === "b" ? " b" : "") }, svg);
      }
    }
    // Birleşik grupta önce iki grubun çiftleri, en sonda eşsiz kalanlar yan yana gelir.
    function merged() {
      const out = [...Array(st.a - (st.a % 2)).fill("a"), ...Array(st.b - (st.b % 2)).fill("b")];
      if (st.a % 2) out.push("a");
      if (st.b % 2) out.push("b");
      return out;
    }
    function draw() {
      const tot = two ? st.a + st.b : st.n;
      const lines = two ? 3 : 1, w = Math.max(340, 140 + Math.ceil(tot / 2) * S);
      const svg = svgEl("svg", { viewBox: `0 0 ${w} ${lines * RH}`, class: "sim-svg sb-svg", role: "img", "aria-label": "İkişerli eşleme" });
      if (two) { row(svg, 4, Array(st.a).fill("a"), "1. grup"); row(svg, 4 + RH, Array(st.b).fill("b"), "2. grup"); row(svg, 4 + 2 * RH, merged(), "Toplam"); }
      else row(svg, 4, Array(st.n).fill("a"), "Nesneler");
      el.querySelector(".sb-host").replaceChildren(svg);
      const t = el.querySelector(".sb-t");
      if (two) t.innerHTML = `${st.a} (${tc(st.a)}) + ${st.b} (${tc(st.b)}) = <b>${tot}</b> (${tc(tot)}). ${tot % 2 ? "Toplamda <b>1 eşsiz</b> nesne kaldı." : "Toplamda <b>eşsiz nesne kalmadı</b>."}`;
      else t.innerHTML = `${st.n} nesne → ${Math.floor(st.n / 2)} çift${st.n % 2 ? " ve <b>1 eşsiz</b>" : ", <b>eşsiz yok</b>"}. ${st.n} bir <b>${tc(st.n)}</b> sayıdır.`;
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = st[b.dataset.v]; });
    }
    el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); changed(); }));
    draw();
    return () => (two ? { a: st.a, b: st.b, toplam: st.a + st.b, aTek: st.a % 2, bTek: st.b % 2, tek: (st.a + st.b) % 2 } : { n: st.n, tek: st.n % 2, cift: st.n % 2 ? 0 : 1 });
  });

  // ---------------------------------------------------------------------------
  // b-tahmin: alana dağılmış nesneler; bir bölgedeki sayı verilir, tahmin kaydedilince sayılır.
  // cfg: count, bolge (eşit bölge sayısı), max, seed
  reg("b-tahmin", (el, cfg, changed) => {
    const count = cfg.count ?? 60, zones = cfg.bolge ?? 6, max = cfg.max ?? 100, per = Math.floor(count / zones);
    let guess = cfg.tahmin ?? Math.round(max / 2), locked = false, tries = 0;
    let seed = cfg.seed ?? 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const W = 600, H = 220, zw = W / zones;
    const pts = [];
    for (let z = 0; z < zones; z++) {
      const n = z === zones - 1 ? count - per * (zones - 1) : per;
      const cols = Math.ceil(Math.sqrt(n * (zw / H))), rows = Math.ceil(n / cols), cw = (zw - 16) / cols, ch = (H - 16) / rows;
      const cells = [...Array(cols * rows).keys()];
      for (let k = cells.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [cells[k], cells[j]] = [cells[j], cells[k]]; }
      cells.slice(0, n).forEach((c) => pts.push([z * zw + 8 + (c % cols + 0.2 + rnd() * 0.6) * cw, 8 + (Math.floor(c / cols) + 0.2 + rnd() * 0.6) * ch]));
    }
    el.innerHTML = `<div class="sb"><div class="sb-host"></div><p class="sb-txt sb-t"></p>${slider("Tahminin", "g", 0, max, 1, guess)}<div class="sb-row">${B("Tahminimi kaydet ve say", 'data-a="lock"')}${B("Yeniden tahmin et", 'data-a="again"')}</div></div>`;
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H + 40}`, class: "sim-svg sb-svg", role: "img", "aria-label": `${zones} eş bölgeye ayrılmış nesneler` });
      svgEl("rect", { x: 1, y: 1, width: W - 2, height: H - 2, rx: 10, class: "sb-field" }, svg);
      if (zones > 1) svgEl("rect", { x: 3, y: 3, width: zw - 4, height: H - 6, rx: 8, class: "sb-zone" }, svg);
      for (let z = 1; z < zones; z++) svgEl("line", { x1: z * zw, x2: z * zw, y1: 6, y2: H - 6, class: "sb-sep" }, svg);
      pts.forEach(([px, py]) => svgEl("circle", { cx: px, cy: py, r: 6.5, class: "sb-dot" }, svg));
      txt(svg, 6, H + 31, zones > 1 ? `↑ Bu bölgede ${per} tane var` : "", "sb-lab b", { "font-size": 24 });
      el.querySelector(".sb-host").replaceChildren(svg);
      const t = el.querySelector(".sb-t");
      t.innerHTML = locked ? `Tahminin <b>${guess}</b>, gerçek sayı <b>${count}</b>. Fark: <b>${Math.abs(guess - count)}</b>. ${Math.abs(guess - count) <= 10 ? '<span class="sb-ok">Çok iyi bir tahmin!</span>' : "Bölgeleri kullanarak yeniden dene."}` : zones > 1 ? `Alan ${zones} eş bölgeye ayrıldı. Nesneleri tek tek sayma; bölgelerden yararlanarak tahmin et.` : "Nesneleri tek tek sayma; göz kararı tahmin et.";
      el.querySelector('[data-v="g"]').textContent = guess;
      el.querySelector("input[data-k]").disabled = locked;
      el.querySelector('[data-a="lock"]').disabled = locked;
      el.querySelector('[data-a="again"]').disabled = !locked;
    }
    el.querySelector("input[data-k]").addEventListener("input", (e) => { guess = +e.target.value; draw(); changed(); });
    el.querySelector('[data-a="lock"]').addEventListener("click", () => { locked = true; tries++; draw(); changed(); });
    el.querySelector('[data-a="again"]').addEventListener("click", () => { locked = false; draw(); changed(); });
    draw();
    return () => ({ tahmin: guess, kaydedildi: locked ? 1 : 0, fark: locked ? Math.abs(guess - count) : 999, deneme: tries });
  });

  // ---------------------------------------------------------------------------
  // b-pasta: daire modeli. Eş dilimlere dokunarak boya; kaydırıcıyla dilim sayısı; esit:false eş olmayan parçalar.
  // cfg: n, shaded, interactive(true), slider:{min,max,label}, esit(true), acilar:[...] (esit:false iken derece)
  reg("b-pasta", (el, cfg, changed) => {
    let n = cfg.n ?? 4;
    const inter = cfg.interactive !== false, esit = cfg.esit !== false;
    let on = new Set([...Array(cfg.shaded ?? 0).keys()]);
    el.innerHTML = `<div class="plane-wrap"><div class="sb-host" style="max-width:300px;width:100%;justify-self:center"></div><div class="plane-ctrl"><p class="sb-big sb-f"></p><p class="sb-txt sb-t"></p>${cfg.slider ? slider(cfg.slider.label || "Eş parça sayısı", "n", cfg.slider.min ?? 2, cfg.slider.max ?? 12, 1, n) : ""}</div></div>`;
    const C = 130, R = 115;
    function angles() {
      if (esit) return [...Array(n + 1).keys()].map((i) => (i * 360) / n);
      const a = cfg.acilar || [180, 100, 80]; n = a.length;
      const out = [0]; a.forEach((d) => out.push(out[out.length - 1] + d)); return out;
    }
    function draw(focusI) {
      const svg = svgEl("svg", { viewBox: "0 0 260 260", class: "sim-svg sb-svg", role: "group", "aria-label": "Kesir dairesi" });
      const A = angles();
      for (let i = 0; i < n; i++) {
        const a0 = ((A[i] - 90) * Math.PI) / 180, a1 = ((A[i + 1] - 90) * Math.PI) / 180;
        const large = A[i + 1] - A[i] > 180 ? 1 : 0;
        const d = n === 1 ? `M${C - R},${C} A${R},${R} 0 1 1 ${C + R},${C} A${R},${R} 0 1 1 ${C - R},${C} Z` : `M${C},${C} L${C + R * Math.cos(a0)},${C + R * Math.sin(a0)} A${R},${R} 0 ${large} 1 ${C + R * Math.cos(a1)},${C + R * Math.sin(a1)} Z`;
        const p = svgEl("path", { d, class: `sb-sec${on.has(i) ? " on" : ""}${inter ? " tap" : ""}`, "data-i": i }, svg);
        if (inter) {
          p.setAttribute("tabindex", 0); p.setAttribute("role", "checkbox"); p.setAttribute("aria-checked", on.has(i)); p.setAttribute("aria-label", `${n} parçadan ${i + 1}. parça`);
          const tog = () => { on.has(i) ? on.delete(i) : on.add(i); draw(i); changed(); };
          p.addEventListener("click", tog);
          p.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); tog(); } });
        }
      }
      el.querySelector(".sb-host").replaceChildren(svg);
      if (focusI !== undefined) svg.querySelector(`[data-i="${focusI}"]`)?.focus();
      const k = on.size, f = el.querySelector(".sb-f"), t = el.querySelector(".sb-t");
      if (!esit) { f.textContent = "Parçalar eş değil"; t.innerHTML = `Bu daire ${n} parçaya ayrıldı ama parçaların büyüklükleri farklı. Bir parçayı <b>1/${n}</b> diye adlandıramayız.`; }
      else {
        f.innerHTML = `<b>${k}/${n}</b>`;
        const extra = k === n ? "Bütünün tamamı boyandı: <b>" + n + "/" + n + " = 1 bütün</b>." : k === 0 ? "Henüz parça boyamadın." : n === 2 && k === 1 ? "Bu, bütünün <b>yarımı</b>dır." : n === 4 && k === 1 ? "Bu, bütünün <b>çeyreği</b>dir." : n === 4 && k === 2 ? "4 çeyrek parçadan 2'si: bütünün yarısı kadar." : "";
        t.innerHTML = `Bütün <b>${n}</b> eş parçaya bölündü (payda). <b>${k}</b> parça boyandı (pay). ${extra}`;
      }
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = n; });
    }
    el.querySelector("input[data-k]")?.addEventListener("input", (e) => { n = +e.target.value; on = new Set([...on].filter((i) => i < n)); draw(); changed(); });
    draw();
    return () => ({ n, shaded: on.size, butun: on.size === n ? 1 : 0 });
  });

  // ---------------------------------------------------------------------------
  // b-gruplama: küçük birimler biriktikçe büyük birime dönüşür (60 dakika = 1 saat, 100 cm = 1 m, 7 gün = 1 hafta...).
  // cfg: kucuk, buyuk, grup, n, max, adimlar:[1,10]
  reg("b-gruplama", (el, cfg, changed) => {
    const g = cfg.grup ?? 10, max = cfg.max ?? g * 3, steps = cfg.adimlar ?? [1, g];
    const ks = cfg.kucuk ?? "birim", bs = cfg.buyuk ?? "grup";
    let n = cfg.n ?? 0;
    el.innerHTML = `<div class="sb"><div class="sb-host"></div><div class="sb-row">${steps.map((s) => B(`+${s} ${esc(ks)}`, `data-s="${s}"`)).join("")}${steps.map((s) => B(`−${s}`, `data-s="-${s}"`)).join("")}${B("Sıfırla", 'data-s="0"')}</div><p class="sb-big sb-t"></p></div>`;
    function draw() {
      const full = Math.floor(n / g), rest = n % g, W = 600;
      const rowsFull = Math.ceil(full / 4);
      const H = 20 + rowsFull * 56 + 70;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg sb-svg", role: "img", "aria-label": `${n} ${ks}` });
      for (let i = 0; i < full; i++) {
        const x = (i % 4) * 150, y = 10 + Math.floor(i / 4) * 56;
        svgEl("rect", { x: x + 2, y, width: 142, height: 44, rx: 6, class: "sb-bar" }, svg);
        txt(svg, x + 73, y + 28, `1 ${bs}`, "sb-bartxt");
      }
      const y = 10 + rowsFull * 56, cells = g <= 60 ? g : 0, bw = W - 4;
      if (cells) for (let i = 0; i < g; i++) svgEl("rect", { x: 2 + (i * bw) / g, y, width: bw / g, height: 34, class: i < rest ? "sb-bar seg" : "sb-bar empty" }, svg);
      else { svgEl("rect", { x: 2, y, width: bw, height: 34, rx: 4, class: "sb-bar empty" }, svg); svgEl("rect", { x: 2, y, width: (bw * rest) / g, height: 34, rx: 4, class: "sb-bar seg" }, svg); }
      txt(svg, 4, y + 58, `Sıradaki ${bs}: ${rest} / ${g} ${ks} doldu`, "sb-lab");
      el.querySelector(".sb-host").replaceChildren(svg);
      el.querySelector(".sb-t").innerHTML = `${n} ${esc(ks)} = <b>${full}</b> ${esc(bs)} <b>${rest}</b> ${esc(ks)}`;
      el.querySelectorAll("[data-s]").forEach((b) => { const s = +b.dataset.s; b.disabled = s !== 0 && (n + s > max || n + s < 0); });
    }
    el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { const s = +b.dataset.s; n = s === 0 ? 0 : n + s; draw(); changed(); el.querySelector(`[data-s="${b.dataset.s}"]`)?.focus(); }));
    draw();
    return () => ({ n, buyuk: Math.floor(n / g), kalan: n % g });
  });

  // ---------------------------------------------------------------------------
  // b-kronometre: bakmadan "hedef" saniyede durdurmaya çalış; süre tahmini için.
  reg("b-kronometre", (el, cfg, changed) => {
    const hedef = cfg.hedef ?? 10, gizli = cfg.gizli !== false;
    let t0 = 0, run = false, last = null, tries = 0, raf = 0;
    el.innerHTML = `<div class="sb"><p class="sb-txt">Hedef: <b>${hedef} saniye</b>. Başlat'a bas, içinden say, ${hedef} saniye geçtiğini düşündüğünde Durdur'a bas.</p><div class="sb-display" aria-live="polite">0,0 sn</div><div class="sb-row">${B("Başlat", 'data-a="go"')}${B("Durdur", 'data-a="stop"')}</div><p class="sb-txt sb-t"></p></div>`;
    const disp = el.querySelector(".sb-display");
    const show = (s) => { disp.textContent = `${s.toFixed(1).replace(".", ",")} sn`; };
    function tick() { if (!run) return; show((performance.now() - t0) / 1000); raf = requestAnimationFrame(tick); }
    function ui() {
      el.querySelector('[data-a="go"]').disabled = run; el.querySelector('[data-a="stop"]').disabled = !run;
      const t = el.querySelector(".sb-t");
      if (run) t.textContent = gizli ? "Süre işliyor… Ekrana bakmadan say!" : "Süre işliyor…";
      else if (last !== null) { const f = Math.abs(last - hedef); t.innerHTML = `Durdurduğun süre <b>${last.toFixed(1).replace(".", ",")} saniye</b>. Hedeften fark: <b>${f.toFixed(1).replace(".", ",")} saniye</b>. ${f < 1.5 ? '<span class="sb-ok">Süre tahminin çok iyi!</span>' : "Bir daha dene."}`; }
      else t.textContent = "";
    }
    el.querySelector('[data-a="go"]').addEventListener("click", () => { t0 = performance.now(); run = true; if (gizli) disp.textContent = "? sn"; else tick(); ui(); el.querySelector('[data-a="stop"]').focus(); });
    el.querySelector('[data-a="stop"]').addEventListener("click", () => { if (!run) return; run = false; cancelAnimationFrame(raf); last = (performance.now() - t0) / 1000; tries++; show(last); ui(); changed(); el.querySelector('[data-a="go"]').focus(); });
    ui();
    return () => ({ sure: last ?? 0, fark: last === null ? 99 : Math.abs(last - hedef), deneme: tries });
  });

  // ---------------------------------------------------------------------------
  // b-paylastir: nesneleri gruplara eşit paylaştır (bölme). Tur tur dağıtılır; artan kalan olarak görünür.
  // cfg: toplam, grup, max(30), maxGrup(6), mod: "paylastir" | "grupla"
  reg("b-paylastir", (el, cfg, changed) => {
    const st = { t: cfg.toplam ?? 12, k: cfg.grup ?? 3 };
    const grupla = cfg.mod === "grupla";
    let dealt = 0;
    el.innerHTML = `<div class="sb"><div class="sb-host"></div><div class="sb-row">${B(grupla ? `Bir grup ayır` : "Bir tur dağıt", 'data-a="one"')}${B("Hepsini dağıt", 'data-a="all"')}${B("Topla", 'data-a="reset"')}</div><p class="sb-big sb-t"></p>
      <div style="display:grid;gap:10px">${slider("Nesne sayısı", "t", 1, cfg.max ?? 30, 1, st.t)}${slider(grupla ? "Bir gruptaki nesne" : "Grup (tabak) sayısı", "k", 1, cfg.maxGrup ?? 6, 1, st.k)}</div></div>`;
    const rounds = () => Math.floor(dealt / st.k);
    function draw() {
      const k = st.k, q = Math.floor(st.t / k), r = st.t % k, left = st.t - dealt, nGroups = grupla ? rounds() : k, per = grupla ? k : rounds();
      const W = 600, cols = Math.min(nGroups || 1, grupla ? 6 : k), plateW = W / Math.max(cols, 3), rowsP = Math.max(1, Math.ceil((grupla ? nGroups : k) / cols));
      const perRow = Math.max(2, Math.floor((plateW - 30) / 22)), plateH = 40 + Math.ceil(per / perRow) * 22;
      const H = 70 + rowsP * (plateH + 14) + 20;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg sb-svg", role: "img", "aria-label": "Paylaştırma" });
      svgEl("rect", { x: 2, y: 2, width: W - 4, height: 58, rx: 10, class: "sb-bag" }, svg);
      txt(svg, 10, 20, `Dağıtılacak: ${left}`, "sb-lab b");
      for (let i = 0; i < left; i++) svgEl("circle", { cx: 16 + (i % 30) * 19.4, cy: 36 + Math.floor(i / 30) * 14, r: 6.5, class: "sb-dot odd" }, svg);
      const groups = grupla ? nGroups : k;
      for (let gI = 0; gI < groups; gI++) {
        const c = gI % cols, rr = Math.floor(gI / cols), x = c * plateW + 6, y = 74 + rr * (plateH + 14);
        svgEl("rect", { x, y, width: plateW - 12, height: plateH, rx: 16, class: "sb-plate" }, svg);
        for (let j = 0; j < per; j++) svgEl("circle", { cx: x + 20 + (j % perRow) * 22, cy: y + 22 + Math.floor(j / perRow) * 22, r: 8, class: "sb-dot" }, svg);
        txt(svg, x + plateW - 22, y + plateH - 10, String(per), "sb-lab b", { "text-anchor": "end" });
      }
      el.querySelector(".sb-host").replaceChildren(svg);
      const done = left < k;
      const t = el.querySelector(".sb-t");
      if (!done) t.innerHTML = grupla ? `${k}'erli gruplar ayırıyoruz: şimdiye kadar <b>${nGroups}</b> grup.` : `Her tura her tabağa 1 nesne: şimdiye kadar her tabakta <b>${per}</b>.`;
      else t.innerHTML = grupla ? `${st.t} ÷ ${k} = <b>${q}</b>${r ? ` , kalan <b>${r}</b>` : ""} → ${q} grup${r ? `, ${r} nesne gruba girmedi` : ""}.` : `${st.t} ÷ ${k} = <b>${q}</b>${r ? `, kalan <b>${r}</b>` : ""} → her tabakta ${q} nesne${r ? `, ${r} nesne arttı` : ""}.`;
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = st[b.dataset.v]; });
      el.querySelector('[data-a="one"]').disabled = done; el.querySelector('[data-a="all"]').disabled = done; el.querySelector('[data-a="reset"]').disabled = dealt === 0;
    }
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.a;
      if (a === "one") dealt += st.k; else if (a === "all") dealt = Math.floor(st.t / st.k) * st.k; else dealt = 0;
      draw(); changed(); const f = el.querySelector(`[data-a="${a}"]`); (f && !f.disabled ? f : el.querySelector('[data-a="reset"]'))?.focus();
    }));
    el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; dealt = 0; draw(); changed(); }));
    draw();
    return () => { const done = st.t - dealt < st.k; return { toplam: st.t, grup: st.k, bolum: Math.floor(st.t / st.k), kalan: st.t % st.k, bitti: done ? 1 : 0 }; };
  });

  // ---------------------------------------------------------------------------
  // b-islem-makinesi: girdi sayısı sırayla işlem kutularından geçer. cfg: adimlar:[["+",5],["×",2]], giris, min, max, hedef
  reg("b-islem-makinesi", (el, cfg, changed) => {
    const steps = cfg.adimlar ?? [["+", 5]], min = cfg.min ?? 0, max = cfg.max ?? 20;
    let x = cfg.giris ?? min;
    const ap = (v, [op, k]) => (op === "+" ? v + k : op === "−" ? v - k : op === "×" ? v * k : v / k);
    el.innerHTML = `<div class="sb"><div class="sb-host sb-wrap"></div>${slider("Girdi", "x", min, max, cfg.adim ?? 1, x)}<p class="sb-txt sb-t"></p></div>`;
    function draw() {
      const vals = [x]; steps.forEach((s) => vals.push(ap(vals[vals.length - 1], s)));
      const n = steps.length, W = 110 + n * 200, H = 120;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg sb-svg", role: "img", "aria-label": "İşlem makinesi" });
      const box = (cx, s, op) => { svgEl("rect", { x: cx - 45, y: 30, width: 90, height: 56, rx: op ? 28 : 10, class: "sb-box" + (op ? " op" : "") }, svg); txt(svg, cx, 66, s, "sb-boxtxt" + (op ? " op" : "")); };
      const arrow = (x1, x2) => { svgEl("line", { x1, y1: 58, x2: x2 - 10, y2: 58, class: "sb-arrow" }, svg); svgEl("polygon", { points: `${x2},58 ${x2 - 12},51 ${x2 - 12},65`, class: "sb-arrowhead" }, svg); };
      const show = (v) => (Number.isInteger(v) ? String(v) : "?");
      box(55, show(vals[0]));
      txt(svg, 55, 18, "Girdi", "sb-lab mid");
      steps.forEach(([op, k], i) => {
        const cx = 155 + i * 200;
        arrow(100 + i * 200, cx - 45); box(cx, `${op} ${k}`, true); arrow(cx + 45, cx + 55);
        box(cx + 100, show(vals[i + 1]));
        txt(svg, cx + 100, 18, i === n - 1 ? "Çıktı" : "Ara sonuç", "sb-lab mid");
      });
      el.querySelector(".sb-host").replaceChildren(svg);
      const out = vals[vals.length - 1];
      const t = el.querySelector(".sb-t");
      if (!Number.isInteger(out)) t.innerHTML = `${x} sayısı ${steps.find(([o]) => o === "÷")?.[1]}'e tam bölünmüyor; başka bir girdi dene.`;
      else t.innerHTML = `${vals.map((v, i) => (i === 0 ? `<b>${v}</b>` : ` → ${steps[i - 1][0]} ${steps[i - 1][1]} → <b>${v}</b>`)).join("")}${cfg.hedef !== undefined ? (out === cfg.hedef ? ` <span class="sb-ok">Hedef çıktıya ulaştın!</span>` : ` · Hedef çıktı: <b>${cfg.hedef}</b>`) : ""}`;
      el.querySelector('[data-v="x"]').textContent = x;
    }
    el.querySelector("input[data-k]").addEventListener("input", (e) => { x = +e.target.value; draw(); changed(); });
    draw();
    return () => { let v = x; steps.forEach((s) => { v = ap(v, s); }); return { giris: x, cikis: Number.isInteger(v) ? v : null }; };
  });

  // ---------------------------------------------------------------------------
  // b-terazi: iki tarafta işlem; bilinmeyen kaydırıcıyla değişir, terazi eşitlikte dengelenir.
  // cfg: sol:[a, op, b], sag:[a, op, b] (bilinmeyen null), x, min, max
  reg("b-terazi", (el, cfg, changed) => {
    const sol = cfg.sol ?? [8, "+", 5], sag = cfg.sag ?? [null, "+", 6], min = cfg.min ?? 0, max = cfg.max ?? 20;
    let x = cfg.x ?? min;
    const ap = (a, op, b) => (op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : a / b);
    const val = (s) => { const a = s[0] === null ? x : s[0], b = s[2] === null ? x : s[2]; return s.length === 1 ? a : ap(a, s[1], b); };
    const show = (s, mark) => (s.length === 1 ? (s[0] === null ? mark : String(s[0])) : `${s[0] === null ? mark : s[0]} ${s[1]} ${s[2] === null ? mark : s[2]}`);
    el.innerHTML = `<div class="sb"><div class="sb-host"></div>${slider("Kutudaki sayı (□)", "x", min, max, 1, x)}<p class="sb-big sb-t"></p></div>`;
    function draw() {
      const L = val(sol), R = val(sag), d = L - R, ang = d === 0 ? 0 : Math.max(-10, Math.min(10, -d * 1.5));
      const svg = svgEl("svg", { viewBox: "0 0 600 260", class: "sim-svg sb-svg", role: "img", "aria-label": `${show(sol, "□")} ve ${show(sag, "□")} terazide` });
      svgEl("polygon", { points: "280,250 320,250 300,130", class: "sb-stand" }, svg);
      const g = svgEl("g", { transform: `rotate(${ang} 300 130)` }, svg);
      svgEl("line", { x1: 70, y1: 130, x2: 530, y2: 130, class: "sb-beam" }, g);
      const pan = (cx, s, v) => {
        svgEl("line", { x1: cx - 90, y1: 130, x2: cx - 90, y2: 200, class: "sb-str" }, g); svgEl("line", { x1: cx + 90, y1: 130, x2: cx + 90, y2: 200, class: "sb-str" }, g);
        svgEl("rect", { x: cx - 100, y: 200, width: 200, height: 10, rx: 4, class: "sb-pan" }, g);
        const n = Number.isInteger(v) && v >= 0 && v <= 60 ? v : 0;
        for (let i = 0; i < n; i++) svgEl("rect", { x: cx - 95 + (i % 15) * 12.6, y: 186 - Math.floor(i / 15) * 12.6, width: 11, height: 11, rx: 2, class: "sb-unit" }, g);
        txt(g, cx, 52, show(s, "□"), "sb-boxtxt", { "font-size": 32 });
        txt(g, cx, 92, `= ${Number.isInteger(v) ? v : "?"}`, "sb-lab mid b", { "font-size": 24 });
      };
      pan(160, sol, L); pan(440, sag, R);
      el.querySelector(".sb-host").replaceChildren(svg);
      el.querySelector(".sb-t").innerHTML = d === 0 ? `<span class="sb-ok">Denge!</span> ${show(sol, "<b>" + x + "</b>")} = ${show(sag, "<b>" + x + "</b>")}` : `${d > 0 ? "Sol taraf ağır" : "Sağ taraf ağır"}: ${Number.isInteger(L) ? L : "?"} ≠ ${Number.isInteger(R) ? R : "?"}`;
      el.querySelector('[data-v="x"]').textContent = x;
    }
    el.querySelector("input[data-k]").addEventListener("input", (e) => { x = +e.target.value; draw(); changed(); });
    draw();
    return () => ({ x, esit: val(sol) === val(sag) ? 1 : 0, sol: val(sol), sag: val(sag) });
  });

  // ---------------------------------------------------------------------------
  // b-cisim: geometrik cisimler; sürükleyerek döndür, yüz/köşe/ayrıt vurgula.
  const SOLIDS = (() => {
    const box = (a, b, c) => ({ v: [[-a, -b, -c], [a, -b, -c], [a, b, -c], [-a, b, -c], [-a, -b, c], [a, -b, c], [a, b, c], [-a, b, c]], f: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]] });
    const tri = { v: [[-1.2, -0.9, -1], [1.2, -0.9, -1], [0, 1.1, -1], [-1.2, -0.9, 1], [1.2, -0.9, 1], [0, 1.1, 1]], f: [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]] };
    const pyr = { v: [[-1.1, -0.9, -1.1], [1.1, -0.9, -1.1], [1.1, -0.9, 1.1], [-1.1, -0.9, 1.1], [0, 1.2, 0]], f: [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]] };
    const t3 = [0, 120, 240].map((d) => [1.25 * Math.cos((d * Math.PI) / 180), -0.8, 1.25 * Math.sin((d * Math.PI) / 180)]);
    const tet = { v: [...t3, [0, 1.2, 0]], f: [[0, 1, 2], [0, 1, 3], [1, 2, 3], [2, 0, 3]] };
    return {
      kup: { ad: "Küp", ...box(1, 1, 1), not: "6 yüzünün hepsi birbirine eş karedir." },
      kareprizma: { ad: "Kare prizma", ...box(0.8, 1.3, 0.8), not: "Alt ve üst yüzü kare, yan yüzleri dikdörtgendir." },
      dikprizma: { ad: "Dikdörtgenler prizması", ...box(1.45, 0.8, 0.9), not: "Bütün yüzleri dikdörtgendir; karşılıklı yüzler eştir." },
      ucgenprizma: { ad: "Üçgen prizma", ...tri, not: "2 yüzü üçgen, 3 yüzü dikdörtgendir." },
      karepiramit: { ad: "Kare piramit", ...pyr, not: "Tabanı kare, 4 yan yüzü üçgendir; yan yüzler tepe noktasında birleşir." },
      ucgenpiramit: { ad: "Üçgen piramit", ...tet, not: "4 yüzünün hepsi üçgendir." },
      silindir: { ad: "Silindir", egri: "silindir", duz: 2, egriYuz: 1, not: "2 düz yüzü (tabanları) eş dairedir, 1 eğri yüzü vardır. Köşesi yoktur; yuvarlanabilir." },
      koni: { ad: "Koni", egri: "koni", duz: 1, egriYuz: 1, not: "1 düz yüzü (tabanı) dairedir, 1 eğri yüzü vardır. Köşesi yoktur, 1 tepe noktası vardır." },
      kure: { ad: "Küre", egri: "kure", duz: 0, egriYuz: 1, not: "Yalnız 1 eğri yüzü vardır. Düz yüzü, köşesi ve ayrıtı yoktur; her yöne yuvarlanabilir." },
    };
  })();
  reg("b-cisim", (el, cfg, changed) => {
    const list = cfg.liste ?? Object.keys(SOLIDS);
    let key = cfg.cisim ?? list[0], yaw = cfg.aci ?? 35, hi = cfg.goster ?? "";
    const tilt = (22 * Math.PI) / 180;
    el.innerHTML = `<div class="sb"><div class="sb-row seg-light" role="group" aria-label="Cisim seç">${list.map((k) => `<button type="button" data-c="${k}" aria-pressed="${k === key}">${SOLIDS[k].ad}</button>`).join("")}</div>
      <div class="plane-wrap"><div class="sb-host"></div><div class="plane-ctrl"><p class="sb-big sb-n"></p><p class="sb-txt sb-t"></p>
      <div class="sb-row" role="group" aria-label="Vurgula">${[["yuz", "Yüzler"], ["kose", "Köşeler"], ["ayrit", "Ayrıtlar"]].map(([k, l]) => `<button type="button" class="btn btn-outline btn-small sb-pressed" data-h="${k}" aria-pressed="${hi === k}">${l}</button>`).join("")}</div>
      <p class="sb-muted">Cismi sürükleyerek ya da ok tuşlarıyla döndür.</p></div></div></div>`;
    const svg = svgEl("svg", { viewBox: "0 0 320 300", class: "sim-svg sb-svg drag", tabindex: 0, role: "img", "aria-label": "Geometrik cisim" });
    el.querySelector(".sb-host").replaceChildren(svg);
    const S = 78, CX = 160, CY = 150;
    const rot = ([x, y, z]) => {
      const a = (yaw * Math.PI) / 180, x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      return [x1, y * Math.cos(tilt) - z1 * Math.sin(tilt), y * Math.sin(tilt) + z1 * Math.cos(tilt)];
    };
    const proj = (v) => { const [x1, y2, z2] = rot(v); return [CX + x1 * S, CY - y2 * S, z2]; };
    const counts = (s) => { if (s.egri) return { yuz: s.duz + s.egriYuz, duz: s.duz, egri: s.egriYuz, kose: 0, ayrit: null }; const E = new Set(); s.f.forEach((f) => f.forEach((v, i) => { const w = f[(i + 1) % f.length]; E.add(v < w ? `${v}-${w}` : `${w}-${v}`); })); return { yuz: s.f.length, duz: s.f.length, egri: 0, kose: s.v.length, ayrit: E.size }; };
    function draw() {
      const s = SOLIDS[key];
      svg.replaceChildren();
      if (!s.egri) {
        const P = s.v.map(proj), cen = s.v.reduce((acc, v) => acc.map((q, i) => q + v[i] / s.v.length), [0, 0, 0]);
        // Dışbükey cisim: yüzün dışa bakan yönü (yüz merkezi − cisim merkezi) bize doğruysa yüz görünür.
        const vis = s.f.map((f) => { const fc = f.reduce((acc, i) => acc.map((q, k) => q + s.v[i][k] / f.length), [0, 0, 0]); return rot(fc.map((q, k) => q - cen[k]))[2] > 1e-6; });
        const edges = new Map();
        s.f.forEach((f, fi) => f.forEach((v, i) => { const w = f[(i + 1) % f.length], k = v < w ? `${v}-${w}` : `${w}-${v}`; edges.set(k, (edges.get(k) || false) || vis[fi]); }));
        s.f.forEach((f, fi) => { if (vis[fi]) svgEl("polygon", { points: f.map((i) => P[i].slice(0, 2).join(",")).join(" "), class: "sb-face" + (hi === "yuz" ? " hi" : "") }, svg); });
        [...edges].sort((a, b) => a[1] - b[1]).forEach(([k, v]) => { const [i, j] = k.split("-").map(Number); svgEl("line", { x1: P[i][0], y1: P[i][1], x2: P[j][0], y2: P[j][1], class: "sb-edge" + (v ? "" : " hid") + (hi === "ayrit" ? " hi" : "") }, svg); });
        if (hi === "kose") { const vv = new Set(); s.f.forEach((f, fi) => { if (vis[fi]) f.forEach((i) => vv.add(i)); }); P.forEach((p, i) => svgEl("circle", { cx: p[0], cy: p[1], r: 8, class: "sb-vert" + (vv.has(i) ? "" : " hid") }, svg)); }
      } else {
        const r = 1.1, h = 1.1, ry = r * Math.sin(tilt) * S, rx = r * S;
        const ell = (cy, front, cls = "sb-edge") => svgEl("path", { d: front ? `M${CX - rx},${cy} A${rx},${ry} 0 0 0 ${CX + rx},${cy}` : `M${CX - rx},${cy} A${rx},${ry} 0 0 1 ${CX + rx},${cy}`, class: cls, fill: "none" }, svg);
        const fh = hi === "yuz" ? " hi" : "";
        if (s.egri === "silindir") {
          const top = CY - h * Math.cos(tilt) * S, bot = CY + h * Math.cos(tilt) * S;
          svgEl("path", { d: `M${CX - rx},${top} L${CX - rx},${bot} A${rx},${ry} 0 0 0 ${CX + rx},${bot} L${CX + rx},${top} A${rx},${ry} 0 0 1 ${CX - rx},${top} Z`, class: "sb-curve" + fh }, svg);
          svgEl("ellipse", { cx: CX, cy: top, rx, ry, class: "sb-curve" + fh }, svg);
          ell(bot, false, "sb-edge hid"); ell(bot, true);
        } else if (s.egri === "koni") {
          const apex = CY - 1.3 * Math.cos(tilt) * S, bot = CY + 1.0 * Math.cos(tilt) * S;
          svgEl("path", { d: `M${CX},${apex} L${CX - rx},${bot} A${rx},${ry} 0 0 0 ${CX + rx},${bot} Z`, class: "sb-curve" + fh }, svg);
          ell(bot, false, "sb-edge hid"); ell(bot, true);
          if (hi === "kose") svgEl("circle", { cx: CX, cy: apex, r: 8, class: "sb-vert" }, svg);
        } else {
          svgEl("circle", { cx: CX, cy: CY, r: 1.3 * S, class: "sb-curve" + fh }, svg);
          const ry2 = 1.3 * S * Math.sin(tilt);
          svgEl("path", { d: `M${CX - 1.3 * S},${CY} A${1.3 * S},${ry2} 0 0 1 ${CX + 1.3 * S},${CY}`, class: "sb-edge hid", fill: "none" }, svg);
          svgEl("path", { d: `M${CX - 1.3 * S},${CY} A${1.3 * S},${ry2} 0 0 0 ${CX + 1.3 * S},${CY}`, class: "sb-edge", fill: "none", "stroke-opacity": 0.4 }, svg);
        }
      }
      const c = counts(s);
      el.querySelector(".sb-n").textContent = s.ad;
      el.querySelector(".sb-t").innerHTML = s.egri ? `Düz yüz: <b>${c.duz}</b> · Eğri yüz: <b>${c.egri}</b> · Köşe: <b>yok</b><br>${s.not}` : `Yüz: <b>${c.yuz}</b> · Köşe: <b>${c.kose}</b> · Ayrıt: <b>${c.ayrit}</b><br>${s.not}`;
      svg.setAttribute("aria-label", `${s.ad}. ${el.querySelector(".sb-t").textContent}`);
    }
    el.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.c; el.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    el.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => { hi = hi === b.dataset.h ? "" : b.dataset.h; el.querySelectorAll("[data-h]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.h === hi)); draw(); changed(); }));
    let drag = null;
    svg.addEventListener("pointerdown", (ev) => { drag = ev.clientX; svg.setPointerCapture(ev.pointerId); });
    svg.addEventListener("pointermove", (ev) => { if (drag === null) return; yaw = (yaw + (ev.clientX - drag) * 0.8 + 360) % 360; drag = ev.clientX; draw(); });
    svg.addEventListener("pointerup", () => { drag = null; });
    svg.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" ? 10 : e.key === "ArrowLeft" ? -10 : 0; if (d) { e.preventDefault(); yaw = (yaw + d + 360) % 360; draw(); } });
    draw();
    return () => { const c = counts(SOLIDS[key]); return { cisim: list.indexOf(key), yuz: c.yuz, duz: c.duz, egri: c.egri, kose: c.kose, ayrit: c.ayrit ?? -1, vurgu: hi ? 1 : 0 }; };
  });

  // ---------------------------------------------------------------------------
  // b-cokgen: nokta tahtası; noktalara dokunarak köşe ekle, köşeye dokunarak sil. Kenar sayısı, ad, çevre.
  // cfg: w(8), h(6), points:[[x,y],...], cevre(true), birim("birim")
  reg("b-cokgen", (el, cfg, changed) => {
    const GW = cfg.w ?? 8, GH = cfg.h ?? 6, S = 56, P = 26;
    let pts = (cfg.points || []).map((p) => [...p]);
    let cur = [0, 0], kbd = false;
    const X = (v) => P + v * S, Y = (v) => P + (GH - v) * S;
    const NAMES = { 3: "üçgen", 4: "dörtgen", 5: "beşgen", 6: "altıgen", 7: "yedigen", 8: "sekizgen" };
    el.innerHTML = `<div class="plane-wrap"><div class="sb-host"></div><div class="plane-ctrl"><p class="sb-big sb-n"></p><p class="sb-txt sb-t"></p>
      <div class="sb-row">${B("Son köşeyi sil", 'data-a="undo"')}${B("Temizle", 'data-a="clear"')}</div>
      <p class="sb-muted">Noktalara dokunarak köşe ekle; bir köşeye yeniden dokunursan silinir. Klavyede ok tuşlarıyla gez, Enter ile seç.</p></div></div>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${2 * P + GW * S} ${2 * P + GH * S}`, class: "sim-svg sb-svg", tabindex: 0, role: "application", "aria-label": "Nokta tahtası" });
    el.querySelector(".sb-host").replaceChildren(svg);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const segX = (p1, p2, p3, p4) => { const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4); return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)); };
    function info() {
      const n = pts.length;
      if (n < 3) return { kose: n, kenar: n === 2 ? 1 : 0, cevre: -1, kesisim: 0, kapali: 0, kare: 0, dikdortgen: 0 };
      const corners = pts.filter((p, i) => cross(pts[(i + n - 1) % n], p, pts[(i + 1) % n]) !== 0);
      let kes = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue; if (segX(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) kes = 1; }
      const axis = pts.every((p, i) => { const q = pts[(i + 1) % n]; return p[0] === q[0] || p[1] === q[1]; });
      const per = axis ? pts.reduce((s, p, i) => { const q = pts[(i + 1) % n]; return s + Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]); }, 0) : -1;
      const c = corners.length;
      let dik = 0, kare = 0;
      if (c === 4) {
        const v = corners.map((p, i) => { const q = corners[(i + 1) % 4]; return [q[0] - p[0], q[1] - p[1]]; });
        dik = v.every((a, i) => { const b = v[(i + 1) % 4]; return a[0] * b[0] + a[1] * b[1] === 0; }) ? 1 : 0;
        const L = v.map(([a, b]) => a * a + b * b);
        kare = dik && L.every((l) => l === L[0]) ? 1 : 0;
      }
      return { kose: n, kenar: c, cevre: kes ? -1 : per, kesisim: kes, kapali: 1, kare, dikdortgen: dik };
    }
    function draw() {
      svg.replaceChildren();
      const f = info();
      if (pts.length >= 2) svgEl(pts.length >= 3 ? "polygon" : "polyline", { points: pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(" "), class: "sb-poly" + (pts.length < 3 ? " open" : "") }, svg);
      if (cfg.cevre !== false && f.cevre > 0) pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], L = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]); txt(svg, (X(p[0]) + X(q[0])) / 2 + (p[0] === q[0] ? 16 : 0), (Y(p[1]) + Y(q[1])) / 2 + (p[1] === q[1] ? -8 : 5), String(L), "sb-elab"); });
      for (let x = 0; x <= GW; x++) for (let y = 0; y <= GH; y++) {
        svgEl("circle", { cx: X(x), cy: Y(y), r: 4, class: "sb-peg" }, svg);
        svgEl("circle", { cx: X(x), cy: Y(y), r: 20, class: "sb-peg hit", "data-p": `${x},${y}` }, svg);
      }
      pts.forEach(([x, y]) => svgEl("circle", { cx: X(x), cy: Y(y), r: 9, class: "sb-vtx" }, svg));
      if (kbd && document.activeElement === svg) svgEl("circle", { cx: X(cur[0]), cy: Y(cur[1]), r: 15, class: "sb-peg cur" }, svg);
      const n = el.querySelector(".sb-n"), t = el.querySelector(".sb-t");
      if (f.kapali === 0) { n.textContent = pts.length ? "Köşe eklemeye devam et" : "Bir şekil çiz"; t.textContent = "Kapalı bir şekil için en az 3 köşe gerekir."; }
      else if (f.kesisim) { n.textContent = "Kenarlar kesişiyor"; t.textContent = "Kenarları birbirini kesmeyen bir şekil çiz."; }
      else {
        const nm = NAMES[f.kenar] || `${f.kenar} kenarlı çokgen`;
        n.textContent = f.kare ? "Kare" : f.dikdortgen ? "Dikdörtgen" : nm.charAt(0).toLocaleUpperCase("tr-TR") + nm.slice(1);
        t.innerHTML = `Kenar: <b>${f.kenar}</b> · Köşe: <b>${f.kenar}</b>${f.kare || f.dikdortgen ? " · bir dörtgendir" : ""}${cfg.cevre !== false ? `<br>Çevre: ${f.cevre > 0 ? `<b>${f.cevre} ${esc(cfg.birim ?? "birim")}</b>` : "çapraz kenar olduğu için burada hesaplanmıyor"}` : ""}${f.kenar !== pts.length ? "<br>Not: aynı doğru üzerindeki bir nokta köşe sayılmaz." : ""}`;
      }
    }
    const toggle = (x, y) => { const i = pts.findIndex((p) => p[0] === x && p[1] === y); if (i >= 0) pts.splice(i, 1); else pts.push([x, y]); draw(); changed(); };
    svg.addEventListener("click", (ev) => { const k = ev.target.dataset?.p; if (!k) return; const [x, y] = k.split(",").map(Number); cur = [x, y]; toggle(x, y); });
    svg.addEventListener("keydown", (e) => {
      const m = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      kbd = true;
      if (m) { e.preventDefault(); cur = [Math.max(0, Math.min(GW, cur[0] + m[0])), Math.max(0, Math.min(GH, cur[1] + m[1]))]; draw(); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(...cur); }
    });
    svg.addEventListener("pointerdown", () => { kbd = false; });
    svg.addEventListener("blur", () => { if (kbd) { kbd = false; draw(); } });
    el.querySelector('[data-a="undo"]').addEventListener("click", () => { pts.pop(); draw(); changed(); });
    el.querySelector('[data-a="clear"]').addEventListener("click", () => { pts = []; draw(); changed(); });
    draw();
    return () => info();
  });

  // ---------------------------------------------------------------------------
  // b-simetri-dogrusu: şeklin üzerindeki aday doğrulara dokun; şekil o doğruya göre katlanınca üst üste geliyor mu?
  // cfg: sekil ("kare" | "dikdortgen" | "eskenar" | "altigen" | "T" | "paralelkenar" | "ikizkenar"), sekiller:[...] (seçim düğmeleri)
  const SHAPES = (() => {
    const reg2 = (k, r, a0 = 90) => [...Array(k).keys()].map((i) => { const a = ((a0 + (i * 360) / k) * Math.PI) / 180; return [r * Math.cos(a), r * Math.sin(a)]; });
    return {
      kare: { ad: "Kare", p: [[-1, -1], [1, -1], [1, 1], [-1, 1]], c: [0, 45, 90, 135] },
      dikdortgen: { ad: "Dikdörtgen", p: [[-1.5, -0.9], [1.5, -0.9], [1.5, 0.9], [-1.5, 0.9]], c: [0, 31, 90, 149] },
      eskenar: { ad: "Eşkenar üçgen", p: reg2(3, 1.35).map(([x, y]) => [x, y - 0.25]), c: [90, 30, 150, 0], o: [0, -0.25] },
      ikizkenar: { ad: "İkizkenar üçgen", p: [[-1, -0.9], [1, -0.9], [0, 1.3]], c: [90, 0, 45, 135] },
      altigen: { ad: "Düzgün altıgen", p: reg2(6, 1.3, 0), c: [0, 30, 60, 90, 120, 150] },
      T: { ad: "T harfi", p: [[-1.4, 1.2], [1.4, 1.2], [1.4, 0.6], [0.4, 0.6], [0.4, -1.3], [-0.4, -1.3], [-0.4, 0.6], [-1.4, 0.6]], c: [90, 0, 45, 135] },
      paralelkenar: { ad: "Paralelkenar", p: [[-1.6, -0.8], [0.8, -0.8], [1.6, 0.8], [-0.8, 0.8]], c: [0, 90, 27, 135] },
    };
  })();
  reg("b-simetri-dogrusu", (el, cfg, changed) => {
    const list = cfg.sekiller ?? [cfg.sekil ?? "kare"];
    let key = cfg.sekil ?? list[0], sel = new Set(), last = null;
    const S = 90, CX = 160, CY = 160;
    const refl = ([x, y], deg, [ox, oy]) => { const a = (2 * deg * Math.PI) / 180, dx = x - ox, dy = y - oy; return [ox + dx * Math.cos(a) + dy * Math.sin(a), oy + dx * Math.sin(a) - dy * Math.cos(a)]; };
    const isSym = (sh, deg) => { const o = sh.o ?? [0, 0]; return sh.p.every((p) => { const q = refl(p, deg, o); return sh.p.some((r) => Math.hypot(r[0] - q[0], r[1] - q[1]) < 1e-6); }); };
    el.innerHTML = `<div class="sb">${list.length > 1 ? `<div class="sb-row seg-light" role="group" aria-label="Şekil seç">${list.map((k) => `<button type="button" data-s="${k}" aria-pressed="${k === key}">${SHAPES[k].ad}</button>`).join("")}</div>` : ""}
      <div class="plane-wrap"><div class="sb-host"></div><div class="plane-ctrl"><p class="sb-big sb-n"></p><p class="sb-txt sb-t"></p><p class="sb-muted">Kesikli doğrulara dokun. Turuncu kesikli çizgi, şeklin o doğruya göre katlanmış hâlidir.</p>${B("Seçimleri temizle", 'data-a="clr"')}</div></div></div>`;
    function draw() {
      const sh = SHAPES[key], o = sh.o ?? [0, 0];
      const svg = svgEl("svg", { viewBox: "0 0 320 320", class: "sim-svg sb-svg", role: "group", "aria-label": `${sh.ad} ve aday doğrular` });
      const PX = ([x, y]) => [CX + x * S, CY - y * S];
      svgEl("polygon", { points: sh.p.map((p) => PX(p).join(",")).join(" "), class: "sb-shape" }, svg);
      if (last !== null) { const ok = isSym(sh, last); svgEl("polygon", { points: sh.p.map((p) => PX(refl(p, last, o)).join(",")).join(" "), class: "sb-ghost" + (ok ? " ok" : "") }, svg); }
      sh.c.forEach((deg) => {
        const a = (deg * Math.PI) / 180, L = 1.75, [ox, oy] = o;
        const p1 = PX([ox - L * Math.cos(a), oy - L * Math.sin(a)]), p2 = PX([ox + L * Math.cos(a), oy + L * Math.sin(a)]);
        const s = sel.has(deg), ok = isSym(sh, deg);
        svgEl("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: "sb-cand" + (s ? ` sel ${ok ? "ok" : "bad"}` : "") }, svg);
        const h = svgEl("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: "sb-hit", tabindex: 0, role: "checkbox", "aria-checked": s, "aria-label": `${deg} derecelik doğru`, "data-d": deg }, svg);
        const tog = () => { if (sel.has(deg)) { sel.delete(deg); last = null; } else { sel.add(deg); last = deg; } draw(); changed(); el.querySelector(`[data-d="${deg}"]`)?.focus(); };
        h.addEventListener("click", tog);
        h.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); tog(); } });
      });
      el.querySelector(".sb-host").replaceChildren(svg);
      const good = [...sel].filter((d) => isSym(sh, d)).length, bad = sel.size - good;
      el.querySelector(".sb-n").textContent = sh.ad;
      el.querySelector(".sb-t").innerHTML = last === null ? `Bulunan simetri doğrusu: <b>${good}</b>${bad ? ` · Simetri doğrusu olmayan seçim: <b>${bad}</b>` : ""}` : `${isSym(sh, last) ? '<span class="sb-ok">Bu bir simetri doğrusu:</span> iki parça üst üste geliyor.' : '<span class="sb-no">Bu bir simetri doğrusu değil:</span> katlanınca parçalar çakışmıyor.'}<br>Bulunan simetri doğrusu: <b>${good}</b>`;
    }
    el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.s; sel = new Set(); last = null; el.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    el.querySelector('[data-a="clr"]').addEventListener("click", () => { sel = new Set(); last = null; draw(); changed(); });
    draw();
    return () => { const sh = SHAPES[key], good = [...sel].filter((d) => isSym(sh, d)).length; return { bulunan: good, yanlis: sel.size - good, toplam: sh.c.filter((d) => isSym(sh, d)).length, sekil: list.indexOf(key) }; };
  });

  // ---------------------------------------------------------------------------
  // b-simetri-izgara: kareli zeminde simetri. mod "tamamla": verilen yarının simetriğini boya;
  // mod "ayna": sola boyadığın kare sağda kendiliğinden oluşur; mod "kod": sol parçanın yön kodunu sağ tarafa uyarlayıp yaz.
  // cfg: cols, rows, eksen ("dikey" | "yatay"), verilen:[[c,r]...], mod, kod:{bas:[c,r], yol:"↑↑→"}
  reg("b-simetri-izgara", (el, cfg, changed) => {
    const C = cfg.cols ?? 10, R = cfg.rows ?? 8, dikey = (cfg.eksen ?? "dikey") === "dikey", mod = cfg.mod ?? "tamamla";
    const mir = ([c, r]) => (dikey ? [C - 1 - c, r] : [c, R - 1 - r]);
    const MV = { "↑": [0, -1], "↓": [0, 1], "←": [-1, 0], "→": [1, 0] };
    const flipArrow = (a) => (dikey ? { "←": "→", "→": "←" }[a] || a : { "↑": "↓", "↓": "↑" }[a] || a);
    let given = (cfg.verilen || []).map((p) => [...p]);
    let codeLeft = "", startR = null;
    if (mod === "kod") {
      const k = cfg.kod ?? { bas: [3, 6], yol: "↑↑→↑" };
      codeLeft = k.yol; let p = [...k.bas]; given = [[...p]];
      for (const ch of [...k.yol]) { const d = MV[ch]; if (!d) continue; p = [p[0] + d[0], p[1] + d[1]]; given.push([...p]); }
      startR = mir(k.bas);
    }
    const target = new Set(given.map((p) => keyOf(...mir(p))));
    let user = new Set(mod === "kod" ? [keyOf(...startR)] : []), path = startR ? [[...startR]] : [], userCode = "";
    const S = 40, W = C * S, H = R * S;
    const side = (c, r) => (dikey ? (c >= C / 2 ? 1 : 0) : (r >= R / 2 ? 1 : 0));
    el.innerHTML = `<div class="sb"><div class="sb-host" style="max-width:480px;width:100%;justify-self:center"></div>
      ${mod === "kod" ? `<p class="sb-txt">Sol parçanın kodu: <b>Başla, ${esc(codeLeft.split("").join(" "))}</b></p><div class="sb-row" role="group" aria-label="Yön düğmeleri">${["↑", "↓", "←", "→"].map((a) => B(a, `data-m="${a}" aria-label="${{ "↑": "yukarı", "↓": "aşağı", "←": "sola", "→": "sağa" }[a]}"`)).join("")}${B("Geri al", 'data-a="undo"')}${B("Baştan", 'data-a="reset"')}</div>` : B("Temizle", 'data-a="reset"')}
      <p class="sb-txt sb-t"></p></div>`;
    function draw(focusKey) {
      const svg = svgEl("svg", { viewBox: `0 0 ${W + 4} ${H + 4}`, class: "sim-svg sb-svg", role: "group", "aria-label": "Simetri ızgarası" });
      const g = svgEl("g", { transform: "translate(2,2)" }, svg);
      const givenSet = new Set(given.map((p) => keyOf(...p)));
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const k = keyOf(c, r), fix = givenSet.has(k) || (mod === "ayna" && side(c, r) === 0 && user.has(k)), on = user.has(k);
        const canTap = mod === "tamamla" ? side(c, r) === 1 : mod === "ayna" ? side(c, r) === 0 : false;
        const isStart = mod === "kod" && startR && c === startR[0] && r === startR[1];
        const showOn = mod === "ayna" ? user.has(keyOf(...(side(c, r) ? mir([c, r]) : [c, r]))) : on;
        const cls = `sb-cell${fix && mod !== "ayna" ? " fix" : showOn ? " on" : ""}${canTap ? " tap" : ""}${isStart ? " start" : ""}`;
        const rc = svgEl("rect", { x: c * S, y: r * S, width: S, height: S, class: cls, "data-k": k }, g);
        if (canTap) {
          rc.setAttribute("tabindex", 0); rc.setAttribute("role", "checkbox"); rc.setAttribute("aria-checked", on); rc.setAttribute("aria-label", `${r + 1}. satır ${c + 1}. sütun`);
          const tog = () => { user.has(k) ? user.delete(k) : user.add(k); draw(k); changed(); };
          rc.addEventListener("click", tog);
          rc.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); tog(); } });
        }
      }
      if (dikey) svgEl("line", { x1: W / 2, x2: W / 2, y1: -2, y2: H + 2, class: "sb-axisline" }, g); else svgEl("line", { y1: H / 2, y2: H / 2, x1: -2, x2: W + 2, class: "sb-axisline" }, g);
      el.querySelector(".sb-host").replaceChildren(svg);
      if (focusKey) svg.querySelector(`[data-k="${focusKey}"]`)?.focus();
      const s = state(), t = el.querySelector(".sb-t");
      if (mod === "ayna") t.innerHTML = `Sol tarafa boyadığın her karenin simetriği sağda oluşur. Boyanan kare: <b>${user.size * 2}</b>`;
      else if (s.dogru) t.innerHTML = `<span class="sb-ok">Simetrik şekil tamam!</span>${mod === "kod" ? ` Senin kodun: <b>Başla, ${userCode.split("").join(" ")}</b>` : ""}`;
      else t.innerHTML = `${mod === "kod" ? `Senin kodun: <b>Başla${userCode ? ", " + userCode.split("").join(" ") : ""}</b> · ` : ""}Eksik kare: <b>${s.eksik}</b> · Fazla kare: <b>${s.fazla}</b>`;
      el.querySelectorAll("[data-m]").forEach((b) => { const d = MV[b.dataset.m], p = path[path.length - 1]; const q = [p[0] + d[0], p[1] + d[1]]; b.disabled = q[0] < 0 || q[1] < 0 || q[0] >= C || q[1] >= R; });
    }
    function state() {
      const u = mod === "ayna" ? new Set() : user;
      const eksik = [...target].filter((k) => !u.has(k)).length, fazla = [...u].filter((k) => !target.has(k)).length;
      return { dogru: mod !== "ayna" && eksik === 0 && fazla === 0 ? 1 : 0, eksik, fazla, boyanan: user.size, adim: userCode.length };
    }
    el.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
      const d = MV[b.dataset.m], p = path[path.length - 1], q = [p[0] + d[0], p[1] + d[1]];
      path.push(q); userCode += b.dataset.m; user = new Set(path.map((x) => keyOf(...x))); draw(); changed(); el.querySelector(`[data-m="${b.dataset.m}"]`)?.focus();
    }));
    el.querySelector('[data-a="undo"]')?.addEventListener("click", () => { if (path.length > 1) { path.pop(); userCode = userCode.slice(0, -1); user = new Set(path.map((x) => keyOf(...x))); draw(); changed(); } });
    el.querySelector('[data-a="reset"]').addEventListener("click", () => { if (mod === "kod") { path = [[...startR]]; userCode = ""; user = new Set([keyOf(...startR)]); } else user = new Set(); draw(); changed(); });
    draw();
    return state;
  });

  // ---------------------------------------------------------------------------
  // b-sivi: kaba litre, yarım litre ve çeyrek litre dök. cfg: kapasite (L), birimler [1, 0.5, 0.25], hedef (L)
  reg("b-sivi", (el, cfg, changed) => {
    const cap = cfg.kapasite ?? 4, units = cfg.birimler ?? [1, 0.5, 0.25];
    const NAME = { 1: "1 L sürahi", 0.5: "½ L şişe", 0.25: "¼ L bardak" };
    let amt = 0, over = false;
    const pours = Object.fromEntries(units.map((u) => [u, 0]));
    el.innerHTML = `<div class="plane-wrap"><div class="sb-host" style="max-width:260px;width:100%;justify-self:center"></div><div class="plane-ctrl"><p class="sb-big sb-t"></p><div class="sb-row">${units.map((u) => B(`+ ${NAME[u] ?? u + " L"}`, `data-u="${u}"`)).join("")}</div>${B("Kabı boşalt", 'data-u="0"')}<p class="sb-txt sb-p"></p></div></div>`;
    const lit = (v) => { const w = Math.floor(v + 1e-9), f = Math.round((v - w) * 4); const fr = ["", "¼", "½", "¾"][f]; return w && fr ? `${w} ${fr}` : w ? String(w) : fr || "0"; };
    function draw() {
      const H = 300, top = 20, bot = 280, x0 = 76, x1 = 206, y = (v) => bot - (v / cap) * (bot - top);
      const svg = svgEl("svg", { viewBox: `0 0 270 ${H + 10}`, class: "sim-svg sb-svg", role: "img", "aria-label": `${cap} litrelik kapta ${fmt(amt)} litre` });
      svgEl("rect", { x: x0, y: y(Math.min(amt, cap)), width: x1 - x0, height: bot - y(Math.min(amt, cap)), class: "sb-water" + (over ? " over" : "") }, svg);
      for (let q = 1; q < cap * 4; q++) { const v = q / 4, whole = q % 4 === 0, half = q % 2 === 0; svgEl("line", { x1: x1 - (whole ? 40 : half ? 26 : 14), x2: x1, y1: y(v), y2: y(v), class: whole ? "sb-gl" : "sb-gl half" }, svg); if (whole) txt(svg, x1 + 8, y(v) + 6, `${v} L`, "sb-lab b"); else if (half) txt(svg, x1 + 8, y(v) + 5, `${lit(v)}`, "sb-lab", { "font-size": 14 }); }
      if (cfg.hedef) { svgEl("line", { x1: x0 - 14, x2: x1 + 2, y1: y(cfg.hedef), y2: y(cfg.hedef), class: "sb-target" }, svg); txt(svg, x0 - 16, y(cfg.hedef) + 5, "hedef", "sb-lab", { "text-anchor": "end", "font-size": 15 }); }
      svgEl("path", { d: `M${x0},${top - 10} L${x0},${bot} L${x1},${bot} L${x1},${top - 10}`, class: "sb-tank", fill: "none" }, svg);
      txt(svg, (x0 + x1) / 2, H + 4, `Kap: ${cap} L`, "sb-lab mid");
      el.querySelector(".sb-host").replaceChildren(svg);
      el.querySelector(".sb-t").innerHTML = over ? '<span class="sb-no">Kap taştı!</span>' : `Kapta <b>${lit(amt)} litre</b> su var`;
      const used = units.filter((u) => pours[u]).map((u) => `${pours[u]} × ${NAME[u] ?? u + " L"}`);
      el.querySelector(".sb-p").innerHTML = used.length ? `Döktüklerin: ${used.join(" + ")}` : "Kap boş. Düğmelerle su dök.";
    }
    el.querySelectorAll("[data-u]").forEach((b) => b.addEventListener("click", () => {
      const u = +b.dataset.u;
      if (u === 0) { amt = 0; over = false; units.forEach((k) => (pours[k] = 0)); }
      else if (!over) { pours[u]++; amt = Math.round((amt + u) * 100) / 100; if (amt > cap + 1e-9) over = true; }
      draw(); changed();
    }));
    draw();
    return () => ({ litre: amt, tasti: over ? 1 : 0, dokme: Object.values(pours).reduce((a, b) => a + b, 0) });
  });

  // ---------------------------------------------------------------------------
  // b-siklik: kategorik veri. Çetele, sıklık tablosu, nesne grafiği ve sütun grafiği aynı veriden.
  // cfg: kategoriler:[...], degerler:[...], max(10), gorunum: "tablo" | "nesne" | "sutun", baslik
  reg("b-siklik", (el, cfg, changed) => {
    const cats = cfg.kategoriler ?? ["A", "B", "C"], vals = cats.map((_, i) => (cfg.degerler ?? [])[i] ?? 0), max = cfg.max ?? 10;
    let view = cfg.gorunum ?? "tablo";
    el.innerHTML = `<div class="sb"><div class="sb-row seg-light" role="group" aria-label="Gösterim">${[["tablo", "Çetele ve sıklık tablosu"], ["nesne", "Nesne grafiği"], ["sutun", "Sütun grafiği"]].map(([k, l]) => `<button type="button" data-g="${k}" aria-pressed="${k === view}">${l}</button>`).join("")}</div><div class="sb-host sb-wrap"></div><p class="sb-txt sb-t"></p></div>`;
    const tally = (n) => {
      const groups = Math.ceil(n / 5), w = Math.max(1, groups) * 46;
      const svg = svgEl("svg", { viewBox: `0 0 ${w} 34`, width: w * 0.8, height: 28, role: "img", "aria-label": `${n} çetele çizgisi` });
      for (let gI = 0; gI < groups; gI++) {
        const k = Math.min(5, n - gI * 5), ox = gI * 46 + 4;
        for (let i = 0; i < Math.min(4, k); i++) svgEl("line", { x1: ox + i * 8, x2: ox + i * 8, y1: 4, y2: 30, class: "sb-tally" }, svg);
        if (k === 5) svgEl("line", { x1: ox - 4, x2: ox + 28, y1: 26, y2: 8, class: "sb-tally" }, svg);
      }
      return svg.outerHTML;
    };
    function draw() {
      const host = el.querySelector(".sb-host");
      const btns = (i) => `<span class="bb-btns"><button type="button" class="btn btn-outline btn-small" data-d="-1" data-i="${i}" aria-label="${esc(cats[i])} azalt" ${vals[i] ? "" : "disabled"}>−</button><button type="button" class="btn btn-outline btn-small" data-d="1" data-i="${i}" aria-label="${esc(cats[i])} artır" ${vals[i] < max ? "" : "disabled"}>+</button></span>`;
      if (view === "tablo") {
        host.innerHTML = `<table class="sb-tbl"><thead><tr><th>${esc(cfg.baslik ?? "Seçenek")}</th><th>Çetele</th><th>Sıklık</th><th><span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Değiştir</span></th></tr></thead><tbody>${cats.map((c, i) => `<tr><td>${esc(c)}</td><td>${tally(vals[i])}</td><td class="n">${vals[i]}</td><td>${btns(i)}</td></tr>`).join("")}</tbody></table>`;
      } else {
        const W = 560, rowH = 44, L = 120;
        if (view === "nesne") {
          const svg = svgEl("svg", { viewBox: `0 0 ${W} ${cats.length * rowH + 10}`, class: "sim-svg sb-svg", role: "img", "aria-label": "Nesne grafiği" });
          cats.forEach((c, i) => { const y = 8 + i * rowH; txt(svg, 4, y + 24, c, "sb-lab b"); for (let k = 0; k < vals[i]; k++) svgEl("circle", { cx: L + 18 + k * 40, cy: y + 18, r: 15, class: "sb-dot" }, svg); svgEl("line", { x1: L, x2: L, y1: y - 4, y2: y + rowH - 4, class: "sb-grid" }, svg); });
          host.innerHTML = ""; host.appendChild(svg);
        } else {
          const H = 230, bw = (W - 50) / cats.length, Yv = (v) => 16 + H - (v / max) * H;
          const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H + 60}`, class: "sim-svg sb-svg", role: "img", "aria-label": "Sütun grafiği" });
          for (let v = 0; v <= max; v += max > 10 ? 2 : 1) { svgEl("line", { x1: 40, x2: W, y1: Yv(v), y2: Yv(v), class: "sb-grid" }, svg); txt(svg, 32, Yv(v) + 5, String(v), "sb-num sm", { "text-anchor": "end" }); }
          cats.forEach((c, i) => { svgEl("rect", { x: 46 + i * bw + bw * 0.18, y: Yv(vals[i]), width: bw * 0.64, height: Yv(0) - Yv(vals[i]), rx: 3, class: "sb-bar" }, svg); txt(svg, 46 + i * bw + bw / 2, H + 42, c, "sb-lab mid b"); });
          host.innerHTML = ""; host.appendChild(svg);
        }
        host.insertAdjacentHTML("beforeend", `<div class="sb-row" style="margin-top:8px">${cats.map((c, i) => `<span class="sb-row" style="gap:4px"><span class="sb-muted">${esc(c)}</span>${btns(i)}</span>`).join("")}</div>`);
      }
      host.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.i; vals[i] += +b.dataset.d; draw(); changed(); const f = el.querySelector(`[data-i="${i}"][data-d="${b.dataset.d}"]`); (f && !f.disabled ? f : el.querySelector(`[data-i="${i}"]:not([disabled])`))?.focus(); }));
      const tot = vals.reduce((a, b) => a + b, 0), mx = Math.max(...vals), mn = Math.min(...vals);
      const top = vals.filter((v) => v === mx).length === 1 && mx > 0 ? cats[vals.indexOf(mx)] : null;
      el.querySelector(".sb-t").innerHTML = `Toplam: <b>${tot}</b>${top ? ` · En çok: <b>${esc(top)}</b> (${mx})` : ""}${tot && vals.filter((v) => v === mn).length === 1 ? ` · En az: <b>${esc(cats[vals.indexOf(mn)])}</b> (${mn})` : ""}`;
    }
    el.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { view = b.dataset.g; el.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    draw();
    return () => { const o = { toplam: vals.reduce((a, b) => a + b, 0) }; vals.forEach((v, i) => (o[`c${i}`] = v)); const mx = Math.max(...vals); o.enCok = vals.filter((v) => v === mx).length === 1 ? vals.indexOf(mx) : -1; o.gorunum = ["tablo", "nesne", "sutun"].indexOf(view); return o; };
  });
})();
