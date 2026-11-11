import { EVENTS, DEFAULT_TIME_ZONE } from './events.js';
import {
  getCalendarState, getPreviewState, getCountdown, getAdventDays,
  formatEventDate, getZonedParts, dateKey, pluralRu, normalizeTimeZone,
} from './calendar.js';
import { buildArtwork, ART_PALETTES } from './artwork.js';
import { Atmosphere } from './atmosphere.js';
import { icon, hydrateIcons } from './icons.js';
import { getStory, getDailyGift } from './stories.js';

const $ = id => document.getElementById(id);
const PREFERENCES_KEY = 'advent:v1:preferences';
const DOORS_KEY = 'advent:v1:opened';
const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const celebrationHeadings = {
  'new-year': ['С новым', 'годом!'], defender: ['С праздником,', 'защитники.'],
  spring: ['Здравствуй,', 'весна!'], 'womens-day': ['С праздником,', 'дорогие!'],
  'may-day': ['Здравствуй,', 'первомай!'], victory: ['Помним.', 'Благодарим.'],
  summer: ['Здравствуй,', 'лето!'], russia: ['С Днём', 'России!'],
  autumn: ['Здравствуй,', 'осень!'], knowledge: ['С Днём', 'знаний!'],
  unity: ['Мы вместе.', 'Мы рядом.'], winter: ['Здравствуй,', 'зима!'],
  birthday: ['С днём', 'рождения!'],
};

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
  } catch { return fallback; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
const saved = readStorage(PREFERENCES_KEY, {});
const preferences = { timeZone: saved.timeZone === 'local' ? 'local' : DEFAULT_TIME_ZONE, paused: saved.paused === true };
let opened = readStorage(DOORS_KEY, {});
const previewOpened = new Set();
const thumbURLs = new Map();
const dialogReturnFocus = new WeakMap();
let preview = null;
let state;
let sceneSignature = '';
let doorSignature = '';
let timer;
let toastTimer;
let effectTimer;
let artTimer;
let galleryBuilt = false;

hydrateIcons();
const atmosphere = new Atmosphere($('atmosphere'));
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');

function syncMotion() {
  atmosphere.setPaused(preferences.paused);
  document.body.classList.toggle('motion-paused', preferences.paused);
  document.body.classList.toggle('motion-reduced', motionQuery.matches);
  document.body.classList.toggle('page-hidden', document.hidden);
  $('motion-toggle').checked = !preferences.paused;
  $('pause-motion').setAttribute('aria-pressed', String(preferences.paused));
  const label = preferences.paused ? 'Продолжить анимацию' : 'Приостановить анимацию';
  $('pause-motion').setAttribute('aria-label', label);
  $('pause-motion').title = label;
  $('pause-motion').innerHTML = icon(preferences.paused ? 'play' : 'pause');
  $('motion-system-note').hidden = !motionQuery.matches;
}
function toggleMotion() {
  preferences.paused = !preferences.paused;
  writeStorage(PREFERENCES_KEY, preferences);
  syncMotion();
}

function showToast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4200);
}

function getState() {
  const actualNow = new Date();
  if (!preview) return getCalendarState(actualNow, { timeZone: preferences.timeZone });
  const now = new Date(+preview.base.now + actualNow.getTime() - preview.startedAt);
  if (now >= preview.base.endsAt) {
    clearPreview();
    return getCalendarState(actualNow, { timeZone: preferences.timeZone });
  }
  const mode = now >= preview.base.startsAt ? 'celebration' : 'countdown';
  if (mode !== preview.mode) {
    preview.mode = mode;
    const url = new URL(location.href);
    url.searchParams.set('mode', mode);
    history.replaceState(null, '', url);
  }
  return { ...preview.base, now, mode, previewMode: mode, remainingMs: Math.max(0, preview.base.startsAt - now) };
}

function setPreview(eventId, mode = 'countdown', { updateURL = true } = {}) {
  if (!EVENTS.some(event => event.id === eventId)) return;
  preview = {
    id: eventId, mode, startedAt: Date.now(),
    base: getPreviewState(eventId, mode, new Date(), { timeZone: preferences.timeZone }),
  };
  sceneSignature = '';
  doorSignature = '';
  if (updateURL) {
    const url = new URL(location.href);
    url.searchParams.set('preview', eventId);
    url.searchParams.set('mode', mode);
    history.replaceState(null, '', url);
  }
  closeDialog($('gallery-dialog'));
  closeDialog($('advent-dialog'));
  closeDialog($('letter-dialog'));
  tick();
}

function clearPreview(updateURL = true) {
  preview = null;
  previewOpened.clear();
  sceneSignature = '';
  doorSignature = '';
  if (updateURL) {
    const url = new URL(location.href);
    url.searchParams.delete('preview');
    url.searchParams.delete('mode');
    history.replaceState(null, '', url);
  }
}

function returnToToday({ updateURL = true } = {}) {
  clearPreview(updateURL);
  tick();
}

function renderHeading(lines) {
  const heading = $('event-heading');
  const emphasis = document.createElement('em');
  emphasis.textContent = lines[1] || '';
  heading.replaceChildren(document.createTextNode(lines[0]), document.createElement('br'), emphasis);
  document.body.classList.toggle('long-heading', lines.join('').length > 27);
}

function renderArtwork(event, celebrating, instant) {
  clearTimeout(artTimer);
  const layer = $('art-layer');
  const apply = () => {
    layer.innerHTML = buildArtwork(event.theme || event.id, { celebration: celebrating });
    const svg = layer.querySelector('svg');
    if (svg) svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    layer.classList.remove('changing');
  };
  if (instant || motionQuery.matches || preferences.paused) apply();
  else {
    layer.classList.add('changing');
    artTimer = setTimeout(apply, 320);
  }
}

function renderScene(nextState, first = false) {
  const { event, mode } = nextState;
  const story = getStory(event.id);
  const celebrating = mode === 'celebration';
  const palette = ART_PALETTES[event.theme || event.id] || ART_PALETTES.winter;
  const root = document.documentElement;
  root.style.setProperty('--sky-top', palette.sky[0]);
  root.style.setProperty('--sky-bottom', palette.sky[1]);
  root.style.setProperty('--accent', palette.accent || event.accent);
  document.querySelector('meta[name="theme-color"]').content = palette.sky[0];
  document.body.dataset.theme = event.theme || event.id;
  document.body.classList.toggle('is-celebrating', celebrating);
  document.body.classList.toggle('is-preview', Boolean(preview));
  document.body.classList.remove('scene-awake', 'candles-out');
  clearTimeout(effectTimer);
  renderArtwork(event, celebrating, first);
  atmosphere.setTheme(event.theme || event.id, { celebration: celebrating });
  syncMotion();

  $('event-eyebrow').textContent = celebrating ? 'СЕГОДНЯ ТОТ САМЫЙ ДЕНЬ' : 'СЛЕДУЮЩАЯ ГЛАВА';
  $('event-date').textContent = formatEventDate(event);
  $('event-date').dateTime = `${nextState.year}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`;
  renderHeading(celebrating ? (celebrationHeadings[event.id] || [event.greeting, '']) : story.heading);
  $('event-description').textContent = celebrating ? event.description : story.description;
  const coinciding = nextState.events.filter(item => item.id !== event.id);
  $('coinciding-event').hidden = coinciding.length === 0;
  $('coinciding-event').textContent = coinciding.length ? `В этот же день — ${coinciding.map(item => item.title.toLocaleLowerCase('ru')).join(' и ')}` : '';
  $('countdown-area').hidden = celebrating;
  $('celebration-message').hidden = !celebrating;
  $('countdown-caption').textContent = `ДО ${event.until.toLocaleUpperCase('ru')} ОСТАЛОСЬ`;
  $('celebration-note').textContent = 'Праздничная открытка с вами весь день, до полуночи.';
  $('scene-action-label').textContent = story.action;
  $('scene-action').setAttribute('aria-label', story.action);
  $('stamp-icon').innerHTML = icon(event.icon);
  $('stamp-day').textContent = String(event.day).padStart(2, '0');
  $('stamp-month').textContent = months[event.month - 1].toLocaleUpperCase('ru');
  $('stamp-year').textContent = nextState.year;
  const index = EVENTS.findIndex(item => item.id === event.id) + 1;
  $('scene-chapter').textContent = `ОТКРЫТКА № ${String(index).padStart(2, '0')}`;
  $('scene-caption').textContent = story.caption;
  $('scene-index').innerHTML = `${String(index).padStart(2, '0')} <span>/ ${EVENTS.length}</span>`;
  $('preview-bar').hidden = !preview;
  for (const button of document.querySelectorAll('[data-preview-mode]')) {
    button.setAttribute('aria-pressed', String(button.dataset.previewMode === mode));
  }
  if (nextState.nextEvent) {
    $('next-event-title').textContent = nextState.nextEvent.title;
    $('next-event-date').textContent = formatEventDate(nextState.nextEvent.event);
    $('next-event-icon').innerHTML = icon(nextState.nextEvent.icon);
    $('next-event').setAttribute('aria-label', `Посмотреть следующую открытку: ${nextState.nextEvent.title}, ${formatEventDate(nextState.nextEvent.event)}`);
  }
  if (!first) {
    const copy = document.querySelector('.postcard-copy');
    copy.classList.remove('entering');
    // Force only the small text layer's transition to restart after changing chapters.
    void copy.offsetWidth;
    copy.classList.add('entering');
    $('event-announcement').textContent = `${preview ? 'Просмотр открытки. ' : ''}${celebrating ? event.greeting : `Отсчёт до ${event.until}`}`;
  }
  updateGallerySelection();
  doorSignature = '';
}

function renderCountdown(current) {
  const values = getCountdown(current.remainingMs);
  const forms = { days: ['день', 'дня', 'дней'], hours: ['час', 'часа', 'часов'], minutes: ['минута', 'минуты', 'минут'], seconds: ['секунда', 'секунды', 'секунд'] };
  for (const unit of ['days', 'hours', 'minutes', 'seconds']) {
    const element = $(`count-${unit}`);
    const value = String(values[unit]).padStart(2, '0');
    if (element.textContent !== value) {
      element.textContent = value;
      element.classList.remove('number-tick');
      void element.offsetWidth;
      element.classList.add('number-tick');
    }
    $(`label-${unit}`).textContent = pluralRu(values[unit], forms[unit]);
  }
  $('countdown').setAttribute('aria-label', `${values.days} ${pluralRu(values.days, forms.days)}, ${values.hours} ${pluralRu(values.hours, forms.hours)}, ${values.minutes} ${pluralRu(values.minutes, forms.minutes)}, ${values.seconds} ${pluralRu(values.seconds, forms.seconds)} до ${current.event.until}`);
  document.title = preview ? `Просмотр: ${current.event.title} · Advent`
    : current.mode === 'celebration' ? `${current.event.greeting} · Advent`
      : `${values.days ? `${values.days} ${pluralRu(values.days, forms.days)}` : `${values.hours} ${pluralRu(values.hours, forms.hours)}`} до ${current.event.until} · Advent`;
}

function doorKey(door) { return `${state.event.id}:${state.year}:${door.key}`; }
function isOpened(door) { return preview ? previewOpened.has(doorKey(door)) : opened[doorKey(door)] === true; }

function makeDoor(door) {
  const button = document.createElement('button');
  const wasOpened = isOpened(door);
  button.className = `advent-door${door.isToday ? ' is-today' : ''}${door.isFuture ? ' is-future' : ''}${wasOpened ? ' is-open' : ''}`;
  button.dataset.date = door.key;
  button.setAttribute('aria-disabled', String(door.isFuture));
  const dayLabel = `${door.day} ${months[door.month - 1]}`;
  button.setAttribute('aria-label', `${dayLabel}${door.isToday ? ', сегодня' : ''}: ${door.isFuture ? 'окошко ещё закрыто' : wasOpened ? 'прочитать сюрприз снова' : 'открыть сюрприз'}`);
  if (door.isToday) button.setAttribute('aria-current', 'date');
  button.title = door.isFuture ? `Откроется ${dayLabel}` : `Сюрприз на ${dayLabel}`;
  button.innerHTML = `<span class="door-symbol">${icon(door.isFuture ? 'lock' : wasOpened ? 'check' : 'sparkles')}</span><span class="door-number">${String(door.day).padStart(2, '0')}</span><span class="door-caption">${door.isToday ? 'сегодня' : months[door.month - 1]}</span>`;
  button.addEventListener('click', () => {
    if (door.isFuture) { showToast(`Это окошко откроется ${dayLabel}. У каждого сюрприза — своё время.`); return; }
    openDoor(door, button);
  });
  return button;
}

function renderDoors() {
  const days = getAdventDays(state, state.now, { count: 7 });
  $('advent-strip').replaceChildren(...days.map(makeDoor));
  // A short wait (e.g. March 1 → March 8) has fewer doors, and should fill the strip naturally.
  $('advent-strip').style.gridTemplateColumns = `repeat(${Math.max(1, days.length)}, minmax(0, 1fr))`;
  if ($('advent-dialog').open) renderAdventGrid();
}

function renderAdventGrid() {
  const days = getAdventDays(state, state.now, { count: 24 });
  $('advent-grid').replaceChildren(...days.map(makeDoor));
  $('advent-description').textContent = `${preview ? 'Это окошки демонстрационной открытки. ' : ''}По маленькой радости на каждый день до ${state.event.until}. Будущие окошки откроются в свою дату.`;
}

function openDoor(door, origin = document.activeElement) {
  // Re-check against the current clock: a stored button may outlive a midnight rollover.
  const valid = getAdventDays(state, state.now, { count: 24 }).find(item => item.key === door.key);
  if (!valid?.available || valid.isFuture) return;
  const returnFocus = captureReturnFocus(origin);
  if (preview) previewOpened.add(doorKey(door));
  else {
    opened[doorKey(door)] = true;
    const keys = Object.keys(opened);
    if (keys.length > 400) opened = Object.fromEntries(keys.slice(-400).map(key => [key, true]));
    if (!writeStorage(DOORS_KEY, opened)) showToast('Окошко открыто. В этом режиме браузер не сохраняет его после закрытия страницы.');
  }
  const gift = getDailyGift(state.event.id, door.key);
  $('letter-icon').innerHTML = icon(state.event.icon);
  $('letter-date').textContent = `${door.day} ${months[door.month - 1]} · ${preview ? 'ПРОСМОТР ОТКРЫТКИ' : 'ВАШ МАЛЕНЬКИЙ СЮРПРИЗ'}`;
  $('letter-title').textContent = gift.title;
  $('letter-text').textContent = gift.text;
  renderDoors();
  openDialog($('letter-dialog'), returnFocus);
}

function captureReturnFocus(element = document.activeElement) {
  const door = element?.closest?.('.advent-door');
  const container = door?.closest('#advent-grid, #advent-strip');
  return { element, containerId: container?.id, doorKey: door?.dataset.date };
}

function resolveReturnFocus(savedFocus) {
  if (!savedFocus) return null;
  const container = savedFocus.containerId ? $(savedFocus.containerId) : null;
  const replacement = container && [...container.querySelectorAll('.advent-door')]
    .find(button => button.dataset.date === savedFocus.doorKey);
  const element = replacement || savedFocus.element;
  if (!element?.isConnected || element === document.body) return null;
  const owner = element.closest?.('dialog');
  return owner && !owner.open ? null : element;
}

function openDialog(dialog, returnFocus = captureReturnFocus()) {
  if (dialog.open) return;
  dialogReturnFocus.set(dialog, returnFocus);
  dialog.showModal();
}
function closeDialog(dialog) { if (dialog.open) dialog.close(); }

function buildGallery() {
  if (galleryBuilt) { updateGallerySelection(); return; }
  const fragment = document.createDocumentFragment();
  for (const event of EVENTS) {
    const palette = ART_PALETTES[event.theme || event.id] || ART_PALETTES.winter;
    const svg = buildArtwork(event.theme || event.id);
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    thumbURLs.set(event.id, url);
    const button = document.createElement('button');
    button.className = 'gallery-card';
    button.dataset.event = event.id;
    button.setAttribute('aria-label', `${event.title}, ${formatEventDate(event)} — посмотреть открытку`);
    button.style.setProperty('--thumb-top', palette.sky[0]);
    button.style.setProperty('--thumb-bottom', palette.sky[1]);
    const thumbnail = document.createElement('div');
    thumbnail.className = 'gallery-thumbnail';
    const image = document.createElement('img');
    image.src = url;
    image.alt = '';
    image.loading = 'lazy';
    image.width = 280;
    image.height = 180;
    thumbnail.append(image);
    const copy = document.createElement('div');
    copy.className = 'gallery-card-copy';
    const date = document.createElement('time');
    date.textContent = formatEventDate(event);
    const title = document.createElement('strong');
    title.textContent = event.title;
    copy.append(date, title);
    button.append(thumbnail, copy);
    button.addEventListener('click', () => setPreview(event.id));
    fragment.append(button);
  }
  $('gallery-grid').replaceChildren(fragment);
  galleryBuilt = true;
  updateGallerySelection();
}

function updateGallerySelection() {
  if (!state) return;
  for (const card of document.querySelectorAll('.gallery-card')) {
    const selected = card.dataset.event === state.event.id;
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  }
}

function triggerSceneAction(clientX, clientY) {
  clearTimeout(effectTimer);
  document.body.classList.add('scene-awake');
  if (state.event.id === 'birthday') document.body.classList.add('candles-out');
  atmosphere.burst(clientX, clientY);
  showToast(getStory(state.event.id).response);
  effectTimer = setTimeout(() => document.body.classList.remove('scene-awake', 'candles-out'), 9000);
}

function updateClockLabel() {
  const zone = normalizeTimeZone(preferences.timeZone);
  const clock = new Intl.DateTimeFormat('ru-RU', { timeZone: zone, hour: '2-digit', minute: '2-digit' }).format(new Date());
  const place = preferences.timeZone === 'local' ? 'ВАШЕ ВРЕМЯ' : 'МОСКВА';
  $('clock-label').textContent = `${place} ${clock} · ${preview ? 'СЕЙЧАС ПРЕДПРОСМОТР' : 'ОТКРЫТКИ МЕНЯЮТСЯ САМИ'}`;
}

function tick() {
  clearTimeout(timer);
  const nextState = getState();
  const signature = `${nextState.event.id}:${nextState.year}:${nextState.mode}:${Boolean(preview)}:${nextState.timeZone}`;
  const newDay = dateKey(getZonedParts(nextState.now, nextState.timeZone));
  const first = !state;
  state = nextState;
  if (signature !== sceneSignature) {
    renderScene(state, first);
    sceneSignature = signature;
  }
  renderCountdown(state);
  if (`${signature}:${newDay}` !== doorSignature) {
    renderDoors();
    doorSignature = `${signature}:${newDay}`;
  }
  updateClockLabel();
  // Recalculate from the clock every time: suspended tabs never accumulate timer drift.
  if (!document.hidden) timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
}

$('open-gallery').addEventListener('click', () => { buildGallery(); openDialog($('gallery-dialog')); });
for (const id of ['open-settings', 'timezone-button']) $(id).addEventListener('click', () => openDialog($('settings-dialog')));
$('open-advent').addEventListener('click', () => { renderAdventGrid(); openDialog($('advent-dialog')); });
$('pause-motion').addEventListener('click', toggleMotion);
$('motion-toggle').addEventListener('change', toggleMotion);
$('scene-action').addEventListener('click', () => triggerSceneAction());
$('letter-action').addEventListener('click', () => {
  closeDialog($('letter-dialog'));
  closeDialog($('advent-dialog'));
  triggerSceneAction();
});
$('next-event').addEventListener('click', () => { if (state.nextEvent) setPreview(state.nextEvent.id); });
$('brand-home').addEventListener('click', event => { event.preventDefault(); returnToToday(); });
$('return-today').addEventListener('click', () => returnToToday());
for (const button of document.querySelectorAll('[data-preview-mode]')) {
  button.addEventListener('click', () => setPreview(state.event.id, button.dataset.previewMode));
}
for (const [id, delta] of [['previous-scene', -1], ['next-scene', 1]]) {
  $(id).addEventListener('click', () => {
    const index = EVENTS.findIndex(event => event.id === state.event.id);
    setPreview(EVENTS[(index + delta + EVENTS.length) % EVENTS.length].id, preview?.mode || 'countdown');
  });
}

for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => {
    const returnTarget = resolveReturnFocus(dialogReturnFocus.get(dialog));
    dialogReturnFocus.delete(dialog);
    const topDialog = [...document.querySelectorAll('dialog[open]')].at(-1);
    // A nested letter returns to its newly rendered door, never outside its modal.
    if (returnTarget && (!topDialog || topDialog.contains(returnTarget))) {
      returnTarget.focus({ preventScroll: true });
      if (document.activeElement === returnTarget) return;
    }
    if (topDialog) {
      if (!topDialog.contains(document.activeElement)) {
        topDialog.querySelector('[autofocus], button, input, select, [tabindex="0"]')?.focus({ preventScroll: true });
      }
    } else if (!document.activeElement || document.activeElement === document.body
        || document.activeElement.closest?.('dialog')) {
      const fallback = { 'gallery-dialog': 'open-gallery', 'settings-dialog': 'open-settings' }[dialog.id] || 'open-advent';
      $(fallback).focus({ preventScroll: true });
    }
  });
}

$('timezone-select').value = preferences.timeZone;
$('timezone-select').addEventListener('change', event => {
  preferences.timeZone = event.target.value === 'local' ? 'local' : DEFAULT_TIME_ZONE;
  writeStorage(PREFERENCES_KEY, preferences);
  const selected = preview;
  if (selected) setPreview(selected.id, selected.mode);
  else { sceneSignature = ''; tick(); }
  showToast(preferences.timeZone === 'local' ? 'Календарь следует времени вашего устройства.' : 'Календарь снова следует московскому времени.');
});

if (!document.fullscreenEnabled) $('fullscreen').hidden = true;
$('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { showToast('Браузер не разрешил полноэкранный режим. Открытка уже занимает всю доступную область.'); }
});
document.addEventListener('fullscreenchange', () => {
  $('fullscreen').innerHTML = icon(document.fullscreenElement ? 'collapse' : 'expand');
  $('fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Выйти из полного экрана' : 'На весь экран');
});

document.addEventListener('pointermove', event => {
  if (event.pointerType === 'mouse' && !document.querySelector('dialog[open]')) atmosphere.setPointer(event.clientX, event.clientY);
}, { passive: true });
document.querySelector('.page-shell').addEventListener('click', event => {
  if (event.target.closest('button,a,input,select,dialog,.postcard-copy,.site-footer,.site-header,.preview-bar')) return;
  triggerSceneAction(event.clientX, event.clientY);
});
motionQuery.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', () => {
  syncMotion();
  if (document.hidden) clearTimeout(timer);
  else tick();
});
window.addEventListener('pageshow', tick);
window.addEventListener('pagehide', () => {
  clearTimeout(timer);
  clearTimeout(toastTimer);
  $('toast').classList.remove('visible');
});
window.addEventListener('storage', event => {
  if (event.key === DOORS_KEY) { opened = readStorage(DOORS_KEY, {}); renderDoors(); }
});
window.addEventListener('popstate', () => loadURL());

function loadURL() {
  const params = new URLSearchParams(location.search);
  const eventId = params.get('preview');
  if (EVENTS.some(event => event.id === eventId)) setPreview(eventId, params.get('mode') === 'celebration' ? 'celebration' : 'countdown', { updateURL: false });
  else returnToToday({ updateURL: false });
}
loadURL();
