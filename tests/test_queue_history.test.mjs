import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
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

  function simulateDeleteCustomTopic(topicId, state) {
    state.customTopics = (state.customTopics || []).filter(t => t.id !== topicId);
    state.topics = (state.topics || []).filter(t => t.id !== topicId);
    if (state.userProgressMap && state.userProgressMap[topicId]) {
      const nextMap = { ...state.userProgressMap };
      delete nextMap[topicId];
      state.userProgressMap = nextMap;
    }
    if (state.history) {
      state.history = state.history.filter(h => h.topic_id !== topicId);
    }
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
    
    // Delete custom topic using simulated real operation
    simulateDeleteCustomTopic(customTopic.id, state);

    const exploredAfter = selectExploredCount(state.userProgressMap);
    const queueAfter = selectReviewQueue(state.topics, state.userProgressMap, 4);
    const historyAfter = selectFilteredHistory(state.history, 'all', state.userProgressMap);

    assert.strictEqual(exploredAfter, 1, 'Explored count must decrease by 1 when custom topic is deleted');
    assert.strictEqual(queueAfter.some(t => t.id === customTopic.id), false, 'Deleted topic must not appear in review queue');
    assert.strictEqual(historyAfter.some(h => h.topic_id === customTopic.id), false, 'Deleted topic must not appear in history');
  });
});
