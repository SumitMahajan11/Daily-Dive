import test from 'node:test';
import assert from 'node:assert/strict';
import { safeLog } from '../scripts/safeLog.mjs';

test('safeLog: throws if string value exceeds 40 characters', () => {
  const longStr = 'a'.repeat(41);
  assert.throws(() => safeLog(longStr), /safeLog.*exceeds 40/);
  assert.throws(() => safeLog({ key: longStr }), /safeLog.*exceeds 40/);
  assert.throws(() => safeLog(['ok', longStr]), /safeLog.*exceeds 40/);
  assert.throws(() => safeLog({ nested: { deeper: longStr } }), /safeLog.*exceeds 40/);
});

test('safeLog: throws if object contains any banned key', () => {
  const bannedKeys = [
    'title',
    'heading',
    'raw_heading',
    'line0',
    'candidateTitle',
    'finalTitle',
    'text',
    'description'
  ];

  for (const key of bannedKeys) {
    assert.throws(
      () => safeLog({ [key]: 'short' }),
      /safeLog.*banned key/,
      `Must throw for banned key "${key}"`
    );
    assert.throws(
      () => safeLog({ nested: { [key]: 123 } }),
      /safeLog.*banned key/,
      `Must throw for nested banned key "${key}"`
    );
    assert.throws(
      () => safeLog([{ [key]: true }]),
      /safeLog.*banned key/,
      `Must throw for array element with banned key "${key}"`
    );
  }
});

test('safeLog: succeeds for valid objects, numbers, booleans, and short strings', () => {
  assert.doesNotThrow(() => safeLog('valid short message'));
  assert.doesNotThrow(() => safeLog({ page: 42, count: 10, ok: true, status: 'passed' }));
  assert.doesNotThrow(() => safeLog([1, 2, 3, { safe: true }]));
  assert.doesNotThrow(() => safeLog(null));
  assert.doesNotThrow(() => safeLog(undefined));
});
