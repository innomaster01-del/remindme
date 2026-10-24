import React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { useI18n, Row, Txt, Check, Icon, Card, IconBtn } from './ui';
import { C, R } from './theme';
import { isDoneOn, isRecurring, nextBirthday } from './logic/recurrence';
import { diffDays } from './logic/dates';

export function TaskRow({ task, date, onToggle, onPress, right, showDate }) {
  const { t, f } = useI18n();
  const done = date ? isDoneOn(task, date) : task.status === 'done';
  const meta = [];
  if (showDate && task.date) meta.push({ icon: 'calendar-outline', text: f.short(task.date) });
  if (task.time) meta.push({ icon: 'alarm-outline', text: task.time });
  if (isRecurring(task)) meta.push({ icon: 'repeat', text: t(`task.${task.repeat.type}`) });
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Row style={{ paddingVertical: 12, paddingHorizontal: 4 }} gap={12} align="center">
        <Check checked={done} onPress={onToggle} />
        <View style={{ flex: 1, gap: 3 }}>
          <Row gap={6}>
            {task.priority === 'high' && !done ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.high }} /> : null}
            <Txt style={[{ flexShrink: 1 }, done && { color: C.faint, textDecorationLine: 'line-through' }]} numberOfLines={2}>{task.title}</Txt>
          </Row>
          {meta.length ? (
            <Row gap={10}>
              {meta.map((m, i) => (
                <Row key={i} gap={3}>
                  <Icon name={m.icon} size={13} color={C.muted} />
                  <Txt v="tiny">{m.text}</Txt>
                </Row>
              ))}
            </Row>
          ) : null}
        </View>
        {right}
      </Row>
    </Pressable>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: C.line, marginHorizontal: 4 }} />;
}

export function Group({ children }) {
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <Card style={{ paddingVertical: 2, paddingHorizontal: 10 }}>
      {kids.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <Divider /> : null}
          {k}
        </React.Fragment>
      ))}
    </Card>
  );
}

export function BirthdayRow({ person, from, onPress, compact }) {
  const { t, f } = useI18n();
  const { date, age } = nextBirthday(person, from);
  const n = diffDays(from, date);
  const when = n === 0 ? t('person.isToday') : n === 1 ? t('common.tomorrow') : t('person.inDays', { n });
  const initials = person.name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Row style={{ paddingVertical: compact ? 9 : 12, paddingHorizontal: 4 }} gap={12}>
        <View style={{
          width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
          backgroundColor: n === 0 ? C.bday : C.bdaySoft,
        }}>
          {n === 0 ? <Icon name="gift" size={20} color="#fff" /> : <Txt v="h2" style={{ color: C.bday }} center>{initials}</Txt>}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontWeight: '600' }} numberOfLines={1}>{person.name}</Txt>
          <Txt v="tiny">
            {f.dayMonth(person.day, person.month)}{age ? ' · ' + t('person.turns', { n: age }) : ''}
          </Txt>
        </View>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <View style={{ backgroundColor: n === 0 ? C.bday : n <= 7 ? C.bdaySoft : C.bg, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Txt v="tiny" style={{ color: n === 0 ? '#fff' : n <= 7 ? C.bday : C.muted, fontWeight: '700' }}>{when}</Txt>
          </View>
        </View>
        {person.phone && n <= 1 ? (
          <IconBtn name="call" color={C.primary} bg={C.primarySoft} size={18} label={t('today.call')}
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
  const preview = list.items.filter((i) => !i.checked).slice(0, 4).map((i) => i.name).join(' · ');
  const isDone = list.status === 'done';
  return (
    <Card onPress={onPress} style={{ marginBottom: 10, opacity: isDone ? 0.6 : 1 }}>
      <Row gap={12} align="flex-start">
        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: C.shopSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={isDone ? 'checkmark-done' : 'cart'} size={21} color={C.shop} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Row justify="space-between">
            <Txt v="h2" style={{ flex: 1 }} numberOfLines={1}>{list.title}</Txt>
            {total ? <Txt v="tiny" style={{ fontWeight: '700' }}>{t('list.progress', { done, total })}</Txt> : null}
          </Row>
          <Row gap={10}>
            {showDate && list.date ? (
              <Row gap={3}><Icon name="calendar-outline" size={13} color={C.muted} /><Txt v="tiny">{f.short(list.date)}</Txt></Row>
            ) : null}
            {list.time ? <Row gap={3}><Icon name="alarm-outline" size={13} color={C.muted} /><Txt v="tiny">{list.time}</Txt></Row> : null}
            {total && !isDone ? <Txt v="tiny">{left ? t('today.itemsLeft', { n: left }) : t('today.allBought')}</Txt> : null}
          </Row>
          {preview ? <Txt v="small" style={{ color: C.muted }} numberOfLines={1}>{preview}</Txt> : null}
          {total ? (
            <View style={{ height: 5, borderRadius: 3, backgroundColor: C.shopSoft, marginTop: 4, overflow: 'hidden' }}>
              <View style={{ height: 5, width: `${Math.round(pct * 100)}%`, backgroundColor: C.shop, borderRadius: 3, alignSelf: dir.row === 'row-reverse' ? 'flex-end' : 'flex-start' }} />
            </View>
          ) : null}
        </View>
      </Row>
    </Card>
  );
}
