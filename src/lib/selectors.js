/**
 * Single Source of Truth Selectors for Daily Dive
 * 
 * All progress, streak, queue, and filter derivations are defined here.
 * UI components and tests MUST import from this file.
 */

import {
  getLocalCalendarDate,
  reconcileStreakWithActivity,
  isTopicEligible
} from './roulette.js';

/**
 * Total Dives represents the lifetime cumulative count of all topic spin and study events recorded on this device.
 * Because rolling history is capped at 150 entries / 60 days, Total Dives derives from persistent per-topic times_seen in user_progress so pruning never reduces the total.
 */
export function selectTotalSpins({ userProgressMap = {}, history = [] } = {}) {
  const progressSpins = Object.values(userProgressMap || {}).reduce((sum, p) => {
    return sum + (Number(p?.times_seen) || 0);
  }, 0);
  const historySpins = (history || []).filter(h => h && (h.action === 'spin' || !h.action)).length;
  return Math.max(progressSpins, historySpins);
}

/**
 * Derives total unique topics explored.
 * Derived strictly from persistent userProgressMap, NOT the capped history log.
 * Explored count NEVER decreases when history is pruned or cleared.
 */
export function selectExploredCount(userProgressMap = {}) {
  if (!userProgressMap || typeof userProgressMap !== 'object') return 0;
  return Object.keys(userProgressMap).filter(id => {
    const p = userProgressMap[id];
    return p && ((Number(p.times_seen) > 0) || Boolean(p.last_seen) || Boolean(p.learned));
  }).length;
}

/**
 * Derives total topics marked as learned.
 */
export function selectLearnedCount(userProgressMap = {}) {
  if (!userProgressMap || typeof userProgressMap !== 'object') return 0;
  return Object.keys(userProgressMap).filter(id => Boolean(userProgressMap[id]?.learned)).length;
}

/**
 * Derives the Spaced Repetition Review Queue (oldest seen first).
 * Derived strictly from persistent per-topic userProgressMap so topics remain
 * reviewable even if their history entries have been pruned (>60 days or >150 entries).
 */
export function selectReviewQueue(topics = [], userProgressMap = {}, limit = 4, nowDate = new Date()) {
  if (!Array.isArray(topics) || !userProgressMap || typeof userProgressMap !== 'object') {
    return [];
  }

  const todayStr = getLocalCalendarDate(nowDate);

  const seenTopicIds = new Set(
    Object.keys(userProgressMap).filter(id => {
      const p = userProgressMap[id];
      if (!p) return false;
      const hasSeen = (Number(p.times_seen) > 0) || Boolean(p.last_seen) || Boolean(p.learned);
      if (!hasSeen || !p.last_seen) return false;
      try {
        const lastSeenDateStr = getLocalCalendarDate(new Date(p.last_seen));
        return lastSeenDateStr < todayStr;
      } catch (e) {
        return false;
      }
    })
  );

  const effectiveLimit = (limit === null || limit === undefined) ? 4 : limit;

  return topics
    .filter(t => t && seenTopicIds.has(t.id))
    .sort((a, b) => {
      const aTime = new Date(userProgressMap[a.id]?.last_seen || 0).getTime();
      const bTime = new Date(userProgressMap[b.id]?.last_seen || 0).getTime();
      return aTime - bTime;
    })
    .slice(0, effectiveLimit);
}

/**
 * Returns total count of review queue topics eligible to review today.
 */
export function selectReviewQueueCount(topics = [], userProgressMap = {}, nowDate = new Date()) {
  return selectReviewQueue(topics, userProgressMap, Infinity, nowDate).length;
}

/**
 * Reconciles user streak records with actual activity dates across history,
 * persistent topic progress, and streak metadata.
 * Computes current streak, longest (best) streak, active today status, and 7-day activity strip.
 */
export function selectStreakMetrics({
  userStreaks = {},
  history = [],
  userProgressMap = {},
  nowDate = new Date()
} = {}) {
  const activeDates = new Set();

  (history || []).forEach(h => {
    if (h?.local_date) {
      activeDates.add(h.local_date);
    } else if (h?.timestamp) {
      try {
        activeDates.add(getLocalCalendarDate(new Date(h.timestamp)));
      } catch (e) {}
    }
  });

  Object.values(userProgressMap || {}).forEach(p => {
    if (p?.last_seen) {
      try {
        activeDates.add(getLocalCalendarDate(new Date(p.last_seen)));
      } catch (e) {}
    }
  });

  if (userStreaks?.last_active_date) {
    activeDates.add(userStreaks.last_active_date);
  }

  const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayStr = getLocalCalendarDate(nowDate);
  const streakDays = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowDate);
    d.setDate(nowDate.getDate() - i);
    const dateStr = getLocalCalendarDate(d);
    const isToday = dateStr === todayStr;
    const hasActivity = activeDates.has(dateStr);

    streakDays.push({
      dateStr,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday,
      hasActivity
    });
  }

  const reconciled = reconcileStreakWithActivity(userStreaks, activeDates, nowDate);

  return {
    current_streak: reconciled.current_streak || 0,
    longest_streak: reconciled.longest_streak || 0,
    is_active_today: Boolean(reconciled.is_active_today),
    last_active_date: reconciled.last_active_date || null,
    activeDates: Array.from(activeDates),
    streakDays
  };
}

/**
 * Returns the best (longest) streak.
 */
export function selectBestStreak(params) {
  return selectStreakMetrics(params).longest_streak;
}

/**
 * Returns the current active streak.
 */
export function selectCurrentStreak(params) {
  return selectStreakMetrics(params).current_streak;
}

/**
 * Derives filtered history entries for display.
 */
export function selectFilteredHistory(history = [], filter = 'all', userProgressMap = {}, nowDate = new Date()) {
  if (!Array.isArray(history)) return [];
  const todayStr = getLocalCalendarDate(nowDate);
  const weekAgoMs = nowDate.getTime() - (7 * 86400000);

  return history.filter(item => {
    if (!item) return false;
    if (filter === 'today') {
      return item.local_date === todayStr || (item.timestamp && getLocalCalendarDate(new Date(item.timestamp)) === todayStr);
    }
    if (filter === 'week') {
      const itemTime = new Date(item.timestamp).getTime();
      return !isNaN(itemTime) && itemTime >= weekAgoMs;
    }
    if (filter === 'learned') {
      return item.action === 'learned' || Boolean(userProgressMap?.[item.topic_id]?.learned);
    }
    return true;
  });
}

/**
 * Derives eligible topics matching user's enabled categories.
 */
export function selectEligibleTopics(topics = [], enabledCategories = {}) {
  if (!Array.isArray(topics)) return [];
  return topics.filter(t => isTopicEligible(t, enabledCategories));
}
