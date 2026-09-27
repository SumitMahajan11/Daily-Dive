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

export const STARTER_ENABLED_CATEGORIES = {
  // Core starter focus: AI & Web + Psychology & Philosophy (~241 topics)
  tech: true,
  'tech::ai-ml': true,
  'tech::web-dev': true,
  'tech::cloud-infra': false,
  'tech::data-structures-algorithms': false,
  'tech::systems-distributed-computing': false,
  'ai-ml': true,
  'web-dev': true,
  'cloud-infra': false,
  'data-structures-algorithms': false,
  'systems-distributed-computing': false,

  'mind-growth': true,
  'mind-growth::psychology': true,
  'mind-growth::philosophy-critical-thinking': true,
  'mind-growth::communication': false,
  'psychology': true,
  'philosophy-critical-thinking': true,
  'communication': false,

  // Off by default to avoid overwhelming new users on first launch
  'money-career': false,
  'money-career::finance': false,
  'money-career::career-strategy': false,
  'finance': false,
  'career-strategy': false,

  'world-ideas': false,
  'world-ideas::science-nature': false,
  'world-ideas::history-innovation': false,
  'science-nature': false,
  'history-innovation': false,

  // Custom topics always eligible
  custom: true,
  'custom::custom-notes': true
};

/**
 * Evaluates whether a topic is eligible / active given the category filter map.
 * Topics are enabled by default (opt-out semantics), so they remain active unless
 * their group or subcategory is explicitly toggled false.
 */
export function isTopicEligible(topic, enabledCategories = {}) {
  if (!topic) return false;

  const isCustom = Boolean(topic.is_custom);

  // 1. If user explicitly disabled the "Custom Uploads" group
  if (isCustom && enabledCategories['custom'] === false) {
    return false;
  }

  // 2. Identify taxonomic group and category
  const group = topic.group_name || topic.group || (isCustom ? 'custom' : null);
  const cat = topic.category || topic.sub || (isCustom ? 'custom-notes' : null);

  // 3. If taxonomic group is explicitly disabled (e.g. user toggled off "tech")
  if (group && group !== 'custom' && enabledCategories[group] === false) {
    return false;
  }

  // 4. If category or subcategory is explicitly disabled
  if (group && cat && enabledCategories[`${group}::${cat}`] === false) {
    return false;
  }
  if (cat && enabledCategories[cat] === false) {
    return false;
  }
  if (isCustom && cat && enabledCategories[`custom::${cat}`] === false) {
    return false;
  }

  return true;
}

/**
 * Pure weighted random topic selection.
 * Unseen topics receive high base weight (100 for built-in, 500 for custom).
 * Seen topics receive recency-decayed weight based on days since last seen.
 */
export function selectWeightedTopic(topics = [], userProgressMap = {}, enabledCategories = {}) {
  if (!topics || topics.length === 0) return null;

  const eligible = topics.filter(t => isTopicEligible(t, enabledCategories));

  if (eligible.length === 0) return null;

  const now = Date.now();
  const ONE_DAY_MS = 86400000;

  const weightedList = eligible.map(topic => {
    const progress = userProgressMap[topic.id];
    const isCustom = Boolean(topic.is_custom);
    // Fresh unseen custom topics get 10,000 base weight (100x boost over built-in 100)
    // so they are prioritized right after extraction even in a full 700+ topic pool!
    let weight = isCustom ? 10000 : 100;

    if (progress && progress.times_seen > 0) {
      const lastSeenTime = progress.last_seen ? new Date(progress.last_seen).getTime() : 0;
      const daysSinceSeen = Math.max(0, (now - lastSeenTime) / ONE_DAY_MS);

      const recencyWeight = Math.min(isCustom ? 300 : 50, (isCustom ? 15 : 2) + daysSinceSeen * (isCustom ? 8 : 1.8));
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
 * Reconciles stored streak metadata with the user's actual activity dates
 * (from session history, topic progress, and previous streak records) so the
 * streak status card and activity matrix are mathematically guaranteed to agree.
 * 
 * @param {Object} streakData { current_streak, longest_streak, last_active_date }
 * @param {Set<string>|Array<string>} activeDates Dates with logged activity (YYYY-MM-DD)
 * @param {Date} nowDate 
 * @returns {Object} Reconciled streak metrics
 */
export function reconcileStreakWithActivity(streakData = {}, activeDates = new Set(), nowDate = new Date()) {
  const todayStr = getLocalCalendarDate(nowDate);
  const yesterdayStr = getLocalYesterdayDate(nowDate);

  const storedCurrent = streakData?.current_streak || 0;
  const storedLongest = streakData?.longest_streak || 0;
  const storedLast = streakData?.last_active_date || null;

  const dateSet = activeDates instanceof Set ? new Set(activeDates) : new Set(activeDates || []);
  if (storedLast) {
    dateSet.add(storedLast);
  }

  const hasToday = dateSet.has(todayStr);
  const hasYesterday = dateSet.has(yesterdayStr);

  // Count contiguous active days backwards from today (if active today) or yesterday
  let contiguousDays = 0;
  if (hasToday) {
    const cur = new Date(nowDate.getTime());
    while (dateSet.has(getLocalCalendarDate(cur))) {
      contiguousDays++;
      cur.setDate(cur.getDate() - 1);
    }
  } else if (hasYesterday) {
    const cur = new Date(nowDate.getTime());
    cur.setDate(cur.getDate() - 1);
    while (dateSet.has(getLocalCalendarDate(cur))) {
      contiguousDays++;
      cur.setDate(cur.getDate() - 1);
    }
  }

  if (hasToday) {
    const streak = Math.max(storedCurrent, contiguousDays, 1);
    const longest = Math.max(storedLongest, streak);
    return {
      current_streak: streak,
      longest_streak: longest,
      last_active_date: todayStr,
      is_active_today: true,
      is_broken: false
    };
  }

  if (hasYesterday) {
    const streak = Math.max(storedCurrent, contiguousDays, 1);
    const longest = Math.max(storedLongest, streak);
    return {
      current_streak: streak,
      longest_streak: longest,
      last_active_date: yesterdayStr,
      is_active_today: false,
      is_broken: false
    };
  }

  // Neither today nor yesterday had any activity
  const hadPastActivity = dateSet.size > 0 || Boolean(storedLast);
  return {
    current_streak: 0,
    longest_streak: Math.max(storedLongest, storedCurrent),
    last_active_date: storedLast,
    is_active_today: false,
    is_broken: hadPastActivity
  };
}

/**
 * Computes the effective streak status without mutating stored data.
 * Checks whether the streak is currently active today, pending today's spin, or lapsed.
 * Optionally reconciles with active activity dates when provided.
 */
export function getEffectiveStreak(streakData = {}, nowDate = new Date(), activeDates = null) {
  if (activeDates && (activeDates.size > 0 || (Array.isArray(activeDates) && activeDates.length > 0))) {
    return reconcileStreakWithActivity(streakData, activeDates, nowDate);
  }

  const todayStr = getLocalCalendarDate(nowDate);
  const yesterdayStr = getLocalYesterdayDate(nowDate);
  const lastActive = streakData?.last_active_date;
  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;

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
