// Logic tests. Run with: npx tsx tests/logic.test.js
import { occursOn, occurrencesBetween, birthdayInYear, nextBirthday, isDoneOn } from '../src/logic/recurrence';
import { buildPlan, MAX_SCHEDULED, planSignature } from '../src/logic/scheduler';
import { makeT, makeFormat } from '../src/i18n';
import { addDays, diffDays } from '../src/logic/dates';

let passed = 0, failed = 0;
function eq(name, a, b) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) passed++; else { failed++; console.log(`FAIL ${name}: got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`); }
}
const t = makeT('he');

// --- recurrence ---
const daily = { date: '2026-10-20', repeat: { type: 'daily' } };
eq('daily before start', occursOn(daily, '2026-10-19'), false);
eq('daily after start', occursOn(daily, '2026-10-25'), true);
const weekly = { date: '2026-10-20', repeat: { type: 'weekly', days: [0, 3] } }; // Sun, Wed
eq('weekly sun', occursOn(weekly, '2026-10-25'), true);
eq('weekly mon', occursOn(weekly, '2026-10-26'), false);
eq('weekly wed', occursOn(weekly, '2026-10-21'), true);
const monthly31 = { date: '2026-01-31', repeat: { type: 'monthly' } };
eq('monthly 31 in feb -> 28', occursOn(monthly31, '2026-02-28'), true);
eq('monthly 31 in apr -> 30', occursOn(monthly31, '2026-04-30'), true);
eq('monthly 31 in mar -> 31', occursOn(monthly31, '2026-03-31'), true);
eq('monthly 31 not on 30 mar', occursOn(monthly31, '2026-03-30'), false);
eq('once', occurrencesBetween({ date: '2026-10-22', repeat: { type: 'none' } }, '2026-10-01', '2026-10-30'), ['2026-10-22']);
eq('once out of range', occurrencesBetween({ date: '2026-09-22', repeat: { type: 'none' } }, '2026-10-01', '2026-10-30'), []);
eq('daily count', occurrencesBetween(daily, '2026-10-24', '2026-10-30').length, 7);
eq('recurring done per date', isDoneOn({ repeat: { type: 'daily' }, doneDates: ['2026-10-24'] }, '2026-10-24'), true);
eq('recurring not done other date', isDoneOn({ repeat: { type: 'daily' }, doneDates: ['2026-10-24'] }, '2026-10-25'), false);

// --- birthdays ---
const leap = { day: 29, month: 2, feb29: 'feb28' };
eq('feb29 -> feb28 2027', birthdayInYear(leap, 2027), '2027-02-28');
eq('feb29 -> mar1 2027', birthdayInYear({ ...leap, feb29: 'mar1' }, 2027), '2027-03-01');
eq('feb29 leap 2028', birthdayInYear(leap, 2028), '2028-02-29');
eq('next bday this year', nextBirthday({ day: 30, month: 10, year: 1990 }, '2026-10-24'), { date: '2026-10-30', age: 36 });
eq('next bday next year', nextBirthday({ day: 1, month: 1 }, '2026-10-24'), { date: '2027-01-01', age: null });
eq('next bday today', nextBirthday({ day: 24, month: 10 }, '2026-10-24').date, '2026-10-24');

// --- dates ---
eq('addDays across month', addDays('2026-10-31', 1), '2026-11-01');
eq('diffDays', diffDays('2026-10-24', '2026-11-03'), 10);
eq('addDays DST (Israel Oct 25 2026)', addDays('2026-10-24', 2), '2026-10-26');

// --- scheduler ---
const now = new Date(2026, 9, 24, 10, 0); // Oct 24 2026 10:00 local
const data = {
  settings: { defaultTime: '09:00', modules: { tasks: true, birthdays: true, shopping: true } },
  tasks: [
    { id: 'a', title: 'Past today', date: '2026-10-24', time: '08:00', status: 'open', repeat: { type: 'none' } },
    { id: 'b', title: 'Later today', date: '2026-10-24', time: '18:00', status: 'open', repeat: { type: 'none' } },
    { id: 'c', title: 'No time tomorrow', date: '2026-10-25', status: 'open', repeat: { type: 'none' } },
    { id: 'd', title: 'Done', date: '2026-10-26', time: '10:00', status: 'done', repeat: { type: 'none' } },
    { id: 'e', title: 'No date', status: 'open', repeat: { type: 'none' } },
  ],
  people: [{ id: 'p', name: 'Dana', day: 26, month: 10, year: 1990, time: '08:30', remindOnDay: true, remindDayBefore: true }],
  lists: [
    { id: 'l', title: 'Super', date: '2026-10-25', time: '17:00', status: 'open', items: [{ checked: false }, { checked: true }] },
    { id: 'l2', title: 'General', date: null, status: 'open', items: [] },
  ],
};
const plan = buildPlan(data, now, t);
const ids = plan.items.map((i) => i.id);
eq('past reminder skipped', ids.includes('task:a:2026-10-24'), false);
eq('later today scheduled', ids.includes('task:b:2026-10-24'), true);
const c = plan.items.find((i) => i.id === 'task:c:2026-10-25');
eq('default time used', c && c.when.getHours() + ':' + c.when.getMinutes(), '9:0');
eq('done skipped', ids.some((i) => i.startsWith('task:d')), false);
eq('undated skipped', ids.some((i) => i.startsWith('task:e')), false);
eq('bday day before', ids.includes('bday:p:2026-10-26:before'), true);
eq('bday on day', ids.includes('bday:p:2026-10-26:day'), true);
eq('bday body has age', plan.items.find((i) => i.id === 'bday:p:2026-10-26:day').body, 'יום הולדת 36! אל תשכחו לאחל');
eq('list scheduled', ids.includes('list:l:2026-10-25'), true);
eq('list body count', plan.items.find((i) => i.id === 'list:l:2026-10-25').body, 'פריט אחד ברשימה');
eq('sorted', plan.items.every((it, i, a) => i === 0 || a[i - 1].when <= it.when), true);
eq('no dup ids', new Set(ids).size, ids.length);
eq('signature stable', planSignature(buildPlan(data, now, t)), planSignature(plan));

// many daily tasks -> truncated to MAX
const many = { ...data, tasks: Array.from({ length: 5 }, (_, i) => ({ id: 'm' + i, title: 'm', date: '2026-10-24', time: '20:00', status: 'open', repeat: { type: 'daily' } })) };
const p2 = buildPlan(many, now, t);
eq('truncated to max', p2.items.length, MAX_SCHEDULED);
eq('truncated flag', p2.truncated, true);

// hidden content
const p3 = buildPlan({ ...data, settings: { ...data.settings, hideContent: true } }, now, t);
eq('hidden title', p3.items[0].title, 'תזכורת');

// modules off
const p4 = buildPlan({ ...data, settings: { ...data.settings, modules: { tasks: false, birthdays: false, shopping: true } } }, now, t);
eq('modules off', p4.items.map((i) => i.id), ['list:l:2026-10-25']);

// snooze
const p5 = buildPlan({ ...data, tasks: [{ id: 's', title: 'S', date: '2026-10-24', time: '09:00', status: 'open', repeat: { type: 'none' }, snoozeUntil: new Date(2026, 9, 24, 11, 0).toISOString() }], people: [], lists: [] }, now, t);
eq('snooze scheduled', p5.items.map((i) => i.id), ['task:s:snooze']);

// --- i18n ---
const tr = makeT('ru');
eq('ru plural 1', tr('notif.listBody', { n: 1 }), '1 товар в списке');
eq('ru plural 3', tr('notif.listBody', { n: 3 }), '3 товара в списке');
eq('ru plural 5', tr('notif.listBody', { n: 5 }), '5 товаров в списке');
eq('ru plural 11', tr('notif.listBody', { n: 11 }), '11 товаров в списке');
eq('ru plural 22', tr('notif.listBody', { n: 22 }), '22 товара в списке');
eq('en plural', makeT('en')('today.itemsLeft', { n: 2 }), '2 items left');
eq('he date', makeFormat('he').long('2026-10-24'), 'שבת, 24 באוקטובר');
eq('en date', makeFormat('en').long('2026-10-24'), 'Saturday, October 24');
eq('ru date', makeFormat('ru').long('2026-10-24'), 'суббота, 24 октября');
// every key in he exists in en and ru
import { STRINGS } from '../src/i18n/strings';
function keys(o, p = '') { return Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) && !('other' in v) ? keys(v, p + k + '.') : [p + k])); }
const heKeys = keys(STRINGS.he);
for (const L of ['en', 'ru']) {
  const lk = new Set(keys(STRINGS[L]));
  const missing = heKeys.filter((k) => !lk.has(k));
  eq(`${L} has all keys`, missing, []);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
