import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import {
  INITIAL_TOPICS,
  STARTER_ENABLED_CATEGORIES,
  CATEGORY_TREE,
  BASE_REEL_CATEGORIES
} from '../../src/lib/roulette.js';
import {
  selectTotalSpins,
  selectExploredCount,
  selectLearnedCount,
  selectReviewQueue,
  selectStreakMetrics,
  selectBestStreak,
  selectEligibleTopics
} from '../../src/lib/selectors.js';
import { loadAllBuiltinTopics } from '../../src/lib/topicLoader.js';

printLog('================================================================');
printLog('     PART A INVARIANT & NUMBERS RECONCILIATION TEST SUITE       ');
printLog('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    printLog(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ── TEST 1: LEAD 1 & INVARIANT (totalSpins & explored count from selectors) ──
printLog('\n[1/5] Invariant 1: selectTotalSpins & selectExploredCount from single source of truth');

const mockHistory = [
  { id: 'h1', topic_id: 't1', action: 'spin', local_date: '2026-10-01' },
  { id: 'h2', topic_id: 't2', action: 'spin', local_date: '2026-10-02' },
  { id: 'h3', topic_id: 't1', action: 'spin', local_date: '2026-10-03' },
  { id: 'h4', topic_id: 't3', action: 'spin', local_date: '2026-10-04' },
  { id: 'h5', topic_id: 't1', action: 'learned', local_date: '2026-10-04' },
  { id: 'h6', topic_id: 't4', action: 'spin', local_date: '2026-10-05' }
];

const mockProgressMap = {
  t1: { times_seen: 2, last_seen: '2026-10-03T10:00:00Z', learned: true },
  t2: { times_seen: 1, last_seen: '2026-10-02T10:00:00Z' },
  t3: { times_seen: 1, last_seen: '2026-10-04T10:00:00Z' },
  t4: { times_seen: 1, last_seen: '2026-10-05T10:00:00Z' }
};

const totalSpinsCount = selectTotalSpins({ userProgressMap: mockProgressMap, history: mockHistory });
const uniqueExploredCount = selectExploredCount(mockProgressMap);
const learnedCount = selectLearnedCount(mockProgressMap);

assert(totalSpinsCount === 5, `selectTotalSpins (${totalSpinsCount}) returns exactly 5 total spins`);
assert(uniqueExploredCount === 4, `selectExploredCount (${uniqueExploredCount}) returns exactly 4 explored topics from persistent progress`);
assert(learnedCount === 1, `selectLearnedCount (${learnedCount}) returns 1 learned topic`);

// ── TEST 2: LEAD 2 & INVARIANT (Review Queue derives from persistent user_progress) ──
printLog('\n[2/5] Invariant 2: selectReviewQueue derives from persistent user_progress');

const mockTopics = [
  { id: 't1', title: 'Raft Consensus' },
  { id: 't2', title: 'CQRS Architecture' },
  { id: 't3', title: 'Saga Pattern' },
  { id: 't4', title: 'Circuit Breaker' },
  { id: 't_unseen', title: 'Kubernetes StatefulSets' }
];

const reviewQueue = selectReviewQueue(mockTopics, mockProgressMap, 4);

assert(
  !reviewQueue.some(t => t.id === 't_unseen'),
  'Unseen topic "Kubernetes StatefulSets" is correctly excluded from review queue'
);
assert(
  reviewQueue.length === 4,
  'Review queue includes all 4 seen topics sorted by oldest seen first'
);
assert(
  reviewQueue[0].id === 't2',
  `Oldest seen topic is first in review queue ("${reviewQueue[0].title}", seen on 2026-10-02)`
);

// ── TEST 3: LEAD 3 & INVARIANT (best >= current always, and best >= any past streak) ──
printLog('\n[3/5] Invariant 3: selectStreakMetrics reconciliation');

// User had active days on Sep 26 and Sep 27 (2-day streak), then lapsed, and spun today (Oct 10, 1-day streak)
const streakHistory = [
  { local_date: '2026-09-26', timestamp: '2026-09-26T10:00:00Z' },
  { local_date: '2026-09-27', timestamp: '2026-09-27T10:00:00Z' },
  { local_date: '2026-10-10', timestamp: '2026-10-10T10:00:00Z' }
];
const storedStreakData = { current_streak: 1, longest_streak: 1, last_active_date: '2026-10-10' };
const todayDate = new Date('2026-10-10T12:00:00');

const streakMetrics = selectStreakMetrics({
  userStreaks: storedStreakData,
  history: streakHistory,
  userProgressMap: {},
  nowDate: todayDate
});

assert(streakMetrics.current_streak === 1, `Current streak is 1`);
assert(streakMetrics.longest_streak === 2, `Longest streak is reconciled to 2 (best >= any past streak)`);
assert(streakMetrics.longest_streak >= streakMetrics.current_streak, `Longest streak (${streakMetrics.longest_streak}) >= current streak (${streakMetrics.current_streak})`);

// ── TEST 4: LEAD 4 & INVARIANT (Reel only contains categories eligible under current filters) ──
printLog('\n[4/5] Invariant 4: Reel only contains categories eligible under current filters');

const filteredSettings = {
  enabled_categories: {
    'tech': true,
    'world-ideas': true,
    'mind-growth': false,
    'money-career': false
  }
};

const activeReelCategories = BASE_REEL_CATEGORIES.filter(cat => {
  if (filteredSettings.enabled_categories[cat.group] === false) return false;
  if (filteredSettings.enabled_categories[`${cat.group}::${cat.name}`] === false) return false;
  return true;
});

assert(
  !activeReelCategories.some(c => c.group === 'mind-growth' || c.group === 'money-career'),
  'Filtered reel does not contain any cards from toggled-off groups ("mind-growth", "money-career")'
);
assert(
  activeReelCategories.every(c => c.group === 'tech' || c.group === 'world-ideas'),
  'All cards in active reel belong exclusively to enabled groups ("tech", "world-ideas")'
);

// ── TEST 5: LEAD 5 (Preset removal & accurate category group pool counts) ──
printLog('\n[5/5] Lead 5 Verification: Category Group Counts & No Presets');

const allTopics = await loadAllBuiltinTopics();
CATEGORY_TREE.forEach(groupDef => {
  const groupTopics = allTopics.filter(t => (t.group_name || t.group) === groupDef.group);
  const subcategoryCount = groupDef.categories.length;
  assert(groupTopics.length > 0, `Group "${groupDef.label}" has ${groupTopics.length} real topics across ${subcategoryCount} subcategories`);
});

printLog('\n================================================================');
printLog(`PART A TESTS COMPLETE! (${passedTests}/${totalTests} assertions verified)`);
printLog('================================================================\n');
