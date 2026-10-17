import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIRS = ['scratch', 'tests', 'scripts'];

const BANNED_LOG_CALL = ['console', 'log('].join('.');

let hits = 0;

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes(BANNED_LOG_CALL)) {
      process.stderr.write(`[PRE-COMMIT GREP ERROR] disallowed logging call found in ${filePath}:${idx + 1}\n`);
      hits++;
    }
  });
}

function checkDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const ent of entries) {
    const fullPath = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      checkDir(fullPath);
    } else if (ent.isFile() && /\.(m?js|ts|py|sh)$/.test(ent.name)) {
      checkFile(fullPath);
    }
  }
}

for (const d of TARGET_DIRS) {
  checkDir(d);
}

if (hits > 0) {
  process.stderr.write(`pre-commit grep failed: ${hits} disallowed logging call occurrence(s) found.\n`);
  process.exit(1);
} else {
  process.stdout.write('pre-commit grep: zero hits found.\n');
  process.exit(0);
}
