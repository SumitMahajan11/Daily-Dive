import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// 1. Loader registration (when loaded via --import)
try {
  register(import.meta.url);
} catch (e) {
  // Ignore when loaded via --loader or in environments where register is unavailable
}

// 2. ESM Loader hooks (when loaded via --loader or registered via register())
export async function resolve(specifier, context, nextResolve) {
  // Support directory import for tests / tests/
  if (
    specifier === 'tests/' ||
    specifier === 'tests' ||
    specifier.endsWith('/tests') ||
    specifier.endsWith('/tests/') ||
    specifier.endsWith('\\tests') ||
    specifier.endsWith('\\tests\\')
  ) {
    return {
      url: new URL('./index.js', import.meta.url).href,
      format: 'module',
      shortCircuit: true
    };
  }

  if (process.env.TOPIC_EXTRACTOR_PATH && (specifier.endsWith('topicExtractor.js') || specifier.endsWith('topicExtractor'))) {
    return nextResolve(pathToFileURL(path.resolve(process.env.TOPIC_EXTRACTOR_PATH)).href, context);
  }

  return nextResolve(specifier, context);
}

// 3. Global Polyfills for Node test environment
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = class DOMParser {
    parseFromString(xmlString) {
      return {
        querySelector: () => null,
        getElementsByTagNameNS: (ns, tag) => {
          const regex = new RegExp('<(?:[a-zA-Z0-9_-]+:)?' + tag + '\\b[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?' + tag + '>', 'gi');
          const matches = [];
          let m;
          while ((m = regex.exec(xmlString)) !== null) {
            matches.push({ textContent: m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') });
          }
          return matches;
        }
      };
    }
  };
}

if (typeof globalThis.Iterator === 'undefined') {
  globalThis.Iterator = class Iterator {};
}

if (!Promise.withResolvers) {
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

if (!Promise.try) {
  Promise.try = (fn, ...args) => new Promise(resolve => resolve(fn(...args)));
}

if (!Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function() {
    return Buffer.from(this).toString('hex');
  };
}

if (!Math.sumPrecise) {
  Math.sumPrecise = (arr) => Array.from(arr).reduce((a, b) => a + b, 0);
}

if (!Map.prototype.getOrInsertComputed) {
  Map.prototype.getOrInsertComputed = function(key, cb) {
    if (this.has(key)) return this.get(key);
    const v = cb(key);
    this.set(key, v);
    return v;
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  let store = {};
  globalThis.localStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}

if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = { userAgent: 'node' };
}
