// Konu anlatımı simülasyonları (grup e: 8. ve 9. sınıf). LESSONS.registerSim ile kaydolur; lessons.js değişmez.
(() => {
  if (!window.LESSONS) return;
  const reg = window.LESSONS.registerSim;
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  // ---------- Stil (bir kez) ----------
  if (!document.getElementById("se-style")) {
    const css = `
.se-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.se-ctrl { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px 18px; }
.se-tog[aria-pressed="true"] { background: var(--brand); color: var(--on-brand, #fff); border-color: var(--brand); }
.se-info { margin: 0; font-size: 15px; line-height: 1.6; color: var(--ink); }
.se-info .muted, .se-muted { color: var(--muted); }
.se-ok { color: var(--good); font-weight: 600; }
.se-no { color: var(--bad); font-weight: 600; }
.se-big { font: 700 22px var(--font); margin: 0; color: var(--ink); }
.se-t { font: 600 16px var(--font); fill: var(--ink); }
.se-tm { text-anchor: middle; }
.se-te { text-anchor: end; }
.se-s { font: 13px var(--font); fill: var(--muted); }
.se-halo { paint-order: stroke; stroke: var(--surface); stroke-width: 4px; stroke-linejoin: round; }
.se-a { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 2; }
.se-b { fill: var(--good-soft); stroke: var(--good); stroke-width: 2; }
.se-c { fill: var(--warn-soft); stroke: var(--warn); stroke-width: 2; }
.se-x { fill: var(--bad-soft); stroke: var(--bad); stroke-width: 2; stroke-dasharray: 6 4; }
.se-frame { fill: none; stroke: var(--ink); stroke-width: 3; }
.se-line { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; fill: none; }
.se-bline { stroke: var(--brand); stroke-width: 4; stroke-linecap: round; fill: none; }
.se-gline { stroke: var(--good); stroke-width: 4; stroke-linecap: round; fill: none; }
.se-wline { stroke: var(--warn); stroke-width: 4; stroke-linecap: round; fill: none; }
.se-rline { stroke: var(--bad); stroke-width: 4; stroke-linecap: round; fill: none; }
.se-dash { stroke: var(--muted); stroke-width: 2; stroke-dasharray: 6 5; fill: none; }
.se-grid { stroke: var(--line); stroke-width: 1; }
.se-axis { stroke: var(--muted); stroke-width: 2; }
.se-open { fill: var(--surface); stroke: var(--brand); stroke-width: 3; }
.se-closed { fill: var(--brand); stroke: var(--brand); stroke-width: 3; }
.se-dot { fill: var(--brand); stroke: var(--surface); stroke-width: 2; }
.se-dot2 { fill: var(--good); stroke: var(--surface); stroke-width: 2; }
.se-knob { fill: var(--ink); stroke: var(--surface); stroke-width: 3; cursor: grab; }
.se-knob:focus-visible, .se-focus:focus-visible { outline: none; stroke: var(--brand); stroke-width: 4; }
.se-drag { cursor: pointer; }
.se-p0 { fill: var(--brand); } .se-p1 { fill: var(--good); } .se-p2 { fill: var(--warn); } .se-p3 { fill: var(--bad); } .se-p4 { fill: var(--muted); } .se-p5 { fill: var(--brand-strong, var(--brand)); }
.se-pie { stroke: var(--surface); stroke-width: 2; }
.se-ball-k { fill: var(--bad); } .se-ball-y { fill: var(--good); } .se-ball-s { fill: var(--warn); }
.se-bag { fill: var(--bg-soft); stroke: var(--muted); stroke-width: 3; }
.se-sw { display: inline-block; width: 12px; height: 12px; border-radius: 50%; vertical-align: -1px; margin-right: 4px; }
.se-sw.k { background: var(--bad); } .se-sw.y { background: var(--good); } .se-sw.s { background: var(--warn); }
.se-sw.s0 { background: var(--brand); border-radius: 3px; } .se-sw.s1 { background: var(--good); border-radius: 3px; } .se-sw.s2 { background: var(--warn); border-radius: 3px; }
.se-lad { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.se-box { display: grid; justify-items: center; min-width: 56px; padding: 6px 8px; border: 2px solid var(--line); border-radius: 8px; background: var(--surface); }
.se-box small { font-size: 13px; color: var(--muted); }
.se-box b { font-size: 17px; color: var(--ink); }
.se-box.cur { border-color: var(--brand); background: var(--brand-soft); }
.se-arr { font-size: 13px; color: var(--muted); }
.se-digits { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px; font: 700 30px ui-monospace, Menlo, Consolas, monospace; color: var(--ink); }
.se-digits .d { min-width: 26px; text-align: center; border-bottom: 2px solid var(--line); }
.se-digits .d.z { color: var(--muted); }
.se-digits .cm { color: var(--bad); }
.se-digits .pw { font: 700 24px var(--font); margin-left: 10px; }
.se-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.se-chip { min-width: 42px; padding: 6px 8px; border: 2px solid var(--line); border-radius: 8px; text-align: center; font-weight: 600; font-size: 15px; color: var(--muted); background: var(--surface); }
.se-chip.on { border-color: var(--good); background: var(--good-soft); color: var(--good); }
.se-chip.cx { border-color: var(--bad); background: var(--bad-soft); color: var(--bad); }
.se-chip.wit { box-shadow: 0 0 0 3px var(--good); }
.se-reg { cursor: pointer; }
.se-reg:focus-visible { outline: none; stroke: var(--ink); stroke-width: 4; }
.se-r0 { fill: var(--bg-soft); stroke: var(--muted); stroke-width: 2; }
.se-r1 { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 2; }
.se-r2 { fill: var(--warn-soft); stroke: var(--warn); stroke-width: 2; }
.se-r3 { fill: var(--good-soft); stroke: var(--good); stroke-width: 2; }
.se-r4 { fill: var(--surface); stroke: var(--brand); stroke-width: 2; }
.se-card { display: inline-block; font: 700 22px var(--font); padding: 4px 14px; border: 2px solid var(--brand); border-radius: 8px; background: var(--brand-soft); color: var(--ink); }
.se-g6 { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; max-width: 440px; }
.se-g6 .h { display: grid; place-items: center; font-weight: 700; color: var(--muted); font-size: 14px; }
.se-g6 button { min-height: 40px; padding: 0; border: 2px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); font: 600 13px var(--font); cursor: pointer; }
.se-g6 button[aria-pressed="true"] { background: var(--brand); border-color: var(--brand); color: var(--on-brand, #fff); }
.se-g6 button:focus-visible { outline: 3px solid var(--ink); outline-offset: 1px; }
.se-tbl { border-collapse: collapse; font-size: 14px; }
.se-tbl td, .se-tbl th { border: 1px solid var(--line); padding: 4px 8px; text-align: center; }
.se-iv { display: grid; gap: 8px; border: 1px solid var(--line); border-radius: 8px; padding: 10px; }
.se-iv h4 { margin: 0; font-size: 14px; }
@media (max-width: 600px) { .se-wide .se-t { font-size: 24px; } .se-wide .se-s { font-size: 20px; } }
`;
    const s = document.createElement("style"); s.id = "se-style"; s.textContent = css; document.head.appendChild(s);
  }

  // ---------- Yardımcılar ----------
  const fmt = (x, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString("tr-TR");
  const num = (x, d = 2) => { const r = Math.round(x * 10 ** d) / 10 ** d; return r < 0 ? "−" + fmt(-r, d) : fmt(r === 0 ? 0 : r, d); };
  const minus = (s) => String(s).replace(/-/g, "−");
  const sup = (n) => String(n).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const frac = (p, q) => { if (q === 0) return "tanımsız"; const g = gcd(p, q) || 1; const a = p / g, b = q / g; return b === 1 ? minus(a) : `${a < 0 ? "−" : ""}${Math.abs(a)}/${b}`; };
  const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  function S(tag, attrs = {}, parent, text) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function pt(svg, ev) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  const slider = (label, key, min, max, step, value, shown) => `<label class="sim-slider"><span>${label}: <b data-v="${key}">${shown ?? num(value)}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-k="${key}"></label>`;
  function bind(el, st, after) {
    el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; after(i.dataset.k); }));
  }
  function setV(el, st, f = {}) { el.querySelectorAll("[data-v]").forEach((b) => { const k = b.dataset.v; b.textContent = f[k] ? f[k](st[k]) : num(st[k]); }); }
  function syncInputs(el, st) { el.querySelectorAll("input[data-k]").forEach((i) => { if (i.dataset.k in st && +i.value !== st[i.dataset.k]) i.value = st[i.dataset.k]; }); }
  const tog = (label, attrs, on) => `<button type="button" class="btn btn-outline btn-small se-tog" ${attrs} aria-pressed="${!!on}">${label}</button>`;
  // Sürükleme: svg üzerinde basılı tutup hareket ettirince cb(nokta) çağrılır.
  function dragOn(svg, cb, startFilter) {
    let on = false;
    svg.addEventListener("pointerdown", (ev) => { if (startFilter && !startFilter(ev)) return; on = true; svg.setPointerCapture(ev.pointerId); cb(pt(svg, ev), ev, true); });
    svg.addEventListener("pointermove", (ev) => { if (on) cb(pt(svg, ev), ev, false); });
    const stop = () => { on = false; };
    svg.addEventListener("pointerup", stop); svg.addEventListener("pointercancel", stop);
  }
  const arrowDelta = (e) => (e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0);

  // ---------- 1. Karo döşeme: EBOB (dikdörtgeni eş karelerle döşe) ve EKOK (dikdörtgenlerle kare oluştur) ----------
  reg("e-kare-doseme", (el, cfg, changed) => {
    const ekok = cfg.mode === "ekok";
    const w = cfg.w ?? 12, h = cfg.h ?? 18;
    const st = { k: cfg.k ?? 1 };
    const kmax = ekok ? (cfg.max ?? w * h) : Math.min(w, h);
    el.innerHTML = `<div class="se-host"></div>${slider(ekok ? "Karenin kenarı" : "Karonun kenarı", "k", 1, kmax, 1, st.k)}<p class="se-info"></p>`;
    const dv = (a, b) => (a % b === 0 ? `${a} ÷ ${b} = ${a / b} <span class="se-ok">✓</span>` : `${a} ÷ ${b} → kalan ${a % b} <span class="se-no">✗</span>`);
    function draw() {
      const k = st.k;
      let svg, fits, adet;
      if (!ekok) {
        const u = Math.min(540 / w, 260 / h), W = w * u, H = h * u;
        svg = S("svg", { viewBox: `0 0 ${W + 70} ${H + 50}`, class: "sim-svg", role: "img", "aria-label": `${w} × ${h} dikdörtgen, ${k} birimlik kare karolar` });
        const g = S("g", { transform: "translate(50,10)" }, svg);
        S("rect", { x: 0, y: 0, width: W, height: H, class: "se-x" }, g);
        const nx = Math.floor(w / k), ny = Math.floor(h / k);
        for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) S("rect", { x: i * k * u, y: j * k * u, width: k * u, height: k * u, class: (i + j) % 2 ? "se-a" : "se-b" }, g);
        S("rect", { x: 0, y: 0, width: W, height: H, class: "se-frame" }, g);
        S("text", { x: W / 2, y: H + 32, class: "se-t se-tm" }, g, `${w} birim`);
        S("text", { x: -10, y: H / 2 + 6, class: "se-t se-te" }, g, `${h}`);
        fits = w % k === 0 && h % k === 0; adet = nx * ny;
        el.querySelector(".se-info").innerHTML = `${dv(w, k)} · ${dv(h, k)}<br>${fits ? `<span class="se-ok">Tam döşendi:</span> ${adet} karo. ${k}, hem ${w}'nin hem ${h}'in böleni.` : `<span class="se-no">Artık parça kaldı.</span> ${k}, ${w} ve ${h}'in ortak böleni değil.`}`;
      } else {
        const s = k, u = 240 / Math.max(s, 1);
        svg = S("svg", { viewBox: "0 0 330 290", class: "sim-svg", role: "img", "aria-label": `${s} birimlik kare, ${w} × ${h} dikdörtgenlerle` });
        const g = S("g", { transform: "translate(50,10)" }, svg);
        S("rect", { x: 0, y: 0, width: s * u, height: s * u, class: "se-x" }, g);
        const nx = Math.floor(s / w), ny = Math.floor(s / h);
        for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) S("rect", { x: i * w * u, y: j * h * u, width: w * u, height: h * u, class: (i + j) % 2 ? "se-a" : "se-b" }, g);
        S("rect", { x: 0, y: 0, width: s * u, height: s * u, class: "se-frame" }, g);
        S("text", { x: 120, y: 274, class: "se-t se-tm" }, g, `${s} birim`);
        fits = s % w === 0 && s % h === 0; adet = nx * ny;
        el.querySelector(".se-info").innerHTML = `${dv(s, w)} · ${dv(s, h)}<br>${fits ? `<span class="se-ok">Kare tamamlandı:</span> ${adet} tane ${w} × ${h} dikdörtgen. ${s}, hem ${w}'ün hem ${h}'nın katı.` : `<span class="se-no">Kare tamamlanmadı.</span> ${s}, ${w} ve ${h}'nın ortak katı değil.`}`;
      }
      el.querySelector(".se-host").replaceChildren(svg);
      setV(el, st);
      return { fits, adet };
    }
    let last = draw();
    bind(el, st, () => { last = draw(); changed(); });
    return () => ({ k: st.k, fits: last.fits ? 1 : 0, adet: last.adet });
  });

  // ---------- 2. Üslü ifade: taban ve üs; kuvvet merdiveni (× a sağa, ÷ a sola) ----------
  reg("e-us-kuvvet", (el, cfg, changed) => {
    const st = { a: cfg.a ?? 2, n: cfg.n ?? 3 };
    const [amin, amax] = cfg.aAralik ?? [-3, 10], [nmin, nmax] = cfg.nAralik ?? [-4, 6];
    el.innerHTML = `<p class="se-big se-eq"></p><div class="se-lad"></div><div class="se-ctrl">${slider("Taban a", "a", amin, amax, 1, st.a)}${slider("Üs n", "n", nmin, nmax, 1, st.n)}</div><p class="se-info"></p>`;
    const P = (a, n) => { if (a === 0 && n <= 0) return null; if (n >= 0) return { p: a ** n, q: 1 }; const d = a ** -n; return d < 0 ? { p: -1, q: -d } : { p: 1, q: d }; };
    const fr = (v) => (v === null ? "tanımsız" : frac(v.p, v.q));
    const base = (a) => (a < 0 ? `(${minus(a)})` : `${a}`);
    function draw() {
      const { a, n } = st, v = P(a, n);
      let ex;
      if (a === 0 && n <= 0) ex = `0${sup(n)} tanımsızdır (0'a bölme yapılamaz).`;
      else if (n > 0) ex = `${base(a)}${sup(n)} = ${n <= 6 ? Array(n).fill(base(a)).join(" · ") : `${base(a)} · ${base(a)} · … · ${base(a)} (${n} çarpan)`} = <b>${fr(v)}</b>`;
      else if (n === 0) ex = `${base(a)}⁰ = <b>1</b> (sıfırdan farklı her sayının 0. kuvveti 1'dir)`;
      else ex = `${base(a)}${sup(n)} = 1 / ${base(a)}${sup(-n)} = 1 / ${minus(a ** -n)} = <b>${fr(v)}</b>`;
      el.querySelector(".se-eq").innerHTML = `${base(a)}<sup>${minus(n)}</sup> = ${fr(v)}`;
      const ks = [n - 2, n - 1, n, n + 1, n + 2];
      el.querySelector(".se-lad").innerHTML = ks.map((k, i) => `${i ? `<span class="se-arr">${a === 0 ? "→" : `× ${minus(a)} →`}</span>` : ""}<div class="se-box${k === n ? " cur" : ""}"><small>${base(a)}${sup(k)}</small><b>${fr(P(a, k))}</b></div>`).join("");
      let sign = "";
      if (v && a < 0) sign = `<br><span class="se-muted">Taban negatif: üs ${Math.abs(n) % 2 === 0 ? "çift olduğu için sonuç pozitif" : "tek olduğu için sonuç negatif"}.</span>`;
      el.querySelector(".se-info").innerHTML = ex + sign + (a !== 0 ? `<br><span class="se-muted">Merdivende sağa her adım ${minus(a)} ile çarpar, sola her adım ${minus(a)}'ye böler.</span>` : "");
      setV(el, st);
    }
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const v = P(st.a, st.n); const val = v ? v.p / v.q : null; return { a: st.a, n: st.n, value: val, isaret: val === null ? null : Math.sign(val) }; };
  });

  // ---------- 3. Bilimsel gösterim: virgülü kaydır, 10'un kuvveti dengeyi korur ----------
  reg("e-bilimsel", (el, cfg, changed) => {
    const D = String(cfg.rakamlar ?? "512"), L = D.length;
    let p = cfg.kaydir ?? -1; // katsayı = D × 10^p
    const T = (cfg.us ?? 5) + p; // sayı = D × 10^T sabit
    const decStr = (q) => { if (q >= 0) return D + "0".repeat(q); const i = L + q; return i > 0 ? D.slice(0, i) + "," + D.slice(i) : "0," + "0".repeat(-i) + D; };
    const group = (s) => { const [ip, dp] = s.split(","); const g = ip.replace(/\B(?=(\d{3})+(?!\d))/g, " "); return dp ? `${g},${dp}` : g; };
    el.innerHTML = `<div class="se-digits" aria-live="polite"></div><div class="se-row"><button type="button" class="btn btn-outline btn-small" data-m="-1">← Virgülü sola kaydır</button><button type="button" class="btn btn-outline btn-small" data-m="1">Virgülü sağa kaydır →</button><button type="button" class="btn btn-outline btn-small" data-m="0">Baştan</button></div><p class="se-info"></p>`;
    const p0 = p;
    function draw() {
      const e = T - p, c = decStr(p);
      el.querySelector(".se-digits").innerHTML = [...c].map((ch) => (ch === "," ? `<span class="cm">,</span>` : `<span class="d">${ch}</span>`)).join("") + `<span class="pw">× 10<sup>${minus(e)}</sup></span>`;
      const sci = p === 1 - L;
      el.querySelector(".se-info").innerHTML = `Sayının kendisi: <b>${group(decStr(T))}</b><br>Katsayı ${group(c)} · ${sci ? `<span class="se-ok">1 ≤ katsayı &lt; 10: bilimsel gösterim ✓</span>` : `<span class="se-muted">Katsayı 1 ile 10 arasında değil; bilimsel gösterim değil.</span>`}<br><span class="se-muted">Virgül bir basamak sola gidince katsayı 10'a bölünür, üs 1 artar; sağa gidince tersi olur.</span>`;
      el.querySelector('[data-m="-1"]').disabled = p <= -(L + 4);
      el.querySelector('[data-m="1"]').disabled = p >= 3;
    }
    el.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { const m = +b.dataset.m; p = m === 0 ? p0 : p + m; draw(); changed(); }));
    draw();
    return () => ({ us: T - p, katsayi: +D * 10 ** p, bilimsel: p === 1 - L ? 1 : 0 });
  });

  // ---------- 4. Karekök: alanı n olan karenin kenarı; sayı doğrusunda √n; a√b biçimi ----------
  reg("e-karekok", (el, cfg, changed) => {
    const st = { n: cfg.n ?? 31 }, max = cfg.max ?? 100, M = Math.ceil(Math.sqrt(max));
    el.innerHTML = `<div class="plane-wrap"><div class="se-host"></div><div class="plane-ctrl"><p class="eq se-eq"></p>${slider("Karenin alanı n", "n", 1, max, 1, st.n)}<p class="se-info"></p></div></div><div class="se-host2"></div>`;
    const simp = (n) => { let a = 1; for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) a = k; return [a, n / (a * a)]; };
    function draw() {
      const n = st.n, r = Math.sqrt(n), f = Math.floor(r + 1e-9), c = Math.ceil(r - 1e-9), tam = f === c;
      const u = 280 / M;
      const svg = S("svg", { viewBox: "0 0 300 300", class: "sim-svg", role: "img", "aria-label": `Alanı ${n} birimkare olan kare` });
      for (let i = 0; i <= M; i++) { S("line", { x1: 10 + i * u, y1: 10, x2: 10 + i * u, y2: 290, class: "se-grid" }, svg); S("line", { x1: 10, y1: 10 + i * u, x2: 290, y2: 10 + i * u, class: "se-grid" }, svg); }
      S("rect", { x: 10, y: 290 - r * u, width: r * u, height: r * u, class: "se-a" }, svg);
      if (!tam) { S("rect", { x: 10, y: 290 - f * u, width: f * u, height: f * u, class: "se-dash" }, svg); S("rect", { x: 10, y: 290 - c * u, width: c * u, height: c * u, class: "se-dash" }, svg); }
      S("text", { x: 10 + (r * u) / 2, y: 290 - (r * u) / 2 + 6, class: "se-t se-tm se-halo" }, svg, `${n}`);
      el.querySelector(".se-host").replaceChildren(svg);
      const W = 620, X = (v) => 30 + (v / M) * (W - 60);
      const nl = S("svg", { viewBox: `0 0 ${W} 90`, class: "sim-svg se-wide", role: "img", "aria-label": `Sayı doğrusunda karekök ${n}` });
      S("line", { x1: 20, y1: 50, x2: W - 20, y2: 50, class: "nl-axis" }, nl);
      for (let i = 0; i <= M; i++) { S("line", { x1: X(i), y1: 40, x2: X(i), y2: 60, class: "nl-major" }, nl); S("text", { x: X(i), y: 82, class: "se-t se-tm" }, nl, i); }
      if (!tam) S("line", { x1: X(f + 0.5), y1: 44, x2: X(f + 0.5), y2: 56, class: "se-dash" }, nl);
      S("circle", { cx: X(r), cy: 50, r: 9, class: "se-dot" }, nl);
      S("text", { x: X(r), y: 26, class: "se-t se-tm" }, nl, `√${n}`);
      el.querySelector(".se-host2").replaceChildren(nl);
      const [a, b] = simp(n);
      el.querySelector(".se-eq").textContent = tam ? `√${n} = ${f}` : `√${n} ≈ ${fmt(r, 2)}`;
      let info = tam ? `${n} tam kare sayıdır: ${f} · ${f} = ${n}. Karenin kenarı ${f} birim.` : `${f}² = ${f * f} < ${n} < ${c * c} = ${c}²<br>Yani ${f} < √${n} < ${c}; √${n}, <b>${r < f + 0.5 ? f : c}</b> sayısına daha yakın.`;
      if (a > 1 && b > 1) info += `<br>√${n} = √(${a * a} · ${b}) = <b>${a}√${b}</b>`;
      el.querySelector(".se-info").innerHTML = info;
      setV(el, st);
    }
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const n = st.n, r = Math.sqrt(n), f = Math.floor(r + 1e-9), c = Math.ceil(r - 1e-9), [a, b] = simp(n); return { n, kok: r, tam: f === c ? 1 : 0, alt: f, ust: c, katsayi: a, ic: b }; };
  });

  // ---------- 5. Özdeşlik alan modeli: (x+p)(x+q), (a+b)², a²−b² ----------
  reg("e-alan-ozdeslik", (el, cfg, changed) => {
    const mode = cfg.mode ?? "carpim", mx = cfg.max ?? (mode === "carpim" ? 6 : 8);
    const st = mode === "carpim" ? { p: cfg.p ?? 2, q: cfg.q ?? 3 } : { a: cfg.a ?? 5, b: cfg.b ?? 2 };
    let moved = false;
    const ctrl = mode === "carpim" ? slider("p", "p", 0, mx, 1, st.p) + slider("q", "q", 0, mx, 1, st.q)
      : slider("a", "a", mode === "fark" ? 2 : 1, mx, 1, st.a) + slider("b", "b", 1, mode === "fark" ? mx - 1 : mx, 1, st.b);
    el.innerHTML = `<div class="plane-wrap"><div class="se-host"></div><div class="plane-ctrl"><p class="eq se-eq"></p>${ctrl}${mode === "fark" ? `<button type="button" class="btn btn-outline btn-small se-mv">Parçayı kes ve taşı</button>` : ""}<p class="se-info"></p></div></div>`;
    const term = (c, v) => (c === 0 ? "" : `${c === 1 && v ? "" : c}${v}`);
    function draw() {
      const svg = S("svg", { viewBox: "0 0 380 380", class: "sim-svg", role: "img", "aria-label": "Alan modeli" });
      const g = S("g", { transform: "translate(34,30)" }, svg);
      const R = (x, y, w, h, cls, lab, u) => { S("rect", { x: x * u, y: y * u, width: w * u, height: h * u, class: cls }, g); if (lab) S("text", { x: (x + w / 2) * u, y: (y + h / 2) * u + 6, class: "se-t se-tm se-halo" }, g, lab); };
      if (mode === "carpim") {
        const { p, q } = st, X = 5, u = 320 / (X + mx);
        R(0, 0, X, X, "se-a", "x²", u);
        for (let i = 0; i < p; i++) R(X + i, 0, 1, X, "se-b", i === 0 ? "x" : "", u);
        for (let j = 0; j < q; j++) R(0, X + j, X, 1, "se-b", j === 0 ? "x" : "", u);
        for (let i = 0; i < p; i++) for (let j = 0; j < q; j++) R(X + i, X + j, 1, 1, "se-c", "", u);
        S("text", { x: (X / 2) * u, y: -10, class: "se-t se-tm" }, g, "x");
        if (p) S("text", { x: (X + p / 2) * u, y: -10, class: "se-t se-tm" }, g, `${p}`);
        S("text", { x: -10, y: (X / 2) * u + 6, class: "se-t se-te" }, g, "x");
        if (q) S("text", { x: -10, y: (X + q / 2) * u + 6, class: "se-t se-te" }, g, `${q}`);
        const f = (c) => (c ? `(x + ${c})` : "x");
        const rhs = ["x²", term(p + q, "x"), term(p * q, "")].filter(Boolean).join(" + ");
        el.querySelector(".se-eq").textContent = `${f(p)}${f(q)} = ${rhs}`;
        el.querySelector(".se-info").innerHTML = `<span class="se-sw s0"></span>x² karesi: 1 tane<br><span class="se-sw s1"></span>x şeritleri: ${p} + ${q} = <b>${p + q}</b> tane<br><span class="se-sw s2"></span>birim kareler: ${p} · ${q} = <b>${p * q}</b> tane`;
      } else if (mode === "tam-kare") {
        const { a, b } = st, u = 300 / (a + b);
        R(0, 0, a, a, "se-a", `${a * a}`, u); R(a, 0, b, a, "se-b", `${a * b}`, u); R(0, a, a, b, "se-b", `${a * b}`, u); R(a, a, b, b, "se-c", `${b * b}`, u);
        S("text", { x: (a / 2) * u, y: -10, class: "se-t se-tm" }, g, `a = ${a}`); S("text", { x: (a + b / 2) * u, y: -10, class: "se-t se-tm" }, g, `b = ${b}`);
        el.querySelector(".se-eq").textContent = `(${a} + ${b})² = ${(a + b) ** 2}`;
        el.querySelector(".se-info").innerHTML = `(a + b)² = a² + 2ab + b²<br>${a}² + 2 · ${a} · ${b} + ${b}² = ${a * a} + ${2 * a * b} + ${b * b} = <b>${(a + b) ** 2}</b><br><span class="se-muted">Dikkat: (a + b)² ile a² + b² arasındaki fark, iki yeşil dikdörtgendir (2ab = ${2 * a * b}).</span>`;
      } else {
        if (st.b >= st.a) st.b = st.a - 1;
        const { a, b } = st, u = 300 / (2 * a);
        if (!moved) {
          R(0, 0, a - b, a, "se-a", "", u); R(a - b, b, b, a - b, "se-b", "", u); R(a - b, 0, b, b, "se-x", `${b * b}`, u);
          S("text", { x: (a / 2) * u, y: -10, class: "se-t se-tm" }, g, `${a}`); S("text", { x: -10, y: (a / 2) * u + 6, class: "se-t se-te" }, g, `${a}`);
        } else {
          R(0, 0, a - b, a, "se-a", "", u); R(0, a, a - b, b, "se-b", "", u);
          S("text", { x: ((a - b) / 2) * u, y: -10, class: "se-t se-tm" }, g, `${a} − ${b} = ${a - b}`); S("text", { x: -10, y: ((a + b) / 2) * u + 6, class: "se-t se-te" }, g, `${a + b}`);
        }
        el.querySelector(".se-eq").textContent = `${a}² − ${b}² = ${a * a - b * b}`;
        el.querySelector(".se-info").innerHTML = moved ? `Yeni dikdörtgen: (${a} − ${b}) · (${a} + ${b}) = ${a - b} · ${a + b} = <b>${(a - b) * (a + b)}</b><br>a² − b² = (a − b)(a + b)` : `${a} × ${a} kareden ${b} × ${b} kare kesildi: ${a * a} − ${b * b} = <b>${a * a - b * b}</b>. Kalan parçayı taşı.`;
        const mv = el.querySelector(".se-mv"); mv.textContent = moved ? "Geri koy" : "Parçayı kes ve taşı";
        syncInputs(el, st);
      }
      el.querySelector(".se-host").replaceChildren(svg);
      setV(el, st);
    }
    el.querySelector(".se-mv")?.addEventListener("click", () => { moved = !moved; draw(); changed(); });
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => (mode === "carpim" ? { p: st.p, q: st.q, orta: st.p + st.q, sabit: st.p * st.q } : { a: st.a, b: st.b, alan: mode === "fark" ? st.a ** 2 - st.b ** 2 : (st.a + st.b) ** 2, tasindi: moved ? 1 : 0 });
  });

  // ---------- 6. Eşitsizlik: sayı doğrusunda ışın ya da aralık; test noktası ----------
  reg("e-esitsizlik", (el, cfg, changed) => {
    const min = cfg.min ?? -6, max = cfg.max ?? 6, iki = !!cfg.iki, v = cfg.degisken ?? "x", step = cfg.adim ?? 1;
    const OPS = ["<", "≤", ">", "≥"];
    const st = { a: cfg.a ?? 1, b: cfg.b ?? 4, op: cfg.op ?? 0, opA: cfg.opA ?? 1, opB: cfg.opB ?? 0, t: cfg.t ?? min };
    const ctrl = iki
      ? `<div class="se-row"><span class="se-muted">Sol uç:</span>${tog("<", 'data-oa="0"', st.opA === 0)}${tog("≤", 'data-oa="1"', st.opA === 1)}<span class="se-muted">Sağ uç:</span>${tog("<", 'data-ob="0"', st.opB === 0)}${tog("≤", 'data-ob="1"', st.opB === 1)}</div><div class="se-ctrl">${slider("Sol sınır a", "a", min, max, step, st.a)}${slider("Sağ sınır b", "b", min, max, step, st.b)}</div>`
      : `<div class="se-row">${OPS.map((o, i) => tog(o, `data-op="${i}"`, st.op === i)).join("")}</div>${slider("Sınır değeri a", "a", min, max, step, st.a)}`;
    el.innerHTML = `<p class="se-big se-eq"></p><div class="se-host"></div>${ctrl}<p class="se-info"></p>`;
    const W = 640, L = 40, R = 600, Y = 60, X = (x) => L + ((x - min) / (max - min)) * (R - L);
    const sat = (x) => (iki ? (st.opA ? x >= st.a : x > st.a) && (st.opB ? x <= st.b : x < st.b) : [x < st.a, x <= st.a, x > st.a, x >= st.a][st.op]);
    const svg = S("svg", { viewBox: `0 0 ${W} 160`, class: "sim-svg se-drag se-wide", role: "group", "aria-label": "Sayı doğrusu" });
    el.querySelector(".se-host").replaceChildren(svg);
    let knob;
    function draw() {
      svg.replaceChildren();
      S("line", { x1: L - 24, y1: Y, x2: R + 24, y2: Y, class: "nl-axis" }, svg);
      for (let x = min; x <= max; x++) { S("line", { x1: X(x), y1: Y - 9, x2: X(x), y2: Y + 9, class: "nl-minor" }, svg); S("text", { x: X(x), y: Y + 32, class: "se-t se-tm" }, svg, minus(x)); }
      const dot = (x, closed) => S("circle", { cx: X(x), cy: Y, r: 9, class: closed ? "se-closed" : "se-open" }, svg);
      if (iki) {
        if (st.a < st.b || (st.a === st.b && st.opA && st.opB)) S("line", { x1: X(st.a), y1: Y, x2: X(st.b), y2: Y, class: "se-bline", "stroke-width": 8 }, svg);
        dot(st.a, st.opA === 1); dot(st.b, st.opB === 1);
      } else {
        const left = st.op < 2, end = left ? L - 22 : R + 22;
        S("line", { x1: X(st.a), y1: Y, x2: end, y2: Y, class: "se-bline", "stroke-width": 8 }, svg);
        S("polygon", { points: left ? `${end - 6},${Y} ${end + 10},${Y - 10} ${end + 10},${Y + 10}` : `${end + 6},${Y} ${end - 10},${Y - 10} ${end - 10},${Y + 10}`, class: "se-p0" }, svg);
        dot(st.a, st.op % 2 === 1);
      }
      const ok = sat(st.t);
      S("polygon", { points: `${X(st.t)},${Y + 44} ${X(st.t) - 11},${Y + 64} ${X(st.t) + 11},${Y + 64}`, class: ok ? "se-p1" : "se-p3" }, svg);
      knob = S("text", { x: X(st.t), y: Y + 84, class: "se-t se-tm" }, svg, `t = ${num(st.t, 1)}`);
      const foc = S("rect", { x: X(st.t) - 16, y: Y + 40, width: 32, height: 50, fill: "transparent", tabindex: 0, role: "slider", class: "se-focus", "aria-label": "Test noktası t", "aria-valuetext": `${num(st.t, 1)}` }, svg);
      foc.addEventListener("keydown", (e) => { const d = arrowDelta(e); if (d) { e.preventDefault(); st.t = Math.min(max, Math.max(min, st.t + d * step)); draw(); changed(); svg.querySelector(".se-focus")?.focus(); } });
      const expr = iki ? `${minus(st.a)} ${["<", "≤"][st.opA]} ${v} ${["<", "≤"][st.opB]} ${minus(st.b)}` : `${v} ${OPS[st.op]} ${minus(st.a)}`;
      el.querySelector(".se-eq").textContent = expr;
      const tExpr = iki ? `${minus(st.a)} ${["<", "≤"][st.opA]} ${num(st.t, 1)} ${["<", "≤"][st.opB]} ${minus(st.b)}` : `${num(st.t, 1)} ${OPS[st.op]} ${minus(st.a)}`;
      let info = `Test: ${v} = ${num(st.t, 1)} için ${tExpr} → ${ok ? `<span class="se-ok">doğru, çözüm kümesinde</span>` : `<span class="se-no">yanlış, çözüm kümesinde değil</span>`}`;
      info += `<br><span class="se-muted">Dolu daire: sınır dahil (≤, ≥). Boş daire: sınır dahil değil (<, >).</span>`;
      if (iki) { const ints = []; for (let x = Math.ceil(min); x <= max; x++) if (sat(x)) ints.push(minus(x)); info += `<br>Tam sayı çözümleri: ${ints.length ? ints.join(", ") : "yok"} (${ints.length} tane)`; }
      el.querySelector(".se-info").innerHTML = info;
      el.querySelectorAll("[data-op]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.op === st.op));
      el.querySelectorAll("[data-oa]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.oa === st.opA));
      el.querySelectorAll("[data-ob]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.ob === st.opB));
      syncInputs(el, st); setV(el, st);
    }
    dragOn(svg, (p) => { const x = Math.round((min + ((p.x - L) / (R - L)) * (max - min)) / step) * step; st.t = Math.min(max, Math.max(min, x)); draw(); changed(); });
    el.querySelectorAll("[data-op]").forEach((b) => b.addEventListener("click", () => { st.op = +b.dataset.op; draw(); changed(); }));
    el.querySelectorAll("[data-oa]").forEach((b) => b.addEventListener("click", () => { st.opA = +b.dataset.oa; draw(); changed(); }));
    el.querySelectorAll("[data-ob]").forEach((b) => b.addEventListener("click", () => { st.opB = +b.dataset.ob; draw(); changed(); }));
    bind(el, st, (k) => { if (iki) { if (k === "a" && st.a > st.b) st.b = st.a; if (k === "b" && st.b < st.a) st.a = st.b; } draw(); changed(); });
    draw();
    const cnt = () => { let c = 0; for (let x = Math.ceil(min); x <= max; x++) if (sat(x)) c++; return c; };
    return () => ({ a: st.a, b: st.b, op: st.op, opA: st.opA, opB: st.opB, t: st.t, saglar: sat(st.t) ? 1 : 0, tamSayi: cnt() });
  });

  // ---------- 7. Aralıklar: iki aralık; kesişim, birleşim, fark ----------
  reg("e-aralik", (el, cfg, changed) => {
    const min = cfg.min ?? -6, max = cfg.max ?? 6;
    const A = { lo: cfg.A?.[0] ?? -4, hi: cfg.A?.[1] ?? 2, lc: cfg.A?.[2] ?? true, hc: cfg.A?.[3] ?? false };
    const B = { lo: cfg.B?.[0] ?? 0, hi: cfg.B?.[1] ?? 5, lc: cfg.B?.[2] ?? false, hc: cfg.B?.[3] ?? true };
    let islem = cfg.islem ?? 0;
    const ISL = ["A ∩ B", "A ∪ B", "A ∖ B", "B ∖ A"];
    const st = { a1: A.lo, b1: A.hi, a2: B.lo, b2: B.hi };
    const box = (n, I, k1, k2) => `<div class="se-iv"><h4>${n} aralığı</h4><div class="se-row"><span class="se-muted">Sol uç</span>${tog("[ dahil", `data-c="${n}l1"`, I.lc)}${tog("( hariç", `data-c="${n}l0"`, !I.lc)}<span class="se-muted">Sağ uç</span>${tog("dahil ]", `data-c="${n}h1"`, I.hc)}${tog("hariç )", `data-c="${n}h0"`, !I.hc)}</div><div class="se-ctrl">${slider("Sol uç", k1, min, max, 1, I.lo)}${slider("Sağ uç", k2, min, max, 1, I.hi)}</div></div>`;
    el.innerHTML = `<div class="se-host"></div><div class="se-row">${ISL.map((s, i) => tog(s, `data-i="${i}"`, i === islem)).join("")}</div><p class="se-info"></p><div class="se-ctrl">${box("A", A, "a1", "b1")}${box("B", B, "a2", "b2")}</div>`;
    const isEmpty = (I) => I.lo > I.hi || (I.lo === I.hi && !(I.lc && I.hc));
    const inter = (I, J) => { const lo = Math.max(I.lo, J.lo), hi = Math.min(I.hi, J.hi); const lc = I.lo === J.lo ? I.lc && J.lc : I.lo > J.lo ? I.lc : J.lc; const hc = I.hi === J.hi ? I.hc && J.hc : I.hi < J.hi ? I.hc : J.hc; return { lo, hi, lc, hc }; };
    const merge = (list) => {
      const xs = list.filter((I) => !isEmpty(I)).sort((p, q) => p.lo - q.lo || (q.lc ? 1 : 0) - (p.lc ? 1 : 0)); const out = [];
      for (const I of xs) {
        const c = out[out.length - 1];
        if (c && (I.lo < c.hi || (I.lo === c.hi && (c.hc || I.lc)))) { if (I.hi > c.hi) { c.hi = I.hi; c.hc = I.hc; } else if (I.hi === c.hi) c.hc = c.hc || I.hc; if (I.lo === c.lo) c.lc = c.lc || I.lc; }
        else out.push({ ...I });
      }
      return out;
    };
    const comp = (I) => [{ lo: -Infinity, hi: I.lo, lc: false, hc: !I.lc }, { lo: I.hi, hi: Infinity, lc: !I.hc, hc: false }];
    const diff = (I, J) => merge(comp(J).map((K) => inter(I, K)));
    const sh = (x) => (x === Infinity ? "∞" : x === -Infinity ? "−∞" : minus(x));
    const show = (I) => (I.lo === I.hi ? `{${minus(I.lo)}}` : `${I.lc ? "[" : "("}${sh(I.lo)}, ${sh(I.hi)}${I.hc ? "]" : ")"}`);
    const showList = (ls) => (ls.length ? ls.map(show).join(" ∪ ") : "∅");
    const result = () => [merge([inter(A, B)]), merge([A, B]), diff(A, B), diff(B, A)][islem];
    const W = 640, L = 50, R = 610, X = (x) => L + ((x - min) / (max - min)) * (R - L);
    function draw() {
      const svg = S("svg", { viewBox: `0 0 ${W} 210`, class: "sim-svg se-wide", role: "img", "aria-label": "Aralıklar" });
      const row = (y, list, cls, lab) => {
        S("text", { x: 8, y: y + 6, class: "se-t" }, svg, lab);
        S("line", { x1: L - 10, y1: y, x2: R + 10, y2: y, class: "se-axis" }, svg);
        for (const I of list) {
          if (isEmpty(I)) continue;
          S("line", { x1: X(I.lo), y1: y, x2: X(I.hi), y2: y, class: cls, "stroke-width": 8 }, svg);
          S("circle", { cx: X(I.lo), cy: y, r: 8, class: I.lc ? "se-closed" : "se-open" }, svg);
          S("circle", { cx: X(I.hi), cy: y, r: 8, class: I.hc ? "se-closed" : "se-open" }, svg);
        }
      };
      row(30, [A], "se-bline", "A"); row(80, [B], "se-gline", "B");
      for (let x = min; x <= max; x++) { S("line", { x1: X(x), y1: 140, x2: X(x), y2: 150, class: "nl-minor" }, svg); S("text", { x: X(x), y: 200, class: "se-s se-tm" }, svg, minus(x)); S("line", { x1: X(x), y1: 20, x2: X(x), y2: 175, class: "se-grid" }, svg); }
      const res = result();
      row(145, res, "se-wline", "∗");
      el.querySelector(".se-host").replaceChildren(svg);
      el.querySelector(".se-info").innerHTML = `A = ${showList(merge([A]))} · B = ${showList(merge([B]))}<br><b>${ISL[islem]} = ${showList(res)}</b> <span class="se-muted">(turuncu satır)</span>`;
      el.querySelectorAll("[data-i]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.i === islem));
      el.querySelectorAll("[data-c]").forEach((b) => { const [n, s, v] = [b.dataset.c[0], b.dataset.c[1], +b.dataset.c[2]]; const I = n === "A" ? A : B; b.setAttribute("aria-pressed", (s === "l" ? I.lc : I.hc) === !!v); });
      syncInputs(el, st); setV(el, st);
    }
    el.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { islem = +b.dataset.i; draw(); changed(); }));
    el.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { const [n, s, v] = [b.dataset.c[0], b.dataset.c[1], +b.dataset.c[2]]; const I = n === "A" ? A : B; I[s === "l" ? "lc" : "hc"] = !!v; draw(); changed(); }));
    bind(el, st, (k) => {
      if (k === "a1" && st.a1 > st.b1) st.b1 = st.a1; if (k === "b1" && st.b1 < st.a1) st.a1 = st.b1;
      if (k === "a2" && st.a2 > st.b2) st.b2 = st.a2; if (k === "b2" && st.b2 < st.a2) st.a2 = st.b2;
      A.lo = st.a1; A.hi = st.b1; B.lo = st.a2; B.hi = st.b2; draw(); changed();
    });
    draw();
    return () => {
      const r = result(); let ints = 0;
      for (let x = min; x <= max; x++) if (r.some((I) => (I.lc ? x >= I.lo : x > I.lo) && (I.hc ? x <= I.hi : x < I.hi))) ints++;
      return { ...st, islem, bos: r.length ? 0 : 1, parca: r.length, uzunluk: r.reduce((s, I) => s + (I.hi - I.lo), 0), tamSayi: ints, Akapali: A.lc && A.hc ? 1 : 0, Bkapali: B.lc && B.hc ? 1 : 0 };
    };
  });

  // ---------- 8. Üçgen kenarları: üçgen eşitsizliği, kenar-açı ilişkisi ----------
  reg("e-ucgen-kenar", (el, cfg, changed) => {
    const max = cfg.max ?? 12, sabit = cfg.sabit ?? [];
    const st = { a: cfg.a ?? 5, b: cfg.b ?? 7, c: cfg.c ?? 4 };
    const sl = ["a", "b", "c"].filter((k) => !sabit.includes(k)).map((k) => slider(`${k} = |${{ a: "BC", b: "CA", c: "AB" }[k]}|`, k, 1, max, 1, st[k])).join("");
    el.innerHTML = `<div class="se-host"></div><div class="se-ctrl">${sl}</div><p class="se-info"></p>`;
    const ang = (x, y, z) => (Math.acos(Math.max(-1, Math.min(1, (y * y + z * z - x * x) / (2 * y * z)))) * 180) / Math.PI;
    const valid = () => { const { a, b, c } = st; return a < b + c && b < a + c && c < a + b; };
    function draw() {
      const { a, b, c } = st, ok = valid(); let u = 230 / max;
      const svg = S("svg", { viewBox: "0 0 480 290", class: "sim-svg se-wide", role: "img", "aria-label": `Kenarları ${a}, ${b}, ${c} olan ${ok ? "üçgen" : "çubuklar"}` });
      if (ok) {
        const ax = (c * c - b * b + a * a) / (2 * a), ay = Math.sqrt(Math.max(0, c * c - ax * ax));
        const minX = Math.min(0, ax), maxX = Math.max(a, ax); u = Math.min(400 / (maxX - minX), 200 / Math.max(ay, 0.5)); const ox = (480 - (maxX - minX) * u) / 2 - minX * u, oy = 250;
        const P = (x, y) => [ox + x * u, oy - y * u];
        const [Bp, Cp, Ap] = [P(0, 0), P(a, 0), P(ax, ay)];
        S("polygon", { points: [Ap, Bp, Cp].map((q) => q.join(",")).join(" "), class: "se-a" }, svg);
        const big = Math.max(a, b, c), gx = (Ap[0] + Bp[0] + Cp[0]) / 3, gy = (Ap[1] + Bp[1] + Cp[1]) / 3;
        const side = (p, q, lab, len) => { S("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: len === big ? "se-rline" : "se-line" }, svg); const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = mx - gx, dy = my - gy, d = Math.hypot(dx, dy) || 1; S("text", { x: mx + (dx / d) * 26, y: my + (dy / d) * 22 + 6, class: "se-t se-tm se-halo" }, svg, lab); };
        side(Bp, Cp, `a = ${a}`, a); side(Cp, Ap, `b = ${b}`, b); side(Ap, Bp, `c = ${c}`, c);
        const A = ang(a, b, c), Bq = ang(b, a, c), C = 180 - A - Bq;
        const vl = (p, name, deg, cx, cy) => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1; S("text", { x: p[0] + (dx / d) * 22, y: p[1] + (dy / d) * 22 + 6, class: "se-t se-tm se-halo" }, svg, `${name} ${Math.round(deg)}°`); };
        const cx = (Ap[0] + Bp[0] + Cp[0]) / 3, cy = (Ap[1] + Bp[1] + Cp[1]) / 3;
        vl(Ap, "A", A, cx, cy); vl(Bp, "B", Bq, cx, cy); vl(Cp, "C", C, cx, cy);
      } else {
        const ks = [["a", a], ["b", b], ["c", c]].sort((p, q) => q[1] - p[1]);
        const [Lk, Lv] = ks[0], s1 = ks[1], s2 = ks[2], ox = (480 - Lv * u) / 2, y = 200;
        S("line", { x1: ox, y1: y, x2: ox + Lv * u, y2: y, class: "se-rline" }, svg);
        S("text", { x: ox + (Lv * u) / 2, y: y + 30, class: "se-t se-tm" }, svg, `${Lk} = ${Lv}`);
        S("line", { x1: ox, y1: y - 14, x2: ox + s1[1] * u, y2: y - 14, class: "se-bline" }, svg);
        S("text", { x: ox + (s1[1] * u) / 2, y: y - 24, class: "se-t se-tm" }, svg, `${s1[0]} = ${s1[1]}`);
        S("line", { x1: ox + Lv * u, y1: y - 52, x2: ox + (Lv - s2[1]) * u, y2: y - 52, class: "se-gline" }, svg);
        S("text", { x: ox + (Lv - s2[1] / 2) * u, y: y - 62, class: "se-t se-tm" }, svg, `${s2[0]} = ${s2[1]}`);
        const gap = Lv - s1[1] - s2[1];
        S("text", { x: 240, y: 40, class: "se-t se-tm" }, svg, gap > 0 ? `Kısa iki çubuk birleşemiyor: ${gap} birim eksik` : "Çubuklar ancak düz bir çizgi olur, üçgen oluşmaz");
      }
      el.querySelector(".se-host").replaceChildren(svg);
      const chk = (x, y, z, n) => { const lo = Math.abs(y - z), hi = y + z, g = lo < x && x < hi; return `|${y} − ${z}| = ${lo} < ${n} = ${x} < ${hi} = ${y} + ${z} ${g ? '<span class="se-ok">✓</span>' : '<span class="se-no">✗</span>'}`; };
      let info = `${chk(a, b, c, "a")}<br>${chk(b, a, c, "b")}<br>${chk(c, a, b, "c")}`;
      if (ok) { const big = Math.max(a, b, c), names = ["a", "b", "c"].filter((k) => st[k] === big); info += `<br><span class="se-ok">Üçgen oluşur.</span> En uzun kenar (${names.join(", ")} = ${big}, kırmızı) en büyük açının karşısında.`; }
      else info += `<br><span class="se-no">Üçgen oluşmaz.</span> Bir kenar, diğer ikisinin toplamından küçük, farkından büyük olmalı.`;
      el.querySelector(".se-info").innerHTML = info;
      setV(el, st);
    }
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const { a, b, c } = st, ok = valid(); return { a, b, c, olur: ok ? 1 : 0, A: ok ? ang(a, b, c) : null, B: ok ? ang(b, a, c) : null, C: ok ? ang(c, a, b) : null, dik: ok && [a * a + b * b === c * c, a * a + c * c === b * b, b * b + c * c === a * a].some(Boolean) ? 1 : 0 }; };
  });

  // ---------- 9. Pisagor (kenarlar üzerine kareler) ve Öklid (hipotenüse dikme) ----------
  reg("e-pisagor", (el, cfg, changed) => {
    const max = cfg.max ?? 8, oklid = !!cfg.oklid;
    const st = { a: cfg.a ?? 3, b: cfg.b ?? 4 };
    el.innerHTML = `<div class="plane-wrap"><div class="se-host"></div><div class="plane-ctrl"><p class="eq se-eq"></p>${slider("Dik kenar a", "a", 1, max, 1, st.a)}${slider("Dik kenar b", "b", 1, max, 1, st.b)}<p class="se-info"></p></div></div>`;
    function draw() {
      const { a, b } = st, c2 = a * a + b * b, c = Math.sqrt(c2), tam = Number.isInteger(c);
      let svg;
      if (!oklid) {
        const u = Math.min(360 / (a + 2 * b), 360 / (2 * a + b)), pad = 20;
        const P = (x, y) => `${pad + (x + b) * u},${pad + (a + b - y) * u}`;
        svg = S("svg", { viewBox: `0 0 ${(a + 2 * b) * u + 2 * pad} ${(2 * a + b) * u + 2 * pad}`, class: "sim-svg", role: "img", "aria-label": "Pisagor bağıntısı: kenarlar üzerine kareler" });
        const poly = (ps, cls) => S("polygon", { points: ps.map(([x, y]) => P(x, y)).join(" "), class: cls }, svg);
        poly([[0, 0], [a, 0], [a, -a], [0, -a]], "se-a"); poly([[0, 0], [0, b], [-b, b], [-b, 0]], "se-b"); poly([[a, 0], [0, b], [b, a + b], [a + b, a]], "se-c");
        for (let i = 1; i < a; i++) { S("line", { x1: P(i, 0).split(",")[0], y1: P(i, 0).split(",")[1], x2: P(i, -a).split(",")[0], y2: P(i, -a).split(",")[1], class: "se-grid" }, svg); S("line", { x1: P(0, -i).split(",")[0], y1: P(0, -i).split(",")[1], x2: P(a, -i).split(",")[0], y2: P(a, -i).split(",")[1], class: "se-grid" }, svg); }
        for (let i = 1; i < b; i++) { S("line", { x1: P(-i, 0).split(",")[0], y1: P(-i, 0).split(",")[1], x2: P(-i, b).split(",")[0], y2: P(-i, b).split(",")[1], class: "se-grid" }, svg); S("line", { x1: P(0, i).split(",")[0], y1: P(0, i).split(",")[1], x2: P(-b, i).split(",")[0], y2: P(-b, i).split(",")[1], class: "se-grid" }, svg); }
        poly([[0, 0], [a, 0], [0, b]], "se-r4");
        const s = Math.min(u * 0.6, 14); const [ox, oy] = P(0, 0).split(",").map(Number);
        S("polyline", { points: `${ox + s},${oy} ${ox + s},${oy - s} ${ox},${oy - s}`, class: "se-line", "stroke-width": 2 }, svg);
        const lab = (x, y, t) => { const [px, py] = P(x, y).split(",").map(Number); S("text", { x: px, y: py + 6, class: "se-t se-tm se-halo" }, svg, t); };
        lab(a / 2, -a / 2, `a² = ${a * a}`); lab(-b / 2, b / 2, `b² = ${b * b}`); lab((a + b) / 2, (a + b) / 2, `c² = ${c2}`);
        el.querySelector(".se-eq").textContent = tam ? `c = ${c}` : `c = √${c2} ≈ ${fmt(c, 2)}`;
        el.querySelector(".se-info").innerHTML = `a² + b² = c²<br>${a}² + ${b}² = ${a * a} + ${b * b} = <b>${c2}</b><br>${tam ? `<span class="se-ok">Hipotenüs tam sayı: ${c}</span>` : `<span class="se-muted">${c2} tam kare değil; hipotenüs √${c2}.</span>`}`;
      } else {
        const u = Math.min(380 / a, 280 / b), pad = 40;
        const P = (x, y) => [pad + x * u, pad + (b - y) * u];
        svg = S("svg", { viewBox: `0 0 ${a * u + 2 * pad} ${b * u + 2 * pad}`, class: "sim-svg", role: "img", "aria-label": "Öklid bağıntıları" });
        const [C, A, B] = [P(0, 0), P(a, 0), P(0, b)];
        const t = (a * a) / c2, H = P(a - t * a, t * b);
        S("polygon", { points: [C, A, B].map((q) => q.join(",")).join(" "), class: "se-a" }, svg);
        S("line", { x1: C[0], y1: C[1], x2: H[0], y2: H[1], class: "se-gline" }, svg);
        const L = (p, q, txt, cls) => { S("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: cls }, svg); S("text", { x: (p[0] + q[0]) / 2, y: (p[1] + q[1]) / 2 + 5, class: "se-t se-tm se-halo" }, svg, txt); };
        L(A, H, `p`, "se-bline"); L(H, B, `k`, "se-wline"); L(C, A, `a`, "se-line"); L(C, B, `b`, "se-line");
        S("text", { x: (C[0] + H[0]) / 2 - 10, y: (C[1] + H[1]) / 2 - 4, class: "se-t se-tm se-halo" }, svg, "h");
        const s = 12; S("polyline", { points: `${C[0] + s},${C[1]} ${C[0] + s},${C[1] - s} ${C[0]},${C[1] - s}`, class: "se-line", "stroke-width": 2 }, svg);
        const p = (a * a) / c, k = (b * b) / c, h = (a * b) / c;
        el.querySelector(".se-eq").textContent = `c = ${tam ? c : `√${c2} ≈ ` + fmt(c, 2)}`;
        el.querySelector(".se-info").innerHTML = `p = ${fmt(p)}, k = ${fmt(k)}, h = ${fmt(h)}<br>h² = ${fmt(h * h)} ve p · k = ${fmt(p * k)}<br>a² = ${a * a} ve p · c = ${fmt(p * c)}<br>b² = ${b * b} ve k · c = ${fmt(k * c)}`;
      }
      el.querySelector(".se-host").replaceChildren(svg);
      setV(el, st);
    }
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const { a, b } = st, c2 = a * a + b * b, c = Math.sqrt(c2); return { a, b, c, c2, tam: Number.isInteger(c) ? 1 : 0, h: (a * b) / c, p: (a * a) / c, k: (b * b) / c }; };
  });

  // ---------- 10. Benzerlik: yatay ve dikey ölçek; benzer mi, eş mi? ----------
  reg("e-benzerlik", (el, cfg, changed) => {
    const shape = cfg.sekil ?? [[0, 0], [4, 0], [0, 3]];
    const tek = !!cfg.tek, kmin = cfg.kmin ?? 0.5, kmax = cfg.kmax ?? 3, step = cfg.adim ?? 0.5;
    const st = { kx: cfg.kx ?? cfg.k ?? 1, ky: cfg.ky ?? cfg.k ?? 1 };
    el.innerHTML = `<div class="se-host"></div><div class="se-ctrl">${tek ? slider("Benzerlik oranı k", "kx", kmin, kmax, step, st.kx) : slider("Yatay ölçek", "kx", kmin, kmax, step, st.kx) + slider("Dikey ölçek", "ky", kmin, kmax, step, st.ky)}</div><p class="se-info"></p>`;
    const mxX = Math.max(...shape.map((p) => p[0])), mxY = Math.max(...shape.map((p) => p[1]));
    const u = Math.min(560 / (mxX * (1 + kmax)), 300 / (mxY * kmax));
    const len = (ps) => ps.map((p, i) => { const q = ps[(i + 1) % ps.length]; return Math.hypot(q[0] - p[0], q[1] - p[1]); });
    const angs = (ps) => ps.map((p, i) => { const a = ps[(i + ps.length - 1) % ps.length], b = ps[(i + 1) % ps.length]; const v1 = [a[0] - p[0], a[1] - p[1]], v2 = [b[0] - p[0], b[1] - p[1]]; return (Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2))))) * 180) / Math.PI; });
    const area = (ps) => Math.abs(ps.reduce((s, [x1, y1], i) => { const [x2, y2] = ps[(i + 1) % ps.length]; return s + x1 * y2 - x2 * y1; }, 0)) / 2;
    const calc = () => { if (tek) st.ky = st.kx; const cp = shape.map(([x, y]) => [x * st.kx, y * st.ky]); const l0 = len(shape), l1 = len(cp), r = l1.map((v, i) => v / l0[i]); const benzer = r.every((v) => Math.abs(v - r[0]) < 1e-9); return { cp, l0, l1, r, benzer, es: benzer && Math.abs(r[0] - 1) < 1e-9, a0: angs(shape), a1: angs(cp) }; };
    function draw() {
      const R = calc(), H = mxY * kmax * u + 50, W = (mxX + mxX * kmax) * u + 90;
      const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg se-wide", role: "img", "aria-label": "Şekil ve ölçeklenmiş kopyası" });
      const draw1 = (ps, ox, cls, ls, an) => {
        const P = ([x, y]) => [ox + x * u, H - 30 - y * u];
        S("polygon", { points: ps.map((q) => P(q).join(",")).join(" "), class: cls }, svg);
        ps.forEach((p, i) => { const q = ps[(i + 1) % ps.length], m = P([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]); S("text", { x: m[0], y: m[1] + 5, class: "se-t se-tm se-halo" }, svg, fmt(ls[i], 1)); });
        if (cfg.acilar) ps.forEach((p, i) => { const P0 = P(p), cx = ps.reduce((s, q) => s + q[0], 0) / ps.length, cy = ps.reduce((s, q) => s + q[1], 0) / ps.length, C = P([cx, cy]), dx = C[0] - P0[0], dy = C[1] - P0[1], d = Math.hypot(dx, dy) || 1; S("text", { x: P0[0] + (dx / d) * 26, y: P0[1] + (dy / d) * 26 + 5, class: "se-s se-tm se-halo" }, svg, `${Math.round(an[i])}°`); });
      };
      draw1(shape, 30, "se-a", R.l0, R.a0);
      draw1(R.cp, 60 + mxX * u, R.benzer ? "se-b" : "se-x", R.l1, R.a1);
      el.querySelector(".se-host").replaceChildren(svg);
      const A0 = area(shape), A1 = area(R.cp);
      el.querySelector(".se-info").innerHTML = `Kenar oranları (kopya ÷ asıl): ${R.r.map((v) => fmt(v, 2)).join(" · ")}<br>${R.es ? `<span class="se-ok">Eş şekiller:</span> karşılıklı kenarlar ve açılar eşit.` : R.benzer ? `<span class="se-ok">Benzer şekiller:</span> bütün kenarlar ${fmt(R.r[0], 2)} katına çıktı, açılar değişmedi. Benzerlik oranı k = ${fmt(R.r[0], 2)}.` : `<span class="se-no">Benzer değil:</span> kenar oranları eşit değil${R.a0.every((v, i) => Math.abs(v - R.a1[i]) < 0.01) ? " (açılar aynı kalsa bile)" : ", açılar da değişti"}.`}<br>Alan: ${fmt(A0, 2)} → ${fmt(A1, 2)} (oran ${fmt(A1 / A0, 2)})${R.benzer ? ` = k² = ${fmt(R.r[0] ** 2, 2)}` : ""}`;
      setV(el, st);
    }
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const R = calc(); return { kx: st.kx, ky: st.ky, benzer: R.benzer ? 1 : 0, es: R.es ? 1 : 0, oran: R.benzer ? R.r[0] : null, alanOrani: area(R.cp) / area(shape) }; };
  });

  // ---------- 11. Temel orantı (Tales): DE ∥ BC ----------
  reg("e-tales", (el, cfg, changed) => {
    const AB = cfg.AB ?? 6, AC = cfg.AC ?? 9, BC = cfg.BC ?? 12, step = cfg.adim ?? 1;
    const st = { AD: cfg.AD ?? 2 };
    el.innerHTML = `<div class="se-host"></div>${slider("|AD|", "AD", step, AB - step, step, st.AD)}<p class="se-info"></p>`;
    const ax = (AB * AB - AC * AC + BC * BC) / (2 * BC), ay = Math.sqrt(AB * AB - ax * ax);
    const minX = Math.min(0, ax), maxX = Math.max(BC, ax), u = Math.min(520 / (maxX - minX), 250 / ay);
    const P = (x, y) => [40 + (x - minX) * u, 20 + (ay - y) * u + 10];
    const r6 = (x) => Math.round(x * 1e6) / 1e6;
    function draw() {
      const t = st.AD / AB, A = [ax, ay], B = [0, 0], C = [BC, 0];
      const D = [ax + t * (0 - ax), ay - t * ay], E = [ax + t * (BC - ax), ay - t * ay];
      const svg = S("svg", { viewBox: `0 0 ${(maxX - minX) * u + 80} ${ay * u + 70}`, class: "sim-svg se-wide", role: "img", "aria-label": "DE, BC'ye paralel" });
      const poly = (ps, cls) => S("polygon", { points: ps.map((p) => P(...p).join(",")).join(" "), class: cls }, svg);
      poly([A, B, C], "se-r0"); poly([A, D, E], "se-a");
      const seg = (p, q, lab, cls, off = 0) => { const [x1, y1] = P(...p), [x2, y2] = P(...q); S("line", { x1, y1, x2, y2, class: cls }, svg); S("text", { x: (x1 + x2) / 2 + off, y: (y1 + y2) / 2 + 5, class: "se-t se-tm se-halo" }, svg, lab); };
      const AE = (AC * st.AD) / AB, DE = (BC * st.AD) / AB;
      seg(A, D, fmt(st.AD, 2), "se-bline", -18); seg(D, B, fmt(AB - st.AD, 2), "se-line", -18); seg(A, E, fmt(AE, 2), "se-bline", 18); seg(E, C, fmt(AC - AE, 2), "se-line", 18);
      seg(D, E, `DE = ${fmt(DE, 2)}`, "se-wline"); seg(B, C, `BC = ${BC}`, "se-line");
      [[A, "A", 0, -12], [B, "B", -14, 8], [C, "C", 14, 8], [D, "D", -16, 0], [E, "E", 16, 0]].forEach(([p, n, dx, dy]) => { const [x, y] = P(...p); S("circle", { cx: x, cy: y, r: 4, class: "se-dot" }, svg); S("text", { x: x + dx, y: y + dy, class: "se-t se-tm se-halo" }, svg, n); });
      el.querySelector(".se-host").replaceChildren(svg);
      el.querySelector(".se-info").innerHTML = `|AB| = ${AB}, |AC| = ${AC}, |BC| = ${BC}<br>|AD| / |AB| = ${fmt(st.AD, 2)} / ${AB} · |AE| / |AC| = ${fmt(AE, 2)} / ${AC} · |DE| / |BC| = ${fmt(DE, 2)} / ${BC} → hepsi <b>${fmt(t, 3)}</b><br>|AD| / |DB| = |AE| / |EC| = <b>${fmt(st.AD / (AB - st.AD), 3)}</b>`;
      setV(el, st);
    }
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const AE = (AC * st.AD) / AB, DE = (BC * st.AD) / AB; return { AD: st.AD, AE: r6(AE), DE: r6(DE), DB: r6(AB - st.AD), EC: r6(AC - AE), oran: r6(st.AD / AB) }; };
  });

  // ---------- 12. K-K-A belirsizliği: verilen açı, komşu kenar ve karşı kenar ----------
  reg("e-kka", (el, cfg, changed) => {
    const Adeg = cfg.aci ?? 40, b = cfg.b ?? 6, max = cfg.max ?? 10, step = cfg.adim ?? 0.5;
    const st = { a: cfg.a ?? 5 };
    el.innerHTML = `<div class="se-host"></div>${slider("|BC| = a", "a", step, max, step, st.a)}<p class="se-info"></p>`;
    const r = (Adeg * Math.PI) / 180, Cx = b * Math.cos(r), Cy = b * Math.sin(r);
    const sols = () => { const d = st.a * st.a - Cy * Cy; if (d < -1e-9) return []; const s = Math.sqrt(Math.max(0, d)); const xs = s < 1e-9 ? [Cx] : [Cx - s, Cx + s]; return xs.filter((x) => x > 1e-9); };
    const u = 36, X = (x) => 30 + (x + 0.5) * u, Y = (y) => 330 - (y + 1) * u;
    function draw() {
      const xs = sols();
      const svg = S("svg", { viewBox: "0 0 640 340", class: "sim-svg se-wide", role: "img", "aria-label": `${xs.length} üçgen` });
      S("line", { x1: X(0), y1: Y(0), x2: 630, y2: Y(0), class: "se-axis" }, svg);
      xs.forEach((x, i) => S("polygon", { points: `${X(0)},${Y(0)} ${X(Cx)},${Y(Cy)} ${X(x)},${Y(0)}`, class: i ? "se-b" : "se-a", "fill-opacity": 0.7 }, svg));
      S("circle", { cx: X(Cx), cy: Y(Cy), r: st.a * u, class: "se-dash" }, svg);
      S("line", { x1: X(0), y1: Y(0), x2: X(Cx), y2: Y(Cy), class: "se-line" }, svg);
      S("text", { x: X(Cx / 2) - 14, y: Y(Cy / 2), class: "se-t se-tm se-halo" }, svg, `b = ${b}`);
      xs.forEach((x, i) => { S("line", { x1: X(Cx), y1: Y(Cy), x2: X(x), y2: Y(0), class: i ? "se-gline" : "se-bline" }, svg); S("circle", { cx: X(x), cy: Y(0), r: 6, class: i ? "se-dot2" : "se-dot" }, svg); S("text", { x: X(x), y: Y(0) + 26, class: "se-t se-tm" }, svg, `B${xs.length > 1 ? i + 1 : ""}`); });
      S("text", { x: X(0), y: Y(0) + 26, class: "se-t se-tm" }, svg, "A");
      S("text", { x: X(Cx), y: Y(Cy) - 12, class: "se-t se-tm se-halo" }, svg, "C");
      S("text", { x: X(0) + 40, y: Y(0) - 8, class: "se-s" }, svg, `${Adeg}°`);
      el.querySelector(".se-host").replaceChildren(svg);
      const h = Cy;
      el.querySelector(".se-info").innerHTML = `Verilen: A açısı ${Adeg}°, |AC| = ${b}, |BC| = ${fmt(st.a, 1)}. C'den ışına uzaklık b · sin A ≈ ${fmt(h, 2)}.<br><b>${xs.length === 0 ? "Hiç üçgen yok" : xs.length === 1 ? "Tek üçgen" : "İki farklı üçgen"}</b> ${xs.length === 2 ? "— aynı üç bilgiyle iki farklı üçgen çizilebiliyor; bu yüzden K-K-A bir eşlik koşulu değildir." : xs.length === 0 ? "— BC kenarı ışına ulaşamıyor." : ""}`;
      setV(el, st);
    }
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => ({ a: st.a, sayi: sols().length });
  });

  // ---------- 13. Silindir ve koni: boyutlar, açınım, alan ve hacim ----------
  reg("e-silindir", (el, cfg, changed) => {
    const koni = cfg.cisim === "koni", rmax = cfg.rmax ?? 5, hmax = cfg.hmax ?? 10;
    const st = { r: cfg.r ?? 2, h: cfg.h ?? 5 };
    let net = !!cfg.acinim;
    el.innerHTML = `<div class="plane-wrap"><div class="se-host"></div><div class="plane-ctrl"><p class="se-info"></p>${slider("Yarıçap r", "r", 1, rmax, 1, st.r)}${slider("Yükseklik h", "h", 1, hmax, 1, st.h)}<button type="button" class="btn btn-outline btn-small se-net"></button></div></div>`;
    function draw() {
      const { r, h } = st, svg = S("svg", { viewBox: "0 0 400 340", class: "sim-svg", role: "img", "aria-label": koni ? "Koni" : "Silindir" });
      const l = Math.sqrt(r * r + h * h);
      if (!net) {
        const u = Math.min(150 / rmax, 240 / hmax), rx = r * u, ry = rx * 0.32, cx = 200, by = 310 - ry, ty = by - h * u;
        if (!koni) {
          S("path", { d: `M${cx - rx},${by} L${cx - rx},${ty} A${rx},${ry} 0 0 1 ${cx + rx},${ty} L${cx + rx},${by} A${rx},${ry} 0 0 1 ${cx - rx},${by} Z`, class: "se-a" }, svg);
          S("ellipse", { cx, cy: ty, rx, ry, class: "se-c" }, svg);
          S("path", { d: `M${cx - rx},${by} A${rx},${ry} 0 0 1 ${cx + rx},${by}`, class: "se-dash" }, svg);
          S("line", { x1: cx, y1: ty, x2: cx + rx, y2: ty, class: "se-line", "stroke-width": 2 }, svg);
          S("text", { x: cx + rx / 2, y: ty - 8, class: "se-t se-tm se-halo" }, svg, `r = ${r}`);
        } else {
          S("path", { d: `M${cx - rx},${by} L${cx},${ty} L${cx + rx},${by} A${rx},${ry} 0 0 1 ${cx - rx},${by} Z`, class: "se-a" }, svg);
          S("path", { d: `M${cx - rx},${by} A${rx},${ry} 0 0 1 ${cx + rx},${by}`, class: "se-dash" }, svg);
          S("line", { x1: cx, y1: by, x2: cx + rx, y2: by, class: "se-line", "stroke-width": 2 }, svg);
          S("text", { x: cx + rx / 2, y: by - 6, class: "se-t se-tm se-halo" }, svg, `r = ${r}`);
          S("text", { x: cx + rx / 2 + 14, y: (by + ty) / 2, class: "se-t se-halo" }, svg, `ℓ ≈ ${fmt(l, 2)}`);
        }
        S("line", { x1: cx, y1: ty, x2: cx, y2: by, class: "se-dash" }, svg);
        S("text", { x: cx - 8, y: (ty + by) / 2, class: "se-t se-te se-halo" }, svg, `h = ${h}`);
      } else if (!koni) {
        const W = 2 * Math.PI * r, Ht = h + 4 * r, u = Math.min(370 / W, 320 / Ht), ox = (400 - W * u) / 2, oy = (340 - Ht * u) / 2;
        S("rect", { x: ox, y: oy + 2 * r * u, width: W * u, height: h * u, class: "se-a" }, svg);
        S("circle", { cx: 200, cy: oy + r * u, r: r * u, class: "se-c" }, svg);
        S("circle", { cx: 200, cy: oy + (2 * r + h + r) * u, r: r * u, class: "se-c" }, svg);
        S("text", { x: 200, y: oy + (2 * r + h / 2) * u + 6, class: "se-t se-tm se-halo" }, svg, `2πr = ${2 * r}π ≈ ${fmt(W, 2)}`);
        S("text", { x: ox + W * u - 6, y: oy + (2 * r + h / 2) * u + 26, class: "se-s se-te se-halo" }, svg, `h = ${h}`);
      } else {
        const th = (360 * r) / l, up = th > 180 ? -l * Math.cos((th * Math.PI) / 360) : 0, Ht = up + l + 2 * r, Wd = th >= 180 ? 2 * l : 2 * l * Math.sin((th * Math.PI) / 360), u = Math.min(370 / Wd, 320 / Ht), cx = 200, oy = (340 - Ht * u) / 2 + up * u;
        const a0 = Math.PI / 2 - (th * Math.PI) / 360, a1 = Math.PI / 2 + (th * Math.PI) / 360, R = l * u;
        const p0 = [cx + R * Math.cos(a0), oy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), oy + R * Math.sin(a1)];
        S("path", { d: `M${cx},${oy} L${p0[0]},${p0[1]} A${R},${R} 0 ${th > 180 ? 1 : 0} 1 ${p1[0]},${p1[1]} Z`, class: "se-a" }, svg);
        S("circle", { cx, cy: oy + (l + r) * u, r: r * u, class: "se-c" }, svg);
        S("text", { x: cx, y: oy + 22, class: "se-s se-tm" }, svg, `${fmt(th, 1)}°`);
        S("text", { x: cx + 6, y: oy + R * 0.55, class: "se-t se-halo" }, svg, `ℓ ≈ ${fmt(l, 2)}`);
      }
      el.querySelector(".se-host").replaceChildren(svg);
      el.querySelector(".se-net").textContent = net ? (koni ? "Koniyi göster" : "Silindiri göster") : "Açınımı göster";
      el.querySelector(".se-info").innerHTML = koni
        ? `Ana doğru ℓ = √(r² + h²) = √${r * r + h * h} ≈ <b>${fmt(l, 2)}</b><br>Açınımda yanal yüz bir daire dilimidir. Dilimin yay uzunluğu taban çevresine (2πr) eşittir; merkez açısı 360° · r / ℓ ≈ <b>${fmt((360 * r) / l, 1)}°</b>`
        : `Taban alanı = πr² = <b>${r * r}π</b><br>Yanal alan = 2πr · h = <b>${2 * r * h}π</b><br>Yüzey alanı = 2πr² + 2πrh = <b>${2 * r * r + 2 * r * h}π</b> ≈ ${fmt((2 * r * r + 2 * r * h) * 3.14, 2)} (π ≈ 3,14)<br>Hacim = πr² · h = <b>${r * r * h}π</b> ≈ ${fmt(r * r * h * 3.14, 2)}`;
      setV(el, st);
    }
    el.querySelector(".se-net").addEventListener("click", () => { net = !net; draw(); changed(); });
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const { r, h } = st, l = Math.sqrt(r * r + h * h); return koni ? { r, h, l, aci: (360 * r) / l, acinim: net ? 1 : 0 } : { r, h, hacimPi: r * r * h, yuzeyPi: 2 * r * r + 2 * r * h, yanalPi: 2 * r * h, tabanPi: r * r, acinim: net ? 1 : 0 }; };
  });

  // ---------- 14. Grafik dönüştürme: sütun, çizgi, daire; eksen tabanı ----------
  reg("e-grafik-donustur", (el, cfg, changed) => {
    const labels = cfg.labels, ser = cfg.seriler ?? [{ ad: cfg.ad ?? "", values: cfg.values }];
    const vals = ser.map((s) => [...s.values]), max = cfg.max ?? 10, multi = ser.length > 1;
    const TUR = ["sutun", "cizgi", "daire"], ADI = ["Sütun", "Çizgi", "Daire"];
    const turler = (cfg.turler ?? TUR).filter((t) => !(multi && t === "daire"));
    let tur = TUR.indexOf(cfg.tur ?? turler[0]);
    const st = { taban: cfg.taban ?? 0 };
    const duzenle = cfg.duzenle !== false && !multi, birim = cfg.birim ?? "";
    el.innerHTML = `<div class="se-row">${turler.map((t) => tog(ADI[TUR.indexOf(t)] + " grafiği", `data-t="${TUR.indexOf(t)}"`, TUR.indexOf(t) === tur)).join("")}</div>
      ${multi ? `<p class="se-info">${ser.map((s, i) => `<span class="se-sw s${i}"></span>${s.ad}`).join(" &nbsp; ")}</p>` : ""}
      <div class="se-host"></div>${cfg.tabanAyar ? slider("Dikey eksenin başladığı değer", "taban", 0, cfg.tabanMax ?? Math.floor(max * 0.8), cfg.tabanAdim ?? 1, st.taban) : ""}<p class="se-info se-st"></p>`;
    const W = 620, H = 240, L = 50, B = 20, n = labels.length, cw = (W - L) / n;
    const svg = S("svg", { viewBox: `0 0 ${W} ${H + B + 34}`, class: "sim-svg se-wide" + (duzenle ? " se-drag" : ""), role: "group", "aria-label": "Grafik" });
    el.querySelector(".se-host").replaceChildren(svg);
    const Yv = (v) => B + H - (Math.max(0, v - st.taban) / (max - st.taban)) * H;
    function draw(focusI) {
      svg.replaceChildren();
      if (tur < 2) {
        const stepG = (max - st.taban) / 5;
        for (let i = 0; i <= 5; i++) { const v = st.taban + i * stepG; S("line", { x1: L, x2: W, y1: Yv(v), y2: Yv(v), class: "se-grid" }, svg); S("text", { x: L - 6, y: Yv(v) + 4, class: "se-s se-te" }, svg, fmt(v, 1)); }
        if (st.taban > 0) S("text", { x: L + 4, y: B + H + 4, class: "se-s" }, svg, "≈");
        labels.forEach((lab, i) => S("text", { x: L + i * cw + cw / 2, y: H + B + 22, class: "se-s se-tm" }, svg, lab));
        vals.forEach((vs, si) => {
          if (tur === 0) {
            const bw = (cw * 0.7) / vals.length;
            vs.forEach((v, i) => { const x = L + i * cw + cw * 0.15 + si * bw; const r = S("rect", { x, y: Yv(v), width: bw - 2, height: Yv(st.taban) - Yv(v), rx: 2, class: `se-p${si}${duzenle ? " se-focus" : ""}`, "data-i": i }, svg); if (!multi) S("text", { x: x + bw / 2, y: Yv(v) - 6, class: "se-t se-tm" }, svg, fmt(v, 1)); if (duzenle) kb(r, i); });
          } else {
            S("polyline", { points: vs.map((v, i) => `${L + i * cw + cw / 2},${Yv(v)}`).join(" "), class: ["se-bline", "se-gline", "se-wline"][si] }, svg);
            vs.forEach((v, i) => { const c = S("circle", { cx: L + i * cw + cw / 2, cy: Yv(v), r: 7, class: `${si ? "se-dot2" : "se-dot"}${duzenle ? " se-focus" : ""}`, "data-i": i }, svg); if (!multi) S("text", { x: L + i * cw + cw / 2, y: Yv(v) - 14, class: "se-t se-tm se-halo" }, svg, fmt(v, 1)); if (duzenle) kb(c, i); });
          }
        });
      } else {
        const vs = vals[0], tot = vs.reduce((a, b) => a + b, 0), cx = 170, cy = 140, R = 115;
        let a0 = -Math.PI / 2;
        vs.forEach((v, i) => {
          const a1 = a0 + (tot ? (v / tot) * 2 * Math.PI : 0);
          if (v > 0) {
            if (v === tot) S("circle", { cx, cy, r: R, class: `se-p${i % 6} se-pie` }, svg);
            else S("path", { d: `M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} A${R},${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} Z`, class: `se-p${i % 6} se-pie` }, svg);
          }
          const y = 40 + i * 30;
          S("rect", { x: 320, y: y - 13, width: 16, height: 16, rx: 3, class: `se-p${i % 6}` }, svg);
          S("text", { x: 344, y, class: "se-t" }, svg, `${labels[i]}: ${fmt(v, 1)} → %${fmt(tot ? (v / tot) * 100 : 0, 1)} · ${fmt(tot ? (v / tot) * 360 : 0, 1)}°`);
          a0 = a1;
        });
      }
      const vs = vals[0], tot = vs.reduce((a, b) => a + b, 0), mx = Math.max(...vs), mn = Math.min(...vs);
      let info = `Toplam: <b>${fmt(tot, 1)}${birim ? " " + birim : ""}</b>`;
      if (tur === 2) info += `<br><span class="se-muted">Bir dilimin merkez açısı = değer ÷ toplam × 360°.</span>`;
      if (tur < 2 && cfg.tabanAyar) {
        const go = mn > st.taban ? (mx - st.taban) / (mn - st.taban) : null;
        info += `<br>En büyük ÷ en küçük değer = ${fmt(mx, 1)} ÷ ${fmt(mn, 1)} = <b>${mn ? fmt(mx / mn, 2) : "—"}</b> · Grafikteki boy oranı = <b>${go === null ? "—" : fmt(go, 2)}</b>${st.taban > 0 ? ` <span class="se-no">Eksen ${fmt(st.taban, 1)}'den başlıyor: farklar abartılı görünür.</span>` : ` <span class="se-ok">Eksen 0'dan başlıyor.</span>`}`;
      }
      if (duzenle && tur < 2) info += `<br><span class="se-muted">Değeri değiştirmek için sütunu/noktayı sürükle ya da seçip ok tuşlarını kullan.</span>`;
      el.querySelector(".se-st").innerHTML = info;
      el.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.t === tur));
      setV(el, st);
      if (focusI !== undefined) svg.querySelector(`[data-i="${focusI}"]`)?.focus();
    }
    function kb(node, i) {
      node.setAttribute("tabindex", 0); node.setAttribute("role", "slider"); node.setAttribute("aria-label", `${labels[i]}: ${vals[0][i]}`);
      node.addEventListener("keydown", (e) => { const d = arrowDelta(e); if (d) { e.preventDefault(); vals[0][i] = Math.max(0, Math.min(max, vals[0][i] + d * (cfg.adim ?? 1))); draw(i); changed(); } });
    }
    if (duzenle) {
      let di = -1;
      dragOn(svg, (p, ev, first) => {
        if (tur === 2) return;
        if (first) di = Math.floor((p.x - L) / cw);
        if (di < 0 || di >= n) return;
        const s = cfg.adim ?? 1, v = st.taban + ((B + H - p.y) / H) * (max - st.taban);
        vals[0][di] = Math.max(0, Math.min(max, Math.round(v / s) * s)); draw(); changed();
      });
    }
    el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { tur = +b.dataset.t; draw(); changed(); }));
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const vs = vals[0], mx = Math.max(...vs), mn = Math.min(...vs); return { tur, taban: st.taban, toplam: vs.reduce((a, b) => a + b, 0), gercekOran: mn > 0 ? mx / mn : null, gorselOran: mn > st.taban ? (mx - st.taban) / (mn - st.taban) : null, ...Object.fromEntries(vs.map((v, i) => [`v${i}`, v])) }; };
  });

  // ---------- 15. Torba: renkli toplar, olasılık ve geri koyarak çekiliş ----------
  reg("e-torba", (el, cfg, changed) => {
    const C = [["k", "kırmızı"], ["y", "yeşil"], ["s", "sarı"]].filter(([k]) => !cfg.renkler || cfg.renkler.includes(k));
    const cnt = { k: cfg.k ?? 3, y: cfg.y ?? 5, s: cfg.s ?? 0 }, mx = cfg.max ?? 10;
    const ayarla = cfg.ayarla !== false, cek = cfg.cek !== false;
    let fr = { k: 0, y: 0, s: 0 }, draws = 0, last = null;
    el.innerHTML = `<div class="se-host"></div>${ayarla ? `<div class="se-row">${C.map(([k, n]) => `<span><span class="se-sw ${k}"></span>${n}</span><button type="button" class="btn btn-outline btn-small" data-a="-${k}" aria-label="Bir ${n} top çıkar">−</button><b class="num" data-c="${k}"></b><button type="button" class="btn btn-outline btn-small" data-a="+${k}" aria-label="Bir ${n} top ekle">+</button>`).join(" ")}</div>` : ""}
      ${cek ? `<div class="se-row"><button type="button" class="btn btn-outline btn-small" data-d="1">1 top çek</button><button type="button" class="btn btn-outline btn-small" data-d="10">10 kez çek</button><button type="button" class="btn btn-outline btn-small" data-d="100">100 kez çek</button><button type="button" class="btn btn-outline btn-small" data-d="0">Sıfırla</button></div>` : ""}<p class="se-info"></p>`;
    const tot = () => C.reduce((s, [k]) => s + cnt[k], 0);
    function draw() {
      const n = tot();
      const svg = S("svg", { viewBox: `0 0 ${cek ? 620 : 300} 250`, class: `sim-svg${cek ? " se-wide" : ""}`, role: "img", "aria-label": `Torbada ${C.map(([k, nm]) => `${cnt[k]} ${nm}`).join(", ")} top` });
      S("path", { d: "M40,60 Q20,240 150,240 Q280,240 260,60 Z", class: "se-bag" }, svg);
      S("line", { x1: 30, y1: 60, x2: 270, y2: 60, class: "se-line" }, svg);
      let i = 0;
      for (const [k] of C) for (let j = 0; j < cnt[k]; j++, i++) { const row = Math.floor(i / 7), col = i % 7; S("circle", { cx: 72 + col * 26 + (row % 2) * 10, cy: 220 - row * 26, r: 11, class: `se-ball-${k}` }, svg); }
      if (last) { S("circle", { cx: 150, cy: 30, r: 14, class: `se-ball-${last}` }, svg); S("text", { x: 172, y: 36, class: "se-s" }, svg, "son çekilen"); }
      if (cek) {
        const X0 = 320, bw = 80, Hc = 180, Y0 = 220;
        S("line", { x1: X0, x2: 610, y1: Y0, y2: Y0, class: "se-axis" }, svg);
        [0, 0.5, 1].forEach((g) => { S("line", { x1: X0, x2: 610, y1: Y0 - g * Hc, y2: Y0 - g * Hc, class: "se-grid" }, svg); S("text", { x: X0 - 4, y: Y0 - g * Hc + 4, class: "se-s se-te" }, svg, `%${g * 100}`); });
        C.forEach(([k, nm], j) => {
          const x = X0 + 20 + j * (bw + 10), f = draws ? fr[k] / draws : 0, p = n ? cnt[k] / n : 0;
          S("rect", { x, y: Y0 - f * Hc, width: bw - 10, height: f * Hc, rx: 3, class: `se-ball-${k}` }, svg);
          S("line", { x1: x - 4, x2: x + bw - 6, y1: Y0 - p * Hc, y2: Y0 - p * Hc, class: "dc-theo" }, svg);
          S("text", { x: x + (bw - 10) / 2, y: Y0 + 20, class: "se-s se-tm" }, svg, nm);
        });
      }
      el.querySelector(".se-host").replaceChildren(svg);
      el.querySelectorAll("[data-c]").forEach((b) => { b.textContent = cnt[b.dataset.c]; });
      el.querySelectorAll("[data-a]").forEach((b) => { const k = b.dataset.a[1]; b.disabled = b.dataset.a[0] === "-" ? cnt[k] === 0 : cnt[k] >= mx; });
      el.querySelectorAll("[data-d]").forEach((b) => { if (+b.dataset.d) b.disabled = n === 0; });
      let info = `Torbada ${n} top var; her topun çekilme şansı eşit.<br>` + C.map(([k, nm]) => `P(${nm}) = ${cnt[k]}/${n || 0}${n && gcd(cnt[k], n) > 1 && cnt[k] ? ` = ${frac(cnt[k], n)}` : ""}`).join(" · ");
      if (cek) info += `<br>Çekiliş: <b class="num">${draws}</b>${draws ? " · Göreli sıklık: " + C.map(([k, nm]) => `${nm} ${fr[k]}/${draws} ≈ %${fmt((fr[k] / draws) * 100, 1)}`).join(" · ") : ""} <span class="se-muted">(kesikli çizgi: teorik olasılık)</span>`;
      el.querySelector(".se-info").innerHTML = info;
    }
    const reset = () => { fr = { k: 0, y: 0, s: 0 }; draws = 0; last = null; };
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => { const k = b.dataset.a[1]; cnt[k] += b.dataset.a[0] === "+" ? 1 : -1; reset(); draw(); changed(); el.querySelector(`[data-a="${b.dataset.a}"]`)?.focus(); }));
    el.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
      const m = +b.dataset.d;
      if (!m) reset();
      else { const n = tot(); for (let i = 0; i < m; i++) { let r = Math.floor(Math.random() * n); for (const [k] of C) { if (r < cnt[k]) { fr[k]++; last = k; break; } r -= cnt[k]; } draws++; } }
      draw(); changed();
    }));
    draw();
    return () => { const n = tot(); return { k: cnt.k, y: cnt.y, s: cnt.s, toplam: n, pK: n ? cnt.k / n : null, pY: n ? cnt.y / n : null, pS: n ? cnt.s / n : null, cekilis: draws, frekK: draws ? fr.k / draws : null, farkK: draws && n ? Math.abs(fr.k / draws - cnt.k / n) : null }; };
  });

  // ---------- 16. Sayı kümeleri: sayıyı ait olduğu en küçük kümeye yerleştir ----------
  reg("e-sayi-kumeleri", (el, cfg, changed) => {
    const items = cfg.sayilar ?? [["7", "N"], ["−3", "Z"], ["0", "N"], ["2/5", "Q"], ["√2", "I"], ["−1,5", "Q"], ["π", "I"], ["√9", "N"], ["0,333…", "Q"], ["√5", "I"]];
    const UST = { N: "Z", Z: "Q", Q: "R", I: "R", R: null };
    const AD = { R: "Gerçek sayılar ℝ", Q: "Rasyonel sayılar ℚ", I: "İrrasyonel sayılar ℚ′", Z: "Tam sayılar ℤ", N: "Doğal sayılar ℕ" };
    const contains = (X, Y) => { for (let s = Y; s; s = UST[s]) if (s === X) return true; return false; };
    let idx = 0, hata = 0, msg = "";
    const placed = { N: [], Z: [], Q: [], I: [], R: [] };
    el.innerHTML = `<p class="se-cur"></p><div class="se-host"></div><p class="se-info"></p><div class="se-row"><button type="button" class="btn btn-outline btn-small se-reset">Baştan</button></div>`;
    const REG = { R: [6, 6, 608, 330, "se-r0"], Q: [20, 40, 400, 280, "se-r1"], I: [436, 40, 164, 280, "se-r2"], Z: [36, 82, 270, 230, "se-r3"], N: [52, 124, 130, 180, "se-r4"] };
    const SLOT = { N: [117, 160], Z: [244, 125], Q: [362, 85], I: [518, 85], R: [560, 30] };
    function draw() {
      const svg = S("svg", { viewBox: "0 0 620 340", class: "sim-svg se-wide", role: "group", "aria-label": "Sayı kümeleri şeması" });
      for (const k of ["R", "Q", "I", "Z", "N"]) {
        const [x, y, w, h, cls] = REG[k];
        const r = S("rect", { x, y, width: w, height: h, rx: 14, class: `${cls} se-reg`, tabindex: idx < items.length ? 0 : -1, role: "button", "aria-label": AD[k], "data-k": k }, svg);
        r.addEventListener("click", () => pick(k)); r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(k); } });
        S("text", { x: x + 10, y: y + 22, class: "se-t", "pointer-events": "none" }, svg, k === "R" ? "ℝ" : AD[k].split(" ").pop());
      }
      for (const k in placed) placed[k].forEach((t, i) => { const [x, y] = SLOT[k]; S("text", { x, y: y + i * 24, class: "se-t se-tm se-halo", "pointer-events": "none" }, svg, t); });
      el.querySelector(".se-host").replaceChildren(svg);
      el.querySelector(".se-cur").innerHTML = idx < items.length ? `Sayı: <span class="se-card">${items[idx][0]}</span> <span class="se-muted">— ait olduğu <b>en küçük</b> kümeye dokun (${idx + 1}/${items.length})</span>` : `<span class="se-ok">Hepsi yerleşti!</span> Yanlış deneme: ${hata}`;
      el.querySelector(".se-info").innerHTML = msg || `<span class="se-muted">ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ve ℚ′ ⊂ ℝ. Rasyonel ve irrasyonel sayıların ortak elemanı yoktur.</span>`;
    }
    function pick(k) {
      if (idx >= items.length) return;
      const [t, ans] = items[idx];
      if (k === ans) { placed[k].push(t); msg = `<span class="se-ok">Doğru:</span> ${t} ∈ ${AD[k]}${UST[k] && UST[k] !== "R" ? ` (ve elbette ${AD[UST[k]].split(" ").pop()} kümesinde de)` : ""}.`; idx++; }
      else { hata++; msg = contains(k, ans) ? `<span class="se-no">${t} bu kümede, ama daha küçük bir kümeye de ait.</span>` : `<span class="se-no">${t} bu kümenin elemanı değil.</span>`; }
      draw(); changed();
      el.querySelector(`[data-k="${k}"]`)?.focus();
    }
    el.querySelector(".se-reset").addEventListener("click", () => { idx = 0; hata = 0; msg = ""; for (const k in placed) placed[k] = []; draw(); changed(); });
    draw();
    return () => ({ yerlesen: idx, hata, toplam: items.length, bitti: idx >= items.length ? 1 : 0 });
  });

  // ---------- 17. Doğrusal fonksiyon dönüşümü: g(x) = a(x − r) + k; isteğe bağlı |g(x)| ----------
  reg("e-dogru-donusum", (el, cfg, changed) => {
    const AV = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3];
    const mut = !!cfg.mutlak;
    const st = { ai: Math.max(0, AV.indexOf(cfg.a ?? 1)), r: cfg.r ?? 0, k: cfg.k ?? 0 };
    el.innerHTML = `<div class="plane-wrap"><div class="plane"></div><div class="plane-ctrl"><p class="eq se-eq"></p>${slider("a (eğim)", "ai", 0, AV.length - 1, 1, st.ai, num(AV[st.ai]))}${slider("r (yatay öteleme)", "r", -4, 4, 1, st.r)}${slider("k (dikey öteleme)", "k", -4, 4, 1, st.k)}<p class="se-info"></p></div></div>`;
    const Sc = 28, O = 200, X = (v) => O + v * Sc, Y = (v) => O - v * Sc;
    const sgn = (v) => (v < 0 ? ` − ${num(-v)}` : ` + ${num(v)}`);
    function draw() {
      const a = AV[st.ai], { r, k } = st, g = (x) => a * (x - r) + k, f = mut ? (x) => Math.abs(g(x)) : g, b = k - a * r, z = r - k / a;
      const svg = S("svg", { viewBox: "0 0 400 400", class: "sim-svg plane-svg", role: "img", "aria-label": "Doğrusal fonksiyon grafiği" });
      for (let i = -7; i <= 7; i++) { S("line", { x1: X(i), y1: 0, x2: X(i), y2: 400, class: i ? "pl-grid" : "pl-axis" }, svg); S("line", { x1: 0, y1: Y(i), x2: 400, y2: Y(i), class: i ? "pl-grid" : "pl-axis" }, svg); if (i && i % 2 === 0) { S("text", { x: X(i), y: O + 16, class: "pl-num" }, svg, i); S("text", { x: O - 6, y: Y(i) + 4, class: "pl-num pl-numy" }, svg, i); } }
      S("line", { x1: X(-8), y1: Y(-8), x2: X(8), y2: Y(8), class: "se-dash" }, svg);
      if (mut) { S("line", { x1: X(-8), y1: Y(g(-8)), x2: X(8), y2: Y(g(8)), class: "se-dash" }, svg); S("polyline", { points: `${X(-8)},${Y(f(-8))} ${X(z)},${Y(0)} ${X(8)},${Y(f(8))}`, class: "pl-line", fill: "none" }, svg); }
      else S("line", { x1: X(-8), y1: Y(g(-8)), x2: X(8), y2: Y(g(8)), class: "pl-line" }, svg);
      S("circle", { cx: X(r), cy: Y(mut ? Math.abs(k) : k), r: 6, class: "se-dot2" }, svg);
      for (const [px, py] of cfg.points || []) { const hit = Math.abs(f(px) - py) < 1e-9; S("circle", { cx: X(px), cy: Y(py), r: 7, class: hit ? "pl-pt hit" : "pl-pt" }, svg); S("text", { x: X(px) + 10, y: Y(py) - 10, class: "pl-ptl" }, svg, `(${minus(px)}, ${minus(py)})`); }
      el.querySelector(".plane").replaceChildren(svg);
      const inner = r === 0 ? "x" : `x${sgn(-r)}`, aS = a === 1 ? "" : a === -1 ? "−" : num(a);
      const gs = `${aS}${r === 0 ? "x" : `(${inner})`}${k ? sgn(k) : ""}`, simp = `${a === 1 ? "" : a === -1 ? "−" : num(a)}x${b ? sgn(b) : ""}`;
      el.querySelector(".se-eq").textContent = mut ? `m(x) = |${gs}|` : `g(x) = ${gs}`;
      el.querySelector(".se-info").innerHTML = mut
        ? `İçerideki doğru: ${simp} (kesikli). Sıfırı x = ${num(z)}.<br>m(x) = |g(x)|: g'nin x ekseninin altında kalan parçası yukarı katlanır. En küçük değer 0, x = ${num(z)}'de.<br>${a > 0 ? `x < ${num(z)} için azalan, x > ${num(z)} için artan.` : `x < ${num(z)} için azalan, x > ${num(z)} için artan.`}`
        : `Sadeleşmiş hâli: <b>g(x) = ${simp}</b><br>Eğim ${num(a)} → ${a > 0 ? "artan" : "azalan"} · y-eksenini (0, ${num(b)}) noktasında keser · Sıfırı x = ${num(z)}<br>g(x) > 0 ⇔ x ${a > 0 ? ">" : "<"} ${num(z)} <span class="se-muted">(kesikli çizgi: f(x) = x; yeşil nokta (r, k), doğru bu noktadan geçer)</span>`;
      setV(el, st, { ai: (i) => num(AV[i]) });
    }
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const a = AV[st.ai], b = st.k - a * st.r; return { a, r: st.r, k: st.k, egim: a, kesim: b, sifir: st.r - st.k / a }; };
  });

  // ---------- 18. İki doğrusal model: karşılaştırma ve kesişim ----------
  reg("e-iki-dogru", (el, cfg, changed) => {
    const F = cfg.dogrular ?? [{ ad: "A", m: 2, n: 100 }, { ad: "B", m: 5, n: 40 }];
    const xmax = cfg.xmax ?? 40, ymax = cfg.ymax ?? 300, xt = cfg.xtick ?? 10, yt = cfg.ytick ?? 50, step = cfg.adim ?? 1, birim = cfg.birim ?? "", xad = cfg.xad ?? "x";
    const st = { x: cfg.x ?? 0 }, id = `se-clip-${++uid}`;
    el.innerHTML = `<div class="se-host"></div>${slider(xad, "x", 0, xmax, step, st.x)}<p class="se-info"></p>`;
    const W = 620, H = 330, L = 56, Bt = 290, Tp = 14, R = 600, X = (x) => L + (x / xmax) * (R - L), Y = (y) => Bt - (y / ymax) * (Bt - Tp);
    const val = (f, x) => f.m * x + f.n;
    const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg se-drag se-wide", role: "img", "aria-label": "İki doğrusal model" });
    el.querySelector(".se-host").replaceChildren(svg);
    function draw() {
      svg.replaceChildren();
      const cp = S("clipPath", { id }, S("defs", {}, svg)); S("rect", { x: L, y: Tp, width: R - L, height: Bt - Tp }, cp);
      for (let x = 0; x <= xmax; x += xt) { S("line", { x1: X(x), x2: X(x), y1: Tp, y2: Bt, class: "se-grid" }, svg); S("text", { x: X(x), y: Bt + 20, class: "se-s se-tm" }, svg, x); }
      for (let y = 0; y <= ymax; y += yt) { S("line", { x1: L, x2: R, y1: Y(y), y2: Y(y), class: "se-grid" }, svg); S("text", { x: L - 6, y: Y(y) + 4, class: "se-s se-te" }, svg, y); }
      S("line", { x1: L, y1: Bt, x2: R, y2: Bt, class: "se-axis" }, svg); S("line", { x1: L, y1: Tp, x2: L, y2: Bt, class: "se-axis" }, svg);
      S("text", { x: R, y: H - 4, class: "se-s se-te" }, svg, xad);
      const g = S("g", { "clip-path": `url(#${id})` }, svg);
      F.forEach((f, i) => S("line", { x1: X(0), y1: Y(val(f, 0)), x2: X(xmax), y2: Y(val(f, xmax)), class: ["se-bline", "se-gline"][i] }, g));
      S("line", { x1: X(st.x), x2: X(st.x), y1: Tp, y2: Bt, class: "se-dash" }, svg);
      const ys = F.map((f) => val(f, st.x)), eq = Math.abs(ys[0] - ys[1]) < 1e-9;
      F.forEach((f, i) => { if (ys[i] <= ymax) { S("circle", { cx: X(st.x), cy: Y(ys[i]), r: eq ? 9 : 7, class: eq ? "pl-pt hit" : i ? "se-dot2" : "se-dot" }, svg); } });
      F.forEach((f, i) => S("text", { x: X(xmax) - 4, y: Math.max(Tp + 14, Math.min(Bt - 6, Y(val(f, xmax)) - 8)), class: "se-t se-te se-halo" }, svg, f.ad));
      el.querySelector(".se-info").innerHTML = F.map((f, i) => `<span class="se-sw s${i}"></span>${f.ad}: ${num(f.m)} · ${num(st.x)} + ${num(f.n)} = <b>${num(ys[i])}${birim ? " " + birim : ""}</b>`).join("<br>") + `<br>${eq ? `<span class="se-ok">İki değer eşit!</span>` : `${F[ys[0] < ys[1] ? 0 : 1].ad} ${num(Math.abs(ys[0] - ys[1]))}${birim ? " " + birim : ""} daha az.`}`;
      setV(el, st);
    }
    dragOn(svg, (p) => { const x = Math.round(((p.x - L) / (R - L)) * xmax / step) * step; st.x = Math.max(0, Math.min(xmax, x)); syncInputs(el, st); draw(); changed(); });
    bind(el, st, () => { draw(); changed(); });
    draw();
    return () => { const y0 = val(F[0], st.x), y1 = val(F[1], st.x); return { x: st.x, f1: y0, f2: y1, fark: y0 - y1, esit: Math.abs(y0 - y1) < 1e-9 ? 1 : 0 }; };
  });

  // ---------- 19. Algoritma izleyici: Öklid, artık yıl, asallık, basamak toplamı ----------
  reg("e-algoritma", (el, cfg, changed) => {
    const alg = cfg.alg ?? "oklid";
    const DEF = {
      oklid: { code: ["a ← A, b ← B", "b ≠ 0 olduğu sürece tekrarla:", "    k ← a mod b", "    a ← b", "    b ← k", "yaz a   (EBOB)"], inputs: [["A", 1, 120, cfg.A ?? 48], ["B", 1, 120, cfg.B ?? 18]] },
      "artik-yil": { code: ["y ← Y", "p ← (y mod 4 = 0)", "q ← (y mod 100 ≠ 0)", "r ← (y mod 400 = 0)", "artık ← (p ve q) veya r", "yaz artık"], inputs: [["Y", cfg.min ?? 1880, cfg.max ?? 2120, cfg.Y ?? 1900]] },
      asal: { code: ["asal ← (n ≥ 2), d ← 2", "d · d ≤ n ve asal olduğu sürece:", "    eğer n mod d = 0 ise asal ← Y", "    d ← d + 1", "yaz asal"], inputs: [["n", 1, cfg.max ?? 120, cfg.n ?? 91]] },
      basamak: { code: ["s ← 0", "n > 0 olduğu sürece:", "    s ← s + (n mod 10)", "    n ← n div 10", "yaz s"], inputs: [["n", 1, cfg.max ?? 9999, cfg.n ?? 2026]] },
    }[alg];
    const st = Object.fromEntries(DEF.inputs.map(([k, , , v]) => [k, v]));
    const DY = (b) => (b ? "D" : "Y");
    function trace() {
      const T = [{ line: -1, vars: {}, note: "Başlamak için “Sonraki adım”a bas." }];
      if (alg === "oklid") {
        let a = st.A, b = st.B; T.push({ line: 0, vars: { a, b } });
        for (let g = 0; g < 50; g++) {
          if (b === 0) { T.push({ line: 1, vars: { a, b }, note: "b = 0 → döngü biter" }); break; }
          T.push({ line: 1, vars: { a, b }, note: `b = ${b} ≠ 0 → döngüye gir` });
          const k = a % b; T.push({ line: 2, vars: { a, b, k }, note: `${a} = ${b} · ${Math.floor(a / b)} + ${k}` });
          a = b; T.push({ line: 3, vars: { a, b, k } }); b = k; T.push({ line: 4, vars: { a, b, k } });
        }
        T.push({ line: 5, vars: { a, b }, out: a, note: `EBOB(${st.A}, ${st.B}) = ${a}` });
      } else if (alg === "artik-yil") {
        const y = st.Y, p = y % 4 === 0, q = y % 100 !== 0, r = y % 400 === 0, z = (p && q) || r;
        T.push({ line: 0, vars: { y } }); T.push({ line: 1, vars: { y, p: DY(p) }, note: `${y} mod 4 = ${y % 4}` }); T.push({ line: 2, vars: { y, p: DY(p), q: DY(q) }, note: `${y} mod 100 = ${y % 100}` });
        T.push({ line: 3, vars: { y, p: DY(p), q: DY(q), r: DY(r) }, note: `${y} mod 400 = ${y % 400}` });
        T.push({ line: 4, vars: { y, p: DY(p), q: DY(q), r: DY(r), "artık": DY(z) }, note: `(${DY(p)} ve ${DY(q)}) veya ${DY(r)} = ${DY(p && q)} veya ${DY(r)} = ${DY(z)}` });
        T.push({ line: 5, vars: { y, "artık": DY(z) }, out: z ? 1 : 0, note: `${y} ${z ? "artık yıldır (366 gün)" : "artık yıl değildir (365 gün)"}` });
      } else if (alg === "asal") {
        const n = st.n; let asal = n >= 2, d = 2; T.push({ line: 0, vars: { n, asal: DY(asal), d } });
        for (let g = 0; g < 200; g++) {
          const c = d * d <= n && asal; T.push({ line: 1, vars: { n, asal: DY(asal), d }, note: `${d} · ${d} = ${d * d} ${d * d <= n ? "≤" : ">"} ${n} ve asal = ${DY(asal)} → ${c ? "döngüye gir" : "döngü biter"}` });
          if (!c) break;
          if (n % d === 0) asal = false; T.push({ line: 2, vars: { n, asal: DY(asal), d }, note: `${n} mod ${d} = ${n % d}${n % d === 0 ? ` → ${d} bir bölen` : ""}` });
          d++; T.push({ line: 3, vars: { n, asal: DY(asal), d } });
        }
        T.push({ line: 4, vars: { n, asal: DY(asal) }, out: asal ? 1 : 0, note: `${n} ${asal ? "asaldır" : "asal değildir"}` });
      } else {
        let n = st.n, s = 0; T.push({ line: 0, vars: { n, s } });
        for (let g = 0; g < 20; g++) {
          T.push({ line: 1, vars: { n, s }, note: n > 0 ? `n = ${n} > 0 → döngüye gir` : "n = 0 → döngü biter" }); if (n <= 0) break;
          s += n % 10; T.push({ line: 2, vars: { n, s }, note: `son basamak ${n % 10}` }); n = Math.floor(n / 10); T.push({ line: 3, vars: { n, s } });
        }
        T.push({ line: 4, vars: { s }, out: s, note: `Basamak toplamı ${s}` });
      }
      return T;
    }
    let T = trace(), i = 0;
    el.innerHTML = `<div class="se-ctrl">${DEF.inputs.map(([k, a, b, v]) => slider(k, k, a, b, 1, v, String(v))).join("")}</div>
      <div class="tr"><pre class="tr-code">${DEF.code.map((l, k) => `<span class="tr-line" data-l="${k}"><i>${k + 1}</i>${l}</span>`).join("")}</pre>
      <div class="tr-side"><div class="tr-box"><h4>Değişkenler</h4><div class="tr-vars"></div></div><div class="tr-box"><h4>Açıklama</h4><p class="se-info se-note"></p></div></div>
      <div class="tr-ctrl"><button type="button" class="btn btn-outline btn-small" data-t="-1">Önceki</button><button type="button" class="btn btn-primary btn-small" data-t="1">Sonraki adım</button><button type="button" class="btn btn-outline btn-small" data-t="9">Sonuna git</button><button type="button" class="btn btn-outline btn-small" data-t="0">Baştan</button><span class="tr-pos num"></span></div></div>`;
    function draw() {
      const s = T[i];
      el.querySelectorAll(".tr-line").forEach((n) => n.classList.toggle("cur", +n.dataset.l === s.line));
      const vs = Object.entries(s.vars);
      el.querySelector(".tr-vars").innerHTML = vs.length ? vs.map(([k, v]) => `<div class="tr-var"><code>${k}</code><b>${v}</b></div>`).join("") : `<span class="se-muted">Henüz değişken yok</span>`;
      el.querySelector(".se-note").innerHTML = (s.note || "") + (s.out !== undefined ? `<br><b>Çıktı: ${alg === "artik-yil" || alg === "asal" ? DY(s.out) : s.out}</b>` : "");
      el.querySelector(".tr-pos").textContent = `Adım ${i} / ${T.length - 1}`;
      el.querySelector('[data-t="1"]').disabled = el.querySelector('[data-t="9"]').disabled = i === T.length - 1;
      el.querySelector('[data-t="-1"]').disabled = i === 0;
      setV(el, st, Object.fromEntries(Object.keys(st).map((k) => [k, String])));
    }
    el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { const t = +b.dataset.t; i = t === 0 ? 0 : t === 9 ? T.length - 1 : Math.min(T.length - 1, Math.max(0, i + t)); draw(); changed(); }));
    bind(el, st, () => { T = trace(); i = 0; draw(); changed(); });
    draw();
    return () => { const end = i === T.length - 1; return { ...st, adim: i, bitti: end ? 1 : 0, sonuc: end ? T[i].out : null }; };
  });

  // ---------- 20. Niceleyiciler: ∀ ve ∃ önermeleri bir küme üzerinde ----------
  reg("e-niceleyici", (el, cfg, changed) => {
    const P = {
      cift: ["x çift sayıdır", (x) => x % 2 === 0], tek: ["x tek sayıdır", (x) => Math.abs(x % 2) === 1], asal: ["x asal sayıdır", isPrime],
      pozitif: ["x > 0", (x) => x > 0], kare: ["x² ≥ x", (x) => x * x >= x], bes: ["x, 5'in katıdır", (x) => x % 5 === 0], uc: ["x, 3'ün katıdır", (x) => x % 3 === 0], kucuk: ["x < 10", (x) => x < 10],
    };
    const list = (cfg.ozellikler ?? ["cift", "asal", "pozitif", "kare"]).filter((k) => P[k]);
    const [rmin, rmax] = cfg.aralik ?? [-10, 20];
    const st = { lo: cfg.lo ?? 1, hi: cfg.hi ?? 10, oz: Math.max(0, list.indexOf(cfg.ozellik ?? list[0])) };
    el.innerHTML = `<div class="se-row">${list.map((k, i) => tog(P[k][0], `data-p="${i}"`, i === st.oz)).join("")}</div><div class="se-ctrl">${slider("En küçük eleman", "lo", rmin, rmax, 1, st.lo)}${slider("En büyük eleman", "hi", rmin, rmax, 1, st.hi)}</div><p class="se-muted se-set"></p><div class="se-chips"></div><p class="se-info"></p>`;
    const calc = () => { const f = P[list[st.oz]][1], xs = []; for (let x = st.lo; x <= st.hi; x++) xs.push(x); const ok = xs.filter(f); return { f, xs, ok, her: ok.length === xs.length, bazi: ok.length > 0 }; };
    function draw() {
      const { f, xs, ok, her, bazi } = calc(), name = P[list[st.oz]][0], ce = xs.find((x) => !f(x)), wit = xs.find(f);
      el.querySelector(".se-set").textContent = `A = {x ∈ ℤ : ${minus(st.lo)} ≤ x ≤ ${minus(st.hi)}} · ${xs.length} eleman · P(x): ${name}`;
      el.querySelector(".se-chips").innerHTML = xs.map((x) => `<span class="se-chip ${f(x) ? "on" : ""}${x === ce ? " cx" : ""}${x === wit ? " wit" : ""}">${minus(x)}</span>`).join("");
      el.querySelector(".se-info").innerHTML = `<b>∀x ∈ A, ${name}</b> → ${her ? `<span class="se-ok">Doğru</span> (her eleman sağlıyor)` : `<span class="se-no">Yanlış</span> — karşı örnek: x = ${minus(ce)}`}<br><b>∃x ∈ A, ${name}</b> → ${bazi ? `<span class="se-ok">Doğru</span> — örnek: x = ${minus(wit)}` : `<span class="se-no">Yanlış</span> (hiçbir eleman sağlamıyor)`}<br>Sağlayan eleman sayısı: ${ok.length} / ${xs.length}<br><span class="se-muted">“Her” önermesinin değili “en az bir eleman sağlamaz” demektir: ¬(∀x P(x)) ≡ ∃x ¬P(x).</span>`;
      el.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.p === st.oz));
      syncInputs(el, st); setV(el, st);
    }
    el.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { st.oz = +b.dataset.p; draw(); changed(); }));
    bind(el, st, (k) => { if (k === "lo" && st.lo > st.hi) st.hi = st.lo; if (k === "hi" && st.hi < st.lo) st.lo = st.hi; draw(); changed(); });
    draw();
    return () => { const { xs, ok, her, bazi } = calc(); return { lo: st.lo, hi: st.hi, ozellik: st.oz, n: xs.length, sayi: ok.length, her: her ? 1 : 0, bazi: bazi ? 1 : 0 }; };
  });

  // ---------- 21. Nokta grafiği ve kutu grafiği: merkezî eğilim ve yayılım ----------
  reg("e-nokta-grafigi", (el, cfg, changed) => {
    const vals = [...cfg.values], min = cfg.min ?? 0, max = cfg.max ?? 20, kutu = cfg.kutu !== false, ss = cfg.ss !== false;
    el.innerHTML = `<div class="se-host"></div><p class="se-info"></p>`;
    const W = 640, L = 30, R = 610, LY = 210, X = (v) => L + ((v - min) / (max - min)) * (R - L);
    const svg = S("svg", { viewBox: `0 0 ${W} ${kutu ? 320 : 250}`, class: "sim-svg se-drag se-wide", role: "group", "aria-label": "Nokta grafiği" });
    el.querySelector(".se-host").replaceChildren(svg);
    const med = (a) => { const n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; };
    const stats = () => {
      const s = [...vals].sort((a, b) => a - b), n = s.length, mean = s.reduce((a, b) => a + b, 0) / n;
      const lower = s.slice(0, Math.floor(n / 2)), upper = s.slice(Math.ceil(n / 2));
      const q1 = med(lower), q3 = med(upper), sd = n > 1 ? Math.sqrt(s.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)) : 0;
      return { n, mean, median: med(s), q1, q3, iqr: q3 - q1, range: s[n - 1] - s[0], sd, min: s[0], max: s[n - 1] };
    };
    let di = -1;
    function draw(focusI) {
      svg.replaceChildren();
      S("line", { x1: L - 10, y1: LY, x2: R + 10, y2: LY, class: "nl-axis" }, svg);
      for (let v = min; v <= max; v++) { S("line", { x1: X(v), y1: LY - 6, x2: X(v), y2: LY + 6, class: "nl-minor" }, svg); if ((v - min) % (max - min > 20 ? 5 : 2) === 0) S("text", { x: X(v), y: LY + 26, class: "se-s se-tm" }, svg, v); }
      const seen = {};
      vals.forEach((v, i) => { const h = (seen[v] = (seen[v] || 0) + 1); const c = S("circle", { cx: X(v), cy: LY - 14 - (h - 1) * 18, r: 8, class: "se-dot se-focus", "data-i": i, tabindex: 0, role: "slider", "aria-label": `${i + 1}. veri`, "aria-valuenow": v }, svg);
        c.addEventListener("keydown", (e) => { const d = arrowDelta(e); if (d) { e.preventDefault(); vals[i] = Math.max(min, Math.min(max, vals[i] + d)); draw(i); changed(); } }); });
      const s = stats();
      S("line", { x1: X(s.mean), x2: X(s.mean), y1: 20, y2: LY, class: "dc-theo" }, svg);
      S("text", { x: X(s.mean), y: 14, class: "se-s se-tm" }, svg, `ortalama ${fmt(s.mean, 2)}`);
      if (kutu) {
        const y = 280;
        S("line", { x1: X(s.min), x2: X(s.q1), y1: y, y2: y, class: "se-line", "stroke-width": 2 }, svg); S("line", { x1: X(s.q3), x2: X(s.max), y1: y, y2: y, class: "se-line", "stroke-width": 2 }, svg);
        [s.min, s.max].forEach((v) => S("line", { x1: X(v), x2: X(v), y1: y - 10, y2: y + 10, class: "se-line", "stroke-width": 2 }, svg));
        S("rect", { x: X(s.q1), y: y - 18, width: Math.max(1, X(s.q3) - X(s.q1)), height: 36, class: "se-a" }, svg);
        S("line", { x1: X(s.median), x2: X(s.median), y1: y - 18, y2: y + 18, class: "se-rline", "stroke-width": 3 }, svg);
        S("text", { x: X(s.q1), y: y - 24, class: "se-s se-tm" }, svg, "Ç1"); S("text", { x: X(s.q3), y: y - 24, class: "se-s se-tm" }, svg, "Ç3"); S("text", { x: X(s.median), y: y + 34, class: "se-s se-tm" }, svg, "ortanca");
      }
      el.querySelector(".se-info").innerHTML = `n = ${s.n} · Ortalama <b>${fmt(s.mean, 2)}</b> · Ortanca <b>${fmt(s.median, 2)}</b> · Açıklık <b>${fmt(s.range, 2)}</b>${kutu ? `<br>Ç1 = <b>${fmt(s.q1, 2)}</b> · Ç3 = <b>${fmt(s.q3, 2)}</b> · Çeyrekler açıklığı = <b>${fmt(s.iqr, 2)}</b>` : ""}${ss ? `<br>Standart sapma ≈ <b>${fmt(s.sd, 2)}</b> <span class="se-muted">(n − 1'e bölünerek)</span>` : ""}<br><span class="se-muted">Noktaları sürükle ya da seçip ← → tuşlarıyla taşı.</span>`;
      if (focusI !== undefined) svg.querySelector(`[data-i="${focusI}"]`)?.focus();
    }
    dragOn(svg, (p, ev, first) => {
      if (first) { const t = ev.target.dataset?.i; di = t === undefined ? -1 : +t; }
      if (di < 0) return;
      vals[di] = Math.max(min, Math.min(max, Math.round(min + ((p.x - L) / (R - L)) * (max - min)))); draw(); changed();
    });
    draw();
    return () => { const s = stats(); return { n: s.n, mean: s.mean, median: s.median, q1: s.q1, q3: s.q3, iqr: s.iqr, range: s.range, sd: s.sd }; };
  });

  // ---------- 22. İki zarın örnek uzayı: 36 çıktı, olayı seç ----------
  reg("e-ornek-uzay", (el, cfg, changed) => {
    const o = cfg.olay ?? null;
    const inE = (i, j) => { if (!o) return false; const s = i + j; switch (o.tur) {
      case "toplam": return "eq" in o ? s === o.eq : "gte" in o ? s >= o.gte : s <= o.lte;
      case "ayni": return i === j; case "en-az-bir": return i === o.deger || j === o.deger; case "carpim-cift": return (i * j) % 2 === 0; case "ilk-buyuk": return i > j; default: return false; } };
    const sel = new Set();
    el.innerHTML = `<div class="se-g6" role="group" aria-label="İki zarın örnek uzayı"></div><div class="se-row"><button type="button" class="btn btn-outline btn-small se-clr">Temizle</button></div><p class="se-info"></p>`;
    const grid = el.querySelector(".se-g6");
    grid.innerHTML = `<span class="h">1. \\ 2.</span>` + [1, 2, 3, 4, 5, 6].map((j) => `<span class="h">${j}</span>`).join("") + [1, 2, 3, 4, 5, 6].map((i) => `<span class="h">${i}</span>` + [1, 2, 3, 4, 5, 6].map((j) => `<button type="button" data-c="${i}-${j}" aria-pressed="false" aria-label="Birinci zar ${i}, ikinci zar ${j}">${cfg.goster === "toplam" ? i + j : `${i},${j}`}</button>`).join("")).join("");
    const match = () => { if (!o) return false; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (inE(i, j) !== sel.has(`${i}-${j}`)) return false; return true; };
    function draw() {
      grid.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", sel.has(b.dataset.c)));
      const n = sel.size, m = match();
      el.querySelector(".se-info").innerHTML = `Seçilen çıktı: <b>${n}</b> / 36 · P = ${n}/36${n && gcd(n, 36) > 1 ? ` = ${frac(n, 36)}` : ""}${o ? `<br>${m ? `<span class="se-ok">Seçimin olayla tam örtüşüyor.</span>` : `<span class="se-muted">Olaya ait bütün çıktıları seç, başka çıktı seçme.</span>`}` : ""}`;
    }
    grid.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { const c = b.dataset.c; sel.has(c) ? sel.delete(c) : sel.add(c); draw(); changed(); }));
    el.querySelector(".se-clr").addEventListener("click", () => { sel.clear(); draw(); changed(); });
    draw();
    return () => ({ secili: sel.size, p: sel.size / 36, uygun: match() ? 1 : 0 });
  });
})();
