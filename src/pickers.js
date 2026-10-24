import React, { useState, useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import { useI18n, Row, Txt, Sheet, Button, IconBtn, Chip } from './ui';
import { C, R } from './theme';
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
            <Text style={{ color: C.muted, fontWeight: '700', fontSize: 13 }}>{w}</Text>
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
                  backgroundColor: sel ? C.primary : 'transparent', borderWidth: isToday && !sel ? 1.5 : 0, borderColor: C.primary,
                }}>
                  <Text style={{ color: sel ? '#fff' : C.ink, fontSize: 16, fontWeight: isToday ? '700' : '500' }}>{d}</Text>
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
                backgroundColor: sel ? C.primary : C.card, borderWidth: 1, borderColor: sel ? C.primary : C.line,
              }}>
                <Text style={{ color: sel ? '#fff' : C.ink, fontWeight: '600', fontSize: 15 }}>{render(v)}</Text>
              </Pressable>
            );
          })}
        </Row>
      ))}
    </View>
  );
}

export function TimePickerSheet({ visible, value, onPick, onClose }) {
  const { t } = useI18n();
  const parse = (v) => (v ? v.split(':').map(Number) : [9, 0]);
  const [h, setH] = useState(parse(value)[0]);
  const [m, setM] = useState(parse(value)[1]);
  useEffect(() => {
    if (visible) { const [hh, mm] = parse(value); setH(hh); setM(mm - (mm % 5)); }
  }, [visible, value]);
  return (
    <Sheet visible={visible} onClose={onClose} title={t('common.pickTime')}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 44, fontWeight: '800', color: C.primary, fontVariant: ['tabular-nums'] }}>{pad(h)}:{pad(m)}</Text>
      </View>
      <Txt v="label" style={{ marginBottom: 8 }}>{t('common.hour')}</Txt>
      <Grid items={HOURS} cols={6} selected={h} onPick={setH} render={pad} />
      <Txt v="label" style={{ marginTop: 16, marginBottom: 8 }}>{t('common.minute')}</Txt>
      <Grid items={MINUTES} cols={6} selected={m} onPick={setM} render={(v) => ':' + pad(v)} />
      <Button title={t('common.ok')} style={{ marginTop: 18 }} onPress={() => { onPick(`${pad(h)}:${pad(m)}`); onClose(); }} />
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
        <Chip icon="time-outline" label={value || t('common.pickTime')} selected={!!value} onPress={() => setOpen(true)} />
      </Row>
      <TimePickerSheet visible={open} value={value} onPick={onChange} onClose={() => setOpen(false)} />
    </>
  );
}
