import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../js/events.js';
import { DAILY_MOMENTS, civilDayIndex, getDailyMoment } from '../js/daily-moments.js';
import { STORIES, getDailyGift } from '../js/stories.js';

function datesFrom(year, month, day, count) {
  const start = Date.UTC(year, month - 1, day);
  return Array.from({ length: count }, (_, index) => new Date(start + index * 86_400_000).toISOString().slice(0, 10));
}

test('the shared collection contains at least 28 distinct complete postcards', () => {
  assert.ok(DAILY_MOMENTS.length >= 28);
  assert.ok(DAILY_MOMENTS.length <= 36);
  assert.equal(new Set(DAILY_MOMENTS.map(([title]) => title)).size, DAILY_MOMENTS.length);
  assert.ok(DAILY_MOMENTS.every(([title, text]) => title.length > 3 && text.length > 60));
});

test('the same occasion and civil date always return the same gift', () => {
  for (const event of EVENTS) {
    const first = getDailyGift(event.id, '2026-11-11');
    assert.deepEqual(getDailyGift(event.id, '2026-11-11'), first);
    getDailyGift(event.id, '2026-11-12');
    assert.deepEqual(getDailyGift(event.id, '2026-11-11'), first);
  }
});

test('every 24-day window is repetition-free for all 13 occasions across a year boundary', () => {
  const dates = datesFrom(2026, 12, 15, 60);
  for (const event of EVENTS) {
    const gifts = dates.map(key => getDailyGift(event.id, key));
    for (let offset = 0; offset <= gifts.length - 24; offset++) {
      assert.equal(new Set(gifts.slice(offset, offset + 24).map(gift => gift.title)).size, 24,
        `${event.id}, window beginning ${dates[offset]}`);
    }
  }
});

test('the themed postcards stay interleaved with the shared collection', () => {
  const dates = datesFrom(2026, 11, 1, 27);
  for (const event of EVENTS) {
    const expected = STORIES[event.id].gifts.map(([title]) => title);
    const received = dates.map(key => getDailyGift(event.id, key).title);
    assert.deepEqual(received.filter(title => expected.includes(title)).sort(), [...expected].sort(), event.id);
    assert.equal(received.filter(title => !expected.includes(title)).length, 24);
  }
});

test('the sequence remains diverse through February 29 and accepts only real canonical dates', () => {
  const leapDates = datesFrom(2028, 2, 15, 24);
  assert.equal(new Set(leapDates.map(key => getDailyGift('spring', key).title)).size, 24);
  assert.equal(civilDayIndex('1970-01-01'), 0);
  assert.equal(civilDayIndex('2028-03-01') - civilDayIndex('2028-02-28'), 2);
  assert.equal(civilDayIndex('2027-03-01') - civilDayIndex('2027-02-28'), 1);
  for (const key of ['2027-02-29', '2026-04-31', '2026-13-01', '2026-00-10', '2026-01-00', '2026-2-01', '0000-01-01', 'today', null]) {
    assert.throws(() => getDailyGift('winter', key), RangeError, String(key));
  }
});

test('new occasions can use the fallback story or the shared collection on its own', () => {
  assert.ok(getDailyGift('future-event', '2026-11-11').text);
  const dates = datesFrom(2026, 11, 1, 24);
  assert.equal(new Set(dates.map(key => getDailyMoment('future-event', key).title)).size, 24);
  assert.notDeepEqual(dates.map(key => getDailyGift('winter', key)), dates.map(key => getDailyGift('summer', key)));
});
