import { parseDate, weekday, daysInMonth, isLeapYear, addDays } from './dates';

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

export function birthdayInYear(person, y) {
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
  const age = person.year ? Number(date.slice(0, 4)) - person.year : null;
  return { date, age };
}

export function isBirthdayOn(person, d) {
  return birthdayInYear(person, Number(d.slice(0, 4))) === d;
}
