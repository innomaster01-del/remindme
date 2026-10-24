import { STRINGS, LANGS } from './strings';
import { parseDate } from '../logic/dates';

export { LANGS };

function pluralForm(lang, n) {
  if (lang === 'ru') {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'one';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'few';
    return 'many';
  }
  return n === 1 ? 'one' : 'other';
}

function lookup(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function makeT(lang) {
  const dict = STRINGS[lang] || STRINGS.he;
  const t = (key, params = {}) => {
    let v = lookup(dict, key);
    if (v === undefined) v = lookup(STRINGS.en, key);
    if (v === undefined) return key;
    if (typeof v === 'object' && !Array.isArray(v)) {
      const f = pluralForm(lang, params.n ?? 0);
      v = v[f] ?? v.other ?? v.one;
    }
    if (typeof v !== 'string') return v;
    return v.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`));
  };
  return t;
}

export function makeFormat(lang) {
  const dict = STRINGS[lang] || STRINGS.he;
  const fill = (tpl, p) => tpl.replace(/\{(\w+)\}/g, (_, k) => p[k]);
  return {
    // "Saturday, October 24"
    long(dateStr) {
      const d = parseDate(dateStr);
      return fill(dict.dateFmt, { weekday: dict.weekdays[d.getDay()], day: d.getDate(), month: dict.months[d.getMonth()] });
    },
    short(dateStr) {
      const d = parseDate(dateStr);
      return fill(dict.dateShort, { day: d.getDate(), month: dict.months[d.getMonth()] });
    },
    dayMonth(day, month1) {
      return fill(dict.dateShort, { day, month: dict.months[month1 - 1] });
    },
    withYear(dateStr) {
      const d = parseDate(dateStr);
      return fill(dict.dateWithYear, { day: d.getDate(), month: dict.months[d.getMonth()], year: d.getFullYear() });
    },
    monthTitle(year, month0) {
      const names = dict.monthsStandalone || dict.months;
      return `${names[month0]} ${year}`;
    },
    monthName(month0) {
      return (dict.monthsStandalone || dict.months)[month0];
    },
    weekdaysShort: dict.weekdaysShort,
    weekday(dateStr) { return dict.weekdays[parseDate(dateStr).getDay()]; },
  };
}
