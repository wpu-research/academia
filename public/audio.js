// Müzik stüdyosu: Web Audio ile sentezlenen davul sesleri, ritim makinesi ve iki desteli DJ mikseri.
// Ses dosyası yok; her ses tarayıcıda üretilir. Zamanlama ses saatine göre önceden planlanır.
window.AUDIO = (() => {
  let ctx = null, master = null, noiseBuf = null;
  const running = new Set();

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.8;
      const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function env(g, t, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function noise(t, dur, out, type, freq, peak) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain(); env(g, t, peak, dur);
    s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + dur + 0.05);
  }
  const VOICES = {
    kick(t, out) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); env(g, t, 1, 0.45); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.5); },
    snare(t, out) { noise(t, 0.18, out, "highpass", 1200, 0.5); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.value = 190; env(g, t, 0.35, 0.1); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.15); },
    hat(t, out) { noise(t, 0.05, out, "highpass", 7500, 0.28); },
    clap(t, out) { [0, 0.012, 0.024].forEach((dt) => noise(t + dt, 0.09, out, "bandpass", 1600, 0.45)); },
    bass(t, out, freq, dur) {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.value = freq; f.type = "lowpass"; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(220, t + dur);
      env(g, t, 0.35, dur); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
    },
  };

  // Ses saatine göre önceden planlama: her 25 ms'de bir, önümüzdeki 0,12 sn'deki notalar kuyruğa alınır.
  function scheduler(tick) {
    const job = { id: null };
    job.id = setInterval(() => tick(ctx.currentTime + 0.12), 25);
    running.add(job);
    return () => { clearInterval(job.id); running.delete(job); };
  }
  function stopAll() { for (const j of running) clearInterval(j.id); running.clear(); document.querySelectorAll("[data-audio-playing]").forEach((b) => b.removeAttribute("data-audio-playing")); }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Ritim makinesi ----------
  const ROWS = [["kick", "Bas davul"], ["snare", "Trampet"], ["hat", "Zil"], ["clap", "El çırpma"]];
  function rhythm(el, cfg, changed) {
    const grid = Object.fromEntries(ROWS.map(([k]) => [k, Array(16).fill(false)]));
    for (const [k, steps] of Object.entries(cfg.pattern || {})) steps.forEach((i) => (grid[k][i] = true));
    let bpm = cfg.bpm ?? 100, playing = false, stop = null, step = 0, nextT = 0, plays = 0;
    const queue = [];
    el.innerHTML = `<div class="rm">
      <div class="rm-top"><button type="button" class="btn btn-primary btn-small rm-play">▶ Çal</button>
        <label class="sim-slider rm-bpm"><span>Tempo: <b class="rm-bv">${bpm}</b> BPM</span><input type="range" min="60" max="160" step="1" value="${bpm}"></label>
        <button type="button" class="btn btn-outline btn-small rm-clear">Temizle</button></div>
      <div class="rm-grid" role="grid" aria-label="Ritim ızgarası">${ROWS.map(([k, l]) => `<div class="rm-row" role="row"><span class="rm-name">${l}</span>${grid[k].map((on, i) => `<button type="button" role="gridcell" class="rm-cell${on ? " on" : ""}${i % 4 === 0 ? " beat" : ""}" data-k="${k}" data-i="${i}" aria-pressed="${on}" aria-label="${l}, ${Math.floor(i / 4) + 1}. vuruş, ${(i % 4) + 1}. bölüm"></button>`).join("")}</div>`).join("")}
        <div class="rm-row rm-count" aria-hidden="true"><span class="rm-name"></span>${[...Array(16)].map((_, i) => `<span class="rm-n">${i % 4 === 0 ? i / 4 + 1 : "·"}</span>`).join("")}</div></div>
      <p class="note rm-note">16 kutu = 1 ölçü = 4 vuruş. Kalın çizgili kutular vuruş başlarıdır.</p></div>`;
    const playBtn = el.querySelector(".rm-play");
    el.querySelectorAll(".rm-cell").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.k, i = +b.dataset.i; grid[k][i] = !grid[k][i];
      b.classList.toggle("on", grid[k][i]); b.setAttribute("aria-pressed", grid[k][i]);
      if (grid[k][i]) { ensure(); VOICES[k](ctx.currentTime + 0.01, master); }
      changed();
    }));
    el.querySelector(".rm-clear").addEventListener("click", () => { ROWS.forEach(([k]) => grid[k].fill(false)); el.querySelectorAll(".rm-cell").forEach((b) => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); }); changed(); });
    el.querySelector(".rm-bpm input").addEventListener("input", (e) => { bpm = +e.target.value; el.querySelector(".rm-bv").textContent = bpm; changed(); });
    function light() {
      if (!playing) return;
      while (queue.length && queue[0].t <= ctx.currentTime) { const q = queue.shift(); el.querySelectorAll(".rm-cell.cur").forEach((c) => c.classList.remove("cur")); el.querySelectorAll(`.rm-cell[data-i="${q.i}"]`).forEach((c) => c.classList.add("cur")); }
      requestAnimationFrame(light);
    }
    playBtn.addEventListener("click", () => {
      ensure();
      if (playing) { playing = false; stop && stop(); playBtn.textContent = "▶ Çal"; el.querySelectorAll(".rm-cell.cur").forEach((c) => c.classList.remove("cur")); changed(); return; }
      playing = true; plays++; step = 0; nextT = ctx.currentTime + 0.06; playBtn.textContent = "■ Durdur"; playBtn.dataset.audioPlaying = "1";
      stop = scheduler((until) => {
        while (nextT < until) {
          ROWS.forEach(([k]) => grid[k][step] && VOICES[k](nextT, master));
          queue.push({ t: nextT, i: step });
          nextT += 60 / bpm / 4; step = (step + 1) % 16;
        }
      });
      const origStop = stop; stop = () => { origStop(); playing = false; };
      requestAnimationFrame(light); changed();
    });
    const on = (k, steps) => steps.every((i) => grid[k][i]);
    const only = (k, steps) => grid[k].every((v, i) => v === steps.includes(i));
    return () => ({
      bpm, plays,
      kicks: grid.kick.filter(Boolean).length,
      fourFloor: only("kick", [0, 4, 8, 12]) ? 1 : 0,
      backbeat: on("snare", [4, 12]) || on("clap", [4, 12]) ? 1 : 0,
      eighthHats: on("hat", [0, 2, 4, 6, 8, 10, 12, 14]) ? 1 : 0,
    });
  }

  // ---------- İki desteli mikser ----------
  const RIFFS = { A: [55, 55, 65.41, 55, 73.42, 55, 65.41, 49], B: [49, 61.74, 49, 73.42, 49, 61.74, 82.41, 73.42] };
  function mixer(el, cfg, changed) {
    const decks = ["A", "B"].map((name, n) => ({
      name, bpm: cfg.bpm?.[n] ?? (n ? 126 : 120), base: cfg.bpm?.[n] ?? (n ? 126 : 120), vol: 0.8, eq: { low: 0, mid: 0, high: 0 },
      playing: false, stop: null, nextT: 0, step: 0, beats: [], nodes: null, lastBeat: null,
    }));
    let xf = cfg.xf ?? 0.5, everBoth = false;
    function graph(d) {
      ensure();
      if (d.nodes) return d.nodes;
      const input = ctx.createGain(), low = ctx.createBiquadFilter(), mid = ctx.createBiquadFilter(), high = ctx.createBiquadFilter(), vol = ctx.createGain(), xg = ctx.createGain();
      low.type = "lowshelf"; low.frequency.value = 220; mid.type = "peaking"; mid.frequency.value = 1000; mid.Q.value = 0.8; high.type = "highshelf"; high.frequency.value = 4000;
      input.connect(low); low.connect(mid); mid.connect(high); high.connect(vol); vol.connect(xg); xg.connect(master);
      d.nodes = { input, low, mid, high, vol, xg }; apply(d); return d.nodes;
    }
    function apply(d) {
      if (!d.nodes) return;
      d.nodes.low.gain.value = d.eq.low; d.nodes.mid.gain.value = d.eq.mid; d.nodes.high.gain.value = d.eq.high; d.nodes.vol.gain.value = d.vol;
      const x = d.name === "A" ? Math.cos(xf * Math.PI / 2) : Math.sin(xf * Math.PI / 2); d.nodes.xg.gain.value = x;
    }
    el.innerHTML = `<div class="dj">${decks.map((d) => `<div class="dj-deck" data-d="${d.name}">
        <div class="dj-head"><b>Deste ${d.name}</b><span class="dj-bpm num">${d.bpm.toFixed(1)} BPM</span></div>
        <div class="dj-lights">${[0, 1, 2, 3].map((i) => `<i data-l="${i}"></i>`).join("")}</div>
        <div class="dj-btns"><button type="button" class="btn btn-primary btn-small dj-play">▶ Çal</button><button type="button" class="btn btn-outline btn-small dj-nudge" data-n="-1" aria-label="Geri it">◀ Geri it</button><button type="button" class="btn btn-outline btn-small dj-nudge" data-n="1" aria-label="İleri it">İleri it ▶</button></div>
        <label class="sim-slider"><span>Tempo</span><input type="range" class="dj-tempo" min="-8" max="8" step="0.1" value="0"></label>
        <label class="sim-slider"><span>Ses</span><input type="range" class="dj-vol" min="0" max="1" step="0.01" value="${d.vol}"></label>
        <div class="dj-eq">${["high", "mid", "low"].map((b) => `<label class="sim-slider"><span>${{ high: "Tiz", mid: "Orta", low: "Bas" }[b]}: <b data-eq="${b}">0 dB</b></span><input type="range" class="dj-eqr" data-b="${b}" min="-24" max="6" step="1" value="0"></label>`).join("")}</div>
      </div>`).join("")}
      <div class="dj-center"><div class="dj-phase"><span>Vuruş farkı</span><b class="num dj-off">–</b><div class="dj-meter"><i></i></div></div>
        <label class="sim-slider dj-xf"><span>Crossfader: <b class="dj-xv">A ◀▶ B</b></span><input type="range" min="0" max="1" step="0.01" value="${xf}"></label></div></div>`;
    const deckEl = (d) => el.querySelector(`.dj-deck[data-d="${d.name}"]`);
    function start(d) {
      const n = graph(d);
      d.playing = true; d.step = 0; d.nextT = ctx.currentTime + 0.06;
      const riff = RIFFS[d.name];
      d.stop = scheduler((until) => {
        while (d.nextT < until) {
          const t = d.nextT, s = d.step % 16, eighth = 60 / d.bpm / 2;
          if (s % 4 === 0) { VOICES.kick(t, n.input); d.beats.push(t); if (d.beats.length > 8) d.beats.shift(); }
          if (s % 4 === 2) VOICES.hat(t, n.input);
          if (d.name === "B" && (s === 4 || s === 12)) VOICES.clap(t, n.input);
          if (s % 2 === 0) VOICES.bass(t, n.input, riff[(s / 2) % riff.length], eighth * 0.9);
          d.nextT += 60 / d.bpm / 4; d.step++;
        }
      });
      const s0 = d.stop; d.stop = () => { s0(); d.playing = false; };
      if (decks.every((x) => x.playing)) everBoth = true;
    }
    decks.forEach((d) => {
      const de = deckEl(d);
      de.querySelector(".dj-play").addEventListener("click", (e) => {
        ensure();
        if (d.playing) { d.stop(); e.target.textContent = "▶ Çal"; } else { start(d); e.target.textContent = "■ Durdur"; e.target.dataset.audioPlaying = "1"; }
        changed();
      });
      de.querySelector(".dj-tempo").addEventListener("input", (e) => { d.bpm = Math.round(d.base * (1 + +e.target.value / 100) * 10) / 10; de.querySelector(".dj-bpm").textContent = `${d.bpm.toFixed(1)} BPM`; changed(); });
      de.querySelector(".dj-vol").addEventListener("input", (e) => { d.vol = +e.target.value; apply(d); changed(); });
      de.querySelectorAll(".dj-eqr").forEach((r) => r.addEventListener("input", () => { d.eq[r.dataset.b] = +r.value; de.querySelector(`[data-eq="${r.dataset.b}"]`).textContent = `${r.value} dB`; apply(d); changed(); }));
      de.querySelectorAll(".dj-nudge").forEach((b) => b.addEventListener("click", () => { if (d.playing) { d.nextT += +b.dataset.n * -0.025; d.beats = d.beats.map((t) => t + +b.dataset.n * -0.025); } changed(); }));
    });
    el.querySelector(".dj-xf input").addEventListener("input", (e) => { xf = +e.target.value; decks.forEach(apply); el.querySelector(".dj-xv").textContent = xf < 0.2 ? "A" : xf > 0.8 ? "B" : "A ◀▶ B"; changed(); });
    // Vuruş farkı: B'nin son vuruşunun, A'nın vuruş ızgarasına göre kayması (ms).
    function offset() {
      const [A, B] = decks;
      if (!A.playing || !B.playing || !A.beats.length || !B.beats.length || !ctx) return null;
      const per = 60 / A.bpm, tb = B.beats.filter((t) => t <= ctx.currentTime).pop();
      if (tb === undefined) return null;
      const ta = A.beats.filter((t) => t <= ctx.currentTime + per).reduce((best, t) => (Math.abs(t - tb) < Math.abs(best - tb) ? t : best), A.beats[0]);
      let off = ((tb - ta) % per + per) % per; if (off > per / 2) off -= per;
      return off * 1000;
    }
    let raf = 0;
    function ui() {
      if (!el.isConnected) return;
      decks.forEach((d) => {
        const de = deckEl(d), now = ctx ? ctx.currentTime : 0;
        const last = d.playing ? d.beats.filter((t) => t <= now).pop() : null;
        const idx = last !== undefined && last !== null ? Math.round((last - d.beats[0]) / (60 / d.bpm)) % 4 : -1;
        de.querySelectorAll(".dj-lights i").forEach((li, i) => li.classList.toggle("on", d.playing && i === ((idx % 4) + 4) % 4 && now - last < 0.15));
      });
      const off = offset(), ob = el.querySelector(".dj-off");
      ob.textContent = off === null ? "–" : `${off > 0 ? "+" : ""}${Math.round(off)} ms`;
      const m = el.querySelector(".dj-meter i");
      m.style.left = off === null ? "50%" : `${50 + Math.max(-50, Math.min(50, off / 4))}%`;
      el.querySelector(".dj-phase").classList.toggle("ok", off !== null && Math.abs(off) < 30 && Math.abs(decks[0].bpm - decks[1].bpm) < 0.3);
      raf = requestAnimationFrame(ui);
    }
    raf = requestAnimationFrame(ui);
    return () => {
      const off = offset(), [A, B] = decks;
      return {
        playingA: A.playing ? 1 : 0, playingB: B.playing ? 1 : 0, bothPlayed: everBoth ? 1 : 0,
        bpmDiff: Math.abs(A.bpm - B.bpm), synced: off !== null && Math.abs(off) < 30 && Math.abs(A.bpm - B.bpm) < 0.3 ? 1 : 0,
        lowB: B.eq.low, lowA: A.eq.low, xf,
      };
    };
  }

  if (window.LESSONS) { LESSONS.registerSim("ritim-makinesi", rhythm); LESSONS.registerSim("dj-mikser", mixer); }
  return { ensure, stopAll, rhythm, mixer };
})();
