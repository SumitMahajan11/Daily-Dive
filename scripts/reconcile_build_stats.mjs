import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import '../tests/_setup.mjs';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections } from '../src/lib/topicExtractor.js';

async function main() {
  const buildDir = 'D:/DailyDive-Eval/build';
  const allFiles = fs.readdirSync(buildDir).filter(f => f.toLowerCase().endsWith('.pdf')).sort();

  process.stdout.write(`Auditing ${allFiles.length} build PDF files...\n`);

  // (a) All 31 files
  let totalTopicsA = 0;
  let flaggedA = 0;
  let cleanA = 0;

  // (b) Deduplicated files
  const seenHashes = new Set();
  let totalTopicsB = 0;
  let flaggedB = 0;
  let cleanB = 0;
  let deduplicatedFilesCount = 0;

  const perFile = [];

  for (const f of allFiles) {
    const fullPath = path.join(buildDir, f);
    const buf = fs.readFileSync(fullPath);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    const isDuplicate = seenHashes.has(hash);
    if (!isDuplicate) {
      seenHashes.add(hash);
      deduplicatedFilesCount++;
    }

    try {
      const pdfFile = new File([buf], f, { type: 'application/pdf' });
      const extracted = await extractFromPdf(pdfFile);
      const topics = await extractTopicsFromSections(extracted, f);

      const fTotal = topics.length;
      const fFlagged = topics.filter(t => t.needs_review).length;
      const fClean = fTotal - fFlagged;

      totalTopicsA += fTotal;
      flaggedA += fFlagged;
      cleanA += fClean;

      if (!isDuplicate) {
        totalTopicsB += fTotal;
        flaggedB += fFlagged;
        cleanB += fClean;
      }

      perFile.push({
        file: f,
        duplicate: isDuplicate,
        total: fTotal,
        flagged: fFlagged,
        clean: fClean
      });
    } catch (err) {
      console.error(`Error processing ${f}:`, err);
    }
  }

  const print = (msg = '') => process.stdout.write(msg + '\n');

  print('\n========================================================');
  print('(a) BUILD SET STATS (31 files):');
  print(`    Total topics: ${totalTopicsA}`);
  print(`    Flagged topics: ${flaggedA} (${((flaggedA / totalTopicsA) * 100).toFixed(1)}%)`);
  print(`    Clean topics: ${cleanA} (${((cleanA / totalTopicsA) * 100).toFixed(1)}%)`);

  print('\n(b) DEDUPLICATED BUILD SET STATS (' + deduplicatedFilesCount + ' unique files):');
  print(`    Total topics: ${totalTopicsB}`);
  print(`    Flagged topics: ${flaggedB} (${((flaggedB / totalTopicsB) * 100).toFixed(1)}%)`);
  print(`    Clean topics: ${cleanB} (${((cleanB / totalTopicsB) * 100).toFixed(1)}%)`);
  print('========================================================\n');
}

main().catch(err => {
  process.stderr.write(`Failed: ${err}\n`);
  process.exit(1);
});
