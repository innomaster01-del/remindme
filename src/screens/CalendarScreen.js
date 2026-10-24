import React, { useMemo, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Text, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useI18n, Row, Txt, IconBtn, Chip, Button, Card, Check, haptic } from '../ui';
import { AgendaRow, Group } from '../components';
import { C, R, ff } from '../theme';
import { toDateStr, parseDate, todayStr, daysInMonth, addMonths } from '../logic/dates';
import { occursOn, isDoneOn, isBirthdayOn, nextBirthday } from '../logic/recurrence';
import { hebrewFromDateStr, hebDayLabel, formatHebrew, holidayOn, holidayName, hebMonthTitle } from '../logic/hebrew';

export function dayItems(data, d) {
  const m = data.settings.modules;
  return {
    tasks: m.tasks ? data.tasks.filter((x) => x.status !== 'cancelled' && occursOn(x, d)) : [],
    people: m.birthdays ? data.people.filter((p) => isBirthdayOn(p, d)) : [],
    lists: m.shopping ? data.lists.filter((l) => l.date === d) : [],
  };
}

export default function CalendarScreen({ nav, now, onAdd, selected, setSelected, openDay }) {
  const { data, actions } = useStore();
  const { t, f, dir, lang } = useI18n();
  const insets = useSafeAreaInsets();
  const today = todayStr(now);
  const sel = selected || today;
  const [ym, setYm] = useState(() => { const d = parseDate(sel); return { year: d.getFullYear(), month0: d.getMonth() }; });
  const showHeb = data.settings.hebrewDate !== false;

  const go = (n) => { haptic(); setYm((v) => addMonths(v.year, v.month0, n)); };
  const goRef = useRef(go);
  goRef.current = go;
  const rtlRef = useRef(dir.rtl);
  rtlRef.current = dir.rtl;
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) < 50) return;
      const forward = rtlRef.current ? g.dx > 0 : g.dx < 0;
      goRef.current(forward ? 1 : -1);
    },
  }), []);

  // Build the month grid (weeks start on Sunday).
  const first = new Date(ym.year, ym.month0, 1).getDay();
  const n = daysInMonth(ym.year, ym.month0);
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= n; d++) cells.push(toDateStr(new Date(ym.year, ym.month0, d)));
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const markers = useMemo(() => {
    const map = {};
    for (const d of cells) {
      if (!d) continue;
      const it = dayItems(data, d);
      map[d] = {
        task: it.tasks.length > 0,
        tasksOpen: it.tasks.some((x) => !isDoneOn(x, d)),
        bday: it.people.length > 0,
        shop: it.lists.length > 0,
        holiday: showHeb ? holidayOn(d) : null,
        heb: showHeb ? hebrewFromDateStr(d) : null,
      };
    }
    return map;
  }, [data, ym.year, ym.month0, showHeb]);

  const items = dayItems(data, sel);
  const hol = showHeb ? holidayOn(sel) : null;
  const heb = showHeb ? hebrewFromDateStr(sel) : null;
  const firstHeb = showHeb ? hebrewFromDateStr(cells.find(Boolean)) : null;
  const lastHeb = showHeb ? hebrewFromDateStr(cells.filter(Boolean).pop()) : null;
  const hebRange = showHeb
    ? (firstHeb.month === lastHeb.month ? hebMonthTitle(lang, firstHeb.year, firstHeb.month)
      : `${hebMonthTitle(lang, firstHeb.year, firstHeb.month)} – ${hebMonthTitle(lang, lastHeb.year, lastHeb.month)}`)
    : null;
  const empty = !items.tasks.length && !items.people.length && !items.lists.length;
  const isCurMonth = ym.year === now.getFullYear() && ym.month0 === now.getMonth();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 10, paddingBottom: 130 }}>
      <Row justify="space-between" align="flex-end" style={{ marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Txt v="display">{f.monthName(ym.month0)}</Txt>
          <Txt v="muted" style={{ ...ff(500) }}>{ym.year}{hebRange ? `   ${hebRange}` : ''}</Txt>
        </View>
        <Row gap={6}>
          {!isCurMonth || sel !== today ? (
            <Chip label={t('calendar.today')} onPress={() => { const d = new Date(); setYm({ year: d.getFullYear(), month0: d.getMonth() }); setSelected(todayStr()); }} />
          ) : null}
          <IconBtn name={dir.back} bg={C.card} onPress={() => go(-1)} label={t('a11y.prevMonth')} />
          <IconBtn name={dir.fwd} bg={C.card} onPress={() => go(1)} label={t('a11y.nextMonth')} />
        </Row>
      </Row>

      <View {...pan.panHandlers}>
      <Card style={{ padding: 8, paddingTop: 12 }}>
        <Row gap={0} style={{ marginBottom: 4 }}>
          {f.weekdaysShort.map((w, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: i === 6 ? C.primary : C.faint, fontSize: 12.5, ...ff(600) }}>{w}</Text>
            </View>
          ))}
        </Row>
        {weeks.map((wk, wi) => (
          <Row key={wi} gap={0}>
            {wk.map((d, i) => {
              if (!d) return <View key={i} style={{ flex: 1, height: 62 }} />;
              const mk = markers[d] || {};
              const isSel = d === sel;
              const isToday = d === today;
              const dayNum = Number(d.slice(8));
              const past = d < today;
              return (
                <Pressable key={d} onPress={() => { haptic(); setSelected(d); openDay(d); }} style={{ flex: 1, height: 62, alignItems: 'center', paddingTop: 4 }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSel ? C.primary : isToday ? C.primarySoft : mk.holiday?.major ? C.holidaySoft : 'transparent',
                  }}>
                    <Text style={{
                      fontSize: 16, color: isSel ? C.onPrimary : isToday ? C.primary : mk.holiday ? C.holiday : past ? C.faint : C.ink,
                      ...ff(isSel || isToday ? 700 : 500),
                    }}>{dayNum}</Text>
                    {mk.heb ? (
                      <Text style={{ fontSize: 9.5, marginTop: -1, color: isSel ? C.onPrimary : C.faint, ...ff(500) }}>{hebDayLabel(lang, mk.heb)}</Text>
                    ) : null}
                  </View>
                  <Row gap={3} justify="center" style={{ marginTop: 4, height: 6 }}>
                    {mk.task ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: mk.tasksOpen ? C.primary : C.faint }} /> : null}
                    {mk.bday ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink }} /> : null}
                    {mk.shop ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.faint }} /> : null}
                  </Row>
                </Pressable>
              );
            })}
          </Row>
        ))}
      </Card>
      </View>

      <View style={{ marginTop: 22, marginBottom: 10, paddingHorizontal: 2 }}>
        <Txt v="title">{sel === today ? `${t('common.today')}, ${f.short(sel)}` : f.long(sel)}</Txt>
        <Row gap={8} style={{ marginTop: 6, flexWrap: 'wrap' }}>
          {heb ? <Txt v="muted">{formatHebrew(lang, heb)}</Txt> : null}
          {hol ? (
            <View style={{ backgroundColor: C.holidaySoft, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Txt v="tiny" style={{ color: C.holiday, ...ff(600) }}>{holidayName(lang, hol.key)}</Txt>
            </View>
          ) : null}
        </Row>
      </View>

      {empty ? (
        <Card flat tint={C.sunken} style={{ alignItems: 'center', gap: 12, paddingVertical: 22 }}>
          <Txt v="muted" center>{t('calendar.empty')}</Txt>
          <Button small variant="soft" icon="add" title={t('calendar.add')} onPress={() => onAdd(sel)} />
        </Card>
      ) : (
        <Group style={{ paddingHorizontal: 14 }}>
          {items.people.map((p) => {
            const age = p.year ? Number(sel.slice(0, 4)) - p.year : null;
            return <AgendaRow key={'p' + p.id} color={C.ink} icon="gift-outline" title={t('hero.bday', { name: p.name })}
              sub={age ? t('person.turns', { n: age }) : null} onPress={() => nav.push('person', { id: p.id })} />;
          })}
          {items.tasks.sort((a, b) => (a.time || '99').localeCompare(b.time || '99')).map((x) => {
            const done = isDoneOn(x, sel);
            return <AgendaRow key={'t' + x.id} color={C.primary} icon="checkbox-outline" title={x.title} done={done}
              sub={x.time || null} onPress={() => nav.push('task', { id: x.id })}
              right={<Check checked={done} onPress={() => actions.toggleTask(x.id, sel)} />} />;
          })}
          {items.lists.map((l) => {
            const left = l.items.filter((i) => !i.checked).length;
            return <AgendaRow key={'l' + l.id} color={C.faint} icon="basket-outline" title={l.title} done={l.status === 'done'}
              sub={[l.time, l.items.length ? t('today.itemsLeft', { n: left }) : null].filter(Boolean).join('   ')}
              onPress={() => nav.push('list', { id: l.id })} />;
          })}
        </Group>
      )}
      {!empty ? (
        <Button variant="ghost" small icon="add" title={t('calendar.add')} onPress={() => onAdd(sel)} style={{ marginTop: 10, alignSelf: 'center' }} />
      ) : null}
    </ScrollView>
  );
}
