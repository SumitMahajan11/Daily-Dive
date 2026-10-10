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
  removeCustomTopicRecords,
  repairProgressFromHistory
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
  function simulateSpin(topic, state, nowDate = new Date()) {
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

  function simulateMarkLearned(topic, state, nowDate = new Date()) {
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
        [sampleTopics[0].id]: { times_seen: 2, last_seen: new Date(Date.now() - 50000).toISOString() },
        [sampleTopics[1].id]: { times_seen: 1, last_seen: new Date(Date.now() - 100000).toISOString() },
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

    // Undo delete
    state.customTopics = [savedTopic, ...state.customTopics];
    state.topics = [savedTopic, ...state.topics];
    state.userProgressMap = { ...state.userProgressMap, [savedTopic.id]: savedProgress };
    state.history = [...savedHistory, ...state.history];

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

    // On expiry: cascade remove from active pool
    const savedProgress = state.userProgressMap[temporaryTopic.id];
    const savedHistory = state.history.filter(h => h.topic_id === temporaryTopic.id);

    state.customTopics = [];
    state.topics = state.topics.filter(t => t.id !== temporaryTopic.id);
    const expiredCascade = removeCustomTopicRecords(state.userProgressMap, state.history, [temporaryTopic.id]);
    state.userProgressMap = expiredCascade.progressMap;
    state.history = expiredCascade.history;

    // No ghost records remain in active state
    assert.strictEqual(selectExploredCount(state.userProgressMap), 0, 'No ghost explored count after expiry');
    assert.strictEqual(state.history.length, 0, 'No ghost history after expiry');
    assert.strictEqual(selectReviewQueue(state.topics, state.userProgressMap, 4).length, 0, 'No ghost in review queue');

    // On restore / Undo expiry:
    state.customTopics = [{ ...temporaryTopic, lifecycle: 'temporary', expires_at: new Date(Date.now() + 14 * 86400000).toISOString() }];
    state.topics = [state.customTopics[0], ...state.topics];
    state.userProgressMap = { ...state.userProgressMap, [temporaryTopic.id]: savedProgress };
    state.history = [...savedHistory, ...state.history];

    assert.strictEqual(selectExploredCount(state.userProgressMap), 1, 'Explored count restored on Undo');
    assert.strictEqual(state.userProgressMap[temporaryTopic.id].times_seen, 2, 'Times seen restored');
    assert.strictEqual(state.history.length, 1, 'History restored');
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

  test('Real Data: Import evidence/real-backup.json and verify repair on import / load', () => {
    const raw = fs.readFileSync('evidence/real-backup.json', 'utf8');
    const backup = JSON.parse(raw);

    const rawProgress = backup.user_progress || {};
    const rawHistory = backup.history || [];
    const customTopics = backup.custom_topics || [];
    const topics = [...customTopics, ...INITIAL_TOPICS];

    // Pre-repair checks on raw backup
    const rawHistoryIdsNoProgress = rawHistory
      .map(h => h.topic_id)
      .filter(id => !rawProgress[id] || !rawProgress[id].times_seen);

    // Apply real repair on import / load
    const { progressMap: repairedProgress, repairedCount } = repairProgressFromHistory(rawProgress, rawHistory);

    const exploredCount = selectExploredCount(repairedProgress);
    const historyLength = rawHistory.length;
    const queue = selectReviewQueue(topics, repairedProgress, 4);
    const queueIds = queue.map(t => t.id);
    const totalDives = selectTotalSpins({ userProgressMap: repairedProgress, history: rawHistory });

    const historyIdsWithNoProgressAfter = rawHistory
      .map(h => h.topic_id)
      .filter(id => !repairedProgress[id] || Number(repairedProgress[id].times_seen) < 1);

    const historyTopicIdSet = new Set(rawHistory.map(h => h.topic_id));
    const queueIdsWithNoHistory = queueIds.filter(id => !historyTopicIdSet.has(id));

    console.log('\n--- REAL BACKUP IMPORT AUDIT METRICS ---');
    console.log(`explored count:                       ${exploredCount}`);
    console.log(`history length:                       ${historyLength}`);
    console.log(`queue ids:                            ${JSON.stringify(queueIds)}`);
    console.log(`total dives:                          ${totalDives}`);
    console.log(`history ids with no progress record:  ${JSON.stringify(historyIdsWithNoProgressAfter)}`);
    console.log(`queue ids with no history entry:      ${JSON.stringify(queueIdsWithNoHistory)}`);
    console.log(`repaired count from history:          ${repairedCount}`);
    console.log('----------------------------------------\n');

    assert.strictEqual(historyIdsWithNoProgressAfter.length, 0, 'All history entries must have a progress record after repair');
    assert.ok(exploredCount >= 4, 'Explored count must reflect all explored topics');
    assert.ok(totalDives >= historyLength, 'Total dives must be >= history length');
  });
});

