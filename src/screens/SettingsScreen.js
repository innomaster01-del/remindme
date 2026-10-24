import React, { useState } from 'react';
import { View, ScrollView, Alert, Share, Linking, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore, exportBackup, validateBackup } from '../store';
import { useI18n, Row, Txt, Section, Card, Toggle, Button, Input, Sheet, Icon, Page, Segmented, useToast } from '../ui';
import { TimeField } from '../pickers';
import { LANGS } from '../i18n';
import { C, R, ff } from '../theme';
import { supported, sendTest, SOUNDS } from '../notifications';

export function LanguagePicker({ value, onPick }) {
  return (
    <View style={{ gap: 10 }}>
      {LANGS.map((l) => {
        const sel = value === l.code;
        return (
          <Pressable key={l.code} onPress={() => onPick(l.code)} style={({ pressed }) => ({
            backgroundColor: sel ? C.primary : C.card, borderRadius: R.lg, paddingVertical: 16, paddingHorizontal: 18,
            opacity: pressed ? 0.85 : 1,
          })}>
            <Row justify="space-between">
              <Txt v="h2" style={{ color: sel ? C.onPrimary : C.ink }}>{l.label}</Txt>
              {sel ? <Icon name="checkmark-circle" color={C.onPrimary} /> : null}
            </Row>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen({ nav, notif, onRequestPermission, scheduledCount }) {
  const { data, actions } = useStore();
  const toast = useToast();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const s = data.settings;
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const setModule = (k, v) => actions.setSettings({ modules: { ...s.modules, [k]: v } });

  const doImport = () => {
    let obj = null;
    try { obj = JSON.parse(importText.trim()); } catch (e) { obj = null; }
    if (!validateBackup(obj)) { Alert.alert(t('settings.importBad')); return; }
    Alert.alert(t('settings.import'), t('settings.importConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.ok'), onPress: () => {
        actions.replaceAll({ ...obj.data, settings: { ...obj.data.settings, onboarded: true } });
        setImportOpen(false); setImportText('');
        Alert.alert(t('settings.importOk'));
      } },
    ]);
  };

  return (
    <Page big title={t('settings.title')} onBack={nav.pop}>

      <Section title={t('settings.language')} icon="language" color={C.bday}>
        <LanguagePicker value={s.lang} onPick={(code) => actions.setSettings({ lang: code })} />
      </Section>

      <Section title={t('settings.theme')} icon="contrast" color={C.ink}>
        <Segmented value={s.theme || 'auto'} onChange={(v) => actions.setSettings({ theme: v })} options={[
          { value: 'auto', label: t('settings.themeAuto') },
          { value: 'light', label: t('settings.themeLight') },
          { value: 'dark', label: t('settings.themeDark') },
        ]} />
        <Card style={{ marginTop: 12, paddingVertical: 4 }}>
          <Toggle icon="star-outline" color={C.holiday} label={t('settings.hebrewDate')} hint={t('settings.hebrewDateHint')}
            value={s.hebrewDate !== false} onChange={(v) => actions.setSettings({ hebrewDate: v })} />
        </Card>
      </Section>

      <Section title={t('settings.notifications')} icon="notifications">
        <Card>
          {!supported ? (
            <Txt v="small" style={{ color: C.muted }}>{t('settings.webNote')}</Txt>
          ) : notif === 'granted' ? (
            <Row><Icon name="checkmark-circle" color={C.primary} size={20} /><Txt style={{ flex: 1 }}>{t('settings.notifOn')}</Txt></Row>
          ) : (
            <View style={{ gap: 10 }}>
              <Row align="flex-start"><Icon name="notifications-off" color={C.danger} size={20} /><Txt style={{ flex: 1, color: C.danger }}>{t('settings.notifOff')}</Txt></Row>
              {notif === 'denied'
                ? <Button small variant="outline" title={t('settings.openSettings')} onPress={() => Linking.openSettings()} />
                : <Button small title={t('settings.enable')} onPress={onRequestPermission} />}
            </View>
          )}
          {supported && notif === 'granted' ? <Txt v="tiny" style={{ marginTop: 6 }}>{t('settings.scheduled', { n: scheduledCount })}</Txt> : null}
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 10 }} />
          <Toggle label={t('settings.hideContent')} value={s.hideContent} onChange={(v) => actions.setSettings({ hideContent: v })} />
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 10 }} />
          <Txt style={{ marginBottom: 2 }}>{t('settings.defaultTime')}</Txt>
          <Txt v="tiny" style={{ marginBottom: 10 }}>{t('settings.defaultTimeHint')}</Txt>
          <TimeField value={s.defaultTime} onChange={(v) => actions.setSettings({ defaultTime: v })} allowNone={false} />
        </Card>
      </Section>

      {supported ? (
        <Section title={t('reliable.title')} icon="shield-checkmark" color={C.primary}>
          <Card style={{ gap: 12 }}>
            <Button variant="soft" icon="notifications" title={t('reliable.test')} onPress={async () => {
              if (notif !== 'granted') { const r = await onRequestPermission(); if (r !== 'granted') return; }
              await sendTest(t, s.sound || 'default');
              toast({ text: t('reliable.testSent'), icon: 'time' });
            }} />
            {Platform.OS === 'android' ? (
              <>
                <Txt v="small" style={{ color: C.muted }}>{t('reliable.battery')}</Txt>
                <Button variant="outline" icon="battery-charging-outline" title={t('reliable.openApp')} onPress={() => Linking.openSettings()} />
              </>
            ) : null}
          </Card>
        </Section>
      ) : null}


      <Section title={t('sound.title')} icon="musical-notes">
        <Card style={{ paddingVertical: 4 }}>
          {SOUNDS.map((snd, i) => {
            const sel = (s.sound || 'default') === snd;
            return (
              <Pressable key={snd} onPress={async () => {
                actions.setSettings({ sound: snd });
                if (supported && notif === 'granted' && snd !== 'silent') {
                  try { await sendTest(t, snd, 2); toast({ text: t('sound.preview'), icon: 'musical-note' }); } catch (e) { /* noop */ }
                }
              }} style={{ paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
                <Row gap={12}>
                  <Icon name={snd === 'silent' ? 'notifications-off-outline' : snd === 'default' ? 'phone-portrait-outline' : 'musical-note-outline'} size={19} color={sel ? C.primary : C.muted} />
                  <Txt style={[{ flex: 1 }, sel ? { color: C.primary, ...ff(600) } : null]}>{t('sound.' + snd)}</Txt>
                  {sel ? <Icon name="checkmark" size={20} color={C.primary} /> : null}
                </Row>
              </Pressable>
            );
          })}
        </Card>
        <Txt v="tiny" style={{ marginTop: 8, ...ff(400) }}>{t('sound.hint')}</Txt>
      </Section>

      <Section title={t('settings.modules')} icon="apps" color={C.shop}>
        <Card style={{ paddingVertical: 4 }}>
          <Toggle icon="checkmark-circle" color={C.primary} label={t('tabs.tasks')} value={s.modules.tasks} onChange={(v) => setModule('tasks', v)} />
          <Toggle icon="gift" color={C.bday} label={t('tabs.people')} value={s.modules.birthdays} onChange={(v) => setModule('birthdays', v)} />
          <Toggle icon="basket" color={C.shop} label={t('tabs.shopping')} value={s.modules.shopping} onChange={(v) => setModule('shopping', v)} />
          <Toggle icon="document-text" color={C.primary} label={t('tabs.notes')} value={s.modules.notes !== false} onChange={(v) => setModule('notes', v)} />
        </Card>
      </Section>

      <Section title={t('settings.backup')} icon="cloud-upload" color={C.holiday}>
        <Card style={{ gap: 10 }}>
          <Txt v="small" style={{ color: C.muted }}>{t('settings.backupHint')}</Txt>
          <Button variant="soft" icon="share-outline" title={t('settings.export')} onPress={() => Share.share({ message: exportBackup(data) })} />
          <Button variant="outline" icon="download-outline" title={t('settings.import')} onPress={() => setImportOpen(true)} />
        </Card>
      </Section>

      <Section title={t('settings.danger')} icon="warning" color={C.danger}>
        <Button variant="danger" icon="trash-outline" title={t('settings.deleteAll')} onPress={() => Alert.alert(t('settings.deleteAll'), t('settings.deleteAllBody'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.delete'), style: 'destructive', onPress: () => actions.resetAll() },
        ])} />
      </Section>

      <Txt v="tiny" center style={{ marginTop: 28 }}>{t('appName')}  {t('settings.version')} 1.5.0</Txt>

      <Sheet visible={importOpen} onClose={() => setImportOpen(false)} title={t('settings.import')}>
        <Input value={importText} onChangeText={setImportText} placeholder={t('settings.importPh')} multiline style={{ minHeight: 140, textAlign: 'left', writingDirection: 'ltr' }} />
        <Button title={t('settings.import')} style={{ marginTop: 12 }} onPress={doImport} disabled={!importText.trim()} />
      </Sheet>
    </Page>
  );
}

export function Onboarding({ onDone, onRequestPermission }) {
  const { data, actions } = useStore();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(data.settings.lang ? 1 : 0);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }}>
      {step === 0 ? (
        <View style={{ flex: 1, gap: 20 }}>
          <View style={{ alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <View style={{ width: 84, height: 84, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="notifications" size={42} color="#fff" />
            </View>
            <Txt v="title" center>בחרו שפה · Choose a language · Выберите язык</Txt>
          </View>
          <LanguagePicker value={data.settings.lang} onPick={(code) => { actions.setSettings({ lang: code }); setStep(1); }} />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ gap: 18, marginTop: 30 }}>
            <View style={{ width: 84, height: 84, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
              <Icon name="notifications" size={42} color="#fff" />
            </View>
            <Txt v="display" center>{t('onboarding.welcomeTitle')}</Txt>
            <Txt center style={{ color: C.muted, fontSize: 17, lineHeight: 25 }}>{t('onboarding.welcomeBody')}</Txt>
            <Row justify="center" gap={14} style={{ marginTop: 10 }}>
              {[['checkbox', C.primary, C.primarySoft], ['gift', C.bday, C.bdaySoft], ['cart', C.shop, C.shopSoft]].map(([ic, c, bg]) => (
                <View key={ic} style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={26} color={c} />
                </View>
              ))}
            </Row>
            <Card style={{ marginTop: 20, gap: 6 }}>
              <Txt v="h2">{t('onboarding.notifTitle')}</Txt>
              <Txt v="small" style={{ color: C.muted }}>{t('onboarding.notifBody')}</Txt>
            </Card>
          </View>
          <View style={{ gap: 10 }}>
            {supported ? <Button icon="notifications" title={t('onboarding.allow')} onPress={async () => { await onRequestPermission(); onDone(); }} /> : null}
            <Button variant={supported ? 'ghost' : 'primary'} title={supported ? t('onboarding.later') : t('onboarding.start')} onPress={onDone} />
            <Button variant="ghost" small title={t('settings.language')} icon="language" onPress={() => setStep(0)} />
          </View>
        </View>
      )}
    </View>
  );
}
