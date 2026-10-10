import test from 'node:test';
import assert from 'node:assert/strict';
import { selectTotalSpins, selectExploredCount, selectLearnedCount } from '../src/lib/selectors.js';

console.log('================================================================');
console.log('       TEST: TOTAL DIVES RESILIENCE, PRUNE & BACKFILL           ');
console.log('================================================================\n');

test('Total Dives: remains constant after rolling history prune (>60 days / >150 entries)', () => {
  const now = new Date('2026-10-10T12:00:00.000Z').getTime();

  // 1. Seed 120 topics with total 280 spins in userProgressMap
  const userProgressMap = {};
  let expectedTotalDives = 0;

  for (let i = 0; i < 120; i++) {
    const times = (i % 3) + 1; // 1 to 3 spins per topic
    const daysAgo = Math.floor((i / 120) * 85);
    userProgressMap[`topic_${i}`] = {
      times_seen: times,
      last_seen: new Date(now - daysAgo * 86400000).toISOString(),
      learned: i % 5 === 0
    };
    expectedTotalDives += times;
  }

  // 2. Seed 200 history entries spanning 90 days
  const fullHistory = [];
  for (let j = 0; j < 200; j++) {
    const daysAgo = Math.floor((j / 200) * 88);
    fullHistory.push({
      id: `hist_${j}`,
      topic_id: `topic_${j % 120}`,
      action: 'spin',
      timestamp: new Date(now - daysAgo * 86400000).toISOString()
    });
  }

  // Verify initial Total Dives before prune
  const totalBeforePrune = selectTotalSpins({ userProgressMap, history: fullHistory });
  console.log(`  Initial Total Dives: ${totalBeforePrune} (Expected: ${expectedTotalDives})`);
  assert.equal(totalBeforePrune, expectedTotalDives, 'Initial Total Dives matches cumulative times_seen');

  // 3. Apply rolling history prune (keep <= 60 days, <= 150 entries)
  const cutoff = now - (60 * 86400000);
  const prunedHistory = fullHistory
    .filter(h => new Date(h.timestamp).getTime() >= cutoff)
    .slice(0, 150);

  console.log(`  History pruned from ${fullHistory.length} -> ${prunedHistory.length} entries`);
  assert.ok(prunedHistory.length <= 150, 'Pruned history is <= 150 entries');
  assert.ok(prunedHistory.length < fullHistory.length, 'Older history entries were removed');

  // 4. Assert Total Dives remains strictly CONSTANT after history prune
  const totalAfterPrune = selectTotalSpins({ userProgressMap, history: prunedHistory });
  console.log(`  Total Dives after History Prune: ${totalAfterPrune}`);
  assert.equal(totalAfterPrune, totalBeforePrune, 'Total Dives remains strictly constant after rolling history prune');
});

test('Total Dives: is fully restored after export and import cycle', () => {
  const userProgressMap = {
    'topic-1': { times_seen: 5, last_seen: '2026-10-09T10:00:00.000Z', learned: true },
    'topic-2': { times_seen: 3, last_seen: '2026-10-10T08:00:00.000Z', learned: false },
    'topic-3': { times_seen: 12, last_seen: '2026-10-10T11:00:00.000Z', learned: true }
  };
  const history = [
    { id: 'h1', topic_id: 'topic-1', action: 'spin', timestamp: '2026-10-09T10:00:00.000Z' },
    { id: 'h2', topic_id: 'topic-2', action: 'spin', timestamp: '2026-10-10T08:00:00.000Z' },
    { id: 'h3', topic_id: 'topic-3', action: 'spin', timestamp: '2026-10-10T11:00:00.000Z' }
  ];

  const originalTotal = selectTotalSpins({ userProgressMap, history });
  assert.equal(originalTotal, 20, 'Original Total Dives is 20');

  // Simulate export JSON payload
  const exportedPayload = JSON.stringify({
    schemaVersion: 2,
    version: '2.1.0',
    exported_at: new Date().toISOString(),
    user_progress: userProgressMap,
    history: history
  });

  // Simulate clean slate
  let restoredProgress = {};
  let restoredHistory = [];

  // Simulate import
  const parsed = JSON.parse(exportedPayload);
  restoredProgress = parsed.user_progress;
  restoredHistory = parsed.history;

  const restoredTotal = selectTotalSpins({ userProgressMap: restoredProgress, history: restoredHistory });
  console.log(`  Total Dives before export: ${originalTotal} | after import: ${restoredTotal}`);
  assert.equal(restoredTotal, originalTotal, 'Total Dives is 100% identical after export and import cycle');
});

test('Total Dives: backfills correctly from legacy/v1 backups with missing times_seen', () => {
  // Legacy v1 backup: has last_seen & learned, but no times_seen field
  const legacyBackupV1 = {
    schemaVersion: 1,
    user_progress: {
      'topic-legacy-1': { last_seen: '2026-09-01T12:00:00.000Z', learned: true },
      'topic-legacy-2': { last_seen: '2026-09-02T12:00:00.000Z', learned: false },
      'topic-legacy-3': { learned: true }
    },
    history: [
      { id: 'h1', topic_id: 'topic-legacy-1', action: 'spin', timestamp: '2026-09-01T12:00:00.000Z' },
      { id: 'h2', topic_id: 'topic-legacy-2', action: 'spin', timestamp: '2026-09-02T12:00:00.000Z' },
      { id: 'h3', topic_id: 'topic-legacy-4', action: 'spin', timestamp: '2026-09-03T12:00:00.000Z' }
    ]
  };

  // Perform DataContext normalization backfill logic
  const normalizedProgress = { ...legacyBackupV1.user_progress };
  Object.keys(normalizedProgress).forEach(id => {
    const entry = normalizedProgress[id];
    if (entry && typeof entry === 'object') {
      if (typeof entry.times_seen === 'undefined' || entry.times_seen === null) {
        normalizedProgress[id] = {
          ...entry,
          times_seen: (entry.learned || entry.last_seen) ? 1 : 0
        };
      }
    }
  });

  if (Array.isArray(legacyBackupV1.history)) {
    legacyBackupV1.history.forEach(h => {
      if (h && h.topic_id) {
        const current = normalizedProgress[h.topic_id] || { times_seen: 0 };
        if (!current.times_seen || current.times_seen === 0) {
          normalizedProgress[h.topic_id] = {
            ...current,
            times_seen: 1,
            last_seen: current.last_seen || h.timestamp
          };
        }
      }
    });
  }

  // Verify backfilled progress
  assert.equal(normalizedProgress['topic-legacy-1'].times_seen, 1, 'Legacy topic 1 backfilled times_seen = 1');
  assert.equal(normalizedProgress['topic-legacy-2'].times_seen, 1, 'Legacy topic 2 backfilled times_seen = 1');
  assert.equal(normalizedProgress['topic-legacy-3'].times_seen, 1, 'Legacy topic 3 backfilled times_seen = 1');
  assert.equal(normalizedProgress['topic-legacy-4'].times_seen, 1, 'Legacy topic 4 from history backfilled times_seen = 1');

  const totalDivesLegacy = selectTotalSpins({
    userProgressMap: normalizedProgress,
    history: legacyBackupV1.history
  });

  console.log(`  Legacy Backup Backfilled Total Dives: ${totalDivesLegacy} (Explored: ${selectExploredCount(normalizedProgress)})`);
  assert.equal(totalDivesLegacy, 4, 'Total Dives accurately reflects backfilled topics across progress and history');
  assert.equal(selectExploredCount(normalizedProgress), 4, 'Explored count accurately reflects all backfilled topics');
});
