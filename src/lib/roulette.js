/**
 * Pure functions for weighted random topic selection and streak calculations.
 */

import { COMPILED_TOPICS } from './compiledTopics.js';

export const INITIAL_TOPICS = COMPILED_TOPICS;

export const CATEGORY_TREE = [
  {
    group: "tech",
    label: "Tech",
    badge: "5 sub-categories · 313 topics",
    categories: [
      { name: "ai-ml", label: "AI & Machine Learning", topicsCount: 63, tags: ["Deep Learning", "Transformers", "NLP", "Computer Vision"] },
      { name: "cloud-infra", label: "Cloud & Infrastructure", topicsCount: 64, tags: ["Kubernetes", "Networking", "Security", "Distributed Systems"] },
      { name: "data-structures-algorithms", label: "Data Structures & Algorithms", topicsCount: 73, tags: ["Trees", "Algorithms", "Data Structures", "Graphs"] },
      { name: "systems-distributed-computing", label: "Systems & Distributed Computing", topicsCount: 57, tags: ["Replication", "Distributed Systems", "Sharding", "Kafka"] },
      { name: "web-dev", label: "Web Architecture & Performance", topicsCount: 56, tags: ["Performance", "JavaScript", "CSS", "Rendering"] }
    ]
  },
  {
    group: "money-career",
    label: "Money & Career",
    badge: "2 sub-categories · 113 topics",
    categories: [
      { name: "finance", label: "Finance & Wealth Strategy", topicsCount: 68, tags: ["Corporate Finance", "Personal Finance", "DeFi", "Tax Strategy"] },
      { name: "career-strategy", label: "Career Strategy & Leadership", topicsCount: 45, tags: ["Product Strategy", "Management", "Negotiation", "Growth"] }
    ]
  },
  {
    group: "mind-growth",
    label: "Mind & Growth",
    badge: "3 sub-categories · 176 topics",
    categories: [
      { name: "communication", label: "Communication & Rhetoric", topicsCount: 54, tags: ["Persuasion", "Cross-Cultural", "Public Speaking", "Negotiation"] },
      { name: "philosophy-critical-thinking", label: "Philosophy & Critical Thinking", topicsCount: 42, tags: ["Critical Thinking", "Epistemology", "Fallacies", "Ethics"] },
      { name: "psychology", label: "Psychology & Decision Making", topicsCount: 80, tags: ["Cognitive Biases", "Social Psychology", "Memory", "Decision Systems"] }
    ]
  },
  {
    group: "world-ideas",
    label: "World & Ideas",
    badge: "2 sub-categories · 90 topics",
    categories: [
      { name: "science-nature", label: "Science & Natural World", topicsCount: 45, tags: ["Physics", "Cosmology", "Biology", "Complexity"] },
      { name: "history-innovation", label: "History of Innovation", topicsCount: 45, tags: ["Civilization", "Computing", "Industrial", "Medicine"] }
    ]
  }
];

/**
 * Pure weighted random topic selection.
 * Unseen topics receive high base weight (100).
 * Seen topics receive recency-decayed weight based on days since last seen.
 */
export function selectWeightedTopic(topics = [], userProgressMap = {}, enabledCategories = {}) {
  if (!topics || topics.length === 0) return null;

  const eligible = topics.filter(t => {
    const group = t.group_name || t.group;
    const cat = t.category || t.sub;

    if (enabledCategories[group] === false) return false;
    if (enabledCategories[`${group}::${cat}`] === false || enabledCategories[cat] === false) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  const now = Date.now();
  const ONE_DAY_MS = 86400000;

  const weightedList = eligible.map(topic => {
    const progress = userProgressMap[topic.id];
    let weight = 100; // Base weight for completely unseen topics

    if (progress && progress.times_seen > 0) {
      const lastSeenTime = progress.last_seen ? new Date(progress.last_seen).getTime() : 0;
      const daysSinceSeen = Math.max(0, (now - lastSeenTime) / ONE_DAY_MS);

      const recencyWeight = Math.min(50, 2 + daysSinceSeen * 1.8);
      const frequencyPenalty = 1 + Math.log2(progress.times_seen + 1) * 0.4;
      weight = Math.max(1, Math.round(recencyWeight / frequencyPenalty));
    }

    return { topic, weight };
  });

  const totalWeight = weightedList.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  let randomVal = Math.random() * totalWeight;
  for (const item of weightedList) {
    if (randomVal < item.weight) {
      return item.topic;
    }
    randomVal -= item.weight;
  }

  return weightedList[weightedList.length - 1].topic;
}

/**
 * Formats a Date object to YYYY-MM-DD in the user's device-local timezone.
 * Explicitly avoids UTC date shifting across midnight for non-UTC locales.
 */
export function getLocalCalendarDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date in YYYY-MM-DD in device-local timezone.
 */
export function getLocalYesterdayDate(date = new Date()) {
  const d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  d.setDate(d.getDate() - 1);
  return getLocalCalendarDate(d);
}

/**
 * Computes the effective streak status without mutating stored data.
 * Checks whether the streak is currently active today, pending today's spin, or lapsed.
 */
export function getEffectiveStreak(streakData = {}, nowDate = new Date()) {
  const todayStr = getLocalCalendarDate(nowDate);
  const yesterdayStr = getLocalYesterdayDate(nowDate);
  const lastActive = streakData.last_active_date;
  const currentStreak = streakData.current_streak || 0;
  const longestStreak = streakData.longest_streak || 0;

  if (!lastActive) {
    return {
      current_streak: 0,
      longest_streak: longestStreak,
      last_active_date: null,
      is_active_today: false,
      is_broken: false
    };
  }

  if (lastActive === todayStr) {
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: lastActive,
      is_active_today: true,
      is_broken: false
    };
  }

  if (lastActive === yesterdayStr) {
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: lastActive,
      is_active_today: false,
      is_broken: false
    };
  }

  // More than 1 day skipped: streak has lapsed
  return {
    current_streak: 0,
    longest_streak: longestStreak,
    last_active_date: lastActive,
    is_active_today: false,
    is_broken: true
  };
}

/**
 * Calculates updated streak information upon a user action (spin or mark learned)
 * using device-local calendar date.
 */
export function calculateUpdatedStreak(currentStreakData = {}, nowDate = new Date()) {
  const todayStr = getLocalCalendarDate(nowDate);
  const yesterdayStr = getLocalYesterdayDate(nowDate);

  const prevActiveDate = currentStreakData.last_active_date;
  let currentStreak = currentStreakData.current_streak || 0;
  let longestStreak = currentStreakData.longest_streak || 0;

  if (prevActiveDate === todayStr) {
    // Already spun today: maintain existing streak
    return {
      current_streak: Math.max(1, currentStreak),
      longest_streak: Math.max(longestStreak, currentStreak, 1),
      last_active_date: todayStr
    };
  }

  if (prevActiveDate === yesterdayStr) {
    // Consecutive day spin: increment streak
    currentStreak = (currentStreak > 0 ? currentStreak : 0) + 1;
  } else {
    // First spin ever or streak broke after skipping 1+ calendar days
    currentStreak = 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_active_date: todayStr
  };
}

/**
 * History Retention Policy:
 * - Maximum entries: 150 items
 * - Maximum age: 60 days
 */
export const MAX_HISTORY_ENTRIES = 150;
export const MAX_HISTORY_AGE_DAYS = 60;

/**
 * Appends a topic action to the local history log and applies the retention policy.
 */
export function appendHistoryEntry(prevHistory = [], topic, action = 'spin', nowDate = new Date()) {
  if (!topic) return prevHistory;

  const nowMs = nowDate.getTime();
  const cutoffMs = nowMs - (MAX_HISTORY_AGE_DAYS * 86400000);

  const newEntry = {
    id: `${topic.id}_${nowMs}_${Math.random().toString(36).slice(2, 6)}`,
    topic_id: topic.id,
    title: topic.title,
    group_name: topic.group_name || topic.group || 'general',
    category: topic.category || topic.sub || 'general',
    is_custom: Boolean(topic.is_custom),
    source: topic.source || null,
    tags: Array.isArray(topic.tags) ? topic.tags : [],
    action: action, // 'spin' | 'learned'
    timestamp: nowDate.toISOString(),
    local_date: getLocalCalendarDate(nowDate)
  };

  const filtered = [newEntry, ...prevHistory.filter(h => {
    const hTime = new Date(h.timestamp).getTime();
    return !isNaN(hTime) && hTime >= cutoffMs;
  })];

  return filtered.slice(0, MAX_HISTORY_ENTRIES);
}
