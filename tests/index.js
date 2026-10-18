import './_setup.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const testFiles = fs.readdirSync(dir)
  .filter(f => (f.endsWith('.test.mjs') || f.endsWith('.test.js')) && f !== 'index.js')
  .sort();

for (const f of testFiles) {
  try {
    await import(pathToFileURL(path.join(dir, f)).href);
  } catch (err) {
    console.error(`Failed to load test file: ${f}`, err);
    process.exitCode = 1;
  }
}
