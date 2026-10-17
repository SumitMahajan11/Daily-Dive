import util from 'node:util';

const BANNED_KEYS = new Set([
  'title',
  'heading',
  'raw_heading',
  'line0',
  'candidateTitle',
  'finalTitle',
  'text',
  'description'
]);

function inspectItem(item, seen = new Set()) {
  if (item === null || item === undefined) return;

  if (typeof item === 'string') {
    if (item.length > 40) {
      throw new Error(`safeLog: string value exceeds 40 characters (length=${item.length})`);
    }
    return;
  }

  if (typeof item === 'object') {
    if (seen.has(item)) return;
    seen.add(item);

    if (Array.isArray(item)) {
      for (const el of item) {
        inspectItem(el, seen);
      }
      return;
    }

    for (const [key, val] of Object.entries(item)) {
      if (BANNED_KEYS.has(key) || BANNED_KEYS.has(key.toLowerCase())) {
        throw new Error(`safeLog: object contains banned key "${key}"`);
      }
      inspectItem(val, seen);
    }
  }
}

export function safeLog(...args) {
  for (const arg of args) {
    inspectItem(arg);
  }
  const formatted = args.map(arg => {
    if (typeof arg === 'string') return arg;
    return util.inspect(arg, { depth: null, colors: false });
  }).join(' ');
  process.stdout.write(formatted + '\n');
}

export default safeLog;
