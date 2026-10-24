import React, { useEffect, useState } from 'react';
import { View, Platform, Linking } from 'react-native';
import * as Contacts from 'expo-contacts/legacy';
import { useStore } from '../store';
import { useI18n, Row, Txt, Page, Button, Check, Empty, Card, useToast } from '../ui';
import { initials } from '../components';
import { C, ff } from '../theme';

// Contact birthdays come as { day, month, year? }. In the classic API the month is 0-based (JS Date style).
function readBirthday(c) {
  const b = c.birthday || (c.dates || []).find((d) => /birth/i.test(d.label || ''));
  if (!b || !b.day || b.month === undefined || b.month === null) return null;
  const month = Number(b.month) + 1;
  const day = Number(b.day);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const year = b.year && Number(b.year) > 1900 && Number(b.year) < 2100 ? Number(b.year) : null;
  return { day, month, year };
}

export default function ContactsImport({ nav }) {
  const { data, actions } = useStore();
  const { t, f } = useI18n();
  const toast = useToast();
  const [state, setState] = useState('loading'); // loading | denied | ready | unsupported
  const [found, setFound] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') { setState('unsupported'); return; }
      try {
        const perm = await Contacts.requestPermissionsAsync();
        if (perm.status !== 'granted') { setState('denied'); return; }
        const get = Contacts.getContactsAsync;
        const res = await get({ fields: ['name', 'birthday', 'dates', 'phoneNumbers'] });
        const existing = new Set(data.people.map((p) => `${p.name.trim().toLowerCase()}|${p.day}|${p.month}`));
        const list = [];
        for (const c of res.data || []) {
          const b = readBirthday(c);
          const name = (c.name || [c.firstName, c.lastName].filter(Boolean).join(' ')).trim();
          if (!b || !name) continue;
          const key = `${name.toLowerCase()}|${b.day}|${b.month}`;
          list.push({
            key, name, ...b, phone: c.phoneNumbers && c.phoneNumbers[0] ? c.phoneNumbers[0].number : '',
            exists: existing.has(key),
          });
        }
        list.sort((a, b2) => a.month - b2.month || a.day - b2.day);
        setFound(list);
        setSelected(Object.fromEntries(list.filter((x) => !x.exists).map((x) => [x.key, true])));
        setState('ready');
      } catch (e) {
        setState('denied');
      }
    })();
  }, []);

  const count = Object.values(selected).filter(Boolean).length;
  const doImport = () => {
    const people = found.filter((x) => selected[x.key]).map((x) => ({
      name: x.name, day: x.day, month: x.month, year: x.year, phone: x.phone, notes: '',
      remindOnDay: true, remindDayBefore: false, remindWeekBefore: false, time: data.settings.defaultTime || '09:00', feb29: 'feb28',
    }));
    actions.addPeople(people);
    toast({ text: t('contacts.imported', { n: people.length }), icon: 'checkmark-circle' });
    nav.pop();
  };

  return (
    <Page title={t('contacts.title')} onBack={nav.pop}
      footer={state === 'ready' && found.length ? <Button title={t('contacts.import', { n: count })} icon="download" color={C.bday} disabled={!count} onPress={doImport} /> : null}>
      {state === 'loading' ? <Txt v="muted" center style={{ marginTop: 40 }}>…</Txt> : null}
      {state === 'unsupported' ? <Empty icon="phone-portrait-outline" body={t('settings.webNote')} color={C.bday} /> : null}
      {state === 'denied' ? (
        <Empty icon="lock-closed-outline" color={C.bday} body={t('contacts.denied')}
          action={<Button small variant="outline" title={t('settings.openSettings')} onPress={() => Linking.openSettings()} style={{ marginTop: 8 }} />} />
      ) : null}
      {state === 'ready' && !found.length ? <Empty icon="gift-outline" color={C.bday} body={t('contacts.none')} /> : null}
      {state === 'ready' && found.length ? (
        <>
          <Txt v="muted" style={{ marginBottom: 12 }}>{t('contacts.found', { n: found.length })}</Txt>
          <Card style={{ paddingVertical: 2, paddingHorizontal: 12 }}>
            {found.map((x, i) => (
              <Row key={x.key} gap={12} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.line, opacity: x.exists ? 0.5 : 1 }}>
                <Check checked={!!selected[x.key]} color={C.bday} onPress={() => setSelected((s) => ({ ...s, [x.key]: !s[x.key] }))} />
                <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: C.bdaySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt v="small" center style={{ color: C.bday, ...ff(700) }}>{initials(x.name)}</Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt v="strong" numberOfLines={1}>{x.name}</Txt>
                  <Txt v="tiny" style={{ ...ff(400) }}>{f.dayMonth(x.day, x.month)}{x.year ? ` ${x.year}` : ''}{x.exists ? `   ${t('contacts.exists')}` : ''}</Txt>
                </View>
              </Row>
            ))}
          </Card>
          <Row gap={8} style={{ marginTop: 12 }} justify="center">
            <Button small variant="ghost" color={C.bday} title={t('contacts.all')} onPress={() => setSelected(Object.fromEntries(found.map((x) => [x.key, true])))} />
            <Button small variant="ghost" color={C.bday} title={t('contacts.none2')} onPress={() => setSelected({})} />
          </Row>
        </>
      ) : null}
    </Page>
  );
}
