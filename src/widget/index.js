// Safe wrapper: the widget exists only in the Android build (not in Expo Go / iOS / web).
import { Platform } from 'react-native';

let lib = null;
if (Platform.OS === 'android') {
  try { lib = require('react-native-android-widget'); } catch (e) { lib = null; }
}

export function registerWidget() {
  if (!lib) return;
  try {
    const { widgetTaskHandler } = require('./handler');
    lib.registerWidgetTaskHandler(widgetTaskHandler);
  } catch (e) { /* noop */ }
}

export function updateWidget(data) {
  if (!lib) return;
  try {
    const { renderToday } = require('./TodayWidget');
    lib.requestWidgetUpdate({ widgetName: 'Today', renderWidget: (info) => renderToday(data, info && info.height), widgetNotFound: () => {} });
  } catch (e) { /* noop */ }
}
