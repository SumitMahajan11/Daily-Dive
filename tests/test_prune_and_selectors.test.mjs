/**
 * Test: 200 history entries over 90 days + progress for 120 topics -> run prune.
 * Assert: Explored stays 120, and topic last seen 70 days ago is still reviewable.
 */
import {
  selectTotalSpins,
  selectExploredCount,
  selectReviewQueue,
  selectStreakMetrics
} from '../src/lib/selectors.js';
import { appendHistoryEntry } from '../src/lib/roulette.js';


let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

const now = new Date('2026-10-10T12:00:00.000Z');
const nowMs = now.getTime();

// 1. Seed persistent progress for 120 topics
const userProgress = {};
const topics = [];

for (let i = 0; i < 120; i++) {
  const topicId = `topic_${i}`;
  // topic_0 was last seen 70 days ago
  const daysAgo = i === 0 ? 70 : Math.max(1, Math.floor((i / 120) * 55));
  const seenDate = new Date(nowMs - daysAgo * 86400000).toISOString();
  userProgress[topicId] = {
    times_seen: 1,
    last_seen: seenDate,
    learned: i % 10 === 0
  };
  topics.push({
    id: topicId,
    title: `Topic ${i} Title`,
    group_name: 'tech',
    category: 'ai-ml'
  });
}

// 2. Seed 200 history entries over 90 days
let history = [
  {
    id: 'hist_0',
    topic_id: 'topic_0',
    title: 'Topic 0 Title',
    group_name: 'tech',
    category: 'ai-ml',
    action: 'spin',
    timestamp: new Date(nowMs - 70 * 86400000).toISOString(),
    local_date: new Date(nowMs - 70 * 86400000).toISOString().slice(0, 10)
  }
];

for (let j = 1; j < 200; j++) {
  const topicIdx = 1 + (j % 119);
  const daysAgo = Math.max(1, Math.floor((j / 200) * 88));
  const entryDate = new Date(nowMs - daysAgo * 86400000);
  history.push({
    id: `hist_${j}`,
    topic_id: `topic_${topicIdx}`,
    title: `Topic ${topicIdx} Title`,
    group_name: 'tech',
    category: 'ai-ml',
    action: 'spin',
    timestamp: entryDate.toISOString(),
    local_date: entryDate.toISOString().slice(0, 10)
  });
}

assert(history.length === 200, 'Seeded 200 history entries');
assert(Object.keys(userProgress).length === 120, 'Seeded progress for 120 topics');

// 3. Apply history retention prune (MAX_HISTORY_ENTRIES = 150, MAX_HISTORY_AGE_DAYS = 60)
const cutoff60Days = nowMs - (60 * 86400000);
const prunedHistory = history
  .filter(h => new Date(h.timestamp).getTime() >= cutoff60Days)
  .slice(0, 150);

assert(prunedHistory.length <= 150, `Pruned history length is ${prunedHistory.length} (<= 150)`);
assert(!prunedHistory.some(h => h.topic_id === 'topic_0'), 'topic_0 history entry was pruned (>60 days old)');

// 4. Invariant checks against selectors
const exploredCount = selectExploredCount(userProgress);
assert(exploredCount === 120, `Explored count stays exactly 120 after history prune (${exploredCount})`);

const reviewQueue = selectReviewQueue(topics, userProgress, 4);
assert(reviewQueue.length === 4, 'Review queue returns 4 topics');
assert(
  reviewQueue[0].id === 'topic_0',
  'topic_0 (last seen 70 days ago) is at the front of the review queue despite being pruned from history'
);

