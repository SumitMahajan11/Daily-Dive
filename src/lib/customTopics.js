/**
 * Custom Topics helper module for Daily Dive
 * 
 * Provides pure functions for cascading deletion, expiry management,
 * and history-to-progress repair invariants.
 */

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
 * Repairs missing progress records from history entries.
 * Ensures every history entry with a topic_id has a corresponding progress record (times_seen >= 1).
 * 
 * @param {Object} progressMap - User progress map
 * @param {Array} history - History entries
 * @returns {{ progressMap: Object, repairedCount: number }} Repaired progress map and count of repairs
 */
export function repairProgressFromHistory(progressMap = {}, history = []) {
  const nextProgress = { ...(progressMap || {}) };
  let repairedCount = 0;

  // Normalize existing progress records
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

  // Repair missing or 0 times_seen progress for topic IDs in history
  if (Array.isArray(history)) {
    history.forEach(h => {
      if (h && h.topic_id) {
        const current = nextProgress[h.topic_id];
        if (!current || !current.times_seen || current.times_seen === 0) {
          nextProgress[h.topic_id] = {
            ...(current || {}),
            times_seen: (current?.times_seen && current.times_seen > 0) ? current.times_seen : 1,
            last_seen: current?.last_seen || h.timestamp || h.completed_at || new Date().toISOString()
          };
          repairedCount++;
        }
      }
    });
  }

  return { progressMap: nextProgress, repairedCount };
}
