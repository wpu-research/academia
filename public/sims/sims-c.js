// Konu anlatımı simülasyonları (grup c: 4. ve 5. sınıf). LESSONS.registerSim ile kaydolur; lessons.js değişmez.
(() => {
  if (!window.LESSONS) return;
  const reg = window.LESSONS.registerSim;
  const NS = "http://www.w3.org/2000/svg";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const svgEl = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.appendChild(e); return e; };
  const txt = (parent, attrs, s) => { const t = svgEl("text", attrs, parent); t.textContent = s; return t; };
  const svgPoint = (svg, ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  // Bölükleri boşlukla ayırır: 1234567 -> "1 234 567" (bölünmez boşluk).
  const grp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const slider = (label, key, min, max, step, value) => `<label class="sim-slider"><span>${label}: <b data-v="${key}">${value}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-k="${key}"></label>`;

  if (!document.getElementById("sc-style")) {
    const st = document.createElement("style");
    st.id = "sc-style";
    st.textContent = `
.sc-btn { min-height: 40px; min-width: 40px; padding: 0 12px; border-radius: 6px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: 500 14px var(--font); cursor: pointer; }
.sc-btn:hover:not(:disabled) { border-color: var(--brand); color: var(--brand); }
.sc-btn:disabled { opacity: .45; cursor: default; }
.sc-btn.pri { background: var(--brand); border-color: var(--brand); color: var(--on-brand); }
.sc-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.sc-out { margin: 0; font-size: 15px; color: var(--ink); }
.sc-out b { color: var(--brand); }
.sc-big { margin: 0; font: 700 26px var(--font); color: var(--ink); letter-spacing: .02em; }
.sc-msg { margin: 0; padding: 10px 12px; border-radius: 8px; background: var(--bg-soft); font-size: 15px; color: var(--ink); }
.sc-msg.ok { background: var(--good-soft); }
.sc-msg.no { background: var(--bad-soft); }
.sc-pv { display: grid; gap: 4px; overflow-x: auto; padding-bottom: 4px; }
.sc-pv-g { display: flex; flex-wrap: wrap; gap: 6px; }
.sc-pv-b { display: grid; gap: 2px; border: 1px solid var(--line); border-radius: 8px; padding: 4px; background: var(--bg-soft); }
.sc-pv-b > span { text-align: center; font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.sc-pv-cols { display: flex; gap: 2px; }
.sc-pv-c { display: grid; justify-items: center; gap: 2px; width: 34px; }
.sc-pv-c small { font-size: 11px; color: var(--muted); }
.sc-pv-c b { font: 700 24px var(--font); color: var(--ink); }
.sc-pv-c b.z { color: var(--muted); opacity: .5; }
.sc-pv-c b.hl { color: var(--brand); }
.sc-pv-c button { width: 32px; height: 28px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); color: var(--ink); cursor: pointer; font-size: 12px; padding: 0; }
.sc-pv-c button:hover { border-color: var(--brand); color: var(--brand); }
.sc-grid { display: grid; width: max-content; font: 600 22px/1.5 ui-monospace, Menlo, Consolas, monospace; color: var(--ink); }
.sc-grid span { width: 1.15em; text-align: center; height: 1.5em; }
.sc-grid .sm { font-size: 14px; color: var(--brand); align-self: end; }
.sc-grid .x { text-decoration: line-through; color: var(--muted); }
.sc-grid .hl { background: var(--brand-soft); border-radius: 4px; }
.sc-grid .res { color: var(--brand); }
.sc-grid .ul { border-bottom: 2px solid var(--ink); }
.sc-grid .bl { border-left: 2px solid var(--ink); padding-left: 4px; margin-left: 6px; }
.sc-scroll { overflow-x: auto; max-width: 100%; }
.sc-dot { fill: var(--brand); }
.sc-dot.sel { fill: var(--good); }
.sc-dot.left { fill: var(--warn); }
.sc-box { fill: var(--bg-soft); stroke: var(--line); stroke-width: 2; }
.sc-box.sel { fill: var(--good-soft); stroke: var(--good); }
.sc-box.tap { cursor: pointer; }
.sc-box:focus-visible { outline: none; stroke: var(--ink); stroke-width: 3; }
.sc-lab { font: 600 14px var(--font); fill: var(--ink); text-anchor: middle; }
.sc-lab.m { fill: var(--muted); font-weight: 500; }
.sc-lab.big { font-size: 18px; font-weight: 700; }
.sc-lab.st { text-anchor: start; }
.sc-tri { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 3; stroke-linejoin: round; }
.sc-circ { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 6 5; }
.sc-pt { fill: var(--ink); }
.sc-cell { fill: var(--surface); stroke: var(--line); stroke-width: 1.5; }
.sc-cell.on { fill: var(--brand); stroke: var(--brand-strong); }
.sc-cell.given { fill: var(--deep-2); stroke: var(--deep-2); }
.sc-cell.tap { cursor: pointer; }
.sc-cell.tap:hover { fill: var(--brand-soft); }
.sc-cell.tap.on:hover { fill: var(--brand-strong); }
.sc-cell.bad { fill: var(--bad); stroke: var(--bad); }
.sc-cell:focus-visible { outline: none; stroke: var(--ink); stroke-width: 3; }
.sc-axis { stroke: var(--good); stroke-width: 4; stroke-dasharray: 10 6; }
.sc-edge { stroke: var(--brand); stroke-width: 4; fill: none; stroke-linecap: round; }
.sc-beam { stroke: var(--ink); stroke-width: 6; stroke-linecap: round; }
.sc-stand { fill: var(--muted); }
.sc-pan { fill: var(--ink); }
.sc-obj { fill: var(--good); }
.sc-objt { font: 700 14px var(--font); fill: var(--surface); text-anchor: middle; }
.sc-wt { fill: var(--warn); stroke: var(--surface); stroke-width: 1; }
.sc-wtt { font: 700 11px var(--font); fill: var(--surface); text-anchor: middle; }
.sc-jug { fill: none; stroke: var(--ink); stroke-width: 3; }
.sc-jugbg { fill: var(--surface); }
.sc-liq { fill: var(--brand); opacity: .55; }
.sc-tick { stroke: var(--muted); stroke-width: 1.5; }
.sc-target { stroke: var(--good); stroke-width: 3; stroke-dasharray: 8 5; }
.sc-bar { fill: var(--brand); }
.sc-bar.ok { fill: var(--good); }
.sc-gridl { stroke: var(--line); }
.sc-tok { display: inline-flex; align-items: center; justify-content: center; min-width: 30px; min-height: 44px; padding: 0 6px; font: 700 24px var(--font); color: var(--ink); }
.sc-tok.op { border: 2px solid var(--brand); border-radius: 8px; background: var(--brand-soft); color: var(--brand-strong); cursor: pointer; min-width: 44px; }
.sc-tok.op:hover { background: var(--brand); color: var(--on-brand); }
.sc-tok.par { color: var(--muted); }
.sc-expr { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.sc-hist { margin: 0; padding-left: 20px; font-size: 15px; color: var(--muted); }
.sc-hist li b { color: var(--ink); }
.sc-line { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; }
.sc-line.mv { stroke: var(--brand); }
.sc-arc1 { fill: var(--brand-soft); stroke: var(--brand); stroke-width: 1.5; }
.sc-arc2 { fill: var(--good-soft); stroke: var(--good); stroke-width: 1.5; }
.sc-ball.r { fill: var(--bad); }
.sc-ball.g { fill: var(--good); }
.sc-bag { fill: var(--bg-soft); stroke: var(--muted); stroke-width: 3; }
.sc-scale { stroke: var(--ink); stroke-width: 4; stroke-linecap: round; }
.sc-mark { fill: var(--brand); stroke: var(--surface); stroke-width: 3; }
.sc-tray { display: flex; flex-wrap: wrap; gap: 6px; min-height: 30px; align-items: center; }
.sc-chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 4px 2px 10px; border-radius: 999px; background: var(--warn-soft); border: 1px solid var(--warn); font-size: 13px; color: var(--ink); }
.sc-chip button { width: 26px; height: 26px; border-radius: 50%; border: 0; background: transparent; color: var(--ink); cursor: pointer; font-size: 16px; }
.sc-bars { display: grid; gap: 6px 14px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
.sc-bars > div { display: flex; align-items: center; gap: 6px; font-size: 14px; }
.sc-bars > div span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sc-bars > div b { min-width: 22px; text-align: center; }
`;
    document.head.appendChild(st);
  }

  // ---------- Türkçe sayı okunuşu ----------
  const BIR = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
  const ON = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
  const uc = (x) => { const y = Math.floor(x / 100), o = Math.floor(x / 10) % 10, b = x % 10; return [y ? (y === 1 ? "yüz" : BIR[y] + " yüz") : "", ON[o], BIR[b]].filter(Boolean).join(" "); };
  function oku(v) {
    if (!v) return "sıfır";
    const G = ["", "bin", "milyon", "milyar", "trilyon"], parts = [];
    let i = 0;
    while (v > 0) { const g = v % 1000; if (g) parts.unshift(i === 1 && g === 1 ? "bin" : uc(g) + (G[i] ? " " + G[i] : "")); v = Math.floor(v / 1000); i++; }
    return parts.join(" ");
  }
  // Sayıya Türkçe ek: ek(3, "den") -> "3'ten", ek(6, "i") -> "6'yı", ek(12, "in") -> "12'nin", ek(5, "e") -> "5'e".
  function ek(n, tur) {
    const w = oku(Math.abs(Math.round(n))), vs = w.match(/[aeıioöuü]/g), v = vs ? vs[vs.length - 1] : "e", endV = /[aeıioöuü]$/.test(w);
    const back = /[aıou]/.test(v), four = { a: "ı", ı: "ı", e: "i", i: "i", o: "u", u: "u", ö: "ü", ü: "ü" }[v];
    let e;
    if (tur === "den") e = (/[fstkçşhp]$/.test(w) ? "t" : "d") + (back ? "an" : "en");
    else if (tur === "i") e = (endV ? "y" : "") + four;
    else if (tur === "in") e = (endV ? "n" : "") + four + "n";
    else e = (endV ? "y" : "") + (back ? "a" : "e");
    return `${grp(n)}'${e}`;
  }

  // ---------- c-basamak: bölük ve basamak tablosu ----------
  // cfg: { basamak: 6, value: 0, gizle: ["okunus"|"cozumleme"], vurgu: basamak indeksi (0 = birler) }
  reg("c-basamak", (el, cfg, changed) => {
    const n = clamp(cfg.basamak ?? 6, 1, 12);
    const d = Array.from({ length: n }, (_, i) => Math.floor((cfg.value ?? 0) / 10 ** i) % 10);
    const gizle = new Set(cfg.gizle || []);
    const BOL = ["Birler", "Binler", "Milyonlar", "Milyarlar"], PL = ["birler", "onlar", "yüzler"], AB = ["B", "O", "Y"];
    const value = () => d.reduce((s, x, i) => s + x * 10 ** i, 0);
    function draw(focusKey) {
      const v = value(), top = d.findLastIndex((x) => x > 0);
      const groups = [];
      for (let g = Math.ceil(n / 3) - 1; g >= 0; g--) {
        const cols = [];
        for (let k = 2; k >= 0; k--) {
          const i = g * 3 + k; if (i >= n) continue;
          const name = `${BOL[g]} bölüğü ${PL[k]} basamağı`;
          cols.push(`<div class="sc-pv-c"><button type="button" data-u="${i}" aria-label="${name}: artır">▲</button><b class="${i > top && i > 0 ? "z" : ""}${cfg.vurgu === i ? " hl" : ""}" aria-label="${name}: ${d[i]}">${d[i]}</b><button type="button" data-dn="${i}" aria-label="${name}: azalt">▼</button><small>${AB[k]}</small></div>`);
        }
        groups.push(`<div class="sc-pv-b"><span>${BOL[g]}</span><div class="sc-pv-cols">${cols.join("")}</div></div>`);
      }
      const coz = d.map((x, i) => [x, i]).filter(([x]) => x).reverse().map(([x, i]) => grp(x * 10 ** i)).join(" + ") || "0";
      el.innerHTML = `<div class="sc-pv"><div class="sc-pv-g">${groups.join("")}</div></div>
        <p class="sc-big num">${grp(v)}</p>
        ${gizle.has("okunus") ? "" : `<p class="sc-out">Okunuşu: <b>${esc(oku(v))}</b></p>`}
        ${gizle.has("cozumleme") ? "" : `<p class="sc-out">Çözümleme: ${coz}</p>`}
        <p class="note muted" style="margin:0;font-size:13px">Y: yüzler, O: onlar, B: birler basamağı. ▲ ve ▼ ile rakamı değiştir.</p>`;
      el.querySelectorAll("[data-u],[data-dn]").forEach((b) => b.addEventListener("click", () => {
        const up = b.dataset.u !== undefined, i = +(up ? b.dataset.u : b.dataset.dn);
        d[i] = (d[i] + (up ? 1 : 9)) % 10; draw(up ? `[data-u="${i}"]` : `[data-dn="${i}"]`); changed();
      }));
      if (focusKey) el.querySelector(focusKey)?.focus();
    }
    draw();
    return () => Object.assign({ value: value(), basamakSayisi: String(value()).length }, Object.fromEntries(d.map((x, i) => [`d${i}`, x])));
  });

  // ---------- c-alt-alta: adım adım toplama, çıkarma, çarpma, bölme ----------
  // cfg: { op: "+" | "-" | "×" | "÷", a, b }
  reg("c-alt-alta", (el, cfg, changed) => {
    const op = cfg.op || "+", A = cfg.a, B = cfg.b;
    const steps = []; // her adım: { rows: [[{t,c}]], cols, msg }
    const cell = (t, c = "") => ({ t: String(t), c });
    const PL = ["birler", "onlar", "yüzler", "binler", "on binler", "yüz binler"];
    const plName = (i) => PL[i] || `${i + 1}. basamak`;
    if (op === "+" || op === "-") {
      const da = [...String(A)].reverse().map(Number), db = [...String(B)].reverse().map(Number);
      const W = Math.max(da.length, db.length) + 1, C = W + 1; // 1 sütun işaret
      const top = [...da], res = [], small = {}, crossed = new Set();
      const snap = (hl, msg) => {
        const col = (i) => C - 1 - i; // basamak i'nin ızgara sütunu
        const r0 = Array.from({ length: C }, () => cell("", "sm")), r1 = Array.from({ length: C }, () => cell("")), r2 = Array.from({ length: C }, () => cell("", "ul")), r3 = Array.from({ length: C }, () => cell("", "res"));
        for (const [i, v] of Object.entries(small)) r0[col(+i)] = cell(v, "sm");
        da.forEach((x, i) => { r1[col(i)] = cell(x, crossed.has(i) ? "x" : ""); });
        db.forEach((x, i) => { r2[col(i)] = cell(x, "ul"); });
        r2[0] = cell(op === "+" ? "+" : "−", "ul");
        res.forEach((x, i) => { r3[col(i)] = cell(x, "res"); });
        if (hl !== null) [r1, r2, r3].forEach((r) => { r[col(hl)].c += " hl"; });
        steps.push({ rows: [r0, r1, r2, r3], cols: C, msg });
      };
      snap(null, op === "+" ? "Sayıları basamaklarını alt alta getirerek yazdık. Toplamaya birler basamağından başlarız." : "Büyük sayı üstte, basamaklar alt alta. Çıkarmaya birler basamağından başlarız.");
      if (op === "+") {
        let carry = 0;
        const n = Math.max(da.length, db.length);
        for (let i = 0; i < n; i++) {
          const x = da[i] ?? 0, y = db[i] ?? 0, s = x + y + carry;
          const parts = `${x} + ${y}${carry ? ` + ${carry} (elde)` : ""} = ${s}`;
          res[i] = s % 10; const nc = Math.floor(s / 10);
          let msg = `${plName(i)[0].toUpperCase() + plName(i).slice(1)}: ${parts}. `;
          if (nc && i === n - 1) { res[i + 1] = nc; msg += `${ek(s % 10, "i")} yazarız; ${ek(nc, "i")} en sola yazarız.`; }
          else if (nc) { small[i + 1] = nc; msg += `${ek(s % 10, "i")} yazarız, ${ek(nc, "i")} ${plName(i + 1)} basamağına elde olarak aktarırız.`; }
          else msg += `${ek(s, "i")} yazarız.`;
          carry = nc; snap(i, msg);
        }
        steps[steps.length - 1].msg += ` Toplam: ${grp(A + B)}.`;
      } else {
        for (let i = 0; i < da.length; i++) {
          const y = db[i] ?? 0;
          let msg = `${plName(i)[0].toUpperCase() + plName(i).slice(1)}: `;
          if (top[i] < y) {
            let j = i + 1; while (top[j] === 0) j++;
            msg += `${ek(top[i], "den")} ${y} çıkmaz. `;
            const cap = (w) => w[0].toUpperCase() + w.slice(1);
            msg += j === i + 1 ? `${cap(plName(j))} basamağından 1 bozarız: ${plName(j)} ${top[j]} → ${top[j] - 1}, ${plName(i)} ${top[i]} → ${top[i] + 10}. ` : `${cap(plName(i + 1))} basamağında 0 var; ${plName(j)} basamağından 1 bozarız, aradaki 0'lar 9 olur. `;
            top[j]--; crossed.add(j); small[j] = top[j];
            for (let k = j - 1; k > i; k--) { top[k] = 9; crossed.add(k); small[k] = 9; }
            top[i] += 10; crossed.add(i); small[i] = top[i];
          }
          res[i] = top[i] - y;
          msg += `${top[i]} − ${y} = ${res[i]}.`;
          snap(i, msg);
        }
        steps[steps.length - 1].msg += ` Fark: ${grp(A - B)}.`;
        // baştaki gereksiz sıfırları gösterme
        const last = steps[steps.length - 1].rows[3];
        for (let k = 1; k < last.length - 1; k++) { if (last[k].t === "") continue; if (last[k].t !== "0") break; last[k] = cell("", last[k].c); }
      }
    } else if (op === "×") {
      const sa = String(A), sb = String(B), b0 = B % 10, b1 = Math.floor(B / 10) % 10;
      const P1 = A * b0, P2 = A * b1, R = A * B;
      const C = Math.max(String(R).length, sa.length, sb.length) + 1;
      const right = (s, cls = "", shift = 0) => { const r = Array.from({ length: C }, () => cell("", cls)); [...s].forEach((ch, k) => { r[C - shift - s.length + k] = cell(ch, cls); }); return r; };
      const r1 = right(sa), r2 = right(sb, "ul"); r2[0] = cell("×", "ul");
      steps.push({ rows: [r1, r2], cols: C, msg: `${grp(A)} sayısını ${B} ile çarpacağız. Önce çarpanın birler basamağındaki ${b0} ile çarparız.` });
      const p1 = right(String(P1), "res");
      steps.push({ rows: [r1, r2, p1], cols: C, msg: `${grp(A)} × ${b0} = ${grp(P1)}. Bunu birler basamağından başlayarak yazarız.` });
      if (b1) {
        const p2 = right(String(P2), "res ul", 1); p2[0] = cell("+", "ul"); p2[C - 1] = cell("0", "ul sm");
        steps.push({ rows: [r1, r2, p1, p2], cols: C, msg: `${grp(A)} × ${b1} = ${grp(P2)}. Bu ${b1} aslında ${b1 * 10} olduğu için sonucu bir basamak sola kaydırarak yazarız (birler yerine 0 gelir): ${grp(P2 * 10)}.` });
        steps.push({ rows: [r1, r2, p1, p2, right(String(R), "res")], cols: C, msg: `İki satırı toplarız: ${grp(P1)} + ${grp(P2 * 10)} = ${grp(R)}.` });
      } else steps[steps.length - 1].msg += ` Çarpım: ${grp(R)}.`;
    } else {
      // Uzun bölme: sütun 0 eksi işareti, 1..n bölünenin basamakları, L'den sonrası bölen ve bölüm.
      const sa = String(A), n = sa.length, Q = Math.floor(A / B), Rm = A % B, sq = String(Q);
      const L = n + 1, C = L + Math.max(String(B).length, sq.length) + 1;
      const blank = () => Array.from({ length: C }, () => cell(""));
      const put = (r, s2, endCol, cls = "") => { [...s2].forEach((ch, k) => { r[endCol - s2.length + 1 + k] = cell(ch, cls); }); };
      const r0 = blank(); put(r0, sa, n);
      for (let k = L; k < C; k++) r0[k] = cell(String(B)[k - L] ?? "", (k === L ? "bl " : "") + "ul");
      const r1 = blank(); r1[L] = cell("", "bl");
      const rows = [r0, r1];
      let p = 0, part = 0, q = "", usedR1 = false;
      while (part * 10 + +sa[p] < B && p < n - 1) { part = part * 10 + +sa[p]; p++; }
      part = part * 10 + +sa[p];
      const snapQ = (msg) => { const rr = rows.map((r) => r.map((c) => ({ ...c }))); [...q].forEach((ch, k) => { rr[1][L + k] = cell(ch, (k === 0 ? "bl " : "") + "res"); }); steps.push({ rows: rr, cols: C, msg }); };
      snapQ(`${grp(A)} ÷ ${B}. Soldan başlarız: bölünenin ${B} sayısından küçük olmayan ilk parçası ${part}.`);
      let first = true;
      const newRow = () => { if (!usedR1) { usedR1 = true; return rows[1]; } const r = blank(); rows.push(r); return r; };
      while (true) {
        const qd = Math.floor(part / B), prod = qd * B, rem = part - prod;
        q += qd;
        let msg;
        if (qd === 0 && !first) {
          msg = `${part} içinde ${B} yok. Bölüme 0 yazarız.`;
        } else {
          const pr = newRow(); put(pr, String(prod), p + 1, "ul"); pr[p + 1 - String(prod).length] = cell("−");
          msg = `${part} içinde ${B}, ${qd} kez var. Bölüme ${qd} yazarız. ${qd} × ${B} = ${prod}; ${part} − ${prod} = ${rem}.`;
        }
        first = false;
        if (p + 1 < n) {
          part = rem * 10 + +sa[p + 1]; p++;
          if (qd === 0 && rows.length > 2) rows[rows.length - 1] = blank();
          const rr = qd === 0 && rows.length > 2 ? rows[rows.length - 1] : (() => { const r = blank(); rows.push(r); return r; })();
          put(rr, String(part), p + 1);
          msg += ` Sonraki basamağı (${sa[p]}) yanına indiririz: ${part}.`;
          snapQ(msg);
        } else {
          if (!(qd === 0 && rows.length > 2)) { const rr = blank(); rows.push(rr); put(rr, String(rem), p + 1, "res"); }
          else { const rr = rows[rows.length - 1]; rows[rows.length - 1] = blank(); put(rows[rows.length - 1], String(rem), p + 1, "res"); void rr; }
          msg += ` İndirilecek basamak kalmadı. Bölüm ${grp(Q)}, kalan ${Rm}. Sağlama: ${B} × ${grp(Q)} + ${Rm} = ${grp(A)}.`;
          snapQ(msg); break;
        }
      }
    }
    let i = 0;
    function draw() {
      const s = steps[i];
      el.innerHTML = `<div class="sc-scroll"><div class="sc-grid" style="grid-template-columns:repeat(${s.cols},1.15em)" role="img" aria-label="Alt alta işlem">${s.rows.map((r) => r.map((c) => `<span class="${c.c}">${esc(c.t)}</span>`).join("")).join("")}</div></div>
        <p class="sc-msg${i === steps.length - 1 ? " ok" : ""}" aria-live="polite">${esc(s.msg)}</p>
        <div class="sc-row"><button type="button" class="sc-btn" data-s="-1" ${i ? "" : "disabled"}>Önceki</button><button type="button" class="sc-btn pri" data-s="1" ${i < steps.length - 1 ? "" : "disabled"}>Sonraki adım</button><button type="button" class="sc-btn" data-s="0">Baştan</button><span class="muted" style="font-size:13px">Adım ${i + 1} / ${steps.length}</span></div>`;
      el.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => {
        const k = +b.dataset.s; i = k === 0 ? 0 : clamp(i + k, 0, steps.length - 1); draw(); changed();
        (el.querySelector(`[data-s="${k}"]:not(:disabled)`) || el.querySelector('[data-s="0"]')).focus();
      }));
    }
    draw();
    return () => ({ adim: i + 1, bitti: i === steps.length - 1 ? 1 : 0 });
  });

  // ---------- c-paylastir: bölmeyi eşit paylaştırma olarak modeller ----------
  // cfg: { bolunen: 23, bolen: 4, ayar: true, maxBolunen: 40 }
  reg("c-paylastir", (el, cfg, changed) => {
    const st = { bolunen: cfg.bolunen ?? 12, bolen: cfg.bolen ?? 3 };
    let tur = 0;
    el.innerHTML = `<div class="sc-ph"></div><p class="sc-msg" aria-live="polite"></p>
      <div class="sc-row"><button type="button" class="sc-btn pri" data-a="1">Her gruba birer tane ver</button><button type="button" class="sc-btn" data-a="all">Hepsini dağıt</button><button type="button" class="sc-btn" data-a="0">Baştan</button></div>
      ${cfg.ayar ? `<div class="plane-ctrl">${slider("Bölünen (nesne sayısı)", "bolunen", 1, cfg.maxBolunen ?? 40, 1, st.bolunen)}${slider("Bölen (grup sayısı)", "bolen", 1, 8, 1, st.bolen)}</div>` : ""}`;
    function draw() {
      const g = st.bolen, left = st.bolunen - tur * g, done = left < g;
      const W = 480, gw = (W - 20) / g, per = Math.max(1, Math.ceil(Math.sqrt(Math.max(tur, 1)))) ;
      const rowsIn = Math.ceil(Math.max(tur, 1) / per), r = Math.min(9, (gw - 20) / (per * 2.6)), boxH = Math.max(64, rowsIn * r * 2.6 + 44);
      const leftRows = Math.ceil(left / 14), H = boxH + 40 + Math.max(1, leftRows) * 24 + 10;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": `${g} grup, her grupta ${tur}, dağıtılmayan ${left}` });
      for (let k = 0; k < g; k++) {
        const x = 10 + k * gw;
        svgEl("rect", { x: x + 4, y: 4, width: gw - 8, height: boxH, rx: 10, class: "sc-box" }, svg);
        for (let j = 0; j < tur; j++) svgEl("circle", { cx: x + gw / 2 + ((j % per) - (per - 1) / 2) * r * 2.6, cy: 22 + r + Math.floor(j / per) * r * 2.6, r, class: "sc-dot" }, svg);
        txt(svg, { x: x + gw / 2, y: boxH - 6, class: "sc-lab", style: "font-size:18px" }, `${tur}`);
      }
      txt(svg, { x: 12, y: boxH + 31, class: "sc-lab st", style: "font-size:17px" }, `Kalan: ${left}`);
      for (let j = 0; j < left; j++) svgEl("circle", { cx: 140 + (j % 14) * 22, cy: boxH + 24 + Math.floor(j / 14) * 24, r: 8, class: "sc-dot left" }, svg);
      el.querySelector(".sc-ph").replaceChildren(svg);
      const m = el.querySelector(".sc-msg");
      m.className = "sc-msg" + (done ? " ok" : "");
      m.textContent = done
        ? `${st.bolunen} ÷ ${g}: her grupta ${tur} tane oldu, ${left} tane arttı. Bölüm ${tur}, kalan ${left}. ${st.bolunen} = ${g} × ${tur} + ${left}.${left ? "" : " Kalan 0: bölme tam bölündü."}`
        : `Her grupta ${tur} tane var. Dağıtılmayan ${left} tane, ${g} gruba bir tur daha yeter.`;
      el.querySelector('[data-a="1"]').disabled = done; el.querySelector('[data-a="all"]').disabled = done;
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = st[b.dataset.v]; });
    }
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.a;
      if (a === "0") tur = 0; else if (a === "1") tur++; else tur = Math.floor(st.bolunen / st.bolen);
      draw(); changed();
    }));
    el.querySelectorAll("input[data-k]").forEach((inp) => inp.addEventListener("input", () => { st[inp.dataset.k] = +inp.value; tur = 0; draw(); changed(); }));
    draw();
    return () => { const left = st.bolunen - tur * st.bolen; return { bolunen: st.bolunen, bolen: st.bolen, bolum: tur, kalan: left, bitti: left < st.bolen ? 1 : 0 }; };
  });

  // ---------- c-cokluk: bir çokluğun kesri kadarı ----------
  // cfg: { toplam: 12, payda: 4, paydalar: [2,3,4,6] (isteğe bağlı seçenek), secili: 0 }
  reg("c-cokluk", (el, cfg, changed) => {
    const total = cfg.toplam ?? 12;
    let den = cfg.payda ?? 4;
    const sel = new Set([...Array(cfg.secili ?? 0).keys()]);
    function draw(focusI) {
      const per = total / den, W = 480, gh = 44, H = den * (gh + 8) + 8, r = Math.min(13, (W - 100) / (per * 2.8));
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "group", "aria-label": `${total} nesne ${den} eş gruba ayrıldı` });
      for (let k = 0; k < den; k++) {
        const y = 8 + k * (gh + 8), on = sel.has(k);
        const box = svgEl("rect", { x: 4, y, width: W - 8, height: gh, rx: 8, class: `sc-box tap${on ? " sel" : ""}`, tabindex: 0, role: "checkbox", "aria-checked": on, "aria-label": `${k + 1}. grup (${per} nesne)`, "data-g": k }, svg);
        for (let j = 0; j < per; j++) svgEl("circle", { cx: 30 + j * r * 2.8, cy: y + gh / 2, r, class: `sc-dot${on ? " sel" : ""}`, "pointer-events": "none" }, svg);
        txt(svg, { x: W - 36, y: y + gh / 2 + 6, class: "sc-lab m", style: "font-size:17px", "pointer-events": "none" }, `1/${den}`);
        const tog = () => { on ? sel.delete(k) : sel.add(k); draw(k); changed(); };
        box.addEventListener("click", tog);
        box.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); tog(); } });
      }
      const k = sel.size;
      el.innerHTML = `<div class="sc-ph"></div>
        ${cfg.paydalar ? `<div class="seg-light" role="group" aria-label="Payda">${cfg.paydalar.map((p) => `<button type="button" data-p="${p}" aria-pressed="${p === den}">${p} eş grup</button>`).join("")}</div>` : ""}
        <p class="sc-out">${total} nesne ${den} eş gruba ayrıldı; her grup bütünün <b>1/${den}</b> kadarı ve ${per} nesne.</p>
        <p class="sc-big">${ek(total, "in")} ${k}/${den}'${ek(k, "i").split("'")[1]} = ${k} × ${per} = ${k * per}</p>`;
      el.querySelector(".sc-ph").replaceChildren(svg);
      el.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { den = +b.dataset.p; sel.clear(); draw(); changed(); }));
      if (focusI !== undefined) svg.querySelector(`[data-g="${focusI}"]`)?.focus();
    }
    draw();
    return () => ({ secili: sel.size, payda: den, toplam: total, sayi: (sel.size * total) / den });
  });

  // ---------- c-pergel-ucgen: pergelle üçgen inşası ve kenarlara göre sınıflama ----------
  // cfg: { ab: 6, ac: 5, bc: 4, cember: true, max: 10 }
  reg("c-pergel-ucgen", (el, cfg, changed) => {
    const st = { ab: cfg.ab ?? 6, ac: cfg.ac ?? 5, bc: cfg.bc ?? 4 }, max = cfg.max ?? 10, showC = cfg.cember !== false;
    el.innerHTML = `<div class="plane-wrap"><div class="sc-ph"></div><div class="plane-ctrl"><p class="eq sc-t"></p><p class="slope sc-s"></p>
      ${slider(showC ? "AB (merkezler arası)" : "AB", "ab", 1, max, 1, st.ab)}${slider(showC ? "A merkezli pergel açıklığı (AC)" : "AC", "ac", 1, max, 1, st.ac)}${slider(showC ? "B merkezli pergel açıklığı (BC)" : "BC", "bc", 1, max, 1, st.bc)}</div></div>`;
    const u = 26, W = 400, H = 330;
    function draw() {
      const { ab, ac, bc } = st, ax = W / 2 - (ab * u) / 2, bx = W / 2 + (ab * u) / 2, by = H - 40;
      const x = (ac * ac - bc * bc + ab * ab) / (2 * ab), h2 = ac * ac - x * x, ok = ac + bc > ab && ac + ab > bc && ab + bc > ac;
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": `Kenarları ${ab}, ${ac}, ${bc} birim` , style: "overflow:hidden" });
      if (showC) { svgEl("circle", { cx: ax, cy: by, r: ac * u, class: "sc-circ" }, svg); svgEl("circle", { cx: bx, cy: by, r: bc * u, class: "sc-circ" }, svg); }
      svgEl("line", { x1: ax, y1: by, x2: bx, y2: by, class: "sc-edge" }, svg);
      let tur = -1;
      if (ok && h2 > 0) {
        const cx = ax + x * u, cy = by - Math.sqrt(h2) * u;
        svgEl("polygon", { points: `${ax},${by} ${bx},${by} ${cx},${cy}`, class: "sc-tri" }, svg);
        svgEl("circle", { cx, cy, r: 5, class: "sc-pt" }, svg);
        txt(svg, { x: cx, y: cy - 10, class: "sc-lab big" }, "C");
        txt(svg, { x: (ax + cx) / 2 - 14, y: (by + cy) / 2, class: "sc-lab" }, ac);
        txt(svg, { x: (bx + cx) / 2 + 14, y: (by + cy) / 2, class: "sc-lab" }, bc);
        tur = ab === ac && ac === bc ? 2 : ab === ac || ac === bc || ab === bc ? 1 : 0;
      }
      [[ax, "A"], [bx, "B"]].forEach(([px, l]) => { svgEl("circle", { cx: px, cy: by, r: 5, class: "sc-pt" }, svg); txt(svg, { x: px, y: by + 24, class: "sc-lab big" }, l); });
      txt(svg, { x: W / 2, y: by + 24, class: "sc-lab" }, ab);
      el.querySelector(".sc-ph").replaceChildren(svg);
      const NAME = ["Çeşitkenar üçgen", "İkizkenar üçgen", "Eşkenar üçgen"];
      el.querySelector(".sc-t").textContent = tur >= 0 ? NAME[tur] : "Üçgen oluşmadı";
      el.querySelector(".sc-s").textContent = tur >= 0
        ? (tur === 2 ? "Üç kenar da eşit." : tur === 1 ? "İki kenar eşit, biri farklı." : "Üç kenarın uzunlukları birbirinden farklı.")
        : showC ? "Çemberler kesişmiyor: iki kısa kenarın toplamı en uzun kenardan büyük olmalı." : "İki kısa kenarın toplamı en uzun kenardan büyük olmalı.";
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = st[b.dataset.v]; });
      el._tur = tur;
    }
    el.querySelectorAll("input[data-k]").forEach((inp) => inp.addEventListener("input", () => { st[inp.dataset.k] = +inp.value; draw(); changed(); }));
    draw();
    return () => ({ ...st, ucgen: el._tur >= 0 ? 1 : 0, tur: el._tur });
  });

  // ---------- c-simetri: simetri doğrusuna göre şeklin simetriğini boyama ----------
  // cfg: { cols: 8, rows: 6, sekil: [[satır, sütun], ...] (sol yarıda), eksen: "v" | "h" }
  reg("c-simetri", (el, cfg, changed) => {
    const C = cfg.cols ?? 8, R = cfg.rows ?? 6, v = (cfg.eksen ?? "v") === "v", s = 40, P = 6;
    const given = new Set((cfg.sekil || []).map(([r, c]) => `${r},${c}`));
    const mirror = ([r, c]) => (v ? [r, C - 1 - c] : [R - 1 - r, c]);
    const target = new Set((cfg.sekil || []).map((p) => mirror(p).join(",")));
    const on = new Set();
    const inTap = (r, c) => (v ? c >= C / 2 : r >= R / 2);
    const svg = svgEl("svg", { viewBox: `0 0 ${C * s + 2 * P} ${R * s + 2 * P}`, class: "sim-svg", role: "group", "aria-label": "Simetri ızgarası" });
    el.innerHTML = `<div class="sc-ph" style="max-width:480px"></div><p class="sc-out" aria-live="polite"></p><div class="sc-row"><button type="button" class="sc-btn" data-a="0">Temizle</button></div>`;
    el.querySelector(".sc-ph").appendChild(svg);
    let checked = false;
    function draw(focusKey) {
      svg.replaceChildren();
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const k = `${r},${c}`, tap = inTap(r, c), isOn = on.has(k);
        const cl = given.has(k) ? "given" : isOn ? (checked && !target.has(k) ? "on bad" : "on") : "";
        const rc = svgEl("rect", { x: P + c * s, y: P + r * s, width: s, height: s, class: `sc-cell ${cl}${tap ? " tap" : ""}` }, svg);
        if (tap) {
          rc.setAttribute("tabindex", 0); rc.setAttribute("role", "checkbox"); rc.setAttribute("aria-checked", isOn); rc.setAttribute("aria-label", `${r + 1}. satır ${c + 1}. sütun`); rc.dataset.k = k;
          const tog = () => { isOn ? on.delete(k) : on.add(k); draw(k); changed(); };
          rc.addEventListener("click", tog);
          rc.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); tog(); } });
        }
      }
      if (v) svgEl("line", { x1: P + (C / 2) * s, y1: 0, x2: P + (C / 2) * s, y2: R * s + 2 * P, class: "sc-axis" }, svg);
      else svgEl("line", { x1: 0, y1: P + (R / 2) * s, x2: C * s + 2 * P, y2: P + (R / 2) * s, class: "sc-axis" }, svg);
      const st = state();
      el.querySelector(".sc-out").innerHTML = st.tamam ? `<b>Tamam!</b> Şekil ve simetriği simetri doğrusuna göre birbirinin aynası.` : `Doğru boyanan: <b>${st.dogru}</b> / ${st.hedef}${st.yanlis ? ` · Fazla boyanan: <b>${st.yanlis}</b> (kırmızı)` : ""}`;
      if (focusKey) svg.querySelector(`[data-k="${focusKey}"]`)?.focus();
    }
    function state() {
      let dogru = 0, yanlis = 0;
      on.forEach((k) => (target.has(k) ? dogru++ : yanlis++));
      return { dogru, yanlis, hedef: target.size, tamam: dogru === target.size && !yanlis ? 1 : 0 };
    }
    checked = true;
    el.querySelector('[data-a="0"]').addEventListener("click", () => { on.clear(); draw(); changed(); });
    draw();
    return state;
  });

  // ---------- c-birimkare: alan = birimkare sayısı, çevre = dış kenarlar ----------
  // Serbest: { mod: "serbest", cols: 10, rows: 6, kareler: [[r,c],...] }
  // Dikdörtgen: { mod: "dikdortgen", en: 4, boy: 3, max: 10, cevre: (sabit çevre, isteğe bağlı) }
  reg("c-birimkare", (el, cfg, changed) => {
    const mode = cfg.mod ?? "serbest";
    if (mode === "dikdortgen") {
      const fixedP = cfg.cevre ?? null, max = cfg.max ?? 10;
      const st = { en: cfg.en ?? 4, boy: cfg.boy ?? 3 };
      if (fixedP) st.boy = fixedP / 2 - st.en;
      el.innerHTML = `<div class="plane-wrap"><div class="sc-ph"></div><div class="plane-ctrl"><p class="eq sc-t"></p><p class="slope sc-s"></p>
        ${fixedP ? slider("Kısa/uzun kenar (en)", "en", 1, fixedP / 2 - 1, 1, st.en) : slider("En", "en", 1, max, 1, st.en) + slider("Boy", "boy", 1, max, 1, st.boy)}
        ${fixedP ? `<p class="note muted" style="margin:0;font-size:13px">Çevre ${fixedP} birimde sabit: en değişince boy kendiliğinden ayarlanır.</p>` : ""}</div></div>`;
      function draw() {
        const { en, boy } = st, M = Math.max(fixedP ? fixedP / 2 - 1 : max, 1), s = Math.min(30, 300 / M), W = M * s + 60, H = Math.min(M, fixedP ? M : max) * s + 50;
        const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg", role: "img", "aria-label": `${en} × ${boy} dikdörtgen` });
        for (let r = 0; r < boy; r++) for (let c = 0; c < en; c++) svgEl("rect", { x: 30 + c * s, y: 10 + r * s, width: s, height: s, class: "sc-cell" , style: "fill:var(--brand-soft)" }, svg);
        svgEl("rect", { x: 30, y: 10, width: en * s, height: boy * s, class: "sc-edge" }, svg);
        txt(svg, { x: 30 + (en * s) / 2, y: 10 + boy * s + 22, class: "sc-lab" }, `${en} birim`);
        txt(svg, { x: 22, y: 10 + (boy * s) / 2 + 5, class: "sc-lab", style: "text-anchor:end" }, `${boy}`);
        el.querySelector(".sc-ph").replaceChildren(svg);
        el.querySelector(".sc-t").textContent = `Alan = ${en} × ${boy} = ${en * boy} birimkare`;
        el.querySelector(".sc-s").textContent = `Çevre = ${en} + ${boy} + ${en} + ${boy} = 2 × (${en} + ${boy}) = ${2 * (en + boy)} birim`;
        el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = st[b.dataset.v]; });
      }
      el.querySelectorAll("input[data-k]").forEach((inp) => inp.addEventListener("input", () => { st[inp.dataset.k] = +inp.value; if (fixedP) st.boy = fixedP / 2 - st.en; draw(); changed(); }));
      draw();
      return () => ({ en: st.en, boy: st.boy, alan: st.en * st.boy, cevre: 2 * (st.en + st.boy) });
    }
    const C = cfg.cols ?? 10, R = cfg.rows ?? 6, s = 40, P = 4;
    const on = new Set((cfg.kareler || []).map(([r, c]) => `${r},${c}`));
    const svg = svgEl("svg", { viewBox: `0 0 ${C * s + 2 * P} ${R * s + 2 * P}`, class: "sim-svg", role: "group", "aria-label": "Birimkareli zemin" });
    el.innerHTML = `<div class="sc-ph"></div><p class="sc-big sc-t"></p><div class="sc-row"><button type="button" class="sc-btn" data-a="0">Temizle</button></div>`;
    el.querySelector(".sc-ph").appendChild(svg);
    const calc = () => { let per = 0; on.forEach((k) => { const [r, c] = k.split(",").map(Number); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => { if (!on.has(`${r + dr},${c + dc}`)) per++; }); }); return { alan: on.size, cevre: per }; };
    function draw(focusKey) {
      svg.replaceChildren();
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const k = `${r},${c}`, isOn = on.has(k);
        const rc = svgEl("rect", { x: P + c * s, y: P + r * s, width: s, height: s, class: `sc-cell tap${isOn ? " on" : ""}`, tabindex: 0, role: "checkbox", "aria-checked": isOn, "aria-label": `${r + 1}. satır ${c + 1}. sütun`, "data-k": k }, svg);
        const tog = () => { isOn ? on.delete(k) : on.add(k); draw(k); changed(); };
        rc.addEventListener("click", tog);
        rc.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); tog(); } });
      }
      // Dış kenarları vurgula
      on.forEach((k) => {
        const [r, c] = k.split(",").map(Number), x = P + c * s, y = P + r * s;
        if (!on.has(`${r - 1},${c}`)) svgEl("line", { x1: x, y1: y, x2: x + s, y2: y, class: "sc-edge", style: "stroke:var(--good)" }, svg);
        if (!on.has(`${r + 1},${c}`)) svgEl("line", { x1: x, y1: y + s, x2: x + s, y2: y + s, class: "sc-edge", style: "stroke:var(--good)" }, svg);
        if (!on.has(`${r},${c - 1}`)) svgEl("line", { x1: x, y1: y, x2: x, y2: y + s, class: "sc-edge", style: "stroke:var(--good)" }, svg);
        if (!on.has(`${r},${c + 1}`)) svgEl("line", { x1: x + s, y1: y, x2: x + s, y2: y + s, class: "sc-edge", style: "stroke:var(--good)" }, svg);
      });
      const st = calc();
      el.querySelector(".sc-t").textContent = `Alan = ${st.alan} birimkare · Çevre = ${st.cevre} birim`;
      if (focusKey) svg.querySelector(`[data-k="${focusKey}"]`)?.focus();
    }
    el.querySelector('[data-a="0"]').addEventListener("click", () => { on.clear(); draw(); changed(); });
    draw();
    return calc;
  });

  // ---------- c-tarti: eşit kollu terazi ve ağırlıklar ----------
  // cfg: { kutle: 1250 (g), ad: "Karpuz", agirliklar: [1000, 500, 250, 100, 50, 10] }
  const kgg = (g) => { const kg = Math.floor(g / 1000), r = g % 1000; return kg && r ? `${kg} kg ${r} g` : kg ? `${kg} kg` : `${r} g`; };
  reg("c-tarti", (el, cfg, changed) => {
    const M = cfg.kutle ?? 1000, W8 = cfg.agirliklar ?? [1000, 500, 250, 100, 50, 10];
    const lab = (w) => (w >= 1000 && w % 1000 === 0 ? `${w / 1000} kg` : `${w} g`);
    const cnt = Object.fromEntries(W8.map((w) => [w, 0]));
    const right = () => W8.reduce((s, w) => s + w * cnt[w], 0);
    el.innerHTML = `<div class="sc-ph"></div><div class="sc-row" role="group" aria-label="Ağırlık ekle">${W8.map((w) => `<button type="button" class="sc-btn" data-add="${w}">+ ${lab(w)}</button>`).join("")}</div><div class="sc-tray"></div><p class="sc-out" aria-live="polite"></p>`;
    function draw() {
      const R = right(), diff = M - R, ang = clamp(diff / Math.max(M, 1), -1, 1) * -10;
      const svg = svgEl("svg", { viewBox: "0 0 640 250", class: "sim-svg", role: "img", "aria-label": diff ? "Terazi dengede değil" : "Terazi dengede" });
      svgEl("polygon", { points: "300,240 340,240 320,110", class: "sc-stand" }, svg);
      const g = svgEl("g", { transform: `rotate(${ang} 320 110)` }, svg);
      svgEl("line", { x1: 90, y1: 110, x2: 550, y2: 110, class: "sc-beam" }, g);
      const pan = (cx) => { svgEl("line", { x1: cx - 80, y1: 110, x2: cx - 80, y2: 170, class: "bl-str" }, g); svgEl("line", { x1: cx + 80, y1: 110, x2: cx + 80, y2: 170, class: "bl-str" }, g); svgEl("rect", { x: cx - 95, y: 170, width: 190, height: 10, rx: 4, class: "sc-pan" }, g); };
      pan(170); pan(470);
      svgEl("rect", { x: 120, y: 120, width: 100, height: 50, rx: 14, class: "sc-obj" }, g);
      txt(g, { x: 170, y: 150, class: "sc-objt" }, cfg.ad ?? "?");
      let k = 0;
      W8.forEach((w) => { for (let i = 0; i < cnt[w]; i++, k++) { const x = 385 + (k % 6) * 29, y = 168 - Math.floor(k / 6) * 26; const sz = w >= 1000 ? 26 : w >= 250 ? 22 : 17; svgEl("rect", { x: x + (26 - sz) / 2, y: y - sz, width: sz, height: sz, rx: 3, class: "sc-wt" }, g); if (sz >= 22) txt(g, { x: x + 13, y: y - sz / 2 + 4, class: "sc-wtt" }, w >= 1000 ? `${w / 1000}kg` : w); } });
      el.querySelector(".sc-ph").replaceChildren(svg);
      el.querySelector(".sc-tray").innerHTML = W8.filter((w) => cnt[w]).map((w) => `<span class="sc-chip">${lab(w)} × ${cnt[w]}<button type="button" data-rem="${w}" aria-label="${lab(w)} çıkar">−</button></span>`).join("") || `<span class="muted" style="font-size:13px">Sağ kefe boş. Ağırlık eklemek için düğmelere dokun.</span>`;
      el.querySelector(".sc-out").innerHTML = `Sağ kefe: <b>${kgg(R)}</b> (${grp(R)} g) · ${diff === 0 ? `<b>Terazi dengede!</b> ${esc(cfg.ad ?? "Nesne")} ${kgg(M)}.` : diff > 0 ? "Sol kefe ağır basıyor: ağırlık ekle." : "Sağ kefe ağır basıyor: ağırlık çıkar."}`;
      el.querySelectorAll("[data-rem]").forEach((b) => b.addEventListener("click", () => { cnt[b.dataset.rem]--; draw(); changed(); el.querySelector(`[data-add="${b.dataset.rem}"]`)?.focus(); }));
    }
    el.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => { cnt[b.dataset.add]++; draw(); changed(); }));
    draw();
    return () => ({ sag: right(), denge: right() === M ? 1 : 0, parca: Object.values(cnt).reduce((a, b) => a + b, 0) });
  });

  // ---------- c-sivi: dereceli kap, litre ve mililitre ----------
  // cfg: { kapasite: 2000, kaplar: [1000, 500, 250, 100], hedef: 1750 }
  const lml = (m) => { const l = Math.floor(m / 1000), r = m % 1000; return l && r ? `${l} L ${r} mL` : l ? `${l} L` : `${r} mL`; };
  reg("c-sivi", (el, cfg, changed) => {
    const CAP = cfg.kapasite ?? 2000, CUPS = cfg.kaplar ?? [1000, 500, 250, 100], hist = [];
    let ml = cfg.baslangic ?? 0, tasti = 0;
    const lab = (w) => (w % 1000 === 0 ? `${w / 1000} L` : `${w} mL`);
    el.innerHTML = `<div class="plane-wrap"><div class="sc-ph" style="max-width:280px"></div><div class="plane-ctrl"><p class="eq sc-t"></p><p class="slope sc-s"></p>
      <div class="sc-row" role="group" aria-label="Kaba sıvı ekle">${CUPS.map((w) => `<button type="button" class="sc-btn" data-add="${w}">+ ${lab(w)}</button>`).join("")}</div>
      <div class="sc-row"><button type="button" class="sc-btn" data-a="undo">Geri al</button><button type="button" class="sc-btn" data-a="0">Boşalt</button></div></div></div>`;
    function draw() {
      const H = 300, top = 20, bot = 280, Y = (v) => bot - (v / CAP) * (bot - top);
      const svg = svgEl("svg", { viewBox: `0 0 270 ${H}`, class: "sim-svg", role: "img", "aria-label": `Kapta ${lml(ml)} sıvı` });
      svgEl("rect", { x: 70, y: top - 10, width: 100, height: bot - top + 10, class: "sc-jugbg" }, svg);
      svgEl("rect", { x: 70, y: Y(ml), width: 100, height: bot - Y(ml), class: "sc-liq" }, svg);
      svgEl("path", { d: `M70,${top - 10} L70,${bot} L170,${bot} L170,${top - 10}`, class: "sc-jug" }, svg);
      for (let v = 100; v <= CAP; v += 100) {
        const major = v % 500 === 0;
        svgEl("line", { x1: 170, x2: 170 - (major ? 24 : 12), y1: Y(v), y2: Y(v), class: "sc-tick" }, svg);
        if (major) txt(svg, { x: 176, y: Y(v) + 4, class: "sc-lab m st", style: "font-size:12px" }, lml(v));
      }
      if (cfg.hedef) svgEl("line", { x1: 60, x2: 180, y1: Y(cfg.hedef), y2: Y(cfg.hedef), class: "sc-target" }, svg);
      el.querySelector(".sc-ph").replaceChildren(svg);
      el.querySelector(".sc-t").textContent = lml(ml);
      el.querySelector(".sc-s").innerHTML = `= <b>${grp(ml)} mL</b>${tasti ? ` · <span style="color:var(--bad)">Kap taştı! Kap en çok ${lml(CAP)} alır.</span>` : ""}${cfg.hedef ? `<br><span class="muted">Yeşil kesikli çizgi: ${lml(cfg.hedef)}</span>` : ""}`;
      el.querySelector('[data-a="undo"]').disabled = !hist.length;
    }
    el.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => { hist.push([ml, tasti]); const w = +b.dataset.add; tasti = ml + w > CAP ? 1 : 0; ml = Math.min(CAP, ml + w); draw(); changed(); }));
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => { if (b.dataset.a === "undo") { [ml, tasti] = hist.pop(); } else { hist.push([ml, tasti]); ml = 0; tasti = 0; } draw(); changed(); }));
    draw();
    return () => ({ ml, tasti });
  });

  // ---------- c-sutun-grafigi: sütun grafiği oluşturma ----------
  // cfg: { etiketler: [...], degerler: [...], max: 10, hedef: [...] (isteğe bağlı), birim: "öğrenci sayısı", sabit: false }
  reg("c-sutun-grafigi", (el, cfg, changed) => {
    const labs = cfg.etiketler, canSet = (i) => !cfg.ayarla || cfg.ayarla.includes(i), vals = cfg.degerler ? [...cfg.degerler] : labs.map(() => 0), max = cfg.max ?? 10, hedef = cfg.hedef;
    const W = 420, H = 190, B = 22, L = 34, bw = (W - L) / labs.length, step = max > 20 ? 5 : max > 10 ? 2 : 1;
    el.innerHTML = `<div class="sc-ph"></div>${cfg.sabit ? "" : `<div class="sc-bars">${labs.map((l, i) => !canSet(i) ? "" : `<div><span>${esc(l)}</span><button type="button" class="sc-btn" data-d="-1" data-i="${i}" aria-label="${esc(l)} azalt">−</button><b class="num" data-n="${i}"></b><button type="button" class="sc-btn" data-d="1" data-i="${i}" aria-label="${esc(l)} artır">+</button></div>`).join("")}</div>`}<p class="sc-out" aria-live="polite"></p>`;
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H + B + 30}`, class: "sim-svg" + (cfg.sabit ? "" : " drag"), role: "img", "aria-label": "Sütun grafiği" });
    el.querySelector(".sc-ph").appendChild(svg);
    const Yv = (v) => B + H - (v / max) * H;
    function state() {
      const total = vals.reduce((a, b) => a + b, 0), top = Math.max(...vals), idx = vals.indexOf(top), uniq = vals.filter((v) => v === top).length === 1;
      const dogru = hedef ? vals.filter((v, i) => v === hedef[i]).length : 0;
      return { ...Object.fromEntries(vals.map((v, i) => [`v${i}`, v])), toplam: total, enCok: uniq ? idx : -1, dogru, tamam: hedef && dogru === labs.length ? 1 : 0 };
    }
    function draw() {
      svg.replaceChildren();
      for (let v = 0; v <= max; v += step) { svgEl("line", { x1: L, x2: W, y1: Yv(v), y2: Yv(v), class: "sc-gridl" }, svg); txt(svg, { x: L - 6, y: Yv(v) + 5, class: "dc-ax", style: "font-size:13px" }, v); }
      vals.forEach((v, i) => {
        const ok = hedef && v === hedef[i];
        svgEl("rect", { x: L + i * bw + bw * 0.2, y: Yv(v), width: bw * 0.6, height: Yv(0) - Yv(v), rx: 3, class: `sc-bar${ok ? " ok" : ""}` }, svg);
        if (v) txt(svg, { x: L + i * bw + bw / 2, y: Yv(v) - 6, class: "dc-key" }, v);
        txt(svg, { x: L + i * bw + bw / 2, y: H + B + 22, class: "sc-lab m", style: `font-size:${labs.length > 5 ? 12 : 14}px` }, labs[i]);
      });
      if (cfg.birim) txt(svg, { x: L, y: 12, class: "sc-lab m st", style: "font-size:13px" }, cfg.birim);
      el.querySelectorAll("[data-n]").forEach((b) => { b.textContent = vals[+b.dataset.n]; });
      const st = state();
      el.querySelector(".sc-out").innerHTML = `Toplam: <b>${st.toplam}</b> · En çok: <b>${st.enCok >= 0 ? esc(labs[st.enCok]) : "eşitlik var"}</b>${hedef ? ` · Tabloya uyan sütun: <b>${st.dogru}</b> / ${labs.length}` : ""}`;
    }
    if (!cfg.sabit) {
      el.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.i; vals[i] = clamp(vals[i] + +b.dataset.d, 0, max); draw(); changed(); }));
      let dragI = -1;
      const setFrom = (ev) => { const p = svgPoint(svg, ev); const i = dragI >= 0 ? dragI : Math.floor((p.x - L) / bw); if (i < 0 || i >= vals.length || !canSet(i)) return; dragI = i; vals[i] = clamp(Math.round(((B + H - p.y) / H) * max), 0, max); draw(); changed(); };
      svg.addEventListener("pointerdown", (ev) => { dragI = -1; svg.setPointerCapture(ev.pointerId); setFrom(ev); });
      svg.addEventListener("pointermove", (ev) => { if (dragI >= 0 && ev.buttons) setFrom(ev); });
      svg.addEventListener("pointerup", () => { dragI = -1; });
    }
    draw();
    return state;
  });

  // ---------- c-terazi-sayi: eşitlik terazisi (sayılarla) ----------
  // cfg: { sol: [8, 5], sag: [12], ayar: "sag" | "sol" | null, deger: 0, min: 0, max: 20 }
  reg("c-terazi-sayi", (el, cfg, changed) => {
    const sol = cfg.sol || [], sag = cfg.sag || [], side = cfg.ayar ?? null;
    let v = cfg.deger ?? 0, exL = 0, exR = 0;
    const sum = (a) => a.reduce((s, x) => s + x, 0);
    const totals = () => [sum(sol) + (side === "sol" ? v : 0) + exL, sum(sag) + (side === "sag" ? v : 0) + exR];
    el.innerHTML = `<div class="sc-ph"></div><p class="eq sc-t" style="text-align:center;font:700 20px var(--font);margin:0"></p>
      ${side ? slider("? kutusunun değeri", "v", cfg.min ?? 0, cfg.max ?? 20, 1, v) : ""}
      <div class="sc-row"><button type="button" class="sc-btn" data-a="both">İki kefeye de 1 ekle</button><button type="button" class="sc-btn" data-a="bothm">İki kefeden de 1 çıkar</button><button type="button" class="sc-btn" data-a="L">Yalnız sola 1 ekle</button><button type="button" class="sc-btn" data-a="0">Ekleri kaldır</button></div>
      <p class="sc-msg" aria-live="polite"></p>`;
    function draw() {
      const [l, r] = totals(), diff = l - r, ang = clamp(diff, -6, 6) * -2;
      const svg = svgEl("svg", { viewBox: "0 0 640 230", class: "sim-svg", role: "img", "aria-label": `Sol ${l}, sağ ${r}` });
      svgEl("polygon", { points: "300,222 340,222 320,100", class: "sc-stand" }, svg);
      const g = svgEl("g", { transform: `rotate(${ang} 320 100)` }, svg);
      svgEl("line", { x1: 80, y1: 100, x2: 560, y2: 100, class: "sc-beam" }, g);
      const pan = (cx, items) => {
        svgEl("line", { x1: cx - 90, y1: 100, x2: cx - 90, y2: 160, class: "bl-str" }, g); svgEl("line", { x1: cx + 90, y1: 100, x2: cx + 90, y2: 160, class: "bl-str" }, g);
        svgEl("rect", { x: cx - 100, y: 160, width: 200, height: 10, rx: 4, class: "sc-pan" }, g);
        let x = cx - 92;
        items.forEach(([t, cls]) => { const w = cls === "one" ? 22 : Math.max(36, String(t).length * 12 + 18); if (cls === "one") { svgEl("circle", { cx: x + 11, cy: 148, r: 11, class: "bl-one" }, g); txt(g, { x: x + 11, y: 153, class: "bl-ot" }, "1"); } else { svgEl("rect", { x, y: 124, width: w, height: 36, rx: 6, class: cls === "q" ? "bl-x" : "sc-obj" }, g); txt(g, { x: x + w / 2, y: 148, class: cls === "q" ? "bl-xt" : "sc-objt", style: "font-size:16px" }, t); } x += w + 4; });
      };
      const items = (arr, isSide, ex) => [...arr.map((n) => [n, "n"]), ...(isSide ? [["?", "q"]] : []), ...Array(ex).fill([1, "one"])];
      pan(180, items(sol, side === "sol", exL)); pan(460, items(sag, side === "sag", exR));
      el.querySelector(".sc-ph").replaceChildren(svg);
      const exprOf = (arr, isSide, ex) => [...arr, ...(isSide ? [v] : []), ...(ex ? [ex] : [])].join(" + ") || "0";
      el.querySelector(".sc-t").textContent = `${exprOf(sol, side === "sol", exL)} ${diff === 0 ? "=" : "≠"} ${exprOf(sag, side === "sag", exR)}`;
      const m = el.querySelector(".sc-msg");
      m.className = "sc-msg " + (diff === 0 ? "ok" : "no");
      m.textContent = diff === 0 ? `Terazi dengede: iki taraf da ${l}.` : `Sol ${l}, sağ ${r}. ${diff > 0 ? "Sol taraf" : "Sağ taraf"} ${Math.abs(diff)} fazla, terazi o yana eğildi.`;
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = v; });
      el.querySelector('[data-a="bothm"]').disabled = !(exL > 0 && exR > 0);
    }
    el.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.a;
      if (a === "both") { exL++; exR++; } else if (a === "bothm") { exL--; exR--; } else if (a === "L") exL++; else { exL = 0; exR = 0; }
      draw(); changed();
    }));
    el.querySelector("input[data-k]")?.addEventListener("input", (e) => { v = +e.target.value; draw(); changed(); });
    draw();
    return () => { const [l, r] = totals(); return { sol: l, sag: r, esit: l === r ? 1 : 0, deger: v }; };
  });

  // ---------- c-islem-onceligi: sıradaki işleme dokunarak ifadeyi adım adım hesapla ----------
  // cfg: { ifade: "3 + 4 × (6 − 2)" }
  reg("c-islem-onceligi", (el, cfg, changed) => {
    const parse = (s) => (s.match(/\d+|[-+−×x*÷:/()]/g) || []).map((t) => (/\d/.test(t) ? { t: "n", v: +t } : t === "(" || t === ")" ? { t } : { t: "op", v: { "-": "−", x: "×", "*": "×", ":": "÷", "/": "÷" }[t] || t }));
    const start = parse(cfg.ifade || "2 + 3 × 4");
    let tok = start.map((x) => ({ ...x })), hist = [], err = 0, msg = "", ok = false;
    const show = (ts) => ts.map((x) => (x.t === "n" ? x.v : x.t === "op" ? ` ${x.v} ` : x.t)).join("").replace(/\( /g, "(").replace(/ \)/g, ")");
    const hi = (o) => o === "×" || o === "÷";
    function groups() {
      // En içteki (içinde parantez olmayan) grupların [başlangıç, bitiş) aralıkları; parantez yoksa tüm ifade.
      const res = [], stack = [];
      tok.forEach((x, i) => { if (x.t === "(") stack.push(i); else if (x.t === ")") { const s = stack.pop(); if (!tok.slice(s + 1, i).some((y) => y.t === "(")) res.push([s + 1, i]); } });
      return res.length ? res : [[0, tok.length]];
    }
    function allowed() {
      const set = new Set();
      // Çarpma/bölme: her çarpımsal zincirin ilk işlemi yapılabilir (12 ÷ 4 + 2 × 5'te ÷ de × de doğru);
      // zincir içinde soldan sağa. Toplama/çıkarma: grupta çarpma/bölme kalmadıysa yalnız en soldaki.
      groups().forEach(([a, b]) => {
        const ops = []; for (let i = a; i < b; i++) if (tok[i].t === "op") ops.push(i);
        const his = ops.filter((i) => hi(tok[i].v));
        if (his.length) his.forEach((i) => { const k = ops.indexOf(i); if (k === 0 || !hi(tok[ops[k - 1]].v)) set.add(i); });
        else if (ops.length) set.add(ops[0]);
      });
      return set;
    }
    function apply(i) {
      const a = tok[i - 1].v, b = tok[i + 1].v, o = tok[i].v;
      const r = o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : a / b;
      hist.push(`${a} ${o} ${b} = ${r}`);
      tok.splice(i - 1, 3, { t: "n", v: r });
      let changedP = true;
      while (changedP) { changedP = false; for (let k = 0; k + 2 < tok.length; k++) if (tok[k].t === "(" && tok[k + 1].t === "n" && tok[k + 2].t === ")") { tok.splice(k, 3, tok[k + 1]); changedP = true; break; } }
    }
    function draw() {
      const done = tok.length === 1;
      el.innerHTML = `<div class="sc-expr" role="group" aria-label="İfade">${tok.map((x, i) => x.t === "op" ? `<button type="button" class="sc-tok op" data-i="${i}" aria-label="${tok[i - 1]?.v ?? ""} ${x.v} ${tok[i + 1]?.v ?? ""} işlemini yap">${x.v}</button>` : `<span class="sc-tok${x.t === "n" ? "" : " par"}">${x.t === "n" ? x.v : x.t}</span>`).join("")}</div>
        <p class="sc-msg${done ? " ok" : msg ? (ok ? " ok" : " no") : ""}" aria-live="polite">${done ? `Bitti! ${esc(show(start))} = <b>${tok[0].v}</b>` : esc(msg || "Önce hangi işlem yapılmalı? O işlemin işaretine dokun.")}</p>
        ${hist.length ? `<ol class="sc-hist">${hist.map((h) => `<li><b>${esc(h)}</b></li>`).join("")}</ol>` : ""}
        <div class="sc-row"><button type="button" class="sc-btn" data-a="0">Baştan</button><span class="muted" style="font-size:13px">Hatalı dokunuş: ${err}</span></div>`;
      el.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
        const i = +b.dataset.i, al = allowed();
        if (al.has(i)) { apply(i); ok = true; msg = "Doğru sıra. Sıradaki işlem hangisi?"; }
        else {
          err++; ok = false;
          const gs = groups(), inGroup = gs.some(([a, c]) => i >= a && i < c), hasPar = tok.some((x) => x.t === "(");
          const [a, c] = gs.find(([x, y]) => i >= x && i < y) || [0, tok.length];
          const grpHasHi = tok.slice(a, c).some((x) => x.t === "op" && hi(x.v));
          msg = hasPar && !inGroup ? "Önce parantez içindeki işlem yapılır." : !hi(tok[i].v) && grpHasHi ? "Çarpma ve bölme, toplama ve çıkarmadan önce yapılır." : "Aynı önceliğe sahip işlemler soldan sağa doğru yapılır.";
        }
        draw(); changed(); el.querySelector("[data-i]")?.focus();
      }));
      el.querySelector('[data-a="0"]').addEventListener("click", () => { tok = start.map((x) => ({ ...x })); hist = []; err = 0; msg = ""; draw(); changed(); });
    }
    draw();
    return () => ({ adim: hist.length, hata: err, bitti: tok.length === 1 ? 1 : 0, sonuc: tok.length === 1 ? tok[0].v : null });
  });

  // ---------- c-dogrular: iki doğrunun durumu ve oluşan açılar ----------
  // cfg: { aci: 60 }  (0 = paralel)
  reg("c-dogrular", (el, cfg, changed) => {
    let th = cfg.aci ?? 60;
    const W = 480, H = 280, Y1 = 200, P = [240, 140];
    el.innerHTML = `<div class="sc-ph"></div>${slider("İkinci doğrunun yatayla yaptığı açı", "aci", 0, 175, 5, th)}<p class="sc-msg" aria-live="polite"></p>`;
    const host = el.querySelector(".sc-ph");
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg drag", role: "img", "aria-label": `İki doğru, açı ${th}°`, style: "overflow:hidden" });
      const r = (th * Math.PI) / 180, dx = Math.cos(r), dy = -Math.sin(r);
      svgEl("line", { x1: 0, y1: Y1, x2: W, y2: Y1, class: "sc-line" }, svg);
      txt(svg, { x: 16, y: Y1 - 10, class: "sc-lab big st" }, "d");
      let X = null;
      if (th % 180 !== 0) {
        X = P[0] - ((Y1 - P[1]) * dx) / Math.sin(r);
        if (X > 30 && X < W - 30) {
          const rr = 34, a1 = 0, pts = (from, to, cls) => { const s = (from * Math.PI) / 180, e = (to * Math.PI) / 180; svgEl("path", { d: `M${X},${Y1} L${X + rr * Math.cos(s)},${Y1 - rr * Math.sin(s)} A${rr},${rr} 0 0 0 ${X + rr * Math.cos(e)},${Y1 - rr * Math.sin(e)} Z`, class: cls }, svg); const m = ((from + to) / 2) * Math.PI / 180; txt(svg, { x: X + 60 * Math.cos(m), y: Y1 - 60 * Math.sin(m) + 6, class: "sc-lab", style: "font-size:17px" }, `${Math.round(to - from)}°`); };
          pts(a1, th, "sc-arc1"); pts(th, 180, "sc-arc2"); pts(180, 180 + th, "sc-arc1"); pts(180 + th, 360, "sc-arc2");
        }
      }
      svgEl("line", { x1: P[0] - dx * 900, y1: P[1] - dy * 900, x2: P[0] + dx * 900, y2: P[1] + dy * 900, class: "sc-line mv" }, svg);
      const kx = P[0] + dx * 105, ky = P[1] + dy * 105;
      const knob = svgEl("circle", { cx: kx, cy: ky, r: 12, class: "nl-knob", tabindex: 0, role: "slider", "aria-label": "İkinci doğruyu döndür", "aria-valuetext": `${th}°` }, svg);
      txt(svg, { x: kx + 16, y: ky - 12, class: "sc-lab big st" }, "k");
      host.replaceChildren(svg);
      knob.addEventListener("keydown", (e) => { const d = e.key === "ArrowLeft" || e.key === "ArrowUp" ? 5 : e.key === "ArrowRight" || e.key === "ArrowDown" ? -5 : 0; if (d) { e.preventDefault(); th = (th + d + 180) % 180; sync(); draw(); changed(); host.querySelector(".nl-knob")?.focus(); } });
      const m = el.querySelector(".sc-msg");
      m.textContent = th === 0 ? "d ve k paralel: ne kadar uzatılsalar da kesişmezler, aralarındaki uzaklık hep aynı." : th === 90 ? "d ve k dik kesişiyor: oluşan dört açının hepsi 90°." : `d ve k kesişiyor. Karşılıklı (ters) açılar eşit: ${th}° ve ${th}°, ${180 - th}° ve ${180 - th}°. Yan yana (komşu) iki açının toplamı ${th}° + ${180 - th}° = 180°.${X !== null && (X <= 30 || X >= W - 30) ? " Kesişim noktası şeklin dışında kaldı; doğrular sonsuza uzandığı için yine de kesişirler." : ""}`;
      el.querySelector("[data-v]").textContent = th;
    }
    const sync = () => { el.querySelector("input[data-k]").value = th; };
    let drag = false;
    const svgOf = () => host.querySelector("svg");
    const move = (ev) => { const p = svgPoint(svgOf(), ev); let a = (Math.atan2(P[1] - p.y, p.x - P[0]) * 180) / Math.PI; a = ((Math.round(a / 5) * 5) % 180 + 180) % 180; if (a !== th) { th = a; sync(); draw(); changed(); } };
    host.addEventListener("pointerdown", (ev) => { if (!ev.target.classList?.contains("nl-knob")) return; drag = true; host.setPointerCapture(ev.pointerId); });
    host.addEventListener("pointermove", (ev) => { if (drag) move(ev); });
    host.addEventListener("pointerup", () => { drag = false; });
    el.querySelector("input[data-k]").addEventListener("input", (e) => { th = +e.target.value; draw(); changed(); });
    draw();
    return () => ({ aci: th, paralel: th === 0 ? 1 : 0, dik: th === 90 ? 1 : 0 });
  });

  // ---------- c-cember: merkez, yarıçap, çap ----------
  // cfg: { r: 3, cap: true }
  reg("c-cember", (el, cfg, changed) => {
    let r = cfg.r ?? 3, al = 40;
    const W = 400, H = 340, O = [200, 170], u = 24;
    el.innerHTML = `<div class="plane-wrap"><div class="sc-ph"></div><div class="plane-ctrl"><p class="eq sc-t"></p><p class="slope sc-s"></p>${slider("Yarıçap (pergel açıklığı)", "r", 1, 6, 1, r)}<p class="note muted" style="margin:0;font-size:13px">A noktasını çember üzerinde sürükle ya da ok tuşlarını kullan.</p></div></div>`;
    const host = el.querySelector(".sc-ph");
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "sim-svg drag", role: "img", "aria-label": `Yarıçapı ${r} birim olan çember` });
      for (let i = -8; i <= 8; i++) { svgEl("line", { x1: O[0] + i * u, y1: 0, x2: O[0] + i * u, y2: H, class: "pl-grid" }, svg); if (Math.abs(i) <= 7) svgEl("line", { x1: 0, y1: O[1] + i * u, x2: W, y2: O[1] + i * u, class: "pl-grid" }, svg); }
      svgEl("circle", { cx: O[0], cy: O[1], r: r * u, class: "sc-edge" }, svg);
      const a = (al * Math.PI) / 180, A = [O[0] + Math.cos(a) * r * u, O[1] - Math.sin(a) * r * u], B = [2 * O[0] - A[0], 2 * O[1] - A[1]];
      if (cfg.cap !== false) { svgEl("line", { x1: B[0], y1: B[1], x2: O[0], y2: O[1], class: "sc-line", style: "stroke:var(--good);stroke-dasharray:8 5" }, svg); svgEl("circle", { cx: B[0], cy: B[1], r: 5, class: "sc-pt" }, svg); txt(svg, { x: B[0] - 14 * Math.cos(a), y: B[1] + 14 * Math.sin(a) + 5, class: "sc-lab big" }, "B"); }
      svgEl("line", { x1: O[0], y1: O[1], x2: A[0], y2: A[1], class: "sc-line mv" }, svg);
      svgEl("circle", { cx: O[0], cy: O[1], r: 5, class: "sc-pt" }, svg); txt(svg, { x: O[0] - 12, y: O[1] + 20, class: "sc-lab big" }, "O");
      const knob = svgEl("circle", { cx: A[0], cy: A[1], r: 12, class: "nl-knob", tabindex: 0, role: "slider", "aria-label": "Çember üzerindeki A noktası", "aria-valuetext": `${al}°` }, svg);
      txt(svg, { x: A[0] + 18 * Math.cos(a), y: A[1] - 18 * Math.sin(a) + 5, class: "sc-lab big" }, "A");
      host.replaceChildren(svg);
      knob.addEventListener("keydown", (e) => { const d = e.key === "ArrowLeft" || e.key === "ArrowUp" ? 10 : e.key === "ArrowRight" || e.key === "ArrowDown" ? -10 : 0; if (d) { e.preventDefault(); al = (al + d + 360) % 360; draw(); changed(); host.querySelector(".nl-knob")?.focus(); } });
      el.querySelector(".sc-t").textContent = `|OA| = ${r} birim`;
      el.querySelector(".sc-s").innerHTML = `O merkez, [OA] yarıçap: ${r} birim.${cfg.cap !== false ? `<br>[AB] çap: merkezden geçer, uzunluğu 2 × ${r} = <b>${2 * r}</b> birim.` : ""}<br><span class="muted">A nerede olursa olsun merkeze uzaklığı ${r} birim.</span>`;
      el.querySelector("[data-v]").textContent = r;
    }
    let drag = false;
    host.addEventListener("pointerdown", (ev) => { if (!ev.target.classList?.contains("nl-knob")) return; drag = true; host.setPointerCapture(ev.pointerId); });
    host.addEventListener("pointermove", (ev) => { if (!drag) return; const p = svgPoint(host.querySelector("svg"), ev); al = ((Math.round((Math.atan2(O[1] - p.y, p.x - O[0]) * 180) / Math.PI / 10) * 10) + 360) % 360; draw(); changed(); });
    host.addEventListener("pointerup", () => { drag = false; });
    el.querySelector("input[data-k]").addEventListener("input", (e) => { r = +e.target.value; draw(); changed(); });
    draw();
    return () => ({ r, cap: 2 * r });
  });

  // ---------- c-torba: torbadan top çekme ve olasılık çizelgesi ----------
  // cfg: { kirmizi: 3, yesil: 3 }
  reg("c-torba", (el, cfg, changed) => {
    const st = { k: cfg.kirmizi ?? 3, y: cfg.yesil ?? 3 }, tally = { k: 0, y: 0 };
    let last = "";
    el.innerHTML = `<div class="plane-wrap"><div class="sc-ph"></div><div class="plane-ctrl">${slider("Kırmızı top", "k", 0, 10, 1, st.k)}${slider("Yeşil top", "y", 0, 10, 1, st.y)}
      <div class="sc-row"><button type="button" class="sc-btn pri" data-n="1">1 top çek</button><button type="button" class="sc-btn" data-n="20">20 kez çek</button></div><p class="sc-out sc-tl" aria-live="polite"></p></div></div>
      <div class="sc-sc"></div><p class="sc-msg" aria-live="polite"></p>`;
    const word = (p) => (p === 0 ? "imkânsız" : p === 1 ? "kesin" : p === 0.5 ? "eşit olasılıklı" : p < 0.5 ? "az olası" : "çok olası");
    function draw() {
      const n = st.k + st.y, p = n ? st.k / n : null;
      const svg = svgEl("svg", { viewBox: "0 0 300 240", class: "sim-svg", role: "img", "aria-label": `Torbada ${st.k} kırmızı, ${st.y} yeşil top` });
      svgEl("path", { d: "M70,40 Q40,40 40,90 L40,200 Q40,230 80,230 L220,230 Q260,230 260,200 L260,90 Q260,40 230,40 Z", class: "sc-bag" }, svg);
      const balls = [...Array(st.k).fill("r"), ...Array(st.y).fill("g")];
      balls.forEach((c, i) => svgEl("circle", { cx: 72 + (i % 6) * 31, cy: 205 - Math.floor(i / 6) * 31, r: 13, class: `sc-ball ${c}` }, svg));
      el.querySelector(".sc-ph").replaceChildren(svg);
      const sc = svgEl("svg", { viewBox: "0 0 400 90", class: "sim-svg", role: "img", "aria-label": "Olasılık çizelgesi" });
      const X = (v) => 12 + v * 376;
      svgEl("line", { x1: X(0), y1: 40, x2: X(1), y2: 40, class: "sc-scale" }, sc);
      [[0, "0 imkânsız"], [0.5, "1/2 eşit olasılıklı"], [1, "1 kesin"]].forEach(([v, t]) => { svgEl("line", { x1: X(v), x2: X(v), y1: 30, y2: 50, class: "sc-scale" }, sc); txt(sc, { x: X(v), y: 72, class: "sc-lab m", style: `font-size:14px;${v === 0 ? "text-anchor:start" : v === 1 ? "text-anchor:end" : ""}` }, t); });
      txt(sc, { x: X(0.25), y: 22, class: "sc-lab m", style: "font-size:14px" }, "az olası"); txt(sc, { x: X(0.75), y: 22, class: "sc-lab m", style: "font-size:14px" }, "çok olası");
      if (p !== null) svgEl("circle", { cx: X(p), cy: 40, r: 11, class: "sc-mark" }, sc);
      el.querySelector(".sc-sc").replaceChildren(sc);
      el.querySelector(".sc-msg").textContent = p === null ? "Torba boş: önce top ekle." : `Kırmızı top çekmek ${word(p)}${p > 0 && p < 1 ? ` (${n} toptan ${ek(st.k, "i")} kırmızı)` : ""}.`;
      el.querySelector(".sc-tl").innerHTML = `${last ? `Son çekilen: <b>${last}</b> · ` : ""}Kırmızı ${tally.k}, yeşil ${tally.y} kez çıktı.<br><span class="muted" style="font-size:13px">Çekilen top torbaya geri konur.</span>`;
      el.querySelectorAll("[data-v]").forEach((b) => { b.textContent = st[b.dataset.v]; });
      el.querySelectorAll("[data-n]").forEach((b) => { b.disabled = !n; });
    }
    el.querySelectorAll("input[data-k]").forEach((inp) => inp.addEventListener("input", () => { st[inp.dataset.k] = +inp.value; tally.k = tally.y = 0; last = ""; draw(); changed(); }));
    el.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { const n = st.k + st.y; for (let i = 0; i < +b.dataset.n; i++) { const red = Math.random() * n < st.k; tally[red ? "k" : "y"]++; last = red ? "kırmızı" : "yeşil"; } draw(); changed(); }));
    draw();
    return () => { const n = st.k + st.y; return { kirmizi: st.k, yesil: st.y, p: n ? st.k / n : -1, cekilis: tally.k + tally.y }; };
  });

  // ---------- c-yuvarla: sayı doğrusunda en yakın onluğa/yüzlüğe yuvarlama ----------
  // cfg: { alt: 3400, ust: 3500, deger: 3420, adim: 10 }
  reg("c-yuvarla", (el, cfg, changed) => {
    const A = cfg.alt ?? 40, U = cfg.ust ?? 50, step = cfg.adim ?? 1, birim = U - A, ad = birim === 10 ? "onluğa" : birim === 100 ? "yüzlüğe" : birim === 1000 ? "binliğe" : `${birim}'lük`;
    let v = cfg.deger ?? A;
    const W = 480, L = 40, R = 440, Y = 80, X = (x) => L + ((x - A) / birim) * (R - L);
    el.innerHTML = `<div class="sc-ph"></div>${slider("Sayı", "v", A, U, step, v)}<p class="sc-msg" aria-live="polite"></p>`;
    function draw() {
      const svg = svgEl("svg", { viewBox: `0 0 ${W} 140`, class: "sim-svg", role: "img", "aria-label": `${v} sayısı ${A} ile ${U} arasında` });
      svgEl("line", { x1: L - 20, y1: Y, x2: R + 20, y2: Y, class: "nl-axis" }, svg);
      for (let k = 0; k <= 10; k++) { const x = A + (birim * k) / 10; svgEl("line", { x1: X(x), x2: X(x), y1: Y - (k % 5 ? 7 : 14), y2: Y + (k % 5 ? 7 : 14), class: k % 5 ? "nl-minor" : "nl-major" }, svg); }
      [[A, grp(A)], [(A + U) / 2, grp((A + U) / 2)], [U, grp(U)]].forEach(([x, t], i) => txt(svg, { x: X(x), y: Y + 38, class: i === 1 ? "sc-lab m" : "nl-num", style: "font-size:16px" }, t));
      const near = v - A < U - v ? A : U;
      svgEl("line", { x1: X(v), y1: Y - 30, x2: X(near), y2: Y - 30, class: "sc-edge", style: "stroke:var(--good)" }, svg);
      svgEl("circle", { cx: X(v), cy: Y, r: 11, class: "sc-mark" }, svg);
      txt(svg, { x: X(v), y: Y - 40, class: "sc-lab big" }, grp(v));
      el.querySelector(".sc-ph").replaceChildren(svg);
      const dA = v - A, dU = U - v, res = dA < dU ? A : U;
      el.querySelector(".sc-msg").textContent = `${grp(v)} sayısının ${grp(A)} ile uzaklığı ${dA}, ${grp(U)} ile uzaklığı ${dU}. ${dA === dU ? `Tam ortada: kural gereği büyük olana, ${grp(U)}` : `Daha yakın olan ${grp(res)}`}. En yakın ${ad} yuvarlanınca ${grp(res)} olur.`;
      el.querySelector("[data-v]").textContent = grp(v);
    }
    el.querySelector("input[data-k]").addEventListener("input", (e) => { v = +e.target.value; draw(); changed(); });
    draw();
    return () => ({ deger: v, sonuc: v - A < U - v ? A : U });
  });
})();
