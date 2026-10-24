"use no memo";
// Home-screen widget (Android): today's date, tasks you can tick off, birthdays and shopping lists.
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { makeT, makeFormat } from '../i18n';
import { todayStr } from '../logic/dates';
import { occursOn, isDoneOn, isBirthdayOn } from '../logic/recurrence';
import { hebrewFromDateStr, formatHebrew } from '../logic/hebrew';

const THEMES = {
  light: { bg: '#F7F7FA', ink: '#15171C', muted: '#6B6D75', faint: '#A5A7AE', line: '#E4E5EA', primary: '#5856D6', bday: '#15171C', shop: '#5856D6', from: '#5856D6', to: '#6F6DE0' },
  dark: { bg: '#17181F', ink: '#F2F3F7', muted: '#A4A6AE', faint: '#62646C', line: '#2A2B33', primary: '#7D7AFF', bday: '#F2F3F7', shop: '#7D7AFF', from: '#4A48C4', to: '#5F5DD6' },
};

export function widgetModel(data, now = new Date()) {
  const lang = data.settings.lang || 'he';
  const t = makeT(lang);
  const f = makeFormat(lang);
  const d = todayStr(now);
  const m = data.settings.modules || {};
  const tasks = m.tasks === false ? [] : data.tasks
    .filter((x) => x.status !== 'cancelled' && occursOn(x, d))
    .sort((a, b) => (isDoneOn(a, d) - isDoneOn(b, d)) || (a.time || '99').localeCompare(b.time || '99'));
  const people = m.birthdays === false ? [] : data.people.filter((p) => isBirthdayOn(p, d));
  const lists = m.shopping === false ? [] : data.lists.filter((l) => l.date === d && l.status !== 'done');
  const left = tasks.filter((x) => !isDoneOn(x, d)).length;
  return {
    lang, rtl: lang === 'he', t, date: d,
    title: f.long(d),
    heb: data.settings.hebrewDate === false ? null : formatHebrew(lang, hebrewFromDateStr(d)),
    summary: tasks.length === 0 ? t('hero.free') : left === 0 ? t('hero.allDone') : t('hero.tasksLeft', { n: left }),
    tasks: tasks.map((x) => ({ id: x.id, title: x.title, time: x.time, done: isDoneOn(x, d) })),
    people: people.map((p) => t('hero.bday', { name: p.name })),
    lists: lists.map((l) => ({ id: l.id, title: l.title, left: l.items.filter((i) => !i.checked).length })),
  };
}

function Line({ m, c, children }) {
  // A row that respects the language direction (FlexWidget has no row-reverse).
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 'match_parent', flexGap: 10 }}>
      {m.rtl ? kids.reverse() : kids}
    </FlexWidget>
  );
}

function Body({ model: m, c, max = 4 }) {
  const align = m.rtl ? 'flex-end' : 'flex-start';
  const textAlign = m.rtl ? 'right' : 'left';
  const shown = m.tasks.slice(0, max);
  return (
    <FlexWidget style={{ width: 'match_parent', height: 'match_parent', backgroundColor: c.bg, borderRadius: 24, flexDirection: 'column' }}>
      <FlexWidget clickAction="OPEN_APP" style={{
        width: 'match_parent', padding: 14, paddingBottom: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        backgroundGradient: { from: c.from, to: c.to, orientation: 'TL_BR' }, flexDirection: 'column', alignItems: align,
      }}>
        <Line m={m} c={c}>
          <FlexWidget style={{ flex: 1, flexDirection: 'column', alignItems: align }}>
            <TextWidget text={m.title} maxLines={1} truncate="END" style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF', textAlign }} />
            {m.heb ? <TextWidget text={m.heb} maxLines={1} style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', textAlign }} /> : null}
          </FlexWidget>
          <FlexWidget clickAction="OPEN_URI" clickActionData={{ uri: 'remindme://add' }} style={{
            width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.25)', alignItems: 'center', justifyContent: 'center',
          }}>
            <TextWidget text="+" style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF' }} />
          </FlexWidget>
        </Line>
        <TextWidget text={m.summary} style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginTop: 6, textAlign }} />
      </FlexWidget>

      <FlexWidget style={{ width: 'match_parent', flex: 1, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'column', alignItems: align }}>
        {m.people.map((p, i) => (
          <TextWidget key={'p' + i} text={`🎂 ${p}`} maxLines={1} truncate="END" style={{ fontSize: 13, color: c.bday, fontWeight: '600', marginTop: 4, textAlign }} />
        ))}
        {shown.map((x) => (
          <FlexWidget key={x.id} clickAction="TOGGLE" clickActionData={{ id: x.id, date: m.date }} style={{ width: 'match_parent', paddingVertical: 6 }}>
            <Line m={m} c={c}>
              <FlexWidget style={{
                width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: x.done ? c.primary : c.faint,
                backgroundColor: x.done ? c.primary : c.bg, alignItems: 'center', justifyContent: 'center',
              }}>
                {x.done ? <TextWidget text="✓" style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '700' }} /> : null}
              </FlexWidget>
              <FlexWidget style={{ flex: 1, alignItems: align }}>
                <TextWidget text={x.title} maxLines={1} truncate="END"
                  style={{ fontSize: 14.5, color: x.done ? c.faint : c.ink, textAlign }} />
              </FlexWidget>
              {x.time ? <TextWidget text={x.time} style={{ fontSize: 12, color: c.primary, fontWeight: '600' }} /> : null}
            </Line>
          </FlexWidget>
        ))}
        {m.tasks.length > shown.length ? (
          <TextWidget clickAction="OPEN_APP" text={`+${m.tasks.length - shown.length}`} style={{ fontSize: 12, color: c.muted, marginTop: 2, textAlign }} />
        ) : null}
        {m.lists.map((l) => (
          <TextWidget key={l.id} clickAction="OPEN_URI" clickActionData={{ uri: `remindme://list/${l.id}` }}
            text={`🛒 ${l.title} · ${l.left}`} maxLines={1} truncate="END" style={{ fontSize: 13, color: c.shop, fontWeight: '600', marginTop: 4, textAlign }} />
        ))}
        {!m.tasks.length && !m.people.length && !m.lists.length ? (
          <TextWidget clickAction="OPEN_URI" clickActionData={{ uri: 'remindme://add' }} text={m.t('today.emptyBody')}
            style={{ fontSize: 13, color: c.muted, marginTop: 8, textAlign }} />
        ) : null}
      </FlexWidget>
    </FlexWidget>
  );
}

export function renderToday(data, height) {
  const m = widgetModel(data);
  const max = height && height < 200 ? 2 : height && height > 320 ? 7 : 4;
  return { light: <Body model={m} c={THEMES.light} max={max} />, dark: <Body model={m} c={THEMES.dark} max={max} /> };
}
