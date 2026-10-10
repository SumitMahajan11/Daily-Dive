import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import the actual group modules used by the runtime application
import techTopics from '../src/data/groups/tech.js';
import moneyCareerTopics from '../src/data/groups/money-career.js';
import mindGrowthTopics from '../src/data/groups/mind-growth.js';
import worldIdeasTopics from '../src/data/groups/world-ideas.js';

describe('Data Quality: Imported Runtime Topic Modules', () => {
  const canonicalPath = path.resolve('data/topics.curated.json');
  const canonicalTopics = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  const lessonsPath = path.resolve('data/lessons.json');
  const lessonsMap = fs.existsSync(lessonsPath) ? JSON.parse(fs.readFileSync(lessonsPath, 'utf8')) : {};

  const allImportedTopics = [
    ...techTopics,
    ...moneyCareerTopics,
    ...mindGrowthTopics,
    ...worldIdeasTopics
  ];

  it('proves total imported topic count matches canonical count of 692', () => {
    assert.equal(allImportedTopics.length, 692, `Expected 692 topics, got ${allImportedTopics.length}`);
    assert.equal(canonicalTopics.length, 692);
  });

  it('proves group modules deep-equal the curated canonical dataset', () => {
    const canonicalMap = new Map(canonicalTopics.map(t => {
      const entry = {
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        group: t.group_name || t.group,
        group_name: t.group_name || t.group,
        tags: Array.isArray(t.tags) ? t.tags : [],
        resources: Array.isArray(t.resources) ? t.resources : []
      };
      if (lessonsMap[t.id]) {
        entry.lesson = lessonsMap[t.id];
      }
      return [t.id, entry];
    }));

    assert.equal(allImportedTopics.length, canonicalMap.size, 'All IDs must be unique and present');

    for (const topic of allImportedTopics) {
      const canonicalTopic = canonicalMap.get(topic.id);
      assert.ok(canonicalTopic, `Topic ${topic.id} missing in canonical file`);
      assert.deepEqual(topic, canonicalTopic, `Topic mismatch for ${topic.id}`);
    }
  });

  it('asserts every key in data/lessons.json is a real curated topic id, and every lesson has 3 non-empty fields', () => {
    const lessonsRaw = fs.readFileSync(path.resolve('data/lessons.json'), 'utf8');
    const lessons = JSON.parse(lessonsRaw);
    const canonicalIdSet = new Set(canonicalTopics.map(t => t.id));

    const keys = Object.keys(lessons);
    assert.ok(keys.length >= 1, 'Expected at least 1 lesson');

    for (const key of keys) {
      assert.ok(canonicalIdSet.has(key), `Lesson key '${key}' must exist in curated topics dataset`);
      const lesson = lessons[key];
      assert.ok(lesson && typeof lesson === 'object', `Lesson for '${key}' must be an object`);
      assert.ok(typeof lesson.idea === 'string' && lesson.idea.trim().length > 0, `Lesson '${key}' must have non-empty 'idea'`);
      assert.ok(typeof lesson.why === 'string' && lesson.why.trim().length > 0, `Lesson '${key}' must have non-empty 'why'`);
      assert.ok(typeof lesson.example === 'string' && lesson.example.trim().length > 0, `Lesson '${key}' must have non-empty 'example'`);
    }
  });

  it('asserts every imported topic description is <= 165 characters', () => {
    const oversized = allImportedTopics.filter(t => (t.description || '').length > 165);
    if (oversized.length > 0) {
      const sample = oversized.slice(0, 3).map(t => `[${t.title}] (${t.description.length}): ${t.description}`).join('\n');
      assert.fail(`Found ${oversized.length} topic descriptions exceeding 165 chars:\n${sample}`);
    }
  });

  it('asserts every imported topic title is <= 71 characters', () => {
    const oversized = allImportedTopics.filter(t => (t.title || '').length > 71);
    if (oversized.length > 0) {
      const sample = oversized.slice(0, 3).map(t => `[${t.title}] (${t.title.length})`).join('\n');
      assert.fail(`Found ${oversized.length} topic titles exceeding 71 chars:\n${sample}`);
    }
  });

  it('asserts zero duplicate titles across the entire catalog', () => {
    const titles = new Set();
    const duplicates = [];

    for (const t of allImportedTopics) {
      const normalized = (t.title || '').trim().toLowerCase();
      if (titles.has(normalized)) {
        duplicates.push(t.title);
      }
      titles.add(normalized);
    }

    assert.equal(duplicates.length, 0, `Found duplicate titles: ${duplicates.join(', ')}`);
  });

  it('asserts every topic contains valid group, category, and resources', () => {
    for (const t of allImportedTopics) {
      assert.ok(t.id && typeof t.id === 'string', `Invalid ID: ${t.id}`);
      assert.ok(t.title && t.title.trim().length > 0, `Empty title on ${t.id}`);
      assert.ok(t.description && t.description.trim().length > 0, `Empty description on ${t.id}`);
      assert.ok(t.category && typeof t.category === 'string', `Missing category on ${t.id}`);
      assert.ok(t.group && typeof t.group === 'string', `Missing group on ${t.id}`);
      assert.ok(Array.isArray(t.resources) && t.resources.length > 0, `Topic ${t.id} has no resources`);
      for (const res of t.resources) {
        assert.ok(res.label && res.label.length > 0, `Resource missing label in ${t.id}`);
        assert.ok(res.url && res.url.startsWith('http'), `Resource invalid url in ${t.id}: ${res.url}`);
      }
    }
  });

  it('asserts exact partition counts across all 4 groups (tech=313, money-career=113, mind-growth=176, world-ideas=90)', () => {
    assert.equal(techTopics.length, 313, `Tech group expected 313, got ${techTopics.length}`);
    assert.equal(moneyCareerTopics.length, 113, `Money-career group expected 113, got ${moneyCareerTopics.length}`);
    assert.equal(mindGrowthTopics.length, 176, `Mind-growth group expected 176, got ${mindGrowthTopics.length}`);
    assert.equal(worldIdeasTopics.length, 90, `World-ideas group expected 90, got ${worldIdeasTopics.length}`);
  });
});
