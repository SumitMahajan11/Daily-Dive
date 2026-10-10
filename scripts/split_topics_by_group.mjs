import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const canonicalFile = path.join(rootDir, 'data', 'topics.curated.json');
const groupsDir = path.join(rootDir, 'src', 'data', 'groups');

if (!fs.existsSync(groupsDir)) {
  fs.mkdirSync(groupsDir, { recursive: true });
}

if (!fs.existsSync(canonicalFile)) {
  throw new Error(`FATAL: Canonical topics dataset not found at ${canonicalFile}`);
}

const rawData = fs.readFileSync(canonicalFile, 'utf8');
const topics = JSON.parse(rawData);

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

  grouped[group].push(cleanedTopic);
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

console.log(`\n[SUCCESS]: Successfully partitioned all ${topics.length} topics across 4 group modules.\n`);
