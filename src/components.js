import React, { useState } from 'react';
import { View, Pressable, Linking, TextInput } from 'react-native';
import { useI18n, Row, Txt, Check, Icon, Card, IconBtn, haptic, useToast, SwipeRow } from './ui';
import { useStore } from './store';
import { parseQuick } from './logic/quickparse';
import { todayStr, addDays as addD, diffDays } from './logic/dates';
import { C, R, ff } from './theme';
import { isDoneOn, isRecurring, nextBirthday, hebrewBirth } from './logic/recurrence';
import { formatHebrew } from './logic/hebrew';

function Meta({ icon, text, color }) {
  return (
    <Row gap={4}>
      <Icon name={icon} size={13} color={color || C.muted} />
      <Txt v="tiny" style={color ? { color } : null}>{text}</Txt>
    </Row>
  );
}

const openSubs = new Set(); // which tasks have their steps opened (kept while the app runs)

export function TaskRow({ task, date, onToggle, onPress, right, showDate, noSwipe }) {
  const { t, f, dir } = useI18n();
  const { actions } = useStore();
  const toast = useToast();
  const remove = () => {
    actions.deleteTask(task.id);
    toast({ text: `${t('toast.deleted')}: ${task.title}`, icon: 'trash', action: t('toast.undo'), onAction: () => actions.restoreTask(task) });
  };
  const done = date ? isDoneOn(task, date) : task.status === 'done';
  const high = task.priority === 'high' && !done;
  const subs = task.subtasks || [];
  const subsDone = subs.filter((x) => x.done).length;
  const [open, setOpen] = useState(openSubs.has(task.id));
  const toggleOpen = () => {
    haptic();
    if (open) openSubs.delete(task.id); else openSubs.add(task.id);
    setOpen(!open);
  };
  const inset = dir.row === 'row-reverse' ? { marginRight: 40 } : { marginLeft: 40 };
  const row = (
    <View>
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        <Row style={{ paddingVertical: 13, paddingHorizontal: 4 }} gap={14} align="center">
          <Check checked={done} onPress={onToggle} color={high ? C.high : C.primary} />
          {task.pinned ? <Icon name="pin" size={14} color={C.primary} /> : null}
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
          {subs.length ? (
            <Pressable onPress={toggleOpen} hitSlop={8} accessibilityLabel={t('sub.title')} style={({ pressed }) => ({
              flexDirection: dir.row, alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.pill,
              backgroundColor: open ? C.primary : C.primarySoft, opacity: pressed ? 0.8 : 1,
            })}>
              <Txt v="tiny" style={{ color: open ? C.onPrimary : C.primary, ...ff(700) }}>{`${subsDone}/${subs.length}`}</Txt>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} color={open ? C.onPrimary : C.primary} />
            </Pressable>
          ) : null}
          {right}
        </Row>
      </Pressable>
      {open && subs.length ? (
        <View style={[{ paddingBottom: 8 }, inset]}>
          {subs.map((s2) => (
            <Pressable key={s2.id} onPress={() => actions.toggleSubtask(task.id, s2.id)}>
              <Row gap={10} style={{ paddingVertical: 7 }}>
                <Check size={20} checked={s2.done} onPress={() => actions.toggleSubtask(task.id, s2.id)} />
                <Txt v="small" style={[{ flex: 1 }, s2.done ? { color: C.faint, textDecorationLine: 'line-through' } : null]}>{s2.title}</Txt>
              </Row>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
  if (noSwipe) return row;
  return <SwipeRow onDone={onToggle} onDelete={remove}>{row}</SwipeRow>;
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
  const { t, f, lang } = useI18n();
  const hb = hebrewBirth(person);
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
            <Txt v="tiny" style={{ ...ff(400) }}>{hb ? f.short(date) : f.dayMonth(person.day, person.month)}</Txt>
            {hb ? <Txt v="tiny" style={{ color: C.holiday, ...ff(500) }}>{formatHebrew(lang, hb, { withYear: false })}</Txt> : null}
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
          <Icon name={isDone ? 'checkmark-done' : 'basket-outline'} size={23} color={C.primary} />
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

// Free-text quick add: "מחר ב-8 להתקשר לאמא" → task with date + time.
export function QuickAdd({ defaultDate }) {
  const { t, f, dir } = useI18n();
  const { actions } = useStore();
  const toast = useToast();
  const [text, setText] = useState('');
  const [focus, setFocus] = useState(false);
  const parsed = text.trim() ? parseQuick(text) : null;
  const date = parsed ? (parsed.date || defaultDate || null) : null;
  const today = todayStr();
  const dateLabel = (d) => (d === today ? t('common.today') : d === addD(today, 1) ? t('common.tomorrow') : f.short(d));
  const submit = () => {
    if (!parsed || !parsed.title) return;
    haptic('success');
    actions.saveTask({
      title: parsed.title, notes: '', date, time: parsed.time, priority: 'normal',
      repeat: { type: 'none', days: [] }, status: 'open', doneDates: [],
    });
    const when = [date ? dateLabel(date) : t('quick.noDate'), parsed.time].filter(Boolean).join(' ');
    toast({ text: t('quick.added', { when }), icon: 'checkmark-circle' });
    setText('');
  };
  return (
    <View style={{ marginTop: 14 }}>
      {/* The container keeps the same style keys while focused: on Android (Fabric) a change that
          alters view flattening re-creates the native view and the field loses focus. */}
      <View collapsable={false} style={{
        flexDirection: dir.row, alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: R.lg,
        paddingHorizontal: 14, borderWidth: 1.5, borderColor: focus ? C.primary : C.glassBorder,
      }}>
        <Icon name="sparkles" size={18} color={C.primary} />
        <TextInput
          value={text}
          onChangeText={setText}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          accessibilityLabel="quick-add"
          placeholder={t('quick.ph')}
          placeholderTextColor={C.faint}
          onSubmitEditing={submit}
          returnKeyType="done"
          blurOnSubmit={false}
          submitBehavior="submit"
          selectionColor={C.primary}
          style={{ flex: 1, paddingVertical: 14, fontSize: 15.5, color: C.ink, textAlign: dir.align, writingDirection: dir.writing, ...ff(400) }}
        />
        {parsed && parsed.title ? <IconBtn name="arrow-up" size={20} color={C.onPrimary} bg={C.primary} onPress={submit} style={{ width: 34, height: 34 }} /> : null}
      </View>
      {parsed && (parsed.date || parsed.time) ? (
        <Row gap={8} style={{ marginTop: 8, paddingHorizontal: 6 }}>
          {date ? (
            <Row gap={4} style={{ backgroundColor: C.primarySoft, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Icon name="calendar-clear" size={13} color={C.primary} /><Txt v="tiny" style={{ color: C.primary, ...ff(600) }}>{dateLabel(date)}</Txt>
            </Row>
          ) : null}
          {parsed.time ? (
            <Row gap={4} style={{ backgroundColor: C.primarySoft, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Icon name="alarm" size={13} color={C.primary} /><Txt v="tiny" style={{ color: C.primary, ...ff(600) }}>{parsed.time}</Txt>
            </Row>
          ) : null}
          <Txt v="tiny" style={{ flex: 1, ...ff(400) }} numberOfLines={1}>{parsed.title}</Txt>
        </Row>
      ) : null}
    </View>
  );
}

// Checklist of steps inside a task.
export function Subtasks({ items, onChange, autoFocus }) {
  const { t, dir } = useI18n();
  const [text, setText] = useState('');
  const add = () => {
    const parts = text.split(/\n+/).map((x) => x.trim()).filter(Boolean);
    if (!parts.length) return;
    haptic();
    onChange([...items, ...parts.map((title) => ({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title, done: false }))]);
    setText('');
  };
  const done = items.filter((x) => x.done).length;
  return (
    <View style={{ backgroundColor: C.card, borderRadius: R.md, paddingHorizontal: 12, paddingVertical: 4 }}>
      {items.length ? (
        <View style={{ height: 4, borderRadius: 2, backgroundColor: C.sunken, marginTop: 10, marginBottom: 4, overflow: 'hidden' }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: C.primary, width: `${Math.round((done / items.length) * 100)}%`, alignSelf: dir.start }} />
        </View>
      ) : null}
      {items.map((s) => (
        <Row key={s.id} gap={12} style={{ paddingVertical: 9 }}>
          <Check size={22} checked={s.done} onPress={() => onChange(items.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))} />
          <Txt style={[{ flex: 1 }, s.done ? { color: C.faint, textDecorationLine: 'line-through' } : null]}>{s.title}</Txt>
          <IconBtn name="close" size={16} color={C.faint} style={{ width: 30, height: 30 }} label={t('common.delete')}
            onPress={() => onChange(items.filter((x) => x.id !== s.id))} />
        </Row>
      ))}
      <Row gap={10} style={{ paddingVertical: 4 }} collapsable={false}>
        <Icon name="add-circle-outline" size={22} color={C.primary} />
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          blurOnSubmit={false}
          submitBehavior="submit"
          returnKeyType="next"
          placeholder={t('sub.ph')}
          autoFocus={autoFocus}
          placeholderTextColor={C.faint}
          style={{ flex: 1, paddingVertical: 10, fontSize: 15.5, color: C.ink, textAlign: dir.align, writingDirection: dir.writing, ...ff(400) }}
        />
        {text.trim() ? <IconBtn name="arrow-up" size={18} color={C.onPrimary} bg={C.primary} onPress={add} style={{ width: 32, height: 32 }} /> : null}
      </Row>
    </View>
  );
}
