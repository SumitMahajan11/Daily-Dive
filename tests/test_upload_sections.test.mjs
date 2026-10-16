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

test('PDF page cap limit: 45-page in-memory PDF fixture emits limit warning and caps processed pages', async () => {
  function createMinimalPdf(pageCount) {
    let out = '%PDF-1.4\n';
    const offsets = [];
    function addObj(str) { offsets.push(out.length); out += str + '\n'; }
    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    const kids = [];
    for (let i = 0; i < pageCount; i++) kids.push((4 + i * 2) + ' 0 R');
    addObj('2 0 obj\n<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + pageCount + ' >>\nendobj');
    addObj('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
    for (let i = 0; i < pageCount; i++) {
      const pageObjNum = 4 + i * 2;
      const contentObjNum = pageObjNum + 1;
      addObj(pageObjNum + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ' + contentObjNum + ' 0 R >>\nendobj');
      const stream = 'BT /F1 12 Tf 72 712 Td (This is page number ' + (i + 1) + ' containing substantive study material and lecture concepts.) Tj ET';
      addObj(contentObjNum + ' 0 obj\n<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream\nendobj');
    }
    const xrefOffset = out.length;
    out += 'xref\n0 ' + (offsets.length + 1) + '\n0000000000 65535 f \n';
    for (const off of offsets) out += String(off).padStart(10, '0') + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + (offsets.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
    return Buffer.from(out, 'utf8');
  }

  const buf = createMinimalPdf(45);
  const file = new File([buf], 'test_45_pages.pdf', { type: 'application/pdf' });
  const result = await extractFromPdf(file);

  assert.equal(result.pageCount, 45, 'Total pageCount should be 45');
  assert.equal(result.rawPages.length, 40, 'Only 40 pages should be processed');
  assert.ok(result.warning, 'Warning should be returned');
  assert.ok(
    result.warning.includes('Pages 41-45 were not processed (limit 40 pages).'),
    `Expected warning to include "Pages 41-45 were not processed (limit 40 pages).", got: "${result.warning}"`
  );
  assert.ok(
    result.warnings.some(w => w.includes('Pages 41-45 were not processed (limit 40 pages).')),
    'Warnings array should include the page cap warning'
  );
});

