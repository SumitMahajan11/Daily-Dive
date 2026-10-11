import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { selectReviewQueue } from '../src/lib/selectors.js';

describe('Review Queue Calendar Day Filter', () => {
  test('last_seen today -> excluded; yesterday -> included', () => {
    const today = new Date('2026-10-11T12:00:00.000Z');
    const yesterday = new Date('2026-10-10T12:00:00.000Z');

    const topics = [
      { id: 'topic_today', title: 'Learned Today' },
      { id: 'topic_yesterday', title: 'Learned Yesterday' }
    ];

    const userProgressMap = {
      topic_today: { times_seen: 1, last_seen: today.toISOString() },
      topic_yesterday: { times_seen: 1, last_seen: yesterday.toISOString() }
    };

    const queue = selectReviewQueue(topics, userProgressMap, 4, today);

    assert.strictEqual(queue.length, 1, 'Only yesterday topic enters review queue');
    assert.strictEqual(queue[0].id, 'topic_yesterday', 'topic_yesterday is included');
    assert.ok(!queue.some(t => t.id === 'topic_today'), 'topic_today is excluded');
  });

  test('selectReviewQueue with fixed nowDate parameter shifts inclusion boundary', () => {
    const fixedNow = new Date('2026-05-15T12:00:00.000Z');
    const seenSameDay = new Date('2026-05-15T11:00:00.000Z');
    const seenPreviousDay = new Date('2026-05-13T12:00:00.000Z');

    const topics = [
      { id: 't_same_day', title: 'Same Day' },
      { id: 't_prev_day', title: 'Previous Day' }
    ];

    const progress = {
      t_same_day: { times_seen: 1, last_seen: seenSameDay.toISOString() },
      t_prev_day: { times_seen: 1, last_seen: seenPreviousDay.toISOString() }
    };

    // Evaluated at fixedNow:
    const queueNow = selectReviewQueue(topics, progress, 4, fixedNow);
    assert.strictEqual(queueNow.length, 1, 'Only previous day is included');
    assert.strictEqual(queueNow[0].id, 't_prev_day');

    // Evaluated 2 days later:
    const fixedLater = new Date('2026-05-17T12:00:00.000Z');
    const queueLater = selectReviewQueue(topics, progress, 4, fixedLater);
    assert.strictEqual(queueLater.length, 2, 'Both are included 2 days later');
  });

  test('selectReviewQueueAge computes calendar-day difference and never returns Today', async () => {
    const { selectReviewQueueAge } = await import('../src/lib/selectors.js');
    const now = new Date('2026-10-11T14:00:00'); // 2 PM today
    const yesterdayEvening = new Date('2026-10-10T20:00:00'); // 8 PM yesterday (18h elapsed)
    const twoDaysAgo = new Date('2026-10-09T10:00:00');

    assert.strictEqual(selectReviewQueueAge(yesterdayEvening, now), '1d ago', '18h ago across midnight is 1d ago');
    assert.strictEqual(selectReviewQueueAge(twoDaysAgo, now), '2d ago');
    // Boundary check: same day or null defaults to at least 1d ago, never Today
    assert.strictEqual(selectReviewQueueAge(now, now), '1d ago', 'Never returns Today');
    assert.strictEqual(selectReviewQueueAge(null, now), '1d ago');
  });
});

