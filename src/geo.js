// Location reminders: when you arrive at a saved place (e.g. the supermarket), get a notification
// with the open shopping lists linked to that place. Uses OS geofencing, so it works with the app closed.
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadData } from './store';
import { makeT } from './i18n';

export const GEO_TASK = 'remindme-geofence';
export const geoSupported = Platform.OS === 'android' || Platform.OS === 'ios';
const THROTTLE_MS = 3 * 60 * 60 * 1000; // at most one alert per place every 3 hours

if (geoSupported) {
  try {
    TaskManager.defineTask(GEO_TASK, async ({ data, error }) => {
      if (error || !data || data.eventType !== Location.GeofencingEventType.Enter) return;
      try {
        const placeId = data.region && data.region.identifier;
        const key = `remindme:geo:last:${placeId}`;
        const last = Number(await AsyncStorage.getItem(key)) || 0;
        if (Date.now() - last < THROTTLE_MS) return;
        const d = await loadData();
        const place = d.places.find((p) => p.id === placeId);
        const lists = d.lists.filter((l) => l.placeId === placeId && l.status !== 'done' && l.items.some((i) => !i.checked));
        if (!place || !lists.length) return;
        const t = makeT(d.settings.lang || 'he');
        const body = lists.map((l) => `${l.title}: ${t('today.itemsLeft', { n: l.items.filter((i) => !i.checked).length })}`).join('\n');
        await AsyncStorage.setItem(key, String(Date.now()));
        await Notifications.scheduleNotificationAsync({
          content: { title: t('geo.arrived', { place: place.name }), body, sound: true, data: { kind: 'list', id: lists[0].id } },
          trigger: { channelId: 'reminders' },
        });
      } catch (e) { /* ignore */ }
    });
  } catch (e) { /* task manager unavailable (e.g. Expo Go) */ }
}

export async function locationPermission() {
  if (!geoSupported) return 'unsupported';
  try {
    const fg = await Location.getForegroundPermissionsAsync();
    if (!fg.granted) return 'none';
    const bg = await Location.getBackgroundPermissionsAsync();
    return bg.granted ? 'always' : 'foreground';
  } catch (e) { return 'none'; }
}

export async function requestForeground() {
  const r = await Location.requestForegroundPermissionsAsync();
  return r.granted;
}

// Background ("Allow all the time") is needed for arrival alerts while the app is closed.
export async function requestBackground() {
  if (!(await requestForeground())) return false;
  const r = await Location.requestBackgroundPermissionsAsync();
  return r.granted;
}

export async function currentPosition() {
  if (!(await requestForeground())) return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

export async function geocode(address) {
  if (!(await requestForeground())) return null;
  const res = await Location.geocodeAsync(address);
  return res && res[0] ? { lat: res[0].latitude, lng: res[0].longitude } : null;
}

// Watch only the places that have an open list with something still to buy.
export async function syncGeofences(data) {
  if (!geoSupported) return;
  try {
    const active = new Set(data.lists.filter((l) => l.placeId && l.status !== 'done' && l.items.some((i) => !i.checked)).map((l) => l.placeId));
    const regions = data.places
      .filter((p) => active.has(p.id) && typeof p.lat === 'number')
      .map((p) => ({ identifier: p.id, latitude: p.lat, longitude: p.lng, radius: p.radius || 200, notifyOnEnter: true, notifyOnExit: false }));
    const started = await Location.hasStartedGeofencingAsync(GEO_TASK).catch(() => false);
    if (!regions.length) {
      if (started) await Location.stopGeofencingAsync(GEO_TASK);
      return;
    }
    if ((await locationPermission()) !== 'always') return;
    await Location.startGeofencingAsync(GEO_TASK, regions.slice(0, 20));
  } catch (e) { /* ignore */ }
}
