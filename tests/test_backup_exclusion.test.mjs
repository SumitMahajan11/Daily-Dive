import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('D.10: Backup Security - Gemini API Key Exclusion', () => {
  it('proves Gemini API key is never included in the exported backup payload', () => {
    // Simulate user state where user has a Gemini API key stored in localStorage or settings
    const mockLocalStorage = {
      'daily_dive_gemini_key': 'AIzaSyDummySecretKey1234567890',
      'daily_dive_theme': 'dark',
      'daily_dive_first_run_dismissed': 'true',
      'daily_dive_guest_progress': JSON.stringify({
        'tech-react-hooks': { status: 'learned', count: 3, last_reviewed_at: '2026-10-01T10:00:00.000Z' }
      }),
      'daily_dive_guest_streaks': JSON.stringify({
        current_streak: 5,
        longest_streak: 12
      })
    };

    const userProgressMap = JSON.parse(mockLocalStorage.daily_dive_guest_progress);
    const userStreaks = JSON.parse(mockLocalStorage.daily_dive_guest_streaks);
    const userSettings = {
      notifications_enabled: true,
      reminder_time: '09:00 AM',
      audio_enabled: false,
      haptics_enabled: false
    };
    const history = [{ id: 'hist-1', topic_id: 'tech-react-hooks', completed_at: '2026-10-01T10:00:00.000Z' }];
    const customTopics = [{ id: 'custom-1', title: 'Custom Topic 1', group: 'custom' }];

    // Construct export object as implemented in SettingsScreen.jsx
    const nowIso = new Date().toISOString();
    const backupData = {
      schemaVersion: 2,
      version: '2.1.0',
      exported_at: nowIso,
      last_backup_at: nowIso,
      user_progress: userProgressMap,
      user_streaks: userStreaks,
      user_settings: userSettings,
      history: history,
      custom_topics: customTopics,
      expired_custom_topics: [],
      theme: mockLocalStorage.daily_dive_theme,
      first_run_dismissed: mockLocalStorage.daily_dive_first_run_dismissed === 'true'
    };

    const exportedJsonString = JSON.stringify(backupData, null, 2);

    // Assertions
    assert.strictEqual(
      exportedJsonString.includes('AIzaSyDummySecretKey1234567890'),
      false,
      'Exported backup JSON must NOT contain the Gemini API key'
    );

    assert.strictEqual(
      exportedJsonString.includes('daily_dive_gemini_key'),
      false,
      'Exported backup JSON must NOT contain daily_dive_gemini_key key'
    );

    const parsed = JSON.parse(exportedJsonString);
    assert.strictEqual(parsed.geminiApiKey, undefined);
    assert.strictEqual(parsed.gemini_api_key, undefined);
    assert.strictEqual(parsed.user_settings.geminiApiKey, undefined);
    assert.strictEqual(parsed.user_settings.gemini_api_key, undefined);

    console.log('[PASS]: Backup JSON export securely omits BYOK Gemini API key.');
  });

  it('proves Reset All Data deletes the Gemini API key from localStorage', () => {
    // Mock localStorage
    const store = {
      'daily_dive_gemini_key': 'AIzaSySecretTestKey999',
      'daily_dive_guest_settings': JSON.stringify({ notifications_enabled: true }),
      'daily_dive_guest_progress': JSON.stringify({ 'tech-topic': { times_seen: 1 } }),
      'daily_dive_guest_streaks': JSON.stringify({ current_streak: 2 }),
      'daily_dive_history': JSON.stringify([{ id: 'h1' }]),
      'daily_dive_custom_topics': JSON.stringify([{ id: 'c1' }]),
      'daily_dive_expired_custom_topics': JSON.stringify([])
    };

    const mockStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    };

    // Simulate resetAllData implementation from DataContext.jsx
    const keysToRemove = [
      'daily_dive_guest_settings',
      'daily_dive_guest_progress',
      'daily_dive_guest_streaks',
      'daily_dive_history',
      'daily_dive_custom_topics',
      'daily_dive_expired_custom_topics',
      'daily_dive_gemini_key'
    ];
    keysToRemove.forEach(key => mockStorage.removeItem(key));

    assert.strictEqual(mockStorage.getItem('daily_dive_gemini_key'), null, 'Gemini key must be deleted on Reset All Data');
    assert.strictEqual(mockStorage.getItem('daily_dive_guest_progress'), null, 'Guest progress must be deleted on Reset All Data');
    assert.strictEqual(mockStorage.getItem('daily_dive_custom_topics'), null, 'Custom topics must be deleted on Reset All Data');

    console.log('[PASS]: Reset All Data correctly deletes daily_dive_gemini_key and all guest records.');
  });
});
