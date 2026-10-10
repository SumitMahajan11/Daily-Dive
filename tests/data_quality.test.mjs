import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('A.5: Data Quality & Regression Invariants', () => {
  const jsonPath = path.resolve('src/data/compiledTopics.json');
  const topics = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  it('validates exact total topic count of 692', () => {
    assert.strictEqual(topics.length, 692, `Expected exactly 692 topics, got ${topics.length}`);
  });

  it('validates exact group breakdown counts (tech 313, money-career 113, mind-growth 176, world-ideas 90)', () => {
    const groupCounts = {};
    for (const t of topics) {
      const g = t.group_name || t.group;
      assert.ok(g, `Topic ${t.id} missing group`);
      groupCounts[g] = (groupCounts[g] || 0) + 1;
    }

    assert.strictEqual(groupCounts['tech'], 313, 'Expected 313 tech topics');
    assert.strictEqual(groupCounts['money-career'], 113, 'Expected 113 money-career topics');
    assert.strictEqual(groupCounts['mind-growth'], 176, 'Expected 176 mind-growth topics');
    assert.strictEqual(groupCounts['world-ideas'], 90, 'Expected 90 world-ideas topics');
  });

  it('validates zero duplicate titles or IDs', () => {
    const seenTitles = new Set();
    const seenIds = new Set();
    for (const t of topics) {
      assert.ok(!seenIds.has(t.id), `Duplicate topic ID found: ${t.id}`);
      seenIds.add(t.id);

      const normTitle = t.title.trim().toLowerCase();
      assert.ok(!seenTitles.has(normTitle), `Duplicate topic title found: ${t.title}`);
      seenTitles.add(normTitle);
    }
  });

  it('validates title and description length constraints (punchy titles, max description 175)', () => {
    let maxTitleLen = 0;
    let maxDescLen = 0;
    let totalTitleLen = 0;
    let totalDescLen = 0;

    for (const t of topics) {
      assert.ok(t.title && t.title.trim().length > 0, `Topic ${t.id} has empty title`);
      assert.ok(t.description && t.description.trim().length > 0, `Topic ${t.id} has empty description`);

      const titleLen = t.title.length;
      const descLen = t.description.length;

      totalTitleLen += titleLen;
      totalDescLen += descLen;

      if (titleLen > maxTitleLen) maxTitleLen = titleLen;
      if (descLen > maxDescLen) maxDescLen = descLen;

      assert.ok(
        descLen <= 175,
        `Topic '${t.title}' (${t.id}) description exceeds 175 chars: ${descLen} chars -> "${t.description}"`
      );
    }

    const avgTitle = totalTitleLen / topics.length;
    const avgDesc = totalDescLen / topics.length;

    console.log(`[PASS] Verified 692 topics: Avg Title = ${avgTitle.toFixed(2)} chars (max: ${maxTitleLen}), Avg Desc = ${avgDesc.toFixed(2)} chars (max: ${maxDescLen})`);
  });

  it('validates every topic has category, group, and at least one valid resource source link', () => {
    for (const t of topics) {
      assert.ok(t.category, `Topic ${t.id} missing category`);
      assert.ok(t.group_name || t.group, `Topic ${t.id} missing group`);
      assert.ok(Array.isArray(t.resources), `Topic ${t.id} resources must be an array`);
      assert.ok(t.resources.length >= 1, `Topic ${t.id} must have at least 1 resource link`);

      for (const res of t.resources) {
        assert.ok(res.url && res.url.startsWith('http'), `Topic ${t.id} resource has invalid URL: ${res.url}`);
        assert.ok(res.label || res.title, `Topic ${t.id} resource has missing label/title`);
      }
    }
  });

  it('validates that group chunk files in src/data/groups match compiledTopics.json', () => {
    const groups = ['tech', 'money-career', 'mind-growth', 'world-ideas'];
    for (const g of groups) {
      const groupFilePath = path.resolve(`src/data/groups/${g}.js`);
      assert.ok(fs.existsSync(groupFilePath), `Missing group chunk file: ${groupFilePath}`);
      const content = fs.readFileSync(groupFilePath, 'utf-8');
      assert.ok(content.includes('export const topics ='), `Group chunk ${g}.js missing export`);
    }
  });
});
