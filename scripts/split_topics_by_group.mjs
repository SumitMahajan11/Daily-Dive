import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const canonicalFile = path.join(rootDir, 'data', 'topics.curated.json');
const lessonsFile = path.join(rootDir, 'data', 'lessons.json');
const groupsDir = path.join(rootDir, 'src', 'data', 'groups');
const starterTopicsFile = path.join(rootDir, 'src', 'data', 'starterTopics.js');
const topicIdsFile = path.join(rootDir, 'src', 'data', 'topicIds.json');

if (!fs.existsSync(groupsDir)) {
  fs.mkdirSync(groupsDir, { recursive: true });
}

if (!fs.existsSync(canonicalFile)) {
  throw new Error(`FATAL: Canonical topics dataset not found at ${canonicalFile}`);
}

const rawData = fs.readFileSync(canonicalFile, 'utf8');
const topics = JSON.parse(rawData);

let lessonsMap = {};
if (fs.existsSync(lessonsFile)) {
  lessonsMap = JSON.parse(fs.readFileSync(lessonsFile, 'utf8'));
  console.log(`Loaded ${Object.keys(lessonsMap).length} lessons from ${lessonsFile}`);
}

if (topics.length !== 692) {
  throw new Error(`FATAL: Expected exactly 692 topics, found ${topics.length}`);
}

const expectedGroups = {
  'tech': 313,
  'money-career': 113,
  'mind-growth': 176,
  'world-ideas': 90
};

const grouped = {
  'tech': [],
  'money-career': [],
  'mind-growth': [],
  'world-ideas': []
};

const starterTopicIds = [
  'multi-head-self-attention',
  'mixture-of-experts-moe',
  'mamba-state-space-models',
  'rotary-positional-embeddings-rope',
  'discounted-cash-flow-dcf-valuation',
  'weighted-average-cost-of-capital-wacc',
  'capital-structure-and-modigliani-miller-theorem',
  'mergers-and-acquisitions-accretion-dilution',
  'aristotelian-rhetorical-triangle-ethos-pathos-logos',
  'cialdini-principles-of-persuasion',
  'framing-effects-and-cognitive-anchoring-in-persuasion',
  'elaboration-likelihood-model-central-vs-peripheral',
  'entropy-second-law-thermodynamics',
  'wave-particle-duality-double-slit',
  'quantum-entanglement-bell-theorem',
  'crispr-cas9-gene-editing'
];

const starterTopicsList = [];

for (let i = 0; i < topics.length; i++) {
  const t = topics[i];
  const group = t.group_name || t.group;
  
  if (!group || !expectedGroups[group]) {
    throw new Error(`FATAL: Topic [${t.id || i}] '${t.title || 'Untitled'}' has missing or invalid group: '${group}'. No silent fallback allowed.`);
  }

  const cleanedTopic = {
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    group: group,
    group_name: group,
    tags: Array.isArray(t.tags) ? t.tags : [],
    resources: Array.isArray(t.resources) ? t.resources : []
  };

  if (lessonsMap[t.id]) {
    cleanedTopic.lesson = lessonsMap[t.id];
  }

  grouped[group].push(cleanedTopic);

  if (starterTopicIds.includes(t.id)) {
    starterTopicsList.push(cleanedTopic);
  }
}

// Validate group counts
for (const [groupName, expCount] of Object.entries(expectedGroups)) {
  const actualCount = grouped[groupName].length;
  if (actualCount !== expCount) {
    throw new Error(`FATAL: Group '${groupName}' count mismatch: expected ${expCount}, got ${actualCount}`);
  }
  console.log(`  [OK] Group '${groupName}': ${actualCount} topics`);
}

// Write ES Module group chunks
for (const [groupName, groupTopics] of Object.entries(grouped)) {
  const outFile = path.join(groupsDir, `${groupName}.js`);
  const content = `/**
 * Daily Dive Topics Group: ${groupName}
 * Total topics: ${groupTopics.length}
 * Generated automatically from data/topics.curated.json
 */

export const topics = ${JSON.stringify(groupTopics, null, 2)};

export default topics;
`;
  fs.writeFileSync(outFile, content, 'utf8');
  console.log(`Generated ${outFile} (${groupTopics.length} topics)`);
}

// Write starterTopics.js
if (starterTopicsList.length === 16) {
  const starterContent = `/**
 * Curated first-spin starter topic set (16 topics across all 4 groups).
 * Hydrates instant spin with zero chunk delay on initial load.
 * Generated automatically by scripts/split_topics_by_group.mjs
 */
export const starterTopics = ${JSON.stringify(starterTopicsList, null, 2)};
`;
  fs.writeFileSync(starterTopicsFile, starterContent, 'utf8');
  console.log(`Generated ${starterTopicsFile} (16 starter topics)`);
}

console.log(`\n[SUCCESS]: Successfully partitioned all ${topics.length} topics across 4 group modules and generated topic files.\n`);

