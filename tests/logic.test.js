// Logic tests. Run with: npx tsx tests/logic.test.js
import { occursOn, occurrencesBetween, birthdayInYear, nextBirthday, isDoneOn } from '../src/logic/recurrence';
import { buildPlan, MAX_SCHEDULED, planSignature } from '../src/logic/scheduler';
import { makeT, makeFormat } from '../src/i18n';
import { addDays, diffDays } from '../src/logic/dates';
import { hebrewFromDateStr, formatHebrew, holidayOn, gematria, rdFromDateStr, dateStrFromRd } from '../src/logic/hebrew';

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

// --- Hebrew calendar ---
eq('heb 2026-10-24', hebrewFromDateStr('2026-10-24'), { year: 5787, month: 8, day: 13 });
eq('heb format he', formatHebrew('he', hebrewFromDateStr('2026-10-24')), 'י״ג בחשון תשפ״ז');
eq('rosh hashana 5787', holidayOn('2026-09-12')?.key, 'roshHashana');
eq('pesach 5786', holidayOn('2026-04-02')?.key, 'pesach');
eq('atzmaut 5786 (Wed)', holidayOn('2026-04-22')?.key, 'yomHaatzmaut');
eq('atzmaut 5788 moved Mon->Tue', holidayOn('2028-05-02')?.key, 'yomHaatzmaut');
eq('no holiday', holidayOn('2026-10-24'), null);
eq('gematria 15', gematria(15), 'ט״ו');
eq('roundtrip', dateStrFromRd(rdFromDateStr('2030-02-28')), '2030-02-28');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

// --- quick add parser ---
import { parseQuick } from '../src/logic/quickparse';
{
  const qn = new Date(2026, 9, 24, 14, 0);
  const q = (s) => parseQuick(s, qn);
  eq('qp he tomorrow 8', q('מחר ב-8 להתקשר לאמא'), { title: 'להתקשר לאמא', date: '2026-10-25', time: '08:00' });
  eq('qp he 5 => 17', q('להתקשר לאמא מחר ב5').time, '17:00');
  eq('qp he bare number stays', q('לקנות 2 חלב'), { title: 'לקנות 2 חלב', date: null, time: null });
  eq('qp he weekday', q('ביום שלישי בשעה 18:30 חוג'), { title: 'חוג', date: '2026-10-27', time: '18:30' });
  eq('qp he in an hour', q('בעוד שעה להוציא כביסה').time, '15:00');
  eq('qp he date', q('פגישה ב-10/11 ב-9'), { title: 'פגישה', date: '2026-11-10', time: '09:00' });
  eq('qp en', q('call mom tomorrow at 5pm'), { title: 'call mom', date: '2026-10-25', time: '17:00' });
  eq('qp en weekday', q('dentist on monday at 10:30'), { title: 'dentist', date: '2026-10-26', time: '10:30' });
  eq('qp en past time -> tomorrow', q('gym 7am').date, '2026-10-25');
  eq('qp ru', q('завтра в 18:00 купить хлеб'), { title: 'купить хлеб', date: '2026-10-25', time: '18:00' });
  eq('qp ru weekday', q('в пятницу позвонить маме').date, '2026-10-30');
  eq('qp ru bare number', q('купить 3 яблока').title, 'купить 3 яблока');
}
console.log(`quick-add checks done: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

// --- Hebrew-date birthdays ---
import { birthdayInYear as bIY, nextBirthday as nB } from '../src/logic/recurrence';
{
  // Born 1990-10-24 = 5 Cheshvan 5751. In 2026, 5 Cheshvan 5787 = 2026-10-16.
  const p = { day: 24, month: 10, year: 1990, hebrew: true };
  eq('heb bday 2026', bIY(p, 2026), '2026-10-16');
  eq('heb bday age', nB(p, '2026-10-01'), { date: '2026-10-16', age: 36 });
  eq('greg bday unchanged', bIY({ ...p, hebrew: false }, 2026), '2026-10-24');
  // Born in Adar of a regular year (1995-03-01 = 29 Adar 5755?) -> celebrates Adar II in leap 5787 (2027)
  const a = { day: 16, month: 3, year: 1995, hebrew: true }; // 14 Adar 5755
  const d27 = bIY(a, 2027);
  eq('adar -> adar II in leap year', d27, '2027-03-23');
  const wk = buildPlan({ settings: { defaultTime: '09:00' }, tasks: [], lists: [], people: [{ id: 'w', name: 'W', day: 3, month: 11, remindOnDay: false, remindWeekBefore: true, time: '10:00' }] }, new Date(2026, 9, 24, 10), t);
  eq('week-before reminder', wk.items.map((i) => i.id)[0], 'bday:w:2026-11-03:week');
}
console.log(`hebrew birthday checks: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

// --- supermarket departments ---
import { classify } from '../src/logic/departments';
{
  const C2 = (n) => classify(n);
  eq('dept milk', C2('חלב'), 'dairy');
  eq('dept halva', C2('חלבה'), 'snacks');
  eq('dept tomatoes', C2('עגבניות שרי'), 'produce');
  eq('dept dish soap', C2('סבון כלים'), 'cleaning');
  eq('dept soap', C2('סבון גוף'), 'personal');
  eq('dept pita', C2('פיתות'), 'bakery');
  eq('dept tea word', C2('תה ירוק'), 'pantry');
  eq('dept black pepper', C2('פלפל שחור'), 'pantry');
  eq('dept pepper', C2('פלפל אדום'), 'produce');
  eq('dept eggplant en', C2('Eggplant'), 'produce');
  eq('dept ice cream en', C2('ice cream'), 'frozen');
  eq('dept ru butter', C2('масло сливочное'), 'dairy');
  eq('dept ru oil', C2('масло подсолнечное'), 'pantry');
  eq('dept ru beans', C2('фасоль'), 'pantry');
  eq('dept unknown', C2('מתנה לדנה'), 'other');
  eq('dept learned', classify('חלב', { 'חלב': 'drinks' }), 'drinks');
}
console.log(`department checks: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;

// --- notepad helpers ---
import { syncItemsFromText, itemsToText, splitTitle } from '../src/logic/listtext';
{
  let n = 0; const nid = () => 'n' + (++n);
  const items = [
    { id: 'a', name: 'חלב', qty: '2', checked: false, cat: 'dairy' },
    { id: 'b', name: 'לחם', qty: '', checked: true },
    { id: 'c', name: 'ביצים', qty: '12', checked: false },
  ];
  eq('items to text', itemsToText(items), 'חלב\nביצים');
  const r = syncItemsFromText(items, '• חלב\n\nעגבניות\n  ביצים  \n', nid);
  eq('sync keeps ids + qty', r.items.map((i) => [i.id, i.name, i.qty, i.checked]), [['a', 'חלב', '2', false], ['n1', 'עגבניות', '', false], ['c', 'ביצים', '12', false], ['b', 'לחם', '', true]]);
  eq('sync reports added', r.added, ['עגבניות']);
  eq('sync removes deleted lines', syncItemsFromText(items, 'ביצים', nid).items.map((i) => i.id), ['c', 'b']);
  eq('title split', splitTitle('\n  להכין מסיבה \nהזמנות\nעוגה'), { title: 'להכין מסיבה', body: 'הזמנות\nעוגה' });
  eq('title split empty', splitTitle('   \n '), { title: '', body: '' });
}
// lists without reminder are not scheduled
{
  const pl = buildPlan({ settings: { defaultTime: '09:00' }, tasks: [], people: [], lists: [
    { id: 'r1', title: 'A', date: '2026-10-25', time: '10:00', status: 'open', items: [], remind: false },
    { id: 'r2', title: 'B', date: '2026-10-25', time: '10:00', status: 'open', items: [] },
  ] }, new Date(2026, 9, 24, 10), t);
  eq('remind:false skipped', pl.items.map((i) => i.id), ['list:r2:2026-10-25']);
}
console.log(`notepad checks: ${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
