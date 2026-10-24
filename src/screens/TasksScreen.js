import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useI18n, Row, Txt, Section, Empty, Chip, Input, Field, Button, Page, Segmented } from '../ui';
import { TaskRow, Group } from '../components';
import { DateField, TimeField } from '../pickers';
import { C, ff, shadow } from '../theme';
import { todayStr, addDays, weekday } from '../logic/dates';
import { isRecurring, occursOn } from '../logic/recurrence';

export default function TasksScreen({ nav, now }) {
  const { data, actions } = useStore();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('open');
  const today = todayStr(now);
  const tomorrow = addDays(today, 1);

  const open = data.tasks.filter((x) => x.status === 'open');
  const done = data.tasks.filter((x) => x.status === 'done').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const byDate = (a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '99').localeCompare(b.time || '99');

  const groups = [
    { key: 'overdue', title: t('task.overdue'), color: C.high, items: open.filter((x) => !isRecurring(x) && x.date && x.date < today) },
    { key: 'today', title: t('common.today'), color: C.primary, items: open.filter((x) => x.date && occursOn(x, today)) },
    { key: 'tomorrow', title: t('common.tomorrow'), color: C.primary, items: open.filter((x) => x.date && !occursOn(x, today) && occursOn(x, tomorrow)) },
    { key: 'later', title: t('task.upcoming'), color: C.muted, items: open.filter((x) => x.date && x.date > tomorrow && !occursOn(x, today) && !occursOn(x, tomorrow)) },
    { key: 'recurring', title: t('task.repeat'), color: C.muted, items: open.filter((x) => isRecurring(x) && x.date && x.date <= tomorrow && !occursOn(x, today) && !occursOn(x, tomorrow)) },
    { key: 'nodate', title: t('task.noDate'), color: C.muted, items: open.filter((x) => !x.date) },
  ].map((g) => ({ ...g, items: g.items.sort(byDate) }));

  const rowDate = (x, key) => (key === 'today' ? today : key === 'tomorrow' ? tomorrow : x.date);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 120 }}>
      <Txt v="display">{t('tabs.tasks')}</Txt>
      <View style={{ marginTop: 14 }}>
        <Segmented value={tab} onChange={setTab} options={[
          { value: 'open', label: `${t('task.open')} (${open.length})` },
          { value: 'done', label: t('task.completed') },
        ]} />
      </View>

      {tab === 'open' ? (
        open.length === 0 ? <Empty icon="checkmark-done-outline" body={t('task.emptyOpen')} /> : (
          groups.filter((g) => g.items.length).map((g) => (
            <Section key={g.key} title={g.title} count={String(g.items.length)}>
              <Group>
                {g.items.map((x) => (
                  <TaskRow key={x.id} task={x} date={isRecurring(x) ? rowDate(x, g.key) : undefined}
                    showDate={g.key === 'later' || g.key === 'overdue'}
                    onToggle={() => actions.toggleTask(x.id, rowDate(x, g.key))}
                    onPress={() => nav.push('task', { id: x.id })} />
                ))}
              </Group>
            </Section>
          ))
        )
      ) : (
        done.length === 0 ? <Empty icon="list-outline" body={t('task.emptyDone')} /> : (
          <Section title={t('task.completed')}>
            <Group>
              {done.map((x) => (
                <TaskRow key={x.id} task={x} showDate onToggle={() => actions.toggleTask(x.id)} onPress={() => nav.push('task', { id: x.id })} />
              ))}
            </Group>
            <Button variant="ghost" small icon="trash-outline" title={t('common.delete')} style={{ marginTop: 10, alignSelf: 'center' }}
              onPress={() => Alert.alert(t('common.confirmDelete'), t('common.confirmDeleteBody'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.delete'), style: 'destructive', onPress: () => done.forEach((x) => actions.deleteTask(x.id)) },
              ])} />
          </Section>
        )
      )}
    </ScrollView>
  );
}

const REPEATS = ['none', 'daily', 'weekly', 'monthly'];

export function TaskEditor({ nav, params }) {
  const { data, actions } = useStore();
  const { t, f, dir } = useI18n();
  const existing = params.id ? data.tasks.find((x) => x.id === params.id) : null;
  const [task, setTask] = useState(() => existing || {
    title: '', notes: '', date: params.date || todayStr(), time: null, priority: 'normal',
    repeat: { type: 'none', days: [] }, status: 'open', doneDates: [],
  });
  const [err, setErr] = useState(null);
  const set = (patch) => setTask((x) => ({ ...x, ...patch }));
  const repeat = task.repeat || { type: 'none' };

  const save = () => {
    if (!task.title.trim()) { setErr(t('task.titleRequired')); return; }
    let r = repeat;
    if (r.type === 'weekly' && !(r.days || []).length) r = { ...r, days: [weekday(task.date || todayStr())] };
    if (r.type !== 'none' && !task.date) { set({ date: todayStr() }); }
    actions.saveTask({ ...task, title: task.title.trim(), repeat: r, date: r.type !== 'none' && !task.date ? todayStr() : task.date, snoozeUntil: null });
    nav.pop();
  };
  const remove = () => Alert.alert(t('common.confirmDelete'), task.title, [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), style: 'destructive', onPress: () => { actions.deleteTask(task.id); nav.pop(); } },
  ]);

  return (
    <Page
      title={existing ? t('task.edit') : t('task.new')}
      onBack={nav.pop}
      right={existing ? <Button small variant="danger" icon="trash-outline" title={t('common.delete')} onPress={remove} /> : null}
      footer={<Button title={t('common.save')} icon="checkmark" onPress={save} />}
    >
      <Field>
        <Input value={task.title} onChangeText={(v) => { set({ title: v }); setErr(null); }} placeholder={t('task.titlePh')}
          autoFocus={!existing} style={{ fontSize: 19, ...ff(600) }} returnKeyType="done" />
        {err ? <Txt v="small" style={{ color: C.danger }}>{err}</Txt> : null}
      </Field>
      <Field label={t('common.date')}>
        <DateField value={task.date} onChange={(v) => set({ date: v })} />
      </Field>
      <Field label={t('common.time')} hint={!task.time && task.date ? t('task.defaultReminder', { time: data.settings.defaultTime }) : null}>
        <TimeField value={task.time} onChange={(v) => set({ time: v })} />
      </Field>
      <Field label={t('task.repeat')} hint={repeat.type === 'monthly' ? t('task.monthlyNote') : null}>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {REPEATS.map((r) => (
            <Chip key={r} label={r === 'none' ? t('task.repeatNone') : t(`task.${r}`)} selected={repeat.type === r}
              onPress={() => set({ repeat: { type: r, days: r === 'weekly' ? (repeat.days?.length ? repeat.days : [weekday(task.date || todayStr())]) : [] } })} />
          ))}
        </Row>
        {repeat.type === 'weekly' ? (
          <View style={{ flexDirection: dir.row, gap: 6, marginTop: 6 }}>
            {f.weekdaysShort.map((w, i) => {
              const on = (repeat.days || []).includes(i);
              return (
                <Chip key={i} label={w} selected={on} style={{ flex: 1, paddingHorizontal: 0 }}
                  onPress={() => {
                    const days = on ? repeat.days.filter((d) => d !== i) : [...(repeat.days || []), i].sort();
                    set({ repeat: { ...repeat, days } });
                  }} />
              );
            })}
          </View>
        ) : null}
      </Field>
      <Field label={t('task.priority')}>
        <Row gap={8}>
          {['low', 'normal', 'high'].map((p) => (
            <Chip key={p} label={t(`task.${p}`)} selected={task.priority === p} color={p === 'high' ? C.high : C.primary}
              onPress={() => set({ priority: p })} style={{ flex: 1 }} />
          ))}
        </Row>
      </Field>
      <Field label={t('common.notes')}>
        <Input value={task.notes} onChangeText={(v) => set({ notes: v })} placeholder={t('task.notesPh')} multiline />
      </Field>
      {existing && !isRecurring(existing) && existing.status === 'open' ? (
        <Button variant="soft" icon="arrow-redo-outline" title={t('task.postpone')}
          onPress={() => { actions.postponeTask(existing.id, addDays(existing.date && existing.date > todayStr() ? existing.date : todayStr(), 1)); nav.pop(); }} />
      ) : null}
    </Page>
  );
}
