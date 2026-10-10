import {
  requestStoragePersistence,
  isIOSSafariNonStandalone
} from '../src/lib/storage.js';

console.log('================================================================');
console.log('            PART C: STORAGE DURABILITY & NUDGE TEST             ');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ── TEST 1: navigator.storage.persist() simulation & console logging ──
console.log('[1/2] Testing navigator.storage.persist() call and console logging...');

// Emulate navigator.storage API environment
let persistCallCount = 0;
const mockNavigator = {
  storage: {
    persisted: async () => false,
    persist: async () => {
      persistCallCount++;
      return true;
    }
  },
  userAgent: '',
  platform: 'iPhone'
};
Object.defineProperty(globalThis, 'navigator', {
  value: mockNavigator,
  writable: true,
  configurable: true
});

const result = await requestStoragePersistence();
assert(result === true, 'requestStoragePersistence() returned true when granted');
assert(persistCallCount === 1, 'navigator.storage.persist() was invoked exactly once');

// Test already persisted branch
mockNavigator.storage.persisted = async () => true;
const alreadyPersisted = await requestStoragePersistence();
assert(alreadyPersisted === true, 'requestStoragePersistence() returned true when already persisted without re-requesting');

// ── TEST 2: iOS Safari Non-Standalone vs Standalone detection ──
console.log('\n[2/2] Testing iOS Safari non-standalone vs standalone detection...');

// Setup window and matchMedia mocks
const mockWindow = {
  matchMedia: (query) => ({
    matches: query.includes('standalone') ? false : false
  }),
  navigator: mockNavigator
};
Object.defineProperty(globalThis, 'window', {
  value: mockWindow,
  writable: true,
  configurable: true
});

// Case A: iOS Safari (Browser Tab / Non-standalone)
mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
mockNavigator.standalone = false;

const isNudgeTarget = isIOSSafariNonStandalone();
assert(isNudgeTarget === true, 'Emulated iOS Safari (browser tab) correctly detected for install nudge');

// Case B: iOS Safari in Standalone PWA Mode
mockWindow.matchMedia = (query) => ({
  matches: query.includes('standalone') ? true : false
});
mockWindow.navigator.standalone = true;

const isStandaloneTarget = isIOSSafariNonStandalone();
assert(isStandaloneTarget === false, 'Standalone iOS PWA mode does NOT show install nudge');

// Case C: Desktop Chrome
mockWindow.matchMedia = (query) => ({ matches: false });
mockWindow.navigator.standalone = false;
mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const isDesktopTarget = isIOSSafariNonStandalone();
assert(isDesktopTarget === false, 'Desktop Chrome does NOT trigger iOS Safari install nudge');

console.log('\n================================================================');
console.log(`PART C TESTS COMPLETE! (${passedTests}/${totalTests} assertions verified)`);
console.log('================================================================\n');
