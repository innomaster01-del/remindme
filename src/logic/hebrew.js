// Hebrew (Jewish) calendar conversion + Israeli holidays.
// Arithmetic from "Calendrical Calculations" (Reingold & Dershowitz). Months: Nisan = 1 … Adar = 12, Adar II = 13.

const EPOCH = -1373427; // R.D. of 1 Tishrei 1 AM

const mod = (a, b) => ((a % b) + b) % b;

export function rdFromDateStr(s) {
  const [y, m, d] = s.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 719163;
}

export function dateStrFromRd(rd) {
  const d = new Date((rd - 719163) * 86400000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

export const isHebLeap = (y) => mod(7 * y + 1, 19) < 7;
const lastMonth = (y) => (isHebLeap(y) ? 13 : 12);

function elapsedDays(y) {
  const months = Math.floor((235 * y - 234) / 19);
  const parts = 12084 + 13753 * months;
  const day = months * 29 + Math.floor(parts / 25920);
  return mod(3 * (day + 1), 7) < 3 ? day + 1 : day;
}

function yearCorrection(y) {
  const ny0 = elapsedDays(y - 1);
  const ny1 = elapsedDays(y);
  const ny2 = elapsedDays(y + 1);
  if (ny2 - ny1 === 356) return 2;
  if (ny1 - ny0 === 382) return 1;
  return 0;
}

const newYearCache = new Map();
function newYear(y) {
  if (!newYearCache.has(y)) newYearCache.set(y, EPOCH + elapsedDays(y) + yearCorrection(y));
  return newYearCache.get(y);
}

const daysInYear = (y) => newYear(y + 1) - newYear(y);

export function monthLength(y, m) {
  if ([2, 4, 6, 10, 13].includes(m)) return 29;
  if (m === 12 && !isHebLeap(y)) return 29;
  if (m === 8 && daysInYear(y) % 10 !== 5) return 29; // Heshvan is long only in "complete" years
  if (m === 9 && daysInYear(y) % 10 === 3) return 29; // Kislev is short only in "deficient" years
  return 30;
}

export function rdFromHebrew(y, m, d) {
  let days = newYear(y) + d - 1;
  if (m < 7) {
    for (let i = 7; i <= lastMonth(y); i++) days += monthLength(y, i);
    for (let i = 1; i < m; i++) days += monthLength(y, i);
  } else {
    for (let i = 7; i < m; i++) days += monthLength(y, i);
  }
  return days;
}

export function hebrewFromRd(rd) {
  const approx = Math.floor((rd - EPOCH) / (35975351 / 98496)) + 1;
  let y = approx - 1;
  while (newYear(y + 1) <= rd) y++;
  const start = rd < rdFromHebrew(y, 1, 1) ? 7 : 1;
  let m = start;
  while (rd > rdFromHebrew(y, m, monthLength(y, m))) m++;
  const d = rd - rdFromHebrew(y, m, 1) + 1;
  return { year: y, month: m, day: d };
}

export const hebrewFromDateStr = (s) => hebrewFromRd(rdFromDateStr(s));

// ---------- Display ----------
const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];

export function gematria(n) {
  let s = HUNDREDS[Math.floor(n / 100)] || '';
  const rest = n % 100;
  if (rest === 15) s += 'טו';
  else if (rest === 16) s += 'טז';
  else s += TENS[Math.floor(rest / 10)] + ONES[rest % 10];
  if (s.length === 1) return s + '׳';
  return s.slice(0, -1) + '״' + s.slice(-1);
}

const MONTHS = {
  he: ['', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר', 'אדר ב׳'],
  en: ['', 'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul', 'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Adar II'],
  ru: ['', 'нисана', 'ияра', 'сивана', 'тамуза', 'ава', 'элула', 'тишрея', 'хешвана', 'кислева', 'тевета', 'швата', 'адара', 'адара II'],
};
const ADAR_I = { he: 'אדר א׳', en: 'Adar I', ru: 'адара I' };

const RU_NOMINATIVE = ['', 'Нисан', 'Ияр', 'Сиван', 'Тамуз', 'Ав', 'Элул', 'Тишрей', 'Хешван', 'Кислев', 'Тевет', 'Шват', 'Адар', 'Адар II'];

// Standalone month name (for headers), e.g. "Tishrei – Cheshvan".
export function hebMonthTitle(lang, y, m) {
  if (lang === 'ru') return m === 12 && isHebLeap(y) ? 'Адар I' : RU_NOMINATIVE[m];
  return hebMonthName(lang, y, m);
}

export function hebMonthName(lang, y, m) {
  const L = MONTHS[lang] ? lang : 'en';
  if (m === 12 && isHebLeap(y)) return ADAR_I[L];
  return MONTHS[L][m];
}

export function formatHebrew(lang, h, { withYear = true, short = false } = {}) {
  const month = hebMonthName(lang, h.year, h.month);
  if (lang === 'he') {
    const day = gematria(h.day);
    if (short) return `${day} ${month}`;
    return withYear ? `${day} ב${month} ${gematria(h.year % 1000)}` : `${day} ב${month}`;
  }
  return withYear && !short ? `${h.day} ${month} ${h.year}` : `${h.day} ${month}`;
}

export function hebDayLabel(lang, h) {
  return lang === 'he' ? gematria(h.day).replace(/[׳״]/g, '') : String(h.day);
}

// ---------- Israeli holidays ----------
export const HOLIDAY_NAMES = {
  roshHashana: { he: 'ראש השנה', en: 'Rosh Hashana', ru: 'Рош ха-Шана' },
  yomKippur: { he: 'יום כיפור', en: 'Yom Kippur', ru: 'Йом Кипур' },
  sukkot: { he: 'סוכות', en: 'Sukkot', ru: 'Суккот' },
  simchatTorah: { he: 'שמחת תורה', en: 'Simchat Torah', ru: 'Симхат Тора' },
  hanukkah: { he: 'חנוכה', en: 'Hanukkah', ru: 'Ханука' },
  tuBishvat: { he: 'ט״ו בשבט', en: 'Tu BiShvat', ru: 'Ту би-Шват' },
  purim: { he: 'פורים', en: 'Purim', ru: 'Пурим' },
  pesach: { he: 'פסח', en: 'Passover', ru: 'Песах' },
  pesach7: { he: 'שביעי של פסח', en: 'Passover (7th day)', ru: 'Седьмой день Песаха' },
  yomHashoah: { he: 'יום השואה', en: 'Holocaust Remembrance Day', ru: 'День Катастрофы' },
  yomHazikaron: { he: 'יום הזיכרון', en: 'Memorial Day', ru: 'День памяти' },
  yomHaatzmaut: { he: 'יום העצמאות', en: 'Independence Day', ru: 'День независимости' },
  lagBaomer: { he: 'ל״ג בעומר', en: 'Lag BaOmer', ru: 'Лаг ба-Омер' },
  shavuot: { he: 'שבועות', en: 'Shavuot', ru: 'Шавуот' },
  tishaBav: { he: 'תשעה באב', en: 'Tisha B’Av', ru: 'Девятое ава' },
};

const holidayCache = new Map();
function holidaysOfYear(hy) {
  if (holidayCache.has(hy)) return holidayCache.get(hy);
  const map = new Map();
  const add = (rd, key, major = true) => { if (!map.has(rd)) map.set(rd, { key, major }); };
  const dow = (rd) => mod(rd, 7); // 0 = Sunday
  add(rdFromHebrew(hy, 7, 1), 'roshHashana'); add(rdFromHebrew(hy, 7, 2), 'roshHashana');
  add(rdFromHebrew(hy, 7, 10), 'yomKippur');
  add(rdFromHebrew(hy, 7, 15), 'sukkot');
  add(rdFromHebrew(hy, 7, 22), 'simchatTorah');
  const han = rdFromHebrew(hy, 9, 25);
  for (let i = 0; i < 8; i++) add(han + i, 'hanukkah', false);
  add(rdFromHebrew(hy, 11, 15), 'tuBishvat', false);
  add(rdFromHebrew(hy, isHebLeap(hy) ? 13 : 12, 14), 'purim', false);
  add(rdFromHebrew(hy, 1, 15), 'pesach');
  add(rdFromHebrew(hy, 1, 21), 'pesach7');
  // Yom HaShoah 27 Nisan: Friday → Thursday, Sunday → Monday
  let shoah = rdFromHebrew(hy, 1, 27);
  if (dow(shoah) === 5) shoah -= 1; else if (dow(shoah) === 0) shoah += 1;
  add(shoah, 'yomHashoah', false);
  // Yom HaAtzmaut 5 Iyar: Fri/Sat → Thursday before, Monday → Tuesday
  let atz = rdFromHebrew(hy, 2, 5);
  if (dow(atz) === 5) atz -= 1; else if (dow(atz) === 6) atz -= 2; else if (dow(atz) === 1) atz += 1;
  add(atz - 1, 'yomHazikaron', false);
  add(atz, 'yomHaatzmaut');
  add(rdFromHebrew(hy, 2, 18), 'lagBaomer', false);
  add(rdFromHebrew(hy, 3, 6), 'shavuot');
  let av = rdFromHebrew(hy, 5, 9);
  if (dow(av) === 6) av += 1;
  add(av, 'tishaBav', false);
  holidayCache.set(hy, map);
  return map;
}

export function holidayOn(dateStr) {
  const rd = rdFromDateStr(dateStr);
  const { year } = hebrewFromRd(rd);
  return holidaysOfYear(year).get(rd) || null;
}

export function holidayName(lang, key) {
  const n = HOLIDAY_NAMES[key];
  return n ? n[lang] || n.en : '';
}
