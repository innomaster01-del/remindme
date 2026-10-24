// Free-text quick add: "מחר ב-8 להתקשר לאמא", "call mom tomorrow at 5pm", "завтра в 18:00 купить хлеб".
// Understands Hebrew, English and Russian at the same time, whatever the UI language.
import { toDateStr, addDays } from './dates';

const S = '(?:^|\\s)'; // start boundary (JS \b doesn't work for Hebrew/Cyrillic)
const E = '(?=$|\\s|[,.!?;:])'; // end boundary

const WEEKDAYS = [
  // [regex source, weekday index]
  ['(?:ב?יום\\s+)ראשון|בראשון', 0], ['(?:ב?יום\\s+)שני', 1], ['(?:ב?יום\\s+)שלישי', 2], ['(?:ב?יום\\s+)רביעי', 3],
  ['(?:ב?יום\\s+)חמישי|בחמישי', 4], ['(?:ב?יום\\s+)שישי|בשישי', 5], ['(?:ב?יום\\s+)?שבת|בשבת', 6],
  ['(?:on\\s+)?(?:next\\s+)?sun(?:day)?', 0], ['(?:on\\s+)?(?:next\\s+)?mon(?:day)?', 1], ['(?:on\\s+)?(?:next\\s+)?tue(?:s|sday)?', 2],
  ['(?:on\\s+)?(?:next\\s+)?wed(?:nesday)?', 3], ['(?:on\\s+)?(?:next\\s+)?thu(?:rs|rsday)?', 4], ['(?:on\\s+)?(?:next\\s+)?fri(?:day)?', 5],
  ['(?:on\\s+)?(?:next\\s+)?sat(?:urday)?', 6],
  ['(?:в\\s+)?воскресенье', 0], ['(?:в\\s+)?понедельник', 1], ['(?:во\\s+)?вторник', 2], ['(?:в\\s+)?среду', 3],
  ['(?:в\\s+)?четверг', 4], ['(?:в\\s+)?пятницу', 5], ['(?:в\\s+)?субботу', 6],
];

const pad = (n) => String(n).padStart(2, '0');
const hm = (h, m) => `${pad(h)}:${pad(m)}`;

// Hours said without am/pm: "at 5" almost always means 17:00, "at 8" means 08:00.
function guessHour(h, ampm) {
  if (ampm === 'pm' && h < 12) return h + 12;
  if (ampm === 'am') return h === 12 ? 0 : h;
  if (h >= 1 && h <= 6) return h + 12;
  return h;
}

export function parseQuick(input, now = new Date()) {
  let text = ` ${input} `;
  let date = null;
  let time = null;
  let ampm = null;
  const today = toDateStr(now);
  const take = (re) => {
    const m = text.match(re);
    if (m) text = text.replace(re, ' ');
    return m;
  };

  // --- relative "in N hours/minutes" (sets date + time) ---
  let m = take(new RegExp(`${S}(?:בעוד|in|через)\\s+(?:(\\d+)\\s+)?(שעה|שעות|שעתיים|hours?|an hour|час(?:а|ов)?|דקות|דקה|minutes?|mins?|минут[уы]?)${E}`, 'i'));
  if (m) {
    const unit = m[2].toLowerCase();
    let n = m[1] ? Number(m[1]) : 1;
    if (unit === 'שעתיים') n = 2;
    const minutes = /שעה|שעות|שעתיים|hour|час/.test(unit) ? n * 60 : n;
    const d = new Date(now.getTime() + minutes * 60000);
    date = toDateStr(d);
    time = hm(d.getHours(), d.getMinutes());
  }

  // --- relative days ---
  if (!date) {
    m = take(new RegExp(`${S}(?:בעוד|in|через)\\s+(?:(\\d+)\\s+)?(ימים|יום|יומיים|days?|дн(?:я|ей)|день|שבוע|שבועיים|weeks?|недел[юи]|недель)${E}`, 'i'));
    if (m) {
      const unit = m[2].toLowerCase();
      let n = m[1] ? Number(m[1]) : 1;
      if (unit === 'יומיים' || unit === 'שבועיים') n = 2;
      date = addDays(today, /שבוע|week|недел/.test(unit) ? n * 7 : n);
    }
  }
  if (!date && take(new RegExp(`${S}(?:next week|בשבוע הבא|на следующей неделе)${E}`, 'i'))) date = addDays(today, 7);
  if (!date && take(new RegExp(`${S}(?:מחרתיים|day after tomorrow|послезавтра)${E}`, 'i'))) date = addDays(today, 2);
  if (!date && take(new RegExp(`${S}(?:מחר|tomorrow|tmrw|завтра)${E}`, 'i'))) date = addDays(today, 1);
  if (!date && take(new RegExp(`${S}(?:היום|today|сегодня)${E}`, 'i'))) date = today;

  // --- explicit date dd/mm[/yy] or dd.mm ---
  if (!date) {
    m = take(new RegExp(`${S}(?:ב-?|on\\s+)?(\\d{1,2})[./](\\d{1,2})(?:[./](\\d{2,4}))?${E}`, 'i'));
    if (m) {
      const d = Number(m[1]); const mo = Number(m[2]);
      let y = m[3] ? Number(m[3]) : now.getFullYear();
      if (y < 100) y += 2000;
      if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) {
        let ds = `${y}-${pad(mo)}-${pad(d)}`;
        if (!m[3] && ds < today) ds = `${y + 1}-${pad(mo)}-${pad(d)}`;
        date = ds;
      }
    }
  }

  // --- weekday names ---
  if (!date) {
    for (const [src, wd] of WEEKDAYS) {
      m = take(new RegExp(`${S}(?:${src})${E}`, 'i'));
      if (m) {
        const cur = now.getDay();
        let diff = (wd - cur + 7) % 7;
        if (diff === 0) diff = 7;
        date = addDays(today, diff);
        break;
      }
    }
  }

  // --- part of day ---
  if (take(new RegExp(`${S}(?:בבוקר|in the morning|morning|утром)${E}`, 'i'))) ampm = 'am-word';
  else if (take(new RegExp(`${S}(?:בצהריים|at noon|noon|днём|днем)${E}`, 'i'))) ampm = 'noon-word';
  else if (take(new RegExp(`${S}(?:אחה"צ|אחה״צ|אחר הצהריים|in the afternoon|afternoon)${E}`, 'i'))) ampm = 'pm-word';
  else if (take(new RegExp(`${S}(?:בערב|in the evening|evening|tonight|вечером)${E}`, 'i'))) ampm = 'eve-word';
  else if (take(new RegExp(`${S}(?:בלילה|at night|ночью)${E}`, 'i'))) ampm = 'night-word';

  // --- clock time (needs a marker like "ב-"/"at"/"в", or minutes, or am/pm — so "2 milk" stays a title) ---
  if (!time) {
    const AP = '(am|pm|a\\.m\\.|p\\.m\\.)';
    const forms = [
      new RegExp(`${S}(?:בשעה\\s*|ב-?|at\\s+|@\\s*|в\\s+)(\\d{1,2})(?::(\\d{2}))?\\s*${AP}?${E}`, 'i'),
      new RegExp(`${S}(\\d{1,2}):(\\d{2})\\s*${AP}?${E}`, 'i'),
      new RegExp(`${S}(\\d{1,2})()\\s*${AP}${E}`, 'i'),
    ];
    for (const re of forms) {
      const mm = text.match(re);
      if (!mm) continue;
      const h = Number(mm[1]); const mi = mm[2] ? Number(mm[2]) : 0;
      if (h > 23 || mi > 59) continue;
      text = text.replace(re, ' ');
      let explicit = mm[3] ? (mm[3].toLowerCase().startsWith('p') ? 'pm' : 'am') : null;
      if (!explicit && ampm === 'am-word') explicit = 'am';
      if (!explicit && ['pm-word', 'eve-word', 'night-word'].includes(ampm)) explicit = 'pm';
      if (!explicit && ampm === 'noon-word') explicit = h >= 11 ? 'am' : 'pm';
      const hh = h >= 13 ? h : guessHour(h, explicit);
      time = hm(hh % 24, mi);
      break;
    }
  }
  if (!time && ampm) time = { 'am-word': '09:00', 'noon-word': '13:00', 'pm-word': '15:00', 'eve-word': '19:00', 'night-word': '21:00' }[ampm];

  if (time && !date) {
    const [h, mi] = time.split(':').map(Number);
    const at = new Date(now); at.setHours(h, mi, 0, 0);
    date = at.getTime() > now.getTime() ? today : addDays(today, 1);
  }

  const title = text.replace(/\s+/g, ' ').replace(/^[\s,.\-–:]+|[\s,.\-–:]+$/g, '').trim();
  return { title, date, time };
}

