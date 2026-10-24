import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useI18n, Row, Txt, Section, Empty, Banner, Button, IconBtn, Icon } from '../ui';
import { TaskRow, Group, BirthdayRow, ListCard } from '../components';
import { C, R } from '../theme';
import { todayStr, addDays, diffDays } from '../logic/dates';
import { occursOn, isRecurring, nextBirthday, isBirthdayOn } from '../logic/recurrence';

function greeting(t, h) {
  if (h >= 5 && h < 12) return t('greet.morning');
  if (h >= 12 && h < 17) return t('greet.noon');
  if (h >= 17 && h < 22) return t('greet.evening');
  return t('greet.night');
}

export default function TodayScreen({ nav, date, setDate, notifState, now }) {
  const { data, actions } = useStore();
  const { t, f, dir } = useI18n();
  const insets = useSafeAreaInsets();
  const today = todayStr(now);
  const isToday = date === today;
  const mods = data.settings.modules;

  const byTime = (a, b) => (a.time || '99').localeCompare(b.time || '99') || (b.priority === 'high') - (a.priority === 'high');
  const dayTasks = mods.tasks ? data.tasks.filter((x) => x.status !== 'cancelled' && occursOn(x, date)).sort(byTime) : [];
  const overdue = mods.tasks && isToday
    ? data.tasks.filter((x) => x.status === 'open' && !isRecurring(x) && x.date && x.date < today).sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const birthdaysToday = mods.birthdays ? data.people.filter((p) => isBirthdayOn(p, date)) : [];
  const upcoming = mods.birthdays && isToday
    ? data.people
      .map((p) => ({ p, n: diffDays(today, nextBirthday(p, addDays(today, 1)).date) }))
      .filter((x) => x.n >= 1 && x.n <= 7)
      .sort((a, b) => a.n - b.n)
    : [];
  const lists = mods.shopping ? data.lists.filter((l) => l.date === date) : [];
  const leftoverLists = mods.shopping && isToday
    ? data.lists.filter((l) => l.status !== 'done' && l.date && l.date < today && l.items.some((i) => !i.checked))
    : [];

  const openToday = dayTasks.filter((x) => !isRecurring(x) && x.status === 'open');
  const endOfDay = isToday && now.getHours() >= 19 && openToday.length > 0;
  const nothing = !dayTasks.length && !overdue.length && !birthdaysToday.length && !upcoming.length && !lists.length && !leftoverLists.length;

  const label = isToday ? t('common.today') : date === addDays(today, 1) ? t('common.tomorrow') : date === addDays(today, -1) ? t('common.yesterday') : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 120 }}>
      <Txt v="muted" style={{ fontWeight: '600' }}>{isToday ? greeting(t, now.getHours()) : label || ' '}</Txt>
      <Row justify="space-between" style={{ marginTop: 2 }}>
        <Txt v="display" style={{ flex: 1 }}>{f.long(date)}</Txt>
      </Row>

      <Row style={{ marginTop: 12 }} gap={8}>
        <IconBtn name={dir.back} bg={C.card} onPress={() => setDate(addDays(date, -1))} />
        <View style={{ flex: 1, flexDirection: dir.row, gap: 6 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const d = addDays(today, i);
            const sel = d === date;
            return (
              <Pressable key={d} onPress={() => setDate(d)} style={{
                flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: R.md,
                backgroundColor: sel ? C.primary : C.card,
              }}>
                <Txt v="tiny" center style={{ color: sel ? '#cfe3da' : C.muted, fontWeight: '700' }}>{f.weekdaysShort[new Date(d.replace(/-/g, '/')).getDay()]}</Txt>
                <Txt center style={{ color: sel ? '#fff' : C.ink, fontWeight: '700' }}>{Number(d.slice(8))}</Txt>
              </Pressable>
            );
          })}
        </View>
        <IconBtn name={dir.fwd} bg={C.card} onPress={() => setDate(addDays(date, 1))} />
      </Row>
      {!isToday ? (
        <Row style={{ marginTop: 10 }}><Button small variant="soft" icon="today-outline" title={t('today.backToToday')} onPress={() => setDate(today)} /></Row>
      ) : null}

      {notifState === 'denied' ? (
        <Banner icon="notifications-off-outline" text={t('banner.noPermission')} action={t('banner.fix')} onAction={() => nav.setTab('settings')} />
      ) : null}
      {notifState === 'horizon' ? (
        <Banner icon="information-circle-outline" color={C.primary} soft={C.primarySoft} text={t('banner.horizon')} />
      ) : null}

      {nothing ? <Empty icon="sunny-outline" title={t('today.emptyTitle')} body={t('today.emptyBody')} /> : null}

      {endOfDay ? (
        <Banner icon="moon-outline" color={C.primary} soft={C.primarySoft} text={t('today.endOfDay')}
          action={t('today.moveAllTomorrow')} onAction={() => actions.postponeMany(openToday.map((x) => x.id), addDays(today, 1))} />
      ) : null}

      {birthdaysToday.length ? (
        <Section title={t('today.birthdays')} icon="gift" color={C.bday}>
          <Group>
            {birthdaysToday.map((p) => (
              <BirthdayRow key={p.id} person={p} from={date} onPress={() => nav.push('person', { id: p.id })} />
            ))}
          </Group>
        </Section>
      ) : null}

      {dayTasks.length ? (
        <Section title={t('today.tasks')} icon="checkbox" color={C.primary}>
          <Group>
            {dayTasks.map((x) => (
              <TaskRow key={x.id} task={x} date={date} onToggle={() => actions.toggleTask(x.id, date)} onPress={() => nav.push('task', { id: x.id })} />
            ))}
          </Group>
        </Section>
      ) : null}

      {overdue.length ? (
        <Section title={t('today.overdue')} icon="time" color={C.high}>
          <Group>
            {overdue.map((x) => (
              <TaskRow key={x.id} task={x} showDate onToggle={() => actions.toggleTask(x.id)} onPress={() => nav.push('task', { id: x.id })}
                right={<Button small variant="soft" title={t('common.today')} onPress={() => actions.postponeTask(x.id, today)} />} />
            ))}
          </Group>
        </Section>
      ) : null}

      {lists.length ? (
        <Section title={t('today.shopping')} icon="cart" color={C.shop}>
          {lists.map((l) => <ListCard key={l.id} list={l} onPress={() => nav.push('list', { id: l.id })} />)}
        </Section>
      ) : null}

      {leftoverLists.length ? (
        <Section title={t('list.leftover', { date: f.short(leftoverLists[0].date) })} icon="cart-outline" color={C.shop}>
          {leftoverLists.map((l) => <ListCard key={l.id} list={l} showDate onPress={() => nav.push('list', { id: l.id })} />)}
        </Section>
      ) : null}

      {upcoming.length ? (
        <Section title={t('today.upcoming')} icon="gift-outline" color={C.bday}>
          <Group>
            {upcoming.map(({ p }) => (
              <BirthdayRow key={p.id} compact person={p} from={addDays(today, 0)} onPress={() => nav.push('person', { id: p.id })} />
            ))}
          </Group>
        </Section>
      ) : null}
    </ScrollView>
  );
}

export function AddSheetContent({ onPick, mods = {} }) {
  const { t } = useI18n();
  const opts = [
    { key: 'task', icon: 'checkbox-outline', color: C.primary, soft: C.primarySoft, label: t('add.task') },
    { key: 'list', icon: 'cart-outline', color: C.shop, soft: C.shopSoft, label: t('add.list') },
    { key: 'person', icon: 'gift-outline', color: C.bday, soft: C.bdaySoft, label: t('add.person') },
  ].filter((o) => mods[{ task: 'tasks', list: 'shopping', person: 'birthdays' }[o.key]] !== false);
  return (
    <Row gap={10}>
      {opts.map((o) => (
        <Pressable key={o.key} onPress={() => onPick(o.key)} style={({ pressed }) => ({
          flex: 1, backgroundColor: C.card, borderRadius: R.lg, paddingVertical: 18, alignItems: 'center', gap: 10, opacity: pressed ? 0.8 : 1,
        })}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: o.soft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={o.icon} size={26} color={o.color} />
          </View>
          <Txt v="small" center style={{ fontWeight: '700' }}>{o.label}</Txt>
        </Pressable>
      ))}
    </Row>
  );
}
