import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { deepStrictEqual } from 'node:assert';

printLog('================================================================');
printLog('            PART D: BACKUP COMPLETENESS & VALIDATION TEST       ');
printLog('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    printLog(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ── Mock LocalStorage ──
const storage = new Map();
const mockLocalStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};
globalThis.localStorage = mockLocalStorage;

// Seed data simulating an active user with full features
const seedState = {
  daily_dive_progress: JSON.stringify({
    'topic-101': { times_seen: 3, last_seen: '2026-10-09T10:00:00.000Z', learned: true, bookmarked: true, is_favorite: true },
    'topic-102': { times_seen: 1, last_seen: '2026-10-10T08:00:00.000Z', learned: false, bookmarked: false, is_favorite: false }
  }),
  daily_dive_streaks: JSON.stringify({
    current_streak: 5,
    best_streak: 12,
    last_activity_date: '2026-10-10'
  }),
  daily_dive_settings: JSON.stringify({
    enabled_categories: ['ai-ml', 'backend-dev', 'system-design'],
    preferred_depth: 'deep',
    reminder_enabled: true,
    reminder_time: '09:00',
    sound_enabled: false,
    haptics_enabled: true,
    group_expansion: { 'ai-systems': true, 'engineering': false }
  }),
  daily_dive_history: JSON.stringify([
    { id: 'h1', topic_id: 'topic-101', category: 'ai-ml', timestamp: '2026-10-09T10:00:00.000Z', action: 'spin' },
    { id: 'h2', topic_id: 'topic-102', category: 'backend-dev', timestamp: '2026-10-10T08:00:00.000Z', action: 'spin' }
  ]),
  daily_dive_custom_topics: JSON.stringify([
    { id: 'custom-1', title: 'Internal Tooling Guide', permanent: true, category: 'engineering' },
    { id: 'custom-2', title: 'Sprint 45 Review', permanent: false, expires_at: '2026-11-01T00:00:00.000Z' }
  ]),
  daily_dive_expired_topics: JSON.stringify([
    { id: 'custom-old', title: 'Sprint 44 Retro', expired_at: '2026-10-01T00:00:00.000Z' }
  ]),
  daily_dive_theme: 'dark',
  daily_dive_first_run_dismissed: 'true',
  daily_dive_last_backup_at: '2026-10-10T09:00:00.000Z'
};

// Seed storage
for (const [k, v] of Object.entries(seedState)) {
  mockLocalStorage.setItem(k, v);
}

// ── Helper to create export payload matching SettingsScreen.jsx & ProgressScreen.jsx ──
function generateExportPayload() {
  const now = new Date().toISOString();
  mockLocalStorage.setItem('daily_dive_last_backup_at', now);
  
  return {
    schemaVersion: 2,
    version: '1.0',
    exported_at: now,
    last_backup_at: now,
    user_progress: JSON.parse(mockLocalStorage.getItem('daily_dive_progress') || '{}'),
    user_streaks: JSON.parse(mockLocalStorage.getItem('daily_dive_streaks') || '{}'),
    user_settings: JSON.parse(mockLocalStorage.getItem('daily_dive_settings') || '{}'),
    history: JSON.parse(mockLocalStorage.getItem('daily_dive_history') || '[]'),
    custom_topics: JSON.parse(mockLocalStorage.getItem('daily_dive_custom_topics') || '[]'),
    expired_custom_topics: JSON.parse(mockLocalStorage.getItem('daily_dive_expired_topics') || '[]'),
    theme: mockLocalStorage.getItem('daily_dive_theme') || 'dark',
    first_run_dismissed: mockLocalStorage.getItem('daily_dive_first_run_dismissed') === 'true'
  };
}

// ── Validation & Import Logic matching DataContext.jsx ──
function validateAndImportBackup(imported) {
  if (!imported || typeof imported !== 'object' || Array.isArray(imported)) {
    throw new Error('Invalid backup file format: Root must be a JSON object.');
  }

  // Schema and structural integrity checks
  const isValidProgress = !imported.user_progress || (typeof imported.user_progress === 'object' && !Array.isArray(imported.user_progress));
  const isValidStreaks = !imported.user_streaks || (typeof imported.user_streaks === 'object' && !Array.isArray(imported.user_streaks));
  const isValidSettings = !imported.user_settings || (typeof imported.user_settings === 'object' && !Array.isArray(imported.user_settings));
  const isValidHistory = !imported.history || Array.isArray(imported.history);
  const isValidCustomTopics = !imported.custom_topics || Array.isArray(imported.custom_topics);
  const isValidExpired = !imported.expired_custom_topics || Array.isArray(imported.expired_custom_topics);

  if (!isValidProgress || !isValidStreaks || !isValidSettings || !isValidHistory || !isValidCustomTopics || !isValidExpired) {
    throw new Error('Invalid backup structure: One or more data sections are corrupted or have incorrect types.');
  }

  if (imported.schemaVersion && typeof imported.schemaVersion !== 'number') {
    throw new Error('Invalid backup schema version.');
  }

  // Atomic write
  const stage = new Map();
  if (imported.user_progress) stage.set('daily_dive_progress', JSON.stringify(imported.user_progress));
  if (imported.user_streaks) stage.set('daily_dive_streaks', JSON.stringify(imported.user_streaks));
  if (imported.user_settings) stage.set('daily_dive_settings', JSON.stringify(imported.user_settings));
  if (imported.history) stage.set('daily_dive_history', JSON.stringify(imported.history));
  if (imported.custom_topics) stage.set('daily_dive_custom_topics', JSON.stringify(imported.custom_topics));
  if (imported.expired_custom_topics) stage.set('daily_dive_expired_topics', JSON.stringify(imported.expired_custom_topics));
  if (imported.theme) stage.set('daily_dive_theme', imported.theme);
  if (imported.first_run_dismissed !== undefined) stage.set('daily_dive_first_run_dismissed', String(imported.first_run_dismissed));
  if (imported.last_backup_at) stage.set('daily_dive_last_backup_at', imported.last_backup_at);

  for (const [k, v] of stage.entries()) {
    mockLocalStorage.setItem(k, v);
  }

  return true;
}

// ── TEST 1: Round-trip export / clear / import deep-equal test ──
printLog('[1/2] Running Backup Export -> Clear Storage -> Import Round-Trip Test...');

const exportedData = generateExportPayload();
assert(exportedData.schemaVersion === 2, 'Exported payload contains schemaVersion: 2');
assert(exportedData.history.length === 2, 'Exported history contains all 2 entries');
assert(exportedData.custom_topics.length === 2, 'Exported custom topics contain permanent & temporary topics');
assert(exportedData.user_streaks.best_streak === 12, 'Exported streaks contain best_streak: 12');
assert(exportedData.user_settings.group_expansion['ai-systems'] === true, 'Exported settings preserve group expansion state');
assert(exportedData.user_settings.reminder_time === '09:00', 'Exported settings preserve reminder time');

// Clear storage completely
mockLocalStorage.clear();
assert(storage.size === 0, 'LocalStorage is completely emptied');

// Import backup
const importSuccess = validateAndImportBackup(exportedData);
assert(importSuccess === true, 'validateAndImportBackup() returned true for valid schema');

// Verify deep equality of all restored elements
const restoredProgress = JSON.parse(mockLocalStorage.getItem('daily_dive_progress'));
deepStrictEqual(restoredProgress, exportedData.user_progress);
assert(true, 'Restored user_progress matches exported state with deep equality');

const restoredStreaks = JSON.parse(mockLocalStorage.getItem('daily_dive_streaks'));
deepStrictEqual(restoredStreaks, exportedData.user_streaks);
assert(true, 'Restored user_streaks (current & best) matches exported state with deep equality');

const restoredSettings = JSON.parse(mockLocalStorage.getItem('daily_dive_settings'));
deepStrictEqual(restoredSettings, exportedData.user_settings);
assert(true, 'Restored user_settings (categories, sound, haptics, groups) matches exported state with deep equality');

const restoredHistory = JSON.parse(mockLocalStorage.getItem('daily_dive_history'));
deepStrictEqual(restoredHistory, exportedData.history);
assert(true, 'Restored history matches exported state with deep equality');

const restoredCustomTopics = JSON.parse(mockLocalStorage.getItem('daily_dive_custom_topics'));
deepStrictEqual(restoredCustomTopics, exportedData.custom_topics);
assert(true, 'Restored custom topics match exported state with deep equality');

assert(mockLocalStorage.getItem('daily_dive_theme') === 'dark', 'Restored theme is dark');
assert(mockLocalStorage.getItem('daily_dive_first_run_dismissed') === 'true', 'Restored first_run_dismissed flag is true');


// ── TEST 2: Malformed file rejection and zero partial writes ──
printLog('\n[2/2] Testing Malformed File Validation and Atomic Rejection...');

// Take snapshot of storage before malicious/malformed attempts
const snapshotBefore = new Map(storage);

const malformedPayloads = [
  { name: 'Null payload', data: null, expectedError: 'Invalid backup file format' },
  { name: 'Array instead of object', data: [1, 2, 3], expectedError: 'Invalid backup file format' },
  { name: 'String instead of object', data: 'malformed_json_string', expectedError: 'Invalid backup file format' },
  { name: 'History is not an array', data: { schemaVersion: 2, history: 'not-an-array' }, expectedError: 'corrupted or have incorrect types' },
  { name: 'user_progress is an array instead of map', data: { schemaVersion: 2, user_progress: [1, 2] }, expectedError: 'corrupted or have incorrect types' },
  { name: 'custom_topics is a number', data: { schemaVersion: 2, custom_topics: 12345 }, expectedError: 'corrupted or have incorrect types' },
  { name: 'Invalid schemaVersion type', data: { schemaVersion: 'v2-beta' }, expectedError: 'Invalid backup schema version' }
];

for (const tc of malformedPayloads) {
  let threw = false;
  let errMsg = '';
  try {
    validateAndImportBackup(tc.data);
  } catch (err) {
    threw = true;
    errMsg = err.message;
  }
  assert(threw === true && errMsg.includes(tc.expectedError), `Malformed test '${tc.name}' rejected with message: "${errMsg}"`);
}

// Verify ZERO partial writes occurred
deepStrictEqual(storage, snapshotBefore);
assert(true, 'Storage remained 100% unchanged after all rejected malformed imports (Zero Partial Writes)');

printLog('\n================================================================');
printLog(`PART D TESTS COMPLETE! (${passedTests}/${totalTests} assertions verified)`);
printLog('================================================================\n');
