// Pop-up for one day (from the home week strip or the calendar): what's on it, quick edits, and add.
import React from 'react';
import { View, Pressable } from 'react-native';
import { useStore } from './store';
import { useI18n, Row, Txt, Sheet, Icon, haptic } from './ui';
import { TaskRow, Group, BirthdayRow, ListCard } from './components';
import { C, R, ff, shadow } from './theme';
import { todayStr, addDays } from './logic/dates';
import { hebrewFromDateStr, formatHebrew, holidayOn, holidayName } from './logic/hebrew';
import { dayItems } from './screens/CalendarScreen';

export default function DaySheet({ date, onClose, nav }) {
  const { data, actions } = useStore();
  const { t, f, lang, dir } = useI18n();
  if (!date) return null;
  const items = dayItems(data, date);
  const showHeb = data.settings.hebrewDate !== false;
  const heb = showHeb ? hebrewFromDateStr(date) : null;
  const hol = showHeb ? holidayOn(date) : null;
  const today = todayStr();
  const label = date === today ? t('common.today') : date === addDays(today, 1) ? t('common.tomorrow') : null;
  const go = (name, params) => { onClose(); setTimeout(() => nav.push(name, params), 60); };
  const empty = !items.tasks.length && !items.people.length && !items.lists.length;
  const mods = data.settings.modules;
  const adds = [
    mods.tasks !== false && { key: 'task', icon: 'checkmark-circle-outline', label: t('add.task'), open: () => go('task', { date }) },
    mods.shopping !== false && { key: 'list', icon: 'basket-outline', label: t('add.list'), open: () => { onClose(); setTimeout(() => nav.newList(date), 60); } },
    mods.birthdays !== false && { key: 'person', icon: 'gift-outline', label: t('add.person'), open: () => go('person', { day: Number(date.slice(8)), month: Number(date.slice(5, 7)) }) },
  ].filter(Boolean);

  return (
    <Sheet visible={!!date} onClose={onClose}>
      <View style={{ marginBottom: 14 }}>
        {label ? <Txt v="small" style={{ color: C.primary, ...ff(600) }}>{label}</Txt> : null}
        <Txt v="title">{f.long(date)}</Txt>
        {heb || hol ? (
          <Row gap={8} style={{ marginTop: 4, flexWrap: 'wrap' }}>
            {heb ? <Txt v="muted">{formatHebrew(lang, heb)}</Txt> : null}
            {hol ? (
              <View style={{ backgroundColor: C.primarySoft, borderRadius: R.pill, paddingHorizontal: 9, paddingVertical: 2 }}>
                <Txt v="tiny" style={{ color: C.primary, ...ff(700) }}>{holidayName(lang, hol.key)}</Txt>
              </View>
            ) : null}
          </Row>
        ) : null}
      </View>

      {empty ? <Txt v="muted" style={{ marginBottom: 14 }}>{t('calendar.empty')}</Txt> : null}

      {items.people.length ? (
        <Group style={{ marginBottom: 12 }}>
          {items.people.map((p) => <BirthdayRow key={p.id} person={p} from={today} onPress={() => go('person', { id: p.id })} />)}
        </Group>
      ) : null}
      {items.tasks.length ? (
        <Group style={{ marginBottom: 12 }}>
          {items.tasks.slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99')).map((x) => (
            <TaskRow key={x.id} task={x} date={date} noSwipe onToggle={() => actions.toggleTask(x.id, date)} onPress={() => go('task', { id: x.id })} />
          ))}
        </Group>
      ) : null}
      {items.lists.map((l) => <ListCard key={l.id} list={l} onPress={() => go('list', { id: l.id })} />)}

      <Txt v="label" style={{ marginTop: 6, marginBottom: 10 }}>{t('calendar.add')}</Txt>
      <View style={{ flexDirection: dir.row, gap: 10 }}>
        {adds.map((a) => (
          <Pressable key={a.key} onPress={() => { haptic(); a.open(); }} style={({ pressed }) => [{
            flex: 1, backgroundColor: C.card, borderRadius: R.lg, paddingVertical: 16, alignItems: 'center', gap: 8,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          }, shadow(1)]}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={a.icon} size={24} color={C.primary} />
            </View>
            <Txt v="small" center style={{ ...ff(600) }}>{a.label}</Txt>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
