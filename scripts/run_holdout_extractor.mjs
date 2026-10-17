import fs from 'node:fs';
import path from 'node:path';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections } from '../src/lib/topicExtractor.js';
import { safeLog } from './safeLog.mjs';
import '../tests/_setup.mjs';

async function runHoldoutExtraction() {
  const holdoutDir = 'D:/DailyDive-Holdout-Final';
  if (!fs.existsSync(holdoutDir)) {
    throw new Error(`Directory ${holdoutDir} does not exist`);
  }

  const files = fs.readdirSync(holdoutDir).filter(f => f.toLowerCase().endsWith('.pdf')).sort();
  safeLog(`Processing ${files.length} holdout documents...`);

  const runSummary = [];
  const blindTitlesRows = ['file,page,title'];

  for (const fileName of files) {
    const filePath = path.join(holdoutDir, fileName);
    const buf = fs.readFileSync(filePath);
    const fileObj = new File([buf], fileName, { type: 'application/pdf' });

    const extractedData = await extractFromPdf(fileObj);
    const topics = await extractTopicsFromSections(extractedData, fileName);

    const pageCount = extractedData.pageCount || (extractedData.rawPages ? extractedData.rawPages.length : 0);
    const extractionPath = extractedData.ocrFallbackUsed ? 'OCR' : 'text';
    const topicCount = topics.length;
    const flaggedCount = topics.filter(t => t.needs_review).length;

    runSummary.push({
      file: fileName,
      page_count: pageCount,
      extraction_path: extractionPath,
      topic_count: topicCount,
      flagged_count: flaggedCount
    });

    for (const t of topics) {
      const pageNum = t.page != null ? t.page : (t.slideNumber != null ? t.slideNumber : '');
      const escapedTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
      const escapedFile = `"${fileName.replace(/"/g, '""')}"`;
      blindTitlesRows.push(`${escapedFile},${pageNum},${escapedTitle}`);
    }

    safeLog({
      file: fileName.slice(-25),
      pages: pageCount,
      path: extractionPath,
      topics: topicCount,
      flagged: flaggedCount
    });
  }

  const runJsonPath = path.resolve('reports/holdout_run.json');
  fs.writeFileSync(runJsonPath, JSON.stringify(runSummary, null, 2) + '\n', 'utf8');

  const blindCsvPath = path.resolve('reports/holdout_titles_blind.csv');
  fs.writeFileSync(blindCsvPath, blindTitlesRows.join('\n') + '\n', 'utf8');

  safeLog('Extraction complete.');
}

runHoldoutExtraction().catch(err => {
  safeLog({ error: String(err.message).slice(0, 35) });
  process.exit(1);
});
