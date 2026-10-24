import React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { useI18n, Row, Txt, Check, Icon, Card, IconBtn } from './ui';
import { C, R, ff } from './theme';
import { isDoneOn, isRecurring, nextBirthday } from './logic/recurrence';
import { diffDays } from './logic/dates';

function Meta({ icon, text, color }) {
  return (
    <Row gap={4}>
      <Icon name={icon} size={13} color={color || C.muted} />
      <Txt v="tiny" style={color ? { color } : null}>{text}</Txt>
    </Row>
  );
}

export function TaskRow({ task, date, onToggle, onPress, right, showDate }) {
  const { t, f } = useI18n();
  const done = date ? isDoneOn(task, date) : task.status === 'done';
  const high = task.priority === 'high' && !done;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Row style={{ paddingVertical: 13, paddingHorizontal: 4 }} gap={14} align="center">
        <Check checked={done} onPress={onToggle} color={high ? C.high : C.primary} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt v="strong" style={done ? { color: C.faint, textDecorationLine: 'line-through' } : null} numberOfLines={2}>{task.title}</Txt>
          {(showDate && task.date) || task.time || isRecurring(task) || high ? (
            <Row gap={12} style={{ flexWrap: 'wrap' }}>
              {task.time ? <Meta icon="alarm-outline" text={task.time} color={done ? C.faint : C.primary} /> : null}
              {showDate && task.date ? <Meta icon="calendar-clear-outline" text={f.short(task.date)} /> : null}
              {isRecurring(task) ? <Meta icon="repeat" text={t(`task.${task.repeat.type}`)} /> : null}
              {high ? <Meta icon="flag" text={t('task.high')} color={C.high} /> : null}
            </Row>
          ) : null}
        </View>
        {right}
      </Row>
    </Pressable>
  );
}

export function Group({ children, style }) {
  const { dir } = useI18n();
  const inset = dir.row === 'row-reverse' ? { marginRight: 44 } : { marginLeft: 44 };
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <Card style={[{ paddingVertical: 2, paddingHorizontal: 12 }, style]}>
      {kids.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <View style={[{ height: 1, backgroundColor: C.line }, inset]} /> : null}
          {k}
        </React.Fragment>
      ))}
    </Card>
  );
}

export function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
}

export function BirthdayRow({ person, from, onPress, compact }) {
  const { t, f } = useI18n();
  const { date, age } = nextBirthday(person, from);
  const n = diffDays(from, date);
  const isToday = n === 0;
  const when = isToday ? t('person.isToday') : n === 1 ? t('common.tomorrow') : t('person.inDays', { n });
  const size = compact ? 40 : 46;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Row style={{ paddingVertical: compact ? 10 : 12, paddingHorizontal: 2 }} gap={12}>
        <View style={{
          width: size, height: size, borderRadius: size / 2.6, alignItems: 'center', justifyContent: 'center',
          backgroundColor: isToday ? C.bday : C.bdaySoft,
        }}>
          {isToday ? <Icon name="gift" size={21} color={C.onPrimary} /> : <Txt v="h2" style={{ color: C.bday }} center>{initials(person.name)}</Txt>}
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Txt v="strong" numberOfLines={1}>{person.name}</Txt>
          <Row gap={10} style={{ flexWrap: 'wrap' }}>
            <Txt v="tiny" style={{ ...ff(400) }}>{f.dayMonth(person.day, person.month)}</Txt>
            {age ? <Txt v="tiny" style={{ color: C.bday }}>{t('person.turns', { n: age })}</Txt> : null}
          </Row>
        </View>
        <View style={{
          backgroundColor: isToday ? C.bday : n <= 7 ? C.bdaySoft : C.sunken,
          borderRadius: R.pill, paddingHorizontal: 11, paddingVertical: 5,
        }}>
          <Txt v="tiny" style={{ color: isToday ? C.onPrimary : n <= 7 ? C.bday : C.muted, ...ff(600) }}>{when}</Txt>
        </View>
        {person.phone && n <= 1 ? (
          <IconBtn name="call" color={C.onPrimary} bg={C.shop} size={18} label={t('today.call')}
            onPress={() => Linking.openURL(`tel:${person.phone.replace(/[^\d+]/g, '')}`)} />
        ) : null}
      </Row>
    </Pressable>
  );
}

export function ListCard({ list, onPress, showDate }) {
  const { t, f, dir } = useI18n();
  const total = list.items.length;
  const done = list.items.filter((i) => i.checked).length;
  const left = total - done;
  const pct = total ? done / total : 0;
  const preview = list.items.filter((i) => !i.checked).slice(0, 5).map((i) => i.name);
  const isDone = list.status === 'done';
  return (
    <Card onPress={onPress} style={{ marginBottom: 12, opacity: isDone ? 0.6 : 1 }}>
      <Row gap={14} align="flex-start">
        <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: C.shopSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={isDone ? 'checkmark-done' : 'basket'} size={23} color={C.shop} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Row justify="space-between" gap={8}>
            <Txt v="h2" style={{ flex: 1 }} numberOfLines={1}>{list.title}</Txt>
            {total ? <Txt v="tiny" style={{ color: C.shop, ...ff(700) }}>{t('list.progress', { done, total })}</Txt> : null}
          </Row>
          <Row gap={12} style={{ flexWrap: 'wrap' }}>
            {showDate && list.date ? <Meta icon="calendar-clear-outline" text={f.short(list.date)} /> : null}
            {list.time ? <Meta icon="alarm-outline" text={list.time} /> : null}
            {total && !isDone ? <Txt v="tiny" style={{ ...ff(400) }}>{left ? t('today.itemsLeft', { n: left }) : t('today.allBought')}</Txt> : null}
          </Row>
          {preview.length ? (
            <Row gap={6} style={{ flexWrap: 'wrap', marginTop: 2 }}>
              {preview.map((p, i) => (
                <View key={i} style={{ backgroundColor: C.sunken, borderRadius: R.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
                  <Txt v="tiny" style={{ color: C.ink, ...ff(400) }} numberOfLines={1}>{p}</Txt>
                </View>
              ))}
            </Row>
          ) : null}
          {total ? (
            <View style={{ height: 6, borderRadius: 3, backgroundColor: C.shopSoft, marginTop: 6, overflow: 'hidden' }}>
              <View style={{ height: 6, width: `${Math.round(pct * 100)}%`, backgroundColor: C.shop, borderRadius: 3, alignSelf: dir.start }} />
            </View>
          ) : null}
        </View>
      </Row>
    </Card>
  );
}

// Agenda line used in the calendar: colored rail + content.
export function AgendaRow({ color, icon, title, sub, onPress, done, right }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      <Row gap={12} style={{ paddingVertical: 11 }}>
        <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: C.sunken, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={18} color={color} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="strong" numberOfLines={1} style={done ? { color: C.faint, textDecorationLine: 'line-through' } : null}>{title}</Txt>
          {sub ? <Txt v="tiny" style={{ ...ff(400) }} numberOfLines={1}>{sub}</Txt> : null}
        </View>
        {right}
      </Row>
    </Pressable>
  );
}
