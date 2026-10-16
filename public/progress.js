// Öğrencinin kendi verisinden türeyen göstergeler: geri sayım, seri, rozet, rekor, hata defteri, haftalık özet.
// Saf fonksiyonlar; veri yalnız app.js'teki localStorage kaydından gelir. Sahte puan ya da başka öğrenci verisi yoktur.
window.PROGRESS = (() => {
  const A = window.ACADEMIA, E = window.ENGINE;
  const DAY = 86400000;
  const EXAM_WEEK_DAYS = 14;

  const sod = (t) => { const x = new Date(t); x.setHours(0, 0, 0, 0); return x.getTime(); };
  const dayKey = (t) => { const x = new Date(t); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
  const parseDay = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d).getTime(); };
  const dayDiff = (a, b) => Math.round((sod(b) - sod(a)) / DAY);

  // ---------- Geri sayım (yalnız data.js'teki resmî takvim) ----------
  function countdown(examId, now = Date.now()) {
    const cal = A.examCalendar, list = cal && cal.sessions[examId];
    if (!list) return null;
    const today = sod(now);
    const sorted = [...list].sort((x, y) => (x.date < y.date ? -1 : 1));
    const next = sorted.find((s) => parseDay(s.date) >= today);
    const src = cal.source;
    if (!next) return { pending: true, last: sorted[sorted.length - 1] || null, src };
    const days = dayDiff(today, parseDay(next.date));
    return { pending: false, name: next.name, date: parseDay(next.date), time: next.time || null, days, examWeek: days <= EXAM_WEEK_DAYS, src: next.src ? { ...src, url: next.src } : src };
  }
  const fmtDate = (t) => new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(t));

  // ---------- Günlük özet ve seri ----------
  function byDay(attempts) {
    const m = new Map();
    for (const a of attempts) {
      const k = dayKey(a.t);
      const v = m.get(k) || { n: 0, k: 0, t: sod(a.t) };
      v.n++; if (a.correct) v.k++;
      m.set(k, v);
    }
    return m;
  }

  function streaks(attempts, now = Date.now()) {
    const days = [...byDay(attempts).values()].map((v) => v.t).sort((a, b) => a - b);
    let longest = 0, run = 0, prev = null;
    for (const t of days) {
      run = prev !== null && dayDiff(prev, t) === 1 ? run + 1 : 1;
      longest = Math.max(longest, run); prev = t;
    }
    // Güncel seri bugün ya da dün biten seridir; dün de çalışılmadıysa sıfırdır.
    const gap = prev === null ? Infinity : dayDiff(prev, now);
    return { longest, current: gap <= 1 ? run : 0, activeToday: gap === 0, days: days.length };
  }

  // ---------- Hata defteri ----------
  const PATTERNS = [
    ["olumsuz", "Olumsuz kök", (q) => /(değildir|yanlıştır|olamaz|söylenemez|bulunmaz)\s*\?\s*$/i.test(q.split("\n")[0].trim()) || /\b(NOT|EXCEPT)\b/.test(q)],
    ["en", "“En olası / en sık / en uygun” kökü", (q) => /\ben (olası|sık|uygun|yakın)\b/i.test(q)],
    ["oncul", "Numaralı cümle ya da öncül", (q) => /\(I\)|\n\s*I[.)]\s/.test(q)],
    ["sayi", "Sayı, süre ya da yaş soran", (q) => /\b(kaç|ne kadar)\b/i.test(q)],
  ];
  const patternOf = (item) => { for (const [id, label, test] of PATTERNS) if (test(item.q)) return { id, label }; return { id: "diger", label: "Kalıp bulunamadı" }; };

  function errorBook(exam, attempts) {
    const bank = new Map(exam.items.map((i) => [i.id, i]));
    const last = new Map(), wrongs = new Map(), why = new Map(), chosen = new Map();
    for (const a of attempts) {
      if (!bank.has(a.id)) continue;
      last.set(a.id, a);
      if (!a.correct) { wrongs.set(a.id, (wrongs.get(a.id) || 0) + 1); if (a.why) why.set(a.id, a.why); if (a.ch !== undefined) chosen.set(a.id, a.ch); }
    }
    const open = [];
    for (const [id, a] of last) if (!a.correct) open.push({ item: bank.get(id), wrong: wrongs.get(id) || 1, why: why.get(id) || null, chosen: chosen.has(id) ? chosen.get(id) : null, lastT: a.t, skipped: !!a.skipped });
    open.sort((x, y) => y.lastT - x.lastT);
    return { open, everWrong: wrongs.size, cleared: [...wrongs.keys()].filter((id) => last.get(id).correct).length };
  }

  function groupErrors(open, by) {
    const groups = new Map();
    for (const e of open) {
      const key = by === "kalip" ? patternOf(e.item).label : by === "neden" ? (e.why || (e.skipped ? "Boş bırakılan" : "Neden işaretlenmedi")) : e.item.alan;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    const tail = new Set(["Kalıp bulunamadı", "Neden işaretlenmedi"]);
    return [...groups.entries()].sort((x, y) => (tail.has(x[0]) ? 1 : 0) - (tail.has(y[0]) ? 1 : 0) || y[1].length - x[1].length || (x[0] < y[0] ? -1 : 1));
  }

  // ---------- Rekorlar ve haftalık seri ----------
  function records(data, now = Date.now()) {
    const days = [...byDay(data.attempts).values()];
    const bestDay = days.reduce((b, v) => (!b || v.k > b.k ? v : b), null);
    const st = streaks(data.attempts, now);
    const dn = (data.denemeler || []).filter((x) => x.n);
    const bestDeneme = dn.reduce((b, x) => (!b || x.k / x.n > b.k / b.n || (x.k / x.n === b.k / b.n && x.n > b.n) ? x : b), null);
    return { bestDay: bestDay && bestDay.k ? bestDay : null, longest: st.longest, current: st.current, bestDeneme };
  }

  // Bugünle biten 7 günlük dilimler; [0] bu hafta, [1] geçen hafta...
  function weeks(attempts, count = 8, now = Date.now()) {
    const end = sod(now) + DAY;
    const out = Array.from({ length: count }, (_, i) => ({ from: end - (i + 1) * 7 * DAY, to: end - i * 7 * DAY, n: 0, k: 0, days: new Set() }));
    for (const a of attempts) {
      const i = Math.floor((end - 1 - a.t) / (7 * DAY));
      if (i >= 0 && i < count) { out[i].n++; if (a.correct) out[i].k++; out[i].days.add(dayKey(a.t)); }
    }
    return out.map((w) => ({ ...w, days: w.days.size }));
  }

  // ---------- Rozetler ----------
  function fullWeek(attempts, budget) {
    const m = byDay(attempts);
    const ok = [...m.values()].filter((v) => v.n >= budget).map((v) => v.t).sort((a, b) => a - b);
    let run = 0, prev = null, best = 0;
    for (const t of ok) { run = prev !== null && dayDiff(prev, t) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = t; }
    return best;
  }

  function badgeList(examId, data, d) {
    const exam = A.exams[examId];
    const n = data.attempts.length;
    const st = streaks(data.attempts);
    const eb = errorBook(exam, data.attempts);
    const dn = data.denemeler || [];
    const bestArea = Object.keys(d.sh).filter((a) => d.attemptsByAlan[a]).map((a) => [a, E.stats(d.mastery[a]).mean]).sort((x, y) => y[1] - x[1])[0];
    const unit = exam.levels ? "seviyede" : "alanda";
    const fw = fullWeek(data.attempts, data.budget);
    return [
      { id: "seri-3", icon: "3", title: "3 gün seri", how: "Arka arkaya 3 gün en az bir soru çöz.", ok: st.longest >= 3, prog: `${Math.min(st.longest, 3)}/3 gün` },
      { id: "seri-7", icon: "7", title: "7 gün seri", how: "Arka arkaya 7 gün en az bir soru çöz.", ok: st.longest >= 7, prog: `${Math.min(st.longest, 7)}/7 gün` },
      { id: "seri-30", icon: "30", title: "30 gün seri", how: "Arka arkaya 30 gün en az bir soru çöz.", ok: st.longest >= 30, prog: `${Math.min(st.longest, 30)}/30 gün` },
      { id: "soru-100", icon: "100", title: "İlk 100 soru", how: "Toplam 100 soru çöz.", ok: n >= 100, prog: `${Math.min(n, 100)}/100` },
      { id: "soru-500", icon: "500", title: "İlk 500 soru", how: "Toplam 500 soru çöz.", ok: n >= 500, prog: `${Math.min(n, 500)}/500` },
      { id: "usta-80", icon: "%80", title: exam.levels ? "Seviye ustası" : "Alan ustası", how: `Bir ${unit} ustalık tahminin %80'e ulaşsın.`, ok: !!bestArea && bestArea[1] >= 0.8, prog: bestArea ? `En iyi: ${bestArea[0]} %${Math.round(bestArea[1] * 100)}` : "Henüz veri yok" },
      { id: "deneme-1", icon: "D", title: "İlk kişisel deneme", how: "Bir kişisel denemeyi sonuna kadar çöz.", ok: dn.length >= 1, prog: `${Math.min(dn.length, 1)}/1` },
      { id: "deneme-tam", icon: "T", title: "Tam deneme", how: "Süreli tam denemeyi bitir.", ok: dn.some((x) => x.full), prog: dn.some((x) => x.full) ? "Tamam" : "Henüz yok" },
      { id: "hata-temiz", icon: "✓", title: "Temiz defter", how: "En az 3 yanlışını tekrar çözüp hata defterinde açık soru bırakma.", ok: eb.everWrong >= 3 && eb.open.length === 0, prog: `${eb.open.length} açık · ${eb.cleared} temizlendi` },
      { id: "plan-hafta", icon: "7/7", title: "Tam hafta", how: `Bir hafta boyunca her gün günlük hedefini (${data.budget} soru) tamamla.`, ok: fw >= 7, prog: `${Math.min(fw, 7)}/7 gün` },
    ];
  }

  // Kazanılan rozet bir kez kaydedilir; sonra koşul bozulsa da rozet kalır.
  function syncBadges(examId, data, d) {
    data.badges = data.badges || {};
    const list = badgeList(examId, data, d);
    const fresh = [];
    for (const b of list) {
      if (b.ok && !data.badges[b.id]) { data.badges[b.id] = { t: Date.now(), shown: !!data.sample }; }
      if (data.badges[b.id]) { b.ok = true; b.t = data.badges[b.id].t; if (!data.badges[b.id].shown) fresh.push(b); }
    }
    return { list, fresh };
  }

  // ---------- Haftalık özet (veli/kurum) ----------
  function weekReport(data, now = Date.now()) {
    const [cur, prev] = weeks(data.attempts, 2, now);
    const met = [...byDay(data.attempts).values()].filter((v) => v.t >= cur.from && v.n >= data.budget).length;
    const badges = Object.entries(data.badges || {}).filter(([, v]) => v.t >= cur.from).map(([id]) => id);
    const dn = (data.denemeler || []).filter((x) => x.t >= cur.from);
    return { cur, prev, met, badges, denemeler: dn };
  }

  function todayCount(attempts, now = Date.now()) {
    const s = sod(now);
    return attempts.filter((a) => a.t >= s).length;
  }

  return { DAY, EXAM_WEEK_DAYS, sod, dayKey, countdown, fmtDate, byDay, streaks, patternOf, errorBook, groupErrors, records, weeks, badgeList, syncBadges, weekReport, todayCount };
})();
