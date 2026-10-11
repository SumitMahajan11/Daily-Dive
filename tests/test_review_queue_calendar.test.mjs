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
});
