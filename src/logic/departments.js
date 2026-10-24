// Supermarket departments, in the order you usually walk through an Israeli supermarket.
// Classification is by keyword (Hebrew, English, Russian); the longest matching keyword wins,
// and anything the user re-assigns by hand is remembered for next time.

export const DEPARTMENTS = [
  { key: 'produce', icon: 'leaf', he: 'ירקות ופירות', en: 'Fruit & veg', ru: 'Овощи и фрукты' },
  { key: 'bakery', icon: 'restaurant', he: 'לחם ומאפים', en: 'Bakery', ru: 'Хлеб и выпечка' },
  { key: 'dairy', icon: 'egg', he: 'חלב וביצים', en: 'Dairy & eggs', ru: 'Молочное и яйца' },
  { key: 'meat', icon: 'fish', he: 'בשר ודגים', en: 'Meat & fish', ru: 'Мясо и рыба' },
  { key: 'frozen', icon: 'snow', he: 'קפואים', en: 'Frozen', ru: 'Заморозка' },
  { key: 'pantry', icon: 'file-tray-stacked', he: 'מזווה ויבשים', en: 'Pantry', ru: 'Бакалея' },
  { key: 'snacks', icon: 'ice-cream', he: 'חטיפים ומתוקים', en: 'Snacks & sweets', ru: 'Сладости и снеки' },
  { key: 'drinks', icon: 'wine', he: 'שתייה', en: 'Drinks', ru: 'Напитки' },
  { key: 'cleaning', icon: 'sparkles', he: 'ניקיון ובית', en: 'Cleaning & home', ru: 'Бытовая химия' },
  { key: 'personal', icon: 'medkit', he: 'טיפוח ופארם', en: 'Personal care', ru: 'Гигиена и аптека' },
  { key: 'baby', icon: 'happy', he: 'תינוקות', en: 'Baby', ru: 'Детское' },
  { key: 'pets', icon: 'paw', he: 'חיות מחמד', en: 'Pets', ru: 'Для животных' },
  { key: 'other', icon: 'pricetag', he: 'אחר', en: 'Other', ru: 'Другое' },
];

const W = {
  produce: [
    'עגבני', 'מלפפון', 'גזר', 'בצל', 'שום', 'תפוח אדמה', 'תפוחי אדמה', 'בטטה', 'פלפל', 'חסה', 'כרוב', 'ברוקולי', 'כרובית', 'קישוא',
    'חציל', 'פטרוזיליה', 'כוסברה', 'שמיר', 'נענע', 'סלרי', 'תרד', 'פטריות', 'פטריה', 'דלעת', 'סלק', 'צנון', 'תירס', 'אבוקדו', 'לימון',
    'תפוח', 'תפוזים', 'תפוז', 'בננה', 'בננות', 'ענבים', 'אבטיח', 'מלון', 'תות', 'אגס', 'אפרסק', 'שזיף', 'קלמנטינה', 'מנגו', 'אננס',
    'קיווי', 'רימון', 'אשכולית', 'דובדבן', 'פירות', 'ירקות', 'ג\'ינג\'ר', 'זנגביל', 'בצל ירוק',
    'tomato', 'cucumber', 'carrot', 'onion', 'garlic', 'potato', 'pepper', 'lettuce', 'cabbage', 'broccoli', 'cauliflower',
    'zucchini', 'eggplant', 'parsley', 'cilantro', 'dill', 'mint', 'celery', 'spinach', 'mushroom', 'avocado', 'lemon', 'lime',
    'apple', 'orange', 'banana', 'grape', 'watermelon', 'melon', 'strawberr', 'pear', 'peach', 'plum', 'mango', 'pineapple',
    'kiwi', 'fruit', 'vegetable', 'veggies', 'ginger', 'sweet potato', 'corn', 'beet',
    'помидор', 'огур', 'морков', 'лук', 'чеснок', 'картоф', 'перец', 'салат', 'капуст', 'брокколи', 'кабач', 'баклажан',
    'петрушк', 'укроп', 'кинз', 'мят', 'сельдер', 'шпинат', 'гриб', 'авокадо', 'лимон', 'яблок', 'апельсин', 'банан',
    'виноград', 'арбуз', 'дын', 'клубник', 'груш', 'персик', 'слив', 'манго', 'ананас', 'киви', 'фрукт', 'овощ', 'имбир', 'свекл',
  ],
  bakery: [
    'לחם', 'לחמניות', 'לחמניה', 'פיתות', 'פיתה', 'חלה', 'חלות', 'באגט', 'בייגל', 'קרואסון', 'מאפה', 'מאפים', 'עוגה', 'טורטיה', 'לאפה',
    'bread', 'bun', 'roll', 'pita', 'challah', 'baguette', 'bagel', 'croissant', 'cake', 'tortilla', 'muffin',
    'хлеб', 'батон', 'булк', 'лаваш', 'пита', 'багет', 'круассан', 'торт', 'пирог', 'бублик', 'лепёшк', 'лепешк',
  ],
  dairy: [
    'חלב', 'גבינה', 'גבינת', 'קוטג', 'יוגורט', 'שמנת', 'חמאה', 'ביצים', 'ביצה', 'לבנה', 'בולגרית', 'צפתית', 'מעדן', 'מילקי', 'דנונה', 'אשל', 'שוקו',
    'milk', 'cheese', 'cottage', 'yogurt', 'yoghurt', 'cream', 'butter', 'egg', 'labneh',
    'молок', 'сыр', 'творог', 'йогурт', 'сметан', 'сливк', 'масло сливочное', 'яйц', 'кефир', 'ряженк',
  ],
  meat: [
    'עוף', 'חזה', 'שניצל', 'פרגית', 'כרעיים', 'בשר', 'טחון', 'סטייק', 'אנטריקוט', 'קבב', 'נקניק', 'נקניקיות', 'הודו', 'דג', 'דגים', 'סלמון', 'טונה טרייה', 'אמנון', 'פילה',
    'chicken', 'beef', 'meat', 'steak', 'mince', 'ground', 'sausage', 'turkey', 'fish', 'salmon', 'fillet', 'lamb', 'pork',
    'куриц', 'курин', 'мясо', 'фарш', 'стейк', 'колбас', 'сосиск', 'индейк', 'рыб', 'лосос', 'филе', 'говядин', 'свинин', 'баранин',
  ],
  frozen: [
    'קפוא', 'קפואים', 'גלידה', 'שלגון', 'בורקס', 'ג\'חנון', 'מלוואח', 'אפונה', 'שעועית ירוקה', 'פיצה קפואה',
    'frozen', 'ice cream', 'peas', 'popsicle',
    'заморож', 'морожен', 'пельмен', 'вареник',
  ],
  pantry: [
    'אורז', 'פסטה', 'ספגטי', 'קמח', 'סוכר', 'מלח', 'שמן', 'קטשופ', 'מיונז', 'חרדל', 'טחינה', 'חומוס', 'עדשים', 'שעועית', 'קוסקוס', 'בורגול', 'פתיתים',
    'שימורים', 'טונה', 'רסק', 'רוטב', 'תבלין', 'פפריקה', 'כמון', 'פלפל שחור', 'קינמון', 'אבקת', 'שמרים', 'דבש', 'ריבה', 'ממרח', 'קורנפלקס', 'דגני', 'שיבולת', 'קפה',
    'תה', 'קקאו', 'אגוזים', 'שקדים', 'צימוקים', 'חומץ', 'מרק', 'אבקת מרק', 'זיתים', 'חמוצים', 'פירורי לחם',
    'rice', 'pasta', 'spaghetti', 'flour', 'sugar', 'salt', 'oil', 'ketchup', 'mayo', 'mustard', 'tahini', 'hummus', 'lentil', 'bean',
    'couscous', 'canned', 'tuna', 'sauce', 'spice', 'paprika', 'cumin', 'cinnamon', 'yeast', 'honey', 'jam', 'cereal', 'oats', 'coffee',
    'tea', 'cocoa', 'nuts', 'almond', 'vinegar', 'soup', 'olive', 'pickle', 'cornflakes',
    'рис', 'макарон', 'спагетти', 'мук', 'сахар', 'соль', 'масло', 'кетчуп', 'майонез', 'горчиц', 'хумус', 'чечевиц', 'фасол',
    'кускус', 'гречк', 'консерв', 'тунец', 'соус', 'специ', 'паприк', 'корица', 'дрожж', 'мёд', 'мед', 'варенье', 'хлопья', 'овсян',
    'кофе', 'чай', 'какао', 'орех', 'миндал', 'уксус', 'суп', 'оливк', 'маслин',
  ],
  snacks: [
    'במבה', 'ביסלי', 'צ\'יפס', 'חטיף', 'חטיפים', 'שוקולד', 'ממתק', 'סוכריות', 'עוגיות', 'וופל', 'חלבה', 'פופקורן', 'בייגלה', 'קרקר',
    'chips', 'snack', 'chocolate', 'candy', 'sweets', 'cookie', 'biscuit', 'wafer', 'popcorn', 'pretzel', 'cracker',
    'чипс', 'шоколад', 'конфет', 'печень', 'вафл', 'халв', 'попкорн', 'крекер', 'сладост',
  ],
  drinks: [
    'מים', 'סודה', 'קולה', 'מיץ', 'בירה', 'יין', 'משקה', 'פריגת', 'שתייה', 'ספרייט', 'פאנטה', 'נביעות',
    'water', 'soda', 'cola', 'juice', 'beer', 'wine', 'drink', 'sprite',
    'вода', 'газиров', 'кола', 'сок', 'пиво', 'вино', 'напит', 'лимонад',
  ],
  cleaning: [
    'אקונומיקה', 'סבון כלים', 'נוזל כלים', 'אבקת כביסה', 'מרכך כביסה', 'ג\'ל כביסה', 'נייר טואלט', 'מגבות נייר', 'מגבונים', 'שקיות זבל', 'ספוג',
    'סקוץ\'', 'מטהר', 'ניקוי', 'סנו', 'כלים חד', 'צלחות חד', 'נייר כסף', 'ניילון נצמד', 'נרות', 'סוללות', 'נורה',
    'bleach', 'detergent', 'dish soap', 'laundry', 'softener', 'toilet paper', 'paper towel', 'trash bag', 'sponge', 'cleaner',
    'foil', 'cling', 'batteries', 'bulb', 'napkin',
    'отбеливат', 'порошок', 'средство для', 'туалетн', 'бумажн', 'мусорн', 'губк', 'фольг', 'пленк', 'батарейк', 'лампочк', 'салфетк',
  ],
  personal: [
    'שמפו', 'מרכך שיער', 'סבון', 'משחת שיניים', 'מברשת שיניים', 'דאודורנט', 'קרם', 'תחבושות', 'טמפונים', 'סכין גילוח', 'קצף גילוח', 'אקמול',
    'נורופן', 'ויטמין', 'תרופה', 'פלסטר', 'צמר גפן', 'מקלוני אוזניים', 'קרם הגנה',
    'shampoo', 'conditioner', 'soap', 'toothpaste', 'toothbrush', 'deodorant', 'lotion', 'pads', 'tampon', 'razor', 'shaving',
    'paracetamol', 'ibuprofen', 'vitamin', 'medicine', 'plaster', 'band-aid', 'sunscreen',
    'шампун', 'бальзам', 'мыло', 'зубн', 'дезодорант', 'крем', 'прокладк', 'тампон', 'бритв', 'витамин', 'лекарств', 'пластыр',
  ],
  baby: [
    'חיתולים', 'מטרנה', 'סימילאק', 'מוצץ', 'בקבוק לתינוק', 'מגבונים לתינוק', 'דייסה',
    'diaper', 'nappies', 'formula', 'pacifier', 'baby',
    'подгузн', 'смесь детск', 'соск', 'детск',
  ],
  pets: [
    'אוכל לכלב', 'אוכל לחתול', 'חול לחתול', 'חטיף לכלב', 'dog food', 'cat food', 'cat litter', 'корм', 'наполнитель',
  ],
};

const norm = (s) => s.toLowerCase().replace(/[֑-ׇ]/g, '').replace(/[״"׳']/g, (c) => (c === '׳' || c === "'" ? "'" : '"')).trim();

const INDEX = [];
for (const [cat, words] of Object.entries(W)) for (const w of words) INDEX.push([norm(w), cat]);
INDEX.sort((a, b) => b[0].length - a[0].length); // longest first

export function classify(name, learned) {
  const n = norm(name);
  if (!n) return 'other';
  if (learned && learned[n]) return learned[n];
  const words = n.split(/\s+/);
  for (const [w, cat] of INDEX) {
    // very short keywords ("תה", "דג") must be a whole word, not part of another word
    if (w.length <= 2 ? words.includes(w) : n.includes(w)) return cat;
  }
  return 'other';
}

export function deptName(lang, key) {
  const d = DEPARTMENTS.find((x) => x.key === key) || DEPARTMENTS[DEPARTMENTS.length - 1];
  return d[lang] || d.en;
}

export const deptOrder = (key) => {
  const i = DEPARTMENTS.findIndex((x) => x.key === key);
  return i === -1 ? DEPARTMENTS.length : i;
};

export const normName = norm;
