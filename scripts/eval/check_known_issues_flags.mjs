import fs from 'node:fs';
import path from 'node:path';
import '../../tests/_setup.mjs';
import { extractFromPdf } from '../../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections } from '../../src/lib/topicExtractor.js';
import { SMOKE_DIR } from './paths.mjs';

async function main() {
  const dir = SMOKE_DIR;
  if (!fs.existsSync(dir)) {
    process.stderr.write(`Smoke test directory not found: ${dir}\n`);
    process.exit(2);
  }
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf')).sort();

  const allTopics = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const buf = fs.readFileSync(fullPath);
    const file = new File([buf], f, { type: 'application/pdf' });
    const extractedData = await extractFromPdf(file);
    const topics = await extractTopicsFromSections(extractedData, f);
    topics.forEach(t => {
      allTopics.push({
        file: f,
        title: t.title,
        needs_review: Boolean(t.needs_review),
        title_source: t.title_source
      });
    });
  }

  // Read titles mentioned in docs/KNOWN_ISSUES.md
  const knownIssuesContent = fs.readFileSync('docs/KNOWN_ISSUES.md', 'utf8');
  // Match `Example title: "..."` or `Example titles: "...", "..."`
  const matches = knownIssuesContent.match(/"([^"\r\n]+)"/g) || [];
  // Clean quotes
  const titlesToCheck = [...new Set(matches.map(m => m.slice(1, -1)))];

  const print = (msg = '') => process.stdout.write(msg + '\n');

  print(`Found ${titlesToCheck.length} unique titles quoted in KNOWN_ISSUES.md\n`);

  let flaggedCount = 0;
  let unflaggedCount = 0;
  let notFoundCount = 0;

  print('STATUS OF KNOWN ISSUES TITLES:');
  print('------------------------------------------------------------');

  for (const title of titlesToCheck) {
    // Find matching topic in allTopics
    // Note: some titles in markdown may have Unicode variations or mojibake
    const match = allTopics.find(t => t.title === title || t.title.includes(title) || title.includes(t.title));
    if (match) {
      const isFlagged = match.needs_review;
      if (isFlagged) flaggedCount++;
      else unflaggedCount++;

      print(`[${isFlagged ? 'FLAGGED  ' : 'UNFLAGGED'}] "${match.title}" (file: ${match.file})`);
    } else {
      notFoundCount++;
      print(`[NOT FOUND] "${title}"`);
    }
  }

  print('------------------------------------------------------------');
  print(`Total checked: ${titlesToCheck.length}`);
  print(`Flagged: ${flaggedCount}`);
  print(`Unflagged (silent failures): ${unflaggedCount}`);
  if (notFoundCount > 0) print(`Not found: ${notFoundCount}`);
}

main().catch(err => {
  process.stderr.write(`${err}\n`);
  process.exit(1);
});
