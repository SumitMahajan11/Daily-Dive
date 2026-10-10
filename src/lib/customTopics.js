/**
 * Custom Topics helper module for Daily Dive
 * 
 * Provides pure functions for cascading deletion, expiry management,
 * state restoration (Undo), and topic catalog repair invariants.
 */

import { INITIAL_TOPICS } from './roulette.js';

export const SCHEMA_VERSION = 3;

/**
 * Removes progress and history records associated with the given custom topic id(s).
 * 
 * @param {Object} progressMap - User progress map { [topicId]: { times_seen, last_seen, learned, ... } }
 * @param {Array} history - History entries array [ { topic_id, action, timestamp, ... } ]
 * @param {Array|Set|string} ids - One or more topic IDs to remove
 * @returns {{ progressMap: Object, history: Array }} Updated progressMap and history copies
 */
export function removeCustomTopicRecords(progressMap = {}, history = [], ids = []) {
  const idSet = new Set(
    Array.isArray(ids) ? ids : (ids instanceof Set ? Array.from(ids) : (ids ? [ids] : []))
  );

  const nextProgressMap = { ...(progressMap || {}) };
  idSet.forEach(id => {
    delete nextProgressMap[id];
  });

  const nextHistory = (history || []).filter(h => h && !idSet.has(h.topic_id));

  return {
    progressMap: nextProgressMap,
    history: nextHistory
  };
}

/**
 * Restores custom topics, progress, and history records from an undo snapshot or expired registry.
 * 
 * @param {Object} params
 * @param {Array} [params.customTopics] - Current custom topics list
 * @param {Array} [params.topics] - Current active topics list
 * @param {Object} [params.userProgressMap] - Current user progress map
 * @param {Array} [params.history] - Current history log
 * @param {Array} [params.topicsToRestore] - Array of expired or deleted topic objects (with optional _savedProgress, _savedHistory)
 * @param {Object} [params.deletedTopic] - Single deleted topic object
 * @param {Object} [params.deletedProgress] - Progress record for single deleted topic
 * @param {Array} [params.deletedHistory] - History entries for single deleted topic
 * @returns {{ customTopics: Array, topics: Array, userProgressMap: Object, history: Array, restoredTopics: Array }}
 */
export function restoreCustomTopicRecords({
  customTopics = [],
  topics = [],
  userProgressMap = {},
  history = [],
  topicsToRestore = [],
  deletedTopic = null,
  deletedProgress = null,
  deletedHistory = []
} = {}) {
  const list = [...(topicsToRestore || [])];
  if (deletedTopic && !list.some(t => t.id === deletedTopic.id)) {
    list.push({
      ...deletedTopic,
      _savedProgress: deletedProgress || null,
      _savedHistory: deletedHistory || []
    });
  }

  if (list.length === 0) {
    return {
      customTopics: [...customTopics],
      topics: [...topics],
      userProgressMap: { ...userProgressMap },
      history: [...history],
      restoredTopics: []
    };
  }

  const now = Date.now();
  const restored = list.map(t => {
    const { _savedProgress, _savedHistory, ...cleanTopic } = t;
    const isPermanent = cleanTopic.lifecycle === 'permanent';
    return {
      ...cleanTopic,
      lifecycle: cleanTopic.lifecycle || (cleanTopic.expires_at ? 'temporary' : 'permanent'),
      expires_at: isPermanent ? null : (cleanTopic.expires_at ? new Date(now + 14 * 86400000).toISOString() : null),
      expiry_rule: isPermanent ? null : '14_days',
      restored_at: new Date().toISOString()
    };
  });

  const nextCustomTopics = [...restored, ...customTopics.filter(p => !restored.some(r => r.id === p.id))];
  const nextTopics = [...restored, ...topics.filter(t => !restored.some(r => r.id === t.id))];

  const nextProgressMap = { ...(userProgressMap || {}) };
  list.forEach(t => {
    if (t._savedProgress) {
      nextProgressMap[t.id] = t._savedProgress;
    }
  });

  const restoredHistoryEntries = [];
  list.forEach(t => {
    if (Array.isArray(t._savedHistory)) {
      restoredHistoryEntries.push(...t._savedHistory);
    }
  });

  const nextHistory = [
    ...restoredHistoryEntries,
    ...(history || []).filter(h => !restoredHistoryEntries.some(rh => (rh.id && rh.id === h.id) || (rh.topic_id === h.topic_id && rh.timestamp === h.timestamp)))
  ];

  return {
    customTopics: nextCustomTopics,
    topics: nextTopics,
    userProgressMap: nextProgressMap,
    history: nextHistory,
    restoredTopics: restored
  };
}

/**
 * Repairs missing progress records from history entries.
 * - Creates a progress record ONLY for history IDs that exist in the topic catalog (curated plus custom).
 * - Drops history entries for unknown IDs that exist nowhere in the topic catalog or custom uploads.
 * - Preserves existing progress records that lack history entries.
 * - Is strictly idempotent and safe on consistent data.
 * 
 * @param {Object} progressMap - User progress map
 * @param {Array} history - History entries
 * @param {Array|Set|Object} [topicCatalog] - Available topics or known topic IDs (defaults to INITIAL_TOPICS)
 * @returns {{ progressMap: Object, history: Array, repairedCount: number, droppedHistoryCount: number }}
 */
export function repairProgressFromHistory(progressMap = {}, history = [], topicCatalog = []) {
  const nextProgress = { ...(progressMap || {}) };
  let repairedCount = 0;
  let droppedHistoryCount = 0;

  // Build lookup Set of valid topic catalog IDs
  const validIds = new Set();

  // Always include standard initial topics
  (INITIAL_TOPICS || []).forEach(t => {
    if (t && t.id) validIds.add(t.id);
  });

  // Add all items from supplied topic catalog (can be array of topic objects, array of string IDs, or Set)
  if (Array.isArray(topicCatalog)) {
    topicCatalog.forEach(t => {
      if (typeof t === 'string') validIds.add(t);
      else if (t && t.id) validIds.add(t.id);
    });
  } else if (topicCatalog instanceof Set) {
    topicCatalog.forEach(id => validIds.add(id));
  } else if (topicCatalog && typeof topicCatalog === 'object') {
    Object.keys(topicCatalog).forEach(id => validIds.add(id));
  }

  // Also include any topic ID that already has an existing valid progress record
  Object.keys(nextProgress).forEach(id => {
    if (id) validIds.add(id);
  });

  // 1. Normalize existing progress records
  Object.keys(nextProgress).forEach(id => {
    const entry = nextProgress[id];
    if (entry && typeof entry === 'object') {
      if (typeof entry.times_seen === 'undefined' || entry.times_seen === null) {
        nextProgress[id] = {
          ...entry,
          times_seen: (entry.learned || entry.last_seen) ? 1 : 0
        };
      }
    }
  });

  // 2. Validate and repair history entries
  const validHistory = [];
  if (Array.isArray(history)) {
    history.forEach(h => {
      if (!h || !h.topic_id) {
        droppedHistoryCount++;
        return;
      }

      if (!validIds.has(h.topic_id)) {
        // Unknown topic ID that exists nowhere in catalog or uploads -> drop history entry
        droppedHistoryCount++;
        return;
      }

      validHistory.push(h);

      // Create progress record if missing or 0 times_seen
      const current = nextProgress[h.topic_id];
      if (!current || !current.times_seen || current.times_seen === 0) {
        nextProgress[h.topic_id] = {
          ...(current || {}),
          times_seen: (current?.times_seen && current.times_seen > 0) ? current.times_seen : 1,
          last_seen: current?.last_seen || h.timestamp || h.completed_at || new Date().toISOString()
        };
        repairedCount++;
      }
    });
  }

  return {
    progressMap: nextProgress,
    history: validHistory,
    repairedCount,
    droppedHistoryCount
  };
}
