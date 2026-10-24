import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, TextInput, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useI18n, Row, Txt, Section, Empty, Input, Page, IconBtn, Icon, Card, SwipeRow, useToast } from '../ui';
import { C, R, ff, shadow } from '../theme';
import { splitTitle } from '../logic/listtext';
import { todayStr } from '../logic/dates';

function NoteCard({ note, onPress }) {
  const { t, f } = useI18n();
  const { actions } = useStore();
  const toast = useToast();
  const { title, body } = splitTitle(note.text);
  const d = new Date(note.updatedAt || note.createdAt || Date.now());
  const pad = (n) => String(n).padStart(2, '0');
  const ds = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const when = ds === todayStr() ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : f.short(ds);
  return (
    <SwipeRow doneIcon="pin" onDone={() => actions.togglePinNote(note.id)}
      onDelete={() => { actions.deleteNote(note.id); toast({ text: `${t('toast.deleted')}: ${title || t('notes.untitled')}`, icon: 'trash', action: t('toast.undo'), onAction: () => actions.restoreNote(note) }); }}>
      <Card onPress={onPress} style={{ marginBottom: 10, paddingVertical: 14 }}>
        <Row justify="space-between" align="flex-start" gap={10}>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt v="h2" numberOfLines={1}>{title || t('notes.untitled')}</Txt>
            {body ? <Txt v="muted" numberOfLines={2}>{body}</Txt> : null}
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Txt v="tiny">{when}</Txt>
            {note.pinned ? <Icon name="pin" size={15} color={C.primary} /> : null}
          </View>
        </Row>
      </Card>
    </SwipeRow>
  );
}

export default function NotesScreen({ nav }) {
  const { data } = useStore();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const notes = data.notes
    .filter((n) => n.text && n.text.trim())
    .filter((n) => !query || n.text.toLowerCase().includes(query))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const pinned = notes.filter((n) => n.pinned);
  const rest = notes.filter((n) => !n.pinned);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
      <Txt v="display">{t('tabs.notes')}</Txt>
      {data.notes.length ? (
        <Row gap={8} style={{ marginTop: 14, backgroundColor: C.card, borderRadius: R.md, paddingHorizontal: 12, borderWidth: 1, borderColor: C.glassBorder }}>
          <Icon name="search" size={18} color={C.muted} />
          <Input value={q} onChangeText={setQ} placeholder={t('notes.search')} style={{ flex: 1, borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }} />
        </Row>
      ) : null}
      {!data.notes.length ? (
        <Empty icon="document-text-outline" title={t('notes.emptyTitle')} body={t('notes.empty')} />
      ) : null}
      {data.notes.length && !notes.length ? <Txt v="muted" center style={{ marginTop: 30 }}>{t('notes.noResults')}</Txt> : null}
      {pinned.length ? (
        <Section title={t('notes.pinned')} icon="pin">
          {pinned.map((n) => <NoteCard key={n.id} note={n} onPress={() => nav.push('note', { id: n.id })} />)}
        </Section>
      ) : null}
      {rest.length ? (
        <View style={{ marginTop: pinned.length ? 8 : 18 }}>
          {pinned.length ? <Section title={t('notes.others')} style={{ marginTop: 10 }} /> : null}
          {rest.map((n) => <NoteCard key={n.id} note={n} onPress={() => nav.push('note', { id: n.id })} />)}
        </View>
      ) : null}
    </ScrollView>
  );
}

// Full-screen notepad. Saves as you type, like Apple Notes.
export function NoteEditor({ nav, params }) {
  const { data, actions } = useStore();
  const { t, dir } = useI18n();
  const toast = useToast();
  const existing = params.id ? data.notes.find((n) => n.id === params.id) : null;
  const [text, setText] = useState(existing ? existing.text : '');
  const idRef = useRef(existing ? existing.id : null);
  const note = idRef.current ? data.notes.find((n) => n.id === idRef.current) : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!text.trim() && !idRef.current) return;
      const cur = idRef.current ? data.notes.find((n) => n.id === idRef.current) : null;
      if (cur && cur.text === text) return;
      idRef.current = actions.saveNote({ ...(cur || {}), id: idRef.current || undefined, text });
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  const close = () => {
    if (idRef.current && !text.trim()) actions.deleteNote(idRef.current);
    else if (text.trim()) actions.saveNote({ ...(note || {}), id: idRef.current || undefined, text });
    nav.pop();
  };
  const remove = () => {
    const snap = note;
    if (snap) {
      actions.deleteNote(snap.id);
      toast({ text: `${t('toast.deleted')}: ${splitTitle(snap.text).title || t('notes.untitled')}`, icon: 'trash', action: t('toast.undo'), onAction: () => actions.restoreNote(snap) });
    }
    idRef.current = null;
    setText('');
    nav.pop();
  };

  return (
    <Page title="" onBack={close} scroll={false}
      right={<Row gap={2}>
        {note ? <IconBtn name={note.pinned ? 'pin' : 'pin-outline'} color={note.pinned ? C.primary : C.ink} onPress={() => actions.togglePinNote(note.id)} label={t('notes.pin')} /> : null}
        {text.trim() ? <IconBtn name="share-outline" onPress={() => Share.share({ message: text })} label={t('list.share')} /> : null}
        {note ? <IconBtn name="trash-outline" color={C.danger} onPress={remove} label={t('common.delete')} /> : null}
      </Row>}>
      <View style={{ flex: 1, paddingHorizontal: 18 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          autoFocus={!existing}
          placeholder={t('notes.ph')}
          placeholderTextColor={C.faint}
          selectionColor={C.primary}
          textAlignVertical="top"
          scrollEnabled
          style={{ flex: 1, fontSize: 18, lineHeight: 27, color: C.ink, textAlign: dir.align, writingDirection: dir.writing, paddingTop: 4, paddingBottom: 40, ...ff(400) }}
        />
      </View>
    </Page>
  );
}
