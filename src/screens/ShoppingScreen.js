import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Alert, Share, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useI18n, Row, Txt, Section, Empty, Chip, Input, Field, Button, Page, Check, IconBtn, Icon, Banner, Sheet, useToast, haptic, Segmented, SwipeRow, Toggle, Card } from '../ui';
import { itemsToText } from '../logic/listtext';
import { DEPARTMENTS, classify, deptName, deptOrder } from '../logic/departments';
import { ListCard, Group } from '../components';
import { DateField, TimeField, DatePickerSheet } from '../pickers';
import { C, R, ff, shadow } from '../theme';
import { todayStr, addDays } from '../logic/dates';

export default function ShoppingScreen({ nav, now }) {
  const { data } = useStore();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [showDone, setShowDone] = useState(false);
  const open = data.lists.filter((l) => l.status !== 'done');
  const dated = open.filter((l) => l.date).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
  const general = open.filter((l) => !l.date).sort((a, b) => b.createdAt - a.createdAt);
  const done = data.lists.filter((l) => l.status === 'done').sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 120 }}>
      <Txt v="display">{t('tabs.shopping')}</Txt>
      {data.lists.length === 0 ? (
        <Empty icon="cart-outline" body={t('list.empty')}
          action={<Button title={t('list.new')} icon="add" onPress={() => nav.push('listEdit', {})} style={{ marginTop: 8 }} />} />
      ) : null}
      {dated.length ? (
        <Section title={t('list.dated')} icon="calendar" color={C.shop}>
          {dated.map((l) => <ListCard key={l.id} list={l} showDate onPress={() => nav.push('list', { id: l.id })} />)}
        </Section>
      ) : null}
      {general.length ? (
        <Section title={t('list.general')} icon="cart" color={C.shop}>
          {general.map((l) => <ListCard key={l.id} list={l} onPress={() => nav.push('list', { id: l.id })} />)}
        </Section>
      ) : null}
      {done.length ? (
        <Section title={t('list.doneLists')} count={String(done.length)}
          right={<Button small variant="ghost" title={showDone ? '−' : '+'} onPress={() => setShowDone(!showDone)} />}>
          {showDone ? done.map((l) => <ListCard key={l.id} list={l} showDate onPress={() => nav.push('list', { id: l.id })} />) : null}
        </Section>
      ) : null}
    </ScrollView>
  );
}

export function ListEditor({ nav, params }) {
  const { data, actions } = useStore();
  const { t } = useI18n();
  const existing = params.id ? data.lists.find((x) => x.id === params.id) : null;
  const [l, setL] = useState(() => (existing
    ? { ...existing, remind: existing.remind !== false && !!existing.date }
    : { title: '', date: params.date === undefined ? null : params.date, time: null, note: '', remind: false }));
  const set = (patch) => setL((x) => ({ ...x, ...patch }));

  const save = () => {
    const title = l.title.trim() || t('list.defaultTitle');
    const { placeId, ...rest } = l;
    const id = actions.saveList({ ...rest, title, remind: !!(l.remind && l.date) });
    if (existing) nav.pop(); else nav.replace('list', { id, write: true });
  };

  return (
    <Page title={existing ? t('list.edit') : t('list.new')} onBack={nav.pop}
      footer={<Button title={t('common.save')} icon="checkmark" onPress={save} />}>
      <Field label={t('common.title')}>
        <Input value={l.title} onChangeText={(v) => set({ title: v })} placeholder={t('list.titlePh')} autoFocus={!existing}
          style={{ fontSize: 19, ...ff(600) }} />
      </Field>
      <Card style={{ paddingVertical: 4, marginBottom: 20 }}>
        <Toggle icon="notifications-outline" label={t('list.remindMe')} hint={l.remind ? null : t('list.justList')}
          value={l.remind} onChange={(v) => set({ remind: v, date: v && !l.date ? todayStr() : l.date })} />
      </Card>
      <Field label={`${t('common.date')} (${t('common.optional')})`}>
        <DateField value={l.date} onChange={(v) => set({ date: v, remind: v ? l.remind : false })} />
      </Field>
      {l.remind && l.date ? (
        <Field label={t('common.time')} hint={!l.time ? t('task.defaultReminder', { time: data.settings.defaultTime }) : null}>
          <TimeField value={l.time} onChange={(v) => set({ time: v })} />
        </Field>
      ) : null}
      <Field label={t('common.notes')}>
        <Input value={l.note} onChangeText={(v) => set({ note: v })} multiline />
      </Field>
    </Page>
  );
}

export function ListDetail({ nav, params }) {
  const { data, actions } = useStore();
  const { t, f, dir, lang } = useI18n();
  const toast = useToast();
  const list = data.lists.find((x) => x.id === params.id);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState(null);
  const [menu, setMenu] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const inputRef = useRef(null);
  const [mode, setMode] = useState(() => (params.write || (list && list.items.length === 0) ? 'write' : 'check'));
  const [draft, setDraft] = useState(() => (list ? itemsToText(list.items) : ''));
  const draftRef = useRef(draft);
  draftRef.current = draft;
  // Notepad mode: save the text back into items shortly after typing stops, and when leaving.
  useEffect(() => {
    if (mode !== 'write' || !list) return undefined;
    const timer = setTimeout(() => actions.setListText(list.id, draft), 500);
    return () => clearTimeout(timer);
  }, [draft, mode]);
  useEffect(() => () => { if (list && modeRef.current === 'write') actions.setListText(list.id, draftRef.current); }, []);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const switchMode = (m) => {
    if (m === mode) return;
    if (m === 'check') actions.setListText(list.id, draft);
    else setDraft(itemsToText(list.items));
    setMode(m);
  };
  if (!list) return null;

  const unchecked = list.items.filter((i) => !i.checked);
  const checked = list.items.filter((i) => i.checked);
  const allBought = list.items.length > 0 && unchecked.length === 0 && list.status !== 'done';

  const q = name.trim().toLowerCase();
  const inList = new Set(list.items.map((i) => i.name.toLowerCase()));
  const suggestions = q
    ? Object.values(data.itemHistory)
      .filter((h) => h.name.toLowerCase().startsWith(q) && h.name.toLowerCase() !== q && !inList.has(h.name.toLowerCase()))
      .sort((a, b) => b.count - a.count).slice(0, 5)
    : [];

  const add = (n = name) => {
    // Several items pasted at once (one per line or comma-separated) → add them all.
    const parts = n.split(/[\n,،;]+/).map((x) => x.trim()).filter(Boolean);
    if (parts.length > 1) {
      actions.addItems(list.id, parts);
      setName(''); setQty(''); setMsg(null);
      haptic('success');
      return;
    }
    const clean = n.trim();
    if (!clean) return;
    if (inList.has(clean.toLowerCase())) setMsg(t('list.dupItem', { name: clean })); else setMsg(null);
    actions.addItem(list.id, clean, qty);
    setName(''); setQty('');
    setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
  };

  const share = () => {
    const lines = [t('list.shareHeader', { title: list.title })];
    if (list.date) lines.push(f.long(list.date));
    lines.push('');
    for (const i of unchecked) lines.push(`☐ ${i.name}${i.qty ? ` — ${i.qty}` : ''}`);
    for (const i of checked) lines.push(`☑ ${i.name}${i.qty ? ` — ${i.qty}` : ''}`);
    Share.share({ message: lines.join('\n') });
  };

  const remove = () => Alert.alert(t('common.confirmDelete'), list.title, [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), style: 'destructive', onPress: () => {
      const snap = list; actions.deleteList(list.id); nav.pop();
      toast({ text: `${t('toast.deleted')}: ${snap.title}`, icon: 'trash', action: t('toast.undo'), onAction: () => actions.restoreList(snap) });
    } },
  ]);

  const removeItem = (item) => {
    const idx = list.items.findIndex((i) => i.id === item.id);
    actions.deleteItem(list.id, item.id);
    toast({ text: `${t('toast.deleted')}: ${item.name}`, action: t('toast.undo'), onAction: () => actions.restoreItem(list.id, item, idx) });
  };
  const ItemRow = ({ item }) => (
    <SwipeRow onDone={() => actions.toggleItem(list.id, item.id)} onDelete={() => removeItem(item)}>
    <Row style={{ paddingVertical: 11, paddingHorizontal: 4 }} gap={12}>
      <Check checked={item.checked} color={C.shop} onPress={() => actions.toggleItem(list.id, item.id)} />
      <Pressable style={{ flex: 1 }} onPress={() => actions.toggleItem(list.id, item.id)} onLongPress={() => setEditing({ ...item })}>
        <Txt style={item.checked ? { color: C.faint, textDecorationLine: 'line-through' } : null}>{item.name}</Txt>
      </Pressable>
      {item.qty ? (
        <View style={{ backgroundColor: item.checked ? C.bg : C.shopSoft, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Txt v="tiny" style={{ color: item.checked ? C.faint : C.shop, ...ff(700) }}>{item.qty}</Txt>
        </View>
      ) : null}
      <IconBtn name="close" size={18} color={C.faint} onPress={() => removeItem(item)} label={t('common.delete')} />
    </Row>
    </SwipeRow>
  );

  return (
    <Page
      title={list.title}
      onBack={nav.pop}
      right={<Row gap={0}>
        <IconBtn name="share-outline" onPress={share} label={t('list.share')} />
        <IconBtn name="ellipsis-horizontal" onPress={() => setMenu(true)} />
      </Row>}
    >
      <View style={{ marginBottom: 12 }}>
        <Segmented value={mode} onChange={switchMode} options={[
          { value: 'write', label: t('list.modeWrite') },
          { value: 'check', label: t('list.modeCheck') },
        ]} />
      </View>
      <Row gap={8} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        <Chip icon={list.remind === false || !list.date ? 'notifications-off-outline' : 'alarm-outline'}
          label={list.remind === false || !list.date ? (list.date ? f.short(list.date) : t('list.noReminder')) : `${f.short(list.date)} ${list.time || data.settings.defaultTime}`}
          onPress={() => nav.push('listEdit', { id: list.id })} />
        <Chip icon="swap-vertical" label={t('dept.sortBtn')} onPress={() => {
          if (mode === 'write') {
            const before = draft;
            const lines = draft.split('\n').filter((l) => l.trim());
            const sorted = lines.map((l, i) => ({ l, i, o: deptOrder(classify(l, data.deptLearned)) }))
              .sort((x, y) => x.o - y.o || x.i - y.i).map((x) => x.l).join('\n');
            setDraft(sorted);
            toast({ text: t('dept.sorted'), icon: 'checkmark-circle', action: t('toast.undo'), onAction: () => setDraft(before) });
            return;
          }
          const before = list.items;
          actions.sortListByDept(list.id);
          toast({ text: t('dept.sorted'), icon: 'checkmark-circle', action: t('toast.undo'), onAction: () => actions.setItemsOrder(list.id, before) });
        }} />
        {list.items.length ? <Chip label={t('list.progress', { done: checked.length, total: list.items.length })} /> : null}
      </Row>
      {list.note ? <Txt v="muted" style={{ marginBottom: 12 }}>{list.note}</Txt> : null}

      {allBought && mode === 'check' ? (
        <Banner icon="checkmark-circle" color={C.primary} soft={C.primarySoft} text={t('list.allBought')}
          action={t('list.markDone')} onAction={() => { actions.setListStatus(list.id, 'done'); nav.pop(); }} />
      ) : null}

      {mode === 'write' ? (
        <View style={[{ backgroundColor: C.card, borderRadius: R.lg, paddingHorizontal: 16, paddingVertical: 8 }, shadow(1)]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            autoFocus={params.write || list.items.length === 0}
            placeholder={t('list.writePh')}
            placeholderTextColor={C.faint}
            selectionColor={C.primary}
            textAlignVertical="top"
            style={{ minHeight: 320, fontSize: 18, lineHeight: 30, color: C.ink, textAlign: dir.align, writingDirection: dir.writing, ...ff(400) }}
          />
        </View>
      ) : null}
      {mode === 'write' && checked.length ? <Txt v="tiny" style={{ marginTop: 10, ...ff(400) }}>{t('list.boughtHidden', { n: checked.length })}</Txt> : null}

      {mode === 'check' ? (
      <View style={{ backgroundColor: C.card, borderRadius: R.lg, padding: 8, marginTop: 4, borderWidth: 1, borderColor: C.glassBorder }}>
        <Row gap={6}>
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={(v) => { if (v.includes('\n')) { add(v); return; } setName(v); setMsg(null); }}
            multiline
            placeholder={t('list.addItemPh')}
            placeholderTextColor={C.faint}
            onSubmitEditing={() => add()}
            blurOnSubmit={false}
            submitBehavior="submit"
            returnKeyType="next"
            style={{ flex: 1, fontSize: 17, paddingHorizontal: 8, paddingVertical: 10, maxHeight: 120, color: C.ink, textAlign: dir.align, writingDirection: dir.writing }}
          />
          <TextInput
            value={qty}
            onChangeText={setQty}
            placeholder={t('list.qtyPh')}
            placeholderTextColor={C.faint}
            onSubmitEditing={() => add()}
            style={{ width: 70, fontSize: 15, paddingHorizontal: 8, paddingVertical: 10, color: C.ink, backgroundColor: C.sunken, borderRadius: R.sm, textAlign: 'center' }}
          />
          <IconBtn name="add" color={C.onPrimary} bg={C.primary} onPress={() => add()} label={t('common.add')} />
        </Row>
        {suggestions.length ? (
          <Row gap={6} style={{ flexWrap: 'wrap', paddingTop: 6, paddingHorizontal: 4 }}>
            {suggestions.map((s2) => <Chip key={s2.name} icon="add" label={s2.name} onPress={() => add(s2.name)} />)}
          </Row>
        ) : null}
      </View>
      ) : null}
      {msg ? <Txt v="small" style={{ color: C.shop, marginTop: 8 }}>{msg}</Txt> : null}

      {list.items.length === 0 && mode === 'check' ? <Empty icon="basket-outline" body={t('list.emptyItems')} /> : null}

      {unchecked.length && mode === 'check' ? (
        <View style={{ marginTop: 14 }}>
          <Group>{unchecked.map((i) => <ItemRow key={i.id} item={i} />)}</Group>
        </View>
      ) : null}
      {checked.length && mode === 'check' ? (
        <Section title={t('list.bought')} count={String(checked.length)}>
          <Group>{checked.map((i) => <ItemRow key={i.id} item={i} />)}</Group>
        </Section>
      ) : null}

      <Sheet visible={menu} onClose={() => setMenu(false)} title={list.title}>
        <View style={{ gap: 10 }}>
          <Button variant="outline" icon="create-outline" title={t('list.edit')} onPress={() => { setMenu(false); nav.push('listEdit', { id: list.id }); }} />
          <Button variant="outline" icon="copy-outline" title={t('list.duplicate')} onPress={() => {
            setMenu(false);
            const id = actions.duplicateList(list.id, t('list.copySuffix'), list.date && list.date < todayStr() ? todayStr() : list.date);
            nav.replace('list', { id });
          }} />
          {unchecked.length ? (
            <Button variant="outline" icon="arrow-redo-outline" title={t('list.moveLeft')} onPress={() => { setMenu(false); setTimeout(() => setMoveOpen(true), 250); }} />
          ) : null}
          {checked.length ? (
            <Button variant="outline" icon="remove-circle-outline" title={`${t('common.delete')}: ${t('list.bought')}`} onPress={() => { setMenu(false); actions.clearChecked(list.id); }} />
          ) : null}
          {list.status === 'done'
            ? <Button variant="soft" icon="refresh" title={t('list.reopen')} onPress={() => { setMenu(false); actions.setListStatus(list.id, 'open'); }} />
            : <Button variant="soft" icon="checkmark-done" title={t('list.markDone')} onPress={() => { setMenu(false); actions.setListStatus(list.id, 'done'); nav.pop(); }} />}
          <Button variant="danger" icon="trash-outline" title={t('common.delete')} onPress={() => { setMenu(false); setTimeout(remove, 250); }} />
        </View>
      </Sheet>

      <DatePickerSheet visible={moveOpen} title={t('list.moveTo')} value={addDays(todayStr(), 1)}
        onPick={(d) => { actions.moveLeftovers(list.id, d); nav.pop(); }}
        onClose={() => setMoveOpen(false)} />

      <Sheet visible={!!editing} onClose={() => setEditing(null)} title={t('common.edit')}>
        {editing ? (
          <View>
            <Field><Input value={editing.name} onChangeText={(v) => setEditing({ ...editing, name: v })} /></Field>
            <Field label={t('list.qtyPh')}><Input value={editing.qty} onChangeText={(v) => setEditing({ ...editing, qty: v })} /></Field>
            <Field label={t('dept.title')}>
              <Row gap={8} style={{ flexWrap: 'wrap' }}>
                {DEPARTMENTS.map((d) => (
                  <Chip key={d.key} icon={d.icon} color={C.shop} label={d[lang] || d.en}
                    selected={(editing.cat || classify(editing.name, data.deptLearned)) === d.key}
                    onPress={() => setEditing({ ...editing, cat: d.key, catChanged: true })} />
                ))}
              </Row>
            </Field>
            <Button title={t('common.save')} onPress={() => {
              const { catChanged, ...item } = editing;
              if (item.name.trim()) actions.updateItem(list.id, { ...item, name: item.name.trim() });
              if (catChanged) actions.setItemCat(list.id, item.id, item.cat);
              setEditing(null);
            }} />
          </View>
        ) : null}
      </Sheet>
    </Page>
  );
}
