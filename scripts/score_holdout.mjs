import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections } from '../src/lib/topicExtractor.js';
import { safeLog } from './safeLog.mjs';
import '../tests/_setup.mjs';

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function scoreHoldout(options = {}) {
  const csvPath = options.csvPath || path.resolve('reports/holdout_titles_blind.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error('Missing holdout_titles_blind.csv');
  }

  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) {
    throw new Error('CSV is empty or header-only');
  }

  const rows = [];
  let blankCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const file = (cols[0] || '').replace(/^"|"$/g, '');
    const page = cols[1] || '';
    const title = (cols[2] || '').replace(/^"|"$/g, '');
    const label = (cols[3] || '').trim().toLowerCase();

    if (!label || (label !== 'good' && label !== 'junk')) {
      blankCount++;
    }
    rows.push({ file, page, title, label });
  }

  if (blankCount > 0) {
    if (options.throwOnBlank) {
      throw new Error(`Refusing to run: ${blankCount} labels are blank.`);
    }
    safeLog('Refusing to run: labels are blank.');
    safeLog({ total_rows: rows.length, blank_count: blankCount });
    process.exit(1);
  }

  // If labels are present, perform fresh run and join
  const holdoutDir = options.holdoutDir || 'D:/DailyDive-Holdout-Final';
  const files = options.files || (fs.existsSync(holdoutDir) ? fs.readdirSync(holdoutDir).filter(f => f.toLowerCase().endsWith('.pdf')).sort() : []);

  if (!options.silent) {
    safeLog('Running fresh extraction on holdout...');
  }

  const docStats = [];
  const writtenLecStats = [];

  let overallTP = 0, overallFP = 0, overallFN = 0, overallTN = 0;

  // Group labeled rows by file
  const rowsByFile = new Map();
  for (const r of rows) {
    if (!rowsByFile.has(r.file)) rowsByFile.set(r.file, []);
    rowsByFile.get(r.file).push(r);
  }

  for (const fileName of files) {
    let extractedData;
    let topics;

    if (options.extractor) {
      const res = await options.extractor(fileName);
      extractedData = res.extractedData || { pageCount: 1 };
      topics = res.topics || [];
    } else {
      const filePath = path.join(holdoutDir, fileName);
      const buf = fs.readFileSync(filePath);
      const fileObj = new File([buf], fileName, { type: 'application/pdf' });

      extractedData = await extractFromPdf(fileObj);
      topics = await extractTopicsFromSections(extractedData, fileName);
    }

    const pageCount = extractedData.pageCount || (extractedData.rawPages ? extractedData.rawPages.length : 0);
    const topicCount = topics.length;

    const fileRows = rowsByFile.get(fileName) || [];
    let tp = 0, fp = 0, fn = 0, tn = 0;

    for (let idx = 0; idx < topics.length; idx++) {
      const t = topics[idx];
      const r = fileRows[idx];
      const isFlagged = Boolean(t.needs_review);
      const label = r ? r.label : 'good';

      if (label === 'junk') {
        if (isFlagged) tp++;
        else fn++;
      } else {
        if (isFlagged) fp++;
        else tn++;
      }
    }

    overallTP += tp;
    overallFP += fp;
    overallFN += fn;
    overallTN += tn;

    const stat = {
      file: fileName.slice(-25),
      TP: tp,
      FP: fp,
      FN: fn,
      TN: tn,
      pages: pageCount,
      topics: topicCount
    };
    docStats.push(stat);
    if (!options.silent) {
      safeLog(stat);
    }

    if (fileName.toLowerCase().includes('writtenlec')) {
      const coverage = pageCount > 0 ? (topicCount / pageCount).toFixed(3) : '0.000';
      writtenLecStats.push({
        file: fileName.slice(-25),
        pages: pageCount,
        topics: topicCount,
        coverage: Number(coverage)
      });
    }
  }

  if (!options.silent) {
    safeLog('--- WRITTENLEC COVERAGE ---');
    for (const w of writtenLecStats) {
      safeLog(w);
    }

    safeLog({
      total_TP: overallTP,
      total_FP: overallFP,
      total_FN: overallFN,
      total_TN: overallTN
    });
  }

  return {
    docStats,
    writtenLecStats,
    totals: {
      overallTP,
      overallFP,
      overallFN,
      overallTN
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  scoreHoldout().catch(err => {
    safeLog({ error: String(err.message).slice(0, 35) });
    process.exit(1);
  });
}

