/**
 * Dynamic Topic Group Loader for Daily Dive
 * Code-splits topic data by group and lazy-loads enabled categories on demand.
 */

import techTopics from '../data/groups/tech.js';

const groupLoaders = {
  'tech': () => Promise.resolve(techTopics),
  'money-career': () => import('../data/groups/money-career.js').then(m => m.default || m.topics),
  'mind-growth': () => import('../data/groups/mind-growth.js').then(m => m.default || m.topics),
  'world-ideas': () => import('../data/groups/world-ideas.js').then(m => m.default || m.topics)
};

const cachedGroups = new Map([
  ['tech', techTopics]
]);

/**
 * Loads topics for a specific group asynchronously and caches result.
 */
export async function loadGroupTopics(groupName) {
  if (cachedGroups.has(groupName)) {
    return cachedGroups.get(groupName);
  }
  if (groupLoaders[groupName]) {
    const topics = await groupLoaders[groupName]();
    cachedGroups.set(groupName, topics);
    return topics;
  }
  return [];
}

/**
 * Loads all topics matching currently enabled category groups.
 */
export async function loadTopicsForEnabledCategories(enabledCategories = {}) {
  const allGroups = ['tech', 'money-career', 'mind-growth', 'world-ideas'];
  const groupsToLoad = allGroups.filter(g => enabledCategories[g] !== false);

  if (groupsToLoad.length === 0) {
    groupsToLoad.push('tech');
  }

  const results = await Promise.all(groupsToLoad.map(g => loadGroupTopics(g)));
  return results.flat();
}

/**
 * Loads all 692 built-in topics across all 4 groups.
 */
export async function loadAllBuiltinTopics() {
  const allGroups = ['tech', 'money-career', 'mind-growth', 'world-ideas'];
  const results = await Promise.all(allGroups.map(g => loadGroupTopics(g)));
  return results.flat();
}

export { techTopics };
