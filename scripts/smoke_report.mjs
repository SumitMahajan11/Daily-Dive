#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections } from '../src/lib/topicExtractor.js';
import '../tests/_setup.mjs';

function print(str = '') {
  process.stdout.write(str + '\n');
}

function computeMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function isEndingMidSentence(title) {
  if (!title || typeof title !== 'string') return false;
  const s = title.trim();
  // Trailing punctuation indicating incomplete sentence / connector
  if (/[…,;:\-–—/\\&+(=\[]\s*$/.test(s) || /\.{2,}\s*$/.test(s)) return true;
  // Trailing prepositions or conjunctions
  if (/\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|on)\s*$/i.test(s)) {
    return true;
  }
  return false;
}

export async function processFile(filePath, fileName) {
  const buf = fs.readFileSync(filePath);
  const file = new File([buf], fileName, { type: 'application/pdf' });
  const extractedData = await extractFromPdf(file);
  const topics = await extractTopicsFromSections(extractedData, fileName);

  const pageCount = extractedData.pageCount || 0;
  const topicCount = topics.length;

  let flaggedCount = 0;
  const perPageCounts = new Array(pageCount).fill(0);
  const titles = [];

  let startingLowercaseCount = 0;
  let endingMidSentenceCount = 0;
  let longerThan80Count = 0;
  let provenanceViolations = 0;

  const normDoc = (extractedData.text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const t of topics) {
    const title = t.title || '';
    titles.push(title);

    if (t.needs_review) {
      flaggedCount++;
    }

    const pageNum = t.page != null ? t.page : t.slideNumber;
    if (pageNum != null && pageNum >= 1 && pageNum <= pageCount) {
      perPageCounts[pageNum - 1]++;
    }

    if (/^[a-z]/.test(title)) {
      startingLowercaseCount++;
    }

    if (isEndingMidSentence(title)) {
      endingMidSentenceCount++;
    }

    if (title.length > 80) {
      longerThan80Count++;
    }

    const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normDoc.includes(normTitle)) {
      provenanceViolations++;
    }
  }

  const flaggedPct = topicCount > 0 ? ((flaggedCount / topicCount) * 100).toFixed(1) + '%' : '0.0%';

  const topicsPerPageMin = pageCount > 0 ? Math.min(...perPageCounts) : 0;
  const topicsPerPageMax = pageCount > 0 ? Math.max(...perPageCounts) : 0;
  const topicsPerPageMedian = pageCount > 0 ? computeMedian(perPageCounts) : 0;

  const uniqueTitles = new Set(titles);
  const duplicateTitlesCount = titles.length - uniqueTitles.size;

  // 10 shortest and 10 longest titles verbatim
  // Stable sort by length, then lexicographical for deterministic ordering
  const sortedByLen = [...titles].sort((a, b) => a.length - b.length || a.localeCompare(b));
  const shortest10 = sortedByLen.slice(0, 10);
  const longest10 = sortedByLen.slice(-10).reverse();

  return {
    fileName,
    pageCount,
    topicCount,
    flaggedCount,
    flaggedPct,
    topicsPerPageMin,
    topicsPerPageMedian,
    topicsPerPageMax,
    startingLowercaseCount,
    endingMidSentenceCount,
    longerThan80Count,
    duplicateTitlesCount,
    provenanceViolations,
    shortest10,
    longest10
  };
}

export async function runSmokeReport(dirPath = 'D:/DailyDive-SmokeTest') {
  print('=== DAILYDIVE SMOKE TEST REPORT ===');
  print(`Directory: ${dirPath}`);

  const files = fs.readdirSync(dirPath)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .sort();

  print(`Total PDF files found: ${files.length}`);
  print('');

  for (const fileName of files) {
    const fullPath = path.join(dirPath, fileName);
    print(`----------------------------------------------------------------`);
    print(`File: ${fileName}`);
    try {
      const res = await processFile(fullPath, fileName);
      print(`Page count: ${res.pageCount}`);
      print(`Topic count: ${res.topicCount}`);
      print(`Flagged count: ${res.flaggedCount}`);
      print(`Flagged %: ${res.flaggedPct}`);
      print(`Topics per page min/median/max: ${res.topicsPerPageMin} / ${res.topicsPerPageMedian} / ${res.topicsPerPageMax}`);
      print(`Count of titles starting lowercase: ${res.startingLowercaseCount}`);
      print(`Count of titles ending mid-sentence: ${res.endingMidSentenceCount}`);
      print(`Count of titles longer than 80 chars: ${res.longerThan80Count}`);
      print(`Count of duplicate titles: ${res.duplicateTitlesCount}`);
      print(`Provenance violations: ${res.provenanceViolations}`);
      print('');
      print('10 shortest titles:');
      res.shortest10.forEach((t, idx) => {
        print(`  ${idx + 1}. ${t}`);
      });
      print('');
      print('10 longest titles:');
      res.longest10.forEach((t, idx) => {
        print(`  ${idx + 1}. ${t}`);
      });
      print('');
    } catch (err) {
      print(`ERROR processing ${fileName}: ${err.message}`);
    }
  }

  print('================================================================');
  print('=== SMOKE TEST REPORT COMPLETE ===');
}

import { fileURLToPath } from 'node:url';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const customDir = process.argv[2] || 'D:/DailyDive-SmokeTest';
  runSmokeReport(customDir);
}
