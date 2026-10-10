import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTopicsLocally } from '../src/lib/topicExtractor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const roadmapPath = path.resolve(__dirname, '../tests/fixtures/real_roadmap.md');

console.log(`COMMAND: node scripts/extract_real_roadmap.mjs`);
console.log(`FILE PATH: ${roadmapPath}`);

if (!fs.existsSync(roadmapPath)) {
  console.log('NOT RUN: File real_roadmap.md fixture does not exist.');
  process.exit(1);
}

const fileBuffer = fs.readFileSync(roadmapPath);
const fileSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
console.log(`FILE SHA256: ${fileSha256}`);
console.log(`FILE SIZE: ${fileBuffer.length} bytes\n`);

const text = fileBuffer.toString('utf-8');
const results = extractTopicsLocally(text, 'ROADMAP.md');

console.log('================================================================');
console.log(`EXTRACTED CANDIDATES FROM REAL ROADMAP.md (${results.length} total)`);
console.log('================================================================\n');

results.forEach((c, idx) => {
  const confNum = typeof c.confidence === 'number' ? c.confidence : (c.confidenceScore ? Math.round(c.confidenceScore * 100) : 0);
  const confTier = confNum >= 75 ? 'high' : 'low';
  console.log(`[${idx + 1}] Title:        "${c.title}"`);
  console.log(`    Description:  "${c.description}"`);
  console.log(`    Confidence:   ${confNum}% (${confTier})`);
  console.log(`    Needs Review: ${Boolean(c.needsReview)} ${c.needsReviewReason ? `(${c.needsReviewReason})` : ''}`);
  console.log(`    Category:     ${c.category} | Group: ${c.group || c.group_name || 'custom'}`);
  console.log('----------------------------------------------------------------');
});
