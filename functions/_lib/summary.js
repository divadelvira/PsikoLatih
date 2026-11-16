// Compact per-user digest of the raw progress JSON string (shape: store.js in public/app.js). Never throws.
export function summarize(raw) {
  let p = null;
  try { p = JSON.parse(raw); } catch { /* null / invalid -> empty */ }
  if (!p || typeof p !== "object") p = {};
  const attempts = Array.isArray(p.attempts) ? p.attempts : [];
  const a = attempts[0];
  const num = (v) => (typeof v === "number" ? v : 0);
  const ts = [num(p.lastSeen), num(a?.ts)].filter(Boolean);
  return {
    sims: attempts.filter((x) => x?.kind === "simulasi").length,
    quizzes: Object.keys(p.quizBest && typeof p.quizBest === "object" ? p.quizBest : {}).length,
    last: a ? { title: a.title ?? "", pct: num(a.pct), ts: num(a.ts) } : null,
    kraepelin: Array.isArray(p.kraepelin) ? p.kraepelin.length : 0,
    personality: Object.keys(p.personality && typeof p.personality === "object" ? p.personality : {}),
    lastActive: ts.length ? Math.max(...ts) : null,
  };
}
