// Date helpers. Dates are stored as local "YYYY-MM-DD" strings and times as "HH:MM".
// All reminders follow the phone's local wall clock (see spec section 4).

const pad = (n) => String(n).padStart(2, '0');

export function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayStr(now = new Date()) {
  return toDateStr(now);
}

export function addDays(s, n) {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export function addMonths(year, month0, n) {
  const d = new Date(year, month0 + n, 1);
  return { year: d.getFullYear(), month0: d.getMonth() };
}

export function weekday(s) {
  return parseDate(s).getDay(); // 0 = Sunday
}

export function daysInMonth(year, month0) {
  return new Date(year, month0 + 1, 0).getDate();
}

export function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function diffDays(a, b) {
  // whole days from a to b (b - a)
  const ms = parseDate(b).getTime() - parseDate(a).getTime();
  return Math.round(ms / 86400000);
}

export function combine(dateStr, timeStr) {
  const d = parseDate(dateStr);
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

export function timeStr(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isValidTime(t) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t || '');
}
