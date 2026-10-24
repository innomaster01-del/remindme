// Pure notification planner. Given the app data, returns the list of notifications that
// should be scheduled. The platform layer (src/notifications.js) cancels everything and
// schedules this plan, so re-running it never creates duplicates.

import { addDays, combine, toDateStr } from './dates';
import { occurrencesBetween, isDoneOn, birthdayInYear } from './recurrence';

export const WINDOW_DAYS = 30;
export const MAX_SCHEDULED = 60; // iOS allows 64 pending local notifications per app

export function buildPlan(data, now, t) {
  const { tasks = [], people = [], lists = [], settings = {} } = data;
  const modules = settings.modules || { tasks: true, birthdays: true, shopping: true };
  const defTime = settings.defaultTime || '09:00';
  const hide = !!settings.hideContent;
  const from = toDateStr(now);
  const to = addDays(from, WINDOW_DAYS);
  const items = [];
  const add = (id, when, title, body, data) => {
    if (when.getTime() <= now.getTime() + 5000) return;
    items.push({
      id,
      when,
      title: hide ? t('notif.privateTitle') : title,
      body: hide ? t('notif.privateBody') : body,
      data,
    });
  };

  if (modules.tasks !== false) {
    for (const task of tasks) {
      if (task.status === 'cancelled') continue;
      if (task.status === 'done' && !(task.repeat && task.repeat.type !== 'none')) continue;
      for (const d of occurrencesBetween(task, from, to)) {
        if (isDoneOn(task, d)) continue;
        add(`task:${task.id}:${d}`, combine(d, task.time || defTime), task.title,
          task.notes || t('notif.taskBody'), { kind: 'task', id: task.id, date: d });
      }
      if (task.snoozeUntil) {
        const when = new Date(task.snoozeUntil);
        add(`task:${task.id}:snooze`, when, task.title, t('notif.snoozed'),
          { kind: 'task', id: task.id, date: task.snoozeDate || from });
      }
    }
  }

  if (modules.birthdays !== false) {
    const y = now.getFullYear();
    for (const p of people) {
      for (const yr of [y, y + 1]) {
        const d = birthdayInYear(p, yr);
        const age = p.year ? yr - p.year : null;
        const time = p.time || defTime;
        if (p.remindOnDay !== false) {
          add(`bday:${p.id}:${d}:day`, combine(d, time), t('notif.bdayTodayTitle', { name: p.name }),
            age ? t('notif.bdayAge', { n: age }) : t('notif.bdayBody'), { kind: 'person', id: p.id, date: d });
        }
        if (p.remindDayBefore) {
          const before = addDays(d, -1);
          add(`bday:${p.id}:${d}:before`, combine(before, time), t('notif.bdayTomorrowTitle', { name: p.name }),
            t('notif.bdayTomorrowBody'), { kind: 'person', id: p.id, date: d });
        }
      }
    }
  }

  if (modules.shopping !== false) {
    for (const l of lists) {
      if (!l.date || l.status === 'done') continue;
      const left = (l.items || []).filter((i) => !i.checked).length;
      add(`list:${l.id}:${l.date}`, combine(l.date, l.time || defTime), t('notif.listTitle', { title: l.title }),
        t('notif.listBody', { n: left }), { kind: 'list', id: l.id, date: l.date });
    }
  }

  items.sort((a, b) => a.when - b.when);
  const scheduled = items.slice(0, MAX_SCHEDULED);
  const truncated = items.length > MAX_SCHEDULED;
  // How far ahead reminders are guaranteed. If truncated, only up to the last scheduled one.
  const horizon = truncated ? scheduled[scheduled.length - 1].when : null;
  return { items: scheduled, truncated, horizon, total: items.length };
}

export function planSignature(plan) {
  return plan.items.map((i) => `${i.id}@${i.when.getTime()}|${i.title}|${i.body}`).join('\n');
}
