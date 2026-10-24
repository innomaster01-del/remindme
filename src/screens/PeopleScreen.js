import React, { useState } from 'react';
import { View, ScrollView, Alert, Pressable, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useI18n, Row, Txt, Section, Empty, Chip, Input, Field, Button, Page, Toggle, Card, IconBtn, useToast } from '../ui';
import { hebrewFromDateStr, formatHebrew } from '../logic/hebrew';
import { BirthdayRow, Group } from '../components';
import { TimeField } from '../pickers';
import { C, R, ff, shadow } from '../theme';
import { todayStr, daysInMonth } from '../logic/dates';
import { nextBirthday } from '../logic/recurrence';

export default function PeopleScreen({ nav, now }) {
  const { data } = useStore();
  const { t, f } = useI18n();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const today = todayStr(now);
  const people = data.people
    .filter((p) => !q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase()))
    .map((p) => ({ p, next: nextBirthday(p, today).date }))
    .sort((a, b) => a.next.localeCompare(b.next));

  // group by month of the next birthday
  const groups = [];
  for (const it of people) {
    const key = it.next.slice(0, 7);
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) { g = { key, items: [] }; groups.push(g); }
    g.items.push(it);
  }

  return (
    <Page big title={t('tabs.people')} onBack={nav.pop}
      right={<IconBtn name="add" bg={C.bday} color={C.onPrimary} onPress={() => nav.push('person', {})} label={t('person.new')} />}>
      {data.people.length > 6 ? (
        <Input value={q} onChangeText={setQ} placeholder="🔍" style={{ marginTop: 14 }} />
      ) : null}
      {data.people.length === 0 ? <Empty icon="gift-outline" color={C.bday} body={t('person.empty')}
        action={<Button title={t('person.new')} icon="add" color={C.bday} onPress={() => nav.push('person', {})} style={{ marginTop: 8 }} />} /> : null}
      {groups.map((g) => (
        <Section key={g.key} title={f.monthTitle(Number(g.key.slice(0, 4)), Number(g.key.slice(5)) - 1)} count={String(g.items.length)}>
          <Group>
            {g.items.map(({ p }) => <BirthdayRow key={p.id} person={p} from={today} onPress={() => nav.push('person', { id: p.id })} />)}
          </Group>
        </Section>
      ))}
    </Page>
  );
}

export function PersonEditor({ nav, params }) {
  const { data, actions } = useStore();
  const { t, f, lang } = useI18n();
  const toast = useToast();
  const existing = params.id ? data.people.find((x) => x.id === params.id) : null;
  const [p, setP] = useState(() => existing || {
    name: '', day: params.day || null, month: params.month || null, year: null, phone: '', notes: '',
    remindOnDay: true, remindDayBefore: false, time: data.settings.defaultTime || '09:00', feb29: 'feb28',
  });
  const [err, setErr] = useState(null);
  const set = (patch) => setP((x) => ({ ...x, ...patch }));
  const maxDay = p.month ? daysInMonth(2024, p.month - 1) : 31; // 2024 is a leap year → Feb has 29
  const yr = Number(p.year);
  const validYear = !!(p.day && p.month && yr >= 1900 && yr <= new Date().getFullYear());
  const pad2 = (n) => String(n).padStart(2, '0');
  const birthStr = validYear ? `${yr}-${pad2(p.month)}-${pad2(Math.min(p.day, daysInMonth(yr, p.month - 1)))}` : null;

  const save = () => {
    if (!p.name.trim()) { setErr(t('person.nameRequired')); return; }
    if (!p.day || !p.month) { setErr(t('person.birthday')); return; }
    const clean = { ...p, name: p.name.trim(), day: Math.min(p.day, maxDay), year: p.year ? Number(p.year) || null : null, hebrew: !!p.hebrew && validYear };
    const dup = data.people.find((x) => x.id !== p.id && x.name.trim().toLowerCase() === clean.name.toLowerCase() && x.day === clean.day && x.month === clean.month);
    const doSave = () => { actions.savePerson(clean); nav.pop(); };
    if (dup) {
      Alert.alert(t('person.duplicate'), '', [{ text: t('common.cancel'), style: 'cancel' }, { text: t('common.save'), onPress: doSave }]);
    } else doSave();
  };
  const remove = () => Alert.alert(t('common.confirmDelete'), p.name, [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), style: 'destructive', onPress: () => {
      const snap = existing; actions.deletePerson(p.id); nav.pop();
      toast({ text: `${t('toast.deleted')}: ${p.name}`, icon: 'trash', action: t('toast.undo'), onAction: () => actions.restorePerson(snap) });
    } },
  ]);

  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const dayRows = [];
  for (let i = 0; i < days.length; i += 7) dayRows.push(days.slice(i, i + 7));

  return (
    <Page
      title={existing ? t('person.edit') : t('person.new')}
      onBack={nav.pop}
      right={existing ? <Button small variant="danger" icon="trash-outline" title={t('common.delete')} onPress={remove} /> : null}
      footer={<Button title={t('common.save')} icon="checkmark" onPress={save} />}
    >
      <Field label={t('person.name')}>
        <Input value={p.name} onChangeText={(v) => { set({ name: v }); setErr(null); }} placeholder={t('person.namePh')}
          autoFocus={!existing} style={{ fontSize: 19, ...ff(600) }} />
      </Field>

      <Field label={t('person.month')}>
        <View style={{ gap: 6 }}>
          {[0, 1, 2, 3].map((r) => (
            <Row key={r} gap={6}>
              {[0, 1, 2].map((c) => {
                const m = r * 3 + c + 1;
                return <Chip key={m} label={f.monthName(m - 1)} selected={p.month === m} color={C.bday}
                  style={{ flex: 1, paddingHorizontal: 4 }} onPress={() => { set({ month: m }); setErr(null); }} />;
              })}
            </Row>
          ))}
        </View>
      </Field>

      <Field label={t('person.day')}>
        <View style={{ gap: 6 }}>
          {dayRows.map((r, ri) => (
            <Row key={ri} gap={6}>
              {r.map((d) => {
                const sel = p.day === d;
                return (
                  <Pressable key={d} onPress={() => { set({ day: d }); setErr(null); }} style={{
                    flex: 1, height: 40, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: sel ? C.bday : C.card,
                  }}>
                    <Text style={{ color: sel ? C.onPrimary : C.ink, ...ff(sel ? 700 : 500) }}>{d}</Text>
                  </Pressable>
                );
              })}
              {r.length < 7 ? Array.from({ length: 7 - r.length }, (_, i) => <View key={'e' + i} style={{ flex: 1 }} />) : null}
            </Row>
          ))}
        </View>
      </Field>
      {p.day && p.month ? (
        <Card tint={C.bdaySoft} style={{ marginBottom: 18, shadowOpacity: 0, elevation: 0 }}>
          <Txt v="h2" center style={{ color: C.bday }}>🎂 {f.dayMonth(Math.min(p.day, maxDay), p.month)}</Txt>
        </Card>
      ) : null}
      {err ? <Txt v="small" style={{ color: C.danger, marginBottom: 12 }}>{err}</Txt> : null}

      {p.month === 2 && p.day === 29 ? (
        <Field label={t('person.feb29')}>
          <Row gap={8}>
            <Chip label={t('person.feb28')} selected={p.feb29 !== 'mar1'} onPress={() => set({ feb29: 'feb28' })} color={C.bday} />
            <Chip label={t('person.mar1')} selected={p.feb29 === 'mar1'} onPress={() => set({ feb29: 'mar1' })} color={C.bday} />
          </Row>
        </Field>
      ) : null}

      <Row gap={10} align="flex-start">
        <Field label={`${t('person.year')} (${t('common.optional')})`} style={{ flex: 1 }}>
          <Input value={p.year ? String(p.year) : ''} onChangeText={(v) => set({ year: v.replace(/\D/g, '').slice(0, 4) })}
            keyboardType="number-pad" placeholder="1990" />
        </Field>
        <Field label={`${t('person.phone')} (${t('common.optional')})`} style={{ flex: 1.4 }}>
          <Input value={p.phone} onChangeText={(v) => set({ phone: v })} keyboardType="phone-pad" placeholder="050-0000000" />
        </Field>
      </Row>

      <Card style={{ marginBottom: 22, paddingVertical: 4 }}>
        <Toggle icon="star" color={C.holiday} label={t('person.hebrew')}
          hint={validYear ? (p.hebrew ? t('person.hebrewBorn', { date: formatHebrew(lang, hebrewFromDateStr(birthStr)) }) : t('person.hebrewHint')) : t('person.hebrewNeedsYear')}
          value={!!p.hebrew && validYear} onChange={(v) => { if (validYear) set({ hebrew: v }); }} />
      </Card>

      <Field label={t('person.remind')}>
        <Card style={{ paddingVertical: 4 }}>
          <Toggle label={t('person.onDay')} value={p.remindOnDay} onChange={(v) => set({ remindOnDay: v })} />
          <Toggle label={t('person.dayBefore')} value={p.remindDayBefore} onChange={(v) => set({ remindDayBefore: v })} />
          <Toggle label={t('person.weekBefore')} value={p.remindWeekBefore} onChange={(v) => set({ remindWeekBefore: v })} />
        </Card>
        <TimeField value={p.time} onChange={(v) => set({ time: v })} allowNone={false} />
      </Field>

      <Field label={t('common.notes')}>
        <Input value={p.notes} onChangeText={(v) => set({ notes: v })} placeholder={t('person.notesPh')} multiline />
      </Field>
    </Page>
  );
}
