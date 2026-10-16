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
if (typeof globalThis.Iterator === 'undefined') {
  globalThis.Iterator = class Iterator {};
}
if (!Promise.withResolvers) {
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
if (!Promise.try) Promise.try = (fn, ...args) => new Promise(resolve => resolve(fn(...args)));
if (!Uint8Array.prototype.toHex) Uint8Array.prototype.toHex = function() { return Buffer.from(this).toString('hex'); };
if (!Math.sumPrecise) Math.sumPrecise = (arr) => Array.from(arr).reduce((a, b) => a + b, 0);

import { extractFromPptx } from '../src/lib/extractors/pptxExtractor.js';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections } from '../src/lib/topicExtractor.js';

test('PPTX upload section extraction: AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx satisfies invariants', async () => {
  const filePath = 'tests/fixtures/AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx';
  const fileName = 'AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx';
  const buf = fs.readFileSync(filePath);
  const file = new File([buf], fileName, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });

  const extractedData = await extractFromPptx(file);
  const topics = await extractTopicsFromSections(extractedData, file.name);

  // Invariants:
  // 1. Every page has an outcome
  const pageOutcomes = topics.pageOutcomes || [];
  assert.equal(pageOutcomes.length, extractedData.slideCount, 'every slide must have an outcome');
  for (const po of pageOutcomes) {
    assert.ok(po.page, 'page outcome must specify page');
    assert.ok(['topic', 'merged', 'skipped'].includes(po.outcome), `valid outcome required: ${po.outcome}`);
    // 2. Every skipped page has a reason
    if (po.outcome === 'skipped') {
      assert.ok(po.reason && po.reason.trim().length > 0, `skipped page ${po.page} must have a reason`);
    }
  }

  // 3. No title matches /^Page(\s+\d+)?$/
  for (const t of topics) {
    assert.ok(!/^Page(?:\s+\d+)?$/i.test(t.title), `title "${t.title}" must not match /^Page(\\s+\\d+)?$/`);
  }

  // 4. Climate file includes "Thermal Comfort Fundamentals" and "Decision-Support Framework"
  const titles = topics.map(t => t.title);
  assert.ok(titles.includes('Thermal Comfort Fundamentals'), 'must include "Thermal Comfort Fundamentals"');
  assert.ok(titles.includes('Decision-Support Framework'), 'must include "Decision-Support Framework"');
});

test('PDF upload section extraction: kartik_ccl_1.pdf satisfies invariants', async () => {
  const filePath = 'tests/fixtures/kartik_ccl_1.pdf';
  const fileName = 'kartik_ccl_1.pdf';
  const buf = fs.readFileSync(filePath);
  const file = new File([buf], fileName, { type: 'application/pdf' });

  const extractedData = await extractFromPdf(file);
  const topics = await extractTopicsFromSections(extractedData, file.name);

  // Invariants:
  // 1. Every page has an outcome
  const pageOutcomes = topics.pageOutcomes || [];
  assert.equal(pageOutcomes.length, extractedData.pageCount, 'every page must have an outcome');
  for (const po of pageOutcomes) {
    assert.ok(po.page, 'page outcome must specify page');
    assert.ok(['topic', 'merged', 'skipped'].includes(po.outcome), `valid outcome required: ${po.outcome}`);
    // 2. Every skipped page has a reason
    if (po.outcome === 'skipped') {
      assert.ok(po.reason && po.reason.trim().length > 0, `skipped page ${po.page} must have a reason`);
    }
  }

  // 3. No title matches /^Page(\s+\d+)?$/
  for (const t of topics) {
    assert.ok(!/^Page(?:\s+\d+)?$/i.test(t.title), `title "${t.title}" must not match /^Page(\\s+\\d+)?$/`);
  }

  // 4. Kartik file includes "Vertical Scaling", "Cloud Load Balancing Strategy", "Multithreading Scaling Simulation"
  const titles = topics.map(t => t.title);
  assert.ok(titles.includes('Vertical Scaling'), 'must include "Vertical Scaling"');
  assert.ok(titles.includes('Cloud Load Balancing Strategy'), 'must include "Cloud Load Balancing Strategy"');
  assert.ok(titles.includes('Multithreading Scaling Simulation'), 'must include "Multithreading Scaling Simulation"');
});

