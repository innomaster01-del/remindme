import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayStr, addDays } from './logic/dates';
import { normName, classify, deptOrder } from './logic/departments';
import { syncItemsFromText } from './logic/listtext';

const KEY = 'remindme:data:v1';
export const STORAGE_KEY = KEY;

// For code that runs without the UI (home-screen widget, location reminders).
export async function loadData() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? migrate(JSON.parse(raw)) : { ...DEFAULT_DATA };
}
export async function saveData(d) {
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...d, savedAt: Date.now() }));
}
export const SCHEMA_VERSION = 1;

export const DEFAULT_DATA = {
  version: SCHEMA_VERSION,
  settings: {
    lang: null,
    defaultTime: '09:00',
    modules: { tasks: true, birthdays: true, shopping: true, notes: true },
    hideContent: false,
    onboarded: false,
  },
  tasks: [],
  people: [],
  lists: [],
  itemHistory: {},
  deptLearned: {},
  notes: [],
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Upgrades older saved data to the current shape. Add steps here when the schema changes.
export function migrate(raw) {
  const d = { ...DEFAULT_DATA, ...raw };
  d.settings = { ...DEFAULT_DATA.settings, ...(raw.settings || {}) };
  d.settings.modules = { ...DEFAULT_DATA.settings.modules, ...(raw.settings?.modules || {}) };
  d.tasks = Array.isArray(raw.tasks) ? raw.tasks : [];
  d.people = Array.isArray(raw.people) ? raw.people : [];
  d.lists = Array.isArray(raw.lists) ? raw.lists : [];
  d.itemHistory = raw.itemHistory && typeof raw.itemHistory === 'object' ? raw.itemHistory : {};
  delete d.places;
  d.lists = d.lists.map(({ placeId, ...l }) => l);
  d.deptLearned = raw.deptLearned && typeof raw.deptLearned === 'object' ? raw.deptLearned : {};
  d.notes = Array.isArray(raw.notes) ? raw.notes : [];
  d.version = SCHEMA_VERSION;
  return d;
}

export function validateBackup(obj) {
  return obj && typeof obj === 'object' && obj.app === 'remindme' && obj.data && Array.isArray(obj.data.tasks);
}

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

const replaceIn = (arr, item) => {
  const i = arr.findIndex((x) => x.id === item.id);
  if (i === -1) return [...arr, item];
  const copy = arr.slice();
  copy[i] = item;
  return copy;
};
const mapItems = (list, fn) => ({ ...list, items: list.items.map(fn) });
const norm = (s) => s.trim().toLowerCase();

export function StoreProvider({ children }) {
  const [data, setData] = useState(null);
  const saveTimer = useRef(null);
  const lastSaved = useRef(0);
  const skipSave = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        lastSaved.current = parsed?.savedAt || 0;
        skipSave.current = true;
        setData(parsed ? migrate(parsed) : DEFAULT_DATA);
      } catch (e) {
        setData(DEFAULT_DATA);
      }
    })();
    // The widget can change data while the app is in the background — pick that up on return.
    const sub = AppState.addEventListener('change', async (st) => {
      if (st !== 'active') return;
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        console.log('[dbg] app active');
        if (parsed && (parsed.savedAt || 0) > lastSaved.current + 50) {
          lastSaved.current = parsed.savedAt;
          skipSave.current = true;
          setData(migrate(parsed));
        }
      } catch (e) { /* noop */ }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!data) return;
    if (skipSave.current) { skipSave.current = false; return; }
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const savedAt = Date.now();
      lastSaved.current = savedAt;
      AsyncStorage.setItem(KEY, JSON.stringify({ ...data, savedAt })).catch(() => {});
    }, 250);
  }, [data]);

  const actions = useMemo(() => {
    const up = (fn) => setData((d) => fn(d));
    const upList = (id, fn) => up((d) => ({ ...d, lists: d.lists.map((l) => (l.id === id ? fn(l) : l)) }));
    const upTask = (id, fn) => up((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === id ? fn(x) : x)) }));

    return {
      setSettings: (patch) => up((d) => ({ ...d, settings: { ...d.settings, ...patch } })),

      // ----- tasks -----
      saveTask: (task) => up((d) => ({ ...d, tasks: replaceIn(d.tasks, task.id ? task : { ...task, id: uid(), createdAt: Date.now() }) })),
      deleteTask: (id) => up((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) })),
      toggleTask: (id, date) => upTask(id, (x) => {
        const recurring = x.repeat && x.repeat.type !== 'none';
        if (recurring) {
          const dd = x.doneDates || [];
          const has = dd.includes(date);
          return { ...x, doneDates: has ? dd.filter((v) => v !== date) : [...dd, date], snoozeUntil: null };
        }
        const done = x.status === 'done';
        return { ...x, status: done ? 'open' : 'done', completedAt: done ? null : Date.now(), snoozeUntil: null };
      }),
      setTaskDone: (id, date) => upTask(id, (x) => {
        const recurring = x.repeat && x.repeat.type !== 'none';
        if (recurring) {
          const dd = x.doneDates || [];
          return dd.includes(date) ? { ...x, snoozeUntil: null } : { ...x, doneDates: [...dd, date], snoozeUntil: null };
        }
        return { ...x, status: 'done', completedAt: Date.now(), snoozeUntil: null };
      }),
      postponeTask: (id, toDate) => upTask(id, (x) => ({ ...x, date: toDate, snoozeUntil: null })),
      postponeMany: (ids, toDate) => up((d) => ({
        ...d, tasks: d.tasks.map((x) => (ids.includes(x.id) ? { ...x, date: toDate, snoozeUntil: null } : x)),
      })),
      snoozeTask: (id, date, minutes = 60) => upTask(id, (x) => ({
        ...x, snoozeUntil: new Date(Date.now() + minutes * 60000).toISOString(), snoozeDate: date,
      })),

      // ----- people -----
      savePerson: (p) => up((d) => ({ ...d, people: replaceIn(d.people, p.id ? p : { ...p, id: uid(), createdAt: Date.now() }) })),
      deletePerson: (id) => up((d) => ({ ...d, people: d.people.filter((x) => x.id !== id) })),

      // ----- shopping lists -----
      saveList: (l) => {
        const id = l.id || uid();
        up((d) => ({ ...d, lists: replaceIn(d.lists, { items: [], status: 'open', createdAt: Date.now(), ...l, id }) }));
        return id;
      },
      deleteList: (id) => up((d) => ({ ...d, lists: d.lists.filter((x) => x.id !== id) })),
      setListStatus: (id, status) => upList(id, (l) => ({ ...l, status })),
      addItem: (listId, name, qty) => up((d) => {
        const clean = name.trim();
        if (!clean) return d;
        const key = norm(clean);
        const hist = { ...d.itemHistory, [key]: { name: clean, count: (d.itemHistory[key]?.count || 0) + 1, last: Date.now() } };
        return {
          ...d,
          itemHistory: hist,
          lists: d.lists.map((l) => (l.id === listId
            ? { ...l, status: 'open', items: [...l.items, { id: uid(), name: clean, qty: (qty || '').trim(), checked: false }] }
            : l)),
        };
      }),
      toggleItem: (listId, itemId) => upList(listId, (l) => mapItems(l, (i) => (i.id === itemId ? { ...i, checked: !i.checked } : i))),
      updateItem: (listId, item) => upList(listId, (l) => mapItems(l, (i) => (i.id === item.id ? { ...i, ...item } : i))),
      deleteItem: (listId, itemId) => upList(listId, (l) => ({ ...l, items: l.items.filter((i) => i.id !== itemId) })),
      clearChecked: (listId) => upList(listId, (l) => ({ ...l, items: l.items.filter((i) => !i.checked) })),
      duplicateList: (listId, suffix, date) => {
        const newId = uid();
        up((d) => {
          const src = d.lists.find((l) => l.id === listId);
          if (!src) return d;
          const copy = {
            ...src, id: newId, title: `${src.title} ${suffix}`.trim(), status: 'open', createdAt: Date.now(),
            date: date === undefined ? src.date : date,
            items: src.items.map((i) => ({ ...i, id: uid(), checked: false })),
          };
          return { ...d, lists: [...d.lists, copy] };
        });
        return newId;
      },
      // Move unbought items to a new list on another date; the original is marked done.
      moveLeftovers: (listId, date) => {
        const newId = uid();
        up((d) => {
          const src = d.lists.find((l) => l.id === listId);
          if (!src) return d;
          const left = src.items.filter((i) => !i.checked);
          if (!left.length) return d;
          const existing = d.lists.find((l) => l.id !== listId && l.status !== 'done' && l.date === date && l.title === src.title);
          let lists = d.lists.map((l) => (l.id === listId ? { ...l, status: 'done', items: l.items.filter((i) => i.checked) } : l));
          if (existing) {
            lists = lists.map((l) => (l.id === existing.id ? { ...l, items: [...l.items, ...left] } : l));
          } else {
            lists = [...lists, { ...src, id: newId, date, status: 'open', createdAt: Date.now(), items: left }];
          }
          return { ...d, lists };
        });
        return newId;
      },

      // ----- subtasks -----
      setSubtasks: (taskId, subtasks) => upTask(taskId, (x) => ({ ...x, subtasks })),
      toggleSubtask: (taskId, subId) => upTask(taskId, (x) => ({
        ...x, subtasks: (x.subtasks || []).map((st) => (st.id === subId ? { ...st, done: !st.done } : st)),
      })),

      // ----- departments -----
      setItemCat: (listId, itemId, cat) => up((d) => {
        const list = d.lists.find((l) => l.id === listId);
        const item = list && list.items.find((i) => i.id === itemId);
        if (!item) return d;
        return {
          ...d,
          deptLearned: { ...d.deptLearned, [normName(item.name)]: cat },
          lists: d.lists.map((l) => (l.id === listId ? mapItems(l, (i) => (i.id === itemId ? { ...i, cat } : i)) : l)),
        };
      }),

      // Re-order a shopping list by supermarket department (only when the user asks).
      sortListByDept: (listId) => up((d) => ({
        ...d,
        lists: d.lists.map((l) => {
          if (l.id !== listId) return l;
          const keyed = l.items.map((it, i) => ({ it, i, o: deptOrder(it.cat || classify(it.name, d.deptLearned)) }));
          keyed.sort((a, b) => (a.it.checked - b.it.checked) || (a.o - b.o) || (a.i - b.i));
          return { ...l, items: keyed.map((k) => k.it) };
        }),
      })),
      setItemsOrder: (listId, items) => upList(listId, (l) => ({ ...l, items })),

      // ----- pinning -----
      togglePinTask: (id) => upTask(id, (x) => ({ ...x, pinned: !x.pinned })),

      // ----- shopping list as text -----
      setListText: (listId, text) => up((d) => {
        const list = d.lists.find((l) => l.id === listId);
        if (!list) return d;
        const { items, added } = syncItemsFromText(list.items, text, uid);
        const hist = { ...d.itemHistory };
        for (const name of added) {
          const key = norm(name);
          hist[key] = { name, count: (hist[key]?.count || 0) + 1, last: Date.now() };
        }
        return { ...d, itemHistory: hist, lists: d.lists.map((l) => (l.id === listId ? { ...l, items, status: items.some((i) => !i.checked) ? 'open' : l.status } : l)) };
      }),

      // ----- notes -----
      saveNote: (note) => {
        const id = note.id || uid();
        up((d) => ({ ...d, notes: replaceIn(d.notes, { createdAt: Date.now(), ...note, id, updatedAt: Date.now() }) }));
        return id;
      },
      deleteNote: (id) => up((d) => ({ ...d, notes: d.notes.filter((x) => x.id !== id) })),
      restoreNote: (n) => up((d) => ({ ...d, notes: replaceIn(d.notes, n) })),
      togglePinNote: (id) => up((d) => ({ ...d, notes: d.notes.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)) })),

      // ----- undo -----
      restoreTask: (task) => up((d) => ({ ...d, tasks: replaceIn(d.tasks, task) })),
      restorePerson: (p) => up((d) => ({ ...d, people: replaceIn(d.people, p) })),
      restoreList: (l) => up((d) => ({ ...d, lists: replaceIn(d.lists, l) })),
      restoreItem: (listId, item, index) => upList(listId, (l) => {
        const items = l.items.filter((i) => i.id !== item.id);
        items.splice(Math.min(index, items.length), 0, item);
        return { ...l, items };
      }),
      addItems: (listId, names) => up((d) => {
        const hist = { ...d.itemHistory };
        const fresh = [];
        for (const raw of names) {
          const clean = raw.trim();
          if (!clean) continue;
          const key = norm(clean);
          hist[key] = { name: clean, count: (hist[key]?.count || 0) + 1, last: Date.now() };
          fresh.push({ id: uid(), name: clean, qty: '', checked: false });
        }
        if (!fresh.length) return d;
        return { ...d, itemHistory: hist, lists: d.lists.map((l) => (l.id === listId ? { ...l, status: 'open', items: [...l.items, ...fresh] } : l)) };
      }),

      // ----- whole data -----
      replaceAll: (newData) => setData(migrate(newData)),
      resetAll: () => setData((d) => ({ ...DEFAULT_DATA, settings: { ...DEFAULT_DATA.settings, lang: d.settings.lang, onboarded: true } })),
    };
  }, []);

  const value = useMemo(() => ({ data, actions }), [data, actions]);
  if (!data) return null;
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function exportBackup(data) {
  return JSON.stringify({ app: 'remindme', exportedAt: new Date().toISOString(), data });
}

export { todayStr, addDays };
