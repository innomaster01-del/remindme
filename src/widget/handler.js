import * as Notifications from 'expo-notifications';
import { loadData, saveData } from '../store';
import { isRecurring } from '../logic/recurrence';
import { renderToday } from './TodayWidget';

export async function widgetTaskHandler(props) {
  const height = props.widgetInfo && props.widgetInfo.height;
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await loadData();
      props.renderWidget(renderToday(data, height));
      break;
    }
    case 'WIDGET_CLICK': {
      if (props.clickAction !== 'TOGGLE') break;
      const { id, date } = props.clickActionData || {};
      const data = await loadData();
      let nowDone = false;
      data.tasks = data.tasks.map((x) => {
        if (x.id !== id) return x;
        if (isRecurring(x)) {
          const dd = x.doneDates || [];
          nowDone = !dd.includes(date);
          return { ...x, doneDates: nowDone ? [...dd, date] : dd.filter((v) => v !== date), snoozeUntil: null };
        }
        nowDone = x.status !== 'done';
        return { ...x, status: nowDone ? 'done' : 'open', completedAt: nowDone ? Date.now() : null, snoozeUntil: null };
      });
      await saveData(data);
      if (nowDone) {
        try { await Notifications.cancelScheduledNotificationAsync(`task:${id}:${date}`); } catch (e) { /* noop */ }
      }
      props.renderWidget(renderToday(data, height));
      break;
    }
    default:
      break;
  }
}
