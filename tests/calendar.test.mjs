import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS, DEFAULT_TIME_ZONE } from '../js/events.js';
import {
  dateKey, formatEventDate, getAdventDays, getCalendarState, getCountdown,
  getEventOccurrence, getPreviewState, getUpcomingEvents, getZonedParts,
  normalizeTimeZone, pluralRu, zonedMidnight,
} from '../js/calendar.js';

test('all 13 requested annual occasions are present, including both September 1 events', () => {
  assert.equal(EVENTS.length, 13);
  assert.equal(new Set(EVENTS.map(event => event.id)).size, 13);
  assert.deepEqual(EVENTS.map(({ id, month, day }) => [id, month, day]), [
    ['new-year', 1, 1], ['defender', 2, 23], ['spring', 3, 1], ['womens-day', 3, 8],
    ['may-day', 5, 1], ['victory', 5, 9], ['summer', 6, 1], ['russia', 6, 12],
    ['autumn', 9, 1], ['knowledge', 9, 1], ['unity', 11, 4], ['winter', 12, 1], ['birthday', 12, 26],
  ]);
});

test('the Moscow countdown uses the next civil midnight, independent of host zone', () => {
  const state = getCalendarState(new Date('2026-11-11T12:30:00Z'));
  assert.equal(state.event.id, 'winter');
  assert.equal(state.mode, 'countdown');
  assert.equal(state.startsAt.toISOString(), '2026-11-30T21:00:00.000Z');
  assert.equal(state.timeZone, DEFAULT_TIME_ZONE);
  assert.equal(state.cycleStart.toISOString(), '2026-11-04T21:00:00.000Z');
  assert.equal(state.nextEvent.id, 'birthday');
});

test('every occurrence celebrates for the complete local day and changes at its end', () => {
  for (const event of EVENTS) {
    const occurrence = getEventOccurrence(event, 2027);
    for (const instant of [+occurrence.startsAt, +occurrence.startsAt + 12 * 3600_000, +occurrence.endsAt - 1]) {
      const state = getCalendarState(new Date(instant));
      assert.equal(state.mode, 'celebration', event.id);
      assert.ok(state.events.some(item => item.id === event.id), event.id);
      assert.equal(state.remainingMs, 0);
    }
    const after = getCalendarState(occurrence.endsAt);
    assert.equal(after.mode, 'countdown', event.id);
    assert.ok(!after.events.some(item => item.id === event.id), event.id);
  }
});

test('a countdown does not turn into celebration one millisecond too early', () => {
  const start = zonedMidnight(2026, 12, 1);
  const state = getCalendarState(new Date(+start - 1));
  assert.equal(state.mode, 'countdown');
  assert.equal(state.remainingMs, 1);
  assert.equal(getCountdown(state.remainingMs).seconds, 1);
});

test('September 1 presents Knowledge Day and retains the beginning of autumn', () => {
  const state = getCalendarState(new Date('2027-09-01T09:00:00Z'));
  assert.equal(state.event.id, 'knowledge');
  assert.deepEqual(state.events.map(event => event.id), ['knowledge', 'autumn']);
  const upcoming = getUpcomingEvents(new Date('2027-08-31T00:00:00Z'));
  assert.deepEqual(upcoming.slice(0, 2).map(event => event.id), ['knowledge', 'autumn']);
});

test('Moscow and UTC legitimately disagree near a date boundary', () => {
  const now = new Date('2026-11-30T22:00:00Z');
  assert.equal(getCalendarState(now).mode, 'celebration');
  const utc = getCalendarState(now, { timeZone: 'UTC' });
  assert.equal(utc.mode, 'countdown');
  assert.equal(utc.remainingMs, 2 * 3600_000);
});

test('birthday stays visible all December 26, then the countdown reaches next year', () => {
  assert.equal(getCalendarState(new Date('2026-12-26T20:59:59Z')).event.id, 'birthday');
  const next = getCalendarState(new Date('2026-12-26T21:00:00Z'));
  assert.equal(next.event.id, 'new-year');
  assert.equal(next.year, 2027);
  assert.equal(next.startsAt.toISOString(), '2026-12-31T21:00:00.000Z');
});

test('New Year celebrates through January 1 and hands off to February 23', () => {
  assert.equal(getCalendarState(new Date('2026-12-31T20:59:59Z')).mode, 'countdown');
  assert.equal(getCalendarState(new Date('2026-12-31T21:00:00Z')).mode, 'celebration');
  assert.equal(getCalendarState(new Date('2027-01-01T20:59:59Z')).event.id, 'new-year');
  const after = getCalendarState(new Date('2027-01-01T21:00:00Z'));
  assert.equal(after.event.id, 'defender');
  assert.equal(after.mode, 'countdown');
});

test('leap days are accounted for and a future leap-day custom event is supported', () => {
  const leap = getCalendarState(new Date('2028-02-28T21:00:00Z'));
  assert.equal(leap.event.id, 'spring');
  assert.equal(leap.remainingMs, 86400_000);
  const custom = { id: 'leap', month: 2, day: 29, title: 'Високосный день' };
  assert.equal(getEventOccurrence(custom, 2027), null);
  const state = getCalendarState(new Date('2029-03-01T00:00:00Z'), { events: [custom] });
  assert.equal(state.year, 2032);
});

test('civil-day boundaries handle 23-hour and 25-hour DST days', () => {
  const zone = 'America/New_York';
  const spring = getEventOccurrence({ id: 'dst-spring', month: 3, day: 8 }, 2026, zone);
  const autumn = getEventOccurrence({ id: 'dst-autumn', month: 11, day: 1 }, 2026, zone);
  assert.equal(spring.endsAt - spring.startsAt, 23 * 3600_000);
  assert.equal(autumn.endsAt - autumn.startsAt, 25 * 3600_000);
});

test('invalid time zones fall back predictably and invalid dates fail explicitly', () => {
  assert.equal(normalizeTimeZone('No/Such_City'), DEFAULT_TIME_ZONE);
  assert.equal(getCalendarState(new Date('2026-11-11T00:00:00Z'), { timeZone: 'No/Such_City' }).timeZone, DEFAULT_TIME_ZONE);
  assert.throws(() => getCalendarState(new Date('invalid')), TypeError);
  assert.throws(() => getCalendarState(new Date(), { events: [] }), RangeError);
});

test('previews can select every event without mutating the actual clock or registry', () => {
  const now = new Date('2026-11-11T12:00:00Z');
  const realTimestamp = +now;
  for (const event of EVENTS) {
    const waiting = getPreviewState(event.id, 'countdown', now);
    const celebration = getPreviewState(event.id, 'celebration', now);
    assert.equal(waiting.event.id, event.id);
    assert.equal(waiting.mode, 'countdown');
    assert.equal(celebration.mode, 'celebration');
    assert.equal(celebration.event.id, event.id);
    assert.equal(getZonedParts(waiting.now).hour, 12);
    assert.equal(getZonedParts(celebration.now).hour, 12);
    assert.equal(waiting.preview, true);
    assert.equal(+now, realTimestamp);
  }
  assert.equal(getCalendarState(now).event.id, 'winter');
  assert.equal(getPreviewState('autumn', 'celebration', now).events.length, 2);
  assert.throws(() => getPreviewState('missing', 'countdown', now), RangeError);
});

test('advent doors only unlock past and current civil dates, with today in the strip', () => {
  const now = new Date('2026-11-11T12:00:00Z');
  const state = getCalendarState(now);
  const doors = getAdventDays(state);
  assert.equal(doors.length, 7);
  assert.equal(doors.filter(day => day.isToday).length, 1);
  assert.equal(doors[2].key, '2026-11-11');
  assert.equal(doors.filter(day => day.available).length, 3);
  assert.ok(doors.filter(day => day.isFuture).every(day => !day.available));
  assert.ok(doors.every(day => day.date >= state.cycleStart && day.date <= state.startsAt));
});

test('short event cycles and celebration strips do not leak into another occasion', () => {
  const state = getCalendarState(new Date('2026-12-27T09:00:00Z'));
  const doors = getAdventDays(state);
  assert.equal(doors.length, 6);
  assert.equal(doors[0].key, '2026-12-27');
  assert.equal(doors.at(-1).key, '2027-01-01');
  const celebration = getCalendarState(new Date('2027-01-01T09:00:00Z'));
  const celebrationDoors = getAdventDays(celebration);
  assert.ok(celebrationDoors.every(day => day.available));
  assert.equal(celebrationDoors.at(-1).isToday, true);
  assert.equal(celebrationDoors.at(-1).eventDay, true);
});

test('preview doors use the preview clock even if the actual clock is passed in', () => {
  const actualNow = new Date('2026-11-11T12:00:00Z');
  const state = getPreviewState('new-year', 'countdown', actualNow);
  const doors = getAdventDays(state, actualNow);
  assert.equal(doors.length, 7);
  assert.equal(doors.find(day => day.isToday).key, '2026-12-25');
  assert.ok(doors.filter(day => day.isFuture).every(day => !day.available));
});

test('countdown and Russian date helpers produce stable presentation values', () => {
  assert.deepEqual(getCountdown(2 * 86400_000 + 3 * 3600_000 + 4 * 60_000 + 5000), {
    days: 2, hours: 3, minutes: 4, seconds: 5, totalSeconds: 183845,
  });
  assert.deepEqual(getCountdown(-100), { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
  assert.equal(getCountdown(NaN).totalSeconds, 0);
  assert.equal(pluralRu(1, ['день', 'дня', 'дней']), 'день');
  assert.equal(pluralRu(22, ['день', 'дня', 'дней']), 'дня');
  assert.equal(pluralRu(111, ['день', 'дня', 'дней']), 'дней');
  assert.equal(formatEventDate(EVENTS[0]), '1 января');
  assert.equal(dateKey({ year: 2026, month: 9, day: 1 }), '2026-09-01');
});
