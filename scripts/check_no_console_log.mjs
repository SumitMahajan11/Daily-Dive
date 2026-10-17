import fs from 'node:fs';
import path from 'node:path';

const TARGET_FILES = [
  'scripts/eval_corpus.mjs',
  'scripts/eval_16_table.mjs',
  'scripts/extract_real_roadmap_lines.mjs',
  'scripts/test_upload_real_roadmap.mjs',
  'scripts/test_e2e_extract_review.mjs',
  'scripts/provenance_report.mjs'
];

const TARGET_DIRS = ['scratch', 'tests'];

// Allowlist legacy test suites that predate the safeLog convention
const LEGACY_TEST_FILES = new Set([
  'tests/regression_extractor.test.mjs',
  'tests/test_backup_exclusion.test.mjs',
  'tests/test_extraction_fallbacks.test.mjs',
  'tests/test_ocr_quality.test.mjs',
  'tests/test_prune_and_selectors.test.mjs',
  'tests/test_queue_history.test.mjs',
  'tests/test_total_dives.test.mjs',
  'tests/truthful_review_flags.test.mjs'
]);

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
    const normPath = fullPath.replace(/\\/g, '/');
    if (ent.isDirectory()) {
      checkDir(fullPath);
    } else if (ent.isFile() && /\.(m?js|ts|py|sh)$/.test(ent.name)) {
      if (!LEGACY_TEST_FILES.has(normPath)) {
        checkFile(fullPath);
      }
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
