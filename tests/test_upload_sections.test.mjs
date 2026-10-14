import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Polyfills for Node environment
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = class DOMParser {
    parseFromString(xmlString) {
      return {
        querySelector: () => null,
        getElementsByTagNameNS: (ns, tag) => {
          const regex = new RegExp('<(?:[a-zA-Z0-9_-]+:)?' + tag + '\\b[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?' + tag + '>', 'gi');
          const matches = [];
          let m;
          while ((m = regex.exec(xmlString)) !== null) {
            matches.push({ textContent: m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') });
          }
          return matches;
        }
      };
    }
  };
}
if (!Promise.try) Promise.try = (fn, ...args) => new Promise(resolve => resolve(fn(...args)));
if (!Uint8Array.prototype.toHex) Uint8Array.prototype.toHex = function() { return Buffer.from(this).toString('hex'); };
if (!Math.sumPrecise) Math.sumPrecise = (arr) => Array.from(arr).reduce((a, b) => a + b, 0);

import { extractFromPptx } from '../src/lib/extractors/pptxExtractor.js';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsLocally } from '../src/lib/topicExtractor.js';

// Replicates the extraction call site logic exactly as implemented in LibraryScreen.jsx
async function extractAsLibraryScreen(file, extractedData) {
  const rawText = typeof extractedData === 'string' ? extractedData : (extractedData?.text || '');
  const rawSections = extractedData?.rawPages || extractedData?.rawSlides || [];
  return await extractTopicsLocally(rawText, rawSections, file.name);
}

test('PPTX upload section extraction: AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx yields 7 topics', async () => {
  const filePath = 'tests/fixtures/AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx';
  const fileName = 'AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx';
  const buf = fs.readFileSync(filePath);
  const file = new File([buf], fileName, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });

  const extractedData = await extractFromPptx(file);
  const topics = await extractAsLibraryScreen(file, extractedData);

  console.log(`[PPTX] Extracted topics count: ${topics.length}`);
  assert.equal(topics.length, 7, `Expected 7 topics from PPTX, got ${topics.length}`);
});

test('PDF upload section extraction: kartik_ccl_1.pdf yields 4 topics', async () => {
  const filePath = 'tests/fixtures/kartik_ccl_1.pdf';
  const fileName = 'kartik_ccl_1.pdf';
  const buf = fs.readFileSync(filePath);
  const file = new File([buf], fileName, { type: 'application/pdf' });

  const extractedData = await extractFromPdf(file);
  const topics = await extractAsLibraryScreen(file, extractedData);

  console.log(`[PDF] Extracted topics count: ${topics.length}`);
  assert.equal(topics.length, 4, `Expected 4 topics from PDF, got ${topics.length}`);
});
