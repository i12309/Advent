/**
 * The calendar's only event registry. Dates are annual civil dates in `timeZone`.
 * To add an occasion, add an entry here and register its artwork in artwork.js.
 * Higher priority selects the main postcard when several occasions share a day;
 * every occasion is still returned by the calendar engine.
 */
export const DEFAULT_TIME_ZONE = 'Europe/Moscow';

export const EVENTS = Object.freeze([
  {
    id: 'new-year', month: 1, day: 1, title: 'Новый год', until: 'Нового года',
    greeting: 'С Новым годом!', eyebrow: 'Время загадывать',
    description: 'Тихо падает снег, в окнах горит свет, и впереди — целый год чудес.',
    category: 'holiday', priority: 90, theme: 'new-year', accent: '#d9b774', icon: 'sparkles',
  },
  {
    id: 'defender', month: 2, day: 23, title: '23 февраля', until: '23 февраля',
    greeting: 'С Днём защитника Отечества!', eyebrow: 'Тепло надёжного плеча',
    description: 'Пусть рядом всегда будет тот, с кем спокойно встречать любой рассвет.',
    category: 'holiday', priority: 60, theme: 'defender', accent: '#bdc599', icon: 'compass',
  },
  {
    id: 'spring', month: 3, day: 1, title: 'Первый день весны', until: 'начала весны',
    greeting: 'Здравствуй, весна!', eyebrow: 'Первое дыхание тепла',
    description: 'Снег отступает, ручьи просыпаются, и мир снова учится цвести.',
    category: 'season', priority: 20, theme: 'spring', accent: '#d6b4bc', icon: 'sprout',
  },
  {
    id: 'womens-day', month: 3, day: 8, title: '8 Марта', until: '8 Марта',
    greeting: 'С 8 Марта!', eyebrow: 'Нежность в каждом лепестке',
    description: 'Цветы раскрываются навстречу свету, а самые важные слова звучат просто.',
    category: 'holiday', priority: 60, theme: 'womens-day', accent: '#e4b8c6', icon: 'flower',
  },
  {
    id: 'may-day', month: 5, day: 1, title: 'Праздник Весны и Труда', until: '1 мая',
    greeting: 'С первым мая!', eyebrow: 'Планы на длинный день',
    description: 'Свежая зелень, открытое окно и прекрасное чувство, что всё ещё впереди.',
    category: 'holiday', priority: 60, theme: 'may-day', accent: '#c3d5a5', icon: 'sun',
  },
  {
    id: 'victory', month: 5, day: 9, title: 'День Победы', until: 'Дня Победы',
    greeting: 'С Днём Победы!', eyebrow: 'Помним. Благодарим.',
    description: 'Тихий огонь памяти и мирное небо — то, что мы бережно передаём дальше.',
    category: 'holiday', priority: 80, theme: 'victory', accent: '#d7ad77', icon: 'flame',
  },
  {
    id: 'summer', month: 6, day: 1, title: 'Первый день лета', until: 'начала лета',
    greeting: 'Здравствуй, лето!', eyebrow: 'Счастье длинных вечеров',
    description: 'Тёплый ветер, светлячки у воды и вечера, которым совсем не хочется кончаться.',
    category: 'season', priority: 20, theme: 'summer', accent: '#d3c68a', icon: 'sun',
  },
  {
    id: 'russia', month: 6, day: 12, title: 'День России', until: 'Дня России',
    greeting: 'С Днём России!', eyebrow: 'Простор, который зовёшь домом',
    description: 'Над берёзами плывут облака, и знакомая река уходит далеко за горизонт.',
    category: 'holiday', priority: 60, theme: 'russia', accent: '#b7c8d9', icon: 'landscape',
  },
  {
    id: 'autumn', month: 9, day: 1, title: 'Первый день осени', until: 'начала осени',
    greeting: 'Здравствуй, осень!', eyebrow: 'Время собирать тёплые моменты',
    description: 'Листья становятся золотыми, чай — горячее, а вечера — чуть уютнее.',
    category: 'season', priority: 20, theme: 'autumn', accent: '#d6a16d', icon: 'leaf',
  },
  {
    id: 'knowledge', month: 9, day: 1, title: 'День знаний', until: 'Дня знаний',
    greeting: 'С Днём знаний!', eyebrow: 'Новая глава начинается',
    description: 'Чистая страница, первые золотые листья и тысячи будущих открытий.',
    category: 'holiday', priority: 70, theme: 'knowledge', accent: '#d1ac76', icon: 'book',
  },
  {
    id: 'unity', month: 11, day: 4, title: 'День народного единства', until: 'Дня народного единства',
    greeting: 'С Днём народного единства!', eyebrow: 'Вместе светлее',
    description: 'Один огонёк за другим загорается в окнах, соединяя большой город теплом.',
    category: 'holiday', priority: 60, theme: 'unity', accent: '#d9b98b', icon: 'lantern',
  },
  {
    id: 'winter', month: 12, day: 1, title: 'Первый день зимы', until: 'начала зимы',
    greeting: 'Здравствуй, зима!', eyebrow: 'В ожидании первого снега',
    description: 'Мир укрывается тишиной, в доме пахнет хвоей, и чудеса становятся ближе.',
    category: 'season', priority: 20, theme: 'winter', accent: '#c8d8e1', icon: 'snowflake',
  },
  {
    id: 'birthday', month: 12, day: 26, title: 'День рождения автора', until: 'дня рождения автора',
    greeting: 'С днём рождения, автор!', eyebrow: 'Особенный день этой истории',
    description: 'Сегодня все тёплые огни, добрые слова и маленькие чудеса — для тебя.',
    category: 'personal', priority: 100, theme: 'birthday', accent: '#e2b990', icon: 'gift',
  },
].map(event => Object.freeze(event)));
