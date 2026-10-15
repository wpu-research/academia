// HMGS öğrenme motorunun tarayıcı sürümü (HMGS/portal/src/lib/engine + plan'dan aktarıldı).
// Saf fonksiyonlar; durum app.js'te tutulur.

window.ENGINE = (() => {
  const PRIOR = { alpha: 2, beta: 2 };
  const WEAK_MEAN = 0.6;
  const RECENT_WINDOW = 10;
  const DAY = 86400000;

  // Güven: 1 düşük, 2 orta, 3 yüksek (cevaptan önce verilir).
  function evidenceWeight(correct, confidence) {
    if (correct) return confidence === 1 ? 0.5 : 1;
    return confidence === 3 ? 1.5 : 1;
  }

  function updateMastery(cur, correct, confidence) {
    const w = evidenceWeight(correct, confidence);
    return correct ? { alpha: cur.alpha + w, beta: cur.beta } : { alpha: cur.alpha, beta: cur.beta + w };
  }

  function stats(b) {
    const sum = b.alpha + b.beta;
    const mean = b.alpha / sum;
    const sd = Math.sqrt((b.alpha * b.beta) / (sum * sum * (sum + 1)));
    const n = Math.max(0, Math.round((sum - (PRIOR.alpha + PRIOR.beta)) * 10) / 10);
    return { mean, sd, n };
  }

  const weakness = (b) => { const s = stats(b); return 1 - s.mean + s.sd; };

  function shares(blueprint) {
    const tot = Object.values(blueprint).reduce((a, b) => a + b, 0);
    return Object.fromEntries(Object.entries(blueprint).map(([k, v]) => [k, v / tot]));
  }

  // En büyük kalan yöntemiyle kota; alan başına mevcut soru sayısı üst sınırdır.
  function allocateQuota(sh, total, available) {
    const alans = Object.keys(sh).filter((a) => sh[a] > 0 && (available[a] || 0) > 0);
    const out = Object.fromEntries(alans.map((a) => [a, 0]));
    let remaining = Math.min(total, alans.reduce((n, a) => n + available[a], 0));
    while (remaining > 0) {
      const act = alans.filter((a) => out[a] < available[a]);
      const sum = act.reduce((n, a) => n + sh[a], 0);
      const exact = act.map((a) => ({ a, x: (sh[a] / sum) * remaining }));
      let given = 0;
      for (const { a, x } of exact) {
        const add = Math.min(Math.floor(x), available[a] - out[a]);
        out[a] += add; given += add;
      }
      const byRem = exact.sort((p, q) => (q.x % 1) - (p.x % 1) || (p.a < q.a ? -1 : 1));
      for (const { a } of byRem) {
        if (given >= remaining) break;
        if (out[a] < available[a]) { out[a]++; given++; }
      }
      remaining -= given;
    }
    return out;
  }

  // Seçim nedenleri öğrenciye gösterilir.
  const REASONS = {
    tekrar: "Tekrar zamanı gelmiş",
    tani: "Seviye tespiti",
    zayif: "Zayıf alanından",
    kota: "Sınavdaki payı yüksek, az çözdüğün alan",
    yeni: "Henüz görmediğin soru",
  };

  function selectNext({ mode, items, recent, answered, due, mastery, attemptsByAlan, sh, diagRemaining, now }) {
    const rnd = (l) => l[Math.floor(Math.random() * l.length)];
    const recentSet = new Set(recent.slice(0, RECENT_WINDOW));
    const pool = items.filter((i) => !recentSet.has(i.id));
    const pick = (list) => { const f = list.filter((i) => !answered.has(i.id)); return rnd(f.length ? f : list); };

    if (mode === "tani") {
      const dpool = items.filter((i) => !answered.has(i.id));
      const alans = [...new Set(dpool.map((i) => i.alan))]
        .filter((a) => (diagRemaining[a] || 0) > 0)
        .sort((a, b) => diagRemaining[b] - diagRemaining[a] || (a < b ? -1 : 1));
      if (!alans.length) return null;
      return { item: pick(dpool.filter((i) => i.alan === alans[0])), reason: "tani" };
    }

    const dueIds = Object.entries(due).filter(([, t]) => t <= now).sort((a, b) => a[1] - b[1]).map(([id]) => id);
    for (const id of dueIds) {
      const it = pool.find((i) => i.id === id);
      if (it) return { item: it, reason: "tekrar" };
    }
    if (!pool.length) return null;

    const weak = [...new Set(pool.map((i) => i.alan))]
      .filter((a) => (attemptsByAlan[a] || 0) > 0 && mastery[a] && stats(mastery[a]).mean < WEAK_MEAN)
      .sort((a, b) => weakness(mastery[b]) - weakness(mastery[a]) || (a < b ? -1 : 1));
    if (weak.length) {
      const inWeak = pool.filter((i) => i.alan === weak[0]);
      return { item: pick(inWeak), reason: "zayif" };
    }

    const fresh = pool.filter((i) => !answered.has(i.id));
    if (fresh.length) {
      const total = Object.values(attemptsByAlan).reduce((a, b) => a + b, 0);
      const gap = (a) => (sh[a] || 0) - (total ? (attemptsByAlan[a] || 0) / total : 0);
      const alans = [...new Set(fresh.map((i) => i.alan))].sort((a, b) => gap(b) - gap(a) || (a < b ? -1 : 1));
      return { item: pick(fresh.filter((i) => i.alan === alans[0])), reason: (attemptsByAlan[alans[0]] || 0) ? "kota" : "yeni" };
    }

    const score = (a) => (mastery[a] ? weakness(mastery[a]) : 0.5);
    const alans = [...new Set(pool.map((i) => i.alan))].sort((a, b) => score(b) - score(a));
    return { item: pick(pool.filter((i) => i.alan === alans[0])), reason: "zayif" };
  }

  // Basit tekrar aralığı: yanlış → 1 gün, doğru → önceki aralığın 2,5 katı (en az 3 gün).
  function nextInterval(prevDays, correct) {
    if (!correct) return 1;
    return Math.max(3, Math.round((prevDays || 1) * 2.5));
  }

  // Plan önceliği: sınavdaki pay × (1 − ustalık). Veri yoksa ustalık 0,5 kabul edilir.
  function rankAreas(sh, mastery, attemptsByAlan) {
    return Object.keys(sh)
      .map((a) => {
        const m = mastery[a] && attemptsByAlan[a] ? stats(mastery[a]).mean : null;
        return { alan: a, share: sh[a], mean: m, attempts: attemptsByAlan[a] || 0, score: sh[a] * (1 - (m ?? 0.5)) };
      })
      .sort((x, y) => y.score - x.score || (x.alan < y.alan ? -1 : 1));
  }

  // Tekrar takvimi: bütçeyi aşan tekrarlar ertesi güne kayar; boş kapasite yeni çalışmaya ayrılır.
  function buildSchedule(dueTimes, today, budget, horizon = 14) {
    const raw = new Array(horizon).fill(0);
    for (const t of dueTimes) {
      const off = Math.max(0, Math.round((t - today) / DAY));
      if (off < horizon) raw[off]++;
    }
    const days = [];
    let carry = 0;
    for (let i = 0; i < horizon; i++) {
      const load = raw[i] + carry;
      const planned = Math.min(load, budget);
      days.push({ offset: i, planned, carriedOut: load - planned, spare: budget - planned });
      carry = load - planned;
    }
    return { days, overflow: carry };
  }

  // Wilson %95 aralığı (deneme sonucu için, puan tahmini değil).
  function wilson(k, n) {
    if (!n) return [0, 0];
    const z = 1.96, p = k / n;
    const d = 1 + (z * z) / n;
    const c = (p + (z * z) / (2 * n)) / d;
    const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
    return [Math.max(0, c - h), Math.min(1, c + h)];
  }

  return { PRIOR, WEAK_MEAN, DAY, REASONS, updateMastery, stats, weakness, shares, allocateQuota, selectNext, nextInterval, rankAreas, buildSchedule, wilson };
})();
