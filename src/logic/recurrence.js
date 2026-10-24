import { parseDate, weekday, daysInMonth, isLeapYear, addDays } from './dates';
import { hebrewFromDateStr, isHebLeap, monthLength, rdFromHebrew, dateStrFromRd } from './hebrew';

// ---------- Tasks ----------
// task.repeat = { type: 'none'|'daily'|'weekly'|'monthly', days?: number[] }

export function isRecurring(task) {
  return !!task.repeat && task.repeat.type !== 'none';
}

export function occursOn(task, d) {
  if (!task.date || task.status === 'cancelled') return false;
  const type = task.repeat?.type || 'none';
  if (type === 'none') return d === task.date;
  if (d < task.date) return false;
  if (task.until && d > task.until) return false;
  if (type === 'daily') return true;
  if (type === 'weekly') {
    const days = task.repeat.days?.length ? task.repeat.days : [weekday(task.date)];
    return days.includes(weekday(d));
  }
  if (type === 'monthly') {
    const start = parseDate(task.date).getDate();
    const dd = parseDate(d);
    // A day that doesn't exist in this month (e.g. the 31st) falls on the month's last day.
    const target = Math.min(start, daysInMonth(dd.getFullYear(), dd.getMonth()));
    return dd.getDate() === target;
  }
  return false;
}

export function isDoneOn(task, d) {
  if (isRecurring(task)) return (task.doneDates || []).includes(d);
  return task.status === 'done';
}

// Every occurrence date in [from, to] (inclusive).
export function occurrencesBetween(task, from, to) {
  const out = [];
  if (!task.date) return out;
  let d = from < task.date ? task.date : from;
  let guard = 0;
  while (d <= to && guard++ < 800) {
    if (occursOn(task, d)) out.push(d);
    if (!isRecurring(task)) break;
    d = addDays(d, 1);
  }
  return out;
}

// ---------- Birthdays ----------
// person = { day, month (1-12), year?, feb29: 'feb28'|'mar1' }

// Hebrew birth date of a person who celebrates by the Hebrew calendar (needs a birth year).
export function hebrewBirth(person) {
  if (!person.hebrew || !person.year) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return hebrewFromDateStr(`${person.year}-${pad(person.month)}-${pad(person.day)}`);
}

// The Hebrew-calendar birthday that falls in Gregorian year y.
function hebrewBirthdayInYear(hb, y) {
  for (const hy of [y + 3760, y + 3761]) {
    let m = hb.month;
    const bornLeapAdar = (m === 12 || m === 13) && isHebLeap(hb.year);
    if (m === 13 && !isHebLeap(hy)) m = 12; // Adar II → Adar in a regular year
    else if (m === 12 && bornLeapAdar && !isHebLeap(hy)) m = 12; // Adar I → Adar
    else if (m === 12 && !bornLeapAdar && isHebLeap(hy)) m = 13; // regular Adar → Adar II (common custom)
    const d = Math.min(hb.day, monthLength(hy, m));
    const ds = dateStrFromRd(rdFromHebrew(hy, m, d));
    if (Number(ds.slice(0, 4)) === y) return { date: ds, hy };
  }
  return null;
}

export function birthdayInYear(person, y) {
  const hb = hebrewBirth(person);
  if (hb) {
    const r = hebrewBirthdayInYear(hb, y);
    if (r) return r.date;
  }
  let m = person.month;
  let d = person.day;
  if (m === 2 && d === 29 && !isLeapYear(y)) {
    if (person.feb29 === 'mar1') { m = 3; d = 1; } else { d = 28; }
  }
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Next birthday on or after `from` (YYYY-MM-DD).
export function nextBirthday(person, from) {
  const y = Number(from.slice(0, 4));
  const thisYear = birthdayInYear(person, y);
  const date = thisYear >= from ? thisYear : birthdayInYear(person, y + 1);
  return { date, age: ageOn(person, date) };
}

// Age the person turns on a given birthday date.
export function ageOn(person, date) {
  if (!person.year) return null;
  const hb = hebrewBirth(person);
  if (hb) return hebrewFromDateStr(date).year - hb.year;
  return Number(date.slice(0, 4)) - person.year;
}

export function isBirthdayOn(person, d) {
  return birthdayInYear(person, Number(d.slice(0, 4))) === d;
}
