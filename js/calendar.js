import { DEFAULT_TIME_ZONE, EVENTS } from './events.js';

const DAY_MS = 86_400_000;
const formatters = new Map();
const midnightCache = new Map();
const zoneCache = new Map();

function asDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError('Invalid calendar date');
  return date;
}

/** Invalid or unavailable IANA identifiers safely use the calendar's Moscow default. */
export function normalizeTimeZone(timeZone = DEFAULT_TIME_ZONE) {
  const requested = timeZone === 'local'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : timeZone || DEFAULT_TIME_ZONE;
  if (zoneCache.has(requested)) return zoneCache.get(requested);
  let result;
  try {
    result = new Intl.DateTimeFormat('en', { timeZone: requested })
      .resolvedOptions().timeZone;
  } catch {
    result = DEFAULT_TIME_ZONE;
  }
  if (zoneCache.size >= 64) zoneCache.delete(zoneCache.keys().next().value);
  zoneCache.set(requested, result);
  return result;
}

function getFormatter(timeZone) {
  if (!formatters.has(timeZone)) {
    formatters.set(timeZone, new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }));
  }
  return formatters.get(timeZone);
}

/** Calendar fields are always read in the selected zone, never the host's zone. */
export function getZonedParts(now = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const date = asDate(now);
  const zone = normalizeTimeZone(timeZone);
  const parts = {};
  for (const part of getFormatter(zone).formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  return {
    year: parts.year, month: parts.month, day: parts.day,
    hour: parts.hour, minute: parts.minute, second: parts.second,
  };
}

/** A stable local civil-date key suitable for persistent advent-door state. */
export function dateKey({ year, month, day }) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function civilTimestamp({ year, month, day }, hour = 0, minute = 0, second = 0) {
  // setUTCFullYear also handles years 0–99 without Date.UTC's 1900 adjustment.
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return date.getTime();
}

function civilParts(timestamp) {
  const date = new Date(timestamp);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function shiftCivil(parts, days) {
  return civilParts(civilTimestamp(parts) + days * DAY_MS);
}

function civilOrdinal(parts) {
  return Math.floor(civilTimestamp(parts) / DAY_MS);
}

/**
 * First instant of a civil date in an IANA zone. End-of-day boundaries use the
 * next civil midnight rather than +24h, so 23h/25h daylight-saving days work.
 * The fallback also handles zones where a clock change skips or repeats 00:00.
 */
export function zonedMidnight(year, month, day, timeZone = DEFAULT_TIME_ZONE) {
  if (![year, month, day].every(Number.isInteger)) throw new TypeError('Invalid civil date');
  const zone = normalizeTimeZone(timeZone);
  const normalized = civilParts(civilTimestamp({ year, month, day }));
  const key = `${zone}:${dateKey(normalized)}`;
  if (midnightCache.has(key)) return new Date(midnightCache.get(key));

  const wanted = civilTimestamp(normalized);
  const ordinal = civilOrdinal(normalized);
  let instant = wanted;
  for (let attempt = 0; attempt < 4; attempt++) {
    const observed = getZonedParts(instant, zone);
    const correction = wanted - civilTimestamp(observed, observed.hour, observed.minute, observed.second);
    if (correction === 0) break;
    instant += correction;
  }
  const found = getZonedParts(instant, zone);
  if (civilOrdinal(found) !== ordinal || found.hour !== 0 || found.minute !== 0
      || civilOrdinal(getZonedParts(instant - 1, zone)) === ordinal) {
    // Date ordering is monotone even when a local clock repeats an hour.
    let low = wanted - 36 * 3_600_000;
    let high = wanted + 36 * 3_600_000;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (civilOrdinal(getZonedParts(middle, zone)) < ordinal) low = middle;
      else high = middle;
    }
    instant = high;
  }
  // Bounded cache prevents growth in long-lived screens or repeated previews.
  if (midnightCache.size >= 1024) midnightCache.delete(midnightCache.keys().next().value);
  midnightCache.set(key, instant);
  return new Date(instant);
}

/** Returns null for a non-existent annual date, such as February 29 in 2027. */
export function getEventOccurrence(event, year, timeZone = DEFAULT_TIME_ZONE) {
  if (!event || !Number.isInteger(event.month) || !Number.isInteger(event.day)
      || event.month < 1 || event.month > 12 || event.day < 1 || event.day > 31
      || !Number.isInteger(year)) throw new TypeError('Invalid annual event');
  const normalized = civilParts(civilTimestamp({ year, month: event.month, day: event.day }));
  if (normalized.month !== event.month || normalized.day !== event.day) return null;
  const zone = normalizeTimeZone(timeZone);
  const nextDay = shiftCivil(normalized, 1);
  return {
    ...event, event, year, key: `${event.id}:${year}`,
    startsAt: zonedMidnight(year, event.month, event.day, zone),
    endsAt: zonedMidnight(nextDay.year, nextDay.month, nextDay.day, zone),
  };
}

function sortOccurrences(a, b) {
  return a.startsAt - b.startsAt || (b.priority || 0) - (a.priority || 0)
    || a.id.localeCompare(b.id);
}

function occurrencesAround(now, events, timeZone, yearsAhead = 2) {
  if (!Array.isArray(events) || events.length === 0) throw new RangeError('The calendar needs at least one event');
  const year = getZonedParts(now, timeZone).year;
  const occurrences = [];
  for (let y = year - 1; y <= year + yearsAhead; y++) {
    for (const event of events) {
      const occurrence = getEventOccurrence(event, y, timeZone);
      if (occurrence) occurrences.push(occurrence);
    }
  }
  return occurrences.sort(sortOccurrences);
}

function groupAt(occurrences, startsAt) {
  return occurrences.filter(item => +item.startsAt === +startsAt);
}

function makeState(target, now, occurrences, timeZone) {
  const simultaneous = groupAt(occurrences, target.startsAt);
  const previous = occurrences.filter(item => item.endsAt <= target.startsAt).at(-1);
  const next = occurrences.find(item => item.startsAt > target.startsAt);
  const celebrating = now >= target.startsAt && now < target.endsAt;
  return {
    mode: celebrating ? 'celebration' : 'countdown',
    event: target.event,
    events: simultaneous.map(item => item.event),
    startsAt: new Date(target.startsAt), endsAt: new Date(target.endsAt),
    now: new Date(now), remainingMs: celebrating ? 0 : Math.max(0, target.startsAt - now),
    year: target.year,
    nextEvent: next ? { ...next, events: groupAt(occurrences, next.startsAt).map(item => item.event) } : null,
    cycleStart: previous ? new Date(previous.endsAt) : zonedMidnight(target.year - 1, 1, 1, timeZone),
    timeZone,
  };
}

/** The real clock: celebration lasts the entire local date, then the next card starts. */
export function getCalendarState(now = new Date(), { timeZone = DEFAULT_TIME_ZONE, events = EVENTS } = {}) {
  const current = asDate(now);
  const zone = normalizeTimeZone(timeZone);
  // Four years of lookahead also supports a future February 29 custom event.
  const occurrences = occurrencesAround(current, events, zone, 4);
  const target = occurrences.find(item => item.endsAt > current);
  if (!target) throw new RangeError('No event occurs in the next four years');
  return makeState(target, current, occurrences, zone);
}

/** Individual upcoming occasions; simultaneous occasions remain separate entries. */
export function getUpcomingEvents(now = new Date(), {
  timeZone = DEFAULT_TIME_ZONE, events = EVENTS, limit = 13,
} = {}) {
  const current = asDate(now);
  const zone = normalizeTimeZone(timeZone);
  const count = Math.max(0, Math.min(100, Math.floor(Number(limit) || 0)));
  const yearsAhead = Math.max(4, Math.ceil(count / Math.max(1, events.length)) + 1);
  return occurrencesAround(current, events, zone, yearsAhead)
    .filter(item => item.endsAt > current).slice(0, count);
}

/**
 * Isolated demo clock: selecting a card never changes the real date or event
 * registry. Countdown previews are seven civil days before the chosen event,
 * at local noon; celebration previews are at noon on the event's date.
 */
export function getPreviewState(eventId, mode = 'countdown', now = new Date(), {
  timeZone = DEFAULT_TIME_ZONE, events = EVENTS,
} = {}) {
  const actualNow = asDate(now);
  const zone = normalizeTimeZone(timeZone);
  const event = events.find(item => item.id === eventId);
  if (!event) throw new RangeError(`Unknown event: ${eventId}`);
  if (!['countdown', 'celebration'].includes(mode)) throw new RangeError('Unknown preview mode');
  const occurrences = occurrencesAround(actualNow, events, zone, 4);
  const target = occurrences.find(item => item.id === eventId && item.endsAt > actualNow);
  if (!target) throw new RangeError('No preview occurrence found');
  const targetParts = { year: target.year, month: target.month, day: target.day };
  const previewParts = shiftCivil(targetParts, mode === 'celebration' ? 0 : -7);
  // Noon is derived through the selected zone as well, including DST changes.
  const previewMidnight = zonedMidnight(previewParts.year, previewParts.month, previewParts.day, zone);
  let previewNow = new Date(+previewMidnight + 12 * 3_600_000);
  const observed = getZonedParts(previewNow, zone);
  previewNow = new Date(+previewNow + (12 - observed.hour) * 3_600_000 - observed.minute * 60_000);
  const state = makeState(target, previewNow, occurrences, zone);
  // A demo is a self-contained waiting period, even when real holidays are close together.
  const previewStart = shiftCivil(previewParts, -2);
  state.cycleStart = zonedMidnight(previewStart.year, previewStart.month, previewStart.day, zone);
  return { ...state, event, preview: true, actualNow, previewMode: mode };
}

/** Millisecond differences are clamped and rounded up, so zero only means arrival. */
export function getCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(Number.isFinite(milliseconds) ? milliseconds / 1000 : 0));
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

export function pluralRu(number, forms) {
  const n = Math.abs(Math.trunc(number));
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return forms[2];
  if (n % 10 === 1) return forms[0];
  if (n % 10 >= 2 && n % 10 <= 4) return forms[1];
  return forms[2];
}

export function formatEventDate(event, year) {
  const date = new Date(civilTimestamp({ year: year ?? 2024, month: event.month, day: event.day }));
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'UTC', day: 'numeric', month: 'long', ...(year == null ? {} : { year: 'numeric' }),
  }).format(date);
}

/**
 * Seven doors around today (two past, today, four future). Near the celebration
 * the strip slides back, never beyond the previous occasion's closing midnight.
 * `key` is a local YYYY-MM-DD; persist it under the selected event's id + year.
 */
export function getAdventDays(state, now = state.now, { timeZone = state.timeZone, count = 7 } = {}) {
  const zone = normalizeTimeZone(timeZone);
  const current = asDate(state.preview ? state.now : now);
  const size = Math.max(1, Math.min(366, Math.floor(Number(count) || 7)));
  const today = getZonedParts(current, zone);
  const todayOrdinal = civilOrdinal(today);
  const targetOrdinal = civilOrdinal(getZonedParts(state.startsAt, zone));
  const cycleOrdinal = civilOrdinal(getZonedParts(state.cycleStart, zone));
  let start = Math.max(cycleOrdinal, todayOrdinal - Math.min(2, size - 1));
  if (start + size - 1 > targetOrdinal) start = Math.max(cycleOrdinal, targetOrdinal - size + 1);
  const end = Math.min(targetOrdinal, start + size - 1);
  const days = [];
  for (let ordinal = start; ordinal <= end; ordinal++) {
    const parts = civilParts(ordinal * DAY_MS);
    days.push({
      ...parts, key: dateKey(parts),
      date: zonedMidnight(parts.year, parts.month, parts.day, zone),
      isToday: ordinal === todayOrdinal,
      isFuture: ordinal > todayOrdinal,
      available: ordinal <= todayOrdinal,
      eventDay: ordinal === targetOrdinal,
    });
  }
  return days;
}
