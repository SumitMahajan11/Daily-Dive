import fs from 'node:fs';
import path from 'node:path';

const TARGET_FILES = [
  'scripts/eval_corpus.mjs',
  'scripts/eval_16_table.mjs',
  'scripts/extract_real_roadmap_lines.mjs',
  'scripts/test_upload_real_roadmap.mjs',
  'scripts/test_e2e_extract_review.mjs'
];

const TARGET_DIRS = ['scratch'];

let hits = 0;

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('console.log(')) {
      process.stderr.write(`[PRE-COMMIT GREP ERROR] console.log( found in ${filePath}:${idx + 1}\n`);
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

for (const f of TARGET_FILES) {
  checkFile(f);
}

for (const d of TARGET_DIRS) {
  checkDir(d);
}

if (hits > 0) {
  process.stderr.write(`pre-commit grep failed: ${hits} console.log( occurrence(s) found.\n`);
  process.exit(1);
} else {
  process.stdout.write('pre-commit grep: zero hits found.\n');
  process.exit(0);
}
