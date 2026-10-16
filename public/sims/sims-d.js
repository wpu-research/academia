// Konu anlatımı simülasyonları (grup d: 6. ve 7. sınıf). LESSONS.registerSim ile kaydolur; lessons.js değişmez.
// Her sim (el, cfg, changed) alır ve durum döndüren bir fonksiyon verir. Renkler yalnız CSS değişkenleriyle.
(() => {
  if (!window.LESSONS) return;
  const reg = window.LESSONS.registerSim;
  const NS = "http://www.w3.org/2000/svg";
  const fmt = (x, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString("tr-TR").replace(/^-/, "−");
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const neg = (s) => String(s).replace(/-/g, "−");
  function S(tag, attrs = {}, parent, text) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  const svgPt = (svg, ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const slider = (label, key, min, max, step, value) => `<label class="sim-slider"><span>${label}: <b data-v="${key}">${fmt(value)}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-k="${key}"></label>`;
  const bind = (el, st, draw, changed, after) => el.querySelectorAll("input[data-k]").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; after?.(i.dataset.k); draw(); changed(); }));
  const setV = (el, st) => el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = fmt(st[b.dataset.v]); });
  const syncIn = (el, st) => el.querySelectorAll("input[data-k]").forEach((i) => { if (+i.value !== st[i.dataset.k]) i.value = st[i.dataset.k]; });
  const frac = (p, q) => { const g = gcd(p, q) || 1; return q / g === 1 ? neg(p / g) : `${neg(p / g)}/${q / g}`; };
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = (n) => String(n).split("").map((c) => SUP[c]).join("");
  // Sürükleme: svg üzerinde pointer olaylarını tek yerden bağlar.
  function drag(svg, onDown, onMove) {
    let on = false;
    svg.addEventListener("pointerdown", (ev) => { if (onDown(ev) === false) return; on = true; svg.setPointerCapture(ev.pointerId); onMove(ev); });
    svg.addEventListener("pointermove", (ev) => { if (on) onMove(ev); });
    const stop = () => { on = false; };
    svg.addEventListener("pointerup", stop); svg.addEventListener("pointercancel", stop);
  }
  // Seçim düğmeleri (seg-light).
  const seg = (label, items, cur, key = "m") => `<div class="seg-light" role="group" aria-label="${label}">${items.map(([k, l]) => `<button type="button" data-${key}="${k}" aria-pressed="${String(k) === String(cur)}">${l}</button>`).join("")}</div>`;

  if (!document.getElementById("sd-style")) {
    const css = document.createElement("style");
    css.id = "sd-style";
    css.textContent = `
.sd-wrap { display: grid; gap: 12px; min-width: 0; }
.sd-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.sd-out { margin: 0; font-size: 15px; color: var(--ink); line-height: 1.6; }
.sd-out b, .sd-big b { color: var(--ink); }
.sd-big { margin: 0; font: 600 18px var(--font); color: var(--ink); }
.sd-muted { color: var(--muted); }
.sd-ok, .sd-tbl td.sd-ok, .sd-tbl tr.sd-ok td { color: var(--good); font-weight: 600; }
.sd-no, .sd-tbl td.sd-no { color: var(--bad); font-weight: 600; }
.sd-digits { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.sd-dig { display: grid; gap: 4px; justify-items: center; }
.sd-dig b { font: 700 34px var(--font); color: var(--ink); min-width: 44px; text-align: center; padding: 4px 0; border: 2px solid var(--line); border-radius: 8px; background: var(--bg-soft); }
.sd-tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
.sd-tbl th, .sd-tbl td { padding: 6px 8px; border-bottom: 1px solid var(--line); text-align: left; color: var(--ink); }
.sd-tbl th { color: var(--muted); font-weight: 600; }
.sd-flow { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.sd-box { border: 2px solid var(--line); border-radius: 8px; padding: 6px 10px; background: var(--bg-soft); color: var(--ink); font-size: 14px; text-align: center; }
.sd-box b { display: block; font-size: 18px; }
.sd-box.in, .sd-box.out { border-color: var(--brand); }
.sd-arrow { color: var(--muted); }
.sd-tiles { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-end; min-height: 64px; padding: 10px; border: 1px dashed var(--line); border-radius: 8px; }
.sd-tile { border: 0; border-radius: 4px; font: 700 13px var(--font); cursor: pointer; display: grid; place-items: center; padding: 0; }
.sd-tile.x { width: 22px; height: 58px; background: var(--brand); color: var(--on-brand); }
.sd-tile.nx { width: 22px; height: 58px; background: var(--bad); color: var(--surface); }
.sd-tile.one { width: 22px; height: 22px; background: var(--warn); color: var(--surface); }
.sd-tile.none { width: 22px; height: 22px; background: var(--bad); color: var(--surface); }
.sd-tile:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
.sd-map { display: grid; grid-template-columns: repeat(3, 44px); gap: 4px; }
.sd-map button { width: 44px; height: 44px; border: 2px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); font: 700 18px var(--font); cursor: pointer; }
.sd-map button.on { background: var(--brand-soft); border-color: var(--brand); }
.sd-views { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; }
.sd-view { display: grid; gap: 4px; justify-items: center; font-size: 13px; color: var(--muted); }
.sd-ovl { text-decoration: overline; }
.sd-split { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; align-items: center; }
@media (max-width: 700px) { .sd-split { grid-template-columns: 1fr; } }
.sd-ln { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; fill: none; }
.sd-thin { stroke: var(--muted); stroke-width: 1.5; fill: none; }
.sd-grid { stroke: var(--line); stroke-width: 1; }
.sd-dash { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 5 4; fill: none; }
.sd-hl { stroke: var(--brand); stroke-width: 4; stroke-linecap: round; fill: none; }
.sd-gl { stroke: var(--good); stroke-width: 4; stroke-linecap: round; fill: none; }
.sd-fill { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 2.5; stroke-linejoin: round; }
.sd-cell { fill: var(--surface); stroke: var(--line); stroke-width: 1.5; }
.sd-cell.on { fill: var(--brand); stroke: var(--brand-strong); }
.sd-cell.alt { fill: var(--bg-soft); }
.sd-va { fill: var(--brand); fill-opacity: .22; }
.sd-hb { fill: var(--good); fill-opacity: .28; }
.sd-ov { fill: var(--brand); }
.sd-bad { fill: var(--bad-soft); stroke: var(--bad); stroke-width: 1.5; }
.sd-good { fill: var(--good); }
.sd-c0 { fill: var(--bad); } .sd-c1 { fill: var(--good); } .sd-c2 { fill: var(--warn); } .sd-c3 { fill: var(--brand); }
.sd-wedge { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 1.5; }
.sd-wedge.hl { fill: var(--brand); }
.sd-wedge.alt { fill: var(--good-soft); stroke: var(--good); }
.sd-wedge.alt.hl { fill: var(--good); }
.sd-t { font: 600 14px var(--font); fill: var(--ink); text-anchor: middle; }
.sd-ts { font: 12px var(--font); fill: var(--muted); text-anchor: middle; }
.sd-tl { font: 700 16px var(--font); fill: var(--ink); text-anchor: middle; }
.sd-node { font: 700 18px var(--font); fill: var(--ink); text-anchor: middle; }
.sd-prime { fill: var(--good-soft); stroke: var(--good); stroke-width: 2; }
.sd-chip-p { fill: var(--good); } .sd-chip-n { fill: var(--bad); }
.sd-chip-t { font: 700 18px var(--font); fill: var(--surface); text-anchor: middle; pointer-events: none; }
.sd-dot { fill: var(--brand); } .sd-dot.odd { fill: var(--bad); } .sd-dot.pair { fill: var(--good); }
.sd-knob { fill: var(--brand); stroke: var(--surface); stroke-width: 3; cursor: grab; }
.sd-knob:focus-visible, svg.sd-focus:focus-visible { outline: none; stroke: var(--ink); }
svg.sd-focus:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; border-radius: 6px; }
.sd-top { fill: var(--kernel); stroke: var(--deep); stroke-width: 1; } .sd-fr { fill: var(--brand-soft); stroke: var(--deep); stroke-width: 1; } .sd-rt { fill: var(--brand); stroke: var(--deep); stroke-width: 1; }
.sd-vw { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 1.5; }
.sd-vt { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 4 3; }
`;
    document.head.appendChild(css);
  }

  // ---------- 1. Bölünebilme: basamakları değiştir, kuralları canlı izle ----------
  reg("d-bolunebilme", (el, cfg, changed) => {
    const len = cfg.basamak ?? 4;
    const dg = String(cfg.n ?? 1236).padStart(len, "0").slice(-len).split("").map(Number);
    if (dg[0] === 0) dg[0] = 1;
    const divs = cfg.bolenler ?? [2, 3, 4, 5, 6, 9, 10];
    const why = (d, n, sum, l1, l2) => ({
      2: `Birler basamağı ${l1}: ${l1 % 2 === 0 ? "çift" : "tek"}`,
      3: `Rakamlar toplamı ${sum}: ${sum % 3 === 0 ? "3'ün katı" : "3'ün katı değil"}`,
      4: `Son iki basamak ${String(l2).padStart(2, "0")}: ${l2 % 4 === 0 ? "4'ün katı" : "4'ün katı değil"}`,
      5: `Birler basamağı ${l1}: ${l1 === 0 || l1 === 5 ? "0 ya da 5" : "0 ya da 5 değil"}`,
      6: `2 ile ${n % 2 === 0 ? "bölünür" : "bölünmez"}, 3 ile ${n % 3 === 0 ? "bölünür" : "bölünmez"}`,
      9: `Rakamlar toplamı ${sum}: ${sum % 9 === 0 ? "9'un katı" : "9'un katı değil"}`,
      10: `Birler basamağı ${l1}: ${l1 === 0 ? "0" : "0 değil"}`,
    })[d] || "";
    function draw(focus) {
      const n = +dg.join(""), sum = dg.reduce((a, b) => a + b, 0), l1 = n % 10, l2 = n % 100;
      el.innerHTML = `<div class="sd-wrap"><div class="sd-digits" role="group" aria-label="Sayının rakamları">${dg.map((d, i) => `<div class="sd-dig"><button type="button" class="btn btn-outline btn-small" data-d="${i}" data-s="1" aria-label="${i + 1}. rakamı artır">▲</button><b class="num" aria-live="polite">${d}</b><button type="button" class="btn btn-outline btn-small" data-d="${i}" data-s="-1" aria-label="${i + 1}. rakamı azalt">▼</button></div>`).join("")}</div>
        <p class="sd-big">Sayı: <b class="num">${n}</b> · Rakamlar toplamı: <b class="num">${dg.join(" + ")} = ${sum}</b></p>
        <div class="table-wrap"><table class="sd-tbl"><thead><tr><th>Bölen</th><th>Neye bakılır?</th><th>Sonuç</th></tr></thead><tbody>${divs.map((d) => { const ok = n % d === 0; return `<tr><td><b>${d}</b></td><td>${why(d, n, sum, l1, l2)}</td><td class="${ok ? "sd-ok" : "sd-no"}">${ok ? "✓ tam bölünür" : `✗ kalan ${n % d}`}</td></tr>`; }).join("")}</tbody></table></div></div>`;
      el.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
        const i = +b.dataset.d, s = +b.dataset.s;
        let v = (dg[i] + s + 10) % 10;
        if (i === 0 && v === 0) v = s > 0 ? 1 : 9;
        dg[i] = v; draw(`[data-d="${i}"][data-s="${s}"]`); changed();
      }));
      if (focus) el.querySelector(focus)?.focus();
    }
    draw();
    return () => { const n = +dg.join(""), st = { n, sum: dg.reduce((a, b) => a + b, 0), last: n % 10 }; for (const d of [2, 3, 4, 5, 6, 9, 10]) st["d" + d] = n % d === 0 ? 1 : 0; return st; };
  });

  // ---------- 2. Çarpan ağacı: asal bölenlerle böl, asal çarpanlara ayır ----------
  reg("d-carpan-agaci", (el, cfg, changed) => {
    let n = cfg.n ?? 60, steps = [], msg = "";
    const primes = cfg.asallar ?? [2, 3, 5, 7, 11, 13];
    const rest = () => steps.reduce((r, p) => r / p, n);
    function draw(focus) {
      const r = rest(), done = isPrime(r) || r === 1;
      const W = 120 + steps.length * 48 + 60, H = 50 + steps.length * 48;
      const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": "Çarpan ağacı", style: `max-width:${W * 1.4}px` });
      let val = n, x = 90, y = 28;
      S("text", { x, y: y + 6, class: "sd-node" }, svg, val);
      steps.forEach((p) => {
        S("line", { x1: x - 8, y1: y + 12, x2: x - 36, y2: y + 30, class: "sd-thin" }, svg);
        S("line", { x1: x + 8, y1: y + 12, x2: x + 36, y2: y + 30, class: "sd-thin" }, svg);
        S("circle", { cx: x - 44, cy: y + 46, r: 17, class: "sd-prime" }, svg);
        S("text", { x: x - 44, y: y + 52, class: "sd-node" }, svg, p);
        val = val / p; x += 48; y += 48;
        S("text", { x, y: y + 6, class: "sd-node" }, svg, val);
      });
      if (done && r > 1) S("circle", { cx: x, cy: y, r: 19, class: "sd-prime", "fill-opacity": 0.35 }, svg);
      const fs = [...steps, ...(done && r > 1 ? [r] : [])].sort((a, b) => a - b);
      const cnt = {}; fs.forEach((p) => (cnt[p] = (cnt[p] || 0) + 1));
      const pow = Object.keys(cnt).map(Number).sort((a, b) => a - b).map((p) => (cnt[p] > 1 ? `${p}${sup(cnt[p])}` : `${p}`)).join(" · ");
      const choose = cfg.secenek ? seg("Sayı seç", cfg.secenek.map((v) => [v, v]), n, "n") : "";
      el.innerHTML = `<div class="sd-wrap">${choose}<div class="sd-split"><div class="sd-host"></div><div class="sd-wrap">
        <div class="bb-ex" role="group" aria-label="Asal ile böl">${primes.map((p) => `<button type="button" class="btn btn-small btn-outline" data-p="${p}" ${done ? "disabled" : ""}>${p} ile böl</button>`).join("")}</div>
        <div class="bb-ex"><button type="button" class="btn btn-small btn-outline" data-a="undo" ${steps.length ? "" : "disabled"}>Geri al</button><button type="button" class="btn btn-small btn-outline" data-a="reset" ${steps.length ? "" : "disabled"}>Baştan</button></div>
        <p class="sd-out">${done ? (steps.length === 0 && isPrime(n) ? `<b>${n}</b> asal bir sayıdır: çarpanları yalnız 1 ve ${n}.` : `<span class="sd-ok">Bitti!</span> ${n} = ${fs.join(" · ")}${fs.length > 1 && pow !== fs.join(" · ") ? ` = ${pow}` : ""}`) : `Şimdi <b>${r}</b> sayısını bir asal sayıya böl.`}</p>
        ${msg ? `<p class="note">${msg}</p>` : ""}</div></div></div>`;
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
        const p = +b.dataset.p, cur = rest();
        if (cur % p === 0) { steps.push(p); msg = ""; } else msg = `${cur} sayısı ${p} ile tam bölünmez (kalan ${cur % p}). Başka bir asal dene.`;
        draw(`[data-p="${p}"]`); changed();
      }));
      el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => { if (b.dataset.a === "undo") steps.pop(); else steps = []; msg = ""; draw(); changed(); }));
      el.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { n = +b.dataset.n; steps = []; msg = ""; draw(`[data-n="${n}"]`); changed(); }));
      if (focus) (el.querySelector(focus + ":not([disabled])") || el.querySelector("[data-a]:not([disabled])"))?.focus();
    }
    draw();
    return () => { const r = rest(); return { n, rest: r, done: isPrime(r) || r === 1 ? 1 : 0, adim: steps.length }; };
  });

  // ---------- 3. Kurbağa sıçraması: iki sayının katları ve ortak katları ----------
  reg("d-kat-sicrama", (el, cfg, changed) => {
    const st = { a: cfg.a ?? 4, b: cfg.b ?? 6 }, M = cfg.max ?? 36, top = cfg.amax ?? 12;
    el.innerHTML = `<div class="sd-wrap"><div class="sd-host"></div><div class="plane-wrap"><div class="plane-ctrl">${slider("1. kurbağanın adımı", "a", 1, top, 1, st.a)}${slider("2. kurbağanın adımı", "b", 1, top, 1, st.b)}</div><p class="sd-out"></p></div></div>`;
    const L = 24, R = 616, X = (v) => L + (v / M) * (R - L), Y = 95;
    function draw() {
      const { a, b } = st, l = (a * b) / gcd(a, b);
      const svg = S("svg", { viewBox: "0 0 640 190", class: "sim-svg", role: "img", "aria-label": `Adımları ${a} ve ${b} olan kurbağalar` });
      S("line", { x1: L - 8, y1: Y, x2: R + 8, y2: Y, class: "sd-ln" }, svg);
      for (let v = 0; v <= M; v++) {
        S("line", { x1: X(v), y1: Y - 5, x2: X(v), y2: Y + 5, class: "sd-thin" }, svg);
        if (v % (M <= 20 ? 1 : M <= 40 ? 2 : 5) === 0) S("text", { x: X(v), y: Y + 20, class: "sd-ts" }, svg, v);
      }
      const hop = (k, up, cls) => { for (let v = 0; v + k <= M; v += k) { const x1 = X(v), x2 = X(v + k), h = Math.min(60, (x2 - x1) * 0.55 + 10); S("path", { d: `M${x1},${Y} Q${(x1 + x2) / 2},${up ? Y - 2 * h : Y + 2 * h + 24} ${x2},${up ? Y : Y + 24}`, class: cls }, svg); } };
      hop(a, true, "sd-hl"); hop(b, false, "sd-gl");
      for (let v = l; v <= M; v += l) { S("circle", { cx: X(v), cy: Y, r: 9, class: "sd-good" }, svg); S("text", { x: X(v), y: Y - 14, class: "sd-t" }, svg, v); }
      el.querySelector(".sd-host").replaceChildren(svg);
      const ms = (k) => { const r = []; for (let v = k; v <= M; v += k) r.push(v); return r; };
      const com = ms(l);
      el.querySelector(".sd-out").innerHTML = `<b>Adım ${a}:</b> ${ms(a).join(", ")}<br><b>Adım ${b}:</b> ${ms(b).join(", ")}<br><b>Ortak katlar (0–${M}):</b> ${com.length ? com.join(", ") : "bu aralıkta yok"}<br>En küçük ortak kat (EKOK) = <b class="num">${l}</b>`;
      setV(el, st);
    }
    bind(el, st, draw, changed); draw();
    return () => ({ a: st.a, b: st.b, ekok: (st.a * st.b) / gcd(st.a, st.b), ebob: gcd(st.a, st.b) });
  });

  // ---------- 4. Kare döşeme: dikdörtgeni eş karelerle boşluksuz kapla (ortak bölen) ----------
  reg("d-kare-doseme", (el, cfg, changed) => {
    const Lx = cfg.yatay ?? 18, Ly = cfg.dikey ?? 12, st = { k: cfg.k ?? 1 };
    el.innerHTML = `<div class="sd-wrap"><div class="sd-host"></div><div class="plane-wrap"><div class="plane-ctrl">${slider("Kare karonun kenarı", "k", 1, Math.min(Lx, Ly), 1, st.k)}</div><p class="sd-out"></p></div></div>`;
    const U = Math.min(30, 600 / Lx, 300 / Ly);
    function draw() {
      const k = st.k, qx = Math.floor(Lx / k), qy = Math.floor(Ly / k), fits = Lx % k === 0 && Ly % k === 0;
      const svg = S("svg", { viewBox: `0 0 ${Lx * U + 20} ${Ly * U + 20}`, class: "sim-svg", role: "img", "aria-label": `${Lx} × ${Ly} dikdörtgen, kenarı ${k} olan karolar` });
      S("rect", { x: 10, y: 10, width: Lx * U, height: Ly * U, class: "sd-bad" }, svg);
      for (let i = 0; i < qx; i++) for (let j = 0; j < qy; j++) S("rect", { x: 10 + i * k * U + 1, y: 10 + j * k * U + 1, width: k * U - 2, height: k * U - 2, rx: 3, class: `sd-cell on` }, svg);
      S("rect", { x: 10, y: 10, width: Lx * U, height: Ly * U, class: "sd-thin" }, svg);
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelector(".sd-out").innerHTML = `Yatay: ${Lx} ÷ ${k} = ${qx}${Lx % k ? ` (kalan ${Lx % k})` : ""}<br>Dikey: ${Ly} ÷ ${k} = ${qy}${Ly % k ? ` (kalan ${Ly % k})` : ""}<br>${fits ? `<span class="sd-ok">Boşluksuz döşendi:</span> ${qx} × ${qy} = <b class="num">${qx * qy}</b> karo. ${k}, hem ${Lx} hem ${Ly} sayısının böleni.` : `<span class="sd-no">Boşluk kalıyor</span> (kırmızı bölge). ${k}, iki kenarın ortak böleni değil.`}`;
      setV(el, st);
    }
    bind(el, st, draw, changed); draw();
    return () => { const k = st.k, fits = Lx % k === 0 && Ly % k === 0; return { k, fits: fits ? 1 : 0, count: fits ? (Lx / k) * (Ly / k) : 0 }; };
  });

  // ---------- 5. Yüzlük tablo: ondalık gösterim, kesir ve yüzde ----------
  reg("d-yuzluk", (el, cfg, changed) => {
    let c = cfg.start ?? 0;
    const C = 28;
    el.innerHTML = `<div class="sd-split"><div class="sd-host"></div><div class="sd-wrap"><div class="bb-ex">
      <button type="button" class="btn btn-small btn-outline" data-s="-10">− 0,1</button><button type="button" class="btn btn-small btn-outline" data-s="-1">− 0,01</button>
      <button type="button" class="btn btn-small btn-outline" data-s="1">+ 0,01</button><button type="button" class="btn btn-small btn-outline" data-s="10">+ 0,1</button></div><p class="sd-big sd-dec"></p><p class="sd-out"></p></div></div>`;
    const svg = S("svg", { viewBox: `0 0 ${10 * C + 4} ${10 * C + 4}`, class: "sim-svg drag", role: "img", "aria-label": "Yüzlük tablo", style: "max-width:340px" });
    el.querySelector(".sd-host").replaceChildren(svg);
    function draw() {
      svg.replaceChildren();
      for (let col = 0; col < 10; col++) for (let row = 0; row < 10; row++) {
        const idx = col * 10 + row;
        S("rect", { x: 2 + col * C, y: 2 + row * C, width: C - 2, height: C - 2, rx: 2, class: `sd-cell${idx < c ? " on" : ""}`, "data-i": idx }, svg);
      }
      for (let col = 1; col < 10; col++) S("line", { x1: 1 + col * C, y1: 0, x2: 1 + col * C, y2: 10 * C + 4, class: "sd-thin", "stroke-opacity": 0.5 }, svg);
      const t = Math.floor(c / 10), h = c % 10, dec = (c / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 });
      svg.setAttribute("aria-label", `Yüzlük tabloda ${c} kare boyalı`);
      el.querySelector(".sd-dec").innerHTML = `<b class="num">${dec}</b>${cfg.yuzde === false ? "" : ` = <b class="num">%${c}</b>`}`;
      el.querySelector(".sd-out").innerHTML = c === 100 ? "100 yüzde bir = 1 bütün = %100" :
        `${t} onda bir + ${h} yüzde bir<br>= ${t}/10 + ${h}/100 = <b>${c}/100</b>${gcd(c, 100) > 1 && c ? ` = ${frac(c, 100)}` : ""}<br><span class="sd-muted">Bir sütun 1/10 = 0,1; bir kare 1/100 = 0,01.</span>`;
    }
    const setFrom = (ev) => { const p = svgPt(svg, ev); const col = Math.floor((p.x - 2) / C), row = Math.floor((p.y - 2) / C); if (col < 0 || col > 9 || row < 0 || row > 9) return; const idx = col * 10 + row; const nc = idx + 1; if (nc !== c) { c = nc; draw(); changed(); } };
    drag(svg, () => true, setFrom);
    el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { c = Math.max(0, Math.min(100, c + +b.dataset.s)); draw(); changed(); }));
    draw();
    return () => ({ count: c, value: c / 100, percent: c });
  });

  // ---------- 6. Paylaşım: a bütünü b kişiye eşit paylaştır (kesir = bölme) ----------
  reg("d-paylasim", (el, cfg, changed) => {
    const st = { a: cfg.a ?? 3, b: cfg.b ?? 4 };
    el.innerHTML = `<div class="sd-wrap"><div class="sd-host"></div><div class="plane-wrap"><div class="plane-ctrl">${slider("Bütün (pizza) sayısı", "a", 1, cfg.amax ?? 6, 1, st.a)}${slider("Kişi sayısı", "b", 2, cfg.bmax ?? 8, 1, st.b)}</div><p class="sd-out"></p></div></div>`;
    function draw() {
      const { a, b } = st, W = 560, H = 40, G = 12;
      const svg = S("svg", { viewBox: `0 0 ${W + 70} ${a * (H + G) + 10}`, class: "sim-svg", role: "img", "aria-label": `${a} bütün ${b} kişiye paylaştırıldı` });
      for (let i = 0; i < a; i++) {
        const y = 5 + i * (H + G), pw = W / b;
        for (let j = 0; j < b; j++) {
          S("rect", { x: j * pw + 1, y, width: pw - 2, height: H, rx: 4, class: `sd-cell${j === 0 ? " on" : j % 2 ? " alt" : ""}` }, svg);
          if (pw > 34) S("text", { x: j * pw + pw / 2, y: y + H / 2 + 5, class: "sd-ts", style: j === 0 ? "fill:var(--on-brand)" : "" }, svg, `${j + 1}.`);
        }
        S("text", { x: W + 36, y: y + H / 2 + 6, class: "sd-t" }, svg, `${i + 1}. bütün`);
      }
      el.querySelector(".sd-host").replaceChildren(svg);
      const whole = Math.floor(a / b), r = a % b;
      el.querySelector(".sd-out").innerHTML = `Her bütün ${b} eş parçaya bölündü. 1. kişinin payı koyu renkli: her bütünden 1 parça, toplam <b>${a}</b> tane 1/${b}.<br><b class="num">${a} ÷ ${b} = ${a}/${b}</b>${a >= b ? ` = ${r ? `${whole} tam ${r}/${b}` : whole}` : ""}${gcd(a, b) > 1 && a % b ? ` = ${frac(a, b)}` : ""}${(a / b) * 1000 % 1 === 0 ? ` = ${fmt(a / b, 3)}` : ""}`;
      setV(el, st);
    }
    bind(el, st, draw, changed); draw();
    return () => ({ a: st.a, b: st.b, share: st.a / st.b });
  });

  // ---------- 7. Kesirle çarpma: birim karede alan modeli ----------
  reg("d-kesir-carpim", (el, cfg, changed) => {
    const st = { a: cfg.a ?? 2, b: cfg.b ?? 3, c: cfg.c ?? 3, d: cfg.d ?? 4 }, mx = cfg.max ?? 10;
    el.innerHTML = `<div class="plane-wrap"><div class="sd-host"></div><div class="plane-ctrl"><p class="eq"></p>
      ${slider("1. kesrin payı", "a", 0, mx, 1, st.a)}${slider("1. kesrin paydası", "b", 1, mx, 1, st.b)}${slider("2. kesrin payı", "c", 0, mx, 1, st.c)}${slider("2. kesrin paydası", "d", 1, mx, 1, st.d)}<p class="sd-out"></p></div></div>`;
    const fix = (k) => { if (st.a > st.b) { if (k === "a") st.b = st.a; else st.a = st.b; } if (st.c > st.d) { if (k === "c") st.d = st.c; else st.c = st.d; } syncIn(el, st); };
    function draw() {
      const { a, b, c, d } = st, Z = 260, O = 14;
      const svg = S("svg", { viewBox: `0 0 ${Z + 2 * O} ${Z + 2 * O}`, class: "sim-svg", role: "img", "aria-label": `${a}/${b} çarpı ${c}/${d}`, style: "max-width:340px" });
      S("rect", { x: O, y: O, width: Z, height: Z, class: "sd-cell" }, svg);
      S("rect", { x: O, y: O, width: (Z * a) / b, height: Z, class: "sd-va" }, svg);
      S("rect", { x: O, y: O + Z - (Z * c) / d, width: Z, height: (Z * c) / d, class: "sd-hb" }, svg);
      S("rect", { x: O, y: O + Z - (Z * c) / d, width: (Z * a) / b, height: (Z * c) / d, class: "sd-ov" }, svg);
      for (let i = 1; i < b; i++) S("line", { x1: O + (Z * i) / b, y1: O, x2: O + (Z * i) / b, y2: O + Z, class: "sd-thin" }, svg);
      for (let j = 1; j < d; j++) S("line", { x1: O, y1: O + (Z * j) / d, x2: O + Z, y2: O + (Z * j) / d, class: "sd-thin" }, svg);
      S("rect", { x: O, y: O, width: Z, height: Z, class: "sd-ln", "stroke-width": 2 }, svg);
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelector(".eq").textContent = `${a}/${b} × ${c}/${d} = ${a * c}/${b * d}${gcd(a * c, b * d) > 1 && a * c ? ` = ${frac(a * c, b * d)}` : ""}`;
      el.querySelector(".sd-out").innerHTML = `Bütün <b>${b} × ${d} = ${b * d}</b> eş parçaya bölündü. İki boyamanın kesiştiği koyu bölge <b>${a} × ${c} = ${a * c}</b> parça.`;
      setV(el, st);
    }
    bind(el, st, draw, changed, fix); draw();
    return () => ({ ...st, num: st.a * st.c, den: st.b * st.d, value: (st.a * st.c) / (st.b * st.d) });
  });

  // ---------- 8. Birim merdiveni: uzunluk, alan ve hacim birimleri arasında dönüşüm ----------
  reg("d-birim-donustur", (el, cfg, changed) => {
    const T = { uzunluk: [["km", "hm", "dam", "m", "dm", "cm", "mm"], 10], alan: [["km²", "hm²", "dam²", "m²", "dm²", "cm²", "mm²"], 100], hacim: [["m³", "dm³", "cm³", "mm³"], 1000] }[cfg.tur || "uzunluk"];
    const [U, K] = T, from = Math.max(0, U.indexOf(cfg.birim ?? U[3] ?? U[0])), base = cfg.deger ?? 1;
    let idx = cfg.basla != null ? U.indexOf(cfg.basla) : from;
    const val = () => Number((base * K ** (idx - from)).toPrecision(12));
    const show = (v) => v.toLocaleString("tr-TR", { maximumFractionDigits: 10 });
    el.innerHTML = `<div class="sd-wrap"><div class="sd-host"></div><div class="sd-wrap"><div class="bb-ex"><button type="button" class="btn btn-small btn-outline" data-s="-1">↑ Büyük birime (÷ ${K.toLocaleString("tr-TR")})</button><button type="button" class="btn btn-small btn-outline" data-s="1">↓ Küçük birime (× ${K.toLocaleString("tr-TR")})</button></div><p class="sd-big sd-eq"></p><p class="sd-out"></p></div></div>`;
    const sw = 72, sh = 38, n = U.length;
    const svg = S("svg", { viewBox: `0 0 ${n * sw + 40} ${n * sh + 16}`, class: "sim-svg", role: "group", "aria-label": "Birim merdiveni", style: `max-width:${(n * sw + 40) * 1.25}px` });
    el.querySelector(".sd-host").replaceChildren(svg);
    function draw() {
      svg.replaceChildren();
      U.forEach((u, i) => {
        const x = 10 + i * sw, y = 10 + i * sh;
        const r = S("rect", { x, y, width: sw - 6, height: sh - 6, rx: 6, class: `sd-cell${i === idx ? " on" : ""}`, tabindex: 0, role: "button", "aria-label": `${u} birimine geç`, "data-u": i, style: "cursor:pointer" }, svg);
        r.addEventListener("click", () => { idx = i; draw(); changed(); });
        r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); idx = i; draw(); changed(); svg.querySelector(`[data-u="${i}"]`)?.focus(); } });
        S("text", { x: x + (sw - 6) / 2, y: y + sh / 2 + 4, class: "sd-tl", style: `font-size:19px;pointer-events:none${i === idx ? ";fill:var(--on-brand)" : ""}` }, svg, u);
        if (i < n - 1) S("text", { x: x + 4, y: y + sh + 13, class: "sd-ts", "text-anchor": "start", style: "font-size:14px" }, svg, `↓ × ${K.toLocaleString("tr-TR")}`);
      });
      el.querySelector(".sd-eq").innerHTML = `${show(base)} ${U[from]} = <b class="num">${show(val())} ${U[idx]}</b>`;
      el.querySelector(".sd-out").innerHTML = idx === from ? `Bir basamak aşağı inince ${K.toLocaleString("tr-TR")} ile çarp, yukarı çıkınca ${K.toLocaleString("tr-TR")} ile böl.` :
        `${U[from]} birimden ${U[idx]} birimine ${Math.abs(idx - from)} basamak ${idx > from ? "aşağı indin: sayı" : "yukarı çıktın: sayı"} ${idx > from ? "" : "1/"}${(K ** Math.abs(idx - from)).toLocaleString("tr-TR")} ${idx > from ? "katına çıktı" : "katına indi"}.`;
      el.querySelectorAll("[data-s]").forEach((b) => { b.disabled = (+b.dataset.s < 0 && idx === 0) || (+b.dataset.s > 0 && idx === n - 1); });
    }
    el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { idx = Math.max(0, Math.min(n - 1, idx + +b.dataset.s)); draw(); changed(); }));
    draw();
    return () => ({ idx, val: val(), birim: idx });
  });

  // ---------- 9. İşlem makinesi: algoritmanın adımları, girdi ve çıktı ----------
  reg("d-islem-makinesi", (el, cfg, changed) => {
    const ops = cfg.adimlar ?? [["×", 3], ["+", 2]];
    const st = { x: cfg.x ?? 1 }, rows = [];
    const ap = (v, [o, k]) => (o === "×" ? v * k : o === "÷" ? v / k : o === "+" ? v + k : o === "−" ? v - k : o === "kare" ? v * v : v);
    const word = ([o, k]) => (o === "×" ? `${neg(k)} ile çarp` : o === "÷" ? `${neg(k)} ile böl` : o === "+" ? `${neg(k)} ekle` : o === "−" ? `${neg(k)} çıkar` : "karesini al");
    const run = (x) => ops.reduce((v, o) => ap(v, o), x);
    el.innerHTML = `<div class="sd-wrap">${slider(cfg.etiket ?? "Girdi x", "x", cfg.min ?? 0, cfg.max ?? 10, cfg.adim ?? 1, st.x)}<div class="sd-flow" aria-live="polite"></div>
      <div class="sd-split"><ol class="sd-out sd-alg"></ol><div class="sd-wrap"><div class="bb-ex"><button type="button" class="btn btn-small btn-outline" data-a="save">Tabloya ekle</button><button type="button" class="btn btn-small btn-outline" data-a="clr">Tabloyu temizle</button></div><div class="sd-tab"></div></div></div></div>`;
    function draw() {
      const x = st.x; let v = x;
      const parts = [`<div class="sd-box in">Girdi<b class="num">${fmt(x)}</b></div>`];
      ops.forEach((o) => { v = ap(v, o); parts.push(`<span class="sd-arrow">→</span><div class="sd-box">${o[0] === "kare" ? "karesi" : `${o[0]} ${neg(o[1])}`}<b class="num">${fmt(v)}</b></div>`); });
      parts.push(`<span class="sd-arrow">→</span><div class="sd-box out">Çıktı${cfg.ifade ? ` ${cfg.ifade}` : ""}<b class="num">${fmt(v)}</b></div>`);
      el.querySelector(".sd-flow").innerHTML = parts.join("");
      el.querySelector(".sd-alg").innerHTML = `<li>Başla.</li><li>Girdiyi (x) al.</li>${ops.map((o) => `<li>Sonucu ${word(o)}.</li>`).join("")}<li>Sonucu yaz. Bitir.</li>`;
      el.querySelector(".sd-tab").innerHTML = rows.length ? `<div class="table-wrap"><table class="sd-tbl"><thead><tr><th>x</th><th>${cfg.ifade ?? "Çıktı"}</th></tr></thead><tbody>${rows.map(([a, b]) => `<tr><td>${fmt(a)}</td><td>${fmt(b)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="note">Farklı girdileri tabloya ekleyip çıktıların nasıl değiştiğine bak.</p>`;
      setV(el, st);
    }
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => { if (b.dataset.a === "clr") rows.length = 0; else if (!rows.some((r) => r[0] === st.x) && rows.length < 8) rows.push([st.x, run(st.x)]); rows.sort((p, q) => p[0] - q[0]); draw(); changed(); }));
    bind(el, st, draw, changed); draw();
    return () => ({ x: st.x, y: run(st.x), kayit: rows.length });
  });

  // ---------- 10. Paralel iki doğru ve bir kesen ----------
  reg("d-paralel-kesen", (el, cfg, changed) => {
    const st = { aci: cfg.aci ?? 60, egim: cfg.egim ?? 0 };
    let mode = cfg.mod ?? "yondes";
    const REL = { yondes: ["Yöndeş", [[1, 5], [2, 6], [3, 7], [4, 8]], "eşit"], ic: ["İç ters", [[3, 5], [4, 6]], "eşit"], dis: ["Dış ters", [[1, 7], [2, 8]], "eşit"], ick: ["İç karşı durumlu", [[4, 5], [3, 6]], "toplamı 180°"], disk: ["Dış karşı durumlu", [[1, 8], [2, 7]], "toplamı 180°"], ters: ["Ters", [[1, 3], [2, 4], [5, 7], [6, 8]], "eşit"] };
    const keys = cfg.iliskiler ?? Object.keys(REL);
    el.innerHTML = `<div class="sd-wrap">${seg("Açı çifti", keys.map((k) => [k, REL[k][0]]), mode)}<div class="sd-host"></div><div class="plane-wrap"><div class="plane-ctrl">${slider("Kesenin açısı", "aci", 30, 150, 5, st.aci)}${cfg.egimli ? slider("d₂ doğrusunu döndür", "egim", -20, 20, 5, st.egim) : ""}</div><p class="sd-out"></p></div></div>`;
    function draw() {
      const α = st.aci, τ = st.egim, rad = Math.PI / 180;
      const P = [320, 95], Q = [320 - (115 * Math.cos(α * rad)) / Math.sin(α * rad), 210];
      const at = (p, deg, r) => [p[0] + r * Math.cos(deg * rad), p[1] - r * Math.sin(deg * rad)];
      const svg = S("svg", { viewBox: "0 0 640 300", class: "sim-svg", role: "img", "aria-label": `Kesen ile d₁ arasındaki açı ${α} derece` });
      const ang = { 1: [0, α], 2: [α, 180], 3: [180, 180 + α], 4: [180 + α, 360], 5: [τ, α], 6: [α, 180 + τ], 7: [180 + τ, 180 + α], 8: [180 + α, 360 + τ] };
      const val = (i) => ang[i][1] - ang[i][0];
      const pairs = REL[mode][1], hot = new Set(pairs.flat());
      const wedge = (i, cls) => { const p = i <= 4 ? P : Q, [s, e] = ang[i], r = 34, a1 = at(p, s, r), a2 = at(p, e, r); S("path", { d: `M${p[0]},${p[1]} L${a1[0]},${a1[1]} A${r},${r} 0 0 0 ${a2[0]},${a2[1]} Z`, class: cls }, svg); };
      [1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => { if (hot.has(i)) wedge(i, `sd-wedge hl${pairs.findIndex((pr) => pr.includes(i)) % 2 ? " alt" : ""}`); });
      S("line", { x1: 10, y1: P[1], x2: 630, y2: P[1], class: "sd-ln" }, svg);
      const l2a = at(Q, τ, 340), l2b = at(Q, τ + 180, 340);
      S("line", { x1: l2a[0], y1: l2a[1], x2: l2b[0], y2: l2b[1], class: "sd-ln" }, svg);
      const ka = at(P, α, 90), kb = at(Q, α + 180, 80);
      S("line", { x1: ka[0], y1: ka[1], x2: kb[0], y2: kb[1], class: "sd-hl" }, svg);
      S("text", { x: 24, y: P[1] - 8, class: "sd-t", "text-anchor": "start" }, svg, "d₁");
      S("text", { x: 24, y: Q[1] - 8 + Math.tan(τ * rad) * (Q[0] - 24), class: "sd-t", "text-anchor": "start" }, svg, "d₂");
      S("text", { x: ka[0] + 10, y: ka[1] + 4, class: "sd-t", "text-anchor": "start" }, svg, "k");
      if (τ === 0) [P[1], Q[1]].forEach((y) => S("path", { d: `M596,${y - 6} L604,${y} L596,${y + 6}`, class: "sd-ln", "stroke-width": 2 }, svg));
      [1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => {
        const p = i <= 4 ? P : Q, [s, e] = ang[i], m = (s + e) / 2, q = at(p, m, hot.has(i) ? 54 : 50);
        S("text", { x: q[0], y: q[1] + 5, class: hot.has(i) ? "sd-t" : "sd-ts" }, svg, hot.has(i) ? `${val(i)}°` : `${i}`);
      });
      el.querySelector(".sd-host").replaceChildren(svg);
      const [name, , rel] = REL[mode];
      const okRel = (a, b) => (rel === "eşit" ? val(a) === val(b) : val(a) + val(b) === 180);
      el.querySelector(".sd-out").innerHTML = `<b>${name} açılar</b> (renkli): ${pairs.map(([a, b]) => `${val(a)}° ve ${val(b)}°`).join("; ")}.<br>${τ === 0 ? `d₁ ∥ d₂ olduğu için bu açılar <b>${rel}</b>.` : pairs.every(([a, b]) => okRel(a, b)) ? `Bu çift doğruların paralelliğine bağlı değil.` : `<span class="sd-no">d₁ ile d₂ paralel değil:</span> bu açılar artık ${rel === "eşit" ? "eşit değil" : "180°'ye tamamlanmıyor"}.`}`;
      setV(el, st);
    }
    el.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; el.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    bind(el, st, draw, changed); draw();
    return () => ({ aci: st.aci, egim: st.egim, paralel: st.egim === 0 ? 1 : 0, a1: st.aci, a2: 180 - st.aci, a5: st.aci - st.egim, mod: keys.indexOf(mode) });
  });

  // ---------- 11. Köşegenlerden dörtgen: köşegenlerin uzunluğu, açısı ve kesişim yeri ----------
  reg("d-kosegen", (el, cfg, changed) => {
    const st = { e: cfg.e ?? 8, f: cfg.f ?? 6, aci: cfg.aci ?? 60, k: cfg.k ?? 5 };
    const NAMES = ["Köşegenler birbirini ortalamıyor: paralelkenar değil", "Paralelkenar", "Dikdörtgen", "Eşkenar dörtgen", "Kare"];
    el.innerHTML = `<div class="plane-wrap"><div class="sd-host"></div><div class="plane-ctrl"><p class="eq"></p>
      ${slider("[AC] köşegeni", "e", 2, 12, 1, st.e)}${slider("[BD] köşegeni", "f", 2, 12, 1, st.f)}${slider("Köşegenler arası açı (°)", "aci", 30, 90, 5, st.aci)}${cfg.kaydir === false ? "" : slider("O noktası [BD] üzerinde (5 = orta)", "k", 2, 8, 1, st.k)}<p class="sd-out"></p></div></div>`;
    const geo = () => {
      const { e, f, aci, k } = st, r = (aci * Math.PI) / 180, v = [Math.cos(r), Math.sin(r)];
      const A = [-e / 2, 0], C = [e / 2, 0], B = [(-k / 10) * f * v[0], (-k / 10) * f * v[1]], D = [(1 - k / 10) * f * v[0], (1 - k / 10) * f * v[1]];
      return [A, B, C, D];
    };
    const type = () => { const { e, f, aci, k } = st; if (k !== 5) return 0; if (e === f && aci === 90) return 4; if (e === f) return 2; if (aci === 90) return 3; return 1; };
    const area = () => (st.e * st.f * Math.sin((st.aci * Math.PI) / 180)) / 2;
    function draw() {
      const P = geo(), U = 16, O = [180, 170], X = (p) => [O[0] + p[0] * U, O[1] - p[1] * U];
      const svg = S("svg", { viewBox: "0 0 360 340", class: "sim-svg", role: "img", "aria-label": NAMES[type()] });
      S("polygon", { points: P.map((p) => X(p).join(",")).join(" "), class: "sd-fill" }, svg);
      const [A, B, C, D] = P.map(X);
      S("line", { x1: A[0], y1: A[1], x2: C[0], y2: C[1], class: "sd-dash" }, svg);
      S("line", { x1: B[0], y1: B[1], x2: D[0], y2: D[1], class: "sd-dash" }, svg);
      S("circle", { cx: O[0], cy: O[1], r: 4, class: "sd-good" }, svg);
      S("text", { x: O[0] + 10, y: O[1] + 16, class: "sd-ts" }, svg, "O");
      const len = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
      const angAt = (i) => { const p = P[i], a = P[(i + 3) % 4], b = P[(i + 1) % 4], v1 = [a[0] - p[0], a[1] - p[1]], v2 = [b[0] - p[0], b[1] - p[1]]; return (Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2))) * 180) / Math.PI; };
      ["A", "B", "C", "D"].forEach((n, i) => { const s = X(P[i]), d = Math.hypot(s[0] - O[0], s[1] - O[1]) || 1; S("text", { x: s[0] + ((s[0] - O[0]) / d) * 18, y: s[1] + ((s[1] - O[1]) / d) * 18 + 5, class: "sd-tl" }, svg, n); });
      el.querySelector(".sd-host").replaceChildren(svg);
      const t = type(), sides = [len(P[0], P[1]), len(P[1], P[2]), len(P[2], P[3]), len(P[3], P[0])], an = [0, 1, 2, 3].map(angAt);
      el.querySelector(".eq").textContent = NAMES[t].split(":")[0] === NAMES[0].split(":")[0] ? "Paralelkenar değil" : NAMES[t];
      el.querySelector(".sd-out").innerHTML = `${t === 0 ? NAMES[0] + ".<br>" : ""}Kenarlar: |AB| = ${fmt(sides[0], 1)}, |BC| = ${fmt(sides[1], 1)}, |CD| = ${fmt(sides[2], 1)}, |DA| = ${fmt(sides[3], 1)}<br>Açılar: A = ${Math.round(an[0])}°, B = ${Math.round(an[1])}°, C = ${Math.round(an[2])}°, D = ${Math.round(an[3])}°<br>Alan = <b class="num">${fmt(area(), 1)}</b> birimkare${st.aci === 90 ? ` = ${st.e} × ${st.f} ÷ 2` : ""}`;
      setV(el, st);
    }
    bind(el, st, draw, changed); draw();
    return () => ({ ...st, tur: type(), alan: area() });
  });

  // ---------- 12. Çemberi yuvarla: çevre ≈ 3,14 × çap ----------
  reg("d-cember-acinim", (el, cfg, changed) => {
    const st = { d: cfg.d ?? 2, t: 0 };
    el.innerHTML = `<div class="sd-wrap"><div class="sd-host"></div><div class="plane-wrap"><div class="plane-ctrl">${slider("Çap (birim)", "d", 1, 6, 1, st.d)}${slider("Yuvarlanma (%)", "t", 0, 100, 5, st.t)}</div><p class="sd-out"></p></div></div>`;
    const U = 27, x0 = 90, G = 190;
    function draw() {
      const d = st.d, t = st.t / 100, r = (d * U) / 2, Lp = Math.PI * d * U, cx = x0 + t * Lp, cy = G - r, φ = t * 2 * Math.PI;
      const svg = S("svg", { viewBox: "0 0 700 250", class: "sim-svg", role: "img", "aria-label": `Çapı ${d} birim olan çember` });
      S("line", { x1: 4, y1: G, x2: 696, y2: G, class: "sd-thin" }, svg);
      for (let j = 1; j * d * U + x0 <= 690; j++) { const x = x0 + j * d * U; S("line", { x1: x, y1: G, x2: x, y2: G + 12, class: "sd-thin" }, svg); if (j <= 4) S("text", { x, y: G + 32, class: "sd-ts", style: "font-size:18px" }, svg, `${j} çap`); }
      S("line", { x1: x0, y1: G, x2: x0, y2: G + 12, class: "sd-thin" }, svg);
      if (t > 0) S("line", { x1: x0, y1: G, x2: x0 + t * Lp, y2: G, class: "sd-hl", "stroke-width": 6 }, svg);
      if (t === 1) { S("line", { x1: x0 + Lp, y1: G - 14, x2: x0 + Lp, y2: G + 44, class: "sd-ln", "stroke-width": 2 }, svg); S("text", { x: Math.min(x0 + Lp, 600), y: G + 58, class: "sd-t", style: "font-size:20px" }, svg, `çevre ≈ ${fmt(Math.PI * d, 2)}`); }
      // Çemberin henüz açılmamış kısmı renkli yay.
      const pt = (a) => [cx - r * Math.sin(a), cy + r * Math.cos(a)];
      S("circle", { cx, cy, r, class: "sd-thin", "stroke-width": 2 }, svg);
      if (t < 1) { const s = pt(φ), e = pt(2 * Math.PI - 0.0001); S("path", { d: `M${s[0]},${s[1]} A${r},${r} 0 ${1 - t > 0.5 ? 1 : 0} 1 ${e[0]},${e[1]}`, class: "sd-hl", "stroke-width": 5 }, svg); }
      const m = pt(φ), m2 = [2 * cx - m[0], 2 * cy - m[1]];
      S("line", { x1: m[0], y1: m[1], x2: m2[0], y2: m2[1], class: "sd-dash" }, svg);
      S("circle", { cx: m[0], cy: m[1], r: 6, class: "sd-good" }, svg);
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelector(".sd-out").innerHTML = `Çap = <b>${d}</b> birim. Yuvarlanan yol = <b class="num">${fmt(t * Math.PI * d, 2)}</b> birim.<br>${t === 1 ? `Tam bir tur: çevre ≈ <b>${fmt(Math.PI * d, 2)}</b> birim. Çevre ÷ çap ≈ <b>3,14</b> (π).` : "Çemberi tam bir tur yuvarla; kaç çap boyu yol aldığına bak."}`;
      setV(el, st);
    }
    bind(el, st, draw, changed); draw();
    return () => ({ d: st.d, t: st.t / 100, cevre: Math.PI * st.d });
  });

  // ---------- 13. Merkez açı: yay uzunluğu ya da daire dilimi alanı ----------
  reg("d-daire-dilimi", (el, cfg, changed) => {
    const st = { r: cfg.r ?? 5, aci: cfg.aci ?? 90 }, mode = cfg.mod ?? "yay", pi = cfg.pi ?? 3.14, step = cfg.adim ?? 5;
    const piT = String(pi).replace(".", ",");
    el.innerHTML = `<div class="plane-wrap"><div class="sd-host"></div><div class="plane-ctrl"><p class="eq"></p>${slider("Yarıçap r", "r", 1, cfg.rmax ?? 10, 1, st.r)}${slider("Merkez açı (°)", "aci", 0, 360, step, st.aci)}<p class="sd-out"></p><p class="note">Noktayı çember üzerinde sürükleyebilir ya da ok tuşlarını kullanabilirsin.</p></div></div>`;
    const CX = 150, CY = 150, R = 115;
    const svg = S("svg", { viewBox: "0 0 300 300", class: "sim-svg drag sd-focus", tabindex: 0, role: "slider", "aria-label": "Merkez açı", style: "max-width:360px" });
    el.querySelector(".sd-host").replaceChildren(svg);
    const yay = () => (2 * pi * st.r * st.aci) / 360, alan = () => (pi * st.r * st.r * st.aci) / 360;
    function draw() {
      svg.replaceChildren();
      const a = st.aci, rad = (a * Math.PI) / 180, ex = CX + R * Math.cos(rad), ey = CY - R * Math.sin(rad);
      S("circle", { cx: CX, cy: CY, r: R, class: mode === "alan" ? "sd-cell" : "sd-thin", "stroke-width": 2 }, svg);
      if (a >= 360) S("circle", { cx: CX, cy: CY, r: R, class: mode === "alan" ? "sd-fill" : "sd-hl", "stroke-width": mode === "alan" ? 2.5 : 7 }, svg);
      else if (a > 0) {
        if (mode === "alan") S("path", { d: `M${CX},${CY} L${CX + R},${CY} A${R},${R} 0 ${a > 180 ? 1 : 0} 0 ${ex},${ey} Z`, class: "sd-fill" }, svg);
        else { S("path", { d: `M${CX},${CY} L${CX + 36},${CY} A36,36 0 ${a > 180 ? 1 : 0} 0 ${CX + 36 * Math.cos(rad)},${CY - 36 * Math.sin(rad)} Z`, class: "sd-wedge" }, svg); S("path", { d: `M${CX + R},${CY} A${R},${R} 0 ${a > 180 ? 1 : 0} 0 ${ex},${ey}`, class: "sd-hl", "stroke-width": 7 }, svg); }
      }
      S("line", { x1: CX, y1: CY, x2: CX + R, y2: CY, class: "sd-ln", "stroke-width": 2 }, svg);
      S("line", { x1: CX, y1: CY, x2: ex, y2: ey, class: "sd-ln", "stroke-width": 2 }, svg);
      S("circle", { cx: CX, cy: CY, r: 4, class: "sd-good" }, svg);
      S("circle", { cx: ex, cy: ey, r: 11, class: "sd-knob" }, svg);
      const mid = a / 2 * Math.PI / 180;
      if (a > 0 && a < 360) S("text", { x: CX + 58 * Math.cos(mid), y: CY - 58 * Math.sin(mid) + 5, class: "sd-t" }, svg, `${a}°`);
      S("text", { x: CX + R / 2, y: CY + 18, class: "sd-ts" }, svg, `r = ${st.r}`);
      svg.setAttribute("aria-valuetext", `${a} derece`);
      const g = gcd(a, 360) || 1;
      el.querySelector(".eq").textContent = mode === "alan" ? `Dilim alanı ≈ ${fmt(alan(), 2)}` : `Yay uzunluğu ≈ ${fmt(yay(), 2)}`;
      el.querySelector(".sd-out").innerHTML = `Merkez açı tam açının <b>${a}/360${g > 1 && a ? ` = ${a / g}/${360 / g}` : ""}</b> kadarı.<br>${mode === "alan" ? `Daire alanı = π · r² ≈ ${piT} · ${st.r}² = ${fmt(pi * st.r * st.r, 2)}<br>Dilim alanı = π · r² · α/360 ≈ <b class="num">${fmt(alan(), 2)}</b>` : `Çevre = 2 · π · r ≈ 2 · ${piT} · ${st.r} = ${fmt(2 * pi * st.r, 2)}<br>Yay = 2 · π · r · α/360 ≈ <b class="num">${fmt(yay(), 2)}</b>`}`;
      syncIn(el, st); setV(el, st);
    }
    drag(svg, () => true, (ev) => { const p = svgPt(svg, ev); let d = (Math.atan2(CY - p.y, p.x - CX) * 180) / Math.PI; if (d < 0) d += 360; d = Math.round(d / step) * step; if (d === 0 && st.aci > 270) d = 360; if (d !== st.aci) { st.aci = d; draw(); changed(); } });
    svg.addEventListener("keydown", (e) => { const s = e.key === "ArrowLeft" || e.key === "ArrowUp" ? step : e.key === "ArrowRight" || e.key === "ArrowDown" ? -step : 0; if (s) { e.preventDefault(); st.aci = Math.max(0, Math.min(360, st.aci + s)); draw(); changed(); } });
    bind(el, st, draw, changed); draw();
    return () => ({ r: st.r, aci: st.aci, oran: st.aci / 360, yay: yay(), alan: alan() });
  });

  // ---------- 14. Torbadan top çekme: teorik ve deneysel olasılık ----------
  reg("d-torba", (el, cfg, changed) => {
    const NAMES = cfg.adlar ?? ["Kırmızı", "Yeşil", "Sarı", "Kahverengi"];
    const k = [...(cfg.toplar ?? [3, 2, 1])];
    const cnt = k.map(() => 0);
    let total = 0, last = -1;
    const N = () => k.reduce((a, b) => a + b, 0);
    function pick() { const n = N(); let r = Math.floor(Math.random() * n); for (let i = 0; i < k.length; i++) { if (r < k[i]) return i; r -= k[i]; } return 0; }
    function draw(focus) {
      const n = N(), cols = 6, rws = Math.max(1, Math.ceil(n / cols));
      const svg = S("svg", { viewBox: `0 0 220 ${rws * 30 + 50}`, class: "sim-svg", role: "img", "aria-label": `Torbada ${n} top`, style: "max-width:260px" });
      S("rect", { x: 6, y: 20, width: 208, height: rws * 30 + 24, rx: 26, class: "sd-cell" }, svg);
      let q = 0;
      k.forEach((c, i) => { for (let j = 0; j < c; j++, q++) S("circle", { cx: 30 + (q % cols) * 32, cy: 44 + Math.floor(q / cols) * 30, r: 12, class: `sd-c${i}` }, svg); });
      const edit = cfg.duzenle ? (i) => `<button type="button" class="btn btn-outline btn-small" data-k="${i}" data-s="-1" aria-label="${NAMES[i]} top çıkar" ${k[i] ? "" : "disabled"}>−</button><button type="button" class="btn btn-outline btn-small" data-k="${i}" data-s="1" aria-label="${NAMES[i]} top ekle" ${k[i] < 12 ? "" : "disabled"}>+</button>` : () => "";
      el.innerHTML = `<div class="sd-split"><div class="sd-host"></div><div class="sd-wrap">
        ${cfg.cek === false ? "" : `<div class="bb-ex"><button type="button" class="btn btn-small btn-outline" data-n="1" ${n ? "" : "disabled"}>1 top çek</button><button type="button" class="btn btn-small btn-outline" data-n="10" ${n ? "" : "disabled"}>10 kez</button><button type="button" class="btn btn-small btn-outline" data-n="100" ${n ? "" : "disabled"}>100 kez</button><button type="button" class="btn btn-small btn-outline" data-n="0">Sıfırla</button></div>
        <p class="sd-out">Çekiş sayısı: <b class="num">${total}</b>${last >= 0 ? ` · Son çekilen: <b>${NAMES[last]}</b>` : ""} <span class="sd-muted">(Çekilen top torbaya geri atılır.)</span></p>`}</div></div>
        <div class="table-wrap"><table class="sd-tbl"><thead><tr><th>Renk</th><th>Top</th>${cfg.teorik === false ? "" : "<th>Olasılık</th>"}${cfg.cek === false ? "" : "<th>Çekildi</th><th>Göreli sıklık</th>"}</tr></thead><tbody>${k.map((c, i) => `<tr><td><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="7" class="sd-c${i}"/></svg> ${NAMES[i]}</td><td><span class="sd-row" style="flex-wrap:nowrap;gap:4px">${edit(i).replace("</button><button", `</button><b class="num">${c}</b><button`) || `<b class="num">${c}</b>`}</span></td>${cfg.teorik === false ? "" : `<td>${n ? `${c}/${n}${gcd(c, n) > 1 && c ? ` = ${frac(c, n)}` : ""}` : "–"}</td>`}${cfg.cek === false ? "" : `<td>${cnt[i]}</td><td>${total ? `${cnt[i]}/${total} ≈ ${fmt(cnt[i] / total, 2)}` : "–"}</td>`}</tr>`).join("")}</tbody></table></div>`;
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { const m = +b.dataset.n; if (!m) { cnt.fill(0); total = 0; last = -1; } else for (let j = 0; j < m; j++) { last = pick(); cnt[last]++; total++; } draw(`[data-n="${m}"]`); changed(); }));
      el.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.k; k[i] = Math.max(0, Math.min(12, k[i] + +b.dataset.s)); cnt.fill(0); total = 0; last = -1; draw(`[data-k="${i}"][data-s="${b.dataset.s}"]`); changed(); }));
      if (focus) el.querySelector(focus + ":not([disabled])")?.focus();
    }
    draw();
    return () => { const n = N(), st = { N: n, total }; k.forEach((c, i) => { st["k" + i] = c; st["p" + i] = n ? c / n : 0; st["f" + i] = total ? cnt[i] / total : 0; }); return st; };
  });

  // ---------- 15. Sayma pulları: pozitif ve negatif pullar, sıfır çiftleri ----------
  reg("d-sayma-pullari", (el, cfg, changed) => {
    let p = cfg.arti ?? 3, n = cfg.eksi ?? 5;
    const MAX = 15;
    function draw(focus) {
      const pr = Math.min(p, n), cols = Math.max(p, n), W = Math.max(8, cols) * 36 + 20;
      const svg = S("svg", { viewBox: `0 0 ${W} 110`, class: "sim-svg", role: "img", "aria-label": `${p} pozitif ve ${n} negatif pul`, style: `max-width:${W * 1.1}px` });
      for (let i = 0; i < cols; i++) {
        const x = 28 + i * 36;
        if (i < pr) S("rect", { x: x - 17, y: 8, width: 34, height: 94, rx: 17, class: "sd-cell alt" }, svg);
        if (i < p) { S("circle", { cx: x, cy: 30, r: 15, class: "sd-chip-p" }, svg); S("text", { x, y: 36, class: "sd-chip-t" }, svg, "+"); }
        if (i < n) { S("circle", { cx: x, cy: 80, r: 15, class: "sd-chip-n" }, svg); S("text", { x, y: 86, class: "sd-chip-t" }, svg, "−"); }
      }
      const B = (a, l, dis) => `<button type="button" class="btn btn-small btn-outline" data-a="${a}" ${dis ? "disabled" : ""}>${l}</button>`;
      el.innerHTML = `<div class="sd-wrap"><div class="sd-host"></div>
        <div class="bb-ex">${B("p+", "+1 pul ekle", p >= MAX)}${B("n+", "−1 pul ekle", n >= MAX)}${B("p-", "+1 pul çıkar", !p)}${B("n-", "−1 pul çıkar", !n)}</div>
        <div class="bb-ex">${B("z+", "Sıfır çifti ekle", p >= MAX || n >= MAX)}${B("z-", "Sıfır çiftlerini at", !pr)}</div>
        <p class="sd-big">Pozitif ${p} · Negatif ${n} · Değer: <b class="num">${neg(p - n)}</b></p>
        <p class="note">Bir + pul ile bir − pul bir <b>sıfır çifti</b> oluşturur (gri çerçeve): (+1) + (−1) = 0. Sıfır çifti eklemek ya da atmak değeri değiştirmez.</p></div>`;
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "p+") p++; else if (a === "n+") n++; else if (a === "p-") p--; else if (a === "n-") n--; else if (a === "z+") { p++; n++; } else { const m = Math.min(p, n); p -= m; n -= m; }
        draw(a); changed();
      }));
      if (focus) (el.querySelector(`[data-a="${focus}"]:not([disabled])`) || el.querySelector("[data-a]:not([disabled])"))?.focus();
    }
    draw();
    return () => ({ arti: p, eksi: n, value: p - n, cift: Math.min(p, n) });
  });

  // ---------- 16. Bölmeden ondalık açılım: sonlu ya da devirli ----------
  reg("d-ondalik-acilim", (el, cfg, changed) => {
    const st = { pay: cfg.pay ?? 1, payda: cfg.payda ?? 6 };
    el.innerHTML = `<div class="sd-wrap"><div class="plane-wrap"><div class="plane-ctrl">${slider("Pay", "pay", 1, cfg.paymax ?? 20, 1, st.pay)}${slider("Payda", "payda", 2, cfg.paydamax ?? 20, 1, st.payda)}</div><div class="sd-wrap"><p class="sd-big sd-r"></p><p class="sd-out"></p></div></div><div class="sd-steps"></div></div>`;
    const expand = (p, q) => {
      const whole = Math.floor(p / q); let r = p % q; const seen = new Map(), dig = [], rem = [];
      while (r !== 0 && !seen.has(r) && dig.length < 40) { seen.set(r, dig.length); rem.push(r); r *= 10; dig.push(Math.floor(r / q)); r %= q; }
      return { whole, dig, rem, start: r === 0 ? -1 : seen.get(r), endR: r };
    };
    const pf = (q) => { const o = []; for (let d = 2; q > 1; d++) while (q % d === 0) { o.push(d); q /= d; } return o; };
    function draw() {
      const { pay, payda } = st, x = expand(pay, payda), g = gcd(pay, payda), q2 = payda / g, f = pf(q2);
      const fin = x.start < 0;
      const decStr = x.dig.length ? `${x.whole},${fin ? x.dig.join("") : x.dig.slice(0, x.start).join("") + `<span class="sd-ovl">${x.dig.slice(x.start).join("")}</span>`}` : `${x.whole}`;
      el.querySelector(".sd-r").innerHTML = `${pay}/${payda} = <b class="num">${decStr}</b>`;
      const cnt = {}; f.forEach((p) => (cnt[p] = (cnt[p] || 0) + 1));
      const fstr = Object.keys(cnt).map((p) => (cnt[p] > 1 ? `${p}${sup(cnt[p])}` : p)).join(" · ") || "1";
      el.querySelector(".sd-out").innerHTML = `${g > 1 ? `Sadeleşmiş hâli: ${pay / g}/${q2}. ` : ""}Payda = ${q2} = ${fstr}<br>${fin ? `<span class="sd-ok">Sonlu ondalık:</span> paydanın asal çarpanları yalnız 2 ve 5.` : `<span class="sd-no">Devirli ondalık:</span> kalanlar tekrar ediyor; üstü çizili kısım sonsuza dek yinelenir.`}`;
      const rows = x.rem.slice(0, 8).map((r, i) => `<tr${!fin && i === x.start ? ' class="sd-ok"' : ""}><td>${r}</td><td>${r * 10} ÷ ${payda}</td><td><b>${x.dig[i]}</b></td><td>${(r * 10) % payda}</td></tr>`).join("");
      el.querySelector(".sd-steps").innerHTML = x.rem.length ? `<div class="table-wrap"><table class="sd-tbl"><thead><tr><th>Kalan</th><th>Sıfır ekle, böl</th><th>Basamak</th><th>Yeni kalan</th></tr></thead><tbody>${rows}</tbody></table></div>${x.rem.length > 8 ? `<p class="note">İlk 8 adım gösteriliyor.</p>` : ""}` : `<p class="note">Kalan 0: bölme tam.</p>`;
      setV(el, st);
    }
    bind(el, st, draw, changed); draw();
    return () => { const x = expand(st.pay, st.payda); return { pay: st.pay, payda: st.payda, sonlu: x.start < 0 ? 1 : 0, devir: x.start < 0 ? 0 : x.dig.length - x.start, value: st.pay / st.payda }; };
  });

  // ---------- 17. Cebir karoları: benzer terimler, sıfır çiftleri, sayıyla çarpma ----------
  reg("d-cebir-karolari", (el, cfg, changed) => {
    const t = { x: cfg.x ?? 2, nx: cfg.nx ?? 0, one: cfg.bir ?? 3, none: cfg.eksibir ?? 0 };
    const MAX = 20, LBL = { x: "x", nx: "−x", one: "1", none: "−1" }, NAME = { x: "x karosu", nx: "−x karosu", one: "1 karosu", none: "−1 karosu" };
    const expr = (a, b) => { if (!a && !b) return "0"; const xs = a ? `${a === 1 ? "" : a === -1 ? "−" : neg(a)}x` : ""; const cs = b ? (a ? ` ${b < 0 ? "−" : "+"} ${Math.abs(b)}` : neg(b)) : ""; return xs + cs; };
    function draw(focus) {
      const tiles = ["x", "nx", "one", "none"].flatMap((k) => Array(t[k]).fill(k));
      const B = (a, l, dis) => `<button type="button" class="btn btn-small btn-outline" data-a="${a}" ${dis ? "disabled" : ""}>${l}</button>`;
      const all = Object.values(t).reduce((a, b) => a + b, 0);
      el.innerHTML = `<div class="sd-wrap"><div class="bb-ex">${B("x", "+ x", t.x >= MAX)}${B("nx", "+ (−x)", t.nx >= MAX)}${B("one", "+ 1", t.one >= MAX)}${B("none", "+ (−1)", t.none >= MAX)}</div>
        <div class="sd-tiles" role="group" aria-label="Karolar; çıkarmak için karoya dokun">${tiles.map((k, i) => `<button type="button" class="sd-tile ${k}" data-t="${k}" data-i="${i}" aria-label="${NAME[k]}, çıkar">${LBL[k]}</button>`).join("") || `<span class="muted">Karo yok</span>`}</div>
        <div class="bb-ex">${B("zero", "Sıfır çiftlerini at", !(Math.min(t.x, t.nx) || Math.min(t.one, t.none)))}${cfg.carp === false ? "" : B("k2", "İfadeyi 2 ile çarp", all * 2 > 4 * MAX || Object.values(t).some((v) => v * 2 > MAX))}${B("clr", "Temizle", !all)}</div>
        <p class="sd-out">Karolar: ${t.x} tane x, ${t.nx} tane −x, ${t.one} tane 1, ${t.none} tane −1</p>
        <p class="sd-big">İfade: <b class="num">${expr(t.x - t.nx, t.one - t.none)}</b></p>
        <p class="note">x ile −x bir sıfır çifti, 1 ile −1 bir sıfır çiftidir. Yalnız benzer terimler birleşir: x karosu ile 1 karosu birleşip tek terim olamaz.</p></div>`;
      el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "zero") { const m = Math.min(t.x, t.nx), m2 = Math.min(t.one, t.none); t.x -= m; t.nx -= m; t.one -= m2; t.none -= m2; }
        else if (a === "k2") for (const k in t) t[k] *= 2;
        else if (a === "clr") for (const k in t) t[k] = 0;
        else t[a]++;
        draw(`[data-a="${a}"]`); changed();
      }));
      el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { t[b.dataset.t]--; draw(`[data-t="${b.dataset.t}"]`); changed(); }));
      if (focus) (el.querySelector(focus + ":not([disabled])") || el.querySelector("[data-a]:not([disabled])"))?.focus();
    }
    draw();
    return () => ({ px: t.x, nx: t.nx, p1: t.one, n1: t.none, x: t.x - t.nx, c: t.one - t.none, sade: t.x * t.nx === 0 && t.one * t.none === 0 ? 1 : 0 });
  });

  // ---------- 18. Eşitsizlik: sayı doğrusunda çözüm kümesi ----------
  reg("d-esitsizlik", (el, cfg, changed) => {
    const OPS = ["<", "≤", ">", "≥"], st = { b: cfg.b ?? 2 };
    let op = cfg.op ?? 0;
    const lo = cfg.min ?? -8, hi = cfg.max ?? 8;
    el.innerHTML = `<div class="sd-wrap"><p class="sd-big sd-ineq"></p>${seg("Eşitsizlik işareti", OPS.map((o, i) => [i, `x ${o} …`]), op, "o")}<div class="sd-host"></div>${slider("Sınır sayısı", "b", lo, hi, 1, st.b)}<p class="sd-out"></p></div>`;
    const L = 30, R = 610, X = (v) => L + ((v - (lo - 2)) / (hi - lo + 4)) * (R - L), Y = 60;
    function draw() {
      const b = st.b, left = op < 2, closed = op % 2 === 1;
      const svg = S("svg", { viewBox: "0 0 640 100", class: "sim-svg", role: "img", "aria-label": `x ${OPS[op]} ${b}` });
      S("line", { x1: L - 16, y1: Y, x2: R + 16, y2: Y, class: "sd-thin" }, svg);
      for (let v = lo - 2; v <= hi + 2; v++) { S("line", { x1: X(v), y1: Y - 6, x2: X(v), y2: Y + 6, class: "sd-thin" }, svg); S("text", { x: X(v), y: Y + 24, class: "sd-ts" }, svg, neg(v)); }
      const end = left ? L - 14 : R + 14;
      S("line", { x1: X(b), y1: Y, x2: end, y2: Y, class: "sd-hl", "stroke-width": 6 }, svg);
      S("path", { d: left ? `M${end + 12},${Y - 9} L${end},${Y} L${end + 12},${Y + 9}` : `M${end - 12},${Y - 9} L${end},${Y} L${end - 12},${Y + 9}`, class: "sd-hl", "stroke-width": 4 }, svg);
      S("circle", { cx: X(b), cy: Y, r: 9, style: `fill:${closed ? "var(--brand)" : "var(--surface)"};stroke:var(--brand);stroke-width:3` }, svg);
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelector(".sd-ineq").innerHTML = `<b class="num">x ${OPS[op]} ${neg(b)}</b>`;
      const ints = []; for (let v = lo - 2; v <= hi + 2; v++) if (left ? (closed ? v <= b : v < b) : closed ? v >= b : v > b) ints.push(v);
      const show = left ? ints.slice(-4) : ints.slice(0, 4);
      el.querySelector(".sd-out").innerHTML = `${closed ? "Dolu" : "Boş"} daire: ${neg(b)} çözüme ${closed ? "<b>dâhil</b>" : "<b>dâhil değil</b>"}. Ok ${left ? "sola" : "sağa"} doğru: ${left ? "daha küçük" : "daha büyük"} sayılar.<br>Çözümdeki bazı tam sayılar: ${left ? "…, " : ""}${show.map(neg).join(", ")}${left ? "" : ", …"}`;
      setV(el, st);
    }
    el.querySelectorAll("[data-o]").forEach((btn) => btn.addEventListener("click", () => { op = +btn.dataset.o; el.querySelectorAll("[data-o]").forEach((x) => x.setAttribute("aria-pressed", x === btn)); draw(); changed(); }));
    bind(el, st, draw, changed); draw();
    return () => ({ b: st.b, op, dir: op < 2 ? -1 : 1, kapali: op % 2 });
  });

  // ---------- 19. Tek ve çift: noktaları ikişer eşle, toplamı incele ----------
  reg("d-cift-tek", (el, cfg, changed) => {
    const st = { a: cfg.a ?? 5, b: cfg.b ?? 7 };
    el.innerHTML = `<div class="sd-wrap"><div class="sd-host"></div><div class="plane-wrap"><div class="plane-ctrl">${slider("1. sayı", "a", 1, 15, 1, st.a)}${slider("2. sayı", "b", 1, 15, 1, st.b)}</div><p class="sd-out"></p></div></div>`;
    const kind = (v) => (v % 2 ? `2 · ${(v - 1) / 2} + 1 (tek)` : `2 · ${v / 2} (çift)`);
    function draw() {
      const { a, b } = st, s = a + b, D = 20;
      const svg = S("svg", { viewBox: "0 0 640 210", class: "sim-svg", role: "img", "aria-label": `${a} ve ${b} sayılarının toplamı ${s}` });
      const group = (v, x0, y0, oddCls) => { for (let i = 0; i < v; i++) { const c = Math.floor(i / 2), r = i % 2, odd = v % 2 && i === v - 1; S("circle", { cx: x0 + c * D, cy: y0 + r * D, r: 7, class: odd ? `sd-dot ${oddCls}` : "sd-dot" }, svg); } };
      S("text", { x: 14, y: 33, class: "sd-t", "text-anchor": "start" }, svg, `${a}`); group(a, 50, 18, "odd");
      S("text", { x: 220, y: 30, class: "sd-t", "text-anchor": "start" }, svg, `+ ${b}`); group(b, 270, 18, "odd");
      S("text", { x: 14, y: 133, class: "sd-t", "text-anchor": "start" }, svg, `= ${s}`);
      const pa = Math.floor(a / 2), pb = Math.floor(b / 2);
      let col = 0;
      for (let i = 0; i < pa; i++, col++) { S("circle", { cx: 70 + col * D, cy: 118, r: 7, class: "sd-dot" }, svg); S("circle", { cx: 70 + col * D, cy: 138, r: 7, class: "sd-dot" }, svg); }
      for (let i = 0; i < pb; i++, col++) { S("circle", { cx: 70 + col * D, cy: 118, r: 7, class: "sd-dot" }, svg); S("circle", { cx: 70 + col * D, cy: 138, r: 7, class: "sd-dot" }, svg); }
      if (a % 2 && b % 2) { S("rect", { x: 70 + col * D - 11, y: 107, width: 22, height: 42, rx: 11, class: "sd-cell alt" }, svg); S("circle", { cx: 70 + col * D, cy: 118, r: 7, class: "sd-dot pair" }, svg); S("circle", { cx: 70 + col * D, cy: 138, r: 7, class: "sd-dot pair" }, svg); }
      else if (a % 2 || b % 2) S("circle", { cx: 70 + col * D, cy: 118, r: 7, class: "sd-dot odd" }, svg);
      S("text", { x: 320, y: 190, class: "sd-ts" }, svg, "Her sütun bir ikili; eşi olmayan nokta kırmızı.");
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelector(".sd-out").innerHTML = `${a} = ${kind(a)}<br>${b} = ${kind(b)}<br>${s} = ${kind(s)}${a % 2 && b % 2 ? `<br><span class="sd-ok">İki tek sayının artan noktaları birleşip yeni bir ikili oluşturdu.</span>` : ""}`;
      setV(el, st);
    }
    bind(el, st, draw, changed); draw();
    return () => ({ a: st.a, b: st.b, toplam: st.a + st.b, aTek: st.a % 2, bTek: st.b % 2, toplamCift: (st.a + st.b) % 2 === 0 ? 1 : 0 });
  });

  // ---------- 20. Eşit uzaklık: orta dikme ve açıortay inşası ----------
  reg("d-esit-uzaklik", (el, cfg, changed) => {
    const mode = cfg.mod ?? "ortadikme", U = 40, O = [320, 220];
    const X = (p) => [O[0] + p[0] * U, O[1] - p[1] * U];
    const st = { r: cfg.r ?? 2, r2: cfg.r2 ?? 2 };
    let P = cfg.p ? [...cfg.p] : mode === "ortadikme" ? [2, 2.5] : [1, 3];
    const A = [-3, 0], B = [3, 0];
    const V = [-5, -2.5], th = ((cfg.aci ?? 70) * Math.PI) / 180, d1 = [1, 0], d2 = [Math.cos(th), Math.sin(th)];
    const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const lineDist = (p, o, d) => { const v = [p[0] - o[0], p[1] - o[1]], t = v[0] * d[0] + v[1] * d[1]; return t < 0 ? Math.hypot(...v) : Math.abs(v[0] * d[1] - v[1] * d[0]); };
    const foot = (p, o, d) => { const v = [p[0] - o[0], p[1] - o[1]], t = Math.max(0, v[0] * d[0] + v[1] * d[1]); return [o[0] + t * d[0], o[1] + t * d[1]]; };
    el.innerHTML = `<div class="plane-wrap"><div class="sd-host"></div><div class="plane-ctrl">${mode === "ortadikme" ? slider("Pergel açıklığı", "r", 1, 6, 0.5, st.r) : slider("1. yayın yarıçapı", "r", 1, 5, 0.5, st.r) + slider("2. yayların yarıçapı", "r2", 1, 5, 0.5, st.r2)}<p class="sd-out"></p><p class="note">P noktasını sürükle ya da çizime dokunup ok tuşlarıyla taşı.</p></div></div>`;
    const svg = S("svg", { viewBox: "0 0 640 400", class: "sim-svg drag sd-focus", tabindex: 0, role: "application", "aria-label": "Çizim alanı; P noktası ok tuşlarıyla taşınır" });
    el.querySelector(".sd-host").replaceChildren(svg);
    const circ = (c, r, cls = "sd-dash") => { const q = X(c); S("circle", { cx: q[0], cy: q[1], r: r * U, class: cls }, svg); };
    const seg2 = (p, q, cls) => { const a = X(p), b = X(q); S("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: cls }, svg); };
    const lab = (p, t, dx = 0, dy = -14, cls = "sd-tl") => { const q = X(p); S("text", { x: q[0] + dx, y: q[1] + dy, class: cls }, svg, t); };
    const dot = (p, cls = "ao-v", r = 5) => { const q = X(p); S("circle", { cx: q[0], cy: q[1], r, class: cls }, svg); };
    let info = {};
    function draw() {
      svg.replaceChildren();
      if (mode === "ortadikme") {
        const r = st.r, h = r * r - 9, ok = h > 1e-9;
        circ(A, r); circ(B, r);
        seg2(A, B, "sd-ln");
        if (ok) { const y = Math.sqrt(h); dot([0, y], "sd-good"); dot([0, -y], "sd-good"); seg2([0, -5.5], [0, 4.6], "sd-gl"); lab([0, 4.2], "orta dikme", 52, 4, "sd-ts"); }
        dot(A); dot(B); lab(A, "A", -14, -10); lab(B, "B", 14, -10);
        const pa = dist(P, A), pb = dist(P, B);
        seg2(P, A, "sd-dash"); seg2(P, B, "sd-dash"); dot(P, "sd-knob", 10); lab(P, "P", 0, -16);
        info = { r, kesisir: ok ? 1 : 0, pa, pb, fark: Math.abs(pa - pb), uzak: dist(P, [0, 0]) };
        el.querySelector(".sd-out").innerHTML = `${ok ? `<span class="sd-ok">Yaylar iki noktada kesişti.</span> Bu noktalardan geçen doğru [AB]'nin orta dikmesi.` : `Yaylar kesişmiyor: açıklık |AB|'nin yarısından (3) büyük olmalı.`}<br>|PA| = <b class="num">${fmt(pa, 2)}</b> · |PB| = <b class="num">${fmt(pb, 2)}</b>${Math.abs(pa - pb) < 0.05 ? ` <span class="sd-ok">eşit!</span>` : ""}`;
      } else {
        const K = [V[0] + st.r * d1[0], V[1] + st.r * d1[1]], L = [V[0] + st.r * d2[0], V[1] + st.r * d2[1]];
        seg2(V, [V[0] + 11 * d1[0], V[1]], "sd-ln"); seg2(V, [V[0] + 8.5 * d2[0], V[1] + 8.5 * d2[1]], "sd-ln");
        const q = X(V); S("path", { d: `M${q[0] + st.r * U},${q[1]} A${st.r * U},${st.r * U} 0 0 0 ${X(L)[0]},${X(L)[1]}`, class: "sd-dash" }, svg);
        dot(K); dot(L);
        const half = dist(K, L) / 2, ok = st.r2 > half + 1e-9;
        circ(K, st.r2); circ(L, st.r2);
        if (ok) {
          const m = [(K[0] + L[0]) / 2, (K[1] + L[1]) / 2], u = [m[0] - V[0], m[1] - V[1]], ul = Math.hypot(...u), hh = Math.sqrt(st.r2 * st.r2 - half * half);
          const Mp = [m[0] + (u[0] / ul) * hh, m[1] + (u[1] / ul) * hh];
          dot(Mp, "sd-good"); seg2(V, [V[0] + (u[0] / ul) * 10, V[1] + (u[1] / ul) * 10], "sd-gl"); lab(Mp, "M", 14, -6, "sd-t");
        }
        lab(V, "O", -14, 4); lab(K, "K", 4, 20, "sd-t"); lab(L, "L", -14, -4, "sd-t");
        const f1 = foot(P, V, d1), f2 = foot(P, V, d2), a = lineDist(P, V, d1), b = lineDist(P, V, d2);
        seg2(P, f1, "sd-dash"); seg2(P, f2, "sd-dash"); dot(P, "sd-knob", 10); lab(P, "P", 0, -16);
        info = { r: st.r, r2: st.r2, kesisir: ok ? 1 : 0, d1: a, d2: b, fark: Math.abs(a - b), uzak: dist(P, V) };
        el.querySelector(".sd-out").innerHTML = `${ok ? `<span class="sd-ok">K ve L merkezli yaylar M'de kesişti.</span> [OM ışını açıortay.` : `K ve L merkezli yaylar kesişmiyor: yarıçapı büyüt.`}<br>P'nin kollara uzaklığı: <b class="num">${fmt(a, 2)}</b> ve <b class="num">${fmt(b, 2)}</b>${Math.abs(a - b) < 0.1 ? ` <span class="sd-ok">eşit!</span>` : ""}`;
      }
      setV(el, st);
    }
    const snap = mode === "ortadikme" ? 0.5 : 0.1;
    const clampP = (p) => [Math.max(-7.5, Math.min(7.5, Math.round(p[0] / snap) * snap)), Math.max(-4.5, Math.min(5, Math.round(p[1] / snap) * snap))];
    drag(svg, () => true, (ev) => { const q = svgPt(svg, ev); P = clampP([(q.x - O[0]) / U, (O[1] - q.y) / U]); draw(); changed(); });
    svg.addEventListener("keydown", (e) => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (m) { e.preventDefault(); P = clampP([P[0] + m[0] * snap, P[1] + m[1] * snap]); draw(); changed(); } });
    bind(el, st, draw, changed); draw();
    return () => ({ ...info, px: P[0], py: P[1] });
  });

  // ---------- 21. Küp yapı: 3×3 zeminde yükseklikler; önden, sağdan, üstten görünüm ----------
  reg("d-kup-yapi", (el, cfg, changed) => {
    const m = (cfg.h ?? [[0, 0, 0], [0, 1, 0], [1, 2, 1]]).map((r) => [...r]); // satır 0 = arka, satır 2 = ön
    const H = (x, y) => m[2 - y][x]; // y = 0 ön sıra
    const views = () => ({ on: [0, 1, 2].map((x) => Math.max(...[0, 1, 2].map((y) => H(x, y)))), sag: [0, 1, 2].map((y) => Math.max(...[0, 1, 2].map((x) => H(x, y)))), ust: m.map((r) => r.map((v) => (v ? 1 : 0))) });
    const code = (a) => +a.join("");
    function viewSvg(cols, tgt, label) {
      const s = 18, svg = S("svg", { viewBox: `0 0 ${3 * s + 4} ${3 * s + 4}`, width: 74, height: 74, role: "img", "aria-label": `${label}: ${cols.join(", ")}` });
      cols.forEach((h, i) => { for (let z = 0; z < h; z++) S("rect", { x: 2 + i * s, y: 2 + (2 - z) * s, width: s, height: s, class: "sd-vw" }, svg); });
      if (tgt) tgt.forEach((h, i) => { for (let z = 0; z < h; z++) S("rect", { x: 2 + i * s + 2, y: 2 + (2 - z) * s + 2, width: s - 4, height: s - 4, class: "sd-vt" }, svg); });
      S("line", { x1: 0, y1: 3 * s + 2, x2: 3 * s + 4, y2: 3 * s + 2, class: "sd-thin" }, svg);
      return svg.outerHTML;
    }
    function topSvg(g) {
      const s = 18, svg = S("svg", { viewBox: `0 0 ${3 * s + 4} ${3 * s + 4}`, width: 74, height: 74, role: "img", "aria-label": "Üstten görünüm" });
      g.forEach((r, i) => r.forEach((v, j) => S("rect", { x: 2 + j * s, y: 2 + i * s, width: s, height: s, class: v ? "sd-vw" : "sd-cell" }, svg)));
      return svg.outerHTML;
    }
    function draw(focus) {
      const s = 26, ox = 30, oy = 120, iso = (x, y, z) => [ox + (x + y) * s * 0.866, oy + (x - y) * s * 0.5 - z * s];
      const svg = S("svg", { viewBox: "0 0 200 170", class: "sim-svg", role: "img", "aria-label": "Küp yapı", style: "max-width:300px" });
      const poly = (pts, cls) => S("polygon", { points: pts.map((p) => iso(...p).join(",")).join(" "), class: cls }, svg);
      poly([[0, 0, 0], [3, 0, 0], [3, 3, 0], [0, 3, 0]], "sd-cell alt");
      const cubes = [];
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < H(x, y); z++) cubes.push([x, y, z]);
      cubes.sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]) || p[2] - q[2]);
      for (const [x, y, z] of cubes) {
        poly([[x, y, z], [x + 1, y, z], [x + 1, y, z + 1], [x, y, z + 1]], "sd-fr");
        poly([[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]], "sd-rt");
        poly([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], "sd-top");
      }
      const [fx, fy] = iso(1.5, -0.6, 0); S("text", { x: fx - 6, y: fy + 18, class: "sd-ts" }, svg, "ön");
      const [rx, ry] = iso(3.6, 1.5, 0); S("text", { x: rx + 4, y: ry + 10, class: "sd-ts" }, svg, "sağ");
      const v = views(), tg = cfg.hedef || {};
      const n = m.flat().reduce((a, b) => a + b, 0);
      el.innerHTML = `<div class="sd-wrap"><div class="sd-split"><div class="sd-host"></div><div class="sd-wrap"><p class="note">Zemin planı (üstten). Hücreye dokundukça o sütundaki küp sayısı 0 → 1 → 2 → 3 → 0 olur.</p>
        <div class="sd-map" role="group" aria-label="Zemin planı">${m.map((r, i) => r.map((h, j) => `<button type="button" data-c="${i}-${j}" class="${h ? "on" : ""}" aria-label="${["arka", "orta", "ön"][i]} sıra, ${["sol", "orta", "sağ"][j]} sütun: ${h} küp">${h}</button>`).join("")).join("")}</div>
        <p class="sd-ts" style="margin:0;color:var(--muted)">↓ ön</p><p class="sd-big">Küp sayısı: <b class="num">${n}</b></p></div></div>
        <div class="sd-views"><div class="sd-view">${viewSvg(v.on, tg.on, "Önden")}Önden</div><div class="sd-view">${viewSvg(v.sag, tg.sag, "Sağdan")}Sağdan</div><div class="sd-view">${topSvg(v.ust)}Üstten</div>${tg.on || tg.sag ? `<p class="note" style="margin:0">Kesikli kareler: hedef görünüm.</p>` : ""}</div></div>`;
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { const [i, j] = b.dataset.c.split("-").map(Number); m[i][j] = (m[i][j] + 1) % 4; draw(b.dataset.c); changed(); }));
      if (focus) el.querySelector(`[data-c="${focus}"]`)?.focus();
    }
    draw();
    return () => { const v = views(); return { kup: m.flat().reduce((a, b) => a + b, 0), on: code(v.on), sag: code(v.sag), ust: code(v.ust.flat()) }; };
  });

  // ---------- 22. Daireyi dilimle ve diz: alan = π · r² ----------
  reg("d-daire-dizme", (el, cfg, changed) => {
    const st = { n: cfg.n ?? 8 }, r = 66;
    el.innerHTML = `<div class="sd-wrap"><div class="sd-host"></div><div class="plane-wrap"><div class="plane-ctrl">${slider("Dilim sayısı", "n", 4, 40, 2, st.n)}</div><p class="sd-out"></p></div></div>`;
    function sector(svg, ax, ay, dir, phi, cls) {
      // dir = 1: tepe yukarıda, yay aşağıda; dir = −1: tepe aşağıda, yay yukarıda.
      const pts = [];
      for (let i = 0; i <= 10; i++) { const a = -phi + (2 * phi * i) / 10; pts.push([ax + r * Math.sin(a), ay + dir * r * Math.cos(a)]); }
      S("path", { d: `M${ax},${ay} ` + pts.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z", class: cls }, svg);
    }
    function draw() {
      const n = st.n, phi = Math.PI / n, w = 2 * r * Math.sin(phi), cx = 90, cy = 110;
      const svg = S("svg", { viewBox: "0 0 640 220", class: "sim-svg", role: "img", "aria-label": `${n} dilime bölünmüş daire ve dilimlerin dizilişi` });
      for (let i = 0; i < n; i++) {
        const a0 = (2 * Math.PI * i) / n, a1 = (2 * Math.PI * (i + 1)) / n, top = i < n / 2;
        const p0 = [cx + r * Math.cos(a0), cy - r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy - r * Math.sin(a1)];
        S("path", { d: `M${cx},${cy} L${p0[0]},${p0[1]} A${r},${r} 0 0 0 ${p1[0]},${p1[1]} Z`, class: top ? "sd-wedge hl" : "sd-wedge alt hl" }, svg);
      }
      const x0 = 200;
      for (let i = 0; i < n; i++) {
        const k = Math.floor(i / 2);
        if (i % 2 === 0) sector(svg, x0 + k * w + w / 2, 110 - (r * Math.cos(phi)) / 2, 1, phi, "sd-wedge alt hl");
        else sector(svg, x0 + (k + 1) * w, 110 + (r * Math.cos(phi)) / 2, -1, phi, "sd-wedge hl");
      }
      const width = (n / 2) * w;
      S("line", { x1: x0 + w / 2, y1: 110 + r / 2 + 22, x2: x0 + w / 2 + width, y2: 110 + r / 2 + 22, class: "sd-thin" }, svg);
      S("text", { x: x0 + w / 2 + width / 2, y: 110 + r / 2 + 40, class: "sd-ts" }, svg, "taban ≈ çevrenin yarısı = π · r");
      S("text", { x: x0 + width + w + 10, y: 114, class: "sd-ts", "text-anchor": "start" }, svg, "yükseklik ≈ r");
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelector(".sd-out").innerHTML = `${n} dilim üst üste ters dizildi. Dilim sayısı arttıkça şekil bir <b>dikdörtgene</b> (paralelkenara) benziyor.<br>Taban ≈ π · r, yükseklik ≈ r → Alan ≈ π · r · r = <b>π · r²</b>`;
      setV(el, st);
    }
    bind(el, st, draw, changed); draw();
    return () => ({ n: st.n });
  });

  // ---------- 23. Üçgende yardımcı elemanlar: kenarortay, açıortay, yükseklik ----------
  reg("d-ucgen-yardimci", (el, cfg, changed) => {
    const pts = (cfg.points ?? [[1, 1], [9, 1], [4, 5]]).map((p) => [...p]);
    const mode = cfg.mod ?? "kenarortay", NM = ["A", "B", "C"], GW = 10, GH = 6, U = 48, PD = 26;
    let v = cfg.kose ?? 0, all = !!cfg.hepsi;
    const X = (p) => [PD + p[0] * U, PD + (GH - p[1]) * U];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], dot2 = (a, b) => a[0] * b[0] + a[1] * b[1], len = (a) => Math.hypot(a[0], a[1]);
    const angAt = (i) => { const p = pts[i], a = sub(pts[(i + 1) % 3], p), b = sub(pts[(i + 2) % 3], p); return (Math.acos(Math.max(-1, Math.min(1, dot2(a, b) / (len(a) * len(b))))) * 180) / Math.PI; };
    const area2 = () => Math.abs((pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[2][0] - pts[0][0]) * (pts[1][1] - pts[0][1]));
    const MODE_NAME = { kenarortay: "Kenarortay", aciortay: "Açıortay", yukseklik: "Yükseklik" }[mode];
    const calc = (i) => {
      const V = pts[i], P1 = pts[(i + 1) % 3], P2 = pts[(i + 2) % 3], s = sub(P2, P1), sl = len(s);
      if (mode === "kenarortay") { const M = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2]; return { F: M, P1, P2, V, perp: Math.abs(dot2(sub(M, V), s)) / (len(sub(M, V)) * sl) < 1e-6 }; }
      if (mode === "aciortay") { const a = len(sub(P1, V)), b = len(sub(P2, V)); return { F: [(b * P1[0] + a * P2[0]) / (a + b), (b * P1[1] + a * P2[1]) / (a + b)], P1, P2, V }; }
      const t = dot2(sub(V, P1), s) / (sl * sl); return { F: [P1[0] + t * s[0], P1[1] + t * s[1]], P1, P2, V, t, h: Math.abs((s[0] * (V[1] - P1[1]) - s[1] * (V[0] - P1[0])) / sl), base: sl };
    };
    el.innerHTML = `<div class="sd-wrap"><div class="sd-row">${seg("Köşe seç", NM.map((n, i) => [i, `${n} köşesinden`]), v, "v")}<label class="sd-row" style="font-size:14px"><input type="checkbox" class="sd-all" ${all ? "checked" : ""}> Üçünü birden çiz</label></div>
      <div class="plane-wrap"><div class="sd-host"></div><div class="plane-ctrl"><p class="eq"></p><p class="sd-out"></p><p class="note">Köşeleri sürükle ya da köşeye Tab ile gelip ok tuşlarıyla taşı.</p></div></div></div>`;
    const svg = S("svg", { viewBox: `0 0 ${2 * PD + GW * U} ${2 * PD + GH * U}`, class: "sim-svg drag", role: "group", "aria-label": "Üçgen" });
    el.querySelector(".sd-host").replaceChildren(svg);
    const line = (p, q, cls) => { const a = X(p), b = X(q); S("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: cls }, svg); };
    let dragI = -1;
    function draw(focusI) {
      svg.replaceChildren();
      for (let x = 0; x <= GW; x++) for (let y = 0; y <= GH; y++) { const q = X([x, y]); S("circle", { cx: q[0], cy: q[1], r: 2.5, class: "gb-peg" }, svg); }
      S("polygon", { points: pts.map((p) => X(p).join(",")).join(" "), class: "sd-fill" }, svg);
      const G = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
      const which = all ? [0, 1, 2] : [v];
      for (const i of which) {
        const c = calc(i), cls = i === v ? "sd-hl" : "sd-gl";
        if (mode === "yukseklik" && (c.t < 0 || c.t > 1)) line(c.t < 0 ? c.P1 : c.P2, c.F, "sd-dash");
        line(c.V, c.F, cls);
        const f = X(c.F); S("circle", { cx: f[0], cy: f[1], r: 5, class: "ao-v" }, svg);
        if (mode === "yukseklik") { const s = sub(c.P2, c.P1), sl = len(s), u = [s[0] / sl, s[1] / sl], w = sub(c.V, c.F), wl = len(w) || 1, n2 = [w[0] / wl, w[1] / wl], k = 0.28; const a = X([c.F[0] + u[0] * k, c.F[1] + u[1] * k]), b = X([c.F[0] + u[0] * k + n2[0] * k, c.F[1] + u[1] * k + n2[1] * k]), d = X([c.F[0] + n2[0] * k, c.F[1] + n2[1] * k]); S("path", { d: `M${a[0]},${a[1]} L${b[0]},${b[1]} L${d[0]},${d[1]}`, class: "sd-thin" }, svg); }
        if (mode === "kenarortay") [c.P1, c.P2].forEach((p) => { const m = [(p[0] + c.F[0]) / 2, (p[1] + c.F[1]) / 2], s = sub(c.F, p), sl = len(s) || 1, nn = [-s[1] / sl * 0.15, s[0] / sl * 0.15]; line([m[0] - nn[0], m[1] - nn[1]], [m[0] + nn[0], m[1] + nn[1]], "sd-ln"); });
        if (mode === "aciortay" && i === v) { const A0 = Math.atan2(c.P1[1] - c.V[1], c.P1[0] - c.V[0]), A1 = Math.atan2(c.F[1] - c.V[1], c.F[0] - c.V[0]), A2 = Math.atan2(c.P2[1] - c.V[1], c.P2[0] - c.V[0]); [[A0, A1], [A1, A2]].forEach(([s0, s1], j) => { let d = s1 - s0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; const rr = j ? 0.75 : 0.6, a = X([c.V[0] + rr * Math.cos(s0), c.V[1] + rr * Math.sin(s0)]), b = X([c.V[0] + rr * Math.cos(s0 + d), c.V[1] + rr * Math.sin(s0 + d)]); S("path", { d: `M${a[0]},${a[1]} A${rr * U},${rr * U} 0 0 ${d > 0 ? 0 : 1} ${b[0]},${b[1]}`, class: "sd-hl", "stroke-width": 2.5 }, svg); }); }
      }
      if (all && mode === "kenarortay") { const g = X(G); S("circle", { cx: g[0], cy: g[1], r: 6, class: "sd-good" }, svg); S("text", { x: g[0] + 10, y: g[1] - 8, class: "sd-t" }, svg, "G"); }
      pts.forEach((p, i) => { const q = X(p), d = sub(p, G), dl = len(d) || 1; S("text", { x: q[0] + (d[0] / dl) * 22, y: q[1] - (d[1] / dl) * 22 + 6, class: "sd-tl" }, svg, NM[i]); });
      pts.forEach((p, i) => { const q = X(p); const k = S("circle", { cx: q[0], cy: q[1], r: 12, class: "sd-knob", "data-i": i, tabindex: 0, role: "button", "aria-label": `${NM[i]} köşesi (${p[0]}, ${p[1]}); ok tuşlarıyla taşı` }, svg); k.addEventListener("keydown", (e) => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (m) { e.preventDefault(); move(i, [p[0] + m[0], p[1] + m[1]]); } }); });
      const an = [0, 1, 2].map(angAt), mx = Math.max(...an), tip = Math.abs(mx - 90) < 1e-6 ? "dik" : mx > 90 ? "geniş" : "dar";
      const c = calc(v), Vn = NM[v], P1n = NM[(v + 1) % 3], P2n = NM[(v + 2) % 3];
      el.querySelector(".eq").textContent = `${MODE_NAME}: ${Vn} köşesinden`;
      let out = `Açılar: ${NM.map((n, i) => `${n} ≈ ${Math.round(an[i])}°`).join(", ")} (${tip} açılı üçgen)<br>`;
      if (mode === "kenarortay") out += `[${Vn}D] kenarortayı [${P1n}${P2n}] kenarını iki eş parçaya böler: ${fmt(len(sub(c.F, c.P1)), 2)} = ${fmt(len(sub(c.P2, c.F)), 2)}${c.perp ? `<br><span class="sd-ok">Bu kenarortay aynı zamanda yükseklik!</span> (|${Vn}${P1n}| = |${Vn}${P2n}|)` : ""}${all ? `<br>Üç kenarortay G noktasında kesişir (ağırlık merkezi).` : ""}`;
      else if (mode === "aciortay") out += `Açıortay ${Vn} açısını iki eş açıya böler: ${fmt(an[v] / 2, 1)}° + ${fmt(an[v] / 2, 1)}°${all ? `<br>Üç açıortay tek bir noktada kesişir.` : ""}`;
      else out += `${Vn}'dan [${P1n}${P2n}] kenarına (ya da uzantısına) dik iner. h ≈ <b class="num">${fmt(c.h, 2)}</b>${c.t < -1e-9 || c.t > 1 + 1e-9 ? `<br><span class="sd-no">Dikme ayağı kenarın dışında</span> (kesikli uzantı): ${NM[c.t < 0 ? (v + 1) % 3 : (v + 2) % 3]} açısı geniş.` : ""}<br>Alan = taban × yükseklik ÷ 2 = ${fmt(c.base, 2)} × ${fmt(c.h, 2)} ÷ 2 = <b class="num">${fmt(area2() / 2, 2)}</b>`;
      el.querySelector(".sd-out").innerHTML = out;
      if (focusI !== undefined) svg.querySelector(`[data-i="${focusI}"]`)?.focus();
    }
    function move(i, q) {
      q = [Math.max(0, Math.min(GW, q[0])), Math.max(0, Math.min(GH, q[1]))];
      const old = pts[i]; if (q[0] === old[0] && q[1] === old[1]) return;
      pts[i] = q; if (area2() === 0) { pts[i] = old; return; }
      draw(i); changed();
    }
    drag(svg, (ev) => { const k = ev.target.dataset?.i; if (k === undefined) return false; dragI = +k; }, (ev) => { if (dragI < 0) return; const p = svgPt(svg, ev); move(dragI, [Math.round((p.x - PD) / U), Math.round(GH - (p.y - PD) / U)]); });
    svg.addEventListener("pointerup", () => { dragI = -1; });
    el.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { v = +b.dataset.v; el.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    el.querySelector(".sd-all").addEventListener("change", (e) => { all = e.target.checked; draw(); changed(); });
    draw();
    return () => {
      const an = [0, 1, 2].map(angAt), mx = Math.max(...an), c = calc(v);
      const st = { aA: Math.round(an[0]), aB: Math.round(an[1]), aC: Math.round(an[2]), tip: Math.abs(mx - 90) < 1e-6 ? 1 : mx > 90 ? 2 : 0, kose: v, hepsi: all ? 1 : 0, alan: area2() / 2 };
      if (mode === "kenarortay") st.medDik = c.perp ? 1 : 0;
      if (mode === "yukseklik") { st.ic = c.t >= -1e-9 && c.t <= 1 + 1e-9 ? 1 : 0; st.h = c.h; }
      return st;
    };
  });

  // ---------- 24. Histogram: sürekli veriyi gruplara ayır ----------
  reg("d-histogram", (el, cfg, changed) => {
    const data = cfg.veri ?? [], s0 = cfg.baslangic ?? Math.min(...data), opts = cfg.genislikler ?? [2, 5, 10], unit = cfg.birim ?? "";
    let w = cfg.genislik ?? opts[1] ?? opts[0];
    el.innerHTML = `<div class="sd-wrap"><div class="sd-row"><span class="note">Grup genişliği:</span>${seg("Grup genişliği", opts.map((o) => [o, `${o}${unit ? " " + unit : ""}`]), w, "w")}</div><div class="sd-split"><div class="sd-host"></div><div class="sd-tab"></div></div><p class="sd-out"></p></div>`;
    const groups = () => { const mx = Math.max(...data), g = []; for (let lo = s0; lo <= mx; lo += w) g.push([lo, lo + w - 1, data.filter((v) => v >= lo && v < lo + w).length]); return g; };
    function draw() {
      const g = groups(), mf = Math.max(...g.map((x) => x[2]), 1), W = 400, Hh = 200, L = 34, B = 30, bw = (W - L - 10) / g.length;
      const top = Math.ceil((mf + 1) / 2) * 2;
      const svg = S("svg", { viewBox: `0 0 ${W} ${Hh + B + 30}`, class: "sim-svg", role: "img", "aria-label": `Histogram, ${g.length} grup` });
      const Y = (f) => 10 + Hh - (f / top) * Hh;
      for (let f = 0; f <= top; f += Math.max(1, Math.round(top / 5))) { S("line", { x1: L, x2: W, y1: Y(f), y2: Y(f), class: "dc-grid" }, svg); S("text", { x: L - 6, y: Y(f) + 4, class: "dc-ax" }, svg, f); }
      g.forEach(([lo, , f], i) => {
        S("rect", { x: L + i * bw, y: Y(f), width: bw, height: Y(0) - Y(f), class: "dc-bar", stroke: "var(--surface)", "stroke-width": 1.5 }, svg);
        if (f) S("text", { x: L + i * bw + bw / 2, y: Y(f) - 5, class: "sd-ts", style: "fill:var(--ink)" }, svg, f);
        if (g.length <= 12 || i % 2 === 0) S("text", { x: L + i * bw, y: Y(0) + 16, class: "sd-ts" }, svg, lo);
      });
      S("text", { x: L + g.length * bw, y: Y(0) + 16, class: "sd-ts" }, svg, s0 + g.length * w);
      S("text", { x: L + (W - L) / 2, y: Y(0) + 34, class: "sd-ts" }, svg, cfg.eksen ?? "");
      el.querySelector(".sd-host").replaceChildren(svg);
      el.querySelector(".sd-tab").innerHTML = `<div class="table-wrap"><table class="sd-tbl"><thead><tr><th>Grup</th><th>Sıklık</th></tr></thead><tbody>${g.map(([lo, hi, f]) => `<tr><td>${lo}–${hi}</td><td>${f}</td></tr>`).join("")}</tbody></table></div>`;
      el.querySelector(".sd-out").innerHTML = `${data.length} veri, <b>${g.length}</b> grup. En kalabalık grup: ${g.filter((x) => x[2] === mf).map((x) => `${x[0]}–${x[1]}`).join(", ")} (${mf} veri). Sütunlar arasında boşluk yok: veri sürekli bir aralığa yayılıyor.`;
    }
    el.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => { w = +b.dataset.w; el.querySelectorAll("[data-w]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); changed(); }));
    draw();
    return () => { const g = groups(); return { w, k: g.length, maxf: Math.max(...g.map((x) => x[2])) }; };
  });
})();
