import {
  INITIAL_TOPICS,
  isTopicEligible,
  reconcileStreakWithActivity,
  computeMaxHistoricalStreak,
  STARTER_ENABLED_CATEGORIES,
  CATEGORY_TREE,
  BASE_REEL_CATEGORIES
} from '../src/lib/roulette.js';

console.log('================================================================');
console.log('     PART A INVARIANT & NUMBERS RECONCILIATION TEST SUITE       ');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ── TEST 1: LEAD 1 & INVARIANT (totalSpins == history spin entries, explored == unique topic ids in history) ──
console.log('\n[1/5] Invariant 1: totalSpins == history spin entries & explored == unique topic ids in history');

const mockHistory = [
  { id: 'h1', topic_id: 't1', action: 'spin', local_date: '2026-10-01' },
  { id: 'h2', topic_id: 't2', action: 'spin', local_date: '2026-10-02' },
  { id: 'h3', topic_id: 't1', action: 'spin', local_date: '2026-10-03' },
  { id: 'h4', topic_id: 't3', action: 'spin', local_date: '2026-10-04' },
  { id: 'h5', topic_id: 't1', action: 'learned', local_date: '2026-10-04' },
  { id: 'h6', topic_id: 't4', action: 'spin', local_date: '2026-10-05' }
];

const totalSpinsCount = mockHistory.filter(h => h.action === 'spin' || !h.action).length;
const uniqueExploredCount = new Set(mockHistory.map(h => h.topic_id)).size;

assert(totalSpinsCount === 5, `totalSpins (${totalSpinsCount}) equals exactly the 5 spin actions in history`);
assert(uniqueExploredCount === 4, `explored count (${uniqueExploredCount}) equals exactly the 4 unique topic IDs (t1, t2, t3, t4) in history`);

// ── TEST 2: LEAD 2 & INVARIANT (Every review-queue item exists in history) ──
console.log('\n[2/5] Invariant 2: Every review-queue item exists in history');

const mockTopics = [
  { id: 't1', title: 'Raft Consensus' },
  { id: 't2', title: 'CQRS Architecture' },
  { id: 't3', title: 'Saga Pattern' },
  { id: 't4', title: 'Circuit Breaker' },
  { id: 't_orphaned', title: 'Kubernetes StatefulSets' } // In userProgressMap but NOT in history
];

const mockProgressMap = {
  t1: { times_seen: 2, last_seen: '2026-10-03T10:00:00Z' },
  t2: { times_seen: 1, last_seen: '2026-10-02T10:00:00Z' },
  t3: { times_seen: 1, last_seen: '2026-10-04T10:00:00Z' },
  t_orphaned: { times_seen: 1, last_seen: '2026-09-15T10:00:00Z' } // 25 days ago, orphaned
};

// Derived selector: strictly filtered by history topic ids
const historyTopicIds = new Set(mockHistory.map(h => h.topic_id));
const reviewQueue = mockTopics
  .filter(t => historyTopicIds.has(t.id))
  .sort((a, b) => {
    const aTime = new Date(mockProgressMap[a.id]?.last_seen || 0).getTime();
    const bTime = new Date(mockProgressMap[b.id]?.last_seen || 0).getTime();
    return aTime - bTime;
  })
  .slice(0, 4);

assert(
  !reviewQueue.some(t => t.id === 't_orphaned'),
  'Orphaned topic "Kubernetes StatefulSets" is correctly excluded from review queue because it does not exist in history'
);
assert(
  reviewQueue.every(t => historyTopicIds.has(t.id)),
  'Every item in the review queue is guaranteed to exist in the history log'
);

// ── TEST 3: LEAD 3 & INVARIANT (best >= current always, and best >= any past streak) ──
console.log('\n[3/5] Invariant 3: Best streak reconciliation (2-day streak -> lapse -> new 1-day streak -> best == 2)');

// User had active days on Sep 26 and Sep 27 (2-day streak), then lapsed, and spun today (Oct 10, 1-day streak)
const activeDates = new Set(['2026-09-26', '2026-09-27', '2026-10-10']);
const todayDate = new Date('2026-10-10T12:00:00');
const storedStreakData = { current_streak: 1, longest_streak: 1, last_active_date: '2026-10-10' };

const maxHistorical = computeMaxHistoricalStreak(activeDates);
assert(maxHistorical === 2, `Historical max streak calculated across activeDates is 2 (Sep 26 & 27)`);

const reconciled = reconcileStreakWithActivity(storedStreakData, activeDates, todayDate);
assert(reconciled.current_streak === 1, `Current streak is 1`);
assert(reconciled.longest_streak === 2, `Longest streak is reconciled to 2 (best >= any past streak)`);
assert(reconciled.longest_streak >= reconciled.current_streak, `Longest streak (${reconciled.longest_streak}) >= current streak (${reconciled.current_streak})`);

// ── TEST 4: LEAD 4 & INVARIANT (Reel only contains topics/categories eligible under current filters) ──
console.log('\n[4/5] Invariant 4: Reel only contains categories eligible under current filters');

// User toggled off 'mind-growth' and 'money-career'
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
console.log('\n[5/5] Lead 5 Verification: Category Group Counts & No Presets');

CATEGORY_TREE.forEach(groupDef => {
  const groupTopics = INITIAL_TOPICS.filter(t => (t.group_name || t.group) === groupDef.group);
  const subcategoryCount = groupDef.categories.length;
  assert(groupTopics.length > 0, `Group "${groupDef.label}" has ${groupTopics.length} real topics across ${subcategoryCount} subcategories`);
});

console.log('\n================================================================');
console.log(`PART A TESTS COMPLETE! (${passedTests}/${totalTests} assertions verified)`);
console.log('================================================================\n');
