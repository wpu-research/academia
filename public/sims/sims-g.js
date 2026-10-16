// Konu anlatımı simülasyonları (grup g: 12. sınıf). LESSONS.registerSim ile kaydolur; lessons.js değişmez.
(() => {
  if (!window.LESSONS) return;
  const reg = window.LESSONS.registerSim;
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  if (!document.getElementById("sg-style")) {
    const s = document.createElement("style");
    s.id = "sg-style";
    s.textContent = `
.sg-dash { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 6 5; fill: none; }
.sg-c1 { fill: none; stroke: var(--brand); stroke-width: 3.5; stroke-linejoin: round; }
.sg-c2 { fill: none; stroke: var(--good); stroke-width: 3.5; stroke-linejoin: round; }
.sg-ink { fill: none; stroke: var(--ink); stroke-width: 3; stroke-linejoin: round; }
.sg-cline { stroke: var(--warn); stroke-width: 2.5; }
.sg-band { stroke: var(--good); stroke-width: 7; stroke-linecap: round; opacity: .85; }
.sg-pos { fill: var(--good); opacity: .25; }
.sg-neg { fill: var(--bad); opacity: .22; }
.sg-ghost { fill: none; stroke: var(--muted); stroke-width: 1.5; opacity: .5; }
.sg-open { fill: var(--surface); stroke: var(--ink); stroke-width: 2.5; }
.sg-dot { fill: var(--brand); stroke: var(--surface); stroke-width: 2; }
.sg-dot2 { fill: var(--good); stroke: var(--surface); stroke-width: 2; }
.sg-dot3 { fill: var(--warn); stroke: var(--surface); stroke-width: 2; }
.sg-tan { stroke: var(--brand); stroke-width: 2.5; }
.sg-tan2 { stroke: var(--muted); stroke-width: 2; opacity: .7; }
.sg-arc { fill: var(--brand); opacity: .18; }
.sg-arc2 { fill: var(--good); opacity: .2; }
.sg-ray2 { stroke: var(--good); stroke-width: 2.5; }
.sg-lab { font: 600 13px var(--font); fill: var(--ink); paint-order: stroke; stroke: var(--surface); stroke-width: 4px; }
.sg-lab.mid { text-anchor: middle; }
.sg-hit { fill: var(--good); stroke: var(--good); }
.sg-tgt { fill: none; stroke: var(--ink); stroke-width: 2.5; stroke-dasharray: 4 3; }
.sg-panel { display: grid; gap: 10px; font-size: 15px; }
.sg-panel p { margin: 0; }
.sg-ok { color: var(--good); font-weight: 700; }
.sg-no { color: var(--bad); font-weight: 700; }
.sg-mid { color: var(--warn); font-weight: 700; }
.sg-tbl { border-collapse: collapse; font-size: 14px; }
.sg-tbl td, .sg-tbl th { border: 1px solid var(--line); padding: 3px 8px; text-align: center; }
.sg-tbl th { color: var(--muted); font-weight: 600; }
.sg-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.sg-check { display: flex; gap: 8px; align-items: center; font-size: 14px; color: var(--muted); }
.sg-check input { accent-color: var(--brand); width: 18px; height: 18px; }
.sg-chain { font-size: 14px; color: var(--muted); }
.sg-chain b { color: var(--ink); }
`;
    document.head.appendChild(s);
  }

  // ---------- Yardımcılar ----------
  const fmt = (x, d = 2) => {
    if (x === null || x === undefined || !isFinite(x)) return "–";
    let v = Math.round(x * 10 ** d) / 10 ** d;
    if (Object.is(v, -0)) v = 0;
    return v.toLocaleString("tr-TR", { maximumFractionDigits: d }).replace("-", "−");
  };
  function E(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  }
  function T(parent, x, y, s, cls = "pl-num") { const t = E("text", { x, y, class: cls }, parent); t.textContent = s; return t; }
  function svgPt(svg, ev) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  const slider = (label, key, min, max, step, value) =>
    `<label class="sim-slider"><span>${label}: <b data-gv="${key}"></b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-gk="${key}"></label>`;
  const showV = (root, key, s) => { const b = root.querySelector(`[data-gv="${key}"]`); if (b) b.textContent = s; };
  function bind(root, st, draw, changed) {
    root.querySelectorAll("input[data-gk]").forEach((i) => i.addEventListener("input", () => { st[i.dataset.gk] = +i.value; draw(); changed(); }));
  }
  function view(xr, yr, W, H, oy = 0) {
    return { xr, yr, W, H, X: (v) => ((v - xr[0]) / (xr[1] - xr[0])) * W, Y: (v) => oy + H - ((v - yr[0]) / (yr[1] - yr[0])) * H, oy };
  }
  function clip(svg, V) {
    const id = `sgc${++uid}`, defs = E("defs", {}, svg), cp = E("clipPath", { id }, defs);
    E("rect", { x: 0, y: V.oy, width: V.W, height: V.H }, cp);
    return E("g", { "clip-path": `url(#${id})` }, svg);
  }
  function grid(g, V, o = {}) {
    const sx = o.sx || 1, sy = o.sy || 1, lx = o.lx || 2 * sx, ly = o.ly || 2 * sy;
    const ax = Math.min(Math.max(V.X(0), 28), V.W - 4), ay = Math.min(Math.max(V.Y(0), V.oy + 4), V.oy + V.H - 16);
    const near = (v, s) => Math.abs(v / s - Math.round(v / s)) < 1e-6;
    for (let i = Math.ceil(V.xr[0] / sx - 1e-9) * sx; i <= V.xr[1] + 1e-9; i += sx) {
      const zero = Math.abs(i) < 1e-9;
      E("line", { x1: V.X(i), y1: V.oy, x2: V.X(i), y2: V.oy + V.H, class: zero ? "pl-axis" : "pl-grid" }, g);
      if (!zero && near(i, lx) && V.X(i) > 8 && V.X(i) < V.W - 8) T(g, V.X(i), ay + 14, fmt(i));
    }
    for (let j = Math.ceil(V.yr[0] / sy - 1e-9) * sy; j <= V.yr[1] + 1e-9; j += sy) {
      const zero = Math.abs(j) < 1e-9;
      E("line", { x1: 0, y1: V.Y(j), x2: V.W, y2: V.Y(j), class: zero ? "pl-axis" : "pl-grid" }, g);
      if (!zero && near(j, ly) && V.Y(j) > V.oy + 8 && V.Y(j) < V.oy + V.H - 6) T(g, ax - 5, V.Y(j) + 4, fmt(j), "pl-num pl-numy");
    }
  }
  // Fonksiyon eğrisi; görüntü dışına çok taşan ya da tanımsız noktalarda kalem kalkar.
  function curve(g, V, fn, cls, x0 = V.xr[0], x1 = V.xr[1], n = 320) {
    const span = V.yr[1] - V.yr[0];
    let d = "", pen = false;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = fn(x);
      if (!isFinite(y) || y < V.yr[0] - span || y > V.yr[1] + span) { pen = false; continue; }
      d += `${pen ? "L" : "M"}${V.X(x).toFixed(1)},${V.Y(y).toFixed(1)}`; pen = true;
    }
    return E("path", { d, class: cls }, g);
  }
  const inView = (V, x, y) => x >= V.xr[0] && x <= V.xr[1] && y >= V.yr[0] && y <= V.yr[1];
  // Polinomlar: katsayılar en yüksek dereceden başlar.
  const pEval = (c, x) => c.reduce((s, a) => s * x + a, 0);
  const pDer = (c) => c.slice(0, -1).map((a, i) => a * (c.length - 1 - i));
  const pInt = (c) => [...c.map((a, i) => a / (c.length - i)), 0];
  function roots(fn, a, b, n = 600) {
    const out = [];
    let px = a, py = fn(a);
    if (Math.abs(py) < 1e-12) out.push(a);
    for (let i = 1; i <= n; i++) {
      const x = a + ((b - a) * i) / n, y = fn(x);
      if (Math.abs(y) < 1e-12) { out.push(x); }
      else if (py * y < 0 && Math.abs(py) > 1e-12) {
        let lo = px, hi = x;
        for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (fn(lo) * fn(m) <= 0) hi = m; else lo = m; }
        out.push((lo + hi) / 2);
      }
      px = x; py = y;
    }
    return out.filter((r, i) => i === 0 || Math.abs(r - out[i - 1]) > 1e-6);
  }
  const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function pStr(c) {
    const deg = c.length - 1;
    let s = "";
    c.forEach((a, i) => {
      const p = deg - i;
      if (Math.abs(a) < 1e-12) return;
      const sign = a < 0 ? (s ? " − " : "−") : s ? " + " : "";
      const m = Math.abs(a), coef = m === 1 && p > 0 ? "" : fmt(m, 3);
      s += sign + coef + (p === 0 ? "" : p === 1 ? "x" : "x" + String(p).split("").map((d) => SUP[d]).join(""));
    });
    return s || "0";
  }
  const seg = (items, cur, attr) => `<div class="seg-light" role="group">${items.map(([k, l]) => `<button type="button" data-${attr}="${k}" aria-pressed="${k === cur}">${l}</button>`).join("")}</div>`;
  const W0 = 400;

  // ---------- Üstel ve logaritma fonksiyonu ----------
  // f(x) = bˣ, g(x) = log_b x; taban kaydırıcısı, izleyici nokta, isteğe bağlı y = c doğrusu ve eşitsizlik çözüm aralığı.
  const BASES = [[0.25, "1/4"], [1 / 3, "1/3"], [0.5, "1/2"], [2, "2"], [Math.E, "e"], [3, "3"], [4, "4"], [10, "10"]];
  reg("g-ustel-log", (el, cfg, changed) => {
    const mode = cfg.mode || "ustel";
    let bi = cfg.b === "e" ? 4 : BASES.findIndex(([v]) => Math.abs(v - cfg.b) < 1e-6);
    if (bi < 0) bi = 3;
    const hasC = cfg.c !== undefined;
    const st = { bi, x: cfg.x ?? (mode === "log" ? 1 : 0), c: cfg.c ?? 4 };
    const xr = cfg.xr || (mode === "ustel" ? [-4, 4] : mode === "log" ? [-1, 9] : [-3, 6]);
    const yr = cfg.yr || (mode === "ustel" ? [-1, 8] : mode === "log" ? [-4, 4] : [-3, 6]);
    const H = Math.round((W0 * (yr[1] - yr[0])) / (xr[1] - xr[0]));
    const V = view(xr, yr, W0, H);
    const xs = mode === "log" ? [cfg.xmin ?? 0.25, cfg.xmax ?? 8, 0.25] : [cfg.xmin ?? -3, cfg.xmax ?? 3, 0.5];
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl sg-panel"><p class="eq"></p>
      ${slider("Taban", "bi", 0, BASES.length - 1, 1, st.bi)}${slider("x", "x", xs[0], xs[1], xs[2], st.x)}
      ${hasC ? slider("c", "c", cfg.cmin ?? 0.5, cfg.cmax ?? 8, cfg.cstep ?? 0.5, st.c) : ""}<p class="slope sg-v"></p><p class="note sg-n"></p></div></div>`;
    const lab = () => BASES[st.bi][1];
    const expStr = () => { const l = lab(); return l.includes("/") ? `(${l})ˣ` : `${l}ˣ`; };
    const logStr = (arg = "x") => { const l = lab(); return l === "e" ? `ln ${arg}` : l === "10" ? `log ${arg}` : `log<sub>${l}</sub> ${arg}`; };
    let S = {};
    function draw() {
      const b = BASES[st.bi][0], f = (x) => b ** x, g = (x) => (x > 0 ? Math.log(x) / Math.log(b) : NaN);
      const svg = E("svg", { viewBox: `0 0 ${W0} ${H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "Üstel ve logaritma grafiği" });
      const G = clip(svg, V);
      grid(G, V);
      if (mode === "ikisi") E("line", { x1: V.X(xr[0]), y1: V.Y(xr[0]), x2: V.X(xr[1]), y2: V.Y(xr[1]), class: "sg-dash" }, G);
      if (mode !== "log") curve(G, V, f, "sg-c1");
      if (mode !== "ustel") {
        let d = "";
        for (let i = 0; i <= 320; i++) { const y = yr[0] - 1 + ((yr[1] - yr[0] + 2) * i) / 320, x = b ** y; if (x > xr[1] + 2) continue; d += `${d ? "L" : "M"}${V.X(x).toFixed(1)},${V.Y(y).toFixed(1)}`; }
        E("path", { d, class: mode === "ikisi" ? "sg-c2" : "sg-c1" }, G);
      }
      if (mode !== "log") E("circle", { cx: V.X(0), cy: V.Y(1), r: 5, class: "sg-dot3" }, G);
      if (mode !== "ustel") E("circle", { cx: V.X(1), cy: V.Y(0), r: 5, class: "sg-dot3" }, G);
      let root = null, cnote = "";
      if (hasC) {
        E("line", { x1: 0, y1: V.Y(st.c), x2: W0, y2: V.Y(st.c), class: "sg-cline" }, G);
        T(G, 6, V.Y(st.c) - 6, `y = ${fmt(st.c)}`, "sg-lab");
        if (mode === "log") root = b ** st.c; else root = st.c > 0 ? Math.log(st.c) / Math.log(b) : null;
        if (root !== null && isFinite(root)) {
          E("line", { x1: V.X(root), y1: V.Y(st.c), x2: V.X(root), y2: V.Y(0), class: "ol-guide" }, G);
          E("circle", { cx: V.X(root), cy: V.Y(st.c), r: 6, class: "sg-dot3" }, G);
          if (cfg.ineq) {
            // f artan ise f(x) > c ⇔ x > kök; azalan ise yön değişir.
            const inc = b > 1, gt = cfg.ineq === "gt", right = inc === gt;
            const lo = mode === "log" ? (right ? root : 0) : right ? root : xr[0] - 1;
            const hi = right ? xr[1] + 1 : root;
            E("line", { x1: V.X(lo), y1: V.Y(0), x2: V.X(hi), y2: V.Y(0), class: "sg-band" }, G);
            E("circle", { cx: V.X(root), cy: V.Y(0), r: 6, class: "sg-open" }, G);
            if (mode === "log") E("circle", { cx: V.X(0), cy: V.Y(0), r: 6, class: "sg-open" }, G);
          }
        }
        cnote = mode === "log"
          ? `${logStr()} = ${fmt(st.c)} ⇒ x = ${lab().includes("/") ? `(${lab()})` : lab()}<sup>${fmt(st.c)}</sup> ≈ <b class="num">${fmt(root, 3)}</b>`
          : root === null ? `${expStr()} = ${fmt(st.c)} denkleminin çözümü yok: ${expStr()} her zaman pozitiftir.` : `${expStr()} = ${fmt(st.c)} ⇒ x = ${logStr(fmt(st.c))} ≈ <b class="num">${fmt(root, 3)}</b>`;
        if (cfg.ineq && root !== null) {
          const inc = b > 1, gt = cfg.ineq === "gt", right = inc === gt, r3 = fmt(root, 3);
          const fs = mode === "log" ? logStr() : expStr();
          cnote += `<br>${fs} ${gt ? ">" : "<"} ${fmt(st.c)} ⇒ <b>${mode === "log" ? (right ? `x > ${r3}` : `0 < x < ${r3}`) : right ? `x > ${r3}` : `x < ${r3}`}</b> <span class="muted">(yeşil bant)</span>`;
        }
      }
      let y;
      if (mode === "log") { y = g(st.x); if (inView(V, st.x, y)) E("circle", { cx: V.X(st.x), cy: V.Y(y), r: 7, class: "tg-p" }, G); }
      else {
        y = f(st.x);
        if (mode === "ikisi" && inView(V, y, st.x)) {
          E("line", { x1: V.X(st.x), y1: V.Y(y), x2: V.X(y), y2: V.Y(st.x), class: "ol-guide" }, G);
          E("circle", { cx: V.X(y), cy: V.Y(st.x), r: 7, class: "sg-dot2" }, G);
        }
        if (inView(V, st.x, y)) E("circle", { cx: V.X(st.x), cy: V.Y(y), r: 7, class: "tg-p" }, G);
      }
      el.querySelector(".plane").replaceChildren(svg);
      el.querySelector(".eq").innerHTML = mode === "ustel" ? `f(x) = ${expStr()}` : mode === "log" ? `f(x) = ${logStr()}` : `f(x) = ${expStr()}<br><span class="uc-k sin">f⁻¹(x) = <b>${logStr()}</b></span>`;
      const fx = fmt(st.x);
      el.querySelector(".sg-v").innerHTML = (mode === "log" ? `${logStr(fx)} = <b class="num">${fmt(y, 3)}</b>` : `f(${fx}) = <b class="num">${fmt(y, 3)}</b>`)
        + (mode === "ikisi" ? `<br>Yansıma: (${fx}; ${fmt(y, 3)}) → (${fmt(y, 3)}; ${fx})` : "") + (cnote ? `<br>${cnote}` : "");
      el.querySelector(".sg-n").textContent = b > 1 ? "Taban 1'den büyük: fonksiyon artan." : "Taban 0 ile 1 arasında: fonksiyon azalan.";
      showV(el, "bi", lab() === "e" ? "e ≈ 2,718" : lab()); showV(el, "x", fx); showV(el, "c", fmt(st.c));
      S = { b, x: st.x, y, c: hasC ? st.c : null, root, inc: b > 1 ? 1 : 0 };
    }
    bind(el, st, draw, changed); draw();
    return () => S;
  });

  // ---------- Toplam-fark ve iki kat açı ----------
  reg("g-toplam-aci", (el, cfg, changed) => {
    const dbl = !!cfg.double, step = cfg.step ?? 15;
    const st = { a: cfg.a ?? 30, b: dbl ? cfg.a ?? 30 : cfg.b ?? 45, op: cfg.op === "-" ? -1 : 1 };
    const CX = 170, CY = 170, R = 140;
    el.innerHTML = `<div class="plane-wrap"><div class="uc-host"></div><div class="plane-ctrl sg-panel">
      ${dbl ? "" : seg([["1", "a + b"], ["-1", "a − b"]], String(st.op), "op")}
      ${slider("a", "a", 0, dbl ? 180 : 360, step, st.a)}${dbl ? "" : slider("b", "b", 0, 180, step, st.b)}
      <p class="eq sg-t"></p><p class="slope sg-v"></p></div></div>`;
    const rad = (d) => (d * Math.PI) / 180, c3 = (v) => fmt(Math.abs(v) < 1e-12 ? 0 : v, 3);
    let S = {};
    function draw() {
      if (dbl) st.b = st.a;
      const t = (((st.a + st.op * st.b) % 360) + 360) % 360;
      const svg = E("svg", { viewBox: "0 0 340 340", class: "sim-svg", role: "img", "aria-label": "Birim çemberde açıların toplamı" });
      E("line", { x1: 10, y1: CY, x2: 330, y2: CY, class: "pl-axis" }, svg); E("line", { x1: CX, y1: 10, x2: CX, y2: 330, class: "pl-axis" }, svg);
      E("circle", { cx: CX, cy: CY, r: R, class: "uc-c" }, svg);
      const P = (d, r = R) => [CX + Math.cos(rad(d)) * r, CY - Math.sin(rad(d)) * r];
      const sector = (d0, d1, r, cls) => {
        if (Math.abs(d1 - d0) < 1e-9) return;
        const [x0, y0] = P(d0, r), [x1, y1] = P(d1, r), large = Math.abs(d1 - d0) > 180 ? 1 : 0, sweep = d1 > d0 ? 0 : 1;
        E("path", { d: `M${CX},${CY} L${x0},${y0} A${r},${r} 0 ${large} ${sweep} ${x1},${y1} Z`, class: cls }, svg);
      };
      sector(0, st.a, 40, "sg-arc");
      sector(st.a, st.a + st.op * st.b, 62, "sg-arc2");
      const [ax, ay] = P(st.a), [tx, ty] = P(t);
      E("line", { x1: CX, y1: CY, x2: ax, y2: ay, class: "sg-tan" }, svg);
      E("line", { x1: CX, y1: CY, x2: tx, y2: ty, class: "sg-ray2" }, svg);
      E("line", { x1: CX, y1: CY, x2: tx, y2: CY, class: "uc-cos" }, svg);
      E("line", { x1: tx, y1: CY, x2: tx, y2: ty, class: "uc-sin" }, svg);
      E("circle", { cx: ax, cy: ay, r: 7, class: "sg-dot" }, svg);
      E("circle", { cx: tx, cy: ty, r: 8, class: "sg-dot2" }, svg);
      const [la, lb] = P(st.a / 2, 54); T(svg, la, lb + 4, "a", "sg-lab mid");
      if (!dbl || st.a) { const [lx, ly] = P(st.a + (st.op * st.b) / 2, 80); T(svg, lx, ly + 4, "b", "sg-lab mid"); }
      el.querySelector(".uc-host").replaceChildren(svg);
      const sa = Math.sin(rad(st.a)), ca = Math.cos(rad(st.a)), sb = Math.sin(rad(st.b)), cb = Math.cos(rad(st.b));
      const sinT = Math.sin(rad(st.a + st.op * st.b)), cosT = Math.cos(rad(st.a + st.op * st.b));
      if (dbl) {
        el.querySelector(".sg-t").textContent = `2a = 2 · ${st.a}° = ${2 * st.a}°`;
        el.querySelector(".sg-v").innerHTML = `<span class="uc-k sin">sin 2a = 2 · sin a · cos a<br>= 2 · (${c3(sa)}) · (${c3(ca)}) = <b class="num">${c3(2 * sa * ca)}</b></span><br>
          <span class="uc-k cos">cos 2a = cos²a − sin²a<br>= ${c3(ca * ca)} − ${c3(sa * sa)} = <b class="num">${c3(ca * ca - sa * sa)}</b></span><br>
          <span class="muted">Doğrudan: sin ${2 * st.a}° = ${c3(sinT)}, cos ${2 * st.a}° = ${c3(cosT)}</span>`;
      } else {
        const p = st.op > 0;
        el.querySelector(".sg-t").textContent = `a ${p ? "+" : "−"} b = ${st.a}° ${p ? "+" : "−"} ${st.b}° = ${st.a + st.op * st.b}°`;
        el.querySelector(".sg-v").innerHTML = `<span class="uc-k sin">sin(a ${p ? "+" : "−"} b) = sin a · cos b ${p ? "+" : "−"} cos a · sin b<br>= (${c3(sa)})(${c3(cb)}) ${p ? "+" : "−"} (${c3(ca)})(${c3(sb)}) = <b class="num">${c3(sa * cb + st.op * ca * sb)}</b></span><br>
          <span class="uc-k cos">cos(a ${p ? "+" : "−"} b) = cos a · cos b ${p ? "−" : "+"} sin a · sin b<br>= (${c3(ca)})(${c3(cb)}) ${p ? "−" : "+"} (${c3(sa)})(${c3(sb)}) = <b class="num">${c3(ca * cb - st.op * sa * sb)}</b></span><br>
          <span class="muted">Yeşil nokta: (cos ${t}°, sin ${t}°) = (${c3(cosT)}; ${c3(sinT)})</span>`;
      }
      showV(el, "a", `${st.a}°`); showV(el, "b", `${st.b}°`);
      S = { a: st.a, b: st.b, op: st.op, t, sin: sinT, cos: cosT };
    }
    el.querySelectorAll("[data-op]").forEach((btn) => btn.addEventListener("click", () => {
      st.op = +btn.dataset.op; el.querySelectorAll("[data-op]").forEach((x) => x.setAttribute("aria-pressed", x === btn)); draw(); changed();
    }));
    bind(el, st, draw, changed); draw();
    return () => S;
  });

  // ---------- Trigonometrik denklemler ----------
  // sin x = c ya da cos x = c: birim çemberde ve [0°, 360°) grafiğinde çözümler.
  const CV = [[-1.2, "−1,2"], [-1, "−1"], [-Math.sqrt(3) / 2, "−√3/2"], [-Math.SQRT1_2, "−√2/2"], [-0.5, "−1/2"], [0, "0"], [0.5, "1/2"], [Math.SQRT1_2, "√2/2"], [Math.sqrt(3) / 2, "√3/2"], [1, "1"], [1.2, "1,2"]];
  reg("g-trig-denklem", (el, cfg, changed) => {
    let ci = CV.findIndex(([v, l]) => l === String(cfg.c) || (typeof cfg.c === "number" && Math.abs(v - cfg.c) < 1e-9));
    const st = { fn: cfg.fn === "cos" ? 1 : 0, ci: ci < 0 ? 6 : ci };
    const CX = 130, CY = 150, R = 110, GX0 = 290, GX1 = 650, GW = GX1 - GX0;
    el.innerHTML = `<div class="sg-host"></div><div class="plane-ctrl sg-panel" style="margin-top:10px">
      ${seg([["0", "sin x = c"], ["1", "cos x = c"]], String(st.fn), "fn")}${slider("c", "ci", 0, CV.length - 1, 1, st.ci)}<p class="slope sg-v"></p></div>`;
    let S = {};
    const gx = (d) => GX0 + (d / 360) * GW;
    function draw() {
      const [c, cl] = CV[st.ci], sin = st.fn === 0, fname = sin ? "sin" : "cos";
      let sols = [];
      if (Math.abs(c) <= 1 + 1e-12) {
        const a = (Math.round(((sin ? Math.asin(c) : Math.acos(c)) * 180) / Math.PI * 1e6) / 1e6);
        sols = (sin ? [a, 180 - a] : [a, -a]).map((d) => Math.round((((d % 360) + 360) % 360) * 1e6) / 1e6);
        sols = [...new Set(sols)].sort((x, y) => x - y);
      }
      const svg = E("svg", { viewBox: "0 0 660 300", class: "sim-svg", role: "img", "aria-label": `${fname} x = ${cl} denkleminin çözümleri` });
      E("line", { x1: CX - R - 14, y1: CY, x2: CX + R + 14, y2: CY, class: "pl-axis" }, svg); E("line", { x1: CX, y1: CY - R - 14, x2: CX, y2: CY + R + 14, class: "pl-axis" }, svg);
      E("circle", { cx: CX, cy: CY, r: R, class: "uc-c" }, svg);
      if (sin) E("line", { x1: CX - R - 14, y1: CY - c * R, x2: CX + R + 14, y2: CY - c * R, class: "sg-cline" }, svg);
      else E("line", { x1: CX + c * R, y1: CY - R - 14, x2: CX + c * R, y2: CY + R + 14, class: "sg-cline" }, svg);
      // Grafik
      E("line", { x1: GX0, y1: CY, x2: GX1, y2: CY, class: "pl-axis" }, svg); E("line", { x1: GX0, y1: CY - R - 14, x2: GX0, y2: CY + R + 14, class: "pl-axis" }, svg);
      [90, 180, 270, 360].forEach((d) => { E("line", { x1: gx(d), y1: CY - R, x2: gx(d), y2: CY + R, class: "pl-grid" }, svg); T(svg, gx(d), CY + 16, `${d}°`); });
      [[1, "1"], [-1, "−1"]].forEach(([v, s]) => { E("line", { x1: GX0, y1: CY - v * R, x2: GX1, y2: CY - v * R, class: "pl-grid" }, svg); T(svg, GX0 - 6, CY - v * R + 4, s, "pl-num pl-numy"); });
      let d = "";
      for (let i = 0; i <= 360; i += 2) { const v = sin ? Math.sin((i * Math.PI) / 180) : Math.cos((i * Math.PI) / 180); d += `${i ? "L" : "M"}${gx(i).toFixed(1)},${(CY - v * R).toFixed(1)}`; }
      E("path", { d, class: "sg-ink" }, svg);
      E("line", { x1: GX0, y1: CY - c * R, x2: GX1, y2: CY - c * R, class: "sg-cline" }, svg);
      sols.forEach((s, k) => {
        const r = (s * Math.PI) / 180, px = CX + Math.cos(r) * R, py = CY - Math.sin(r) * R;
        E("line", { x1: CX, y1: CY, x2: px, y2: py, class: k ? "sg-ray2" : "uc-r" }, svg);
        E("circle", { cx: px, cy: py, r: 7, class: k ? "sg-dot2" : "sg-dot" }, svg);
        E("circle", { cx: gx(s), cy: CY - c * R, r: 7, class: k ? "sg-dot2" : "sg-dot" }, svg);
        E("line", { x1: gx(s), y1: CY - c * R, x2: gx(s), y2: CY, class: "ol-guide" }, svg);
        T(svg, gx(s), CY - c * R + (c >= 0 ? -12 : 22), `${fmt(s, 1)}°`, "sg-lab mid");
      });
      el.querySelector(".sg-host").replaceChildren(svg);
      const solTxt = sols.map((s) => `${fmt(s, 2)}°`).join(", ");
      let gen;
      if (!sols.length) gen = `<span class="sg-no">Çözüm yok:</span> her x için −1 ≤ ${fname} x ≤ 1.`;
      else if (sols.length === 1) gen = `Genel çözüm: x = ${fmt(sols[0], 2)}° + k · 360°, k ∈ ℤ`;
      else if (sin) gen = `Genel çözüm: x = ${fmt(sols[0], 2)}° + k · 360° veya x = ${fmt(sols[1], 2)}° + k · 360°, k ∈ ℤ`;
      else { const a = Math.min(sols[0], 360 - sols[0]); gen = `Genel çözüm: x = ±${fmt(a, 2)}° + k · 360°, k ∈ ℤ`; }
      el.querySelector(".sg-v").innerHTML = `<b class="eq" style="font-size:20px">${fname} x = ${cl}</b><br>[0°, 360°) aralığında ${sols.length ? `<b>${sols.length}</b> çözüm: <b class="num">${solTxt}</b>` : "çözüm yok"}<br>${gen}`;
      showV(el, "ci", cl);
      S = { fn: st.fn, c, count: sols.length, x1: sols.length ? sols[0] : null, x2: sols.length > 1 ? sols[1] : null };
    }
    el.querySelectorAll("[data-fn]").forEach((btn) => btn.addEventListener("click", () => {
      st.fn = +btn.dataset.fn; el.querySelectorAll("[data-fn]").forEach((x) => x.setAttribute("aria-pressed", x === btn)); draw(); changed();
    }));
    bind(el, st, draw, changed); draw();
    return () => S;
  });

  // ---------- Limit ve süreklilik ----------
  // f(x) = x + a (x < 1), f(1) = p, f(x) = (x − 1)² + 3 (x > 1). Soldan limit 1 + a, sağdan limit 3.
  reg("g-sureklilik", (el, cfg, changed) => {
    const st = { a: cfg.a ?? 0, p: cfg.p ?? 1, def: cfg.tanimli === false ? 0 : 1 };
    const V = view([-2, 4], [-1, 7], W0, Math.round((W0 * 8) / 6));
    const L = (x) => x + st.a, Rr = (x) => (x - 1) ** 2 + 3;
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl sg-panel">
      <p class="eq" style="font-size:17px">f(x) = x + a, x &lt; 1<br>f(1) = p<br>f(x) = (x − 1)² + 3, x &gt; 1</p>
      ${slider("a", "a", -2, 4, 0.5, st.a)}${slider("p = f(1)", "p", 0, 6, 0.5, st.p)}
      <label class="sg-check"><input type="checkbox" ${st.def ? "checked" : ""} class="sg-def"> f, x = 1'de tanımlı</label>
      <div class="sg-tab"></div><p class="slope sg-v"></p></div></div>`;
    let S = {};
    function draw() {
      const sol = 1 + st.a, sag = 3, lim = Math.abs(sol - sag) < 1e-9, cont = lim && st.def && Math.abs(st.p - 3) < 1e-9;
      const svg = E("svg", { viewBox: `0 0 ${W0} ${V.H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "Parçalı fonksiyon" });
      const G = clip(svg, V); grid(G, V);
      curve(G, V, L, "sg-c1", -2, 1, 60);
      curve(G, V, Rr, "sg-c2", 1, 4, 120);
      E("line", { x1: V.X(1), y1: 0, x2: V.X(1), y2: V.H, class: "sg-dash" }, G);
      const fill = (y) => st.def && Math.abs(st.p - y) < 1e-9;
      E("circle", { cx: V.X(1), cy: V.Y(sol), r: 6, class: fill(sol) ? "sg-dot" : "sg-open" }, G);
      E("circle", { cx: V.X(1), cy: V.Y(sag), r: 6, class: fill(sag) ? "sg-dot2" : "sg-open" }, G);
      if (st.def && !fill(sol) && !fill(sag)) E("circle", { cx: V.X(1), cy: V.Y(st.p), r: 6, class: "sg-dot3" }, G);
      el.querySelector(".plane").replaceChildren(svg);
      const xs = [0.9, 0.99, 0.999, 1.001, 1.01, 1.1], f = (x) => (x < 1 ? L(x) : Rr(x));
      el.querySelector(".sg-tab").innerHTML = `<div class="table-wrap"><table class="sg-tbl"><tr><th>x</th>${xs.map((x) => `<td>${fmt(x, 3)}</td>`).join("")}</tr><tr><th>f(x)</th>${xs.map((x) => `<td>${fmt(f(x), 3)}</td>`).join("")}</tr></table></div>`;
      el.querySelector(".sg-v").innerHTML = `Soldan limit: lim<sub>x→1⁻</sub> f(x) = <b class="num">${fmt(sol)}</b><br>Sağdan limit: lim<sub>x→1⁺</sub> f(x) = <b class="num">3</b><br>f(1) = <b class="num">${st.def ? fmt(st.p) : "tanımsız"}</b><br>`
        + (!lim ? `<span class="sg-no">Sol ve sağ limit farklı: x = 1'de limit yok, f süreksiz.</span>`
          : cont ? `<span class="sg-ok">lim f(x) = f(1) = 3: f, x = 1'de sürekli.</span>`
          : `<span class="sg-mid">Limit var (3) ama ${st.def ? "f(1) ≠ 3" : "f(1) tanımsız"}: f, x = 1'de süreksiz.</span>`);
      showV(el, "a", fmt(st.a)); showV(el, "p", fmt(st.p));
      S = { a: st.a, p: st.p, tanimli: st.def, sol, sag, limit: lim ? 1 : 0, surekli: cont ? 1 : 0 };
    }
    el.querySelector(".sg-def").addEventListener("change", (e) => { st.def = e.target.checked ? 1 : 0; draw(); changed(); });
    bind(el, st, draw, changed); draw();
    return () => S;
  });

  // ---------- Türevin işareti: f ve f′ birlikte ----------
  reg("g-turev-isaret", (el, cfg, changed) => {
    const c = cfg.coef || [1, 0, -3, 0], dc = pDer(c), f = (x) => pEval(c, x), d = (x) => pEval(dc, x);
    const xr = cfg.xr || [-2.5, 2.5], yr = cfg.yr || [-4, 4], dyr = cfg.dyr || [-4, 8], step = cfg.step ?? 0.1;
    const W = 480, H1 = 270, GAP = 26, H2 = 150;
    const V = view(xr, yr, W, H1), D = view(xr, dyr, W, H2, H1 + GAP);
    const st = { x: cfg.x ?? xr[0] + 0.5 };
    const fl = cfg.label || pStr(c), dl = cfg.dlabel || pStr(dc);
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl sg-panel"><p class="eq" style="font-size:18px">${cfg.name || "f(x)"} = ${fl}</p><p class="muted" style="margin:0">${cfg.dname || "f′(x)"} = ${dl}</p>
      ${slider("x", "x", cfg.xmin ?? xr[0], cfg.xmax ?? xr[1], step, st.x)}<p class="slope sg-v"></p><p class="note sg-k"></p></div></div>`;
    const crit = roots(d, xr[0], xr[1]).filter((r) => r > xr[0] + 1e-6 && r < xr[1] - 1e-6).map((r) => { const l = d(r - 1e-4), rr = d(r + 1e-4); return { x: r, y: f(r), kind: l > 0 && rr < 0 ? "yerel maks." : l < 0 && rr > 0 ? "yerel min." : "dönüm" }; });
    let S = {};
    function draw() {
      const svg = E("svg", { viewBox: `0 0 ${W} ${H1 + GAP + H2}`, class: "sim-svg plane-svg", role: "img", "aria-label": "f ve türevinin grafiği" });
      const G1 = clip(svg, V), G2 = clip(svg, D);
      grid(G1, V, cfg.grid || {}); grid(G2, D, cfg.dgrid || cfg.grid || {});
      // f′ işaret alanları
      let pos = `M${D.X(xr[0])},${D.Y(0)}`, neg = pos;
      for (let i = 0; i <= 300; i++) { const x = xr[0] + ((xr[1] - xr[0]) * i) / 300, v = d(x); pos += `L${D.X(x).toFixed(1)},${D.Y(Math.max(0, v)).toFixed(1)}`; neg += `L${D.X(x).toFixed(1)},${D.Y(Math.min(0, v)).toFixed(1)}`; }
      pos += `L${D.X(xr[1])},${D.Y(0)}Z`; neg += `L${D.X(xr[1])},${D.Y(0)}Z`;
      E("path", { d: pos, class: "sg-pos" }, G2); E("path", { d: neg, class: "sg-neg" }, G2);
      curve(G2, D, d, "sg-c2");
      T(G2, 8, D.oy + 16, cfg.dname || "f′", "sg-lab");
      curve(G1, V, f, "sg-ink");
      T(G1, 8, 18, cfg.name || "f", "sg-lab");
      crit.forEach((p) => { if (p.kind === "dönüm") return; E("circle", { cx: V.X(p.x), cy: V.Y(p.y), r: 6, class: "sg-dot3" }, G1); T(G1, V.X(p.x), V.Y(p.y) + (p.kind === "yerel maks." ? -12 : 22), p.kind, "sg-lab mid"); });
      const fx = f(st.x), s = d(st.x);
      E("line", { x1: V.X(xr[0] - 1), y1: V.Y(fx + s * (xr[0] - 1 - st.x)), x2: V.X(xr[1] + 1), y2: V.Y(fx + s * (xr[1] + 1 - st.x)), class: Math.abs(s) < 1e-9 ? "tg-tangent flat" : "sg-tan" }, G1);
      E("line", { x1: V.X(st.x), y1: 0, x2: V.X(st.x), y2: H1 + GAP + H2, class: "ol-guide" }, svg);
      E("circle", { cx: V.X(st.x), cy: V.Y(fx), r: 7, class: "tg-p" }, G1);
      E("circle", { cx: D.X(st.x), cy: D.Y(s), r: 6, class: "sg-dot2" }, G2);
      el.querySelector(".plane").replaceChildren(svg);
      const sg = Math.abs(s) < 1e-9 ? 0 : Math.sign(s);
      el.querySelector(".sg-v").innerHTML = `x = <b class="num">${fmt(st.x)}</b> · ${cfg.name || "f"}(x) = <b class="num">${fmt(fx, 3)}</b> · ${cfg.dname || "f′"}(x) = <b class="num">${fmt(s, 3)}</b><br>`
        + (sg > 0 ? `<span class="sg-ok">f′ > 0: teğet yukarı doğru, f artan.</span>` : sg < 0 ? `<span class="sg-no">f′ < 0: teğet aşağı doğru, f azalan.</span>` : `<span class="sg-mid">f′ = 0: teğet yatay.</span>`);
      el.querySelector(".sg-k").textContent = crit.filter((p) => p.kind !== "dönüm").map((p) => `${p.kind}: x = ${fmt(p.x)}, f = ${fmt(p.y)}`).join(" · ") || "Türevin işaret değiştirdiği nokta yok.";
      showV(el, "x", fmt(st.x));
      S = { x: st.x, fx, d: s, sign: sg };
    }
    bind(el, st, draw, changed); draw();
    return () => S;
  });

  // ---------- Belirsiz integral: F(x) + C ailesi ----------
  reg("g-ilkel", (el, cfg, changed) => {
    const c = cfg.coef || [2, 0], Fc = pInt(c), f = (x) => pEval(c, x), F = (x) => pEval(Fc, x);
    const xr = cfg.xr || [-4, 4], yr = cfg.yr || [-5, 7];
    const H = Math.round((W0 * (yr[1] - yr[0])) / (xr[1] - xr[0])), V = view(xr, yr, W0, H);
    const st = { C: cfg.C ?? 0, t: cfg.t ?? 1 };
    const fl = cfg.fLabel || pStr(c), Fl = cfg.FLabel || pStr(Fc);
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl sg-panel"><p class="eq" style="font-size:18px"></p><p class="muted" style="margin:0">f(x) = ${fl}</p>
      ${slider("C", "C", cfg.cmin ?? -4, cfg.cmax ?? 4, cfg.cstep ?? 0.5, st.C)}${slider("Teğet noktası x", "t", cfg.tmin ?? xr[0] + 1, cfg.tmax ?? xr[1] - 1, 0.5, st.t)}<p class="slope sg-v"></p></div></div>`;
    let S = {};
    function draw() {
      const svg = E("svg", { viewBox: `0 0 ${W0} ${H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "İlkel fonksiyon ailesi" });
      const G = clip(svg, V); grid(G, V, cfg.grid || {});
      const ks = [-6, -4, -2, 0, 2, 4, 6];
      const s = f(st.t), seg = (k, cls) => { const y0 = F(st.t) + k, dx = 0.7 / Math.sqrt(1 + s * s * ((V.H / (yr[1] - yr[0])) / (W0 / (xr[1] - xr[0]))) ** 2); E("line", { x1: V.X(st.t - dx), y1: V.Y(y0 - s * dx), x2: V.X(st.t + dx), y2: V.Y(y0 + s * dx), class: cls }, G); };
      ks.forEach((k) => { if (Math.abs(k - st.C) < 1e-9) return; curve(G, V, (x) => F(x) + k, "sg-ghost"); seg(k, "sg-tan2"); });
      curve(G, V, (x) => F(x) + st.C, "sg-c1");
      E("line", { x1: V.X(st.t), y1: 0, x2: V.X(st.t), y2: H, class: "sg-dash" }, G);
      seg(st.C, "sg-tan");
      E("circle", { cx: V.X(st.t), cy: V.Y(F(st.t) + st.C), r: 6, class: "tg-p" }, G);
      let hit = 0;
      if (cfg.pt) {
        const [px, py] = cfg.pt; hit = Math.abs(F(px) + st.C - py) < 1e-9 ? 1 : 0;
        E("circle", { cx: V.X(px), cy: V.Y(py), r: 8, class: hit ? "pl-pt hit" : "pl-pt" }, G);
        T(G, V.X(px) + 10, V.Y(py) - 10, `(${fmt(px)}, ${fmt(py)})`, "sg-lab");
      }
      el.querySelector(".plane").replaceChildren(svg);
      el.querySelector(".eq").textContent = `F(x) = ${Fl}${Math.abs(st.C) < 1e-9 ? "" : st.C > 0 ? ` + ${fmt(st.C)}` : ` − ${fmt(-st.C)}`}`;
      el.querySelector(".sg-v").innerHTML = `Bütün eğriler aynı fonksiyonun ilkelleri: F′(x) = f(x).<br>x = ${fmt(st.t)} noktasında her eğrinin teğet eğimi f(${fmt(st.t)}) = <b class="num">${fmt(s, 3)}</b>; teğetler paralel.`
        + (cfg.pt ? `<br>${hit ? `<span class="sg-ok">Eğri (${fmt(cfg.pt[0])}, ${fmt(cfg.pt[1])}) noktasından geçiyor.</span>` : `<span class="muted">Eğriyi işaretli noktadan geçir.</span>`}` : "");
      showV(el, "C", fmt(st.C)); showV(el, "t", fmt(st.t));
      S = { C: st.C, t: st.t, slope: s, hit };
    }
    bind(el, st, draw, changed); draw();
    return () => S;
  });

  // ---------- Belirli integral: işaretli alan ----------
  reg("g-belirli", (el, cfg, changed) => {
    const c = cfg.coef || [1, 0, -1], Fc = pInt(c), f = (x) => pEval(c, x), F = (x) => pEval(Fc, x);
    const xr = cfg.xr || [-3, 3], yr = cfg.yr || [-2, 6];
    const H = Math.min(420, Math.round((W0 * (yr[1] - yr[0])) / (xr[1] - xr[0]))), V = view(xr, yr, W0, H);
    const st = { a: cfg.a ?? 0, b: cfg.b ?? 2 };
    const lo = cfg.min ?? xr[0], hi = cfg.max ?? xr[1], step = cfg.step ?? 0.5;
    const fl = cfg.fLabel || pStr(c), Fl = cfg.FLabel || pStr(Fc);
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl sg-panel"><p class="eq" style="font-size:18px">f(x) = ${fl}</p><p class="muted" style="margin:0">F(x) = ${Fl}</p>
      ${slider("Alt sınır a", "a", lo, hi, step, st.a)}${slider("Üst sınır b", "b", lo, hi, step, st.b)}<p class="slope sg-v"></p></div></div>`;
    let S = {};
    function draw() {
      const { a, b } = st, l = Math.min(a, b), r = Math.max(a, b);
      const I = F(b) - F(a);
      const rs = [l, ...roots(f, l, r).filter((x) => x > l + 1e-9 && x < r - 1e-9), r];
      let A = 0; for (let i = 1; i < rs.length; i++) A += Math.abs(F(rs[i]) - F(rs[i - 1]));
      const svg = E("svg", { viewBox: `0 0 ${W0} ${H}`, class: "sim-svg plane-svg", role: "img", "aria-label": "Belirli integral" });
      const G = clip(svg, V); grid(G, V, cfg.grid || {});
      if (r > l) {
        let pos = `M${V.X(l)},${V.Y(0)}`, neg = pos;
        for (let i = 0; i <= 200; i++) { const x = l + ((r - l) * i) / 200, v = f(x); pos += `L${V.X(x).toFixed(1)},${V.Y(Math.max(0, v)).toFixed(1)}`; neg += `L${V.X(x).toFixed(1)},${V.Y(Math.min(0, v)).toFixed(1)}`; }
        pos += `L${V.X(r)},${V.Y(0)}Z`; neg += `L${V.X(r)},${V.Y(0)}Z`;
        E("path", { d: pos, class: "sg-pos" }, G); E("path", { d: neg, class: "sg-neg" }, G);
      }
      curve(G, V, f, "sg-ink");
      [[a, "a"], [b, "b"]].forEach(([x, s]) => { E("line", { x1: V.X(x), y1: 0, x2: V.X(x), y2: H, class: "ol-guide" }, G); T(G, V.X(x) + (s === "a" ? -4 : 4), 16, s, "sg-lab mid"); });
      el.querySelector(".plane").replaceChildren(svg);
      el.querySelector(".sg-v").innerHTML = `∫<sub>${fmt(a)}</sub><sup>${fmt(b)}</sup> f(x) dx = F(${fmt(b)}) − F(${fmt(a)})<br>= ${fmt(F(b), 3)} − (${fmt(F(a), 3)}) = <b class="num">${fmt(I, 3)}</b><br>`
        + `Taralı bölgenin alanı = <b class="num">${fmt(A, 3)}</b> <span class="muted">(yeşil: x ekseninin üstü, kırmızı: altı)</span>`
        + (a > b ? `<br><span class="sg-mid">a > b: ∫ₐᵇ = −∫ᵦₐ, işaret değişir.</span>` : "");
      showV(el, "a", fmt(a)); showV(el, "b", fmt(b));
      S = { a, b, I, A };
    }
    bind(el, st, draw, changed); draw();
    return () => S;
  });

  // ---------- Çember ve doğru ----------
  reg("g-cember-dogru", (el, cfg, changed) => {
    const hasLine = cfg.line !== false;
    const st = { a: cfg.a ?? 1, b: cfg.b ?? 1, r: cfg.r ?? 3, m: cfg.m ?? 0, n: cfg.n ?? 0 };
    const V = view([-8, 8], [-8, 8], W0, W0);
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl sg-panel"><p class="eq sg-eq" style="font-size:18px"></p>
      ${slider("Merkez a", "a", -4, 4, 1, st.a)}${slider("Merkez b", "b", -4, 4, 1, st.b)}${slider("Yarıçap r", "r", 1, 6, 1, st.r)}
      ${hasLine ? slider("Eğim m", "m", -3, 3, 0.5, st.m) + slider("n", "n", -8, 8, 1, st.n) : ""}<p class="slope sg-v"></p></div></div>`;
    const sgn = (v, s) => (v === 0 ? s : v > 0 ? `${s} − ${fmt(v)}` : `${s} + ${fmt(-v)}`);
    let S = {};
    function draw() {
      const { a, b, r, m, n } = st;
      const svg = E("svg", { viewBox: `0 0 ${W0} ${W0}`, class: "sim-svg plane-svg", role: "img", "aria-label": "Çember ve doğru" });
      const G = clip(svg, V); grid(G, V);
      const k = W0 / 16;
      E("circle", { cx: V.X(a), cy: V.Y(b), r: r * k, class: "sg-c1" }, G);
      E("line", { x1: V.X(a), y1: V.Y(b), x2: V.X(a + r), y2: V.Y(b), class: "sg-dash" }, G);
      E("circle", { cx: V.X(a), cy: V.Y(b), r: 5, class: "sg-dot" }, G);
      T(G, V.X(a) + 8, V.Y(b) - 8, `M(${a}, ${b})`, "sg-lab");
      let d = null, cnt = null, pts = [];
      if (hasLine) {
        E("line", { x1: V.X(-9), y1: V.Y(m * -9 + n), x2: V.X(9), y2: V.Y(m * 9 + n), class: "sg-c2" }, G);
        d = Math.abs(m * a - b + n) / Math.sqrt(m * m + 1);
        const fx = (a + m * (b - n)) / (1 + m * m), fy = m * fx + n;
        E("line", { x1: V.X(a), y1: V.Y(b), x2: V.X(fx), y2: V.Y(fy), class: "ol-guide" }, G);
        const A2 = 1 + m * m, B2 = 2 * (m * (n - b) - a), C2 = a * a + (n - b) ** 2 - r * r, disc = B2 * B2 - 4 * A2 * C2;
        cnt = Math.abs(d - r) < 1e-9 ? 1 : d < r ? 2 : 0;
        if (cnt === 1) pts = [[fx, fy]];
        else if (cnt === 2) pts = [-1, 1].map((sg) => { const x = (-B2 + sg * Math.sqrt(disc)) / (2 * A2); return [x, m * x + n]; });
        pts.forEach(([x, y]) => E("circle", { cx: V.X(x), cy: V.Y(y), r: 6, class: "sg-dot3" }, G));
      }
      el.querySelector(".plane").replaceChildren(svg);
      el.querySelector(".sg-eq").innerHTML = `(${sgn(a, "x")})² + (${sgn(b, "y")})² = ${r * r}`
        + (hasLine ? `<br><span class="uc-k sin">y = ${m === 0 ? fmt(n) : `${m === 1 ? "" : m === -1 ? "−" : fmt(m)}x${n ? (n > 0 ? ` + ${n}` : ` − ${-n}`) : ""}`}</span>` : "");
      const D = -2 * a, Ee = -2 * b, Fv = a * a + b * b - r * r;
      const gen = `x² + y²${D ? (D > 0 ? ` + ${D}x` : ` − ${-D}x`) : ""}${Ee ? (Ee > 0 ? ` + ${Ee}y` : ` − ${-Ee}y`) : ""}${Fv ? (Fv > 0 ? ` + ${Fv}` : ` − ${-Fv}`) : ""} = 0`;
      el.querySelector(".sg-v").innerHTML = `Genel biçim: ${gen}` + (hasLine
        ? `<br>Merkezin doğruya uzaklığı d = |${fmt(m)}·${a} − ${b} + ${n}| / √(${fmt(m)}² + 1) = <b class="num">${fmt(d, 3)}</b>, r = ${r}<br>`
          + (cnt === 2 ? `<span class="sg-ok">d &lt; r: doğru çemberi iki noktada keser.</span>` : cnt === 1 ? `<span class="sg-mid">d = r: doğru çembere teğet.</span>` : `<span class="sg-no">d &gt; r: doğru çemberi kesmez.</span>`)
        : "");
      ["a", "b", "r", "m", "n"].forEach((k2) => showV(el, k2, fmt(st[k2])));
      S = { a, b, r, m, n, d, kesisim: cnt };
    }
    bind(el, st, draw, changed); draw();
    return () => S;
  });

  // ---------- Noktanın dönüşümleri ve bileşke ----------
  const OPS = {
    x: ["x eksenine göre yansıt", (x, y) => [x, -y], "(x, y) → (x, −y)"],
    y: ["y eksenine göre yansıt", (x, y) => [-x, y], "(x, y) → (−x, y)"],
    o: ["Orijine göre yansıt", (x, y) => [-x, -y], "(x, y) → (−x, −y)"],
    yx: ["y = x doğrusuna göre", (x, y) => [y, x], "(x, y) → (y, x)"],
    ynx: ["y = −x doğrusuna göre", (x, y) => [-y, -x], "(x, y) → (−y, −x)"],
    r90: ["Orijin etrafında 90° döndür", (x, y) => [-y, x], "(x, y) → (−y, x)"],
    r270: ["Orijin etrafında −90° döndür", (x, y) => [y, -x], "(x, y) → (y, −x)"],
    t: ["(u, v) kadar ötele", null, "(x, y) → (x + u, y + v)"],
  };
  reg("g-nokta-donusum", (el, cfg, changed) => {
    const ops = cfg.ops || Object.keys(OPS);
    const st = { px: cfg.p?.[0] ?? 3, py: cfg.p?.[1] ?? 1, u: cfg.u ?? 2, v: cfg.v ?? -3 };
    let hist = [];
    const V = view([-8, 8], [-8, 8], W0, W0);
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl sg-panel">
      ${slider("P'nin x'i", "px", -6, 6, 1, st.px)}${slider("P'nin y'si", "py", -6, 6, 1, st.py)}
      <div class="sg-btns">${ops.map((k) => `<button type="button" class="btn btn-small btn-outline" data-op="${k}">${OPS[k][0]}</button>`).join("")}<button type="button" class="btn btn-small btn-outline" data-op="0">Baştan</button></div>
      ${ops.includes("t") ? slider("u", "u", -6, 6, 1, st.u) + slider("v", "v", -6, 6, 1, st.v) : ""}
      <p class="slope sg-v"></p><p class="sg-chain"></p></div></div>`;
    const svg = E("svg", { viewBox: `0 0 ${W0} ${W0}`, class: "sim-svg plane-svg drag", role: "img", "aria-label": "Noktanın dönüşümü" });
    el.querySelector(".plane").replaceChildren(svg);
    let S = {};
    function chain() {
      const out = [[st.px, st.py]];
      for (const h of hist) { const [x, y] = out[out.length - 1]; out.push(h.k === "t" ? [x + h.u, y + h.v] : OPS[h.k][1](x, y)); }
      return out;
    }
    function draw() {
      svg.replaceChildren();
      const G = clip(svg, V); grid(G, V);
      E("line", { x1: V.X(-8), y1: V.Y(-8), x2: V.X(8), y2: V.Y(8), class: "sg-dash" }, G);
      E("line", { x1: V.X(-8), y1: V.Y(8), x2: V.X(8), y2: V.Y(-8), class: "sg-dash" }, G);
      const pts = chain(), [qx, qy] = pts[pts.length - 1];
      let hit = 0;
      if (cfg.target) { hit = qx === cfg.target[0] && qy === cfg.target[1] && hist.length ? 1 : 0; E("circle", { cx: V.X(cfg.target[0]), cy: V.Y(cfg.target[1]), r: 11, class: "sg-tgt" }, G); }
      for (let i = 1; i < pts.length; i++) E("line", { x1: V.X(pts[i - 1][0]), y1: V.Y(pts[i - 1][1]), x2: V.X(pts[i][0]), y2: V.Y(pts[i][1]), class: "ol-guide" }, G);
      pts.forEach(([x, y], i) => { if (i && i < pts.length - 1) E("circle", { cx: V.X(x), cy: V.Y(y), r: 5, class: "sg-dot3" }, G); });
      E("circle", { cx: V.X(st.px), cy: V.Y(st.py), r: 8, class: "nl-knob" }, G);
      T(G, V.X(st.px) + 10, V.Y(st.py) - 10, `P(${st.px}, ${st.py})`, "sg-lab");
      if (hist.length) { E("circle", { cx: V.X(qx), cy: V.Y(qy), r: 8, class: hit ? "pl-pt hit" : "sg-dot2" }, G); T(G, V.X(qx) + 10, V.Y(qy) + 20, `P′(${fmt(qx)}, ${fmt(qy)})`, "sg-lab"); }
      const last = hist[hist.length - 1];
      el.querySelector(".sg-v").innerHTML = last ? `Son dönüşüm: <b>${OPS[last.k][0]}</b><br>${last.k === "t" ? `(x, y) → (x ${last.u < 0 ? "−" : "+"} ${Math.abs(last.u)}, y ${last.v < 0 ? "−" : "+"} ${Math.abs(last.v)})` : OPS[last.k][2]}` : "Bir dönüşüm düğmesine bas. Düğmeler art arda uygulanır (bileşke).";
      el.querySelector(".sg-chain").innerHTML = pts.map(([x, y], i) => `<b>(${fmt(x)}, ${fmt(y)})</b>${i < hist.length ? ` → <span>${hist[i].k === "t" ? `öteleme (${hist[i].u}, ${hist[i].v})` : OPS[hist[i].k][0].toLowerCase()}</span> → ` : ""}`).join("");
      ["px", "py", "u", "v"].forEach((k) => showV(el, k, st[k]));
      el.querySelectorAll("input[data-gk]").forEach((i) => { i.value = st[i.dataset.gk]; });
      S = { px: st.px, py: st.py, qx, qy, steps: hist.length, hit };
    }
    el.querySelectorAll("[data-op]").forEach((btn) => btn.addEventListener("click", () => {
      const k = btn.dataset.op;
      if (k === "0") hist = []; else if (hist.length < 6) hist.push(k === "t" ? { k, u: st.u, v: st.v } : { k });
      draw(); changed();
    }));
    let drag = false;
    const move = (ev) => { const p = svgPt(svg, ev); st.px = Math.max(-6, Math.min(6, Math.round(((p.x / W0) * 16) - 8))); st.py = Math.max(-6, Math.min(6, Math.round(8 - (p.y / W0) * 16))); draw(); changed(); };
    svg.addEventListener("pointerdown", (ev) => { drag = true; svg.setPointerCapture(ev.pointerId); move(ev); });
    svg.addEventListener("pointermove", (ev) => { if (drag) move(ev); });
    svg.addEventListener("pointerup", () => { drag = false; });
    bind(el, st, draw, changed); draw();
    return () => S;
  });
})();
