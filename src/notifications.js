// Platform layer for local notifications (expo-notifications).
// The plan itself is computed by src/logic/scheduler.js (pure + unit tested).
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { planSignature } from './logic/scheduler';

const LAST_KEY = 'remindme:lastNotificationResponse';

export const supported = Platform.OS === 'ios' || Platform.OS === 'android';
const CHANNEL = 'reminders';
let lastSig = null;

// Reminder sounds bundled with the app (assets/sounds). Android fixes a channel's sound when it
// is created, so every sound gets its own channel.
export const SOUNDS = ['default', 'chime', 'bell', 'soft', 'digital', 'silent'];
const channelFor = (sound) => (!sound || sound === 'default' ? CHANNEL : `${CHANNEL}_${sound}`);
const contentSound = (sound) => (!sound || sound === 'default' ? true : sound === 'silent' ? false : `${sound}.wav`);

export async function configure(t, sound = 'default') {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: t('settings.notifications'),
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 120, 200],
      });
      if (sound && sound !== 'default') {
        await Notifications.setNotificationChannelAsync(channelFor(sound), {
          name: `${t('settings.notifications')} · ${t('sound.' + sound)}`,
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 200, 120, 200],
          enableVibrate: true,
          sound: sound === 'silent' ? null : `${sound}.wav`,
        });
      }
    }
    await Notifications.setNotificationCategoryAsync('task', [
      { identifier: 'done', buttonTitle: t('notif.actDone'), options: { opensAppToForeground: true } },
      { identifier: 'snooze', buttonTitle: t('notif.actSnooze'), options: { opensAppToForeground: true } },
      { identifier: 'tomorrow', buttonTitle: t('notif.actTomorrow'), options: { opensAppToForeground: true } },
    ]);
  } catch (e) {
    // categories / channels are best-effort
  }
}

export async function getPermission() {
  if (!supported) return 'unsupported';
  const s = await Notifications.getPermissionsAsync();
  if (s.granted || s.ios?.status === Notifications.IosAuthorizationStatus?.PROVISIONAL) return 'granted';
  return s.canAskAgain === false || s.status === 'denied' ? 'denied' : 'undetermined';
}

export async function requestPermission() {
  if (!supported) return 'unsupported';
  const s = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return s.granted ? 'granted' : 'denied';
}

// Cancel everything and schedule the plan. Skips work when nothing changed.
export async function sync(plan, sound = 'default', force = false) {
  if (!supported) return 0;
  const sig = sound + '\n' + planSignature(plan);
  if (!force && sig === lastSig) return plan.items.length;
  lastSig = sig;
  // Cancel everything we scheduled before (but leave a pending test notification alone).
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(pending.filter((n) => n.identifier !== 'test').map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  } catch (e) {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
  for (const item of plan.items) {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: item.id,
        content: {
          title: item.title,
          body: item.body,
          data: item.data,
          sound: contentSound(sound),
          categoryIdentifier: item.data.kind === 'task' ? 'task' : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.when,
          channelId: channelFor(sound),
        },
      });
    } catch (e) {
      // one bad item must not stop the rest
    }
  }
  return plan.items.length;
}

// A one-off notification a few seconds from now, to check that reminders really arrive.
export async function sendTest(t, sound = 'default', seconds = 5) {
  if (!supported) return;
  await configure(t, sound);
  await Notifications.scheduleNotificationAsync({
    identifier: 'test',
    content: { title: t('reliable.testTitle'), body: t('reliable.testBody'), sound: contentSound(sound), data: { kind: 'test' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: channelFor(sound) },
  });
}

export function onResponse(handler) {
  if (!supported) return () => {};
  const seen = new Set();
  const wrap = (resp) => {
    if (!resp) return;
    const key = resp.notification.request.identifier + ':' + resp.actionIdentifier + ':' + resp.notification.date;
    if (seen.has(key)) return;
    seen.add(key);
    AsyncStorage.setItem(LAST_KEY, key).catch(() => {});
    handler({
      action: resp.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER ? 'open' : resp.actionIdentifier,
      data: resp.notification.request.content.data || {},
    });
  };
  // On a cold start, handle the tap that opened the app — but only once, ever.
  Notifications.getLastNotificationResponseAsync()
    .then(async (r) => {
      if (!r) return;
      const key = r.notification.request.identifier + ':' + r.actionIdentifier + ':' + r.notification.date;
      const prev = await AsyncStorage.getItem(LAST_KEY);
      if (prev === key) return;
      await AsyncStorage.setItem(LAST_KEY, key);
      wrap(r);
    })
    .catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener(wrap);
  return () => sub.remove();
}
