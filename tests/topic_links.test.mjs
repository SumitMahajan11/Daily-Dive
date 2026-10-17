import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Fast offline topic links audit validation', () => {
  const canonicalPath = resolve('data/topics.curated.json');
  const reportPath = resolve('reports/link_audit.json');

  assert.ok(existsSync(canonicalPath), 'topics.curated.json must exist');
  assert.ok(existsSync(reportPath), 'link_audit.json report must exist');

  const topics = JSON.parse(readFileSync(canonicalPath, 'utf8'));
  const audit = JSON.parse(readFileSync(reportPath, 'utf8'));

  it('asserts every topic resources is an array', () => {
    for (const t of topics) {
      assert.ok(Array.isArray(t.resources), `Topic ${t.id} resources must be an array`);
    }
  });

  it('asserts every topic link is https, has non-empty label, and appears in reports/link_audit.json as ok', () => {
    let linkCount = 0;
    for (const t of topics) {
      for (const res of t.resources || []) {
        linkCount++;
        assert.ok(
          res.label && typeof res.label === 'string' && res.label.trim().length > 0,
          `Topic ${t.id} has resource with empty label`
        );
        assert.ok(
          res.url && typeof res.url === 'string' && res.url.startsWith('https://'),
          `Topic ${t.id} resource URL must start with https://: ${res.url}`
        );
        const auditEntry = audit[res.url];
        assert.ok(
          auditEntry,
          `Topic ${t.id} resource URL not found in reports/link_audit.json: ${res.url}`
        );
        assert.strictEqual(
          auditEntry.status,
          'ok',
          `Topic ${t.id} resource URL in reports/link_audit.json has status "${auditEntry.status}", expected "ok": ${res.url}`
        );
      }
    }
    assert.ok(linkCount > 0, 'Must validate non-zero links');
  });
});
