import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';
import { useI18n, Row, Txt, Sheet, Button, IconBtn, Chip, haptic } from './ui';
import { C, R, ff } from './theme';
import { toDateStr, parseDate, todayStr, addDays, daysInMonth, addMonths } from './logic/dates';

// ---------- Calendar month grid ----------
export function DatePickerSheet({ visible, value, onPick, onClose, title }) {
  const { f, t, dir } = useI18n();
  const base = value ? parseDate(value) : new Date();
  const [ym, setYm] = useState({ year: base.getFullYear(), month0: base.getMonth() });
  useEffect(() => {
    if (visible) {
      const b = value ? parseDate(value) : new Date();
      setYm({ year: b.getFullYear(), month0: b.getMonth() });
    }
  }, [visible, value]);

  const first = new Date(ym.year, ym.month0, 1).getDay();
  const n = daysInMonth(ym.year, ym.month0);
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= n; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  const today = todayStr();

  return (
    <Sheet visible={visible} onClose={onClose} title={title || t('common.pickDate')}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <IconBtn name={dir.back} onPress={() => setYm(addMonths(ym.year, ym.month0, -1))} />
        <Txt v="h2">{f.monthTitle(ym.year, ym.month0)}</Txt>
        <IconBtn name={dir.fwd} onPress={() => setYm(addMonths(ym.year, ym.month0, 1))} />
      </Row>
      <Row gap={0}>
        {f.weekdaysShort.map((w, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ color: C.faint, fontSize: 13, ...ff(600) }}>{w}</Text>
          </View>
        ))}
      </Row>
      {rows.map((r, ri) => (
        <Row key={ri} gap={0}>
          {r.map((d, i) => {
            if (!d) return <View key={i} style={{ flex: 1, height: 44 }} />;
            const ds = toDateStr(new Date(ym.year, ym.month0, d));
            const sel = ds === value;
            const isToday = ds === today;
            return (
              <Pressable key={i} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => { onPick(ds); onClose(); }}>
                <View style={{
                  width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: sel ? C.primary : isToday ? C.primarySoft : 'transparent',
                }}>
                  <Text style={{ color: sel ? C.onPrimary : isToday ? C.primary : C.ink, fontSize: 16, ...ff(isToday || sel ? 700 : 400) }}>{d}</Text>
                </View>
              </Pressable>
            );
          })}
        </Row>
      ))}
      <Row style={{ marginTop: 12 }} justify="center">
        <Chip label={t('common.today')} onPress={() => { onPick(today); onClose(); }} />
        <Chip label={t('common.tomorrow')} onPress={() => { onPick(addDays(today, 1)); onClose(); }} />
      </Row>
    </Sheet>
  );
}

// ---------- Time: hour grid + minute grid ----------
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const pad = (n) => String(n).padStart(2, '0');

function Grid({ items, cols, selected, onPick, render }) {
  const rows = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={{ gap: 6 }}>
      {rows.map((r, ri) => (
        <Row key={ri} gap={6}>
          {r.map((v) => {
            const sel = v === selected;
            return (
              <Pressable key={v} onPress={() => onPick(v)} style={{
                flex: 1, height: 42, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center',
                backgroundColor: sel ? C.primary : C.card,
              }}>
                <Text style={{ color: sel ? C.onPrimary : C.ink, fontSize: 15, ...ff(sel ? 700 : 500) }}>{render(v)}</Text>
              </Pressable>
            );
          })}
        </Row>
      ))}
    </View>
  );
}

// Alarm-clock style wheels: hours 00–23 and minutes 00–59.
const ITEM = 50;
const VISIBLE = 5;
function Wheel({ count, value, onChange, format, label }) {
  const ref = useRef(null);
  const [cur, setCur] = useState(value);
  const last = useRef(value);
  const ready = useRef(false); // ignore scroll events until the wheel is positioned on the initial value
  const position = () => {
    if (ref.current) ref.current.scrollTo({ y: value * ITEM, animated: false });
    setTimeout(() => { ready.current = true; }, 250);
  };
  const pick = (i, fromScroll) => {
    if (fromScroll && !ready.current) return;
    const v = Math.max(0, Math.min(count - 1, i));
    if (v === last.current) return;
    last.current = v;
    setCur(v);
    haptic();
    onChange(v);
  };
  return (
    <View style={{ height: ITEM * VISIBLE, width: 92, overflow: 'hidden' }} accessibilityLabel={label}>
      <View pointerEvents="none" style={{ position: 'absolute', top: ITEM * 2, left: 4, right: 4, height: ITEM, borderRadius: 14, backgroundColor: C.primarySoft }} />
      <ScrollView
        ref={ref}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: ITEM * 2 }}
        contentOffset={{ x: 0, y: value * ITEM }}
        onLayout={() => setTimeout(position, 30)}
        onScroll={(e) => pick(Math.round(e.nativeEvent.contentOffset.y / ITEM), true)}
        onMomentumScrollEnd={(e) => pick(Math.round(e.nativeEvent.contentOffset.y / ITEM), true)}
      >
        {Array.from({ length: count }, (_, i) => {
          const sel = i === cur;
          return (
            <Pressable key={i} onPress={() => { ref.current && ref.current.scrollTo({ y: i * ITEM, animated: true }); pick(i); }}
              style={{ height: ITEM, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: sel ? 30 : 21, color: sel ? C.ink : C.faint, fontVariant: ['tabular-nums'], ...ff(sel ? 700 : 500) }}>{format(i)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function TimePickerSheet({ visible, value, onPick, onClose }) {
  const { t } = useI18n();
  const parse = (v) => (v ? v.split(':').map(Number) : [9, 0]);
  const [h, setH] = useState(parse(value)[0]);
  const [m, setM] = useState(parse(value)[1]);
  useEffect(() => {
    if (visible) { const [hh, mm] = parse(value); setH(hh); setM(mm); }
  }, [visible, value]);
  return (
    <Sheet visible={visible} onClose={onClose} title={t('common.pickTime')}>
      {visible ? (
        // Time always reads left-to-right (HH:MM), also in Hebrew.
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Wheel key={`h${value}`} count={24} value={h} onChange={setH} format={pad} label={t('common.hour')} />
          <Text style={{ fontSize: 30, color: C.ink, ...ff(700), marginBottom: 4 }}>:</Text>
          <Wheel key={`m${value}`} count={60} value={m} onChange={setM} format={pad} label={t('common.minute')} />
        </View>
      ) : null}
      <Button title={`${t('common.ok')}  ${pad(h)}:${pad(m)}`} style={{ marginTop: 10 }} onPress={() => { onPick(`${pad(h)}:${pad(m)}`); onClose(); }} />
    </Sheet>
  );
}

// ---------- Fields used in editors ----------
export function DateField({ value, onChange, allowNone = true }) {
  const { t, f } = useI18n();
  const [open, setOpen] = useState(false);
  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const custom = value && value !== today && value !== tomorrow;
  return (
    <>
      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        {allowNone ? <Chip label={t('common.noDate')} selected={!value} onPress={() => onChange(null)} /> : null}
        <Chip label={t('common.today')} selected={value === today} onPress={() => onChange(today)} />
        <Chip label={t('common.tomorrow')} selected={value === tomorrow} onPress={() => onChange(tomorrow)} />
        <Chip icon="calendar-outline" label={custom ? f.short(value) : t('common.pickDate')} selected={custom} onPress={() => setOpen(true)} />
      </Row>
      <DatePickerSheet visible={open} value={value} onPick={onChange} onClose={() => setOpen(false)} />
    </>
  );
}

export function TimeField({ value, onChange, allowNone = true }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        {allowNone ? <Chip label={t('common.noTime')} selected={!value} onPress={() => onChange(null)} /> : null}
        {[['morning', '08:00', 'sunny-outline'], ['noon', '13:00', 'partly-sunny-outline'], ['evening', '19:00', 'moon-outline']].map(([k, v, ic]) => (
          <Chip key={k} icon={ic} label={`${t('presets.' + k)} ${v}`} selected={value === v} onPress={() => onChange(v)} />
        ))}
        <Chip icon="time-outline" label={value && !['08:00', '13:00', '19:00'].includes(value) ? value : t('common.pickTime')}
          selected={!!value && !['08:00', '13:00', '19:00'].includes(value)} onPress={() => setOpen(true)} />
      </Row>
      <TimePickerSheet visible={open} value={value} onPick={onChange} onClose={() => setOpen(false)} />
    </>
  );
}
