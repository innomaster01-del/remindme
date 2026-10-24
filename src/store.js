import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayStr, addDays } from './logic/dates';

const KEY = 'remindme:data:v1';
export const SCHEMA_VERSION = 1;

export const DEFAULT_DATA = {
  version: SCHEMA_VERSION,
  settings: {
    lang: null,
    defaultTime: '09:00',
    modules: { tasks: true, birthdays: true, shopping: true },
    hideContent: false,
    onboarded: false,
  },
  tasks: [],
  people: [],
  lists: [],
  itemHistory: {},
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

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        setData(raw ? migrate(JSON.parse(raw)) : DEFAULT_DATA);
      } catch (e) {
        setData(DEFAULT_DATA);
      }
    })();
  }, []);

  useEffect(() => {
    if (!data) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
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
