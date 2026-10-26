import React from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useI18n, Row, Txt, Section, Empty, Banner, Button, IconBtn, Icon, haptic, Glass } from '../ui';
import { TaskRow, Group, BirthdayRow, ListCard, QuickAdd } from '../components';
import { C, R, ff, shadow } from '../theme';
import { todayStr, addDays, diffDays, parseDate } from '../logic/dates';
import { isRecurring, nextBirthday, isDoneOn } from '../logic/recurrence';
import { hebrewFromDateStr, formatHebrew, holidayOn, holidayName } from '../logic/hebrew';
import { dayItems } from './CalendarScreen';

function greeting(t, h) {
  if (h >= 5 && h < 12) return t('greet.morning');
  if (h >= 12 && h < 17) return t('greet.noon');
  if (h >= 17 && h < 22) return t('greet.evening');
  return t('greet.night');
}
const skyIcon = (h) => (h >= 5 && h < 11 ? 'partly-sunny' : h >= 11 && h < 17 ? 'sunny' : h >= 17 && h < 21 ? 'cloudy-night' : 'moon');

function Hero({ date, isToday, hour, items, label }) {
  const { t, f, lang, dir } = useI18n();
  const { data } = useStore();
  const showHeb = data.settings.hebrewDate !== false;
  const heb = showHeb ? hebrewFromDateStr(date) : null;
  const hol = showHeb ? holidayOn(date) : null;
  const total = items.tasks.length;
  const done = items.tasks.filter((x) => isDoneOn(x, date)).length;
  const left = total - done;
  const pill = (icon, text, key) => (
    <View key={key} style={{ flexDirection: dir.row, alignItems: 'center', gap: 6, backgroundColor: C.sunken, borderRadius: R.pill, paddingHorizontal: 11, paddingVertical: 6 }}>
      <Icon name={icon} size={14} color={C.muted} />
      <Text numberOfLines={1} style={{ color: C.ink, fontSize: 13, writingDirection: dir.writing, ...ff(500) }}>{text}</Text>
    </View>
  );
  return (
    <Glass intensity={50} style={[{ borderRadius: R.xl, padding: 20, paddingBottom: 18 }, shadow(2)]}>
      <Row justify="space-between" align="flex-start">
        <View style={{ flex: 1 }}>
          {label ? <Txt v="small" style={{ color: C.primary, ...ff(600) }}>{label}</Txt> : null}
          <Txt v="display" style={{ marginTop: 2 }}>{f.long(date)}</Txt>
          {heb || hol ? (
            <Row gap={8} style={{ marginTop: 4, flexWrap: 'wrap' }}>
              {heb ? <Txt v="small" style={{ color: C.muted, ...ff(500) }}>{formatHebrew(lang, heb)}</Txt> : null}
              {hol ? (
                <View style={{ backgroundColor: C.primarySoft, borderRadius: R.pill, paddingHorizontal: 9, paddingVertical: 2 }}>
                  <Txt v="tiny" style={{ color: C.primary, ...ff(700) }}>{holidayName(lang, hol.key)}</Txt>
                </View>
              ) : null}
            </Row>
          ) : null}
        </View>
        {isToday ? <Icon name={skyIcon(hour)} size={30} color={C.primary} /> : null}
      </Row>

      {data.settings.modules.tasks ? (
        <View style={{ marginTop: 18 }}>
          <Row justify="space-between">
            <Txt v="strong" style={{ ...ff(600) }}>
              {total === 0 ? t('hero.free') : left === 0 ? t('hero.allDone') : t('hero.tasksLeft', { n: left })}
            </Txt>
            {total ? <Txt v="strong" style={{ color: C.primary, ...ff(700) }}>{t('hero.done', { done, total })}</Txt> : null}
          </Row>
          {total ? (
            <View style={{ height: 6, borderRadius: 3, backgroundColor: C.sunken, marginTop: 10, overflow: 'hidden' }}>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: C.primary, width: `${Math.round((done / total) * 100)}%`, alignSelf: dir.start }} />
            </View>
          ) : null}
        </View>
      ) : null}

      {items.people.length || items.lists.length ? (
        <Row gap={8} style={{ marginTop: 14, flexWrap: 'wrap' }}>
          {items.people.slice(0, 2).map((p) => pill('gift-outline', t('hero.bday', { name: p.name }), p.id))}
          {items.lists.length ? pill('basket-outline', t('hero.lists', { n: items.lists.length }), 'lists') : null}
        </Row>
      ) : null}
    </Glass>
  );
}

function WeekStrip({ today, date, onPick, data }) {
  const { f, dir } = useI18n();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  return (
    <View style={{ flexDirection: dir.row, gap: 6, marginTop: 14 }}>
      {days.map((d) => {
        const sel = d === date;
        const it = dayItems(data, d);
        const has = it.tasks.length || it.people.length || it.lists.length;
        return (
          <Pressable key={d} onPress={() => { haptic(); onPick(d); }} style={({ pressed }) => [{
            flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: R.md, gap: 2,
            backgroundColor: sel ? C.primary : C.card, transform: [{ scale: pressed ? 0.96 : 1 }],
          }, sel ? null : shadow(1)]}>
            <Text style={{ fontSize: 11.5, color: sel ? 'rgba(255,255,255,0.8)' : C.faint, ...ff(600) }}>{f.weekdaysShort[parseDate(d).getDay()]}</Text>
            <Text style={{ fontSize: 17, color: sel ? C.onPrimary : C.ink, ...ff(700) }}>{Number(d.slice(8))}</Text>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: has ? (sel ? C.onPrimary : C.primary) : 'transparent' }} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TodayScreen({ nav, date, setDate, notifState, now, openDay }) {
  const { data, actions } = useStore();
  const { t, f } = useI18n();
  const insets = useSafeAreaInsets();
  const today = todayStr(now);
  const isToday = date === today;
  const mods = data.settings.modules;

  const items = dayItems(data, date);
  const byTime = (a, b) => (a.time || '99').localeCompare(b.time || '99') || (b.priority === 'high') - (a.priority === 'high');
  const dayTasks = items.tasks.slice().sort(byTime);
  const overdue = mods.tasks && isToday
    ? data.tasks.filter((x) => x.status === 'open' && !isRecurring(x) && x.date && x.date < today).sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const upcoming = mods.birthdays && isToday
    ? data.people
      .map((p) => ({ p, n: diffDays(today, nextBirthday(p, addDays(today, 1)).date) }))
      .filter((x) => x.n >= 1 && x.n <= 7)
      .sort((a, b) => a.n - b.n)
    : [];
  const leftoverLists = mods.shopping && isToday
    ? data.lists.filter((l) => l.status !== 'done' && l.date && l.date < today && l.items.some((i) => !i.checked))
    : [];

  const openToday = dayTasks.filter((x) => !isRecurring(x) && x.status === 'open');
  const endOfDay = isToday && now.getHours() >= 19 && openToday.length > 0;
  const nothing = !dayTasks.length && !overdue.length && !items.people.length && !upcoming.length && !items.lists.length && !leftoverLists.length;

  const label = isToday ? greeting(t, now.getHours())
    : date === addDays(today, 1) ? t('common.tomorrow') : date === addDays(today, -1) ? t('common.yesterday') : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 6, paddingBottom: 130 }}>
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <Row gap={8}>
          <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="notifications" size={16} color={C.onPrimary} />
          </View>
          <Txt v="h2">{t('appName')}</Txt>
        </Row>
        <Row gap={6}>
          {mods.birthdays ? <IconBtn name="gift-outline" bg={C.card} onPress={() => nav.push('people')} label={t('a11y.birthdays')} badge={upcoming.length > 0 || items.people.length > 0} /> : null}
          <IconBtn name="settings-outline" bg={C.card} onPress={() => nav.push('settings')} label={t('a11y.settings')} />
        </Row>
      </Row>

      <Hero date={date} isToday={isToday} hour={now.getHours()} items={items} label={label} />
      <WeekStrip today={today} date={date} onPick={openDay} data={data} />
      {mods.tasks ? <QuickAdd defaultDate={date} /> : null}
      {!isToday && (date < today || date > addDays(today, 6)) ? (
        <Row style={{ marginTop: 10 }}><Button small variant="soft" icon="today-outline" title={t('today.backToToday')} onPress={() => setDate(today)} /></Row>
      ) : null}

      {notifState === 'denied' ? (
        <Banner icon="notifications-off-outline" text={t('banner.noPermission')} action={t('banner.fix')} onAction={() => nav.push('settings')} />
      ) : null}
      {notifState === 'horizon' ? (
        <Banner icon="information-circle-outline" color={C.primary} soft={C.primarySoft} text={t('banner.horizon')} />
      ) : null}

      {nothing ? <Empty icon="sparkles-outline" title={t('today.emptyTitle')} body={t('today.emptyBody')} /> : null}

      {endOfDay ? (
        <Banner icon="moon-outline" color={C.primary} soft={C.primarySoft} text={t('today.endOfDay')}
          action={t('today.moveAllTomorrow')} onAction={() => actions.postponeMany(openToday.map((x) => x.id), addDays(today, 1))} />
      ) : null}

      {items.people.length ? (
        <Section title={t('today.birthdays')} icon="gift" color={C.bday}>
          <Group>
            {items.people.map((p) => (
              <BirthdayRow key={p.id} person={p} from={date} onPress={() => nav.push('person', { id: p.id })} />
            ))}
          </Group>
        </Section>
      ) : null}

      {dayTasks.length ? (
        <Section title={t('today.tasks')} icon="checkmark" color={C.primary}>
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

      {items.lists.length ? (
        <Section title={t('today.shopping')} icon="basket" color={C.shop}>
          {items.lists.map((l) => <ListCard key={l.id} list={l} onPress={() => nav.push('list', { id: l.id })} />)}
        </Section>
      ) : null}

      {leftoverLists.length ? (
        <Section title={t('list.leftover', { date: f.short(leftoverLists[0].date) })} icon="basket-outline" color={C.shop}>
          {leftoverLists.map((l) => <ListCard key={l.id} list={l} showDate onPress={() => nav.push('list', { id: l.id })} />)}
        </Section>
      ) : null}

      {upcoming.length ? (
        <Section title={t('today.upcoming')} icon="calendar" color={C.bday}>
          <Group>
            {upcoming.map(({ p }) => (
              <BirthdayRow key={p.id} compact person={p} from={today} onPress={() => nav.push('person', { id: p.id })} />
            ))}
          </Group>
        </Section>
      ) : null}
    </ScrollView>
  );
}

export function AddSheetContent({ onPick, mods = {} }) {
  const { t, dir } = useI18n();
  const opts = [
    { key: 'task', icon: 'checkmark-circle', color: C.primary, soft: C.primarySoft, label: t('add.task') },
    { key: 'list', icon: 'basket', color: C.shop, soft: C.shopSoft, label: t('add.list') },
    { key: 'person', icon: 'gift', color: C.bday, soft: C.bdaySoft, label: t('add.person') },
    { key: 'note', icon: 'document-text', color: C.primary, soft: C.primarySoft, label: t('add.note') },
  ].filter((o) => mods[{ task: 'tasks', list: 'shopping', person: 'birthdays', note: 'notes' }[o.key]] !== false);
  return (
    <View style={{ flexDirection: dir.row, gap: 10, flexWrap: 'wrap' }}>
      {opts.map((o) => (
        <Pressable key={o.key} onPress={() => { haptic(); onPick(o.key); }} style={({ pressed }) => [{
          width: opts.length > 3 ? '48%' : undefined, flex: opts.length > 3 ? undefined : 1,
          backgroundColor: C.card, borderRadius: R.lg, paddingVertical: 18, alignItems: 'center', gap: 10,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        }, shadow(1)]}>
          <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: o.soft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={o.icon} size={28} color={o.color} />
          </View>
          <Txt v="small" center style={{ ...ff(600) }}>{o.label}</Txt>
        </Pressable>
      ))}
    </View>
  );
}
