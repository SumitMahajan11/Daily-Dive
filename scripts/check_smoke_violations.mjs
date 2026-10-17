import fs from 'node:fs';
import path from 'node:path';
import '../tests/_setup.mjs';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections } from '../src/lib/topicExtractor.js';

async function main() {
  const dir = 'D:/DailyDive-SmokeTest';
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf')).sort();

  const violations = [];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const buf = fs.readFileSync(fullPath);
    const file = new File([buf], f, { type: 'application/pdf' });
    const extractedData = await extractFromPdf(file);
    const topics = await extractTopicsFromSections(extractedData, f);

    const normDoc = (extractedData.text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const t of topics) {
      const title = t.title || '';
      const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!normDoc.includes(normTitle)) {
        violations.push({
          file: f,
          title: title,
          titleJson: JSON.stringify(title),
          needs_review: Boolean(t.needs_review),
          title_source: t.title_source || null,
          isUntitledFallback: /^Untitled slide \d+$/i.test(title)
        });
      }
    }
  }

  const print = (msg = '') => process.stdout.write(msg + '\n');

  print(`Total provenance violations found: ${violations.length}\n`);

  violations.forEach((v, idx) => {
    print(`${idx + 1}. File: ${v.file}`);
    print(`   Title JSON: ${v.titleJson}`);
    print(`   needs_review: ${v.needs_review}`);
    print(`   title_source: ${v.title_source}`);
    print(`   isUntitled: ${v.isUntitledFallback}\n`);
  });

  const untitledCount = violations.filter(v => v.isUntitledFallback).length;
  const flaggedCount = violations.filter(v => v.needs_review).length;
  const unflaggedCount = violations.length - flaggedCount;

  print('SUMMARY:');
  print(`Total violations: ${violations.length}`);
  print(`"Untitled slide N" fallbacks: ${untitledCount}`);
  print(`Flagged (needs_review = true): ${flaggedCount}`);
  print(`Unflagged (needs_review = false): ${unflaggedCount}`);
}

main().catch(err => {
  process.stderr.write(`${err}\n`);
  process.exit(1);
});
