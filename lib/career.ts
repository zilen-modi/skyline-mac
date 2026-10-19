// Experience is counted from the role dates in data/portfolio.ts, up to today, so it never goes stale.

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// "Jul 2025" → months since year 0; "Present" → this month.
function parseMonth(s: string, now: Date) {
  if (/present/i.test(s)) return now.getFullYear() * 12 + now.getMonth();
  const [m, y] = s.trim().split(/\s+/);
  return Number(y) * 12 + MONTHS.indexOf(m.slice(0, 3).toLowerCase());
}

// "Aug 2023 – Jun 2025" → start, end and length in months (both ends inclusive).
export function tenure(period: string, now = new Date()) {
  const [a, b] = period.split(/\s*[–-]\s*/);
  const start = parseMonth(a, now);
  const end = parseMonth(b ?? "Present", now);
  return { start, end, months: end - start + 1 };
}

export const totalMonths = (periods: string[], now = new Date()) => periods.reduce((n, p) => n + tenure(p, now).months, 0);

// 45 → "3 yrs 9 mo"
export const formatMonths = (m: number) =>
  m >= 12 ? `${Math.floor(m / 12)} yr${m >= 24 ? "s" : ""}${m % 12 ? ` ${m % 12} mo` : ""}` : `${m} mo`;

// 45 → "3.7+" (rounded down, so it never overstates)
export const yearsPlus = (m: number) => `${Math.floor((m / 12) * 10) / 10}+`;
