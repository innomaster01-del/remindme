import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Pressable, Text, BackHandler, AppState, StatusBar, I18nManager } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { I18nCtx, makeDir, Icon, Sheet, useI18n } from './src/ui';
import { makeT, makeFormat } from './src/i18n';
import { C } from './src/theme';
import { todayStr } from './src/logic/dates';
import { buildPlan } from './src/logic/scheduler';
import * as N from './src/notifications';
import TodayScreen, { AddSheetContent } from './src/screens/TodayScreen';
import TasksScreen, { TaskEditor } from './src/screens/TasksScreen';
import PeopleScreen, { PersonEditor } from './src/screens/PeopleScreen';
import ShoppingScreen, { ListEditor, ListDetail } from './src/screens/ShoppingScreen';
import SettingsScreen, { Onboarding } from './src/screens/SettingsScreen';

// The app handles right-to-left itself, so keep the native layout left-to-right.
try { I18nManager.allowRTL(false); I18nManager.forceRTL(false); } catch (e) { /* noop */ }

const STACK_SCREENS = { task: TaskEditor, person: PersonEditor, listEdit: ListEditor, list: ListDetail };

function guessLang() {
  try {
    const loc = (Intl.DateTimeFormat().resolvedOptions().locale || '').toLowerCase();
    if (loc.startsWith('he') || loc.startsWith('iw')) return 'he';
    if (loc.startsWith('ru')) return 'ru';
    if (loc.startsWith('en')) return 'en';
  } catch (e) { /* noop */ }
  return 'he';
}

function TabBar({ tab, setTab, tabs, onAdd }) {
  const insets = useSafeAreaInsets();
  const { t, dir } = useI18n();
  const half = Math.ceil(tabs.length / 2);
  const renderTab = (k) => {
    const sel = tab === k.key;
    return (
      <Pressable key={k.key} onPress={() => setTab(k.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, gap: 2 }}
        accessibilityRole="tab" accessibilityState={{ selected: sel }}>
        <Icon name={sel ? k.icon : `${k.icon}-outline`} size={23} color={sel ? C.primary : C.faint} />
        <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: sel ? '700' : '500', color: sel ? C.primary : C.muted }}>{t(`tabs.${k.key}`)}</Text>
      </Pressable>
    );
  };
  return (
    <View style={{
      flexDirection: dir.row, alignItems: 'center', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.line,
      paddingBottom: Math.max(insets.bottom, 6), paddingHorizontal: 4,
    }}>
      {tabs.slice(0, half).map(renderTab)}
      <View style={{ width: 70, alignItems: 'center' }}>
        <Pressable onPress={onAdd} accessibilityLabel="+" style={({ pressed }) => ({
          width: 56, height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
          marginTop: -26, borderWidth: 4, borderColor: C.bg, transform: [{ scale: pressed ? 0.94 : 1 }],
          shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
        })}>
          <Icon name="add" size={30} color="#fff" />
        </Pressable>
      </View>
      {tabs.slice(half).map(renderTab)}
    </View>
  );
}

function Main() {
  const { data, actions } = useStore();
  const lang = data.settings.lang || guessLang();
  const i18n = useMemo(() => {
    const rtl = lang === 'he';
    return { lang, t: makeT(lang), f: makeFormat(lang), dir: makeDir(rtl) };
  }, [lang]);
  const { t } = i18n;

  const [now, setNow] = useState(new Date());
  const [tab, setTab] = useState('today');
  const [date, setDate] = useState(todayStr());
  const [stack, setStack] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [perm, setPerm] = useState('undetermined');
  const [scheduled, setScheduled] = useState(0);
  const [horizon, setHorizon] = useState(false);

  const nav = useMemo(() => ({
    push: (name, params = {}) => setStack((s) => [...s, { name, params, key: Date.now() + Math.random() }]),
    pop: () => setStack((s) => s.slice(0, -1)),
    replace: (name, params = {}) => setStack((s) => [...s.slice(0, -1), { name, params, key: Date.now() + Math.random() }]),
    setTab: (k) => { setStack([]); setTab(k); },
  }), []);

  // Keep "today" fresh and re-check permissions when coming back to the app.
  const lastDay = useRef(todayStr());
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setNow(n);
      const d = todayStr(n);
      if (d !== lastDay.current) { setDate((cur) => (cur === lastDay.current ? d : cur)); lastDay.current = d; }
    };
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') { tick(); N.getPermission().then(setPerm).catch(() => {}); }
    });
    const iv = setInterval(tick, 60000);
    return () => { sub.remove(); clearInterval(iv); };
  }, []);

  useEffect(() => { N.configure(t); }, [t]);
  useEffect(() => { N.getPermission().then(setPerm).catch(() => {}); }, []);

  const requestPermission = useCallback(async () => {
    const r = await N.requestPermission().catch(() => 'denied');
    setPerm(r);
    return r;
  }, []);

  // Re-plan notifications whenever data, language or the day changes.
  const dayKey = todayStr(now) + ':' + now.getHours();
  useEffect(() => {
    if (perm !== 'granted') return undefined;
    const timer = setTimeout(async () => {
      const plan = buildPlan(data, new Date(), t);
      setHorizon(plan.truncated && plan.horizon && plan.horizon.getTime() - Date.now() < 7 * 86400000);
      try { setScheduled(await N.sync(plan)); } catch (e) { /* noop */ }
    }, 600);
    return () => clearTimeout(timer);
  }, [data.tasks, data.people, data.lists, data.settings, perm, t, dayKey]);

  // Notification taps and action buttons.
  useEffect(() => N.onResponse(({ action, data: d }) => {
    if (d.kind === 'task') {
      if (action === 'done') { actions.setTaskDone(d.id, d.date); return; }
      if (action === 'snooze') { actions.snoozeTask(d.id, d.date, 60); return; }
      setStack([]); setTab('today'); if (d.date) setDate(d.date);
    } else if (d.kind === 'person') {
      setStack([]); setTab('today'); if (d.date) setDate(d.date);
    } else if (d.kind === 'list') {
      setTab('shopping'); setStack([{ name: 'list', params: { id: d.id }, key: 'n' + Date.now() }]);
    }
  }), [actions]);

  // Android back button closes the top screen first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length) { nav.pop(); return true; }
      if (tab !== 'today') { setTab('today'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, tab, nav]);

  const mods = data.settings.modules;
  const tabs = [
    { key: 'today', icon: 'today' },
    mods.tasks && { key: 'tasks', icon: 'checkbox' },
    mods.birthdays && { key: 'people', icon: 'gift' },
    mods.shopping && { key: 'shopping', icon: 'cart' },
    { key: 'settings', icon: 'settings' },
  ].filter(Boolean);
  useEffect(() => { if (!tabs.find((x) => x.key === tab)) setTab('today'); }, [mods.tasks, mods.birthdays, mods.shopping]);

  const notifState = perm === 'denied' ? 'denied' : horizon ? 'horizon' : 'ok';

  const onAdd = () => {
    const enabled = [mods.tasks, mods.shopping, mods.birthdays].filter(Boolean).length;
    if (tab === 'tasks') return nav.push('task', { date: todayStr() });
    if (tab === 'people') return nav.push('person', {});
    if (tab === 'shopping') return nav.push('listEdit', { date: null });
    if (enabled === 1) {
      if (mods.tasks) return nav.push('task', { date });
      if (mods.shopping) return nav.push('listEdit', { date });
      return nav.push('person', {});
    }
    setAddOpen(true);
  };

  if (!data.settings.onboarded) {
    return (
      <I18nCtx.Provider value={i18n}>
        <Onboarding onRequestPermission={requestPermission}
          onDone={() => actions.setSettings({ onboarded: true, lang: data.settings.lang || lang })} />
      </I18nCtx.Provider>
    );
  }

  const top = stack[stack.length - 1];
  const TopScreen = top ? STACK_SCREENS[top.name] : null;
  const screenProps = { nav, now };

  return (
    <I18nCtx.Provider value={i18n}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ flex: 1 }}>
          {tab === 'today' ? <TodayScreen {...screenProps} date={date} setDate={setDate} notifState={notifState} /> : null}
          {tab === 'tasks' ? <TasksScreen {...screenProps} /> : null}
          {tab === 'people' ? <PeopleScreen {...screenProps} /> : null}
          {tab === 'shopping' ? <ShoppingScreen {...screenProps} /> : null}
          {tab === 'settings' ? <SettingsScreen notif={perm} onRequestPermission={requestPermission} scheduledCount={scheduled} /> : null}
        </View>
        <TabBar tab={tab} setTab={nav.setTab} tabs={tabs} onAdd={onAdd} />
        {TopScreen ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg }}>
            <TopScreen key={top.key} nav={nav} params={top.params} now={now} />
          </View>
        ) : null}
        <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title={t('add.what')}>
          <AddSheetContent mods={mods} onPick={(k) => {
            setAddOpen(false);
            if (k === 'task') nav.push('task', { date });
            if (k === 'list') nav.push('listEdit', { date });
            if (k === 'person') nav.push('person', {});
          }} />
        </Sheet>
      </View>
    </I18nCtx.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
