import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  selectExploredCount,
  selectLearnedCount,
  selectReviewQueue,
  selectTotalSpins,
  selectFilteredHistory
} from '../src/lib/selectors.js';
import {
  INITIAL_TOPICS,
  appendHistoryEntry,
  calculateUpdatedStreak
} from '../src/lib/roulette.js';
import {
  SCHEMA_VERSION,
  removeCustomTopicRecords,
  restoreCustomTopicRecords,
  repairProgressFromHistory,
  savePreRepairBackup,
  clearAllLocalData,
  STORAGE_KEYS_TO_CLEAR,
  PRE_REPAIR_BACKUP_KEY
} from '../src/lib/customTopics.js';

// Setup browser localStorage mock in node environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (key) => storageStore.get(key) || null,
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear()
};

describe('Round 11: Review Queue vs History Invariants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Helper simulating real DataContext operations
  function simulateSpin(topic, state, nowDate = new Date(Date.now() - 86400000 * 2)) {
    const nowIso = nowDate.toISOString();
    const curProgress = state.userProgressMap[topic.id] || { times_seen: 0, last_seen: null };
    state.userProgressMap[topic.id] = {
      ...curProgress,
      times_seen: (curProgress.times_seen || 0) + 1,
      last_seen: nowIso
    };
    state.history = appendHistoryEntry(state.history, topic, 'spin', nowDate);
    return state;
  }

  function simulateMarkLearned(topic, state, nowDate = new Date(Date.now() - 86400000 * 2)) {
    const nowIso = nowDate.toISOString();
    const curProgress = state.userProgressMap[topic.id] || { times_seen: 0, last_seen: null };
    state.userProgressMap[topic.id] = {
      ...curProgress,
      times_seen: (curProgress.times_seen || 0) + 1,
      last_seen: nowIso,
      learned: true
    };
    state.history = appendHistoryEntry(state.history, topic, 'learned', nowDate);
    return state;
  }

  function simulateClearHistory(state) {
    state.history = [];
    return state;
  }

  function simulateResetAll(state) {
    state.userProgressMap = {};
    state.history = [];
    state.customTopics = [];
    state.topics = [...INITIAL_TOPICS];
    return state;
  }

  test('I1: Every Review Queue item is a topic in the explored set (times_seen >= 1)', () => {
    const sampleTopics = INITIAL_TOPICS.slice(0, 10);
    const state = {
      topics: sampleTopics,
      userProgressMap: {
        [sampleTopics[0].id]: { times_seen: 2, last_seen: new Date(Date.now() - 86400000 * 2).toISOString() },
        [sampleTopics[1].id]: { times_seen: 1, last_seen: new Date(Date.now() - 86400000 * 3).toISOString() },
        [sampleTopics[2].id]: { times_seen: 0, last_seen: null }, // unstudied / times_seen = 0
        [sampleTopics[3].id]: { times_seen: 0, last_seen: null, learned: false } // zero times seen
      },
      history: []
    };

    const queue = selectReviewQueue(state.topics, state.userProgressMap, 4);

    assert.ok(queue.length > 0, 'Queue should return explored topics');
    for (const item of queue) {
      const p = state.userProgressMap[item.id];
      assert.ok(p, `Queue item ${item.id} must have a progress record`);
      assert.ok(
        (Number(p.times_seen) >= 1),
        `Queue item ${item.id} must be in explored set with times_seen >= 1 (found ${p.times_seen})`
      );
    }
  });

  test('I2: Explored count equals the number of distinct topic ids with times_seen >= 1', () => {
    const sampleTopics = INITIAL_TOPICS.slice(0, 5);
    const userProgressMap = {
      [sampleTopics[0].id]: { times_seen: 1, last_seen: new Date().toISOString() },
      [sampleTopics[1].id]: { times_seen: 3, last_seen: new Date().toISOString() },
      [sampleTopics[2].id]: { times_seen: 0, last_seen: null }, // Not explored
      [sampleTopics[3].id]: { times_seen: 0, last_seen: null }
    };

    const count = selectExploredCount(userProgressMap);
    const expectedDistinct = Object.keys(userProgressMap).filter(
      id => Number(userProgressMap[id]?.times_seen) >= 1
    ).length;

    assert.strictEqual(
      count,
      expectedDistinct,
      `Explored count (${count}) must equal distinct topics with times_seen >= 1 (${expectedDistinct})`
    );
  });

  test('I3: Every history entry (not pruned) has a progress record', () => {
    let state = {
      topics: INITIAL_TOPICS.slice(0, 5),
      userProgressMap: {},
      history: []
    };

    // Spin 4 different topics
    for (let i = 0; i < 4; i++) {
      simulateSpin(state.topics[i], state);
    }

    assert.strictEqual(state.history.length, 4);
    for (const h of state.history) {
      const p = state.userProgressMap[h.topic_id];
      assert.ok(p, `History entry ${h.topic_id} must have corresponding progress record`);
      assert.ok(p.times_seen >= 1, `Progress record must have times_seen >= 1`);
    }
  });

  test('I4: Number of unpruned history entries <= Total Dives', () => {
    let state = {
      topics: INITIAL_TOPICS.slice(0, 5),
      userProgressMap: {},
      history: []
    };

    // 10 spins across topics
    for (let i = 0; i < 10; i++) {
      const topic = state.topics[i % state.topics.length];
      simulateSpin(topic, state);
    }

    const totalDives = selectTotalSpins({
      userProgressMap: state.userProgressMap,
      history: state.history
    });

    assert.ok(
      state.history.length <= totalDives,
      `Unpruned history length (${state.history.length}) must be <= Total Dives (${totalDives})`
    );
  });

  test('I5: After Clear History: Explored count and Review Queue are unchanged. After Reset All: all four are empty or zero.', () => {
    let state = {
      topics: INITIAL_TOPICS.slice(0, 6),
      userProgressMap: {},
      history: [],
      customTopics: []
    };

    // Build progress and history
    for (let i = 0; i < 5; i++) {
      simulateSpin(state.topics[i], state);
    }

    const initialExplored = selectExploredCount(state.userProgressMap);
    const initialQueue = selectReviewQueue(state.topics, state.userProgressMap, 4);
    assert.strictEqual(initialExplored, 5);
    assert.strictEqual(initialQueue.length, 4);

    // 1. Clear History
    simulateClearHistory(state);
    const afterClearExplored = selectExploredCount(state.userProgressMap);
    const afterClearQueue = selectReviewQueue(state.topics, state.userProgressMap, 4);
    const afterClearHistoryList = selectFilteredHistory(state.history, 'all', state.userProgressMap);

    assert.strictEqual(afterClearExplored, initialExplored, 'Explored count must remain unchanged after Clear History');
    assert.strictEqual(afterClearQueue.length, initialQueue.length, 'Review Queue must remain unchanged after Clear History');
    assert.strictEqual(afterClearHistoryList.length, 0, 'Filtered history must be 0 after Clear History');

    // 2. Reset All Data
    simulateResetAll(state);
    const afterResetExplored = selectExploredCount(state.userProgressMap);
    const afterResetQueue = selectReviewQueue(state.topics, state.userProgressMap, 4);
    const afterResetHistoryList = selectFilteredHistory(state.history, 'all', state.userProgressMap);
    const afterResetTotalDives = selectTotalSpins({ userProgressMap: state.userProgressMap, history: state.history });

    assert.strictEqual(afterResetExplored, 0, 'Explored count must be 0 after Reset All');
    assert.strictEqual(afterResetQueue.length, 0, 'Review Queue must be empty after Reset All');
    assert.strictEqual(afterResetHistoryList.length, 0, 'History list must be 0 after Reset All');
    assert.strictEqual(afterResetTotalDives, 0, 'Total Dives must be 0 after Reset All');
  });

  test('I6: A topic deleted from Custom Uploads disappears from the queue, explored count and history', () => {
    const customTopic = {
      id: 'custom_note_delete_test_1',
      title: 'Custom Note for Deletion Test',
      group: 'custom',
      category: 'custom-notes',
      is_custom: true
    };

    let state = {
      customTopics: [customTopic],
      topics: [customTopic, ...INITIAL_TOPICS],
      userProgressMap: {
        [customTopic.id]: { times_seen: 2, last_seen: new Date().toISOString() },
        [INITIAL_TOPICS[0].id]: { times_seen: 1, last_seen: new Date().toISOString() }
      },
      history: [
        { topic_id: customTopic.id, title: customTopic.title, action: 'spin', timestamp: new Date().toISOString() },
        { topic_id: INITIAL_TOPICS[0].id, title: INITIAL_TOPICS[0].title, action: 'spin', timestamp: new Date().toISOString() }
      ]
    };

    assert.strictEqual(selectExploredCount(state.userProgressMap), 2);
    
    // Delete custom topic using real removeCustomTopicRecords function
    state.customTopics = (state.customTopics || []).filter(t => t.id !== customTopic.id);
    state.topics = (state.topics || []).filter(t => t.id !== customTopic.id);
    const { progressMap, history } = removeCustomTopicRecords(state.userProgressMap, state.history, [customTopic.id]);
    state.userProgressMap = progressMap;
    state.history = history;

    const exploredAfter = selectExploredCount(state.userProgressMap);
    const queueAfter = selectReviewQueue(state.topics, state.userProgressMap, 4);
    const historyAfter = selectFilteredHistory(state.history, 'all', state.userProgressMap);

    assert.strictEqual(exploredAfter, 1, 'Explored count must decrease by 1 when custom topic is deleted');
    assert.strictEqual(queueAfter.some(t => t.id === customTopic.id), false, 'Deleted topic must not appear in review queue');
    assert.strictEqual(historyAfter.some(h => h.topic_id === customTopic.id), false, 'Deleted topic must not appear in history');
  });

  test('3a: Undo after delete restores the topic, its progress record, and its history without losing progress', () => {
    const customTopic = {
      id: 'custom_note_undo_test',
      title: 'Undo Test Note',
      group: 'custom',
      category: 'custom-notes',
      is_custom: true
    };

    let state = {
      customTopics: [customTopic],
      topics: [customTopic, ...INITIAL_TOPICS],
      userProgressMap: {
        [customTopic.id]: { times_seen: 3, last_seen: '2026-10-09T10:00:00.000Z', learned: true }
      },
      history: [
        { topic_id: customTopic.id, title: customTopic.title, action: 'spin', timestamp: '2026-10-09T10:00:00.000Z' }
      ]
    };

    // Snapshot before delete
    const savedTopic = customTopic;
    const savedProgress = state.userProgressMap[customTopic.id];
    const savedHistory = state.history.filter(h => h.topic_id === customTopic.id);

    // Delete
    state.customTopics = state.customTopics.filter(t => t.id !== customTopic.id);
    state.topics = state.topics.filter(t => t.id !== customTopic.id);
    const deleteResult = removeCustomTopicRecords(state.userProgressMap, state.history, [customTopic.id]);
    state.userProgressMap = deleteResult.progressMap;
    state.history = deleteResult.history;

    assert.strictEqual(selectExploredCount(state.userProgressMap), 0, 'Explored count is 0 after deletion');
    assert.strictEqual(state.history.length, 0, 'History is empty after deletion');

    // Undo delete using restoreCustomTopicRecords
    const restored = restoreCustomTopicRecords({
      customTopics: state.customTopics,
      topics: state.topics,
      userProgressMap: state.userProgressMap,
      history: state.history,
      deletedTopic: savedTopic,
      deletedProgress: savedProgress,
      deletedHistory: savedHistory
    });

    state.customTopics = restored.customTopics;
    state.topics = restored.topics;
    state.userProgressMap = restored.userProgressMap;
    state.history = restored.history;

    assert.strictEqual(selectExploredCount(state.userProgressMap), 1, 'Explored count is restored to 1 on Undo');
    assert.strictEqual(state.userProgressMap[customTopic.id].times_seen, 3, 'Progress times_seen is preserved');
    assert.strictEqual(state.userProgressMap[customTopic.id].learned, true, 'Progress learned status is preserved');
    assert.strictEqual(state.history.length, 1, 'History is fully restored on Undo');
    assert.strictEqual(selectReviewQueue(state.topics, state.userProgressMap, 4).length, 1, 'Topic appears in review queue');
  });

  test('3b: 14-day expiry cleans progress & history without leaving ghosts, and Undo restores them', () => {
    const temporaryTopic = {
      id: 'temp_note_14d_expiry',
      title: 'Temporary Note 14-Day',
      lifecycle: 'temporary',
      expires_at: '2026-10-01T00:00:00.000Z', // Past date
      is_custom: true
    };

    let state = {
      customTopics: [temporaryTopic],
      topics: [temporaryTopic, ...INITIAL_TOPICS],
      userProgressMap: {
        [temporaryTopic.id]: { times_seen: 2, last_seen: '2026-09-30T12:00:00.000Z', learned: false }
      },
      history: [
        { topic_id: temporaryTopic.id, title: temporaryTopic.title, action: 'spin', timestamp: '2026-09-30T12:00:00.000Z' }
      ]
    };

    // On expiry: capture saved metadata and cascade remove from active pool
    const savedWithData = {
      ...temporaryTopic,
      _savedProgress: state.userProgressMap[temporaryTopic.id],
      _savedHistory: state.history.filter(h => h.topic_id === temporaryTopic.id)
    };

    state.customTopics = [];
    state.topics = state.topics.filter(t => t.id !== temporaryTopic.id);
    const expiredCascade = removeCustomTopicRecords(state.userProgressMap, state.history, [temporaryTopic.id]);
    state.userProgressMap = expiredCascade.progressMap;
    state.history = expiredCascade.history;

    // No ghost records remain in active state
    assert.strictEqual(selectExploredCount(state.userProgressMap), 0, 'No ghost explored count after expiry');
    assert.strictEqual(state.history.length, 0, 'No ghost history after expiry');
    assert.strictEqual(selectReviewQueue(state.topics, state.userProgressMap, 4).length, 0, 'No ghost in review queue');

    // On restore / Undo expiry via restoreCustomTopicRecords:
    const restored = restoreCustomTopicRecords({
      customTopics: state.customTopics,
      topics: state.topics,
      userProgressMap: state.userProgressMap,
      history: state.history,
      topicsToRestore: [savedWithData]
    });

    state.customTopics = restored.customTopics;
    state.topics = restored.topics;
    state.userProgressMap = restored.userProgressMap;
    state.history = restored.history;

    assert.strictEqual(selectExploredCount(state.userProgressMap), 1, 'Explored count restored on Undo');
    assert.strictEqual(state.userProgressMap[temporaryTopic.id].times_seen, 2, 'Times seen restored');
    assert.strictEqual(state.history.length, 1, 'History restored');
    assert.strictEqual(state.customTopics[0].lifecycle, 'temporary', 'Lifecycle remains temporary');
    assert.ok(new Date(state.customTopics[0].expires_at).getTime() > Date.now(), 'Expires at refreshed to 14 days in future');
  });

  test('3c: Clear All removes all custom topics, progress, and history without leaving ghosts', () => {
    const custom1 = { id: 'c1', title: 'Custom 1', is_custom: true };
    const custom2 = { id: 'c2', title: 'Custom 2', is_custom: true };

    let state = {
      customTopics: [custom1, custom2],
      topics: [custom1, custom2, ...INITIAL_TOPICS],
      userProgressMap: {
        [custom1.id]: { times_seen: 1, last_seen: new Date().toISOString() },
        [custom2.id]: { times_seen: 4, last_seen: new Date().toISOString() },
        [INITIAL_TOPICS[0].id]: { times_seen: 2, last_seen: new Date().toISOString() }
      },
      history: [
        { topic_id: custom1.id, title: custom1.title, action: 'spin', timestamp: new Date().toISOString() },
        { topic_id: custom2.id, title: custom2.title, action: 'spin', timestamp: new Date().toISOString() },
        { topic_id: INITIAL_TOPICS[0].id, title: INITIAL_TOPICS[0].title, action: 'spin', timestamp: new Date().toISOString() }
      ]
    };

    assert.strictEqual(selectExploredCount(state.userProgressMap), 3);

    const customIds = state.customTopics.map(t => t.id);
    state.customTopics = [];
    state.topics = state.topics.filter(t => !t.is_custom);
    const { progressMap, history } = removeCustomTopicRecords(state.userProgressMap, state.history, customIds);
    state.userProgressMap = progressMap;
    state.history = history;

    assert.strictEqual(selectExploredCount(state.userProgressMap), 1, 'Explored count only has built-in topic');
    assert.strictEqual(state.history.length, 1, 'History only has built-in topic');
    assert.strictEqual(state.history[0].topic_id, INITIAL_TOPICS[0].id);
    assert.strictEqual(state.userProgressMap[custom1.id], undefined, 'No ghost for custom1');
    assert.strictEqual(state.userProgressMap[custom2.id], undefined, 'No ghost for custom2');
  });

  test('Round 11.2 Item 2 & 3: synthetic_ghost_backup.json repair with hard asserts and pre-computed hand counts', () => {
    /**
     * Hand-computed expected counts before running repair:
     * ----------------------------------------------------
     * Initial input counts in fixture:
     * - Initial user_progress records = 2:
     *     (c) "mixture-of-experts-moe" (times_seen: 2, learned: false, NO history entry)
     *     (d) "consistent-custom-note-1" (times_seen: 3, learned: true)
     * - Initial history entries = 3:
     *     (a) "multi-head-self-attention" (in INITIAL_TOPICS catalog, NO progress record)
     *     (b) "ghost-topic-id-that-exists-nowhere-99999" (exists nowhere in catalog)
     *     (d) "consistent-custom-note-1" (valid custom topic)
     * - Initial custom_topics = 1 ("consistent-custom-note-1")
     *
     * Invariants to verify post-repair:
     * - (a) gets a progress record created (times_seen: 1, last_seen: '2026-10-08T10:00:00.000Z'), history kept
     * - (b) dropped from history and does NOT create progress or raise explored count
     * - (c) progress record is kept unchanged (times_seen: 2, learned: false)
     * - (d) unchanged in progress and history (times_seen: 3, learned: true)
     *
     * Expected post-repair exact values:
     * - repairedCount = 1 ((a) multi-head-self-attention)
     * - droppedHistoryCount = 1 ((b) ghost-topic-id-that-exists-nowhere-99999)
     * - progressMap size = 3 ((a), (c), (d))
     * - selectExploredCount(repairedProgress) = 3
     * - history length = 2 ((a), (d))
     * - selectLearnedCount(repairedProgress) = 1 ((d))
     */

    const raw = fs.readFileSync('tests/fixtures/synthetic_ghost_backup.json', 'utf8');
    const backup = JSON.parse(raw);

    const rawProgress = backup.user_progress || {};
    const rawHistory = backup.history || [];
    const customTopics = backup.custom_topics || [];
    const topicCatalog = [...customTopics, ...INITIAL_TOPICS];

    // Initial state verification
    assert.strictEqual(Object.keys(rawProgress).length, 2, 'Initial progress has exactly 2 records');
    assert.strictEqual(rawHistory.length, 3, 'Initial history has exactly 3 records');
    assert.strictEqual(rawProgress['multi-head-self-attention'], undefined, '(a) has no progress record initially');
    assert.strictEqual(rawProgress['ghost-topic-id-that-exists-nowhere-99999'], undefined, '(b) does not exist');
    assert.ok(rawProgress['mixture-of-experts-moe'], '(c) has progress record initially');
    assert.ok(!rawHistory.some(h => h.topic_id === 'mixture-of-experts-moe'), '(c) has no history entry initially');
    assert.ok(rawProgress['consistent-custom-note-1'], '(d) has progress record initially');

    // Perform repair
    const result1 = repairProgressFromHistory(rawProgress, rawHistory, topicCatalog);
    const repairedProgress = result1.progressMap;
    const validHistory = result1.history;

    // Hard assert (a): gets a progress record created from history
    assert.ok(repairedProgress['multi-head-self-attention'], '(a) gets a progress record');
    assert.strictEqual(repairedProgress['multi-head-self-attention'].times_seen, 1, '(a) times_seen is 1');
    assert.strictEqual(repairedProgress['multi-head-self-attention'].last_seen, '2026-10-08T10:00:00.000Z', '(a) last_seen preserved from history');
    assert.ok(validHistory.some(h => h.topic_id === 'multi-head-self-attention'), '(a) history entry is preserved');

    // Hard assert (b): unknown id is dropped from history and does not raise explored count
    assert.strictEqual(repairedProgress['ghost-topic-id-that-exists-nowhere-99999'], undefined, '(b) no progress record created for unknown id');
    assert.strictEqual(validHistory.some(h => h.topic_id === 'ghost-topic-id-that-exists-nowhere-99999'), false, '(b) dropped from history');

    // Hard assert (c): progress record with no history is kept
    assert.ok(repairedProgress['mixture-of-experts-moe'], '(c) progress record is kept');
    assert.strictEqual(repairedProgress['mixture-of-experts-moe'].times_seen, 2, '(c) times_seen kept intact');
    assert.strictEqual(repairedProgress['mixture-of-experts-moe'].learned, false, '(c) learned kept intact');

    // Hard assert (d): consistent topic is unchanged
    assert.ok(repairedProgress['consistent-custom-note-1'], '(d) consistent topic progress kept');
    assert.strictEqual(repairedProgress['consistent-custom-note-1'].times_seen, 3, '(d) times_seen is 3');
    assert.strictEqual(repairedProgress['consistent-custom-note-1'].learned, true, '(d) learned is true');
    assert.ok(validHistory.some(h => h.topic_id === 'consistent-custom-note-1'), '(d) history kept');

    // Verify aggregate counts against hand-computed expectations
    assert.strictEqual(result1.repairedCount, 1, 'repairedCount === 1');
    assert.strictEqual(result1.droppedHistoryCount, 1, 'droppedHistoryCount === 1');
    assert.strictEqual(Object.keys(repairedProgress).length, 3, 'progressMap keys count === 3');
    assert.strictEqual(selectExploredCount(repairedProgress), 3, 'Explored count === 3');
    assert.strictEqual(validHistory.length, 2, 'History length === 2');
    assert.strictEqual(selectLearnedCount(repairedProgress), 1, 'Learned count === 1');

    // Idempotent: running twice deep-equals running once
    const result2 = repairProgressFromHistory(repairedProgress, validHistory, topicCatalog);
    assert.deepStrictEqual(result2.progressMap, repairedProgress, 'Idempotent progressMap: run 2 equals run 1');
    assert.deepStrictEqual(result2.history, validHistory, 'Idempotent history: run 2 equals run 1');
    assert.strictEqual(result2.repairedCount, 0, 'Second run repairedCount === 0');
    assert.strictEqual(result2.droppedHistoryCount, 0, 'Second run droppedHistoryCount === 0');

    // Consistent data: deep-equal before and after
    const consistentState = {
      progressMap: {
        'consistent-topic-1': { times_seen: 2, last_seen: '2026-10-10T12:00:00.000Z', learned: false },
        'consistent-topic-2': { times_seen: 1, last_seen: '2026-10-10T14:00:00.000Z', learned: true }
      },
      history: [
        { topic_id: 'consistent-topic-1', action: 'spin', timestamp: '2026-10-10T12:00:00.000Z' },
        { topic_id: 'consistent-topic-2', action: 'spin', timestamp: '2026-10-10T14:00:00.000Z' }
      ]
    };
    const consistentResult = repairProgressFromHistory(
      consistentState.progressMap,
      consistentState.history,
      ['consistent-topic-1', 'consistent-topic-2']
    );
    assert.deepStrictEqual(consistentResult.progressMap, consistentState.progressMap, 'Consistent progressMap deep-equals input');
    assert.deepStrictEqual(consistentResult.history, consistentState.history, 'Consistent history deep-equals input');
    assert.strictEqual(consistentResult.repairedCount, 0);
    assert.strictEqual(consistentResult.droppedHistoryCount, 0);
  });

  test('Round 11.2 Item 5: SCHEMA_VERSION constant and v1, v2, v3 backups import without error', () => {
    assert.strictEqual(SCHEMA_VERSION, 3, 'SCHEMA_VERSION constant is 3');

    // v1 backup: Legacy format (no schemaVersion field)
    const v1Backup = {
      version: '1.0.0',
      exported_at: '2026-08-01T12:00:00.000Z',
      user_progress: {
        'multi-head-self-attention': { times_seen: 2, last_seen: '2026-08-01T12:00:00.000Z' }
      },
      history: [
        { topic_id: 'multi-head-self-attention', action: 'spin', timestamp: '2026-08-01T12:00:00.000Z' }
      ]
    };

    // v2 backup: Schema v2 format
    const v2Backup = {
      schemaVersion: 2,
      version: '2.0.0',
      exported_at: '2026-09-01T12:00:00.000Z',
      user_progress: {
        'mixture-of-experts-moe': { times_seen: 4, last_seen: '2026-09-01T12:00:00.000Z', learned: true }
      },
      history: [
        { topic_id: 'mixture-of-experts-moe', action: 'spin', timestamp: '2026-09-01T12:00:00.000Z' }
      ],
      user_streaks: { current_streak: 3, longest_streak: 5 }
    };

    // v3 backup: Current format
    const v3Backup = {
      schemaVersion: SCHEMA_VERSION,
      version: '3.0.0',
      exported_at: '2026-10-10T12:00:00.000Z',
      user_progress: {
        'multi-head-self-attention': { times_seen: 1, last_seen: '2026-10-10T12:00:00.000Z', learned: false }
      },
      history: [
        { topic_id: 'multi-head-self-attention', action: 'spin', timestamp: '2026-10-10T12:00:00.000Z' }
      ],
      custom_topics: [],
      expired_custom_topics: []
    };

    // Simulate import processing for all three
    for (const [label, b] of [['v1', v1Backup], ['v2', v2Backup], ['v3', v3Backup]]) {
      const repaired = repairProgressFromHistory(b.user_progress, b.history, INITIAL_TOPICS);
      assert.ok(repaired.progressMap, `${label} backup imports with valid progressMap`);
      assert.ok(repaired.history, `${label} backup imports with valid history`);
      assert.ok(selectExploredCount(repaired.progressMap) >= 1, `${label} backup explored count >= 1`);
    }
  });

  test('Round 11.2 Item 6: restoreCustomTopicRecords pure function behavior', () => {
    const deletedTopic = {
      id: 'deleted_note_pure_test',
      title: 'Deleted Note Pure Test',
      group: 'custom',
      category: 'custom-notes',
      lifecycle: 'temporary',
      expires_at: '2026-10-01T00:00:00.000Z'
    };
    const deletedProgress = { times_seen: 5, last_seen: '2026-10-01T00:00:00.000Z', learned: true };
    const deletedHistory = [{ id: 'h1', topic_id: deletedTopic.id, action: 'spin', timestamp: '2026-10-01T00:00:00.000Z' }];

    const result = restoreCustomTopicRecords({
      customTopics: [],
      topics: [...INITIAL_TOPICS],
      userProgressMap: {},
      history: [],
      deletedTopic,
      deletedProgress,
      deletedHistory
    });

    assert.strictEqual(result.customTopics.length, 1, 'Restored customTopics has 1 topic');
    assert.strictEqual(result.customTopics[0].id, deletedTopic.id);
    assert.strictEqual(result.topics.some(t => t.id === deletedTopic.id), true, 'Topic added to active topics');
    assert.deepStrictEqual(result.userProgressMap[deletedTopic.id], deletedProgress, 'Progress restored exactly');
    assert.strictEqual(result.history.length, 1, 'History restored exactly');
    assert.strictEqual(result.history[0].topic_id, deletedTopic.id);
  });

  test('Round 11.2 Item 7: Explored count (5) vs Review Queue (1) when explored topics live in unloaded group', () => {
    /**
     * Explanation:
     * - selectExploredCount(userProgressMap) counts ALL keys in userProgressMap with times_seen >= 1.
     *   Here, 5 topics have been explored across different category groups.
     * - selectReviewQueue(topics, userProgressMap, limit) filters the provided `topics` array against
     *   userProgressMap and returns topic OBJECTS sorted by last_seen ascending.
     * - If only 1 of the 5 explored topics is currently loaded in `topics` (e.g. initial chunk or single group),
     *   selectReviewQueue returns that 1 renderable topic object.
     * - This design guarantees that the UI always receives full topic metadata for rendering queue cards
     *   without crashing or displaying blank cards, while lifetime explored count remains strictly preserved.
     */
    const loadedTopics = [
      { id: 'tech-topic-1', title: 'Tech Topic 1', category: 'ai-ml', group: 'tech' }
    ];

    // User progress has 5 explored topics (1 loaded, 4 in unloaded groups like money-career or philosophy)
    const userProgressMap = {
      'tech-topic-1': { times_seen: 2, last_seen: '2026-10-01T10:00:00.000Z' },
      'unloaded-money-topic-1': { times_seen: 1, last_seen: '2026-10-02T10:00:00.000Z' },
      'unloaded-money-topic-2': { times_seen: 3, last_seen: '2026-10-03T10:00:00.000Z' },
      'unloaded-mind-topic-1': { times_seen: 1, last_seen: '2026-10-04T10:00:00.000Z' },
      'unloaded-world-topic-1': { times_seen: 2, last_seen: '2026-10-05T10:00:00.000Z' }
    };

    const exploredCount = selectExploredCount(userProgressMap);
    const reviewQueue = selectReviewQueue(loadedTopics, userProgressMap, 4);

    assert.strictEqual(exploredCount, 5, 'Explored count correctly reflects all 5 explored topics across all groups');
    assert.strictEqual(reviewQueue.length, 1, 'Review queue only returns the 1 topic present in loadedTopics pool');
    assert.strictEqual(reviewQueue[0].id, 'tech-topic-1', 'Queue item has complete metadata');
    assert.ok(reviewQueue[0].title, 'Queue card has title for UI rendering');
  });

  test('Round 11.3 Item 3: repair against all curated topic IDs when only starter topics are loaded', () => {
    // Four topics in curated catalog (one from each group), none in starterTopics:
    // Tech: 'residual-connections-resnet'
    // Money: 'dividend-policy-vs-share-buybacks'
    // Mind: 'monroe-motivated-sequence-persuasive-speech'
    // World: 'central-dogma-molecular-biology'
    const curatedNonStarterTopics = [
      { id: 'residual-connections-resnet', group: 'tech' },
      { id: 'dividend-policy-vs-share-buybacks', group: 'money-career' },
      { id: 'monroe-motivated-sequence-persuasive-speech', group: 'mind-growth' },
      { id: 'central-dogma-molecular-biology', group: 'world-ideas' }
    ];

    // Ensure none of these 4 are in starter set
    const starterIdSet = new Set(INITIAL_TOPICS.map(t => t.id));
    for (const t of curatedNonStarterTopics) {
      assert.strictEqual(starterIdSet.has(t.id), false, `${t.id} must not be in starterTopics`);
    }

    const initialHistory = [
      { id: 'h-tech', topic_id: 'residual-connections-resnet', action: 'spin', timestamp: '2026-10-01T10:00:00.000Z' },
      { id: 'h-money', topic_id: 'dividend-policy-vs-share-buybacks', action: 'spin', timestamp: '2026-10-02T10:00:00.000Z' },
      { id: 'h-mind', topic_id: 'monroe-motivated-sequence-persuasive-speech', action: 'spin', timestamp: '2026-10-03T10:00:00.000Z' },
      { id: 'h-world', topic_id: 'central-dogma-molecular-biology', action: 'spin', timestamp: '2026-10-04T10:00:00.000Z' },
      { id: 'h-unknown', topic_id: 'unknown-ghost-topic-id-xyz-99999', action: 'spin', timestamp: '2026-10-05T10:00:00.000Z' }
    ];

    const initialProgress = {};

    // Run repair with empty custom topics (only starter topics loaded in memory)
    const { progressMap: repairedProgress, history: repairedHistory, repairedCount, droppedHistoryCount } = repairProgressFromHistory(
      initialProgress,
      initialHistory,
      []
    );

    // All 4 curated non-starter topics must be kept in history and given a progress record
    for (const t of curatedNonStarterTopics) {
      assert.ok(repairedProgress[t.id], `Progress record must be created for curated non-starter topic ${t.id}`);
      assert.strictEqual(repairedProgress[t.id].times_seen, 1, `times_seen must be 1 for ${t.id}`);
      assert.ok(repairedHistory.some(h => h.topic_id === t.id), `History entry must be kept for ${t.id}`);
    }

    // Unknown id must be dropped
    assert.strictEqual(repairedProgress['unknown-ghost-topic-id-xyz-99999'], undefined, 'No progress for unknown id');
    assert.strictEqual(repairedHistory.some(h => h.topic_id === 'unknown-ghost-topic-id-xyz-99999'), false, 'Unknown id dropped from history');

    assert.strictEqual(repairedCount, 4, 'Exactly 4 progress records repaired');
    assert.strictEqual(droppedHistoryCount, 1, 'Exactly 1 unknown history entry dropped');
    assert.strictEqual(repairedHistory.length, 4, 'History length is 4');
    assert.strictEqual(selectExploredCount(repairedProgress), 4, 'Explored count is 4');
  });

  test('Round 11.3 Item 4: Data safety pre-repair backup saved once and unchanged on second load', () => {
    localStorage.clear();

    const unrepairedProgress = {};
    const unrepairedHistory = [
      { id: 'h-tech', topic_id: 'residual-connections-resnet', action: 'spin', timestamp: '2026-10-01T10:00:00.000Z' },
      { id: 'h-ghost', topic_id: 'nonexistent-ghost-topic-id', action: 'spin', timestamp: '2026-10-02T10:00:00.000Z' }
    ];

    // Seed localStorage
    localStorage.setItem('daily_dive_guest_progress', JSON.stringify(unrepairedProgress));
    localStorage.setItem('daily_dive_history', JSON.stringify(unrepairedHistory));

    // Simulate first load
    let currentProgress = JSON.parse(localStorage.getItem('daily_dive_guest_progress') || '{}');
    let currentHistory = JSON.parse(localStorage.getItem('daily_dive_history') || '[]');

    const {
      progressMap: load1Progress,
      history: load1History,
      repairedCount: load1Repairs,
      droppedHistoryCount: load1Drops
    } = repairProgressFromHistory(currentProgress, currentHistory, []);

    if (load1Repairs > 0 || load1Drops > 0) {
      const backupSaved = savePreRepairBackup(localStorage, currentProgress, currentHistory, '2026-10-10T12:00:00.000Z');
      assert.strictEqual(backupSaved, true, 'Backup must be successfully saved on first repair');
      localStorage.setItem('daily_dive_guest_progress', JSON.stringify(load1Progress));
      localStorage.setItem('daily_dive_history', JSON.stringify(load1History));
    }

    // Verify key exists after repair
    const preRepairRaw = localStorage.getItem(PRE_REPAIR_BACKUP_KEY);
    assert.ok(preRepairRaw, `${PRE_REPAIR_BACKUP_KEY} must exist in localStorage`);
    const preRepairObj = JSON.parse(preRepairRaw);
    assert.deepStrictEqual(preRepairObj.user_progress, unrepairedProgress, 'Backup contains original unrepaired progress');
    assert.deepStrictEqual(preRepairObj.history, unrepairedHistory, 'Backup contains original unrepaired history');
    assert.strictEqual(preRepairObj.backed_up_at, '2026-10-10T12:00:00.000Z');

    // Simulate second load
    let currentProgress2 = JSON.parse(localStorage.getItem('daily_dive_guest_progress') || '{}');
    let currentHistory2 = JSON.parse(localStorage.getItem('daily_dive_history') || '[]');

    const {
      progressMap: load2Progress,
      history: load2History,
      repairedCount: load2Repairs,
      droppedHistoryCount: load2Drops
    } = repairProgressFromHistory(currentProgress2, currentHistory2, []);

    if (load2Repairs > 0 || load2Drops > 0) {
      const backupSaved2 = savePreRepairBackup(localStorage, currentProgress2, currentHistory2, '2026-10-10T13:00:00.000Z');
      assert.strictEqual(backupSaved2, false, 'Backup must NOT be overwritten on second repair');
      localStorage.setItem('daily_dive_guest_progress', JSON.stringify(load2Progress));
      localStorage.setItem('daily_dive_history', JSON.stringify(load2History));
    }

    // Verify key is unchanged after second load
    const preRepairRawAfterSecondLoad = localStorage.getItem(PRE_REPAIR_BACKUP_KEY);
    assert.strictEqual(preRepairRawAfterSecondLoad, preRepairRaw, 'pre_repair_backup is strictly unchanged after second load');
    assert.strictEqual(load2Repairs, 0, 'Zero repairs on second load');
    assert.strictEqual(load2Drops, 0, 'Zero drops on second load');
  });

  test('Round 11.3 Item 4b: clearAllLocalData removes daily_dive_pre_repair_backup and all app keys', () => {
    localStorage.clear();

    // Populate all known storage keys
    STORAGE_KEYS_TO_CLEAR.forEach((key, idx) => {
      localStorage.setItem(key, JSON.stringify({ index: idx, key }));
    });

    // Verify all keys exist
    STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      assert.ok(localStorage.getItem(key), `${key} must exist before clear`);
    });

    // Execute clear
    clearAllLocalData(localStorage);

    // Verify all keys are completely removed, including PRE_REPAIR_BACKUP_KEY
    STORAGE_KEYS_TO_CLEAR.forEach((key) => {
      assert.strictEqual(localStorage.getItem(key), null, `${key} must be removed after clear`);
    });
    assert.strictEqual(localStorage.getItem(PRE_REPAIR_BACKUP_KEY), null, 'Pre-repair backup must be deleted');
  });

  test('Real Data: Import evidence/real-backup.json and verify repair on import / load', () => {
    if (!fs.existsSync('evidence/real-backup.json')) {
      console.log('NOT RUN: no real backup');
      return;
    }

    const raw = fs.readFileSync('evidence/real-backup.json', 'utf8');
    const backup = JSON.parse(raw);

    const rawProgress = backup.user_progress || {};
    const rawHistory = backup.history || [];
    const customTopics = backup.custom_topics || [];
    const topics = [...customTopics, ...INITIAL_TOPICS];

    // Apply real repair on import / load
    const { progressMap: repairedProgress, history: validHistory, repairedCount, droppedHistoryCount } = repairProgressFromHistory(
      rawProgress,
      rawHistory,
      topics
    );

    const exploredCount = selectExploredCount(repairedProgress);
    const historyLength = validHistory.length;
    const queue = selectReviewQueue(topics, repairedProgress, 4);
    const queueIds = queue.map(t => t.id);
    const totalDives = selectTotalSpins({ userProgressMap: repairedProgress, history: validHistory });

    const historyIdsWithNoProgressAfter = validHistory
      .map(h => h.topic_id)
      .filter(id => !repairedProgress[id] || Number(repairedProgress[id].times_seen) < 1);

    const historyTopicIdSet = new Set(validHistory.map(h => h.topic_id));
    const queueIdsWithNoHistory = queueIds.filter(id => !historyTopicIdSet.has(id));

    console.log('\n--- REAL BACKUP IMPORT AUDIT METRICS ---');
    console.log(`explored count:                       ${exploredCount}`);
    console.log(`history length:                       ${historyLength}`);
    console.log(`queue ids:                            ${JSON.stringify(queueIds)}`);
    console.log(`total dives:                          ${totalDives}`);
    console.log(`history ids with no progress record:  ${JSON.stringify(historyIdsWithNoProgressAfter)}`);
    console.log(`queue ids with no history entry:      ${JSON.stringify(queueIdsWithNoHistory)}`);
    console.log(`repaired count from history:          ${repairedCount}`);
    console.log(`dropped history count:                ${droppedHistoryCount}`);
    console.log('----------------------------------------\n');

    assert.strictEqual(historyIdsWithNoProgressAfter.length, 0, 'All valid history entries must have a progress record after repair');
    assert.ok(exploredCount >= 1, 'Explored count must reflect all explored topics');
    assert.ok(totalDives >= historyLength, 'Total dives must be >= history length');
  });
});
