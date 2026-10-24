import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useStore } from '../store';
import { useI18n, Row, Txt, Page, Button, Input, Field, Chip, Card, Icon, useToast } from '../ui';
import { C, ff } from '../theme';
import { currentPosition, geocode, geoSupported } from '../geo';

export default function PlaceEditor({ nav, params }) {
  const { data, actions } = useStore();
  const { t } = useI18n();
  const toast = useToast();
  const existing = params.id ? data.places.find((p) => p.id === params.id) : null;
  const [p, setP] = useState(() => existing || { name: t('geo.defaultName'), address: '', lat: null, lng: null, radius: 200 });
  const [busy, setBusy] = useState(null);
  const set = (patch) => setP((x) => ({ ...x, ...patch }));

  const useHere = async () => {
    setBusy('here');
    try {
      const pos = await currentPosition();
      if (pos) set({ ...pos, address: t('geo.here') }); else Alert.alert(t('geo.noPermission'));
    } catch (e) { Alert.alert(t('geo.notFound')); }
    setBusy(null);
  };
  const search = async () => {
    if (!p.address.trim()) return;
    setBusy('search');
    try {
      const pos = await geocode(p.address.trim());
      if (pos) set(pos); else Alert.alert(t('geo.notFound'));
    } catch (e) { Alert.alert(t('geo.notFound')); }
    setBusy(null);
  };
  const save = () => {
    if (typeof p.lat !== 'number') { Alert.alert(t('geo.needLocation')); return; }
    actions.savePlace({ ...p, name: p.name.trim() || t('geo.defaultName') });
    toast({ text: t('geo.saved'), icon: 'location' });
    nav.pop();
  };

  return (
    <Page title={existing ? p.name : t('geo.newPlace')} onBack={nav.pop}
      right={existing ? <Button small variant="danger" icon="trash-outline" title={t('common.delete')} onPress={() => { actions.deletePlace(existing.id); nav.pop(); }} /> : null}
      footer={<Button title={t('common.save')} icon="checkmark" color={C.shop} onPress={save} />}>
      {!geoSupported ? <Txt v="muted" style={{ marginBottom: 12 }}>{t('settings.webNote')}</Txt> : null}
      <Field label={t('geo.name')}>
        <Input value={p.name} onChangeText={(v) => set({ name: v })} placeholder={t('geo.defaultName')} />
      </Field>
      <Field label={t('geo.where')}>
        <Button variant="soft" color={C.shop} icon="navigate" title={busy === 'here' ? '…' : t('geo.useHere')} onPress={useHere} />
        <Txt v="tiny" center style={{ marginVertical: 2, ...ff(400) }}>{t('geo.or')}</Txt>
        <Row gap={8}>
          <Input value={p.address} onChangeText={(v) => set({ address: v, lat: null, lng: null })} placeholder={t('geo.addressPh')}
            style={{ flex: 1 }} onSubmitEditing={search} returnKeyType="search" />
          <Button small icon="search" color={C.shop} title={busy === 'search' ? '…' : t('geo.search')} onPress={search} style={{ minHeight: 50 }} />
        </Row>
      </Field>
      {typeof p.lat === 'number' ? (
        <Card flat tint={C.shopSoft} style={{ marginBottom: 20 }}>
          <Row gap={10}>
            <Icon name="checkmark-circle" color={C.shop} />
            <View style={{ flex: 1 }}>
              <Txt v="strong" style={{ color: C.shop }}>{t('geo.found')}</Txt>
              <Txt v="tiny" style={{ ...ff(400) }}>{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</Txt>
            </View>
          </Row>
        </Card>
      ) : null}
      <Field label={t('geo.radius')} hint={t('geo.radiusHint')}>
        <Row gap={8}>
          {[100, 200, 400].map((r) => (
            <Chip key={r} color={C.shop} label={`${r} ${t('geo.meters')}`} selected={p.radius === r} onPress={() => set({ radius: r })} style={{ flex: 1 }} />
          ))}
        </Row>
      </Field>
    </Page>
  );
}
