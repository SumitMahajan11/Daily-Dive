#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractFromPptx } from '../src/lib/extractors/pptxExtractor.js';
import { extractTopicsFromSections } from '../src/lib/topicExtractor.js';
import { safeLog } from './safeLog.mjs';
import '../tests/_setup.mjs';

function getPageText(extractedData, pageNum) {
  const idx = pageNum - 1;
  if (extractedData.rawSlides && typeof extractedData.rawSlides[idx] === 'string') {
    return extractedData.rawSlides[idx];
  }
  if (extractedData.rawPages && typeof extractedData.rawPages[idx] === 'string') {
    return extractedData.rawPages[idx];
  }
  if (extractedData.pages && extractedData.pages[idx]) {
    const p = extractedData.pages[idx];
    return typeof p === 'string' ? p : (p.text || '');
  }
  return '';
}

export async function auditProvenance(filePath, fileName) {
  try {
    const buf = fs.readFileSync(filePath);
    let extractedData;
    if (fileName.toLowerCase().endsWith('.pptx')) {
      const file = new File([buf], fileName, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      extractedData = await extractFromPptx(file);
    } else if (fileName.toLowerCase().endsWith('.pdf')) {
      const file = new File([buf], fileName, { type: 'application/pdf' });
      extractedData = await extractFromPdf(file);
    } else {
      return null;
    }

    const topics = await extractTopicsFromSections(extractedData, fileName);
    let violations = 0;
    let cleanCount = 0;
    let flaggedCount = 0;

    const normDoc = (extractedData.text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const t of topics) {
      if (t.needs_review) {
        flaggedCount++;
        continue;
      }
      cleanCount++;
      const normTitle = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pageNum = t.page != null ? t.page : t.slideNumber;

      if (pageNum != null) {
        const pageText = getPageText(extractedData, pageNum);
        const normPage = (pageText || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!normPage.includes(normTitle)) {
          violations++;
        }
      } else {
        // Fallback list-path without page numbers: check whole document
        if (!normDoc.includes(normTitle)) {
          violations++;
        }
      }
    }

    return {
      fileName: fileName.length > 40 ? fileName.slice(0, 37) + '...' : fileName,
      totalTopics: topics.length,
      cleanCount,
      flaggedCount,
      violations
    };
  } catch (err) {
    return {
      fileName: fileName.length > 40 ? fileName.slice(0, 37) + '...' : fileName,
      error: 'extraction_failed'
    };
  }
}

export async function runProvenanceReport() {
  safeLog('--- PROVENANCE AUDIT REPORT ---');

  const buildDir = 'D:/DailyDive-Eval/build';
  const buildFiles = fs.existsSync(buildDir)
    ? fs.readdirSync(buildDir).filter(f => f.toLowerCase().endsWith('.pdf'))
    : [];

  let buildClean = 0;
  let buildViolations = 0;

  for (const f of buildFiles) {
    const full = path.join(buildDir, f);
    const res = await auditProvenance(full, f);
    if (!res || res.error) continue;
    buildClean += res.cleanCount;
    buildViolations += res.violations;
    safeLog({
      file: res.fileName,
      clean: res.cleanCount,
      violations: res.violations
    });
  }

  safeLog('Build files audited:', buildFiles.length);
  safeLog('Build clean topics:', buildClean);
  safeLog('Build violations:', buildViolations);

  const fixtureFiles = [
    'tests/fixtures/AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx',
    'tests/fixtures/kartik_ccl_1.pdf',
    'tests/fixtures/Experiment no 2 cn.pdf',
    'tests/fixtures/Experiment no 3 cn.pdf',
    'tests/fixtures/study_guide_algorithms.pdf',
    'tests/fixtures/synthetic_mixed_document.pdf',
    'tests/fixtures/real/ccl_document.pdf'
  ];

  let fixtureClean = 0;
  let fixtureViolations = 0;

  for (const fp of fixtureFiles) {
    if (!fs.existsSync(fp)) continue;
    const name = path.basename(fp);
    const res = await auditProvenance(fp, name);
    if (!res || res.error) continue;
    fixtureClean += res.cleanCount;
    fixtureViolations += res.violations;
    safeLog({
      file: res.fileName,
      clean: res.cleanCount,
      violations: res.violations
    });
  }

  safeLog('Fixture clean topics:', fixtureClean);
  safeLog('Fixture violations:', fixtureViolations);
  safeLog('--- REPORT COMPLETE ---');
}

import { fileURLToPath } from 'node:url';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runProvenanceReport();
}
