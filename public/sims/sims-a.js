// Konu anlatımı simülasyonları (grup a: 1. ve 2. sınıf). LESSONS.registerSim ile kaydolur; lessons.js değişmez.
// Her sim (el, cfg, changed) alır, çizer ve durum döndüren bir fonksiyon verir. Renkler yalnız CSS değişkenleriyle.
(() => {
  if (!window.LESSONS) return;
  const NS = "http://www.w3.org/2000/svg";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const S = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.appendChild(e); return e; };
  const T = (parent, x, y, txt, cls = "sa-t", extra = {}) => { const t = S("text", { x, y, class: cls, ...extra }, parent); t.textContent = txt; return t; };
  const reg = (k, fn) => window.LESSONS.registerSim(k, fn);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const btn = (label, act, o = {}) => `<button type="button" class="btn btn-outline btn-small${o.cls ? " " + o.cls : ""}" data-a="${esc(act)}"${o.aria ? ` aria-label="${esc(o.aria)}"` : ""}${o.pressed !== undefined ? ` aria-pressed="${o.pressed}"` : ""}${o.dis ? " disabled" : ""}>${label}</button>`;
  // [data-a] düğmelerini bağlar; yeniden çizimden sonra odağı aynı düğmeye geri verir.
  function wire(el, handler) {
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.a, root = b.closest(".lp-sim") || el; handler(a);
      const f = [...root.querySelectorAll("[data-a]")].find((x) => x.dataset.a === a);
      if (f && !f.disabled) f.focus();
    }));
  }
  const tapKey = (node, fn) => { node.addEventListener("click", fn); node.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); fn(); } }); };
  const BIR = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
  const ON = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
  const ORD = ["birinci", "ikinci", "üçüncü", "dördüncü", "beşinci", "altıncı", "yedinci", "sekizinci", "dokuzuncu", "onuncu"];
  const yazi = (n) => (n === 0 ? "sıfır" : n === 100 ? "yüz" : `${ON[Math.floor(n / 10)]}${n % 10 ? (n >= 10 ? " " : "") + BIR[n % 10] : ""}`);
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const css = `
.sa-c0{fill:var(--brand)}.sa-c1{fill:var(--good)}.sa-c2{fill:var(--warn)}.sa-c3{fill:var(--bad)}
.sa-cell{fill:var(--bg-soft);stroke:var(--line);stroke-width:2}
.sa-tap{cursor:pointer}.sa-tap:hover{fill:var(--brand-soft)}
.sa-np{pointer-events:none}
.sa-t{fill:var(--ink);font:500 15px var(--font);text-anchor:middle}
.sa-tl{fill:var(--ink);font:500 15px var(--font);text-anchor:start}
.sa-tb{fill:var(--ink);font:700 22px var(--font);text-anchor:middle}
.sa-tm{fill:var(--muted);font:500 13px var(--font);text-anchor:middle}
.sa-on{fill:var(--on-brand);font:700 14px var(--font);text-anchor:middle;pointer-events:none}
.sa-ln{stroke:var(--ink);stroke-width:2;fill:none}
.sa-dash{stroke:var(--muted);stroke-width:2;stroke-dasharray:5 5;fill:none}
.sa-axis{stroke:var(--ink);stroke-width:2.5}
.sa-arc{stroke:var(--brand);stroke-width:2.5;fill:none}
.sa-ring{fill:none;stroke:var(--bad);stroke-width:3}
.sa-sel{fill:none;stroke:var(--brand);stroke-width:4}
.sa-ctrl{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.sa-ctrl .btn[aria-pressed="true"]{background:var(--brand);color:var(--on-brand);border-color:var(--brand)}
.sa-out{margin:0;font-size:15px}.sa-out b{font-size:18px}
.sa-good{color:var(--good);font-weight:600}.sa-bad{color:var(--bad);font-weight:600}
.sa-card{fill:var(--surface);stroke:var(--line);stroke-width:2;cursor:pointer}
.sa-item:hover .sa-card{stroke:var(--brand)}
.sa-pic{cursor:pointer}.sa-pic:hover .sa-shape{stroke-width:4}.sa-pic.on .sa-shape{stroke-width:5}.sa-pic:focus-visible .sa-shape{stroke-width:6}
.sa-chk{fill:var(--surface);stroke:var(--ink);stroke-width:2;pointer-events:none}.sa-chkm{fill:none;stroke:var(--good);stroke-width:3.5;pointer-events:none}
.sa-item.on .sa-card{fill:var(--brand-soft);stroke:var(--brand);stroke-width:4}
.sa-item:focus{outline:none}.sa-item:focus-visible .sa-card{stroke:var(--ink);stroke-width:4}
.sa-shape{stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
.sa-f{fill:var(--brand);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
.sa-fs{fill:var(--brand-soft);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
.sa-g{cursor:pointer}.sa-g:focus{outline:none}.sa-g:focus-visible .sa-cell{stroke:var(--ink);stroke-width:3}
.sa-gon{fill:var(--brand)}
.sa-fix{fill:var(--muted)}
.sa-wall{fill:var(--good);opacity:.75}
.sa-goal{fill:var(--good-soft);stroke:var(--good);stroke-width:3}
.sa-trail{stroke:var(--brand);stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round;opacity:.55}
.sa-water{fill:var(--good);opacity:.55}
.sa-jug{fill:none;stroke:var(--ink);stroke-width:3}
.sa-plate{fill:var(--bg-soft);stroke:var(--line);stroke-width:2}
.sa-sort{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.sa-sort .sa-nk{min-width:64px;min-height:56px;font:700 22px var(--font);border-radius:10px;border:2px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer}
.sa-sort .sa-nk[aria-pressed="true"]{border-color:var(--brand);background:var(--brand-soft)}
.sa-sort .sa-rel{font:700 20px var(--font);color:var(--muted);min-width:18px;text-align:center}
.sa-sort .sa-rel.ok{color:var(--good)}.sa-sort .sa-rel.no{color:var(--bad)}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ---------- Onluk çerçeve: 20'ye kadar sayaç; iki renkle sayıyı parçalara ayırma ----------
  reg("a-cerceve", (el, cfg, changed) => {
    const max = cfg.max ?? 20, two = !!cfg.renk2, fixed = !!cfg.fixed, ad = cfg.adlar || ["Kahverengi", "Yeşil"];
    let a = cfg.a ?? cfg.n ?? 0, b = cfg.b ?? 0;
    function draw() {
      const n = a + b, frames = max > 10 ? 2 : 1;
      el.innerHTML = `<div class="sa-box"></div>${fixed ? "" : `<div class="sa-ctrl">${two
        ? `${btn("−", "a-", { aria: `${ad[0]} çıkar`, dis: a <= 0 })}<span>${esc(ad[0])}</span>${btn("+", "a+", { aria: `${ad[0]} ekle`, dis: n >= max })}<span style="width:12px"></span>${btn("−", "b-", { aria: `${ad[1]} çıkar`, dis: b <= 0 })}<span>${esc(ad[1])}</span>${btn("+", "b+", { aria: `${ad[1]} ekle`, dis: n >= max })}`
        : `${btn("− 1", "a-", { aria: "Bir sayaç çıkar", dis: a <= 0 })}${btn("+ 1", "a+", { aria: "Bir sayaç ekle", dis: n >= max })}`}</div>`}
        <p class="sa-out"></p>`;
      const svg = S("svg", { viewBox: `0 0 ${frames * 300 + (frames - 1) * 20 + 4} 126`, class: "sim-svg", role: "img", "aria-label": `Onluk çerçevede ${n} sayaç` });
      for (let f = 0; f < frames; f++) for (let i = 0; i < 10; i++) {
        const idx = f * 10 + i, x = 2 + f * 320 + (i % 5) * 60, y = 2 + Math.floor(i / 5) * 60;
        const cell = S("rect", { x, y, width: 60, height: 60, class: "sa-cell" + (!fixed && !two ? " sa-tap" : "") }, svg);
        if (!fixed && !two) cell.addEventListener("click", () => { a = a === idx + 1 ? idx : idx + 1; draw(); changed(); });
        if (idx < n) S("circle", { cx: x + 30, cy: y + 30, r: 21, class: (idx < a ? "sa-c0" : "sa-c1") + " sa-np" }, svg);
      }
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-out").innerHTML = `<b class="num">${n}</b> (${yazi(n)})${n > 10 ? ` · 10 ve ${n - 10}` : n === 10 ? " · tam bir onluk" : ""}${two ? ` · ${a} + ${b} = ${n}` : ""}`;
      wire(el, (k) => { if (k === "a+") a++; else if (k === "a-") a--; else if (k === "b+") b++; else if (k === "b-") b--; draw(); changed(); });
    }
    draw();
    return () => ({ n: a + b, a, b });
  });

  // ---------- Bire bir eşleme ile iki çokluğu karşılaştırma ----------
  reg("a-karsilastir", (el, cfg, changed) => {
    const max = cfg.max ?? 10, ad = cfg.adlar || ["Birinci", "İkinci"];
    let a = cfg.a ?? 5, b = cfg.b ?? 3;
    const fa = cfg.sabitA ?? true, fb = cfg.sabitB ?? false;
    function draw() {
      const W = 130 + max * 46;
      el.innerHTML = `<div class="sa-box"></div><div class="sa-ctrl">${fa ? "" : `${btn("−", "a-", { aria: `${ad[0]} azalt`, dis: a <= 0 })}<span>${esc(ad[0])}</span>${btn("+", "a+", { aria: `${ad[0]} artır`, dis: a >= max })}`}
        ${fb ? "" : `${btn("−", "b-", { aria: `${ad[1]} azalt`, dis: b <= 0 })}<span>${esc(ad[1])}</span>${btn("+", "b+", { aria: `${ad[1]} artır`, dis: b >= max })}`}</div><p class="sa-out"></p>`;
      const svg = S("svg", { viewBox: `0 0 ${W} 150`, class: "sim-svg", role: "img", "aria-label": `${ad[0]} ${a}, ${ad[1]} ${b}` });
      const X = (i) => 140 + i * 46;
      for (let i = 0; i < Math.min(a, b); i++) S("line", { x1: X(i), y1: 46, x2: X(i), y2: 104, class: "sa-dash" }, svg);
      T(svg, 8, 36, `${ad[0]}`, "sa-tl"); T(svg, 8, 125, `${ad[1]}`, "sa-tl");
      for (let i = 0; i < a; i++) { S("circle", { cx: X(i), cy: 30, r: 17, class: "sa-c0" }, svg); if (i >= b) S("circle", { cx: X(i), cy: 30, r: 21, class: "sa-ring" }, svg); }
      for (let i = 0; i < b; i++) { S("rect", { x: X(i) - 16, y: 104, width: 32, height: 32, rx: 6, class: "sa-c1" }, svg); if (i >= a) S("rect", { x: X(i) - 20, y: 100, width: 40, height: 40, rx: 8, class: "sa-ring" }, svg); }
      el.querySelector(".sa-box").replaceChildren(svg);
      const d = Math.abs(a - b);
      el.querySelector(".sa-out").innerHTML = `${esc(ad[0])}: <b class="num">${a}</b> · ${esc(ad[1])}: <b class="num">${b}</b> · ${a === b ? `<span class="sa-good">Eşit! Hepsi eşleşti.</span>` : `${esc(a > b ? ad[0] : ad[1])} daha çok, ${esc(a > b ? ad[1] : ad[0])} daha az (${d} fazla).`}`;
      wire(el, (k) => { if (k === "a+") a++; else if (k === "a-") a--; else if (k === "b+") b++; else if (k === "b-") b--; draw(); changed(); });
    }
    draw();
    return () => ({ a, b, fark: a - b, esit: a === b ? 1 : 0 });
  });

  // ---------- Sıra sayıları: bitiş çizgisine doğru koşan çocuklar ----------
  reg("a-sira", (el, cfg, changed) => {
    const n = cfg.n ?? 7, right = cfg.yon === "sag";
    let sel = 0;
    el.innerHTML = `<div class="sa-box"></div><p class="sa-out"></p>`;
    const W = 120 + n * 72;
    function draw() {
      const svg = S("svg", { viewBox: `0 0 ${W} 170`, class: "sim-svg", role: "group", "aria-label": "Koşu sırası" });
      const fx = right ? W - 40 : 40;
      S("line", { x1: fx, y1: 20, x2: fx, y2: 150, class: "sa-ln" }, svg);
      for (let k = 0; k < 6; k++) S("rect", { x: right ? fx : fx - 16, y: 20 + k * 10, width: 16, height: 10, class: k % 2 ? "sa-cell" : "sa-c0" }, svg);
      T(svg, fx, 166, "Bitiş", "sa-tm");
      for (let i = 0; i < n; i++) {
        const cx = right ? W - 110 - i * 72 : 110 + i * 72;
        const g = S("g", { class: "sa-g", tabindex: 0, role: "button", "aria-pressed": sel === i + 1, "aria-label": `Koşucu ${i + 1}` }, svg);
        S("rect", { x: cx - 30, y: 30, width: 60, height: 120, rx: 10, class: "sa-cell" }, g);
        S("circle", { cx, cy: 58, r: 14, class: `sa-c${i % 4}` }, g);
        S("rect", { x: cx - 14, y: 76, width: 28, height: 44, rx: 8, class: `sa-c${i % 4}` }, g);
        S("line", { x1: cx - 8, y1: 120, x2: cx - 14, y2: 142, class: "sa-ln" }, g); S("line", { x1: cx + 8, y1: 120, x2: cx + 14, y2: 142, class: "sa-ln" }, g);
        if (sel === i + 1) { S("rect", { x: cx - 32, y: 28, width: 64, height: 124, rx: 12, class: "sa-sel" }, g); T(g, cx, 22, `${i + 1}.`, "sa-tb"); }
        tapKey(g, () => { sel = sel === i + 1 ? 0 : i + 1; draw(); changed(); el.querySelectorAll(".sa-g")[i]?.focus(); });
      }
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-out").innerHTML = sel ? `Seçtiğin koşucu <b>${sel}.</b> sırada (${ORD[sel - 1] || sel + "."}). Sondan ${n - sel + 1}. sırada.` : "Bir koşucuya dokun. Sıra, bitiş çizgisine en yakın olandan başlar.";
    }
    draw();
    return () => ({ sec: sel, sondan: sel ? n - sel + 1 : 0 });
  });

  // ---------- Sayı doğrusunda sekme: ritmik sayma, zihinden toplama/çıkarma, tekrarlı toplama ----------
  reg("a-sekme", (el, cfg, changed) => {
    const min = cfg.min ?? 0, max = cfg.max ?? 20, steps = cfg.adimlar || [cfg.adim ?? 1];
    let pos = cfg.start ?? min, step = cfg.adim ?? steps[0], ileri = 0, geri = 0;
    let hist = [];
    const back = cfg.geri !== false, fwd = cfg.ileri !== false;
    const W = 680, L = 30, R = W - 30, Y = 120;
    const X = (v) => L + ((v - min) / (max - min)) * (R - L);
    const span = max - min, lab = span <= 30 ? 1 : span <= 60 ? 5 : 10;
    function draw() {
      el.innerHTML = `<div class="sa-box"></div><div class="sa-ctrl">${steps.length > 1 ? `<span>Adım:</span>${steps.map((s) => btn(String(s), "s" + s, { pressed: s === step })).join("")}<span style="width:8px"></span>` : ""}
        ${back ? btn(`Geri sek (−${step})`, "geri", { dis: pos - step < min }) : ""}${fwd ? btn(`İleri sek (+${step})`, "ileri", { dis: pos + step > max }) : ""}${btn("Baştan", "bas", { dis: !hist.length })}</div><p class="sa-out"></p>`;
      const svg = S("svg", { viewBox: `0 0 ${W} 170`, class: "sim-svg", role: "img", "aria-label": `Sayı doğrusu, şu an ${pos}` });
      S("line", { x1: L - 12, y1: Y, x2: R + 12, y2: Y, class: "sa-axis" }, svg);
      const seen = new Set([cfg.start ?? min, ...hist.map((h) => h[1])]);
      for (let v = min; v <= max; v++) {
        const big = v % lab === 0;
        if (span <= 100) S("line", { x1: X(v), y1: Y - (big ? 10 : 5), x2: X(v), y2: Y + (big ? 10 : 5), class: "sa-axis", "stroke-width": big ? 2 : 1 }, svg);
        if (big || seen.has(v)) T(svg, X(v), Y + 30, v, seen.has(v) ? "sa-t" : "sa-tm", seen.has(v) ? { "font-weight": 700 } : {});
      }
      for (const v of cfg.isaret || []) S("circle", { cx: X(v), cy: Y, r: 6, class: "sa-c2" }, svg);
      hist.forEach(([a, b], i) => {
        const h = Math.min(70, 16 + Math.abs(X(b) - X(a)) * 0.45), mx = (X(a) + X(b)) / 2;
        S("path", { d: `M${X(a)},${Y - 4} Q${mx},${Y - 4 - 2 * h} ${X(b)},${Y - 4}`, class: "sa-arc" }, svg);
        if (i >= hist.length - 8) T(svg, mx, Y - 10 - h, `${b > a ? "+" : "−"}${Math.abs(b - a)}`, "sa-tm");
      });
      S("circle", { cx: X(pos), cy: Y, r: 11, class: "nl-knob" }, svg);
      el.querySelector(".sa-box").replaceChildren(svg);
      const seq = [cfg.start ?? min, ...hist.map((h) => h[1])];
      el.querySelector(".sa-out").innerHTML = `Şu an: <b class="num">${pos}</b>${seq.length > 1 ? ` · Söylediğin sayılar: ${seq.slice(-14).join(", ")}` : ""}`;
      wire(el, (k) => {
        if (k === "ileri") { hist.push([pos, pos + step]); pos += step; ileri++; }
        else if (k === "geri") { hist.push([pos, pos - step]); pos -= step; geri++; }
        else if (k === "bas") { pos = cfg.start ?? min; hist = []; ileri = 0; geri = 0; }
        else if (k[0] === "s") step = +k.slice(1);
        draw(); changed();
      });
    }
    draw();
    return () => ({ pos, step, ileri, geri, jumps: ileri + geri });
  });

  // ---------- Nesne sayısını tahmin: bilinen bir grupla karşılaştır, sonra say ----------
  reg("a-tahmin", (el, cfg, changed) => {
    const n = cfg.n ?? 17, max = cfg.max ?? 20, ref = cfg.ref ?? 5;
    let tahmin = cfg.tahmin ?? 0, acik = 0;
    const r = rng(cfg.seed ?? 7), W = 640, H = 240, pts = [];
    const box = { x: 8, y: 8, w: 150, h: 100 };
    for (let i = 0; i < ref; i++) pts.push([box.x + 26 + (i % 3) * 48, box.y + 30 + Math.floor(i / 3) * 44]);
    let guard = 0;
    while (pts.length < n && guard++ < 20000) {
      const p = [20 + r() * (W - 40), 20 + r() * (H - 40)];
      if (p[0] < box.x + box.w + 18 && p[1] < box.y + box.h + 18) continue;
      if (pts.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > 34)) pts.push(p);
    }
    el.innerHTML = `<div class="sa-box"></div><label class="sim-slider"><span>Tahminim: <b class="sa-tv"></b></span><input type="range" min="0" max="${max}" step="1" value="${tahmin}"></label><div class="sa-ctrl"></div><p class="sa-out"></p>`;
    const inp = el.querySelector("input");
    inp.addEventListener("input", () => { tahmin = +inp.value; draw(); changed(); });
    function draw() {
      const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": acik ? `${n} nesne` : "Sayısı tahmin edilecek nesneler" });
      S("rect", { x: box.x, y: box.y, width: box.w, height: box.h, rx: 10, class: "sa-dash" }, svg);
      T(svg, box.x + box.w / 2, box.y + box.h + 16, `Bu kutuda ${ref} tane var`, "sa-tm");
      pts.forEach(([x, y], i) => { S("circle", { cx: x, cy: y, r: 14, class: "sa-c0" }, svg); if (acik) T(svg, x, y + 5, i + 1, "sa-on"); });
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-tv").textContent = tahmin;
      inp.disabled = !!acik;
      el.querySelector(".sa-ctrl").innerHTML = acik ? btn("Gizle, yeniden tahmin et", "gizle") : btn("Sayarak kontrol et", "say");
      const d = Math.abs(tahmin - n);
      el.querySelector(".sa-out").innerHTML = acik ? `Saydık: <b class="num">${n}</b> tane. Tahminin ${tahmin}, fark ${d}. ${d <= 3 ? `<span class="sa-good">Çok iyi bir tahmin!</span>` : "Kutudaki grubu ölçü al: o büyüklükte kaç grup var?"}` : "Önce saymadan tahmin et, kaydırıcıyı ayarla.";
      wire(el.querySelector(".sa-ctrl"), (k) => { acik = k === "say" ? 1 : 0; draw(); changed(); });
    }
    draw();
    return () => ({ tahmin, acik, fark: Math.abs(tahmin - n), n });
  });

  // ---------- Eşitlik terazisi: iki taraftaki işlemlerin değeri aynıysa terazi dengededir ----------
  reg("a-esitlik", (el, cfg, changed) => {
    const sol = cfg.sol || [3, 4], sag = cfg.sag || [5, null], so = cfg.solOp || "+", sgo = cfg.sagOp || "+";
    const vmin = cfg.min ?? 0, vmax = cfg.max ?? 20;
    let v = cfg.v ?? vmin;
    const val = (arr, op) => { const a = arr.map((x) => (x === null ? v : x)); if (a.length === 1) return a[0]; return op === "+" ? a[0] + a[1] : op === "−" ? a[0] - a[1] : op === "×" ? a[0] * a[1] : a[1] ? a[0] / a[1] : NaN; };
    const ex = (arr, op) => arr.map((x) => (x === null ? `[${v}]` : x)).join(` ${op} `);
    function draw() {
      const Lv = val(sol, so), Rv = val(sag, sgo), eq = Math.abs(Lv - Rv) < 1e-9;
      el.innerHTML = `<div class="sa-box"></div><div class="sa-ctrl"><span>Kutudaki sayı:</span>${btn("−", "m", { aria: "Kutudaki sayıyı azalt", dis: v <= vmin })}<b class="num" style="font-size:20px;min-width:28px;text-align:center">${v}</b>${btn("+", "p", { aria: "Kutudaki sayıyı artır", dis: v >= vmax })}</div><p class="sa-out"></p>`;
      const svg = S("svg", { viewBox: "0 0 640 270", class: "sim-svg", role: "img", "aria-label": `${ex(sol, so)} ve ${ex(sag, sgo)}` });
      const ang = eq ? 0 : clamp((Rv - Lv) * 2, -10, 10) * (Math.PI / 180);
      S("polygon", { points: "300,262 340,262 320,110", class: "sa-fix" }, svg);
      const ex1 = 320 - 220 * Math.cos(ang), ey1 = 110 - 220 * Math.sin(ang), ex2 = 320 + 220 * Math.cos(ang), ey2 = 110 + 220 * Math.sin(ang);
      S("line", { x1: ex1, y1: ey1, x2: ex2, y2: ey2, class: "sa-ln", "stroke-width": 6 }, svg);
      S("circle", { cx: 320, cy: 110, r: 7, class: "sa-c0" }, svg);
      const pan = (cx, cy, arr, op, value) => {
        S("line", { x1: cx, y1: cy, x2: cx, y2: cy + 26, class: "sa-ln" }, svg);
        S("rect", { x: cx - 95, y: cy + 26, width: 190, height: 8, rx: 4, class: "sa-fix" }, svg);
        const dots = Math.min(40, Math.max(0, Math.round(value)) || 0);
        for (let i = 0; i < dots; i++) S("circle", { cx: cx - 81 + (i % 10) * 18, cy: cy + 18 - Math.floor(i / 10) * 16, r: 6.5, class: "sa-c1" }, svg);
        const txt = arr.map((x) => (x === null ? "□" : x)).join(` ${op} `);
        S("rect", { x: cx - 80, y: cy - 82, width: 160, height: 40, rx: 8, class: "sa-cell" }, svg);
        T(svg, cx, cy - 54, txt.replace("□", v), "sa-tb");
      };
      pan(ex1, ey1, sol, so, Lv); pan(ex2, ey2, sag, sgo, Rv);
      T(svg, 320, 28, eq ? "=" : "≠", "sa-tb", { "font-size": 34 });
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-out").innerHTML = `Sol: ${ex(sol, so).replace(/[[\]]/g, "")} = <b class="num">${Lv}</b> · Sağ: ${ex(sag, sgo).replace(/[[\]]/g, "")} = <b class="num">${Rv}</b> · ${eq ? `<span class="sa-good">Terazi dengede, iki taraf eşit.</span>` : `${Lv > Rv ? "Sol" : "Sağ"} taraf daha ağır, eşit değil.`}`;
      wire(el, (k) => { v += k === "p" ? 1 : -1; draw(); changed(); });
    }
    draw();
    return () => { const Lv = val(sol, so), Rv = val(sag, sgo); return { v, sol: Lv, sag: Rv, esit: Math.abs(Lv - Rv) < 1e-9 ? 1 : 0 }; };
  });

  // ---------- Parça–bütün: bir bütün iki parçaya ayrılır; dört işlem ailesi ----------
  reg("a-parca-butun", (el, cfg, changed) => {
    const maxB = cfg.maxButun ?? 20, sabit = cfg.butunSabit ?? true;
    const s = { c: cfg.butun ?? 10, a: cfg.a ?? 3 };
    el.innerHTML = `<div class="sa-box"></div><div class="sa-sl"></div><p class="sa-out"></p>`;
    function sliders() {
      el.querySelector(".sa-sl").innerHTML = `${sabit ? "" : `<label class="sim-slider"><span>Bütün: <b>${s.c}</b></span><input type="range" min="1" max="${maxB}" step="1" value="${s.c}" data-k="c"></label>`}
        <label class="sim-slider"><span>Birinci parça: <b>${s.a}</b></span><input type="range" min="0" max="${s.c}" step="1" value="${s.a}" data-k="a"></label>`;
      el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { s[i.dataset.k] = +i.value; s.a = Math.min(s.a, s.c); sliders(); draw(); changed(); el.querySelector(`input[data-k="${i.dataset.k}"]`).focus(); }));
    }
    function draw() {
      const { a, c } = s, b = c - a, u = 600 / maxB;
      const svg = S("svg", { viewBox: "0 0 640 150", class: "sim-svg", role: "img", "aria-label": `${c} bütün, ${a} ve ${b} parçalar` });
      for (let i = 0; i < c; i++) S("rect", { x: 20 + i * u, y: 14, width: u, height: 40, class: "sa-cell" }, svg);
      S("rect", { x: 20, y: 14, width: c * u, height: 40, rx: 4, class: "sa-dash", style: "stroke:var(--ink);stroke-dasharray:none" }, svg);
      T(svg, 20 + (c * u) / 2, 41, `Bütün: ${c}`, "sa-t", { "font-weight": 700 });
      for (let i = 0; i < c; i++) S("rect", { x: 20 + i * u + 1, y: 74, width: u - 2, height: 40, rx: 3, class: i < a ? "sa-c0" : "sa-c1" }, svg);
      if (a) T(svg, 20 + (a * u) / 2, 134, `${a}`, "sa-tb");
      if (b) T(svg, 20 + a * u + (b * u) / 2, 134, `${b}`, "sa-tb");
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-out").innerHTML = `<b>${a} + ${b} = ${c}</b> · <b>${b} + ${a} = ${c}</b> · <b>${c} − ${a} = ${b}</b> · <b>${c} − ${b} = ${a}</b>`;
    }
    sliders(); draw();
    return () => ({ a: s.a, b: s.c - s.a, c: s.c });
  });

  // ---------- Standart olmayan birimle uzunluk ölçme ----------
  reg("a-uzunluk", (el, cfg, changed) => {
    const nesne = cfg.nesne || "Kalem", boy = cfg.boy ?? 12, units = cfg.birimler || [{ ad: "ataş", uz: 3 }, { ad: "silgi", uz: 4 }];
    let ui = 0, cnt = 0;
    const px = 560 / Math.max(boy + Math.max(...units.map((x) => x.uz)), 1);
    function draw() {
      const u = units[ui], sum = cnt * u.uz;
      el.innerHTML = `<div class="sa-box"></div><div class="sa-ctrl">${units.length > 1 ? `<span>Birim:</span>${units.map((x, i) => btn(esc(x.ad), "u" + i, { pressed: i === ui })).join("")}<span style="width:8px"></span>` : ""}
        ${btn("− çıkar", "m", { dis: !cnt })}${btn(`+ 1 ${esc(u.ad)} koy`, "p", { dis: sum >= boy + u.uz * 2 })}</div><p class="sa-out"></p>`;
      const svg = S("svg", { viewBox: "0 0 640 150", class: "sim-svg", role: "img", "aria-label": `${nesne} ve ${cnt} ${u.ad}` });
      const x0 = 30;
      S("line", { x1: x0, y1: 10, x2: x0, y2: 140, class: "sa-dash" }, svg);
      S("line", { x1: x0 + boy * px, y1: 10, x2: x0 + boy * px, y2: 140, class: "sa-dash" }, svg);
      S("rect", { x: x0, y: 30, width: boy * px - 26, height: 30, rx: 5, class: "sa-c2" }, svg);
      S("polygon", { points: `${x0 + boy * px - 26},30 ${x0 + boy * px},45 ${x0 + boy * px - 26},60`, class: "sa-fs" }, svg);
      T(svg, x0 + (boy * px) / 2, 22, nesne, "sa-tm");
      for (let i = 0; i < cnt; i++) {
        const x = x0 + i * u.uz * px, w = u.uz * px;
        S("rect", { x: x + 1, y: 84, width: w - 2, height: 26, rx: ui % 2 ? 4 : 13, class: ui % 2 ? "sa-c1" : "sa-c0", "fill-opacity": 0.85 }, svg);
        if (ui % 2 === 0) S("rect", { x: x + 7, y: 90, width: w - 14, height: 14, rx: 7, class: "sa-cell" }, svg);
        T(svg, x + w / 2, 128, i + 1, "sa-tm");
      }
      el.querySelector(".sa-box").replaceChildren(svg);
      let msg;
      if (!cnt) msg = `${esc(nesne)} kaç ${esc(u.ad)} boyunda? Birimleri uç uca, boşluk bırakmadan koy.`;
      else if (sum === boy) msg = `<span class="sa-good">${esc(nesne)} tam ${cnt} ${esc(u.ad)} boyunda.</span>`;
      else if (sum < boy) msg = `${cnt} ${esc(u.ad)} koydun; henüz ${esc(nesne.toLowerCase())} bitmedi.`;
      else if ((cnt - 1) * u.uz < boy) msg = `${esc(nesne)} ${cnt - 1} ile ${cnt} ${esc(u.ad)} arasında: yaklaşık ${Math.abs(boy - (cnt - 1) * u.uz) < Math.abs(sum - boy) ? cnt - 1 : cnt} ${esc(u.ad)}.`;
      else msg = `Fazla koydun, birimler ${esc(nesne.toLowerCase())} geçti.`;
      el.querySelector(".sa-out").innerHTML = msg;
      wire(el, (k) => { if (k === "p") cnt++; else if (k === "m") cnt--; else if (k[0] === "u") { ui = +k.slice(1); cnt = 0; } draw(); changed(); });
    }
    draw();
    return () => { const u = units[ui], sum = cnt * u.uz; return { sayi: cnt, birim: ui, tam: sum === boy ? 1 : 0, kapladi: sum >= boy && (cnt - 1) * u.uz < boy ? 1 : 0 }; };
  });

  // ---------- Eşit kollu terazi: nesneyi birim ağırlıklarla dengele ----------
  reg("a-kefe", (el, cfg, changed) => {
    const list = cfg.nesneler || [{ ad: "Elma", w: 6 }], birim = cfg.birim || "küp", max = cfg.max ?? 15;
    let oi = 0, n = 0, tahmin = cfg.tahmin ? 0 : null;
    function draw() {
      const o = list[oi], eq = n === o.w;
      el.innerHTML = `<div class="sa-box"></div>${tahmin !== null ? `<label class="sim-slider"><span>Tahminim: <b>${tahmin}</b> ${esc(birim)}</span><input type="range" min="0" max="${max}" step="1" value="${tahmin}"></label>` : ""}
        <div class="sa-ctrl">${list.length > 1 ? `${list.map((x, i) => btn(esc(x.ad), "o" + i, { pressed: i === oi })).join("")}<span style="width:8px"></span>` : ""}${btn("− 1", "m", { aria: `Bir ${birim} çıkar`, dis: !n })}${btn(`+ 1 ${esc(birim)}`, "p", { dis: n >= max })}</div><p class="sa-out"></p>`;
      const svg = S("svg", { viewBox: "0 0 640 250", class: "sim-svg", role: "img", "aria-label": `Terazi: ${o.ad} ve ${n} ${birim}` });
      const ang = eq ? 0 : clamp((n - o.w) * 2.5, -9, 9) * (Math.PI / 180);
      S("polygon", { points: "300,244 340,244 320,90", class: "sa-fix" }, svg);
      const x1 = 320 - 200 * Math.cos(ang), y1 = 90 - 200 * Math.sin(ang), x2 = 320 + 200 * Math.cos(ang), y2 = 90 + 200 * Math.sin(ang);
      S("line", { x1, y1, x2, y2, class: "sa-ln", "stroke-width": 6 }, svg);
      S("circle", { cx: 320, cy: 90, r: 7, class: "sa-c0" }, svg);
      [[x1, y1], [x2, y2]].forEach(([x, y]) => { S("line", { x1: x, y1: y, x2: x, y2: y + 100, class: "sa-ln" }, svg); S("path", { d: `M${x - 80},${y + 100} Q${x},${y + 135} ${x + 80},${y + 100} Z`, class: "sa-fix" }, svg); });
      S("circle", { cx: x1, cy: y1 + 70, r: 30, class: "sa-c3" }, svg); T(svg, x1, y1 + 76, o.ad, "sa-on");
      for (let i = 0; i < n; i++) S("rect", { x: x2 - 70 + (i % 6) * 24, y: y2 + 76 - Math.floor(i / 6) * 24, width: 22, height: 22, rx: 3, class: "sa-c0" }, svg);
      if (eq) T(svg, 320, 30, "Dengede", "sa-tb");
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-out").innerHTML = eq ? `<span class="sa-good">Kefeler dengede: ${esc(o.ad)} ${o.w} ${esc(birim)} ağırlığında.</span>${tahmin !== null ? ` Tahminin ${tahmin}, fark ${Math.abs(tahmin - o.w)}.` : ""}` : `${n} ${esc(birim)} koydun. ${n < o.w ? `${esc(o.ad)} tarafı daha ağır, aşağıda.` : `${esc(birim)} tarafı daha ağır.`}`;
      el.querySelector("input")?.addEventListener("input", (e) => { tahmin = +e.target.value; e.target.previousElementSibling.querySelector("b").textContent = tahmin; changed(); });
      wire(el.querySelector(".sa-ctrl"), (k) => { if (k === "p") n++; else if (k === "m") n--; else if (k[0] === "o") { oi = +k.slice(1); n = 0; } draw(); changed(); });
    }
    draw();
    return () => ({ n, denge: n === list[oi].w ? 1 : 0, nesne: oi, tahmin: tahmin ?? -1 });
  });

  // ---------- Sıvı ölçme: kabı bardakla doldur ----------
  reg("a-sivi", (el, cfg, changed) => {
    const kap = cfg.kap || "Sürahi", cap = cfg.kapasite ?? 8, ol = cfg.olcekler || [{ ad: "bardak", v: 1 }];
    let oi = 0, cnt = 0, tahmin = cfg.tahmin ? 0 : null;
    function draw() {
      const o = ol[oi], poured = cnt * o.v, full = poured === cap, over = poured > cap;
      el.innerHTML = `<div class="sa-box"></div>${tahmin !== null ? `<label class="sim-slider"><span>Tahminim: <b>${tahmin}</b> ${esc(o.ad)}</span><input type="range" min="0" max="${Math.ceil(cap / Math.min(...ol.map((x) => x.v))) + 4}" step="1" value="${tahmin}"></label>` : ""}
        <div class="sa-ctrl">${ol.length > 1 ? `<span>Ölçek:</span>${ol.map((x, i) => btn(esc(x.ad), "o" + i, { pressed: i === oi })).join("")}<span style="width:8px"></span>` : ""}${btn(`1 ${esc(o.ad)} dök`, "p", { dis: over })}${btn("Boşalt", "z", { dis: !cnt })}</div><p class="sa-out"></p>`;
      const svg = S("svg", { viewBox: "0 0 640 240", class: "sim-svg", role: "img", "aria-label": `${kap}, ${cnt} ${o.ad} su` });
      const jx = 330, jw = 160, jy = 30, jh = 190, lvl = Math.min(1, poured / cap);
      S("rect", { x: jx, y: jy + jh * (1 - lvl), width: jw, height: jh * lvl, class: "sa-water" }, svg);
      if (over) S("path", { d: `M${jx + jw},${jy} q14,30 6,70 q-4,40 10,90`, class: "sa-arc", style: "stroke:var(--good)" }, svg);
      S("path", { d: `M${jx},${jy} L${jx},${jy + jh} L${jx + jw},${jy + jh} L${jx + jw},${jy}`, class: "sa-jug" }, svg);
      S("path", { d: `M${jx + jw},${jy + 30} q40,10 40,60 q0,50 -40,60`, class: "sa-jug" }, svg);
      T(svg, jx + jw / 2, jy - 10, kap, "sa-tm");
      const gw = 28 + o.v * 8, gh = 30 + o.v * 14;
      S("path", { d: `M${110 - gw / 2},${200 - gh} L${110 - gw / 2 + 5},200 L${110 + gw / 2 - 5},200 L${110 + gw / 2},${200 - gh}`, class: "sa-jug" }, svg);
      S("rect", { x: 110 - gw / 2 + 4, y: 200 - gh * 0.8, width: gw - 8, height: gh * 0.8 - 2, class: "sa-water" }, svg);
      T(svg, 110, 225, `1 ${o.ad}`, "sa-tm");
      T(svg, 220, 120, `× ${cnt}`, "sa-tb");
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-out").innerHTML = full ? `<span class="sa-good">${esc(kap)} doldu: ${cnt} ${esc(o.ad)} su aldı.</span>${tahmin !== null ? ` Tahminin ${tahmin}, fark ${Math.abs(tahmin - cnt)}.` : ""}` : over ? `<span class="sa-bad">Taştı!</span> ${esc(kap)} ${cnt} ${esc(o.ad)} sudan az alıyor. Boşaltıp yeniden dene.` : `${cnt} ${esc(o.ad)} döktün.`;
      el.querySelector("input")?.addEventListener("input", (e) => { tahmin = +e.target.value; e.target.previousElementSibling.querySelector("b").textContent = tahmin; changed(); });
      wire(el.querySelector(".sa-ctrl"), (k) => { if (k === "p") cnt++; else if (k === "z") cnt = 0; else if (k[0] === "o") { oi = +k.slice(1); cnt = 0; } draw(); changed(); });
    }
    draw();
    return () => { const p = cnt * ol[oi].v; return { sayi: cnt, dolu: p === cap ? 1 : 0, tasti: p > cap ? 1 : 0, olcek: oi, tahmin: tahmin ?? -1 }; };
  });

  // ---------- Çizim kütüphanesi: düzlem şekilleri ve cisim simgeleri (100×100 kutu) ----------
  const reg_poly = (k, r = 40, rot = -90) => [...Array(k)].map((_, i) => { const a = ((rot + (i * 360) / k) * Math.PI) / 180; return [50 + r * Math.cos(a), 52 + r * Math.sin(a)]; });
  const SHAPES = {
    ucgen: (it) => ({ es: [[50, 12], [92, 84], [8, 84]], dik: [[16, 14], [16, 86], [84, 86]], genis: [[4, 72], [96, 72], [30, 34]], ince: [[50, 6], [70, 92], [30, 92]] })[it.v || "es"],
    kare: () => [[20, 20], [80, 20], [80, 80], [20, 80]],
    dikdortgen: (it) => { const w = it.w ?? 84, h = it.h ?? 44; return [[50 - w / 2, 50 - h / 2], [50 + w / 2, 50 - h / 2], [50 + w / 2, 50 + h / 2], [50 - w / 2, 50 + h / 2]]; },
    besgen: () => reg_poly(5), altigen: () => reg_poly(6, 40, 0),
    yildiz: () => [...Array(10)].map((_, i) => { const a = ((-90 + i * 36) * Math.PI) / 180, r = i % 2 ? 18 : 42; return [50 + r * Math.cos(a), 54 + r * Math.sin(a)]; }),
  };
  const COLS = ["sa-c0", "sa-c1", "sa-c2", "sa-c3"];
  function drawCisim(g, name, cls = "sa-f") {
    const P = (pts) => S("polygon", { points: pts.map((p) => p.join(",")).join(" "), class: cls }, g);
    if (name === "kup" || name === "prizma" || name === "kare-prizma") {
      const [w, h, d] = name === "kup" ? [44, 44, 22] : name === "prizma" ? [62, 30, 20] : [36, 64, 18];
      const x = 50 - (w + d) / 2, y = 50 + (h - d) / 2 + d / 2 - h / 2;
      P([[x, y + d], [x + w, y + d], [x + w, y + d + h], [x, y + d + h]]);
      P([[x, y + d], [x + d, y], [x + d + w, y], [x + w, y + d]]).setAttribute("class", "sa-fs");
      P([[x + w, y + d], [x + w + d, y], [x + w + d, y + h], [x + w, y + d + h]]);
    } else if (name === "ucgen-prizma") {
      P([[14, 80], [44, 80], [29, 40]]); P([[44, 80], [86, 66], [71, 26], [29, 40]]).setAttribute("class", "sa-fs");
    } else if (name === "silindir") {
      S("path", { d: "M24,26 L24,78 A26,9 0 0 0 76,78 L76,26 Z", class: cls }, g); S("ellipse", { cx: 50, cy: 26, rx: 26, ry: 9, class: "sa-fs" }, g);
    } else if (name === "koni") {
      S("path", { d: "M50,12 L22,78 A28,9 0 0 0 78,78 Z", class: cls }, g);
    } else if (name === "kure") {
      S("circle", { cx: 50, cy: 50, r: 34, class: cls }, g); S("ellipse", { cx: 50, cy: 50, rx: 34, ry: 10, class: "sa-dash" }, g);
    } else if (name === "piramit") {
      P([[20, 74], [62, 82], [50, 16]]); P([[62, 82], [82, 66], [50, 16]]).setAttribute("class", "sa-fs");
    }
  }
  function drawItem(g, it) {
    let cx = 50, cy = 50;
    const base = it.pts || (it.s && SHAPES[it.s]?.(it));
    if (base) { cx = base.reduce((a, q) => a + q[0], 0) / base.length; cy = base.reduce((a, q) => a + q[1], 0) / base.length; }
    const t = `translate(50 50) scale(${it.b || 1}) translate(${-cx} ${-cy}) rotate(${it.r || 0} ${cx} ${cy})`;
    const gg = S("g", { transform: t, class: "sa-np" }, g);
    const cls = `sa-shape ${COLS[(it.c ?? 0) % 4]}`;
    if (it.yazi) return;
    if (it.kat) return it.kat.forEach((k) => {
      const c = k.c === "bos" ? "sa-shape sa-cell" : `sa-shape ${COLS[(k.c ?? 0) % 4]}`;
      if (k.daire) S("circle", { cx: k.daire[0], cy: k.daire[1], r: k.daire[2], class: c }, gg);
      else if (k.d) S("path", { d: k.d, class: c }, gg);
      else S("polygon", { points: k.pts.map((q) => q.join(",")).join(" "), class: c }, gg);
    });
    if (it.cisim) return drawCisim(gg, it.cisim);
    if (it.s === "daire") return S("circle", { cx: 50, cy: 50, r: 36, class: cls }, gg);
    if (it.s === "kalp") return S("path", { d: "M50,86 C14,60 10,38 22,26 C34,14 48,22 50,34 C52,22 66,14 78,26 C90,38 86,60 50,86 Z", class: cls }, gg);
    if (it.d) return S("path", { d: it.d, class: cls }, gg);
    const pts = it.pts || SHAPES[it.s]?.(it);
    if (pts) S("polygon", { points: pts.map((p) => p.join(",")).join(" "), class: cls }, gg);
  }

  // ---------- Seçme etkinliği: kurala uyan şekil, cisim ya da kartlara dokun ----------
  reg("a-sec", (el, cfg, changed) => {
    const items = cfg.items || [], cols = cfg.cols ?? 4, C = cfg.hucre ?? 120, hedef = [].concat(cfg.hedef);
    const isT = (it) => hedef.includes(it.k);
    const on = new Set();
    el.innerHTML = `<div class="sa-box"></div><p class="sa-out"></p>`;
    const rows = Math.ceil(items.length / cols);
    function drawPic() {
      const [W, H] = cfg.resim;
      const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "group", "aria-label": cfg.soru || "Resim" });
      items.forEach((it, i) => {
        const g = S("g", { class: `sa-item sa-pic${on.has(i) ? " on" : ""}`, tabindex: 0, role: "checkbox", "aria-checked": on.has(i), "aria-label": it.ad || `${i + 1}. parça` }, svg);
        const cls = `sa-shape ${COLS[(it.c ?? i) % 4]}`;
        let cx, cy;
        if (it.daire) { S("circle", { cx: it.daire[0], cy: it.daire[1], r: it.daire[2], class: cls }, g); [cx, cy] = it.daire; }
        else { S("polygon", { points: it.pts.map((q) => q.join(",")).join(" "), class: cls }, g); cx = it.pts.reduce((a, q) => a + q[0], 0) / it.pts.length; cy = it.pts.reduce((a, q) => a + q[1], 0) / it.pts.length; }
        if (on.has(i)) { S("circle", { cx, cy, r: 11, class: "sa-chk" }, g); S("path", { d: `M${cx - 5},${cy} l4,4 l7,-8`, class: "sa-chkm" }, g); }
        tapKey(g, () => { on.has(i) ? on.delete(i) : on.add(i); draw(); changed(); el.querySelectorAll(".sa-item")[i]?.focus(); });
      });
      return svg;
    }
    function draw() {
      if (cfg.resim) { el.querySelector(".sa-box").replaceChildren(drawPic()); return out(); }
      const svg = S("svg", { viewBox: `0 0 ${cols * C} ${rows * C}`, class: "sim-svg", style: `max-width:${cols * 150}px`, role: "group", "aria-label": cfg.soru || "Seçilecek şekiller" });
      items.forEach((it, i) => {
        const g = S("g", { class: `sa-item${on.has(i) ? " on" : ""}`, transform: `translate(${(i % cols) * C + (C - 110) / 2} ${Math.floor(i / cols) * C + (C - 110) / 2})`, tabindex: 0, role: "checkbox", "aria-checked": on.has(i), "aria-label": it.ad || it.yazi || `${i + 1}. şekil` }, svg);
        S("rect", { x: 1, y: 1, width: 108, height: 108, rx: 12, class: "sa-card" }, g);
        const inner = S("g", { transform: "translate(5 5)" }, g);
        drawItem(inner, it);
        if (it.yazi) { const words = it.yazi.split(" "), lines = []; words.forEach((w) => { const l = lines[lines.length - 1]; if (l && (l + " " + w).length <= 10) lines[lines.length - 1] = l + " " + w; else lines.push(w); }); lines.forEach((l, j) => T(g, 55, 61 - (lines.length - 1) * 11 + j * 22, l, "sa-t", { class: "sa-t sa-np", "font-size": l.length > 8 ? 15 : 17 })); }
        if (it.alt) T(g, 55, 104, it.alt, "sa-tm", { class: "sa-tm sa-np" });
        tapKey(g, () => { on.has(i) ? on.delete(i) : on.add(i); draw(); changed(); el.querySelectorAll(".sa-item")[i]?.focus(); });
      });
      el.querySelector(".sa-box").replaceChildren(svg);
      out();
    }
    function out() {
      const s = state();
      el.querySelector(".sa-out").innerHTML = s.tamam ? `<span class="sa-good">Hepsini doğru buldun!</span>` : on.size ? `${on.size} tane seçtin.${s.dogru === s.toplam && s.yanlis ? " Kurala uymayan bir seçimin var." : ""}` : "Kurala uyanlara dokun; yanlış seçtiğine yeniden dokunursan seçim kalkar.";
    }
    const state = () => { let d = 0, y = 0; on.forEach((i) => (isT(items[i]) ? d++ : y++)); const tot = items.filter(isT).length; return { dogru: d, yanlis: y, toplam: tot, secili: on.size, tamam: d === tot && !y ? 1 : 0 }; };
    draw();
    return state;
  });

  // ---------- Yön bulma: ızgarada adım adım hedefe git ----------
  reg("a-yon", (el, cfg, changed) => {
    const w = cfg.w ?? 6, h = cfg.h ?? 5, Cs = 64, start = cfg.start || [0, 0], goal = cfg.hedef || [w - 1, h - 1];
    const walls = new Set((cfg.engeller || []).map((p) => p.join(",")));
    let p = [...start], path = [[...start]], moves = [], msg = "";
    const D = { sag: [1, 0, "sağa"], sol: [-1, 0, "sola"], yukari: [0, 1, "yukarı"], asagi: [0, -1, "aşağı"] };
    const X = (x) => 4 + x * Cs, Y = (y) => 4 + (h - 1 - y) * Cs;
    el.innerHTML = `<div class="sa-box"></div><div class="sa-ctrl">${btn("← Sol", "sol")}${btn("↑ Yukarı", "yukari")}${btn("↓ Aşağı", "asagi")}${btn("Sağ →", "sag")}${btn("Geri al", "geri")}${btn("Baştan", "bas")}</div><p class="sa-out"></p>`;
    const svg = S("svg", { viewBox: `0 0 ${w * Cs + 8} ${h * Cs + 8}`, class: "sim-svg", style: `max-width:${(w * Cs + 8) * 1.4}px;margin:0 auto`, role: "application", tabindex: 0, "aria-label": "Yön ızgarası; ok tuşlarıyla yürü" });
    el.querySelector(".sa-box").replaceChildren(svg);
    const go = (k) => {
      msg = "";
      if (k === "geri") { if (moves.length) { moves.pop(); path.pop(); p = [...path[path.length - 1]]; } }
      else if (k === "bas") { p = [...start]; path = [[...start]]; moves = []; }
      else { const [dx, dy] = D[k], q = [p[0] + dx, p[1] + dy]; if (q[0] < 0 || q[1] < 0 || q[0] >= w || q[1] >= h) msg = "Izgaranın dışına çıkamazsın."; else if (walls.has(q.join(","))) msg = "Orada engel var, başka yoldan git."; else { p = q; path.push([...q]); moves.push(k); } }
      draw(); changed();
    };
    function draw() {
      svg.replaceChildren();
      for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) S("rect", { x: X(x), y: Y(y), width: Cs, height: Cs, class: "sa-cell" }, svg);
      walls.forEach((k) => { const [x, y] = k.split(",").map(Number); S("rect", { x: X(x) + 8, y: Y(y) + 8, width: Cs - 16, height: Cs - 16, rx: 14, class: "sa-wall" }, svg); });
      S("rect", { x: X(goal[0]) + 4, y: Y(goal[1]) + 4, width: Cs - 8, height: Cs - 8, rx: 8, class: "sa-goal" }, svg);
      for (const [x, y, ad] of cfg.yerler || []) T(svg, X(x) + Cs / 2, Y(y) + Cs / 2 + 5, ad, "sa-tm", { "font-size": 12 });
      S("polyline", { points: path.map(([x, y]) => `${X(x) + Cs / 2},${Y(y) + Cs / 2}`).join(" "), class: "sa-trail" }, svg);
      S("circle", { cx: X(p[0]) + Cs / 2, cy: Y(p[1]) + Cs / 2, r: 20, class: "sa-c0" }, svg);
      S("circle", { cx: X(p[0]) + Cs / 2 - 7, cy: Y(p[1]) + Cs / 2 - 4, r: 3.5, style: "fill:var(--surface)" }, svg);
      S("circle", { cx: X(p[0]) + Cs / 2 + 7, cy: Y(p[1]) + Cs / 2 - 4, r: 3.5, style: "fill:var(--surface)" }, svg);
      const groups = []; moves.forEach((m) => { const l = groups[groups.length - 1]; if (l && l[0] === m) l[1]++; else groups.push([m, 1]); });
      const at = p[0] === goal[0] && p[1] === goal[1];
      el.querySelector(".sa-out").innerHTML = `${msg ? `<span class="sa-bad">${msg}</span> ` : ""}${groups.length ? `Yönerge: ${groups.map(([m, c]) => `${c} adım ${D[m][2]}`).join(", ")} · ` : ""}Adım sayısı: <b class="num">${moves.length}</b>${at ? ` · <span class="sa-good">Hedefe ulaştın!</span>` : ""}`;
    }
    wire(el.querySelector(".sa-ctrl"), go);
    svg.addEventListener("keydown", (e) => { const k = { ArrowRight: "sag", ArrowLeft: "sol", ArrowUp: "yukari", ArrowDown: "asagi" }[e.key]; if (k) { e.preventDefault(); go(k); } });
    draw();
    return () => ({ x: p[0], y: p[1], ulasti: p[0] === goal[0] && p[1] === goal[1] ? 1 : 0, adim: moves.length });
  });

  // ---------- Simetri: aynanın öbür yanını tamamla ----------
  reg("a-simetri", (el, cfg, changed) => {
    const w = cfg.w ?? 8, h = cfg.h ?? 6, Cs = 44, half = w / 2;
    const left = new Set((cfg.sol || []).map((p) => p.join(",")));
    const want = new Set([...left].map((k) => { const [x, y] = k.split(",").map(Number); return `${w - 1 - x},${y}`; }));
    const on = new Set((cfg.sag || []).map((p) => p.join(",")));
    el.innerHTML = `<div class="sa-box"></div><p class="sa-out"></p>`;
    function draw() {
      const svg = S("svg", { viewBox: `0 0 ${w * Cs + 8} ${h * Cs + 8}`, class: "sim-svg", style: `max-width:${(w * Cs + 8) * 1.4}px;margin:0 auto`, role: "group", "aria-label": "Simetri ızgarası" });
      for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
        const k = `${x},${y}`, fx = 4 + x * Cs, fy = 4 + y * Cs;
        if (x < half) S("rect", { x: fx, y: fy, width: Cs, height: Cs, class: left.has(k) ? "sa-cell sa-c0" : "sa-cell" }, svg);
        else {
          const g = S("g", { class: "sa-g", tabindex: 0, role: "checkbox", "aria-checked": on.has(k), "aria-label": `Sağ yarı, ${y + 1}. satır ${x - half + 1}. sütun` }, svg);
          S("rect", { x: fx, y: fy, width: Cs, height: Cs, class: on.has(k) ? "sa-cell sa-gon" : "sa-cell sa-tap" }, g);
          tapKey(g, () => { on.has(k) ? on.delete(k) : on.add(k); draw(); changed(); [...el.querySelectorAll(".sa-g")].find((n) => n.getAttribute("aria-label").endsWith(`${y + 1}. satır ${x - half + 1}. sütun`))?.focus(); });
        }
      }
      S("line", { x1: 4 + half * Cs, y1: 0, x2: 4 + half * Cs, y2: h * Cs + 8, class: "sa-ln", "stroke-width": 4, "stroke-dasharray": "10 6", style: "stroke:var(--bad)" }, svg);
      el.querySelector(".sa-box").replaceChildren(svg);
      const s = state();
      el.querySelector(".sa-out").innerHTML = s.tamam ? `<span class="sa-good">Şekil simetrik oldu! İki yarı, kesikli doğruya göre birbirinin aynadaki görüntüsü.</span>` : `Boyadığın: ${on.size} kare. Her karenin ayna çizgisine uzaklığı, karşılığıyla aynı olmalı.`;
    }
    const state = () => { let d = 0, y = 0; on.forEach((k) => (want.has(k) ? d++ : y++)); return { dogru: d, yanlis: y, eksik: want.size - d, tamam: d === want.size && !y ? 1 : 0 }; };
    draw();
    return state;
  });

  // ---------- Geometrik cisimler: döndür, büyüt; özellikler değişmez ----------
  const SOL = {
    kup: { ad: "Küp", box: [1, 1, 1] },
    "kare-prizma": { ad: "Kare prizma", box: [0.8, 1.6, 0.8] },
    prizma: { ad: "Dikdörtgen prizma", box: [1.6, 0.9, 0.8] },
    "ucgen-prizma": { ad: "Üçgen prizma" }, piramit: { ad: "Kare piramit" },
    silindir: { ad: "Silindir" }, koni: { ad: "Koni" }, kure: { ad: "Küre" },
  };
  const INFO = {
    kup: [6, 0, 8, "Hayır, kayar."], "kare-prizma": [6, 0, 8, "Hayır, kayar."], prizma: [6, 0, 8, "Hayır, kayar."], "ucgen-prizma": [5, 0, 6, "Hayır, kayar."], piramit: [5, 0, 5, "Hayır, kayar."],
    silindir: [2, 1, 0, "Evet, yan yatırınca yuvarlanır."], koni: [1, 1, 0, "Yan yatırınca kendi çevresinde döner."], kure: [0, 1, 0, "Evet, her yöne yuvarlanır."],
  };
  function polyOf(k) {
    if (SOL[k].box) { const [a, b, c] = SOL[k].box.map((v) => v / 2); const V = [[-a, -b, -c], [a, -b, -c], [a, b, -c], [-a, b, -c], [-a, -b, c], [a, -b, c], [a, b, c], [-a, b, c]]; return { V, F: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]] }; }
    if (k === "ucgen-prizma") { const V = [[-0.6, -0.5, -0.7], [0.6, -0.5, -0.7], [0, 0.55, -0.7], [-0.6, -0.5, 0.7], [0.6, -0.5, 0.7], [0, 0.55, 0.7]]; return { V, F: [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]] }; }
    const V = [[-0.6, -0.5, -0.6], [0.6, -0.5, -0.6], [0.6, -0.5, 0.6], [-0.6, -0.5, 0.6], [0, 0.7, 0]]; return { V, F: [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]] };
  }
  reg("a-cisim", (el, cfg, changed) => {
    const list = (cfg.secenek || Object.keys(SOL)).filter((k) => SOL[k]);
    let ci = Math.max(0, list.indexOf(cfg.cisim)), aci = cfg.aci ?? 30, boyut = cfg.boyut ?? 1;
    const pitch = (22 * Math.PI) / 180;
    el.innerHTML = `<div class="plane-wrap"><div class="sa-box"></div><div class="plane-ctrl"><div class="sa-ctrl sa-pick"></div><p class="eq sa-name"></p><p class="slope sa-info"></p>
      <label class="sim-slider"><span>Döndür: <b class="sa-av"></b>°</span><input type="range" min="0" max="360" step="15" value="${aci}" data-k="aci"></label>
      <label class="sim-slider"><span>Büyüt: <b class="sa-bv"></b> kat</span><input type="range" min="1" max="2" step="0.25" value="${boyut}" data-k="boyut"></label></div></div>`;
    el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { if (i.dataset.k === "aci") aci = +i.value; else boyut = +i.value; draw(); changed(); }));
    function pick() {
      const host = el.querySelector(".sa-pick");
      host.innerHTML = list.length > 1 ? list.map((k, i) => btn(SOL[k].ad, "c" + i, { pressed: i === ci })).join("") : "";
      wire(host, (k) => { ci = +k.slice(1); pick(); draw(); changed(); });
    }
    function draw() {
      const k = list[ci], th = (aci * Math.PI) / 180, s = 80 * boyut, cx = 160, cy = 150;
      const svg = S("svg", { viewBox: "0 0 320 300", class: "sim-svg", role: "img", "aria-label": `${SOL[k].ad}, ${aci} derece döndürülmüş` });
      const rot = ([x, y, z]) => { const x1 = x * Math.cos(th) + z * Math.sin(th), z1 = -x * Math.sin(th) + z * Math.cos(th); return [x1, y * Math.cos(pitch) - z1 * Math.sin(pitch), y * Math.sin(pitch) + z1 * Math.cos(pitch)]; };
      const scr = ([x, y]) => [cx + x * s, cy - y * s];
      if (SOL[k].box || k === "ucgen-prizma" || k === "piramit") {
        const { V, F } = polyOf(k), R = V.map(rot), C = R.reduce((a, v) => a.map((q, j) => q + v[j] / R.length), [0, 0, 0]);
        const faces = F.map((f) => {
          const [a, b, c] = f.map((i) => R[i]), u = b.map((q, j) => q - a[j]), v = c.map((q, j) => q - a[j]);
          let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
          const fc = f.reduce((acc, i) => acc.map((q, j) => q + R[i][j] / f.length), [0, 0, 0]);
          if (n.reduce((sum, q, j) => sum + q * (fc[j] - C[j]), 0) < 0) n = n.map((q) => -q);
          const len = Math.hypot(...n) || 1; n = n.map((q) => q / len);
          return { f, vis: n[2] > 1e-6, lt: 0.35 + 0.55 * Math.max(0, -0.35 * n[0] + 0.75 * n[1] + 0.55 * n[2]) };
        });
        faces.filter((x) => !x.vis).forEach(({ f }) => S("polygon", { points: f.map((i) => scr(R[i]).join(",")).join(" "), class: "sa-dash" }, svg));
        faces.filter((x) => x.vis).forEach(({ f, lt }) => S("polygon", { points: f.map((i) => scr(R[i]).join(",")).join(" "), class: "sa-f", "fill-opacity": lt.toFixed(2) }, svg));
      } else {
        const r = 0.6 * s, ry = r * Math.sin(pitch);
        if (k === "kure") {
          S("circle", { cx, cy, r: r * 1.15, class: "sa-f", "fill-opacity": 0.7 }, svg);
          S("ellipse", { cx, cy, rx: r * 1.15, ry: r * 1.15 * Math.sin(pitch), class: "sa-dash" }, svg);
          S("ellipse", { cx, cy, rx: Math.abs(r * 1.15 * Math.sin(th)), ry: r * 1.15, class: "sa-dash" }, svg);
        } else {
          const top = cy - 0.6 * s, bot = cy + 0.6 * s;
          S("path", { d: `M${cx - r},${bot} A${r},${ry} 0 0 1 ${cx + r},${bot}`, class: "sa-dash" }, svg);
          if (k === "silindir") {
            S("path", { d: `M${cx - r},${top} L${cx - r},${bot} A${r},${ry} 0 0 0 ${cx + r},${bot} L${cx + r},${top} Z`, class: "sa-f", "fill-opacity": 0.75 }, svg);
            S("ellipse", { cx, cy: top, rx: r, ry, class: "sa-fs" }, svg);
          } else S("path", { d: `M${cx},${top} L${cx - r},${bot} A${r},${ry} 0 0 0 ${cx + r},${bot} Z`, class: "sa-f", "fill-opacity": 0.75 }, svg);
          if (Math.cos(th) > 0) { const sx = cx + r * Math.sin(th), by = bot + ry * Math.cos(th); S("line", { x1: k === "koni" ? cx : sx, y1: k === "koni" ? top : top + ry * Math.cos(th), x2: sx, y2: by, class: "sa-ln", "stroke-dasharray": "3 4" }, svg); }
        }
      }
      el.querySelector(".sa-box").replaceChildren(svg);
      const [duz, egri, kose, yuv] = INFO[k];
      el.querySelector(".sa-name").textContent = SOL[k].ad;
      const poly = !egri;
      el.querySelector(".sa-info").innerHTML = `${poly ? `Yüz: <b>${duz}</b> · Köşe: <b>${kose}</b> · Ayrıt: <b>${duz + kose - 2}</b>` : `Düz yüz: <b>${duz}</b> · Eğri yüz: <b>${egri}</b>`}<br>Yuvarlanır mı? ${yuv}`;
      el.querySelector(".sa-av").textContent = aci; el.querySelector(".sa-bv").textContent = String(boyut).replace(".", ",");
    }
    pick(); draw();
    return () => { const [duz, egri, kose] = INFO[list[ci]]; return { cisim: ci, aci, boyut, duz, egri, kose }; };
  });

  // ---------- Kule kurma: hangi cisimlerin üstüne başka cisim konabilir? ----------
  reg("a-kule", (el, cfg, changed) => {
    const TY = { kup: ["Küp", 1, 60, 60], silindir: ["Silindir", 2, 56, 60], prizma: ["Dikdörtgen prizma", 3, 120, 40], koni: ["Koni", 4, 64, 66], kure: ["Küre", 5, 58, 58] };
    const max = cfg.max ?? 7;
    let stack = [], red = 0, msg = "";
    function draw() {
      const top = stack[stack.length - 1];
      el.innerHTML = `<div class="sa-box"></div><div class="sa-ctrl">${Object.keys(TY).map((k) => btn(`+ ${TY[k][0]}`, k, { dis: stack.length >= max })).join("")}${btn("Geri al", "geri", { dis: !stack.length })}${btn("Baştan", "bas", { dis: !stack.length })}</div><p class="sa-out"></p>`;
      const total = stack.reduce((s, k) => s + TY[k][3], 0), sc = Math.min(1, 280 / Math.max(total, 1));
      const svg = S("svg", { viewBox: "0 0 400 320", class: "sim-svg", style: "max-width:480px;margin:0 auto", role: "img", "aria-label": `Kule: ${stack.map((k) => TY[k][0]).join(", ") || "boş"}` });
      S("line", { x1: 20, y1: 306, x2: 380, y2: 306, class: "sa-ln", "stroke-width": 4 }, svg);
      let y = 306;
      stack.forEach((k, i) => {
        const [, , w0, h0] = TY[k], w = w0 * sc, h = h0 * sc, x = 200 - w / 2;
        const cls = `sa-shape ${COLS[i % 4]}`;
        if (k === "kup" || k === "prizma") S("rect", { x, y: y - h, width: w, height: h, rx: 3, class: cls }, svg);
        else if (k === "silindir") { S("rect", { x, y: y - h + 6 * sc, width: w, height: h - 6 * sc, class: cls }, svg); S("ellipse", { cx: 200, cy: y - h + 6 * sc, rx: w / 2, ry: 6 * sc, class: cls, "fill-opacity": 0.6 }, svg); }
        else if (k === "koni") S("polygon", { points: `${x},${y} ${x + w},${y} 200,${y - h}`, class: cls }, svg);
        else S("circle", { cx: 200, cy: y - h / 2, r: h / 2, class: cls }, svg);
        y -= h;
      });
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-out").innerHTML = `${msg ? `<span class="sa-bad">${msg}</span> ` : ""}Kulede <b class="num">${stack.length}</b> parça var.${top === "koni" || top === "kure" ? " Tepede artık başka parça duramaz." : ""}`;
      wire(el.querySelector(".sa-ctrl"), (k) => {
        msg = "";
        const t = stack[stack.length - 1];
        if (k === "geri") stack.pop(); else if (k === "bas") { stack = []; }
        else if (t === "koni") { red++; msg = "Koninin sivri ucunda hiçbir şey durmaz, düştü!"; }
        else if (t === "kure") { red++; msg = "Kürenin düz yüzü yok; üstüne konan yuvarlanıp düştü!"; }
        else stack.push(k);
        draw(); changed();
      });
    }
    draw();
    return () => ({ yukseklik: stack.length, tepe: stack.length ? TY[stack[stack.length - 1]][1] : 0, red });
  });

  // ---------- Çetele ve nesne grafiği: kategorik veri ----------
  reg("a-cetele", (el, cfg, changed) => {
    const cats = cfg.kategoriler || ["A", "B", "C"], max = cfg.max ?? 10, fixed = !!cfg.sabit;
    const series = [{ ad: cfg.birinciAd || "", v: [...(cfg.degerler || cats.map(() => 0))] }];
    if (cfg.ikinci) series.push({ ad: cfg.ikinci.ad, v: [...cfg.ikinci.degerler] });
    el.innerHTML = `<div class="sa-box"></div><p class="sa-out"></p>`;
    const RH = 40, two = series.length > 1;
    function draw() {
      const H = 34 + cats.length * RH * series.length + (cats.length - 1) * 8 + (two ? 22 : 0);
      const svg = S("svg", { viewBox: `0 0 530 ${H}`, class: "sim-svg", role: "group", "aria-label": "Çetele tablosu ve nesne grafiği" });
      let y = 4;
      if (two) { series.forEach((s, si) => { S("circle", { cx: 100 + si * 130, cy: y + 9, r: 8, class: COLS[si] }, svg); T(svg, 114 + si * 130, y + 15, s.ad, "sa-tl"); }); y += 22; }
      T(svg, 135, y + 14, "Çetele", "sa-tm"); T(svg, 212, y + 14, "Sayı", "sa-tm"); T(svg, 330, y + 14, "Nesne grafiği", "sa-tm");
      y += 22;
      cats.forEach((c, ci) => {
        series.forEach((s, si) => {
          const v = s.v[ci];
          if (si === 0) T(svg, 4, y + 27 + (two ? RH / 2 : 0), c, "sa-tl", { "font-weight": 600, "font-size": 18 });
          S("rect", { x: 86, y: y + 4, width: 440, height: RH - 6, rx: 6, class: "sa-cell", style: "stroke:none" }, svg);
          if (two) S("circle", { cx: 94, cy: y + RH / 2 + 1, r: 5, class: COLS[si] }, svg);
          for (let i = 0; i < v; i++) {
            const g = Math.floor(i / 5), j = i % 5, gx = 104 + g * 44;
            if (j < 4) S("line", { x1: gx + j * 8, y1: y + 10, x2: gx + j * 8, y2: y + RH - 8, class: "sa-ln" }, svg);
            else S("line", { x1: gx - 4, y1: y + RH - 12, x2: gx + 28, y2: y + 12, class: "sa-ln" }, svg);
          }
          T(svg, 212, y + 27, v, "sa-tb", { "font-size": 20 });
          for (let i = 0; i < v; i++) S("circle", { cx: 242 + i * 19, cy: y + RH / 2 + 1, r: 8, class: COLS[si === 0 ? 0 : 1] }, svg);
          if (!fixed) [["−", 466, -1], ["+", 504, 1]].forEach(([t, x, d]) => {
            const g = S("g", { class: "sa-g", tabindex: 0, role: "button", "aria-label": `${c}${two ? " " + s.ad : ""} ${d > 0 ? "bir artır" : "bir azalt"}` }, svg);
            S("rect", { x: x - 16, y: y + 5, width: 32, height: RH - 8, rx: 6, class: "sa-cell sa-tap" }, g);
            T(g, x, y + 27, t, "sa-tb", { class: "sa-tb sa-np", "font-size": 20 });
            tapKey(g, () => { s.v[ci] = clamp(s.v[ci] + d, 0, max); draw(); changed(); [...el.querySelectorAll(".sa-g")].find((n) => n.getAttribute("aria-label") === g.getAttribute("aria-label"))?.focus(); });
          });
          y += RH;
        });
        y += 8;
      });
      el.querySelector(".sa-box").replaceChildren(svg);
      const sum = (s) => s.v.reduce((a, b) => a + b, 0);
      const tot = cats.map((_, i) => series.reduce((a, s) => a + s.v[i], 0)), mx = Math.max(...tot), mn = Math.min(...tot);
      const names = (val) => cats.filter((_, i) => tot[i] === val).join(" ve ");
      el.querySelector(".sa-out").innerHTML = `${two ? series.map((s) => `${esc(s.ad)}: <b class="num">${sum(s)}</b>`).join(" · ") + " · " : ""}Toplam: <b class="num">${tot.reduce((a, b) => a + b, 0)}</b>${mx > 0 ? ` · En çok: ${esc(names(mx))} (${mx}) · En az: ${esc(names(mn))} (${mn})` : ""}`;
    }
    draw();
    return () => {
      const out = {}, tot = cats.map((_, i) => series.reduce((a, s) => a + s.v[i], 0)), mx = Math.max(...tot), mn = Math.min(...tot);
      series[0].v.forEach((v, i) => (out["c" + i] = v)); if (series[1]) series[1].v.forEach((v, i) => (out["d" + i] = v));
      return { ...out, toplam: tot.reduce((a, b) => a + b, 0), enCok: tot.filter((t) => t === mx).length === 1 ? tot.indexOf(mx) : -1, enAz: tot.filter((t) => t === mn).length === 1 ? tot.indexOf(mn) : -1 };
    };
  });

  // ---------- Eşit paylaştırma: bölme ----------
  reg("a-paylastir", (el, cfg, changed) => {
    const fixed = !!cfg.sabit, maxT = cfg.max ?? 20, maxG = cfg.maxGrup ?? 5;
    const s = { toplam: cfg.toplam ?? 12, grup: cfg.grup ?? 3 };
    let tur = 0;
    el.innerHTML = `<div class="sa-box"></div>${fixed ? "" : `<label class="sim-slider"><span>Nesne sayısı: <b data-v="toplam"></b></span><input type="range" min="1" max="${maxT}" step="1" value="${s.toplam}" data-k="toplam"></label><label class="sim-slider"><span>Tabak sayısı: <b data-v="grup"></b></span><input type="range" min="1" max="${maxG}" step="1" value="${s.grup}" data-k="grup"></label>`}<div class="sa-ctrl"></div><p class="sa-out"></p>`;
    el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { s[i.dataset.k] = +i.value; tur = 0; draw(); changed(); }));
    function draw() {
      const kalan = s.toplam - tur * s.grup, bitti = kalan < s.grup;
      el.querySelectorAll("[data-v]").forEach((b) => (b.textContent = s[b.dataset.v]));
      const svg = S("svg", { viewBox: "0 0 640 250", class: "sim-svg", role: "img", "aria-label": `${s.toplam} nesne, ${s.grup} tabak` });
      T(svg, 14, 20, "Dağıtılacaklar", "sa-tl", { "font-size": 13 });
      for (let i = 0; i < kalan; i++) S("circle", { cx: 26 + (i % 20) * 30, cy: 42 + Math.floor(i / 20) * 28, r: 11, class: "sa-c0" }, svg);
      const pw = Math.min(150, 600 / s.grup - 10);
      for (let g = 0; g < s.grup; g++) {
        const cx = 20 + (600 / s.grup) * (g + 0.5);
        S("ellipse", { cx, cy: 180, rx: pw / 2, ry: 50, class: "sa-plate" }, svg);
        const per = Math.max(1, Math.floor((pw - 20) / 22));
        for (let i = 0; i < tur; i++) S("circle", { cx: cx - ((Math.min(tur, per) - 1) * 22) / 2 + (i % per) * 22, cy: 166 + Math.floor(i / per) * 22, r: 9, class: "sa-c1" }, svg);
        T(svg, cx, 246, `${tur}`, "sa-tm");
      }
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-ctrl").innerHTML = btn("Her tabağa 1 dağıt", "bir", { dis: bitti }) + btn("Hepsini dağıt", "hep", { dis: bitti }) + btn("Baştan", "bas", { dis: !tur });
      const cik = tur ? `${s.toplam}${` − ${s.grup}`.repeat(tur)} = ${kalan}` : "";
      el.querySelector(".sa-out").innerHTML = bitti ? `<span class="sa-good">${s.toplam} ÷ ${s.grup} = ${tur}</span>: her tabakta ${tur} tane${kalan ? `, ${kalan} tane arttı` : ", hiç artmadı"}.<br>${cik}` : `${tur ? `${tur}. turdan sonra her tabakta ${tur} tane. ${cik}` : "Nesneleri tabaklara birer birer, eşit dağıt."}`;
      wire(el.querySelector(".sa-ctrl"), (k) => { if (k === "bir") tur++; else if (k === "hep") tur = Math.floor(s.toplam / s.grup); else tur = 0; draw(); changed(); });
    }
    draw();
    return () => { const kalan = s.toplam - tur * s.grup; return { toplam: s.toplam, grup: s.grup, her: tur, kalan, bitti: kalan < s.grup ? 1 : 0 }; };
  });

  // ---------- Sayıları sıralama: iki karta dokunarak yer değiştir ----------
  reg("a-sirala", (el, cfg, changed) => {
    const nums = [...(cfg.sayilar || [47, 12, 85, 30])], az = cfg.yon === "azalan";
    let sel = -1, swaps = 0;
    const good = (a, b) => (az ? a > b : a < b);
    function draw() {
      const ok = nums.every((v, i) => i === 0 || good(nums[i - 1], v));
      el.innerHTML = `<div class="sa-sort" role="group" aria-label="Sayı kartları">${nums.map((v, i) => `${i ? `<span class="sa-rel ${good(nums[i - 1], v) ? "ok" : "no"}" aria-hidden="true">${nums[i - 1] < v ? "<" : nums[i - 1] > v ? ">" : "="}</span>` : ""}<button type="button" class="sa-nk" data-a="k${i}" aria-pressed="${sel === i}">${v}</button>`).join("")}</div>
        <p class="sa-out">${ok ? `<span class="sa-good">Sıralandı: ${nums.join(az ? " > " : " < ")}</span>` : `${az ? "Büyükten küçüğe" : "Küçükten büyüğe"} sırala. Bir karta, sonra yer değiştireceği karta dokun.`}</p>`;
      wire(el, (k) => { const i = +k.slice(1); if (sel < 0) sel = i; else { if (sel !== i) { [nums[sel], nums[i]] = [nums[i], nums[sel]]; swaps++; } sel = -1; } draw(); changed(); });
    }
    draw();
    return () => ({ sirali: nums.every((v, i) => i === 0 || good(nums[i - 1], v)) ? 1 : 0, takas: swaps });
  });
  // ---------- Şekil birleştirme: hareketli parçayı farklı yerlere koy, oluşan şekli gör ----------
  reg("a-birlestir", (el, cfg, changed) => {
    const [gw, gh] = cfg.izgara || [8, 5], Cs = 50, ox = cfg.ox ?? 0, oy = cfg.oy ?? 0, sabit = cfg.sabit || [], ops = cfg.secenekler || [];
    let si = cfg.secim ?? -1;
    const X = (x) => 6 + (x + ox) * Cs, Y = (y) => 6 + (gh - y - oy) * Cs;
    function draw() {
      el.innerHTML = `<div class="sa-box"></div><div class="sa-ctrl"><span>Parçayı koy:</span>${ops.map((o, i) => btn(esc(o.etiket), "o" + i, { pressed: i === si })).join("")}</div><p class="sa-out"></p>`;
      const svg = S("svg", { viewBox: `0 0 ${gw * Cs + 12} ${gh * Cs + 12}`, class: "sim-svg", role: "img", "aria-label": si >= 0 ? ops[si].ad : "Parçalar", style: `max-width:${(gw * Cs + 12) * 1.5}px;margin:0 auto` });
      for (let x = 0; x <= gw; x++) for (let y = 0; y <= gh; y++) S("circle", { cx: 6 + x * Cs, cy: 6 + y * Cs, r: 2.5, class: "sa-fix" }, svg);
      const poly = (pts, cls) => S("polygon", { points: pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(" "), class: cls }, svg);
      sabit.forEach((p) => poly(p, "sa-shape sa-c0"));
      if (si >= 0) { poly(ops[si].pts, "sa-shape sa-c1"); if (ops[si].dis) poly(ops[si].dis, "sa-sel"); }
      el.querySelector(".sa-box").replaceChildren(svg);
      el.querySelector(".sa-out").innerHTML = si >= 0 ? `İki parça birleşince: <b>${esc(ops[si].ad)}</b>` : "Yeşil parçayı nereye koyacağını seç.";
      wire(el.querySelector(".sa-ctrl"), (k) => { si = +k.slice(1); draw(); changed(); });
    }
    draw();
    return () => ({ secim: si });
  });
})();
