// Konu anlatımı simülasyonları (grup f: 10. ve 11. sınıf). LESSONS.registerSim ile kaydolur; lessons.js değişmez.
(() => {
  if (!window.LESSONS) return;
  const reg = window.LESSONS.registerSim;
  const NS = "http://www.w3.org/2000/svg";

  // ---------- Stil (bir kez) ----------
  if (!document.getElementById("sf-style")) {
    const s = document.createElement("style");
    s.id = "sf-style";
    s.textContent = `
.sf-host { min-width: 0; }
.sf-tri { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 3; stroke-linejoin: round; }
.sf-poly { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 3; stroke-linejoin: round; fill-opacity: .9; }
.sf-poly.bad { fill: var(--bad-soft); stroke: var(--bad); }
.sf-aux { stroke: var(--good); stroke-width: 2.5; fill: none; }
.sf-aux2 { stroke: var(--warn); stroke-width: 2.5; fill: none; }
.sf-ext { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 5 4; fill: none; }
.sf-diag { stroke: var(--good); stroke-width: 2; stroke-dasharray: 6 4; }
.sf-diag.out { stroke: var(--bad); }
.sf-circ { fill: none; stroke: var(--warn); stroke-width: 2; }
.sf-dot { fill: var(--ink); }
.sf-dot.g { fill: var(--good); } .sf-dot.w { fill: var(--warn); } .sf-dot.b { fill: var(--brand); }
.sf-lab { font: 600 13px var(--font); fill: var(--ink); text-anchor: middle; paint-order: stroke; stroke: var(--surface); stroke-width: 4px; stroke-linejoin: round; }
.sf-lab.big { font-size: 17px; }
.sf-lab.l { text-anchor: start; } .sf-lab.r { text-anchor: end; }
.sf-lab.bad { fill: var(--bad); }
.sf-small { font: 11px var(--font); fill: var(--muted); text-anchor: middle; }
.sf-curve { fill: none; stroke: var(--brand); stroke-width: 3.5; stroke-linejoin: round; stroke-linecap: round; }
.sf-curve2 { fill: none; stroke: var(--good); stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }
.sf-curve3 { fill: none; stroke: var(--warn); stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }
.sf-asy { stroke: var(--bad); stroke-width: 1.8; stroke-dasharray: 6 5; }
.sf-yx { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 3 4; }
.sf-hline { stroke: var(--warn); stroke-width: 2; stroke-dasharray: 8 4; }
.sf-shade { stroke: var(--good); stroke-width: 7; stroke-linecap: round; opacity: .75; }
.sf-cell-a { fill: var(--brand); } .sf-cell-b { fill: var(--warn); } .sf-cell-c { fill: var(--good); } .sf-cell-d { fill: var(--bg-soft); stroke: var(--line); }
.sf-sq { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 1.5; }
.sf-left { fill: var(--bad-soft); stroke: var(--bad); stroke-width: 1.5; stroke-dasharray: 4 3; }
.sf-box { fill: var(--surface); stroke: var(--line); stroke-width: 2; }
.sf-box.on { stroke: var(--brand); }
.sf-mach { fill: var(--brand); }
.sf-mach-t { font: 700 18px var(--font); fill: var(--on-brand); text-anchor: middle; }
.sf-arrow { stroke: var(--muted); stroke-width: 2; fill: none; marker-end: url(#sf-ah); }
.sf-ahead { fill: var(--muted); }
.sf-vals { margin: 0; font-size: 15px; display: grid; gap: 4px; }
.sf-vals b { color: var(--brand); }
.sf-vals .ok { color: var(--good); font-weight: 600; }
.sf-vals .no { color: var(--bad); font-weight: 600; }
.sf-tbl { border-collapse: collapse; font-size: 14px; width: 100%; }
.sf-tbl th, .sf-tbl td { border: 1px solid var(--line); padding: 6px 8px; text-align: center; }
.sf-tbl th { background: var(--bg-soft); font-weight: 600; }
.sf-tbl td.sel { background: var(--brand-soft); font-weight: 700; }
.sf-tbl input { width: 64px; font: inherit; padding: 4px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface); color: var(--ink); text-align: center; }
.sf-chips, .la .sf-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.sf-chips li, .la .sf-chips li { line-height: 1.5; border: 1px solid var(--line); border-radius: 999px; padding: 2px 10px; font-size: 14px; background: var(--surface); }
.sf-chips li.on { background: var(--brand); color: var(--on-brand); border-color: var(--brand); }
.sf-chips li.alt { background: var(--good-soft); border-color: var(--good); }
.sf-sel { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 14px; color: var(--muted); }
.sf-sel select { font: inherit; padding: 4px 6px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface); color: var(--ink); }
.sf-tag { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 13px; font-weight: 600; margin: 2px 4px 2px 0; background: var(--bg-soft); color: var(--muted); border: 1px solid var(--line); }
.sf-akis .tr-line.cur { display: block; }
.sf-tag.on { background: var(--good-soft); color: var(--good); border-color: var(--good); }
`;
    document.head.appendChild(s);
  }

  // ---------- Yardımcılar ----------
  const fmt = (x, d = 2) => { if (x === null || x === undefined || !isFinite(x)) return "–"; const v = Math.round(x * 10 ** d) / 10 ** d; return (v || 0).toLocaleString("tr-TR", { maximumFractionDigits: Math.max(0, d) }).replace("-", "−"); };
  const par = (v, d = 2) => (v < 0 ? `(${fmt(v, d)})` : fmt(v, d));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
  function svgEl(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, cls = "sf-lab", extra = {}) { const t = svgEl("text", { x, y, class: cls, ...extra }, parent); t.textContent = s; return t; }
  function svgPoint(svg, ev) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  function slider(label, key, min, max, step, value) {
    return `<label class="sim-slider"><span>${label}: <b data-v="${key}">${fmt(value)}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-k="${key}"></label>`;
  }
  function bindSliders(el, st, draw, changed) {
    el.querySelectorAll("input[type=range][data-k]").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); changed(); }));
  }
  function setVals(el, st, f = {}) { el.querySelectorAll("[data-v]").forEach((b) => { const k = b.dataset.v; b.textContent = f[k] ? f[k](st[k]) : fmt(st[k]); }); }
  // Dünya koordinatı -> SVG: eşit ölçekli düzlem.
  function plane({ xr, yr, S, pad = 0 }) {
    const X = (v) => pad + (v - xr[0]) * S, Y = (v) => pad + (yr[1] - v) * S;
    return { X, Y, S, xr, yr, W: 2 * pad + (xr[1] - xr[0]) * S, H: 2 * pad + (yr[1] - yr[0]) * S, inv: (px, py) => [xr[0] + (px - pad) / S, yr[1] - (py - pad) / S] };
  }
  function grid(svg, P, { every = 2, labels = true, axes = true } = {}) {
    for (let i = Math.ceil(P.xr[0]); i <= P.xr[1]; i++) svgEl("line", { x1: P.X(i), y1: P.Y(P.yr[0]), x2: P.X(i), y2: P.Y(P.yr[1]), class: i === 0 && axes ? "pl-axis" : "pl-grid" }, svg);
    for (let j = Math.ceil(P.yr[0]); j <= P.yr[1]; j++) svgEl("line", { x1: P.X(P.xr[0]), y1: P.Y(j), x2: P.X(P.xr[1]), y2: P.Y(j), class: j === 0 && axes ? "pl-axis" : "pl-grid" }, svg);
    if (!labels) return;
    const ox = axes && P.xr[0] < 0 ? 0 : P.xr[0], oy = axes && P.yr[0] < 0 ? 0 : P.yr[0];
    for (let i = Math.ceil(P.xr[0]); i <= P.xr[1]; i++) if (i % every === 0 && (i !== 0 || !axes || P.xr[0] >= 0)) txt(svg, P.X(i), P.Y(oy) + 15, i, "pl-num");
    for (let j = Math.ceil(P.yr[0]); j <= P.yr[1]; j++) if (j % every === 0 && j !== 0) txt(svg, P.X(ox) - 6, P.Y(j) + 4, j, "pl-num pl-numy");
  }
  // Noktalar dizisini kırıklı yol olarak çizer; NaN ya da büyük sıçrama yolu böler.
  function polyline(svg, P, pts, cls) {
    let d = "", pen = false, prev = null;
    const lim = (P.yr[1] - P.yr[0]) * 3;
    for (const [x, y] of pts) {
      if (!isFinite(x) || !isFinite(y) || Math.abs(y) > 60 || Math.abs(x) > 60) { pen = false; prev = null; continue; }
      if (prev && (Math.abs(y - prev[1]) > lim || Math.abs(x - prev[0]) > lim)) pen = false;
      d += `${pen ? "L" : "M"}${P.X(x).toFixed(1)},${P.Y(y).toFixed(1)}`; pen = true; prev = [x, y];
    }
    return svgEl("path", { d, class: cls }, svg);
  }
  const sample = (fn, x0, x1, n = 600) => [...Array(n + 1)].map((_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [x, fn(x)]; });
  function knob(svg, P, [x, y], i, label, cls = "nl-knob") {
    return svgEl("circle", { cx: P.X(x), cy: P.Y(y), r: 11, class: cls, "data-i": i, tabindex: 0, role: "slider", "aria-label": label, "aria-valuetext": `(${fmt(x, 1)}, ${fmt(y, 1)})` }, svg);
  }
  // Sürüklenen noktalar: fare/dokunma ile ve odaklanınca ok tuşlarıyla.
  function dragPoints(svg, P, pts, o, onMove) {
    const step = o.step ?? 1, lock = new Set(o.lock || []), xr = o.xr || P.xr, yr = o.yr || P.yr;
    const snap = (v, r) => clamp(Math.round(v / step) * step, r[0], r[1]);
    let di = -1;
    const tryMove = (i, q, kb) => {
      if (pts.some((p, j) => j !== i && near(p[0], q[0]) && near(p[1], q[1]))) return;
      if (o.ok && !o.ok(i, q)) return;
      if (near(pts[i][0], q[0]) && near(pts[i][1], q[1])) return;
      pts[i] = q; onMove(i);
      if (kb) svg.querySelector(`[data-i="${i}"]`)?.focus();
    };
    svg.addEventListener("pointerdown", (ev) => { const k = ev.target.dataset?.i; if (k === undefined || lock.has(+k)) return; di = +k; svg.setPointerCapture(ev.pointerId); ev.preventDefault(); });
    svg.addEventListener("pointermove", (ev) => { if (di < 0) return; const p = svgPoint(svg, ev), [x, y] = P.inv(p.x, p.y); tryMove(di, [snap(x, xr), snap(y, yr)]); });
    const up = () => { di = -1; };
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
    svg.addEventListener("keydown", (ev) => {
      const k = ev.target.dataset?.i; if (k === undefined || lock.has(+k)) return;
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[ev.key]; if (!d) return;
      ev.preventDefault(); const p = pts[+k];
      tryMove(+k, [snap(p[0] + d[0] * step, xr), snap(p[1] + d[1] * step, yr)], true);
    });
  }
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  function foot(p, a, b) { const ab = sub(b, a), t = dot(sub(p, a), ab) / dot(ab, ab); return [a[0] + t * ab[0], a[1] + t * ab[1], t]; }
  function radical(N) { // N = k²·m
    if (N < 0 || !Number.isInteger(N)) return null;
    let k = 1, m = N;
    for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; }
    return m === 1 ? String(k) : k === 1 ? `√${m}` : `${k}√${m}`;
  }
  const seg = (items, cur, attr = "data-s") => `<div class="seg-light" role="group">${items.map(([k, l]) => `<button type="button" ${attr}="${k}" aria-pressed="${k === cur}">${l}</button>`).join("")}</div>`;
  const sup = (s) => String(s).replace(/[0-9n−-]/g, (c) => ({ 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", n: "ⁿ", "−": "⁻", "-": "⁻" })[c]);

  // ================= Dik üçgende trigonometrik oranlar =================
  reg("f-dik-ucgen", (el, cfg, changed) => {
    const st = { deg: cfg.deg ?? 30, hyp: cfg.hyp ?? 5 };
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl"><p class="eq sf-eq"></p>
      ${slider("Açı α (derece)", "deg", 5, 85, 1, st.deg)}${cfg.scale === false ? "" : slider("Hipotenüs", "hyp", 2, 8, 0.5, st.hyp)}<div class="sf-vals"></div></div></div>`;
    const host = el.querySelector(".sf-host");
    function draw() {
      const r = (st.deg * Math.PI) / 180, c = st.hyp, a = c * Math.sin(r), b = c * Math.cos(r), k = 44;
      const A = [24, 380], C = [24 + b * k, 380], B = [24 + b * k, 380 - a * k];
      const svg = svgEl("svg", { viewBox: "0 0 420 400", class: "sim-svg", role: "img", "aria-label": `α = ${st.deg}° olan dik üçgen` });
      svgEl("polygon", { points: [A, B, C].map((p) => p.join(",")).join(" "), class: "sf-tri" }, svg);
      svgEl("polyline", { points: `${C[0] - 14},${C[1]} ${C[0] - 14},${C[1] - 14} ${C[0]},${C[1] - 14}`, class: "sf-ext", style: "stroke-dasharray:none" }, svg);
      const rr = 40; svgEl("path", { d: `M${A[0]},${A[1]} L${A[0] + rr},${A[1]} A${rr},${rr} 0 0 0 ${A[0] + rr * Math.cos(r)},${A[1] - rr * Math.sin(r)} Z`, class: "ao-fill" }, svg);
      txt(svg, A[0] + rr + 14, A[1] - 8, "α", "sf-lab l");
      svgEl("line", { x1: C[0], y1: C[1], x2: B[0], y2: B[1], class: "uc-sin" }, svg);
      svgEl("line", { x1: A[0], y1: A[1], x2: C[0], y2: C[1], class: "uc-cos" }, svg);
      txt(svg, (A[0] + C[0]) / 2, A[1] + 16, `komşu ${fmt(b)}`, "sf-lab");
      txt(svg, C[0] + 6, (C[1] + B[1]) / 2, `karşı ${fmt(a)}`, "sf-lab l");
      txt(svg, (A[0] + B[0]) / 2 - 10, (A[1] + B[1]) / 2 - 8, `hipotenüs ${fmt(c)}`, "sf-lab r");
      host.replaceChildren(svg);
      el.querySelector(".sf-eq").textContent = `α = ${st.deg}°`;
      el.querySelector(".sf-vals").innerHTML = `<span class="uc-k sin">sin α = karşı / hipotenüs = <b class="num">${fmt(Math.sin(r), 3)}</b></span>
        <span class="uc-k cos">cos α = komşu / hipotenüs = <b class="num">${fmt(Math.cos(r), 3)}</b></span>
        <span>tan α = karşı / komşu = <b class="num">${fmt(Math.tan(r), 3)}</b></span>
        <span>cot α = komşu / karşı = <b class="num">${fmt(1 / Math.tan(r), 3)}</b></span>
        <span class="muted">sin²α + cos²α = ${fmt(Math.sin(r) ** 2 + Math.cos(r) ** 2, 3)}</span>`;
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => { const r = (st.deg * Math.PI) / 180; return { deg: st.deg, hyp: st.hyp, sin: Math.sin(r), cos: Math.cos(r), tan: Math.tan(r), cot: 1 / Math.tan(r), opp: st.hyp * Math.sin(r), adj: st.hyp * Math.cos(r) }; };
  });

  // ================= Üçgen: yardımcı elemanlar, alan, sinüs/kosinüs teoremi =================
  reg("f-ucgen", (el, cfg, changed) => {
    const pts = (cfg.points || [[1, 1], [8, 1], [3, 5]]).map((p) => [...p]);
    const on = new Set(cfg.show || []);
    const NAMES = { yukseklik: "Yükseklikler", kenarortay: "Kenarortaylar", aciortay: "Açıortaylar", ortadikme: "Orta dikmeler", alan: "Alan yüksekliği" };
    const P = plane({ xr: [0, 10], yr: [0, 7], S: 40, pad: 22 });
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl">
      ${(cfg.toggles || []).length ? `<div class="seg-light" role="group" aria-label="Göster">${cfg.toggles.map((k) => `<button type="button" data-t="${k}" aria-pressed="${on.has(k)}">${NAMES[k]}</button>`).join("")}</div>` : ""}
      <div class="sf-vals"></div><p class="note">Köşeleri sürükle${(cfg.lock || []).length ? " (yalnız serbest köşe hareket eder)" : ""}; seçili köşeyi ok tuşlarıyla da taşıyabilirsin.</p></div></div>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${P.W} ${P.H}`, class: "sim-svg drag", role: "group", "aria-label": "Üçgen" });
    el.querySelector(".sf-host").replaceChildren(svg);
    const calc = () => {
      const [A, B, C] = pts, a = dist(B, C), b = dist(C, A), c = dist(A, B);
      const area2 = cross(sub(B, A), sub(C, A)), area = Math.abs(area2) / 2;
      const ang = (x, y, z) => (Math.acos(clamp((y * y + z * z - x * x) / (2 * y * z), -1, 1)) * 180) / Math.PI;
      const An = ang(a, b, c), Bn = ang(b, c, a), Cn = 180 - An - Bn;
      let O = null, R = null, H = null, I = null, r = null;
      if (area > 1e-9) {
        const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
        const s2 = (p) => p[0] * p[0] + p[1] * p[1];
        O = [(s2(A) * (B[1] - C[1]) + s2(B) * (C[1] - A[1]) + s2(C) * (A[1] - B[1])) / d, (s2(A) * (C[0] - B[0]) + s2(B) * (A[0] - C[0]) + s2(C) * (B[0] - A[0])) / d];
        R = (a * b * c) / (4 * area); H = [A[0] + B[0] + C[0] - 2 * O[0], A[1] + B[1] + C[1] - 2 * O[1]];
        const p = a + b + c; I = [(a * A[0] + b * B[0] + c * C[0]) / p, (a * A[1] + b * B[1] + c * C[1]) / p]; r = (2 * area) / p;
      }
      const G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
      const hc = c ? (2 * area) / c : 0;
      return { A, B, C, a, b, c, An, Bn, Cn, area, O, R, H, I, r, G, hc };
    };
    function draw() {
      const k = calc(), { A, B, C } = k;
      svg.replaceChildren();
      grid(svg, P, { labels: false, axes: false });
      svgEl("polygon", { points: pts.map(([x, y]) => `${P.X(x)},${P.Y(y)}`).join(" "), class: "sf-tri" }, svg);
      const ln = (p, q, cls) => svgEl("line", { x1: P.X(p[0]), y1: P.Y(p[1]), x2: P.X(q[0]), y2: P.Y(q[1]), class: cls }, svg);
      const dotAt = (p, cls, lab) => { svgEl("circle", { cx: P.X(p[0]), cy: P.Y(p[1]), r: 5, class: `sf-dot ${cls}` }, svg); if (lab) txt(svg, P.X(p[0]) + 12, P.Y(p[1]) - 8, lab, "sf-lab l"); };
      const V = [[A, B, C], [B, C, A], [C, A, B]];
      if (k.area > 1e-9) {
        if (on.has("yukseklik")) V.forEach(([p, q, s]) => { const f = foot(p, q, s); ln(p, f, "sf-aux2"); if (f[2] < 0) ln(f, q, "sf-ext"); if (f[2] > 1) ln(f, s, "sf-ext"); dotAt(f, "w"); }), dotAt(k.H, "w", "H");
        if (on.has("kenarortay")) { V.forEach(([p, q, s]) => { const m = mid(q, s); ln(p, m, "sf-aux"); dotAt(m, "g"); }); dotAt(k.G, "g", "G"); }
        if (on.has("aciortay")) { V.forEach(([p, q, s]) => { const bq = dist(p, q), bs = dist(p, s), D = [(bs * q[0] + bq * s[0]) / (bq + bs), (bs * q[1] + bq * s[1]) / (bq + bs)]; ln(p, D, "sf-aux"); }); svgEl("circle", { cx: P.X(k.I[0]), cy: P.Y(k.I[1]), r: k.r * P.S, class: "sf-circ" }, svg); dotAt(k.I, "g", "I"); }
        if (on.has("ortadikme")) { V.forEach(([, q, s]) => { const m = mid(q, s); ln(m, k.O, "sf-aux"); dotAt(m, "g"); }); svgEl("circle", { cx: P.X(k.O[0]), cy: P.Y(k.O[1]), r: k.R * P.S, class: "sf-circ" }, svg); dotAt(k.O, "w", "O"); }
        if (on.has("alan")) { const f = foot(C, A, B); ln(C, f, "sf-aux2"); if (f[2] < 0) ln(f, A, "sf-ext"); if (f[2] > 1) ln(f, B, "sf-ext"); dotAt(f, "w"); txt(svg, (P.X(C[0]) + P.X(f[0])) / 2 + 8, (P.Y(C[1]) + P.Y(f[1])) / 2, `h = ${fmt(k.hc)}`, "sf-lab l"); }
      }
      const G = k.G;
      ["A", "B", "C"].forEach((nm, i) => {
        const p = pts[i], v = sub(p, G), L = Math.hypot(...v) || 1;
        txt(svg, P.X(p[0] + (v[0] / L) * 0.55), P.Y(p[1] + (v[1] / L) * 0.55) + 6, nm, "sf-lab big");
        if (on.has("aci") || cfg.angles) txt(svg, P.X(p[0] - (v[0] / L) * 0.75), P.Y(p[1] - (v[1] / L) * 0.75) + 4, `${fmt([k.An, k.Bn, k.Cn][i], 1)}°`, "sf-small");
      });
      if (on.has("kenar") || cfg.sides) [[B, C, "a"], [C, A, "b"], [A, B, "c"]].forEach(([p, q, nm]) => { const m = mid(p, q), v = sub(m, G), L = Math.hypot(...v) || 1; txt(svg, P.X(m[0] + (v[0] / L) * 0.4), P.Y(m[1] + (v[1] / L) * 0.4) + 4, `${nm} = ${fmt(dist(p, q))}`, "sf-lab"); });
      pts.forEach((p, i) => { if (!(cfg.lock || []).includes(i)) knob(svg, P, p, i, `${"ABC"[i]} köşesi`); else svgEl("circle", { cx: P.X(p[0]), cy: P.Y(p[1]), r: 6, class: "sf-dot b" }, svg); });
      const lines = [];
      if (k.area < 1e-9) lines.push(`<span class="no">Köşeler aynı doğru üzerinde: üçgen oluşmuyor.</span>`);
      else {
        lines.push(`<span>a = ${fmt(k.a)} · b = ${fmt(k.b)} · c = ${fmt(k.c)}</span>`);
        lines.push(`<span>A = ${fmt(k.An, 1)}° · B = ${fmt(k.Bn, 1)}° · C = ${fmt(k.Cn, 1)}°</span>`);
        if (cfg.info?.includes("alan")) lines.push(`<span>Alan = c · h / 2 = ${fmt(k.c)} · ${fmt(k.hc)} / 2 = <b class="num">${fmt(k.area)}</b></span>`);
        if (cfg.info?.includes("sinus")) lines.push(`<span>a / sin A = <b class="num">${fmt(k.a / Math.sin((k.An * Math.PI) / 180))}</b></span><span>b / sin B = <b class="num">${fmt(k.b / Math.sin((k.Bn * Math.PI) / 180))}</b></span><span>c / sin C = <b class="num">${fmt(k.c / Math.sin((k.Cn * Math.PI) / 180))}</b></span><span class="muted">2R = ${fmt(2 * k.R)} (çevrel çemberin çapı)</span>`);
        if (cfg.info?.includes("kosinus")) { const rhs = k.b ** 2 + k.c ** 2 - 2 * k.b * k.c * Math.cos((k.An * Math.PI) / 180); lines.push(`<span>a² = <b class="num">${fmt(k.a ** 2)}</b></span><span>b² + c² − 2bc·cos A = <b class="num">${fmt(rhs)}</b></span><span class="muted">b² + c² = ${fmt(k.b ** 2 + k.c ** 2)} (A = 90° iken a²'ye eşit)</span>`); }
        if (on.has("kenarortay")) { const m = mid(B, C); lines.push(`<span class="muted">AG : GD = ${fmt(dist(A, G))} : ${fmt(dist(G, m))} = 2 : 1</span>`); }
        if (on.has("aciortay")) lines.push(`<span class="muted">İç teğet çember yarıçapı r = ${fmt(k.r)}</span>`);
        if (on.has("ortadikme")) lines.push(`<span class="muted">Çevrel çember yarıçapı R = ${fmt(k.R)}</span>`);
      }
      el.querySelector(".sf-vals").innerHTML = lines.join("");
    }
    el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { const t = b.dataset.t; on.has(t) ? on.delete(t) : on.add(t); b.setAttribute("aria-pressed", on.has(t)); draw(); changed(); }));
    dragPoints(svg, P, pts, { lock: cfg.lock, step: 1 }, () => { draw(); changed(); });
    draw();
    return () => { const k = calc(), mx = Math.max(k.An, k.Bn, k.Cn); return { a: k.a, b: k.b, c: k.c, A: k.An, B: k.Bn, C: k.Cn, area: k.area, h: k.hc, R: k.R, r: k.r, cx: pts[2][0], cy: pts[2][1], right: Math.abs(mx - 90) < 0.01 ? 1 : 0, obtuse: mx > 90.01 ? 1 : 0, shown: on.size }; };
  });

  // ================= İki kategorik değişken: çapraz tablo =================
  reg("f-capraz", (el, cfg, changed) => {
    const R = cfg.rows, C = cfg.cols, n = cfg.data.map((r) => [...r]), edit = cfg.edit !== false;
    let si = cfg.sec?.[0] ?? 0, sj = cfg.sec?.[1] ?? 0;
    const COLS = ["sf-cell-a", "sf-cell-b", "sf-cell-c", "sf-cell-d"];
    el.innerHTML = `<div class="table-wrap"><table class="sf-tbl"></table></div><div class="sf-bars"></div>${cfg.kosul ? `<div class="sf-sel"><label>Koşul (verilen): <select data-s="i">${R.map((r, i) => `<option value="${i}" ${i === si ? "selected" : ""}>${r}</option>`).join("")}</select></label><label>Olay: <select data-s="j">${C.map((c, j) => `<option value="${j}" ${j === sj ? "selected" : ""}>${c}</option>`).join("")}</select></label></div>` : ""}<div class="sf-vals"></div>`;
    const tbl = el.querySelector("table");
    const tot = () => { const rt = n.map((r) => r.reduce((a, b) => a + b, 0)), ct = C.map((_, j) => n.reduce((a, r) => a + r[j], 0)); return { rt, ct, N: rt.reduce((a, b) => a + b, 0) }; };
    function table() {
      const { rt, ct, N } = tot();
      tbl.innerHTML = `<thead><tr><th>${cfg.corner || ""}</th>${C.map((c) => `<th>${c}</th>`).join("")}<th>Toplam</th></tr></thead><tbody>${R.map((r, i) => `<tr><th>${r}</th>${C.map((_, j) => `<td class="${cfg.kosul && i === si && j === sj ? "sel" : ""}">${edit ? `<input type="number" min="0" max="999" value="${n[i][j]}" data-c="${i}-${j}" aria-label="${r}, ${C[j]}">` : n[i][j]}</td>`).join("")}<td class="num">${rt[i]}</td></tr>`).join("")}<tr><th>Toplam</th>${ct.map((v) => `<td class="num">${v}</td>`).join("")}<td class="num"><b>${N}</b></td></tr></tbody>`;
      tbl.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", () => { const [i, j] = inp.dataset.c.split("-").map(Number); n[i][j] = clamp(Math.round(+inp.value || 0), 0, 999); stats(); changed(); }));
    }
    function stats() {
      const { rt, ct, N } = tot();
      tbl.querySelectorAll("tbody tr").forEach((tr, i) => { const cells = tr.querySelectorAll("td.num"); if (i < R.length) cells[0].textContent = rt[i]; else { cells.forEach((c, j) => { c.innerHTML = j < C.length ? ct[j] : `<b>${N}</b>`; }); } });
      tbl.querySelectorAll("td").forEach((td) => td.classList.remove("sel"));
      if (cfg.kosul) tbl.querySelector(`[data-c="${si}-${sj}"]`)?.parentElement.classList.add("sel");
      const W = 420, bh = 30, gap = 14, L = 96;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${R.length * (bh + gap) + 34}`, class: "sim-svg", role: "img", "aria-label": "Satır yüzdeleri" });
      R.forEach((r, i) => {
        const y = i * (bh + gap) + 4; let x = L;
        txt(svg, L - 8, y + bh / 2 + 5, r, "sf-lab r");
        C.forEach((c, j) => {
          const f = rt[i] ? n[i][j] / rt[i] : 0, w = f * (W - L - 6);
          svgEl("rect", { x, y, width: Math.max(0, w), height: bh, class: COLS[j % 4] }, svg);
          if (w > 44) txt(svg, x + w / 2, y + bh / 2 + 5, `%${fmt(f * 100, 0)}`, "sf-lab");
          x += w;
        });
      });
      let lx = L; C.forEach((c, j) => { svgEl("rect", { x: lx, y: R.length * (bh + gap) + 10, width: 14, height: 14, class: COLS[j % 4] }, svg); txt(svg, lx + 20, R.length * (bh + gap) + 22, c, "sf-lab l"); lx += 30 + c.length * 7.5; });
      el.querySelector(".sf-bars").replaceChildren(svg);
      const lines = [];
      if (R.length === 2 && rt[0] && rt[1]) {
        const p0 = n[0][0] / rt[0], p1 = n[1][0] / rt[1];
        lines.push(`<span>${R[0]} içinde "${C[0]}" oranı: <b class="num">%${fmt(p0 * 100, 1)}</b> · ${R[1]} içinde: <b class="num">%${fmt(p1 * 100, 1)}</b></span>`);
        lines.push(`<span>Fark: <b class="num">${fmt(Math.abs(p0 - p1) * 100, 1)}</b> yüzde puanı${Math.abs(p0 - p1) < 0.005 ? ` <span class="ok">· oranlar eşit: tabloda ilişki görünmüyor</span>` : ""}</span>`);
      }
      if (cfg.kosul && N) {
        const pB = ct[sj] / N, pA = rt[si] / N, pAB = n[si][sj] / N, pBgA = rt[si] ? n[si][sj] / rt[si] : null;
        lines.push(`<span>P(${C[sj]} | ${R[si]}) = ${n[si][sj]} / ${rt[si]} = <b class="num">${fmt(pBgA, 3)}</b></span>`);
        lines.push(`<span class="muted">P(${C[sj]}) = ${ct[sj]} / ${N} = ${fmt(pB, 3)} · P(${R[si]} ∩ ${C[sj]}) = ${n[si][sj]} / ${N} = ${fmt(pAB, 3)} · P(${R[si]}) = ${fmt(pA, 3)}</span>`);
      }
      el.querySelector(".sf-vals").innerHTML = lines.join("");
    }
    el.querySelectorAll("select[data-s]").forEach((s) => s.addEventListener("change", () => { if (s.dataset.s === "i") si = +s.value; else sj = +s.value; stats(); changed(); }));
    table(); stats();
    return () => {
      const { rt, ct, N } = tot(), o = { total: N, si, sj };
      n.forEach((r, i) => r.forEach((v, j) => { o[`n${i}${j}`] = v; }));
      rt.forEach((v, i) => { o[`r${i}`] = v ? n[i][0] / v : null; });
      ct.forEach((v, j) => { o[`c${j}`] = v ? n[0][j] / v : null; });
      if (R.length === 2 && rt[0] && rt[1]) o.diff = Math.abs(n[0][0] / rt[0] - n[1][0] / rt[1]);
      if (N && rt[si]) { o.pc = n[si][sj] / rt[si]; o.pB = ct[sj] / N; o.bag = Math.abs(o.pc - o.pB); }
      return o;
    };
  });

  // ================= Koşullu olasılık ve Bayes: alan modeli =================
  reg("f-bayes", (el, cfg, changed) => {
    const nm = { A: "A", nA: "A′", B: "B", nB: "B′", ...(cfg.names || {}) };
    const st = { pA: cfg.pA ?? 30, pBA: cfg.pBA ?? 80, pBnA: cfg.pBnA ?? 20 };
    const N = cfg.N ?? 1000;
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl">
      ${slider(`P(${nm.A}) (%)`, "pA", cfg.minA ?? 1, 99, 1, st.pA)}${slider(`P(${nm.B} | ${nm.A}) (%)`, "pBA", 0, 100, 1, st.pBA)}${slider(`P(${nm.B} | ${nm.nA}) (%)`, "pBnA", 0, 100, 1, st.pBnA)}
      <div class="sf-vals"></div></div></div>`;
    const host = el.querySelector(".sf-host");
    const calc = () => { const a = st.pA / 100, ba = st.pBA / 100, bn = st.pBnA / 100, pB = a * ba + (1 - a) * bn; return { a, ba, bn, pB, pAB: a * ba, post: pB ? (a * ba) / pB : null }; };
    function draw() {
      const k = calc(), W = 400, H = 300, L = 10, T = 30, w = W - 20, h = H - 60;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": "Olasılık alan modeli" });
      const wa = w * k.a;
      const rect = (x, y, ww, hh, cls) => svgEl("rect", { x, y, width: Math.max(0, ww), height: Math.max(0, hh), class: cls }, svg);
      rect(L, T, wa, h * (1 - k.ba), "sf-cell-d"); rect(L, T + h * (1 - k.ba), wa, h * k.ba, "sf-cell-a");
      rect(L + wa, T, w - wa, h * (1 - k.bn), "sf-cell-d"); rect(L + wa, T + h * (1 - k.bn), w - wa, h * k.bn, "sf-cell-b");
      svgEl("rect", { x: L, y: T, width: w, height: h, class: "sf-box", style: "fill:none" }, svg);
      svgEl("line", { x1: L + wa, y1: T - 6, x2: L + wa, y2: T + h, class: "pl-axis" }, svg);
      if (wa > 50) txt(svg, L + wa / 2, T - 10, nm.A, "sf-lab"); else txt(svg, L, T - 10, nm.A, "sf-lab l"); if (w - wa > 50) txt(svg, L + wa + (w - wa) / 2, T - 10, nm.nA, "sf-lab"); else txt(svg, L + w, T - 10, nm.nA, "sf-lab r");
      if (wa > 60 && k.ba > 0.12) txt(svg, L + wa / 2, T + h - (h * k.ba) / 2 + 5, `${nm.A} ∩ ${nm.B}`, "sf-lab");
      if (w - wa > 60 && k.bn > 0.12) txt(svg, L + wa + (w - wa) / 2, T + h - (h * k.bn) / 2 + 5, `${nm.nA} ∩ ${nm.B}`, "sf-lab");
      txt(svg, W / 2, H - 8, `Renkli alanlar: ${nm.B}. Toplam renkli alan = P(${nm.B})`, "sf-small");
      host.replaceChildren(svg);
      const c1 = Math.round(N * k.a * k.ba), c2 = Math.round(N * (1 - k.a) * k.bn);
      el.querySelector(".sf-vals").innerHTML = `<span>P(${nm.A} ∩ ${nm.B}) = ${fmt(k.a, 2)} · ${fmt(k.ba, 2)} = <b class="num">${fmt(k.pAB, 4)}</b></span>
        <span>P(${nm.B}) = ${fmt(k.pAB, 4)} + ${fmt((1 - k.a) * k.bn, 4)} = <b class="num">${fmt(k.pB, 4)}</b></span>
        <span>P(${nm.A} | ${nm.B}) = P(${nm.A} ∩ ${nm.B}) / P(${nm.B}) = <b class="num">${k.post === null ? "tanımsız" : fmt(k.post, 4)}</b></span>
        <span class="muted">${N} kişide yaklaşık: ${c1} kişi (${nm.A} ve ${nm.B}), ${c2} kişi (${nm.nA} ve ${nm.B}).</span>`;
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => { const k = calc(); return { pA: k.a, pBA: k.ba, pBnA: k.bn, pB: k.pB, pAB: k.pAB, post: k.post }; };
  });

  // ================= İki nicel değişken: serpme diyagramı =================
  reg("f-sacilim", (el, cfg, changed) => {
    const pts = (cfg.points || [[1, 2], [2, 3], [3, 3], [4, 5], [5, 6], [6, 6], [7, 8]]).map((p) => [...p]);
    let showLine = !!cfg.lineOn;
    const P = plane({ xr: [0, 10], yr: [0, 10], S: 32, pad: 34 });
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl"><div class="sf-vals"></div>
      <div class="bb-ex">${cfg.line === false ? "" : `<button type="button" class="btn btn-small btn-outline" data-a="line">Eğilim doğrusu</button>`}${cfg.add === false ? "" : `<button type="button" class="btn btn-small btn-outline" data-a="add">Nokta ekle</button><button type="button" class="btn btn-small btn-outline" data-a="del">Son noktayı sil</button>`}</div>
      <p class="note">Noktaları sürükle ya da seçip ok tuşlarıyla taşı.</p></div></div>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${P.W} ${P.H}`, class: "sim-svg drag", role: "group", "aria-label": "Serpme diyagramı" });
    el.querySelector(".sf-host").replaceChildren(svg);
    const calc = () => {
      const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
      let sxy = 0, sxx = 0, syy = 0; pts.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
      const r = sxx && syy ? sxy / Math.sqrt(sxx * syy) : null, m = sxx ? sxy / sxx : null;
      return { n, r, m, b: m === null ? null : my - m * mx, mx, my };
    };
    const word = (r) => r === null ? "tanımsız (bir değişken hiç değişmiyor)" : Math.abs(r) < 0.1 ? "ilişki yok denecek kadar zayıf" : `${r > 0 ? "pozitif" : "negatif"} yönlü, ${Math.abs(r) >= 0.7 ? "güçlü" : Math.abs(r) >= 0.4 ? "orta" : "zayıf"} doğrusal ilişki`;
    function draw() {
      svg.replaceChildren();
      grid(svg, P, { every: 2, axes: false });
      svgEl("line", { x1: P.X(0), y1: P.Y(0), x2: P.X(10), y2: P.Y(0), class: "pl-axis" }, svg); svgEl("line", { x1: P.X(0), y1: P.Y(0), x2: P.X(0), y2: P.Y(10), class: "pl-axis" }, svg);
      txt(svg, P.X(5), P.H - 2, cfg.xlab || "x", "sf-small"); txt(svg, 10, P.Y(10) - 12, cfg.ylab || "y", "sf-small", { style: "text-anchor:start" });
      const k = calc();
      if (showLine && k.m !== null) { svgEl("line", { x1: P.X(0), y1: P.Y(k.b), x2: P.X(10), y2: P.Y(k.m * 10 + k.b), class: "sf-hline" }, svg); }
      pts.forEach((p, i) => knob(svg, P, p, i, `${i + 1}. nokta`, "nl-knob"));
      el.querySelector(".sf-vals").innerHTML = `<span>Nokta sayısı: ${k.n}</span><span>Korelasyon katsayısı r = <b class="num">${k.r === null ? "–" : fmt(k.r, 3)}</b></span><span class="muted">${word(k.r)}</span>${showLine && k.m !== null ? `<span>Eğilim doğrusu: y ≈ ${fmt(k.m, 2)}x ${k.b < 0 ? "−" : "+"} ${fmt(Math.abs(k.b), 2)}</span>` : ""}`;
    }
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.a;
      if (a === "line") showLine = !showLine;
      if (a === "add" && pts.length < 15) { for (let t = 0; t < 121; t++) { const q = [(5 + t) % 11, (5 + Math.floor(t / 11)) % 11]; if (!pts.some((p) => p[0] === q[0] && p[1] === q[1])) { pts.push(q); break; } } }
      if (a === "del" && pts.length > 3) pts.pop();
      draw(); changed();
    }));
    dragPoints(svg, P, pts, { step: 1 }, () => { draw(); changed(); });
    draw();
    return () => { const k = calc(); return { n: k.n, r: k.r, absr: k.r === null ? null : Math.abs(k.r), m: k.m, b: k.b, line: showLine ? 1 : 0 }; };
  });

  // ================= Asal çarpanlar ve bölenler =================
  const factor = (n) => { const f = []; let m = n; for (let p = 2; p * p <= m; p++) { let e = 0; while (m % p === 0) { m /= p; e++; } if (e) f.push([p, e]); } if (m > 1) f.push([m, 1]); return f; };
  const divisors = (n) => [...Array(n).keys()].map((i) => i + 1).filter((d) => n % d === 0);
  reg("f-bolen", (el, cfg, changed) => {
    const st = { n: cfg.n ?? 12 };
    el.innerHTML = `${slider("Sayı n", "n", 1, cfg.max ?? 120, 1, st.n)}<p class="eq sf-eq" style="font:700 22px var(--font);margin:0"></p><div class="sf-vals"></div><div class="sf-grid"></div>`;
    function draw() {
      const n = st.n, f = factor(n), ds = divisors(n);
      el.querySelector(".sf-eq").textContent = n === 1 ? "1 asal değildir, asal çarpanı yoktur" : `${n} = ${f.map(([p, e]) => (e > 1 ? `${p}${sup(e)}` : p)).join(" · ")}`;
      const tauTxt = f.length ? f.map(([, e]) => `(${e} + 1)`).join(" · ") + ` = ${ds.length}` : "1";
      el.querySelector(".sf-vals").innerHTML = `<span>Bölenleri: </span><ul class="sf-chips">${ds.map((d) => `<li class="${f.some(([p]) => p === d) ? "on" : ""}">${d}</li>`).join("")}</ul>
        <span>Pozitif bölen sayısı: <b class="num">${tauTxt}</b></span>
        <span class="muted">${ds.length === 2 ? "Tam iki böleni var: asal sayı." : n === 1 ? "" : `Koyu renkli bölenler asal çarpanlardır.`}${Number.isInteger(Math.sqrt(n)) && n > 1 ? " Bölen sayısı tek: n bir tam kare." : ""}</span>`;
      const g = el.querySelector(".sf-grid");
      if (f.length === 2 && cfg.tablo !== false) {
        const [[p, a], [q, b]] = f;
        g.innerHTML = `<p class="note">Her bölen ${p}ᵃ · ${q}ᵇ biçimindedir: üs seçenekleri (${a} + 1) × (${b} + 1) tablosu.</p><div class="table-wrap"><table class="sf-tbl"><thead><tr><th>×</th>${[...Array(b + 1)].map((_, j) => `<th>${q}${sup(j)}</th>`).join("")}</tr></thead><tbody>${[...Array(a + 1)].map((_, i) => `<tr><th>${p}${sup(i)}</th>${[...Array(b + 1)].map((_, j) => `<td>${p ** i * q ** j}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      } else g.innerHTML = "";
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => { const ds = divisors(st.n), f = factor(st.n); return { n: st.n, tau: ds.length, sigma: ds.reduce((a, b) => a + b, 0), prime: ds.length === 2 ? 1 : 0, kare: Number.isInteger(Math.sqrt(st.n)) ? 1 : 0, omega: f.length }; };
  });

  // ================= EBOB ve EKOK: kare döşeme + katlar =================
  reg("f-ebob", (el, cfg, changed) => {
    const st = { a: cfg.a ?? 12, b: cfg.b ?? 18, s: cfg.s ?? 1 };
    el.innerHTML = `<div class="sf-host"></div><div class="plane-ctrl">${cfg.fixed ? "" : slider("Uzun kenar a", "a", 2, 30, 1, st.a) + slider("Kısa kenar b", "b", 2, 24, 1, st.b)}${slider("Kare kenarı", "s", 1, 15, 1, st.s)}<div class="sf-vals"></div></div>`;
    const calc = () => { const { a, b, s } = st, e = gcd(a, b); return { e, k: (a * b) / e, fits: a % s === 0 && b % s === 0 ? 1 : 0 }; };
    function draw() {
      const { a, b, s } = st, c = calc(), W = 420, H = 300, u = Math.min((W - 60) / a, (H - 40) / b), ox = 10, oy = 10;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${b * u + 40}`, class: "sim-svg", role: "img", "aria-label": `${a} × ${b} dikdörtgen, ${s} kenarlı karelerle` });
      svgEl("rect", { x: ox, y: oy, width: a * u, height: b * u, class: "sf-left" }, svg);
      const nx = Math.floor(a / s), ny = Math.floor(b / s);
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) svgEl("rect", { x: ox + i * s * u, y: oy + j * s * u, width: s * u, height: s * u, class: "sf-sq" }, svg);
      txt(svg, ox + (a * u) / 2, oy + b * u + 22, `a = ${a}`, "sf-lab"); txt(svg, ox + a * u + 4, oy + (b * u) / 2, `b = ${b}`, "sf-lab l");
      el.querySelector(".sf-host").replaceChildren(svg);
      const common = divisors(c.e), mult = (v) => [...Array(Math.min(12, Math.ceil((c.k * 1.5) / v)))].map((_, i) => v * (i + 1));
      el.querySelector(".sf-vals").innerHTML = `<span>${s} kenarlı kare: ${a} % ${s} = ${a % s}, ${b} % ${s} = ${b % s} → ${c.fits ? `<span class="ok">artık kalmadan döşer (${nx * ny} kare)</span>` : `<span class="no">artık kalıyor</span>`}</span>
        <span>Ortak bölenler: </span><ul class="sf-chips">${common.map((d) => `<li class="${d === c.e ? "on" : d === s ? "alt" : ""}">${d}</li>`).join("")}</ul>
        <span>EBOB(${a}, ${b}) = <b class="num">${c.e}</b></span>
        <span>${a} sayısının katları: </span><ul class="sf-chips">${mult(a).map((v) => `<li class="${v % b === 0 ? (v === c.k ? "on" : "alt") : ""}">${v}</li>`).join("")}</ul>
        <span>${b} sayısının katları: </span><ul class="sf-chips">${mult(b).map((v) => `<li class="${v % a === 0 ? (v === c.k ? "on" : "alt") : ""}">${v}</li>`).join("")}</ul>
        <span>EKOK(${a}, ${b}) = <b class="num">${c.k}</b> · <span class="muted">EBOB · EKOK = ${c.e} · ${c.k} = ${c.e * c.k} = a · b</span></span>`;
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => { const c = calc(); return { a: st.a, b: st.b, s: st.s, fits: c.fits, ebob: c.e, ekok: c.k, isEbob: c.fits && st.s === c.e ? 1 : 0 }; };
  });

  // ================= Bölünebilme ve kalan =================
  reg("f-mod", (el, cfg, changed) => {
    const us = cfg.mode === "us";
    const st = us ? { a: cfg.a ?? 2, k: cfg.k ?? 1, m: cfg.m ?? 5 } : { n: cfg.n ?? 23, m: cfg.m ?? 5 };
    el.innerHTML = `<div class="sf-host"></div><div class="plane-ctrl"><p class="eq sf-eq"></p>${us ? slider("Taban a", "a", 2, 9, 1, st.a) + slider("Üs k", "k", 1, cfg.maxK ?? 24, 1, st.k) : slider("Bölünen n", "n", 0, cfg.maxN ?? 60, 1, st.n)}${cfg.fixM ? "" : slider("Bölen m", "m", 2, 12, 1, st.m)}<div class="sf-vals"></div></div>`;
    const powSeq = () => { const s = []; let v = 1; for (let i = 1; i <= Math.max(st.k, 30); i++) { v = (v * st.a) % st.m; s.push(v); } return s; };
    const period = (s) => { const seen = new Map(); for (let i = 0; i < s.length; i++) { if (seen.has(s[i])) return [seen.get(s[i]), i - seen.get(s[i])]; seen.set(s[i], i); } return [0, s.length]; };
    function draw() {
      const host = el.querySelector(".sf-host");
      if (us) {
        const s = powSeq(), [pre, per] = period(s), r = s[st.k - 1], K = st.k, cols = Math.min(12, Math.max(K, 6)), bw = 600 / cols;
        const rows = Math.ceil(K / cols), svg = svgEl("svg", { viewBox: `0 0 600 ${rows * 62 + 6}`, class: "sim-svg", role: "img", "aria-label": "Üslerin kalanları" });
        for (let i = 0; i < K; i++) {
          const x = (i % cols) * bw, y = Math.floor(i / cols) * 62 + 4, inCyc = i >= pre, last = i === K - 1;
          svgEl("rect", { x: x + 3, y, width: bw - 6, height: 54, rx: 6, class: last ? "sf-box on" : "sf-box", style: inCyc && ((i - pre) % per === 0) ? "fill:var(--brand-soft)" : "" }, svg);
          txt(svg, x + bw / 2, y + 18, `${st.a}${sup(i + 1)}`, "sf-small"); txt(svg, x + bw / 2, y + 42, s[i], "sf-lab big");
        }
        host.replaceChildren(svg);
        el.querySelector(".sf-eq").textContent = `${st.a}${sup(K)} ≡ ${r} (mod ${st.m})`;
        el.querySelector(".sf-vals").innerHTML = `<span>Kutularda ${st.a} tabanlı kuvvetlerin ${st.m} ile bölümünden kalanlar var.</span><span>Kalanlar ${pre ? `${pre}. adımdan sonra ` : ""}<b class="num">${per}</b> adımda bir tekrar ediyor (açık renkli kutular döngü başları).</span>`;
      } else {
        const { n, m } = st, q = Math.floor(n / m), r = n % m, cols = q + (r ? 1 : 0), cw = 22, H = m * 20 + 30;
        const W = Math.max(170, cols * cw + 20), svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", style: `max-width:${Math.round(W * 1.6)}px`, role: "img", "aria-label": `${n} nesne, ${m} elemanlı gruplar` });
        for (let i = 0; i < n; i++) { const c = Math.floor(i / m), rr = i % m, left = c >= q; svgEl("circle", { cx: 16 + c * cw, cy: H - 24 - rr * 20, r: 7, class: left ? "sf-dot w" : "sf-dot b" }, svg); }
        for (let c = 0; c < q; c++) svgEl("rect", { x: 16 + c * cw - 10, y: H - 24 - (m - 1) * 20 - 10, width: 20, height: (m - 1) * 20 + 20, rx: 8, fill: "none", class: "sf-ext" }, svg);
        txt(svg, 10, H - 4, `${q} tam grup${r ? `, ${r} artan` : ", artan yok"}`, "sf-lab l");
        host.replaceChildren(svg);
        el.querySelector(".sf-eq").textContent = `${n} = ${m} · ${q} + ${r}`;
        const ds = String(n).split("").map(Number), sum = ds.reduce((a, b) => a + b, 0);
        const hint = { 2: `Son basamak ${n % 10}: ${n % 10} mod 2 = ${n % 2}`, 5: `Son basamak ${n % 10}: ${n % 10} mod 5 = ${n % 5}`, 10: `Son basamak ${n % 10}`, 3: `Rakamlar toplamı ${sum}; ${sum} mod 3 = ${sum % 3}`, 9: `Rakamlar toplamı ${sum}; ${sum} mod 9 = ${sum % 9}`, 4: `Son iki basamak ${n % 100}; ${n % 100} mod 4 = ${n % 100 % 4}` }[m];
        el.querySelector(".sf-vals").innerHTML = `<span>Bölüm <b class="num">${q}</b>, kalan <b class="num">${r}</b> (0 ≤ ${r} < ${m})</span>${r === 0 ? `<span class="ok">${n} sayısı ${m} ile tam bölünür.</span>` : ""}${hint ? `<span class="muted">Kısa yol: ${hint}</span>` : ""}`;
      }
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => { if (us) { const s = powSeq(), [, per] = period(s); return { a: st.a, k: st.k, m: st.m, r: s[st.k - 1], period: per }; } return { n: st.n, m: st.m, q: Math.floor(st.n / st.m), r: st.n % st.m }; };
  });

  // ================= Fonksiyon olma şartı: dikey doğru testi =================
  const CURVES = {
    dogru: { ad: "y = x/2 + 1", fn: 1, draw: () => [sample((x) => x / 2 + 1, -6, 6)], hits: (c) => [c / 2 + 1] },
    parabol: { ad: "y = x² − 3", fn: 1, draw: () => [sample((x) => x * x - 3, -6, 6)], hits: (c) => [c * c - 3] },
    mutlak: { ad: "y = |x| − 2", fn: 1, draw: () => [sample((x) => Math.abs(x) - 2, -6, 6)], hits: (c) => [Math.abs(c) - 2] },
    kubik: { ad: "y = x³/8 − x", fn: 1, draw: () => [sample((x) => x ** 3 / 8 - x, -6, 6)], hits: (c) => [c ** 3 / 8 - c] },
    cember: { ad: "x² + y² = 9", fn: 0, draw: () => [[...Array(361)].map((_, i) => [3 * Math.cos((i * Math.PI) / 180), 3 * Math.sin((i * Math.PI) / 180)])], hits: (c) => (Math.abs(c) > 3 ? [] : Math.abs(c) === 3 ? [0] : [Math.sqrt(9 - c * c), -Math.sqrt(9 - c * c)]) },
    yatik: { ad: "x = y² − 2", fn: 0, draw: () => [sample((y) => y, -6, 6).map(([y]) => [y * y - 2, y])], hits: (c) => (c < -2 ? [] : c === -2 ? [0] : [Math.sqrt(c + 2), -Math.sqrt(c + 2)]) },
    dikey: { ad: "x = 1", fn: 0, draw: () => [[[1, -6], [1, 6]]], hits: (c) => (c === 1 ? "inf" : []) },
  };
  reg("f-dikey", (el, cfg, changed) => {
    const keys = cfg.egriler || ["parabol", "cember", "yatik", "mutlak"];
    let ci = cfg.secili ?? 0;
    const st = { c: cfg.c ?? -4 }, seen = keys.map(() => 0);
    const P = plane({ xr: [-6, 6], yr: [-6, 6], S: 30, pad: 10 });
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl">${seg(keys.map((k, i) => [String(i), CURVES[k].ad]), String(ci))}${slider("Dikey doğru x", "c", -5, 5, 0.5, st.c)}<div class="sf-vals"></div></div></div>`;
    const hitsNow = () => { const h = CURVES[keys[ci]].hits(st.c); return h === "inf" ? { n: 99, ys: [] } : { n: h.filter((y) => Math.abs(y) <= 6).length, ys: h.filter((y) => Math.abs(y) <= 6) }; };
    function draw() {
      const cv = CURVES[keys[ci]], h = hitsNow();
      seen[ci] = Math.max(seen[ci], h.n);
      const svg = svgEl("svg", { viewBox: `0 0 ${P.W} ${P.H}`, class: "sim-svg", role: "img", "aria-label": cv.ad });
      grid(svg, P);
      cv.draw().forEach((pts) => polyline(svg, P, pts, "sf-curve"));
      svgEl("line", { x1: P.X(st.c), y1: P.Y(6), x2: P.X(st.c), y2: P.Y(-6), class: "sf-hline" }, svg);
      h.ys.forEach((y) => svgEl("circle", { cx: P.X(st.c), cy: P.Y(y), r: 7, class: h.n > 1 ? "pl-pt" : "pl-pt hit" }, svg));
      el.querySelector(".sf-host").replaceChildren(svg);
      const verdict = seen[ci] >= 2 ? `<span class="no">Bir dikey doğru eğriyi birden çok noktada kesti: bu eğri y'yi x'in fonksiyonu olarak vermez.</span>` : `<span class="muted">Şu ana kadar hiçbir dikey doğru eğriyi birden çok noktada kesmedi. Doğruyu baştan sona gezdir.</span>`;
      el.querySelector(".sf-vals").innerHTML = `<span>x = ${fmt(st.c, 1)} doğrusu eğriyi <b class="num">${h.n === 99 ? "sonsuz" : h.n}</b> noktada kesiyor.</span>${verdict}`;
      setVals(el, st);
    }
    el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { ci = +b.dataset.s; el.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    bindSliders(el, st, draw, changed); draw();
    return () => ({ c: st.c, hits: hitsNow().n, curve: ci, maxSeen: seen[ci], isFn: CURVES[keys[ci]].fn });
  });

  // ================= Referans fonksiyonlar ve dönüşümleri =================
  const bName = (b) => (b < 1 && Number.isInteger(+(1 / b).toFixed(6)) ? `(1/${Math.round(1 / b)})` : fmt(b, 2));
  reg("f-fonk", (el, cfg, changed) => {
    const fam = cfg.f || "kare", tools = new Set(cfg.tools || []);
    const bases = cfg.bases || [0.25, 0.5, 2, 3, 4, 10];
    const st = { a: cfg.a ?? 1, h: cfg.h ?? 0, k: cfg.k ?? 0, bi: Math.max(0, bases.indexOf(cfg.b ?? 2)), c: cfg.c ?? 2, p: cfg.p ?? 1 };
    let showInv = !!cfg.inverseOn;
    const useB = fam === "ustel" || fam === "log";
    const P = plane({ xr: [-7, 7], yr: [-7, 7], S: 28, pad: 4 });
    const sl = cfg.sliders || ["a", "h", "k"];
    const SL = { a: () => slider("a", "a", -3, 3, 0.5, st.a), h: () => slider("r (yatay öteleme)", "h", -4, 4, 1, st.h), k: () => slider("k (dikey öteleme)", "k", -4, 4, 1, st.k), b: () => `<label class="sim-slider"><span>Taban b: <b class="sf-bv"></b></span><input type="range" min="0" max="${bases.length - 1}" step="1" value="${st.bi}" data-k="bi"></label>`, c: () => slider("Yatay doğru y = c", "c", -6, 6, 0.5, st.c), p: () => slider("Nokta: x", "p", -6, 6, 0.5, st.p) };
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl"><p class="eq sf-eq"></p>${sl.map((k) => SL[k]()).join("")}${tools.has("ters") ? `<button type="button" class="btn btn-small btn-outline sf-inv">Tersini göster</button>` : ""}<div class="sf-vals"></div></div></div>`;
    const B = () => bases[st.bi];
    const base = (x) => { const b = B(); return { dogrusal: x, kare: x * x, kok: x >= 0 ? Math.sqrt(x) : NaN, rasyonel: x === 0 ? NaN : 1 / x, ustel: b ** x, log: x > 0 ? Math.log(x) / Math.log(b) : NaN }[fam]; };
    const g = (x) => { if (cfg.restrict && fam === "kare" && x < st.h) return NaN; return st.a * base(x - st.h) + st.k; };
    function solve(c) { // g(x) = c, kesin çözüm
      const { a, h, k } = st; if (!a) return near(c, k) ? "inf" : [];
      const v = (c - k) / a, b = B();
      const r = { dogrusal: () => [h + v], kare: () => (v < 0 ? [] : v === 0 ? [h] : cfg.restrict ? [h + Math.sqrt(v)] : [h - Math.sqrt(v), h + Math.sqrt(v)]), kok: () => (v < 0 ? [] : [h + v * v]), rasyonel: () => (v === 0 ? [] : [h + 1 / v]), ustel: () => (v <= 0 ? [] : [h + Math.log(v) / Math.log(b)]), log: () => [h + b ** v] }[fam]();
      return r;
    }
    const inner = () => (st.h === 0 ? "x" : st.h > 0 ? `x − ${fmt(st.h)}` : `x + ${fmt(-st.h)}`);
    function formula() {
      const u = inner(), par = st.h === 0 ? "x" : `(${u})`, coef = st.a === 1 ? "" : st.a === -1 ? "−" : `${fmt(st.a)}·`;
      const body = { dogrusal: () => (st.h === 0 ? "x" : `(${u})`), kare: () => `${par}²`, kok: () => `√${st.h === 0 ? "x" : `(${u})`}`, rasyonel: () => `1/${par}`, ustel: () => `${bName(B())}<sup>${u}</sup>`, log: () => `log<sub>${bName(B()).replace(/[()]/g, "")}</sub>(${u})` }[fam]();
      const kk = st.k ? (st.k < 0 ? ` − ${fmt(-st.k)}` : ` + ${fmt(st.k)}`) : "";
      return `${cfg.name || "f"}(x) = ${coef}${body}${kk}`;
    }
    function props() {
      const { a, h, k } = st, b = B(), up = a > 0, I = (s) => `<span>${s}</span>`;
      const hf = fmt(h), kf = fmt(k);
      if (!a) return [I(`<span class="no">a = 0 olamaz: grafik y = ${kf} doğrusuna dönüşür.</span>`)];
      const L = {
        dogrusal: () => [I(`Tanım kümesi ℝ, görüntü kümesi ℝ`), I(up ? "Artan" : "Azalan")],
        kare: () => [I(`Tepe noktası T(${hf}, ${kf})`), I(`Tanım kümesi ${cfg.restrict ? `[${hf}, ∞)` : "ℝ"} · Görüntü kümesi ${up ? `[${kf}, ∞)` : `(−∞, ${kf}]`}`), I(cfg.restrict ? (up ? "Artan" : "Azalan") : up ? `x ≤ ${hf} iken azalan, x ≥ ${hf} iken artan; en küçük değer ${kf}` : `x ≤ ${hf} iken artan, x ≥ ${hf} iken azalan; en büyük değer ${kf}`), I(`Simetri ekseni x = ${hf}`)],
        kok: () => [I(`Başlangıç noktası (${hf}, ${kf})`), I(`Tanım kümesi [${hf}, ∞) · Görüntü kümesi ${up ? `[${kf}, ∞)` : `(−∞, ${kf}]`}`), I(up ? "Artan" : "Azalan")],
        rasyonel: () => [I(`Asimptotlar: x = ${hf} (düşey), y = ${kf} (yatay)`), I(`Tanım kümesi ℝ − {${hf}} · Görüntü kümesi ℝ − {${kf}}`), I(up ? "Her iki parçada da azalan" : "Her iki parçada da artan")],
        ustel: () => [I(`Yatay asimptot y = ${kf}`), I(`Tanım kümesi ℝ · Görüntü kümesi ${up ? `(${kf}, ∞)` : `(−∞, ${kf})`}`), I((b > 1) === up ? "Artan" : "Azalan"), I(`x = ${hf} iken y = ${fmt(a + k)}`)],
        log: () => [I(`Düşey asimptot x = ${hf}`), I(`Tanım kümesi (${hf}, ∞) · Görüntü kümesi ℝ`), I((b > 1) === up ? "Artan" : "Azalan"), I(`x = ${fmt(h + 1)} iken y = ${kf}`)],
      };
      return L[fam]();
    }
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${P.W} ${P.H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "Fonksiyon grafiği" });
      grid(svg, P);
      const xs0 = cfg.restrict && fam === "kare" ? st.h : -7.5;
      const pts = sample(g, xs0, 7.5, 900);
      if (cfg.parent !== false) polyline(svg, P, sample(base, fam === "kok" || fam === "log" ? 0.0001 : -7.5, 7.5, 900), "fg-parent");
      if (tools.has("asimptot") && st.a) {
        if (fam === "rasyonel" || fam === "log") svgEl("line", { x1: P.X(st.h), y1: 0, x2: P.X(st.h), y2: P.H, class: "sf-asy" }, svg);
        if (fam === "rasyonel" || fam === "ustel") svgEl("line", { x1: 0, y1: P.Y(st.k), x2: P.W, y2: P.Y(st.k), class: "sf-asy" }, svg);
      }
      if (showInv) { svgEl("line", { x1: P.X(-7), y1: P.Y(-7), x2: P.X(7), y2: P.Y(7), class: "sf-yx" }, svg); polyline(svg, P, pts.map(([x, y]) => [y, x]), "sf-curve2"); }
      polyline(svg, P, pts, "pl-line fg-curve");
      let sols = [];
      if (tools.has("cizgi")) {
        svgEl("line", { x1: 0, y1: P.Y(st.c), x2: P.W, y2: P.Y(st.c), class: "sf-hline" }, svg);
        // g(x) > c olan x'ler x ekseninde yeşil
        let run = null; const step = 14 / 700;
        for (let i = 0; i <= 700; i++) { const x = -7 + i * step, y = g(x), inn = isFinite(y) && y > st.c; if (inn && run === null) run = x; if ((!inn || i === 700) && run !== null) { svgEl("line", { x1: P.X(run), y1: P.Y(0), x2: P.X(inn ? x : x - step), y2: P.Y(0), class: "sf-shade" }, svg); run = null; } }
        const s = solve(st.c); sols = s === "inf" ? [] : s.filter((x) => isFinite(x));
        sols.forEach((x) => { if (Math.abs(x) <= 7) { svgEl("circle", { cx: P.X(x), cy: P.Y(st.c), r: 7, class: "tg-q" }, svg); svgEl("line", { x1: P.X(x), y1: P.Y(st.c), x2: P.X(x), y2: P.Y(0), class: "ol-guide" }, svg); } });
      }
      if (sl.includes("p")) { const y = g(st.p); if (isFinite(y)) { svgEl("circle", { cx: P.X(st.p), cy: P.Y(y), r: 7, class: "tg-p" }, svg); txt(svg, P.X(st.p) + 10, P.Y(y) - 10, `(${fmt(st.p)}, ${fmt(y)})`, "sf-lab l"); if (showInv) { svgEl("circle", { cx: P.X(y), cy: P.Y(st.p), r: 7, class: "sf-dot g" }, svg); txt(svg, P.X(y) + 10, P.Y(st.p) + 18, `(${fmt(y)}, ${fmt(st.p)})`, "sf-lab l"); } } }
      el.querySelector(".sf-host").replaceChildren(svg);
      el.querySelector(".sf-eq").innerHTML = formula();
      const lines = props();
      if (tools.has("cizgi")) { const s = solve(st.c); lines.push(`<span>${cfg.name || "f"}(x) = ${fmt(st.c)} denkleminin çözümü: <b class="num">${s === "inf" ? "her x" : s.length ? s.map((x) => fmt(x, 3)).join(" ve ") : "yok"}</b></span><span class="muted">Yeşil: ${cfg.name || "f"}(x) > ${fmt(st.c)} olan x değerleri (pencere içinde).</span>`); }
      if (sl.includes("p")) { const y = g(st.p); lines.push(`<span>${cfg.name || "f"}(${fmt(st.p)}) = <b class="num">${isFinite(y) ? fmt(y, 3) : "tanımsız"}</b>${showInv && isFinite(y) ? ` · ${cfg.name || "f"}⁻¹(${fmt(y, 3)}) = ${fmt(st.p)}` : ""}</span>`); }
      if (showInv) lines.push(`<span class="muted">Yeşil eğri: ters fonksiyon, y = x doğrusuna göre yansıma.</span>`);
      el.querySelector(".sf-vals").innerHTML = lines.join("");
      setVals(el, st);
      const bv = el.querySelector(".sf-bv"); if (bv) bv.textContent = bName(B()).replace(/[()]/g, "");
      const ib = el.querySelector(".sf-inv"); if (ib) ib.textContent = showInv ? "Tersini gizle" : "Tersini göster";
    }
    el.querySelector(".sf-inv")?.addEventListener("click", () => { showInv = !showInv; draw(); changed(); });
    bindSliders(el, st, draw, changed); draw();
    return () => { const s = solve(st.c), arr = s === "inf" ? [] : s; const y0 = g(0); return { a: st.a, h: st.h, k: st.k, b: useB ? B() : null, c: st.c, p: st.p, py: isFinite(g(st.p)) ? g(st.p) : null, nsol: s === "inf" ? 99 : arr.length, s0: arr[0] ?? null, s1: arr[1] ?? null, y0: isFinite(y0) ? y0 : null, inv: showInv ? 1 : 0 }; };
  });

  // ================= Trigonometrik fonksiyon grafikleri ve denklemler =================
  reg("f-trig", (el, cfg, changed) => {
    const FN = [["sin", (t) => Math.sin(t)], ["cos", (t) => Math.cos(t)], ["tan", (t) => Math.tan(t)]];
    const allowed = cfg.fns || [0, 1, 2];
    const st = { fi: cfg.fn ?? allowed[0], a: cfg.a ?? 1, b: cfg.b ?? 1, k: cfg.k ?? 0, c: cfg.c ?? 0.5 };
    const sl = cfg.sliders || ["a", "b", "k"], line = !!cfg.line;
    const x0 = cfg.x0 ?? 0, x1 = cfg.x1 ?? 360, W = 460, H = 290, padL = 30, ymax = cfg.ymax ?? 4;
    const X = (d) => padL + ((d - x0) / (x1 - x0)) * (W - padL - 10), Y = (v) => H / 2 - (v / ymax) * (H / 2 - 16);
    const SL = { a: () => slider("a (genlik katsayısı)", "a", -3, 3, 0.5, st.a), b: () => slider("b (x'in katsayısı)", "b", 0.5, 4, 0.5, st.b), k: () => slider("k (dikey öteleme)", "k", -2, 2, 0.5, st.k), c: () => slider("Yatay doğru y = c", "c", -3, 3, 0.1, st.c) };
    el.innerHTML = `<div class="sf-host"></div><div class="plane-ctrl"><p class="eq sf-eq"></p>${allowed.length > 1 ? seg(allowed.map((i) => [String(i), FN[i][0]]), String(st.fi)) : ""}${sl.map((k) => SL[k]()).join("")}<div class="sf-vals"></div></div>`;
    const f = (d) => st.a * FN[st.fi][1]((st.b * d * Math.PI) / 180) + st.k;
    const cR = () => Math.round(st.c * 100) / 100;
    function sols() { // [x0, x1) aralığında a·fn(bx) + k = c
      const { a, b, k } = st, c = cR(); if (!a) return near(c, k) ? "inf" : [];
      const v = (c - k) / a, out = [];
      if (st.fi < 2 && Math.abs(v) > 1 + 1e-12) return [];
      const vv = clamp(v, -1, 1);
      const base = st.fi === 0 ? [Math.asin(vv), Math.PI - Math.asin(vv)] : st.fi === 1 ? [Math.acos(vv), -Math.acos(vv)] : [Math.atan(v)];
      const per = st.fi === 2 ? 180 : 360;
      base.map((r) => (r * 180) / Math.PI).forEach((t) => { for (let n = -20; n <= 20; n++) { const x = (t + per * n) / b; if (x >= x0 - 1e-9 && x < x1 - 1e-9) { const xr = Math.round(x * 1e6) / 1e6; if (!out.some((y) => near(y, xr, 1e-6))) out.push(xr); } } });
      return out.sort((p, q) => p - q);
    }
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": "Trigonometrik fonksiyon grafiği" });
      for (let v = -ymax; v <= ymax; v++) { svgEl("line", { x1: padL, x2: W - 10, y1: Y(v), y2: Y(v), class: v ? "pl-grid" : "pl-axis" }, svg); if (v) txt(svg, padL - 6, Y(v) + 4, v, "pl-num pl-numy"); }
      for (let d = x0; d <= x1; d += 30) { svgEl("line", { x1: X(d), x2: X(d), y1: 6, y2: H - 6, class: d === 0 ? "pl-axis" : "pl-grid", style: d % 90 ? "opacity:.5" : "" }, svg); if (d % 90 === 0) txt(svg, X(d), Y(0) + 16, `${d}°`, "pl-num"); }
      const pts = sample(f, x0, x1, 1440).map(([d, v]) => [d, v]);
      let dd = "", pen = false, prev = null;
      for (const [d, v] of pts) { if (!isFinite(v) || Math.abs(v) > ymax * 3 || (prev !== null && Math.abs(v - prev) > ymax * 2)) { pen = false; prev = isFinite(v) ? v : null; if (Math.abs(v) > ymax * 3) continue; } dd += `${pen ? "L" : "M"}${X(d).toFixed(1)},${Y(clamp(v, -ymax * 3, ymax * 3)).toFixed(1)}`; pen = true; prev = v; }
      const cp = svgEl("clipPath", { id: "sf-trclip" }, svg); svgEl("rect", { x: padL, y: 0, width: W - padL, height: H }, cp);
      svgEl("path", { d: dd, class: "sf-curve", "clip-path": "url(#sf-trclip)" }, svg);
      let s = [];
      if (line) {
        svgEl("line", { x1: padL, x2: W - 10, y1: Y(cR()), y2: Y(cR()), class: "sf-hline" }, svg);
        s = sols(); if (s !== "inf") s.forEach((x) => svgEl("circle", { cx: X(x), cy: Y(cR()), r: 6, class: "tg-q" }, svg));
      }
      el.querySelector(".sf-host").replaceChildren(svg);
      const nm = FN[st.fi][0], bx = st.b === 1 ? "x" : `${fmt(st.b)}x`, co = st.a === 1 ? "" : st.a === -1 ? "−" : `${fmt(st.a)}·`;
      el.querySelector(".sf-eq").textContent = `y = ${co}${nm}(${bx})${st.k ? (st.k < 0 ? ` − ${fmt(-st.k)}` : ` + ${fmt(st.k)}`) : ""}`;
      const per = (st.fi === 2 ? 180 : 360) / st.b, L = [`<span>Esas periyot: <b class="num">${fmt(per, 2)}°</b></span>`];
      if (st.fi < 2) L.push(`<span>En büyük değer ${fmt(Math.abs(st.a) + st.k)} · en küçük değer ${fmt(-Math.abs(st.a) + st.k)}</span>`); else L.push(`<span>tan, x = ${fmt(90 / st.b)}° + k·${fmt(180 / st.b)}° noktalarında tanımsız (düşey asimptot).</span>`);
      if (line) L.push(`<span>${co}${nm}(${bx})${st.k ? (st.k < 0 ? ` − ${fmt(-st.k)}` : ` + ${fmt(st.k)}`) : ""} = ${fmt(cR())} çözümleri [${x0}°, ${x1}°): <b class="num">${s === "inf" ? "her x" : s.length ? s.map((x) => `${fmt(x, 1)}°`).join(", ") : "yok"}</b></span>`);
      el.querySelector(".sf-vals").innerHTML = L.join("");
      setVals(el, st);
    }
    el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { st.fi = +b.dataset.s; el.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    bindSliders(el, st, draw, changed); draw();
    return () => { const s = line ? sols() : []; const arr = s === "inf" ? [] : s; return { fn: st.fi, a: st.a, b: st.b, k: st.k, c: cR(), period: (st.fi === 2 ? 180 : 360) / st.b, nsol: s === "inf" ? 99 : arr.length, s0: arr[0] ?? null, s1: arr[1] ?? null, max: st.fi < 2 ? Math.abs(st.a) + st.k : null, min: st.fi < 2 ? -Math.abs(st.a) + st.k : null }; };
  });

  // ================= İki nokta arası uzaklık ve bölen nokta =================
  reg("f-uzaklik", (el, cfg, changed) => {
    const pts = [[...(cfg.A || [-3, -2])], [...(cfg.B || [3, 2])]];
    const st = { m: cfg.m ?? 1, n: cfg.n ?? 1 };
    const P = plane({ xr: [-6, 6], yr: [-6, 6], S: 30, pad: 10 });
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl">${cfg.bolen ? slider("Oran: |AP|", "m", 1, 5, 1, st.m) + slider("Oran: |PB|", "n", 1, 5, 1, st.n) : ""}<div class="sf-vals"></div><p class="note">A ve B noktalarını sürükle ya da seçip ok tuşlarıyla taşı.</p></div></div>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${P.W} ${P.H}`, class: "sim-svg drag", role: "group", "aria-label": "Koordinat düzlemi" });
    el.querySelector(".sf-host").replaceChildren(svg);
    const calc = () => { const [A, B] = pts, dx = B[0] - A[0], dy = B[1] - A[1], { m, n } = st; return { A, B, dx, dy, d2: dx * dx + dy * dy, d: Math.hypot(dx, dy), px: (n * A[0] + m * B[0]) / (m + n), py: (n * A[1] + m * B[1]) / (m + n) }; };
    function draw() {
      const k = calc(), { A, B } = k;
      svg.replaceChildren(); grid(svg, P);
      svgEl("line", { x1: P.X(A[0]), y1: P.Y(A[1]), x2: P.X(B[0]), y2: P.Y(A[1]), class: "uc-cos" }, svg);
      svgEl("line", { x1: P.X(B[0]), y1: P.Y(A[1]), x2: P.X(B[0]), y2: P.Y(B[1]), class: "uc-sin" }, svg);
      svgEl("line", { x1: P.X(A[0]), y1: P.Y(A[1]), x2: P.X(B[0]), y2: P.Y(B[1]), class: "pl-line" }, svg);
      if (k.dx) txt(svg, P.X((A[0] + B[0]) / 2), P.Y(A[1]) + (B[1] >= A[1] ? 18 : -8), `|Δx| = ${Math.abs(k.dx)}`, "sf-lab");
      if (k.dy) txt(svg, P.X(B[0]) + (B[0] >= A[0] ? 8 : -8), P.Y((A[1] + B[1]) / 2), `|Δy| = ${Math.abs(k.dy)}`, B[0] >= A[0] ? "sf-lab l" : "sf-lab r");
      if (cfg.bolen || cfg.orta) { const px = cfg.bolen ? k.px : (A[0] + B[0]) / 2, py = cfg.bolen ? k.py : (A[1] + B[1]) / 2; svgEl("circle", { cx: P.X(px), cy: P.Y(py), r: 7, class: "tg-q" }, svg); txt(svg, P.X(px) - 10, P.Y(py) - 12, cfg.bolen ? "P" : "M", "sf-lab r"); }
      knob(svg, P, A, 0, "A noktası"); knob(svg, P, B, 1, "B noktası");
      txt(svg, P.X(A[0]) - 12, P.Y(A[1]) + 22, `A(${fmt(A[0])}, ${fmt(A[1])})`, "sf-lab r"); txt(svg, P.X(B[0]) + 12, P.Y(B[1]) - 14, `B(${fmt(B[0])}, ${fmt(B[1])})`, "sf-lab l");
      const rad = radical(k.d2);
      const L = [`<span>|AB| = √(${Math.abs(k.dx)}² + ${Math.abs(k.dy)}²) = √${k.d2}${rad && rad !== `√${k.d2}` ? ` = ${rad}` : ""} ≈ <b class="num">${fmt(k.d, 3)}</b></span>`];
      if (cfg.orta) L.push(`<span>Orta nokta M((${fmt(A[0])} + ${par(B[0])})/2, (${fmt(A[1])} + ${par(B[1])})/2) = <b class="num">M(${fmt((A[0] + B[0]) / 2)}, ${fmt((A[1] + B[1]) / 2)})</b></span>`);
      if (cfg.bolen) L.push(`<span>|AP| : |PB| = ${st.m} : ${st.n}</span><span>P = ((${st.n}·${par(A[0])} + ${st.m}·${par(B[0])}) / ${st.m + st.n}, (${st.n}·${par(A[1])} + ${st.m}·${par(B[1])}) / ${st.m + st.n}) = <b class="num">P(${fmt(k.px)}, ${fmt(k.py)})</b></span>`);
      el.querySelector(".sf-vals").innerHTML = L.join("");
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed);
    dragPoints(svg, P, pts, { step: 1, lock: cfg.lock }, () => { draw(); changed(); });
    draw();
    return () => { const k = calc(); return { ax: k.A[0], ay: k.A[1], bx: k.B[0], by: k.B[1], dx: k.dx, dy: k.dy, d2: k.d2, d: k.d, px: k.px, py: k.py, m: st.m, n: st.n, mx: (k.A[0] + k.B[0]) / 2, my: (k.A[1] + k.B[1]) / 2 }; };
  });

  // ================= İki doğru: paralellik, diklik, kesişim =================
  reg("f-dogrular", (el, cfg, changed) => {
    const st = { m1: cfg.m1 ?? 1, n1: cfg.n1 ?? 1, m2: cfg.m2 ?? -1, n2: cfg.n2 ?? 3 };
    const P = plane({ xr: [-7, 7], yr: [-7, 7], S: 28, pad: 4 });
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl"><p class="eq sf-eq"></p>
      ${slider("m₁ (1. doğrunun eğimi)", "m1", -4, 4, 0.5, st.m1)}${slider("n₁", "n1", -5, 5, 1, st.n1)}${slider("m₂ (2. doğrunun eğimi)", "m2", -4, 4, 0.5, st.m2)}${slider("n₂", "n2", -5, 5, 1, st.n2)}<div class="sf-vals"></div></div></div>`;
    const calc = () => { const { m1, n1, m2, n2 } = st, par = m1 === m2, ix = par ? null : (n2 - n1) / (m1 - m2); return { par: par && n1 !== n2 ? 1 : 0, cak: par && n1 === n2 ? 1 : 0, perp: near(m1 * m2, -1) ? 1 : 0, ix, iy: ix === null ? null : m1 * ix + n1 }; };
    const eq = (m, n) => `y = ${m === 0 ? "" : m === 1 ? "x" : m === -1 ? "−x" : `${fmt(m)}x`}${m === 0 ? fmt(n) : n ? (n < 0 ? ` − ${fmt(-n)}` : ` + ${fmt(n)}`) : ""}`;
    function draw() {
      const k = calc(), { m1, n1, m2, n2 } = st;
      const svg = svgEl("svg", { viewBox: `0 0 ${P.W} ${P.H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "İki doğru" });
      grid(svg, P);
      svgEl("line", { x1: P.X(-8), y1: P.Y(m1 * -8 + n1), x2: P.X(8), y2: P.Y(m1 * 8 + n1), class: "pl-line" }, svg);
      svgEl("line", { x1: P.X(-8), y1: P.Y(m2 * -8 + n2), x2: P.X(8), y2: P.Y(m2 * 8 + n2), class: "sf-curve2", style: "stroke-width:4" }, svg);
      svgEl("polyline", { points: `${P.X(0)},${P.Y(n1)} ${P.X(1)},${P.Y(n1)} ${P.X(1)},${P.Y(n1 + m1)}`, class: "sf-ext", style: "stroke:var(--brand);stroke-width:2" }, svg);
      if (k.ix !== null && Math.abs(k.ix) <= 7 && Math.abs(k.iy) <= 7) { svgEl("circle", { cx: P.X(k.ix), cy: P.Y(k.iy), r: 7, class: "tg-q" }, svg); txt(svg, P.X(k.ix) + 10, P.Y(k.iy) - 10, `(${fmt(k.ix)}, ${fmt(k.iy)})`, "sf-lab l"); }
      el.querySelector(".sf-host").replaceChildren(svg);
      el.querySelector(".sf-eq").innerHTML = `<span style="color:var(--brand)">${eq(m1, n1)}</span><br><span style="color:var(--good)">${eq(m2, n2)}</span>`;
      const L = [];
      if (k.cak) L.push(`<span class="ok">Doğrular çakışık (aynı doğru).</span>`);
      else if (k.par) L.push(`<span class="ok">Paralel: eğimler eşit (m₁ = m₂ = ${fmt(m1)}), kesişmezler.</span>`);
      else L.push(`<span>Kesişim noktası: <b class="num">(${fmt(k.ix, 3)}, ${fmt(k.iy, 3)})</b></span>`);
      L.push(`<span>m₁ · m₂ = ${fmt(m1 * m2, 3)}${k.perp ? ` <span class="ok">→ doğrular dik</span>` : ""}</span>`);
      L.push(`<span class="muted">Kesikli üçgen: 1. doğruda x 1 artınca y ${fmt(m1)} değişir.</span>`);
      el.querySelector(".sf-vals").innerHTML = L.join("");
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => ({ ...st, ...calc() });
  });

  // ================= Sayma: çarpma ilkesi, permütasyon, kombinasyon =================
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  reg("f-sayma", (el, cfg, changed) => {
    if (cfg.mode === "secim") {
      const st = { n: cfg.n ?? 5, r: cfg.r ?? 2 };
      let ord = cfg.sirali ?? 1;
      el.innerHTML = `${cfg.fixOrder ? "" : seg([["1", "Sıra önemli (permütasyon)"], ["0", "Sıra önemsiz (kombinasyon)"]], String(ord))}${slider("Eleman sayısı n", "n", 1, 10, 1, st.n)}${slider("Seçilen r", "r", 0, 10, 1, st.r)}<div class="sf-host"></div><div class="sf-vals"></div>`;
      const val = () => (st.r > st.n ? 0 : ord ? fact(st.n) / fact(st.n - st.r) : fact(st.n) / (fact(st.r) * fact(st.n - st.r)));
      function list() {
        const L = "ABCDEFGHIJ".slice(0, st.n).split(""), out = [];
        const rec = (cur, rest) => { if (out.length > 60) return; if (cur.length === st.r) { out.push(cur.join("")); return; } rest.forEach((x, i) => rec([...cur, x], ord ? rest.filter((_, j) => j !== i) : rest.slice(i + 1))); };
        rec([], L); return out;
      }
      function draw() {
        if (st.r > st.n) st.r = st.n;
        el.querySelector("input[data-k=r]").max = st.n; el.querySelector("input[data-k=r]").value = st.r;
        const v = val(), n = st.n, r = st.r, svg = svgEl("svg", { viewBox: `0 0 600 90`, class: "sim-svg", role: "img", "aria-label": "Seçim kutuları" });
        for (let i = 0; i < Math.max(r, 1); i++) { if (!r) break; const x = 10 + i * 58; svgEl("rect", { x, y: 10, width: 48, height: 48, rx: 6, class: "sf-box on" }, svg); txt(svg, x + 24, 42, n - i, "sf-lab big"); txt(svg, x + 24, 78, `${i + 1}. seçim`, "sf-small"); if (i < r - 1) txt(svg, x + 53, 40, "·", "sf-lab"); }
        if (!r) txt(svg, 300, 45, "Hiç eleman seçmemenin 1 yolu var.", "sf-lab");
        el.querySelector(".sf-host").replaceChildren(svg);
        const prod = [...Array(r)].map((_, i) => n - i).join(" · ") || "1";
        const ls = v <= 60 ? list() : [];
        el.querySelector(".sf-vals").innerHTML = ord
          ? `<p class="slope">P(${n}, ${r}) = ${prod} = <b class="num">${v}</b> <span class="muted">= ${n}! / ${n - r}!</span></p>`
          : `<p class="slope">C(${n}, ${r}) = (${prod}) / ${r}! = ${r ? fact(n) / fact(n - r) : 1} / ${fact(r)} = <b class="num">${v}</b></p><p class="note">Her seçim ${r}! = ${fact(r)} farklı sırada yazılabildiği için sıralı sayıyı ${r}! ile bölüyoruz.</p>`;
        if (ls.length) el.querySelector(".sf-vals").innerHTML += `<ul class="sf-chips">${ls.map((s) => `<li>${s || "∅"}</li>`).join("")}</ul>`;
        setVals(el, st);
      }
      el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { ord = +b.dataset.s; el.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
      bindSliders(el, st, draw, changed); draw();
      return () => ({ n: st.n, r: st.r, sirali: ord, value: val() });
    }
    const stages = (cfg.stages || [{ ad: "Tişört", n: 3 }, { ad: "Pantolon", n: 2 }]).map((s) => ({ ...s }));
    const st = Object.fromEntries(stages.map((s, i) => [`s${i}`, s.n]));
    el.innerHTML = `${stages.map((s, i) => slider(s.ad, `s${i}`, 1, s.max ?? 5, 1, s.n)).join("")}<div class="sf-host"></div><p class="slope sf-vals"></p>`;
    const total = () => stages.reduce((p, _, i) => p * st[`s${i}`], 1);
    function draw() {
      const T = total(), lv = stages.length, W = 600, H = 60 + lv * 70, svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": "Ağaç şeması" });
      txt(svg, W / 2, 18, "Başla", "sf-small"); svgEl("circle", { cx: W / 2, cy: 28, r: 5, class: "sf-dot" }, svg);
      if (T <= 64) {
        let prevX = [W / 2], prevY = 28;
        const cols = ["b", "g", "w", ""];
        stages.forEach((s, d) => {
          const k = st[`s${d}`], cnt = prevX.length * k, y = 28 + (d + 1) * 70, xs = [];
          const span = (W - 30) / cnt;
          prevX.forEach((px, pi) => { for (let j = 0; j < k; j++) { const idx = pi * k + j, x = 15 + span * (idx + 0.5); svgEl("line", { x1: px, y1: prevY, x2: x, y2: y, class: "pl-grid", style: "stroke:var(--muted);opacity:.6" }, svg); xs.push(x); } });
          xs.forEach((x, idx) => { svgEl("circle", { cx: x, cy: y, r: cnt > 32 ? 3.5 : 5, class: `sf-dot ${cols[d % 4]}` }, svg); if (cnt <= 16) txt(svg, x, y + 18, `${s.ad[0]}${(idx % k) + 1}`, "sf-small"); });
          txt(svg, 4, y - 10, s.ad, "sf-small", { style: "text-anchor:start" });
          prevX = xs; prevY = y;
        });
      } else txt(svg, W / 2, H / 2, `${T} dal: çizmek için çok fazla! Çarpma ilkesi yeter.`, "sf-lab");
      el.querySelector(".sf-host").replaceChildren(svg);
      el.querySelector(".sf-vals").innerHTML = `Toplam seçenek = ${stages.map((_, i) => st[`s${i}`]).join(" · ")} = <b class="num">${T}</b>`;
      setVals(el, st);
    }
    bindSliders(el, st, draw, changed); draw();
    return () => ({ total: total(), ...st });
  });

  // ================= Algoritma izleyici =================
  const ALG = {
    oklid: {
      inputs: [["a", "a", 2, 120, 84], ["b", "b", 1, 120, 36]],
      code: ["Başla: a ve b'yi al", "b ≠ 0 olduğu sürece tekrarla:", "    k ← a mod b", "    a ← b", "    b ← k", "Yaz: EBOB = a", "Bitir"],
      run({ a, b }) { const t = [{ line: 0, vars: { a, b } }]; let g = 0; while (g++ < 60) { t.push({ line: 1, vars: { a, b } }); if (b === 0) break; const k = a % b; t.push({ line: 2, vars: { a, b, k } }); a = b; t.push({ line: 3, vars: { a, b, k } }); b = k; t.push({ line: 4, vars: { a, b, k } }); } t.push({ line: 5, vars: { a, b }, out: `EBOB = ${a}` }); t.push({ line: 6, vars: { a, b }, out: `EBOB = ${a}` }); return { t, result: a }; },
    },
    bileske: {
      inputs: [["x", "x", -5, 5, 2]],
      code: ["Başla: x'i al", "y ← 3·x − 5        (f adımı)", "z ← y²             (g adımı)", "Yaz: z", "Bitir"],
      run({ x }) { const y = 3 * x - 5, z = y * y; return { t: [{ line: 0, vars: { x } }, { line: 1, vars: { x, y } }, { line: 2, vars: { x, y, z } }, { line: 3, vars: { x, y, z }, out: String(z) }, { line: 4, vars: { x, y, z }, out: String(z) }], result: z }; },
    },
    toplam: {
      inputs: [["n", "n", 1, 10, 4]],
      code: ["Başla: n'yi al", "T ← 0", "i ← 1", "i ≤ n olduğu sürece tekrarla:", "    T ← T + i", "    i ← i + 1", "Yaz: T", "Bitir"],
      run({ n }) { const t = [{ line: 0, vars: { n } }]; let T = 0, i = 1; t.push({ line: 1, vars: { n, T } }); t.push({ line: 2, vars: { n, T, i } }); while (true) { t.push({ line: 3, vars: { n, T, i } }); if (i > n) break; T += i; t.push({ line: 4, vars: { n, T, i } }); i++; t.push({ line: 5, vars: { n, T, i } }); } t.push({ line: 6, vars: { n, T, i }, out: String(T) }); t.push({ line: 7, vars: { n, T, i }, out: String(T) }); return { t, result: T }; },
    },
    parcali: {
      inputs: [["x", "x", -6, 6, -3]],
      code: ["Başla: x'i al", "Eğer x < 0 ise:", "    y ← −x", "Değilse:", "    y ← x", "Yaz: y", "Bitir"],
      run({ x }) { const t = [{ line: 0, vars: { x } }, { line: 1, vars: { x } }]; let y; if (x < 0) { y = -x; t.push({ line: 2, vars: { x, y } }); } else { t.push({ line: 3, vars: { x } }); y = x; t.push({ line: 4, vars: { x, y } }); } t.push({ line: 5, vars: { x, y }, out: String(y) }); t.push({ line: 6, vars: { x, y }, out: String(y) }); return { t, result: y }; },
    },
  };
  reg("f-akis", (el, cfg, changed) => {
    const A = ALG[cfg.alg || "oklid"], st = Object.fromEntries(A.inputs.map(([k, , , , v]) => [k, cfg[k] ?? v]));
    let i = 0, run = A.run(st), out = "";
    el.classList.add("sf-akis");
    el.innerHTML = `${A.inputs.map(([k, l, mn, mx]) => slider(`Girdi ${l}`, k, mn, mx, 1, st[k])).join("")}<div class="tr"><pre class="tr-code">${A.code.map((l, k) => `<span class="tr-line" data-l="${k}"><i>${k + 1}</i>${l}</span>`).join("")}</pre>
      <div class="tr-side"><div class="tr-box"><h4>Değişkenler</h4><div class="tr-vars"></div></div><div class="tr-box"><h4>Çıktı</h4><pre class="tr-out"></pre></div></div>
      <div class="tr-ctrl"><button type="button" class="btn btn-outline btn-small" data-t="-1">Önceki</button><button type="button" class="btn btn-primary btn-small" data-t="1">Sonraki adım</button><button type="button" class="btn btn-outline btn-small" data-t="end">Sona git</button><button type="button" class="btn btn-outline btn-small" data-t="0">Baştan</button><span class="tr-pos num"></span></div></div>`;
    function draw() {
      const s = run.t[i], last = run.t.length - 1;
      el.querySelectorAll(".tr-line").forEach((n) => n.classList.toggle("cur", +n.dataset.l === s.line));
      el.querySelector(".tr-vars").innerHTML = Object.entries(s.vars).map(([k, v]) => `<div class="tr-var"><code>${k}</code><b>${typeof v === "number" ? fmt(v) : v}</b></div>`).join("");
      out = (s.out || "").replace(/-/g, "−"); el.querySelector(".tr-out").textContent = out || " ";
      el.querySelector(".tr-pos").textContent = `Adım ${i + 1} / ${last + 1}`;
      el.querySelector('[data-t="1"]').disabled = i === last; el.querySelector('[data-t="end"]').disabled = i === last; el.querySelector('[data-t="-1"]').disabled = i === 0;
      setVals(el, st);
    }
    el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { const t = b.dataset.t, last = run.t.length - 1; i = t === "0" ? 0 : t === "end" ? last : clamp(i + +t, 0, last); draw(); changed(); }));
    el.querySelectorAll("input[data-k]").forEach((inp) => inp.addEventListener("input", () => { st[inp.dataset.k] = +inp.value; run = A.run(st); i = 0; draw(); changed(); }));
    draw();
    return () => ({ step: i, steps: run.t.length, done: i === run.t.length - 1 ? 1 : 0, result: run.result, ...st });
  });

  // ================= Fonksiyon önayarları (bileşke, dört işlem) =================
  const PRE = {
    "2x+1": [(x) => 2 * x + 1, "2x + 1"], "x2": [(x) => x * x, "x²"], "x-3": [(x) => x - 3, "x − 3"], "3x": [(x) => 3 * x, "3x"], "x+2": [(x) => x + 2, "x + 2"],
    "x2-1": [(x) => x * x - 1, "x² − 1"], "x+1": [(x) => x + 1, "x + 1"], "x-1": [(x) => x - 1, "x − 1"], "kok": [(x) => (x >= 0 ? Math.sqrt(x) : NaN), "√x"], "2x": [(x) => 2 * x, "2x"], "x/2": [(x) => x / 2, "x/2"], "4-x": [(x) => 4 - x, "4 − x"], "1/x": [(x) => (x === 0 ? NaN : 1 / x), "1/x"], "abs": [(x) => Math.abs(x), "|x|"],
  };
  reg("f-bileske", (el, cfg, changed) => {
    const F = PRE[cfg.f || "2x+1"], G = PRE[cfg.g || "x2"];
    const st = { x: cfg.x ?? 1 };
    let ord = cfg.order === "fog" ? 1 : 0;
    el.innerHTML = `${cfg.fixOrder ? "" : seg([["0", "(g∘f)(x) = g(f(x))"], ["1", "(f∘g)(x) = f(g(x))"]], String(ord))}${slider("Girdi x", "x", cfg.min ?? -4, cfg.max ?? 4, 1, st.x)}<div class="sf-host"></div><div class="sf-vals"></div>`;
    const vals = () => { const x = st.x, fx = F[0](x), gx = G[0](x), gof = isFinite(fx) ? G[0](fx) : NaN, fog = isFinite(gx) ? F[0](gx) : NaN; return { x, fx, gx, gof, fog }; };
    function draw() {
      const v = vals(), first = ord ? ["g", G, v.gx] : ["f", F, v.fx], second = ord ? ["f", F, ord ? v.fog : v.gof] : ["g", G, v.gof];
      const W = 600, H = 150, svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": "Fonksiyon makineleri" });
      const defs = svgEl("defs", {}, svg), mk = svgEl("marker", { id: "sf-ah", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, defs); svgEl("path", { d: "M0,0 L10,5 L0,10 Z", class: "sf-ahead" }, mk);
      const box = (x, label, val) => { svgEl("rect", { x, y: 45, width: 76, height: 50, rx: 8, class: "sf-box on" }, svg); txt(svg, x + 38, 77, val, "sf-lab big"); txt(svg, x + 38, 32, label, "sf-small"); };
      const mach = (x, nm, fx) => { svgEl("rect", { x, y: 40, width: 110, height: 60, rx: 10, class: "sf-mach" }, svg); txt(svg, x + 55, 66, nm, "sf-mach-t"); txt(svg, x + 55, 88, fx[1], "sf-mach-t", { style: "font-size:13px" }); };
      const show = (y) => (isFinite(y) ? fmt(y, 3) : "tanımsız");
      box(4, "girdi", fmt(st.x)); svgEl("line", { x1: 82, y1: 70, x2: 112, y2: 70, class: "sf-arrow" }, svg);
      mach(114, first[0], first[1]); svgEl("line", { x1: 226, y1: 70, x2: 256, y2: 70, class: "sf-arrow" }, svg);
      box(258, `${first[0]}(${fmt(st.x)})`, show(first[2])); svgEl("line", { x1: 336, y1: 70, x2: 366, y2: 70, class: "sf-arrow" }, svg);
      mach(368, second[0], second[1]); svgEl("line", { x1: 480, y1: 70, x2: 510, y2: 70, class: "sf-arrow" }, svg);
      box(512, "çıktı", show(second[2]));
      el.querySelector(".sf-host").replaceChildren(svg);
      el.querySelector(".sf-vals").innerHTML = `<p class="slope">f(x) = ${F[1]}, g(x) = ${G[1]}</p><p class="slope">(g∘f)(${fmt(st.x)}) = g(${show(v.fx)}) = <b class="num">${show(v.gof)}</b> · (f∘g)(${fmt(st.x)}) = f(${show(v.gx)}) = <b class="num">${show(v.fog)}</b></p>${cfg.gofText ? `<p class="note">(g∘f)(x) = ${cfg.gofText} · (f∘g)(x) = ${cfg.fogText}</p>` : ""}`;
      setVals(el, st);
    }
    el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { ord = +b.dataset.s; el.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    bindSliders(el, st, draw, changed); draw();
    return () => { const v = vals(), n = (y) => (isFinite(y) ? y : null); return { x: v.x, order: ord, fx: n(v.fx), gx: n(v.gx), gof: n(v.gof), fog: n(v.fog), out: n(ord ? v.fog : v.gof), same: isFinite(v.gof) && isFinite(v.fog) && near(v.gof, v.fog) ? 1 : 0 }; };
  });

  reg("f-islem", (el, cfg, changed) => {
    const F = PRE[cfg.f || "x+1"], G = PRE[cfg.g || "x-1"], OPS = [["+", (a, b) => a + b, "f + g"], ["−", (a, b) => a - b, "f − g"], ["·", (a, b) => a * b, "f · g"], ["/", (a, b) => (b === 0 ? NaN : a / b), "f / g"]];
    const st = { x: cfg.x ?? 2 };
    let op = cfg.op ?? 0;
    const P = plane({ xr: [-6, 6], yr: [-6, 6], S: 30, pad: 10 });
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl">${seg(OPS.map((o, i) => [String(i), o[2]]), String(op))}${slider("x", "x", -5, 5, 0.5, st.x)}<div class="sf-vals"></div></div></div>`;
    const h = (x) => OPS[op][1](F[0](x), G[0](x));
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${P.W} ${P.H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "f, g ve işlem sonucu" });
      grid(svg, P);
      polyline(svg, P, sample(F[0], -6.5, 6.5, 600), "sf-curve3"); polyline(svg, P, sample(G[0], -6.5, 6.5, 600), "sf-curve2");
      polyline(svg, P, sample(h, -6.5, 6.5, 1200), "pl-line fg-curve");
      const x = st.x, fx = F[0](x), gx = G[0](x), v = h(x);
      [[fx, "w"], [gx, "g"], [v, "b"]].forEach(([y, c]) => { if (isFinite(y) && Math.abs(y) <= 6) svgEl("circle", { cx: P.X(x), cy: P.Y(y), r: 6, class: `sf-dot ${c}` }, svg); });
      svgEl("line", { x1: P.X(x), y1: 0, x2: P.X(x), y2: P.H, class: "ol-guide" }, svg);
      el.querySelector(".sf-host").replaceChildren(svg);
      const show = (y) => (isFinite(y) ? fmt(y, 3) : "tanımsız");
      el.querySelector(".sf-vals").innerHTML = `<span><span style="color:var(--warn)">f(x) = ${F[1]}</span> · <span style="color:var(--good)">g(x) = ${G[1]}</span></span>
        <span>(${OPS[op][2]})(x) = ${cfg.texts?.[op] ?? `${F[1]} ${OPS[op][0]} ${G[1]}`}</span>
        <span>x = ${fmt(x)}: f = ${show(fx)}, g = ${show(gx)} → (${OPS[op][2]})(${fmt(x)}) = <b class="num">${show(v)}</b></span>
        ${op === 3 ? `<span class="muted">f / g, g(x) = 0 olan x değerlerinde tanımsızdır.</span>` : ""}`;
      setVals(el, st);
    }
    el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { op = +b.dataset.s; el.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    bindSliders(el, st, draw, changed); draw();
    return () => { const v = h(st.x); return { x: st.x, op, fx: F[0](st.x), gx: G[0](st.x), val: isFinite(v) ? v : null, undef: isFinite(v) ? 0 : 1 }; };
  });

  // ================= Çokgen: dışbükey/içbükey, açılar, dörtgen sınıfları =================
  reg("f-cokgen", (el, cfg, changed) => {
    const pts = (cfg.points || [[1, 1], [6, 1], [7, 5], [2, 5]]).map((p) => [...p]);
    const P = plane({ xr: [0, 10], yr: [0, 7], S: 40, pad: 22 });
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl"><div class="sf-vals"></div>${cfg.edit ? `<div class="bb-ex"><button type="button" class="btn btn-small btn-outline" data-a="add">Köşe ekle</button><button type="button" class="btn btn-small btn-outline" data-a="del">Köşe sil</button></div>` : ""}<p class="note">Köşeleri sürükle ya da seçip ok tuşlarıyla taşı.</p></div></div>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${P.W} ${P.H}`, class: "sim-svg drag", role: "group", "aria-label": "Çokgen" });
    el.querySelector(".sf-host").replaceChildren(svg);
    const segX = (p1, p2, p3, p4) => { const d1 = cross(sub(p2, p1), sub(p3, p1)), d2 = cross(sub(p2, p1), sub(p4, p1)), d3 = cross(sub(p4, p3), sub(p1, p3)), d4 = cross(sub(p4, p3), sub(p2, p3)); if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true; const on = (a, b, c) => Math.min(a[0], b[0]) <= c[0] && c[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= c[1] && c[1] <= Math.max(a[1], b[1]); return (d1 === 0 && on(p1, p2, p3)) || (d2 === 0 && on(p1, p2, p4)) || (d3 === 0 && on(p3, p4, p1)) || (d4 === 0 && on(p3, p4, p2)); };
    const inside = (q) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > q[1]) !== (yj > q[1]) && q[0] < ((xj - xi) * (q[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
    const calc = () => {
      const n = pts.length, s2 = pts.reduce((s, [x1, y1], i) => { const [x2, y2] = pts[(i + 1) % n]; return s + x1 * y2 - x2 * y1; }, 0), or = Math.sign(s2) || 1;
      let simple = true;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if (j === i + 1 || (i === 0 && j === n - 1)) continue; if (segX(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) simple = false; }
      const ang = pts.map((p, i) => { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], e1 = sub(p, a), e2 = sub(b, p); const t = (Math.atan2(cross(e1, e2), dot(e1, e2)) * 180) / Math.PI; return 180 - t * or; });
      const reflex = ang.filter((x) => x > 180 + 1e-6).length, flat = ang.filter((x) => Math.abs(x - 180) < 1e-6).length;
      const convex = simple && reflex === 0 && flat === 0 ? 1 : 0;
      const o = { n, area: Math.abs(s2) / 2, simple: simple ? 1 : 0, convex, reflex, angleSum: Math.round(ang.reduce((a, b) => a + b, 0)), ang, kosegen: (n * (n - 3)) / 2 };
      if (n === 4) {
        const [A, B, C, D] = pts, e = [sub(B, A), sub(C, B), sub(D, C), sub(A, D)], L2 = e.map((v) => dot(v, v));
        const p1 = cross(e[0], e[2]) === 0, p2 = cross(e[1], e[3]) === 0, pp = (p1 ? 1 : 0) + (p2 ? 1 : 0);
        const dik = e.filter((v, i) => dot(v, e[(i + 1) % 4]) === 0).length, eq4 = L2.every((v) => v === L2[0]);
        const d1 = sub(C, A), d2 = sub(D, B);
        const ok = simple && !flat;
        o.pp = ok ? pp : 0; o.dik = ok ? dik : 0;
        o.paralelkenar = ok && pp === 2 ? 1 : 0; o.dikdortgen = o.paralelkenar && dik === 4 ? 1 : 0; o.eskenar = ok && eq4 ? 1 : 0; o.kare = o.dikdortgen && o.eskenar ? 1 : 0;
        o.yamuk = ok && pp >= 1 ? 1 : 0; o.deltoid = ok && convex && ((L2[0] === L2[1] && L2[2] === L2[3]) || (L2[1] === L2[2] && L2[3] === L2[0])) ? 1 : 0;
        o.kdik = dot(d1, d2) === 0 ? 1 : 0; o.kesit = dot(d1, d1) === dot(d2, d2) ? 1 : 0; o.kortalar = near((A[0] + C[0]) / 2, (B[0] + D[0]) / 2) && near((A[1] + C[1]) / 2, (B[1] + D[1]) / 2) ? 1 : 0;
      }
      return o;
    };
    function draw() {
      const k = calc(), n = pts.length;
      svg.replaceChildren(); grid(svg, P, { labels: false, axes: false });
      svgEl("polygon", { points: pts.map(([x, y]) => `${P.X(x)},${P.Y(y)}`).join(" "), class: k.simple ? "sf-poly" : "sf-poly bad" }, svg);
      if (cfg.diag !== false && k.simple) for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; const m = mid(pts[i], pts[j]); let cut = false; for (let e = 0; e < n; e++) { const a = pts[e], b = pts[(e + 1) % n]; if ([i, j].includes(e) || [i, j].includes((e + 1) % n)) continue; if (segX(pts[i], pts[j], a, b)) cut = true; } const good = inside(m) && !cut; svgEl("line", { x1: P.X(pts[i][0]), y1: P.Y(pts[i][1]), x2: P.X(pts[j][0]), y2: P.Y(pts[j][1]), class: good ? "sf-diag" : "sf-diag out" }, svg); }
      const c = [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n];
      pts.forEach((p, i) => {
        const v = sub(p, c), L = Math.hypot(...v) || 1;
        txt(svg, P.X(p[0] + (v[0] / L) * 0.55), P.Y(p[1] + (v[1] / L) * 0.55) + 6, "ABCDEFGH"[i], "sf-lab big");
        if (cfg.angles !== false && k.simple) txt(svg, P.X(p[0] - (v[0] / L) * 0.7), P.Y(p[1] - (v[1] / L) * 0.7) + 4, `${fmt(k.ang[i], 0)}°`, k.ang[i] > 180 ? "sf-lab bad" : "sf-small");
        knob(svg, P, p, i, `${"ABCDEFGH"[i]} köşesi`);
      });
      const L = [];
      if (!k.simple) L.push(`<span class="no">Kenarlar kesişiyor: bu bir çokgen değil (basit kapalı eğri değil).</span>`);
      else {
        L.push(`<span>${n} kenarlı · ${k.convex ? `<span class="ok">dışbükey</span>` : `<span class="no">${k.reflex ? `içbükey (${k.reflex} iç açı 180°'den büyük)` : "bir köşe düz açı: köşe sayılmaz"}</span>`}</span>`);
        L.push(`<span>İç açılar toplamı: <b class="num">${k.angleSum}°</b> = (${n} − 2) · 180°</span>`);
        L.push(`<span>Alan: <b class="num">${fmt(k.area, 1)}</b> birimkare</span>`);
        if (cfg.diag !== false) L.push(`<span class="muted">Köşegen sayısı ${n}(${n} − 3)/2 = ${k.kosegen}${k.convex ? "; hepsi çokgenin içinde" : "; kırmızı köşegenler dışarı taşıyor"}.</span>`);
        if (n === 4 && cfg.classify !== false) {
          const T = [["kare", "Kare"], ["dikdortgen", "Dikdörtgen"], ["eskenar", "Eşkenar dörtgen"], ["paralelkenar", "Paralelkenar"], ["yamuk", "Yamuk"], ["deltoid", "Deltoid"]];
          L.push(`<span>${T.map(([key, nm]) => `<span class="sf-tag ${k[key] ? "on" : ""}">${nm}</span>`).join("")}</span>`);
          L.push(`<span class="muted">Paralel kenar çifti: ${k.pp} · dik açı: ${k.dik} · köşegenler ${k.kdik ? "dik" : "dik değil"}, ${k.kesit ? "eşit" : "eşit değil"}, ${k.kortalar ? "birbirini ortalar" : "birbirini ortalamaz"}</span>`);
        }
      }
      el.querySelector(".sf-vals").innerHTML = L.join("");
    }
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.a === "add" && pts.length < 8) { const a = pts[pts.length - 1], z = pts[0]; const cand = [[Math.round((a[0] + z[0]) / 2), Math.round((a[1] + z[1]) / 2)], [0, 0], [10, 0], [0, 7], [10, 7], [5, 0], [5, 7]]; const q = cand.find((q) => !pts.some((p) => p[0] === q[0] && p[1] === q[1])); if (q) pts.push(q); }
      if (b.dataset.a === "del" && pts.length > 3) pts.pop();
      draw(); changed();
    }));
    dragPoints(svg, P, pts, { step: 1 }, () => { draw(); changed(); });
    draw();
    return () => { const { ang, ...o } = calc(); return o; };
  });

  // ================= Düzgün çokgen =================
  reg("f-duzgun", (el, cfg, changed) => {
    const st = { n: cfg.n ?? 5 };
    const on = new Set(cfg.show || ["ucgen"]);
    const NAMES = { ucgen: "Üçgenlere böl", kosegen: "Tüm köşegenler", simetri: "Simetri eksenleri", dis: "Dış açılar" };
    el.innerHTML = `<div class="plane-wrap"><div class="sf-host"></div><div class="plane-ctrl">${slider("Kenar sayısı n", "n", 3, cfg.max ?? 12, 1, st.n)}<div class="seg-light" role="group">${(cfg.toggles || Object.keys(NAMES)).map((k) => `<button type="button" data-t="${k}" aria-pressed="${on.has(k)}">${NAMES[k]}</button>`).join("")}</div><div class="sf-vals"></div></div></div>`;
    function draw() {
      const n = st.n, C = 200, R = 140, svg = svgEl("svg", { viewBox: "0 0 400 400", class: "sim-svg", role: "img", "aria-label": `Düzgün ${n}gen` });
      const V = [...Array(n)].map((_, i) => { const t = -Math.PI / 2 - Math.PI / n + (2 * Math.PI * i) / n; return [C + R * Math.cos(t), C + R * Math.sin(t)]; });
      svgEl("polygon", { points: V.map((p) => p.join(",")).join(" "), class: "sf-poly" }, svg);
      if (on.has("kosegen")) for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; svgEl("line", { x1: V[i][0], y1: V[i][1], x2: V[j][0], y2: V[j][1], class: "sf-diag" }, svg); }
      if (on.has("ucgen")) for (let j = 2; j < n - 1; j++) svgEl("line", { x1: V[0][0], y1: V[0][1], x2: V[j][0], y2: V[j][1], class: "sf-aux2" }, svg);
      if (on.has("simetri")) for (let i = 0; i < n; i++) { const t = -Math.PI / 2 - Math.PI / n + (Math.PI * i) / n; svgEl("line", { x1: C + 175 * Math.cos(t), y1: C + 175 * Math.sin(t), x2: C - 175 * Math.cos(t), y2: C - 175 * Math.sin(t), class: "sf-ext" }, svg); }
      if (on.has("dis")) V.forEach((p, i) => { const q = V[(i + n - 1) % n], d = sub(p, q), L = Math.hypot(...d), e = [p[0] + (d[0] / L) * 50, p[1] + (d[1] / L) * 50]; svgEl("line", { x1: p[0], y1: p[1], x2: e[0], y2: e[1], class: "sf-aux" }, svg); });
      V.forEach((p) => svgEl("circle", { cx: p[0], cy: p[1], r: 5, class: "sf-dot b" }, svg));
      el.querySelector(".sf-host").replaceChildren(svg);
      el.querySelector(".sf-vals").innerHTML = `<span>İç açılar toplamı: (${n} − 2) · 180° = <b class="num">${(n - 2) * 180}°</b></span><span>Bir iç açı: ${(n - 2) * 180}° / ${n} = <b class="num">${fmt(((n - 2) * 180) / n, 2)}°</b></span><span>Bir dış açı: 360° / ${n} = <b class="num">${fmt(360 / n, 2)}°</b></span><span>Köşegen sayısı: ${n}(${n} − 3)/2 = <b class="num">${(n * (n - 3)) / 2}</b> · bir köşeden ${n - 3} köşegen, ${n - 2} üçgen</span><span>Simetri ekseni sayısı: <b class="num">${n}</b></span>`;
      setVals(el, st);
    }
    el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { const t = b.dataset.t; on.has(t) ? on.delete(t) : on.add(t); b.setAttribute("aria-pressed", on.has(t)); draw(); changed(); }));
    bindSliders(el, st, draw, changed); draw();
    return () => { const n = st.n; return { n, toplam: (n - 2) * 180, ic: ((n - 2) * 180) / n, dis: 360 / n, kosegen: (n * (n - 3)) / 2, simetri: n }; };
  });
})();
