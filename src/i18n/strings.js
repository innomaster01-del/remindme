// UI strings in Hebrew, English and Russian.
// Plural keys are objects: { one, few, many, other } (Russian uses all; others use one/other).

const he = {
  appName: 'Poof Reminder',
  tabs: { today: 'היום', tasks: 'משימות', people: 'ימי הולדת', shopping: 'קניות', settings: 'הגדרות' },
  common: {
    save: 'שמירה', cancel: 'ביטול', delete: 'מחיקה', edit: 'עריכה', done: 'סיום', close: 'סגירה',
    today: 'היום', tomorrow: 'מחר', yesterday: 'אתמול', none: 'ללא', pickDate: 'בחירת תאריך',
    pickTime: 'בחירת שעה', noTime: 'בלי שעה', noDate: 'בלי תאריך', confirmDelete: 'למחוק?',
    confirmDeleteBody: 'אי אפשר לבטל את הפעולה.', yes: 'כן', no: 'לא', ok: 'אישור', add: 'הוספה',
    optional: 'לא חובה', notes: 'הערות', title: 'כותרת', date: 'תאריך', time: 'שעה',
    hour: 'שעה', minute: 'דקות', back: 'חזרה',
  },
  greet: { morning: 'בוקר טוב', noon: 'צהריים טובים', evening: 'ערב טוב', night: 'לילה טוב' },
  today: {
    tasks: 'משימות', overdue: 'נשארו מימים קודמים', birthdays: 'ימי הולדת', upcoming: 'בשבוע הקרוב',
    shopping: 'קניות', emptyTitle: 'יום נקי', emptyBody: 'אין כלום מתוכנן. אפשר להוסיף משהו בכפתור +',
    endOfDay: 'היום כמעט נגמר — מה עושים עם מה שנשאר פתוח?', moveAllTomorrow: 'להעביר הכל למחר',
    backToToday: 'חזרה להיום', call: 'התקשרות', itemsLeft: { one: 'נשאר פריט אחד', other: 'נשארו {n} פריטים' },
    allBought: 'הכל נקנה ✓',
  },
  add: { what: 'מה להוסיף?', task: 'משימה', list: 'רשימת קניות', person: 'יום הולדת' },
  task: {
    new: 'משימה חדשה', edit: 'עריכת משימה', titlePh: 'מה צריך לעשות?', notesPh: 'פרטים נוספים',
    repeat: 'חזרה', repeatNone: 'פעם אחת', daily: 'כל יום', weekly: 'כל שבוע', monthly: 'כל חודש',
    priority: 'חשיבות', low: 'נמוכה', normal: 'רגילה', high: 'גבוהה', postpone: 'דחייה למחר',
    reminderAt: 'תזכורת ב־{time}', defaultReminder: 'תזכורת ב־{time} (ברירת מחדל)',
    open: 'פתוחות', completed: 'הושלמו', overdue: 'באיחור', upcoming: 'בהמשך', noDate: 'בלי תאריך',
    emptyOpen: 'אין משימות פתוחות. כל הכבוד!', emptyDone: 'עוד לא הושלמו משימות',
    repeatsDaily: 'חוזרת כל יום', repeatsWeekly: 'חוזרת כל שבוע', repeatsMonthly: 'חוזרת כל חודש',
    monthlyNote: 'אם היום לא קיים בחודש (למשל 31), התזכורת תהיה ביום האחרון של החודש.',
    titleRequired: 'צריך לכתוב כותרת',
  },
  person: {
    new: 'יום הולדת חדש', edit: 'עריכת יום הולדת', name: 'שם', namePh: 'למי יום ההולדת?',
    birthday: 'תאריך לידה', day: 'יום', month: 'חודש', year: 'שנת לידה', phone: 'טלפון',
    notesPh: 'רעיונות למתנה, דברים לזכור…', remind: 'תזכורות', onDay: 'ביום עצמו',
    dayBefore: 'יום לפני', feb29: 'בשנה לא מעוברת, להזכיר ב:', feb28: '28 בפברואר', mar1: '1 במרץ',
    inDays: { one: 'מחר', other: 'בעוד {n} ימים' }, isToday: 'היום! 🎉', turns: 'יום הולדת {n}',
    empty: 'עוד אין ימי הולדת. הוסיפו את האנשים החשובים לכם.', nameRequired: 'צריך לכתוב שם',
    duplicate: 'כבר קיים יום הולדת עם אותו שם ותאריך. לשמור בכל זאת?',
  },
  list: {
    new: 'רשימה חדשה', edit: 'עריכת רשימה', titlePh: 'למשל: סופר שבועי', defaultTitle: 'קניות',
    addItemPh: 'הוספת פריט…', qtyPh: 'כמות', share: 'שיתוף', duplicate: 'שכפול', markDone: 'סימון כהושלמה',
    reopen: 'פתיחה מחדש', moveLeft: 'העברת מה שלא נקנה…', moveTo: 'להעביר את מה שלא נקנה לתאריך:',
    general: 'רשימות כלליות', dated: 'לפי תאריך', doneLists: 'הושלמו',
    empty: 'אין רשימות קניות. צרו רשימה ושייכו אותה ליום.', emptyItems: 'הרשימה ריקה. הקלידו פריט ולחצו Enter.',
    allBought: 'הכל נקנה! לסמן את הרשימה כהושלמה?', bought: 'נקנו',
    progress: '{done} מתוך {total}', dupItem: '״{name}״ כבר ברשימה', copySuffix: '(עותק)',
    shareHeader: '🛒 {title}', titleRequired: 'צריך לתת שם לרשימה', leftover: 'נשארו פריטים מ־{date}',
  },
  settings: {
    title: 'הגדרות', language: 'שפה', defaultTime: 'שעת תזכורת ברירת מחדל',
    defaultTimeHint: 'למשימות עם תאריך אבל בלי שעה', modules: 'מה להציג', notifications: 'התראות',
    notifOn: 'התראות פעילות', notifOff: 'ההתראות חסומות — התזכורות לא יופיעו', enable: 'הפעלת התראות',
    openSettings: 'פתיחת הגדרות הטלפון', hideContent: 'להסתיר את תוכן ההתראה במסך הנעילה',
    scheduled: '{n} תזכורות מתוזמנות', backup: 'גיבוי', export: 'ייצוא גיבוי', import: 'שחזור מגיבוי',
    importPh: 'הדביקו כאן את טקסט הגיבוי', importConfirm: 'השחזור יחליף את כל הנתונים הנוכחיים. להמשיך?',
    importBad: 'הטקסט הזה לא נראה כמו גיבוי תקין', importOk: 'הנתונים שוחזרו',
    backupHint: 'הגיבוי נשלח כטקסט (למשל לעצמכם בוואטסאפ או במייל). לשחזור — מדביקים אותו חזרה.',
    danger: 'מחיקת נתונים', deleteAll: 'מחיקת כל הנתונים', deleteAllBody: 'כל המשימות, ימי ההולדת והרשימות יימחקו לצמיתות.',
    langChanged: 'השפה שונתה', restartHint: 'אם הכיוון של המסך לא התעדכן, סגרו ופתחו את האפליקציה.',
    version: 'גרסה', webNote: 'בתצוגה בדפדפן אין התראות — הן פועלות רק בטלפון.',
  },
  banner: {
    noPermission: 'ההתראות כבויות, אז התזכורות לא יקפצו.', fix: 'להפעלה',
    horizon: 'יש הרבה תזכורות. פתחו את האפליקציה מדי פעם כדי שכולן ימשיכו לפעול.',
  },
  onboarding: {
    chooseLang: 'בחרו שפה', welcomeTitle: 'שלום! 👋',
    welcomeBody: 'כאן תוכלו לנהל משימות, לזכור ימי הולדת ולהכין רשימות קניות — עם תזכורות בזמן.',
    notifTitle: 'תזכורות בזמן', notifBody: 'כדי שנוכל להזכיר לכם, צריך לאשר התראות.',
    allow: 'אישור התראות', later: 'אחר כך', start: 'מתחילים',
  },
  notif: {
    privateTitle: 'תזכורת', privateBody: 'יש לך תזכורת חדשה', taskBody: 'תזכורת למשימה',
    snoozed: 'תזכורת חוזרת', bdayTodayTitle: '🎂 היום יום ההולדת של {name}', bdayAge: 'יום הולדת {n}! אל תשכחו לאחל',
    bdayBody: 'אל תשכחו לאחל!', bdayTomorrowTitle: '🎁 מחר יום ההולדת של {name}', bdayTomorrowBody: 'זה הזמן לחשוב על ברכה או מתנה',
    listTitle: '🛒 {title}', listBody: { one: 'פריט אחד ברשימה', other: '{n} פריטים ברשימה' },
    actDone: '✓ בוצע', actSnooze: 'הזכר בעוד שעה',
  },
  weekdays: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  weekdaysShort: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
  months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  dateFmt: '{weekday}, {day} ב{month}', dateShort: '{day} ב{month}', dateWithYear: '{day} ב{month} {year}',
};

const en = {
  appName: 'Poof Reminder',
  tabs: { today: 'Today', tasks: 'Tasks', people: 'Birthdays', shopping: 'Shopping', settings: 'Settings' },
  common: {
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', done: 'Done', close: 'Close',
    today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday', none: 'None', pickDate: 'Pick a date',
    pickTime: 'Pick a time', noTime: 'No time', noDate: 'No date', confirmDelete: 'Delete?',
    confirmDeleteBody: 'This can’t be undone.', yes: 'Yes', no: 'No', ok: 'OK', add: 'Add',
    optional: 'optional', notes: 'Notes', title: 'Title', date: 'Date', time: 'Time',
    hour: 'Hour', minute: 'Minutes', back: 'Back',
  },
  greet: { morning: 'Good morning', noon: 'Good afternoon', evening: 'Good evening', night: 'Good night' },
  today: {
    tasks: 'Tasks', overdue: 'Left over from earlier', birthdays: 'Birthdays', upcoming: 'This week',
    shopping: 'Shopping', emptyTitle: 'A clear day', emptyBody: 'Nothing planned. Tap + to add something.',
    endOfDay: 'The day is almost over — what about what’s still open?', moveAllTomorrow: 'Move all to tomorrow',
    backToToday: 'Back to today', call: 'Call', itemsLeft: { one: '1 item left', other: '{n} items left' },
    allBought: 'All bought ✓',
  },
  add: { what: 'What would you like to add?', task: 'Task', list: 'Shopping list', person: 'Birthday' },
  task: {
    new: 'New task', edit: 'Edit task', titlePh: 'What needs doing?', notesPh: 'More details',
    repeat: 'Repeat', repeatNone: 'Once', daily: 'Every day', weekly: 'Every week', monthly: 'Every month',
    priority: 'Priority', low: 'Low', normal: 'Normal', high: 'High', postpone: 'Move to tomorrow',
    reminderAt: 'Reminder at {time}', defaultReminder: 'Reminder at {time} (default)',
    open: 'Open', completed: 'Done', overdue: 'Overdue', upcoming: 'Later', noDate: 'No date',
    emptyOpen: 'No open tasks. Nice work!', emptyDone: 'No completed tasks yet',
    repeatsDaily: 'Repeats daily', repeatsWeekly: 'Repeats weekly', repeatsMonthly: 'Repeats monthly',
    monthlyNote: 'If the day doesn’t exist in a month (e.g. the 31st), the reminder falls on the last day.',
    titleRequired: 'Please enter a title',
  },
  person: {
    new: 'New birthday', edit: 'Edit birthday', name: 'Name', namePh: 'Whose birthday?',
    birthday: 'Birthday', day: 'Day', month: 'Month', year: 'Birth year', phone: 'Phone',
    notesPh: 'Gift ideas, things to remember…', remind: 'Reminders', onDay: 'On the day',
    dayBefore: 'A day before', feb29: 'In non-leap years, remind on:', feb28: 'February 28', mar1: 'March 1',
    inDays: { one: 'Tomorrow', other: 'In {n} days' }, isToday: 'Today! 🎉', turns: 'Turns {n}',
    empty: 'No birthdays yet. Add the people who matter to you.', nameRequired: 'Please enter a name',
    duplicate: 'A birthday with the same name and date already exists. Save anyway?',
  },
  list: {
    new: 'New list', edit: 'Edit list', titlePh: 'e.g. Weekly groceries', defaultTitle: 'Shopping',
    addItemPh: 'Add an item…', qtyPh: 'Qty', share: 'Share', duplicate: 'Duplicate', markDone: 'Mark as done',
    reopen: 'Reopen', moveLeft: 'Move what’s left…', moveTo: 'Move unbought items to:',
    general: 'General lists', dated: 'By date', doneLists: 'Done',
    empty: 'No shopping lists yet. Create one and attach it to a day.', emptyItems: 'The list is empty. Type an item and press Enter.',
    allBought: 'Everything’s bought! Mark the list as done?', bought: 'Bought',
    progress: '{done} of {total}', dupItem: '“{name}” is already on the list', copySuffix: '(copy)',
    shareHeader: '🛒 {title}', titleRequired: 'Please name the list', leftover: 'Items left from {date}',
  },
  settings: {
    title: 'Settings', language: 'Language', defaultTime: 'Default reminder time',
    defaultTimeHint: 'For tasks that have a date but no time', modules: 'Show', notifications: 'Notifications',
    notifOn: 'Notifications are on', notifOff: 'Notifications are blocked — reminders won’t appear', enable: 'Turn on notifications',
    openSettings: 'Open phone settings', hideContent: 'Hide reminder text on the lock screen',
    scheduled: '{n} reminders scheduled', backup: 'Backup', export: 'Export backup', import: 'Restore from backup',
    importPh: 'Paste the backup text here', importConfirm: 'Restoring replaces all current data. Continue?',
    importBad: 'This doesn’t look like a valid backup', importOk: 'Data restored',
    backupHint: 'The backup is shared as text (e.g. to yourself on WhatsApp or email). To restore, paste it back.',
    danger: 'Delete data', deleteAll: 'Delete all data', deleteAllBody: 'All tasks, birthdays and lists will be permanently deleted.',
    langChanged: 'Language changed', restartHint: 'If the layout direction didn’t update, close and reopen the app.',
    version: 'Version', webNote: 'Notifications don’t work in the browser preview — only on the phone.',
  },
  banner: {
    noPermission: 'Notifications are off, so reminders won’t pop up.', fix: 'Turn on',
    horizon: 'You have lots of reminders. Open the app now and then to keep them all active.',
  },
  onboarding: {
    chooseLang: 'Choose a language', welcomeTitle: 'Hi there! 👋',
    welcomeBody: 'Manage tasks, remember birthdays and keep shopping lists — with reminders right on time.',
    notifTitle: 'Reminders on time', notifBody: 'To remind you, the app needs permission to send notifications.',
    allow: 'Allow notifications', later: 'Later', start: 'Let’s go',
  },
  notif: {
    privateTitle: 'Reminder', privateBody: 'You have a new reminder', taskBody: 'Task reminder',
    snoozed: 'Snoozed reminder', bdayTodayTitle: '🎂 It’s {name}’s birthday today', bdayAge: 'Turning {n}! Don’t forget to say happy birthday',
    bdayBody: 'Don’t forget to say happy birthday!', bdayTomorrowTitle: '🎁 {name}’s birthday is tomorrow', bdayTomorrowBody: 'Time to think of a message or a gift',
    listTitle: '🛒 {title}', listBody: { one: '1 item on the list', other: '{n} items on the list' },
    actDone: '✓ Done', actSnooze: 'Remind me in 1 hour',
  },
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  dateFmt: '{weekday}, {month} {day}', dateShort: '{month} {day}', dateWithYear: '{month} {day}, {year}',
};

const ru = {
  appName: 'Poof Reminder',
  tabs: { today: 'Сегодня', tasks: 'Задачи', people: 'Дни рождения', shopping: 'Покупки', settings: 'Настройки' },
  common: {
    save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', edit: 'Изменить', done: 'Готово', close: 'Закрыть',
    today: 'Сегодня', tomorrow: 'Завтра', yesterday: 'Вчера', none: 'Нет', pickDate: 'Выбрать дату',
    pickTime: 'Выбрать время', noTime: 'Без времени', noDate: 'Без даты', confirmDelete: 'Удалить?',
    confirmDeleteBody: 'Это действие нельзя отменить.', yes: 'Да', no: 'Нет', ok: 'ОК', add: 'Добавить',
    optional: 'необязательно', notes: 'Заметки', title: 'Название', date: 'Дата', time: 'Время',
    hour: 'Часы', minute: 'Минуты', back: 'Назад',
  },
  greet: { morning: 'Доброе утро', noon: 'Добрый день', evening: 'Добрый вечер', night: 'Доброй ночи' },
  today: {
    tasks: 'Задачи', overdue: 'Остались с прошлых дней', birthdays: 'Дни рождения', upcoming: 'На этой неделе',
    shopping: 'Покупки', emptyTitle: 'Свободный день', emptyBody: 'Ничего не запланировано. Нажмите +, чтобы добавить.',
    endOfDay: 'День почти закончился — что делать с незавершённым?', moveAllTomorrow: 'Перенести всё на завтра',
    backToToday: 'К сегодняшнему дню', call: 'Позвонить',
    itemsLeft: { one: 'Остался {n} товар', few: 'Осталось {n} товара', many: 'Осталось {n} товаров', other: 'Осталось {n} товара' },
    allBought: 'Всё куплено ✓',
  },
  add: { what: 'Что добавить?', task: 'Задача', list: 'Список покупок', person: 'День рождения' },
  task: {
    new: 'Новая задача', edit: 'Изменить задачу', titlePh: 'Что нужно сделать?', notesPh: 'Подробности',
    repeat: 'Повтор', repeatNone: 'Один раз', daily: 'Каждый день', weekly: 'Каждую неделю', monthly: 'Каждый месяц',
    priority: 'Важность', low: 'Низкая', normal: 'Обычная', high: 'Высокая', postpone: 'Перенести на завтра',
    reminderAt: 'Напоминание в {time}', defaultReminder: 'Напоминание в {time} (по умолчанию)',
    open: 'Открытые', completed: 'Выполненные', overdue: 'Просрочено', upcoming: 'Позже', noDate: 'Без даты',
    emptyOpen: 'Открытых задач нет. Отлично!', emptyDone: 'Выполненных задач пока нет',
    repeatsDaily: 'Каждый день', repeatsWeekly: 'Каждую неделю', repeatsMonthly: 'Каждый месяц',
    monthlyNote: 'Если такого числа нет в месяце (например, 31-го), напоминание будет в последний день месяца.',
    titleRequired: 'Введите название',
  },
  person: {
    new: 'Новый день рождения', edit: 'Изменить день рождения', name: 'Имя', namePh: 'Чей день рождения?',
    birthday: 'Дата рождения', day: 'День', month: 'Месяц', year: 'Год рождения', phone: 'Телефон',
    notesPh: 'Идеи подарков, что не забыть…', remind: 'Напоминания', onDay: 'В сам день',
    dayBefore: 'За день', feb29: 'В невисокосный год напомнить:', feb28: '28 февраля', mar1: '1 марта',
    inDays: { one: 'Через {n} день', few: 'Через {n} дня', many: 'Через {n} дней', other: 'Через {n} дня' },
    isToday: 'Сегодня! 🎉', turns: 'Исполнится {n}',
    empty: 'Дней рождения пока нет. Добавьте важных для вас людей.', nameRequired: 'Введите имя',
    duplicate: 'День рождения с таким именем и датой уже есть. Всё равно сохранить?',
  },
  list: {
    new: 'Новый список', edit: 'Изменить список', titlePh: 'Например: продукты на неделю', defaultTitle: 'Покупки',
    addItemPh: 'Добавить товар…', qtyPh: 'Кол-во', share: 'Поделиться', duplicate: 'Копировать', markDone: 'Отметить выполненным',
    reopen: 'Открыть снова', moveLeft: 'Перенести некупленное…', moveTo: 'Перенести некупленное на:',
    general: 'Общие списки', dated: 'По датам', doneLists: 'Выполненные',
    empty: 'Списков покупок пока нет. Создайте список и привяжите его к дню.', emptyItems: 'Список пуст. Введите товар и нажмите Enter.',
    allBought: 'Всё куплено! Отметить список выполненным?', bought: 'Куплено',
    progress: '{done} из {total}', dupItem: '«{name}» уже есть в списке', copySuffix: '(копия)',
    shareHeader: '🛒 {title}', titleRequired: 'Назовите список', leftover: 'Остались товары с {date}',
  },
  settings: {
    title: 'Настройки', language: 'Язык', defaultTime: 'Время напоминания по умолчанию',
    defaultTimeHint: 'Для задач с датой, но без времени', modules: 'Показывать', notifications: 'Уведомления',
    notifOn: 'Уведомления включены', notifOff: 'Уведомления заблокированы — напоминания не появятся', enable: 'Включить уведомления',
    openSettings: 'Открыть настройки телефона', hideContent: 'Скрывать текст напоминания на экране блокировки',
    scheduled: 'Запланировано напоминаний: {n}', backup: 'Резервная копия', export: 'Экспорт копии', import: 'Восстановить из копии',
    importPh: 'Вставьте сюда текст резервной копии', importConfirm: 'Восстановление заменит все текущие данные. Продолжить?',
    importBad: 'Это не похоже на корректную резервную копию', importOk: 'Данные восстановлены',
    backupHint: 'Копия отправляется как текст (например, себе в WhatsApp или на почту). Для восстановления вставьте её обратно.',
    danger: 'Удаление данных', deleteAll: 'Удалить все данные', deleteAllBody: 'Все задачи, дни рождения и списки будут удалены навсегда.',
    langChanged: 'Язык изменён', restartHint: 'Если направление экрана не обновилось, закройте и снова откройте приложение.',
    version: 'Версия', webNote: 'В браузере уведомления не работают — только на телефоне.',
  },
  banner: {
    noPermission: 'Уведомления выключены, напоминания не появятся.', fix: 'Включить',
    horizon: 'Напоминаний много. Иногда открывайте приложение, чтобы все они оставались активными.',
  },
  onboarding: {
    chooseLang: 'Выберите язык', welcomeTitle: 'Привет! 👋',
    welcomeBody: 'Управляйте задачами, помните о днях рождения и ведите списки покупок — с напоминаниями вовремя.',
    notifTitle: 'Напоминания вовремя', notifBody: 'Чтобы напоминать вам, приложению нужно разрешение на уведомления.',
    allow: 'Разрешить уведомления', later: 'Позже', start: 'Начать',
  },
  notif: {
    privateTitle: 'Напоминание', privateBody: 'У вас новое напоминание', taskBody: 'Напоминание о задаче',
    snoozed: 'Повторное напоминание', bdayTodayTitle: '🎂 Сегодня день рождения: {name}', bdayAge: 'Исполняется {n}! Не забудьте поздравить',
    bdayBody: 'Не забудьте поздравить!', bdayTomorrowTitle: '🎁 Завтра день рождения: {name}', bdayTomorrowBody: 'Самое время подумать о поздравлении или подарке',
    listTitle: '🛒 {title}',
    listBody: { one: '{n} товар в списке', few: '{n} товара в списке', many: '{n} товаров в списке', other: '{n} товара в списке' },
    actDone: '✓ Готово', actSnooze: 'Напомнить через час',
  },
  weekdays: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  weekdaysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  monthsStandalone: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  dateFmt: '{weekday}, {day} {month}', dateShort: '{day} {month}', dateWithYear: '{day} {month} {year}',
};

// ---------- v1.1 additions ----------
const EXTRA = {
  he: {
    tabs: { calendar: 'יומן' },
    calendar: { empty: 'אין כלום ביום הזה', add: 'הוספה ליום הזה', today: 'היום', holiday: 'חג', week: 'שבוע' },
    hero: {
      tasksLeft: { one: 'נשארה משימה אחת', other: 'נשארו {n} משימות' }, allDone: 'כל המשימות של היום בוצעו',
      free: 'אין משימות להיום', bday: 'יום ההולדת של {name}', lists: { one: 'רשימת קניות אחת', other: '{n} רשימות קניות' },
      done: '{done}/{total}',
    },
    settings: {
      theme: 'מראה', themeAuto: 'לפי הטלפון', themeLight: 'בהיר', themeDark: 'כהה',
      hebrewDate: 'תאריך עברי וחגים', hebrewDateHint: 'מוצג במסך הבית וביומן',
    },
    a11y: { birthdays: 'ימי הולדת', settings: 'הגדרות', prevMonth: 'החודש הקודם', nextMonth: 'החודש הבא' },
  },
  en: {
    tabs: { calendar: 'Calendar' },
    calendar: { empty: 'Nothing on this day', add: 'Add to this day', today: 'Today', holiday: 'Holiday', week: 'Week' },
    hero: {
      tasksLeft: { one: '1 task left', other: '{n} tasks left' }, allDone: 'All of today’s tasks are done',
      free: 'No tasks today', bday: '{name}’s birthday', lists: { one: '1 shopping list', other: '{n} shopping lists' },
      done: '{done}/{total}',
    },
    settings: {
      theme: 'Appearance', themeAuto: 'Match phone', themeLight: 'Light', themeDark: 'Dark',
      hebrewDate: 'Hebrew date & holidays', hebrewDateHint: 'Shown on the home screen and in the calendar',
    },
    a11y: { birthdays: 'Birthdays', settings: 'Settings', prevMonth: 'Previous month', nextMonth: 'Next month' },
  },
  ru: {
    tabs: { calendar: 'Календарь' },
    calendar: { empty: 'В этот день ничего нет', add: 'Добавить на этот день', today: 'Сегодня', holiday: 'Праздник', week: 'Неделя' },
    hero: {
      tasksLeft: { one: 'Осталась {n} задача', few: 'Осталось {n} задачи', many: 'Осталось {n} задач', other: 'Осталось {n} задачи' },
      allDone: 'Все задачи на сегодня выполнены', free: 'На сегодня задач нет', bday: 'День рождения: {name}',
      lists: { one: '{n} список покупок', few: '{n} списка покупок', many: '{n} списков покупок', other: '{n} списка покупок' },
      done: '{done}/{total}',
    },
    settings: {
      theme: 'Оформление', themeAuto: 'Как в телефоне', themeLight: 'Светлое', themeDark: 'Тёмное',
      hebrewDate: 'Еврейская дата и праздники', hebrewDateHint: 'Показывается на главном экране и в календаре',
    },
    a11y: { birthdays: 'Дни рождения', settings: 'Настройки', prevMonth: 'Предыдущий месяц', nextMonth: 'Следующий месяц' },
  },
};
function merge(a, b) {
  for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !('other' in b[k])) merge(a[k], b[k]);
    else a[k] = b[k];
  }
}
merge(he, EXTRA.he); merge(en, EXTRA.en); merge(ru, EXTRA.ru);

// ---------- v1.2 additions ----------
const EXTRA2 = {
  he: {
    quick: { ph: 'מה צריך לזכור? למשל: מחר ב־8 להתקשר לאמא', added: 'נוספה משימה: {when}', noDate: 'בלי תאריך' },
    presets: { morning: 'בוקר', noon: 'צהריים', evening: 'ערב' },
    toast: { deleted: 'נמחק', undo: 'ביטול', done: 'בוצע' },
    reliable: {
      title: 'תזכורות אמינות', test: 'שליחת התראת בדיקה', testSent: 'התראת בדיקה תגיע בעוד 5 שניות',
      testTitle: '🔔 בדיקה', testBody: 'מעולה! התזכורות עובדות',
      battery: 'בחלק מהטלפונים (שיאומי, סמסונג ועוד) חיסכון בסוללה מעכב תזכורות. בהגדרות האפליקציה ← סוללה, בחרו ״ללא הגבלה״.',
      openApp: 'פתיחת הגדרות האפליקציה',
    },
    notif: { actTomorrow: 'מחר', bdayWeekTitle: '📅 בעוד שבוע יום ההולדת של {name}', bdayWeekBody: 'יש זמן לתכנן מתנה' },
    person: {
      hebrew: 'לפי התאריך העברי', hebrewHint: 'התזכורת תגיע כל שנה בתאריך העברי', hebrewNeedsYear: 'כדי להזכיר לפי התאריך העברי צריך שנת לידה',
      hebrewBorn: 'תאריך לידה עברי: {date}', weekBefore: 'שבוע לפני', hebTag: 'עברי',
    },
    list: { pasteHint: 'אפשר להדביק כמה פריטים בבת אחת, כל אחד בשורה או מופרדים בפסיק' },
  },
  en: {
    quick: { ph: 'What to remember? e.g. call mom tomorrow at 8', added: 'Task added: {when}', noDate: 'no date' },
    presets: { morning: 'Morning', noon: 'Noon', evening: 'Evening' },
    toast: { deleted: 'Deleted', undo: 'Undo', done: 'Done' },
    reliable: {
      title: 'Reliable reminders', test: 'Send a test notification', testSent: 'A test notification will arrive in 5 seconds',
      testTitle: '🔔 Test', testBody: 'Great! Reminders are working',
      battery: 'On some phones (Xiaomi, Samsung and others) battery saving delays reminders. In app settings → Battery, choose “Unrestricted”.',
      openApp: 'Open app settings',
    },
    notif: { actTomorrow: 'Tomorrow', bdayWeekTitle: '📅 {name}’s birthday is in a week', bdayWeekBody: 'There’s time to plan a gift' },
    person: {
      hebrew: 'By Hebrew date', hebrewHint: 'The reminder comes each year on the Hebrew date', hebrewNeedsYear: 'A birth year is needed for Hebrew-date reminders',
      hebrewBorn: 'Hebrew birth date: {date}', weekBefore: 'A week before', hebTag: 'Hebrew',
    },
    list: { pasteHint: 'You can paste several items at once — one per line or separated by commas' },
  },
  ru: {
    quick: { ph: 'Что не забыть? Например: завтра в 8 позвонить маме', added: 'Задача добавлена: {when}', noDate: 'без даты' },
    presets: { morning: 'Утро', noon: 'День', evening: 'Вечер' },
    toast: { deleted: 'Удалено', undo: 'Отменить', done: 'Готово' },
    reliable: {
      title: 'Надёжные напоминания', test: 'Отправить тестовое уведомление', testSent: 'Тестовое уведомление придёт через 5 секунд',
      testTitle: '🔔 Проверка', testBody: 'Отлично! Напоминания работают',
      battery: 'На некоторых телефонах (Xiaomi, Samsung и др.) экономия батареи задерживает напоминания. В настройках приложения → Батарея выберите «Без ограничений».',
      openApp: 'Открыть настройки приложения',
    },
    notif: { actTomorrow: 'Завтра', bdayWeekTitle: '📅 Через неделю день рождения: {name}', bdayWeekBody: 'Есть время выбрать подарок' },
    person: {
      hebrew: 'По еврейскому календарю', hebrewHint: 'Напоминание будет каждый год по еврейской дате', hebrewNeedsYear: 'Для еврейской даты нужен год рождения',
      hebrewBorn: 'Еврейская дата рождения: {date}', weekBefore: 'За неделю', hebTag: 'евр.',
    },
    list: { pasteHint: 'Можно вставить сразу несколько товаров — каждый с новой строки или через запятую' },
  },
};
merge(he, EXTRA2.he); merge(en, EXTRA2.en); merge(ru, EXTRA2.ru);

// ---------- v1.3 additions ----------
const EXTRA3 = {
  he: {
    sub: { title: 'שלבים', ph: 'הוספת שלב…', add: 'הוספת שלבים' },
    dept: { title: 'מחלקה', sortBtn: 'סידור לפי מחלקות', sorted: 'הרשימה סודרה לפי מחלקות' },
  },
  en: {
    sub: { title: 'Steps', ph: 'Add a step…', add: 'Add steps' },
    dept: { title: 'Department', sortBtn: 'Sort by aisle', sorted: 'List sorted by aisle' },
  },
  ru: {
    sub: { title: 'Шаги', ph: 'Добавить шаг…', add: 'Добавить шаги' },
    dept: { title: 'Отдел', sortBtn: 'По отделам', sorted: 'Список отсортирован по отделам' },
  },
};
merge(he, EXTRA3.he); merge(en, EXTRA3.en); merge(ru, EXTRA3.ru);

// ---------- v1.5 additions ----------
const EXTRA4 = {
  he: {
    tabs: { notes: 'פתקים' },
    add: { note: 'פתק' },
    notes: {
      ph: 'כתבו כאן…\nהשורה הראשונה היא הכותרת', untitled: 'פתק ללא כותרת', search: 'חיפוש בפתקים', pinned: 'מוצמדים', others: 'כל השאר',
      emptyTitle: 'אין פתקים עדיין', empty: 'מקום לכתוב חופשי — רעיונות, מספרים, מתכונים. לחצו + כדי להתחיל.', noResults: 'לא נמצא', pin: 'הצמדה',
    },
    task: { padPh: 'מה צריך לעשות?\nאפשר לכתוב כמה שורות…', padHint: 'השורה הראשונה היא שם המשימה, ומה שמתחת נשמר כטקסט חופשי' },
    list: {
      modeWrite: '✎ כתיבה', modeCheck: '✓ רשימה', writePh: 'כתבו פריט בכל שורה…\nחלב\nלחם\nביצים', noReminder: 'בלי תזכורת',
      remindMe: 'להזכיר לי', justList: 'רשימה סתם — בלי התראה', boughtHidden: { one: 'פריט אחד שנקנה מוסתר בכתיבה', other: '{n} פריטים שנקנו מוסתרים בכתיבה' },
    },
    dept: { sortBtn: 'סדר לפי סוג' },
    sound: {
      title: 'צליל התראה', default: 'צליל הטלפון', chime: 'צלצול', bell: 'פעמון', soft: 'עדין', digital: 'דיגיטלי', silent: 'שקט (רטט בלבד)',
      preview: 'ככה זה נשמע — התראה לדוגמה תגיע עוד רגע', hint: 'לחיצה על צליל משמיעה אותו',
    },
  },
  en: {
    tabs: { notes: 'Notes' },
    add: { note: 'Note' },
    notes: {
      ph: 'Write here…\nThe first line is the title', untitled: 'Untitled note', search: 'Search notes', pinned: 'Pinned', others: 'Others',
      emptyTitle: 'No notes yet', empty: 'A place to write freely — ideas, numbers, recipes. Tap + to start.', noResults: 'Nothing found', pin: 'Pin',
    },
    task: { padPh: 'What needs doing?\nYou can write several lines…', padHint: 'The first line is the task name; anything below is kept as free text' },
    list: {
      modeWrite: '✎ Write', modeCheck: '✓ List', writePh: 'One item per line…\nMilk\nBread\nEggs', noReminder: 'No reminder',
      remindMe: 'Remind me', justList: 'Just a list — no notification', boughtHidden: { one: '1 bought item hidden while writing', other: '{n} bought items hidden while writing' },
    },
    dept: { sortBtn: 'Sort by type' },
    sound: {
      title: 'Notification sound', default: 'Phone default', chime: 'Chime', bell: 'Bell', soft: 'Soft', digital: 'Digital', silent: 'Silent (vibrate only)',
      preview: 'This is how it sounds — a sample notification is on its way', hint: 'Tap a sound to hear it',
    },
  },
  ru: {
    tabs: { notes: 'Заметки' },
    add: { note: 'Заметка' },
    notes: {
      ph: 'Пишите здесь…\nПервая строка — заголовок', untitled: 'Без названия', search: 'Поиск в заметках', pinned: 'Закреплённые', others: 'Остальные',
      emptyTitle: 'Заметок пока нет', empty: 'Место для свободных записей — идеи, номера, рецепты. Нажмите +, чтобы начать.', noResults: 'Ничего не найдено', pin: 'Закрепить',
    },
    task: { padPh: 'Что нужно сделать?\nМожно написать несколько строк…', padHint: 'Первая строка — название задачи, остальное сохраняется как текст' },
    list: {
      modeWrite: '✎ Писать', modeCheck: '✓ Список', writePh: 'Каждый товар с новой строки…\nМолоко\nХлеб\nЯйца', noReminder: 'Без напоминания',
      remindMe: 'Напомнить мне', justList: 'Просто список — без уведомления',
      boughtHidden: { one: '{n} купленный товар скрыт', few: '{n} купленных товара скрыто', many: '{n} купленных товаров скрыто', other: '{n} купленных товара скрыто' },
    },
    dept: { sortBtn: 'По типу' },
    sound: {
      title: 'Звук уведомления', default: 'Как в телефоне', chime: 'Перезвон', bell: 'Колокольчик', soft: 'Мягкий', digital: 'Цифровой', silent: 'Без звука (вибрация)',
      preview: 'Так это звучит — сейчас придёт пример', hint: 'Нажмите на звук, чтобы его услышать',
    },
  },
};
merge(he, EXTRA4.he); merge(en, EXTRA4.en); merge(ru, EXTRA4.ru);

export const STRINGS = { he, en, ru };
export const LANGS = [
  { code: 'he', label: 'עברית', rtl: true },
  { code: 'en', label: 'English', rtl: false },
  { code: 'ru', label: 'Русский', rtl: false },
];
