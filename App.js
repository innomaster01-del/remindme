import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Pressable, Text, BackHandler, AppState, StatusBar, I18nManager, useColorScheme, Linking, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold, Rubik_800ExtraBold,
} from '@expo-google-fonts/rubik';
import { StoreProvider, useStore } from './src/store';
import { I18nCtx, makeDir, Icon, Sheet, useI18n, haptic, ToastCtx, ToastHost, Backdrop, Glass } from './src/ui';
import { makeT, makeFormat } from './src/i18n';
import { C, applyTheme, fontState, ff, shadow } from './src/theme';
import { todayStr, addDays, combine } from './src/logic/dates';
import { isRecurring } from './src/logic/recurrence';
import { buildPlan } from './src/logic/scheduler';
import * as N from './src/notifications';
import TodayScreen, { AddSheetContent } from './src/screens/TodayScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import TasksScreen, { TaskEditor } from './src/screens/TasksScreen';
import PeopleScreen, { PersonEditor } from './src/screens/PeopleScreen';
import ShoppingScreen, { ListEditor, ListDetail } from './src/screens/ShoppingScreen';
import SettingsScreen, { Onboarding } from './src/screens/SettingsScreen';
import { updateWidget } from './src/widget';
import DaySheet from './src/DaySheet';
import NotesScreen, { NoteEditor } from './src/screens/NotesScreen';

// The app handles right-to-left itself, so keep the native layout left-to-right.
try { I18nManager.allowRTL(false); I18nManager.forceRTL(false); } catch (e) { /* noop */ }

const STACK_SCREENS = { task: TaskEditor, person: PersonEditor, listEdit: ListEditor, list: ListDetail, people: PeopleScreen, note: NoteEditor };

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
      <Pressable key={k.key} onPress={() => { haptic(); setTab(k.key); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, gap: 3 }}
        accessibilityRole="tab" accessibilityState={{ selected: sel }}>
        <Icon name={sel ? k.icon : `${k.icon}-outline`} size={23} color={sel ? C.primary : C.muted} />
        <Text numberOfLines={1} style={{ fontSize: 10.5, color: sel ? C.primary : C.muted, ...ff(sel ? 600 : 500) }}>{t(`tabs.${k.key}`)}</Text>
      </Pressable>
    );
  };
  return (
    // Floating glass capsule, like the iOS tab bar.
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 14, right: 14, bottom: Math.max(insets.bottom, 10) }}>
      <Glass intensity={70} style={[{ borderRadius: 30, flexDirection: dir.row, alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6, backgroundColor: Platform.OS === 'ios' ? undefined : C.tabBar }, shadow(2)]}>
        {tabs.slice(0, half).map(renderTab)}
        <View style={{ width: 66, alignItems: 'center' }}>
          <Pressable onPress={() => { haptic('light'); onAdd(); }} accessibilityLabel="+" style={({ pressed }) => ({
            width: 50, height: 50, borderRadius: 25, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
            <Icon name="add" size={28} color={C.onPrimary} />
          </Pressable>
        </View>
        {tabs.slice(half).map(renderTab)}
      </Glass>
    </View>
  );
}

function Main() {
  const { data, actions } = useStore();
  const lang = data.settings.lang || guessLang();
  const system = useColorScheme();
  const scheme = data.settings.theme === 'dark' || (data.settings.theme !== 'light' && system === 'dark') ? 'dark' : 'light';
  applyTheme(scheme);
  const i18n = useMemo(() => {
    const rtl = lang === 'he';
    return { lang, t: makeT(lang), f: makeFormat(lang), dir: makeDir(rtl) };
  }, [lang]);
  const { t } = i18n;

  const [now, setNow] = useState(new Date());
  const [tab, setTab] = useState('today');
  const [date, setDate] = useState(todayStr());
  const [calDate, setCalDate] = useState(todayStr());
  const [stack, setStack] = useState([]);
  const [addOpen, setAddOpen] = useState(null); // date string when open
  const [perm, setPerm] = useState('undetermined');
  const [scheduled, setScheduled] = useState(0);
  const [horizon, setHorizon] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((tst) => {
    clearTimeout(toastTimer.current);
    setToast(tst);
    toastTimer.current = setTimeout(() => setToast(null), tst.action ? 5000 : 2600);
  }, []);

  const [daySheet, setDaySheet] = useState(null);
  const newListRef = useRef(null);
  newListRef.current = (forDate = null) => {
    const id = actions.saveList({ title: t('list.defaultTitle'), date: forDate, time: null, note: '', remind: false });
    setStack((s) => [...s, { name: 'list', params: { id, write: true }, key: Date.now() + Math.random() }]);
  };
  const nav = useMemo(() => ({
    newList: (forDate) => newListRef.current(forDate),
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

  const sound = data.settings.sound || 'default';
  useEffect(() => { N.configure(t, sound); }, [t, sound]);
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
      try { setScheduled(await N.sync(plan, sound)); } catch (e) { /* noop */ }
    }, 600);
    return () => clearTimeout(timer);
  }, [data.tasks, data.people, data.lists, data.settings, perm, t, dayKey]);

  const dataRef = useRef(data);
  dataRef.current = data;

  // Keep the home-screen widget in step with the data.
  useEffect(() => {
    const timer = setTimeout(() => { updateWidget(data); }, 900);
    return () => clearTimeout(timer);
  }, [data.tasks, data.people, data.lists, data.settings, dayKey]);

  // Deep links from the widget: remindme://add, remindme://list/<id>
  const openAddRef = useRef(null);
  useEffect(() => {
    const handle = (url) => {
      if (!url) return;
      const m = url.match(/remindme:\/\/(\w+)(?:\/([\w-]+))?/);
      if (!m) return;
      if (m[1] === 'add' && openAddRef.current) { setStack([]); setTab('today'); openAddRef.current(todayStr()); }
      if (m[1] === 'list' && m[2]) { setTab('today'); setStack([{ name: 'list', params: { id: m[2] }, key: 'l' + Date.now() }]); }
    };
    Linking.getInitialURL().then(handle).catch(() => {});
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => sub.remove();
  }, []);

  // Notification taps and action buttons.
  useEffect(() => N.onResponse(({ action, data: d }) => {
    if (d.kind === 'task') {
      if (action === 'done') { actions.setTaskDone(d.id, d.date); return; }
      if (action === 'snooze') { actions.snoozeTask(d.id, d.date, 60); return; }
      if (action === 'tomorrow') {
        const task = dataRef.current.tasks.find((x) => x.id === d.id);
        const tomorrow = addDays(todayStr(), 1);
        if (task && !isRecurring(task)) actions.postponeTask(d.id, tomorrow);
        else {
          const at = combine(tomorrow, (task && task.time) || dataRef.current.settings.defaultTime || '09:00');
          actions.snoozeTask(d.id, d.date, Math.max(1, Math.round((at.getTime() - Date.now()) / 60000)));
        }
        return;
      }
      setStack([]); setTab('today'); if (d.date) setDate(d.date);
    } else if (d.kind === 'person') {
      setStack([]); setTab('today'); if (d.date) setDate(d.date);
    } else if (d.kind === 'list') {
      setTab('today'); setStack([{ name: 'list', params: { id: d.id }, key: 'n' + Date.now() }]);
    }
  }), [actions]);

  // Android back button closes the top screen first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (addOpen) { setAddOpen(null); return true; }
      if (daySheet) { setDaySheet(null); return true; }
      if (stack.length) { nav.pop(); return true; }
      if (tab !== 'today') { setTab('today'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, tab, nav, addOpen, daySheet]);

  const mods = data.settings.modules;
  const tabs = [
    { key: 'today', icon: 'sunny' },
    { key: 'calendar', icon: 'calendar' },
    mods.tasks && { key: 'tasks', icon: 'checkmark-circle' },
    mods.shopping && { key: 'shopping', icon: 'basket' },
    mods.notes !== false && { key: 'notes', icon: 'document-text' },
  ].filter(Boolean);
  useEffect(() => { if (!tabs.find((x) => x.key === tab)) setTab('today'); }, [mods.tasks, mods.shopping, mods.notes]);

  const notifState = perm === 'denied' ? 'denied' : horizon ? 'horizon' : 'ok';

  const openAdd = (forDate) => {
    const enabled = [mods.tasks, mods.shopping, mods.birthdays, mods.notes !== false].filter(Boolean).length;
    if (enabled === 1) {
      if (mods.tasks) return nav.push('task', { date: forDate });
      if (mods.shopping) return nav.newList(forDate);
      if (mods.notes !== false) return nav.push('note', {});
      return nav.push('person', {});
    }
    setAddOpen(forDate);
  };
  openAddRef.current = openAdd;
  const onFab = () => {
    if (tab === 'tasks') return nav.push('task', { date: todayStr() });
    if (tab === 'shopping') return nav.newList(null);
    if (tab === 'notes') return nav.push('note', {});
    if (tab === 'calendar') return openAdd(calDate);
    return openAdd(date);
  };

  if (!data.settings.onboarded) {
    return (
      <I18nCtx.Provider value={i18n}>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />
        <Onboarding onRequestPermission={requestPermission}
          onDone={() => actions.setSettings({ onboarded: true, lang: data.settings.lang || lang })} />
      </I18nCtx.Provider>
    );
  }

  const top = stack[stack.length - 1];
  const TopScreen = top && top.name !== 'settings' ? STACK_SCREENS[top.name] : null;
  const screenProps = { nav, now };

  return (
    <I18nCtx.Provider value={i18n}>
     <ToastCtx.Provider value={showToast}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />
      <View key={scheme} style={{ flex: 1, backgroundColor: C.bg }}>
        <Backdrop />
        <View style={{ flex: 1 }}>
          {tab === 'today' ? <TodayScreen {...screenProps} date={date} setDate={setDate} notifState={notifState} openDay={setDaySheet} /> : null}
          {tab === 'calendar' ? <CalendarScreen {...screenProps} selected={calDate} setSelected={setCalDate} onAdd={openAdd} openDay={setDaySheet} /> : null}
          {tab === 'notes' ? <NotesScreen {...screenProps} /> : null}
          {tab === 'tasks' ? <TasksScreen {...screenProps} /> : null}
          {tab === 'shopping' ? <ShoppingScreen {...screenProps} /> : null}
        </View>
        <TabBar tab={tab} setTab={nav.setTab} tabs={tabs} onAdd={onFab} />
        {top ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg }}>
            {top.name === 'settings'
              ? <SettingsScreen key={top.key} nav={nav} notif={perm} onRequestPermission={requestPermission} scheduledCount={scheduled} />
              : <TopScreen key={top.key} nav={nav} params={top.params} now={now} />}
          </View>
        ) : null}
        <Sheet visible={!!addOpen} onClose={() => setAddOpen(null)} title={t('add.what')}>
          <AddSheetContent mods={mods} onPick={(k) => {
            const d = addOpen;
            setAddOpen(null);
            if (k === 'task') nav.push('task', { date: d });
            if (k === 'list') nav.newList(d || null);
            if (k === 'note') nav.push('note', {});
            if (k === 'person') nav.push('person', {});
          }} />
        </Sheet>
        <DaySheet date={daySheet} onClose={() => setDaySheet(null)} nav={nav} />
        <ToastHost toast={toast} onClose={() => setToast(null)} />
      </View>
     </ToastCtx.Provider>
    </I18nCtx.Provider>
  );
}

export default function App() {
  const [loaded, error] = useFonts({ Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold, Rubik_800ExtraBold });
  fontState.loaded = !!loaded && !error;
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
