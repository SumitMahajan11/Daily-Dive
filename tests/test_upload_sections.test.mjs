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
if (!Map.prototype.getOrInsertComputed) {
  Map.prototype.getOrInsertComputed = function(key, cb) {
    if (this.has(key)) return this.get(key);
    const v = cb(key);
    this.set(key, v);
    return v;
  };
}

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

test('PDF 100-page text extraction: processes all 100 pages in-memory without warning', async () => {
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

  const buf = createMinimalPdf(100);
  const file = new File([buf], 'test_100_pages.pdf', { type: 'application/pdf' });
  const result = await extractFromPdf(file);

  assert.equal(result.pageCount, 100, 'Total pageCount should be 100');
  assert.equal(result.rawPages.length, 100, 'All 100 pages should be processed');
  assert.equal(result.pageStats.textLayer, 100, 'All 100 pages should be textLayer');
  assert.equal(result.pageStats.empty, 0, 'No pages should be empty');
  assert.equal(result.pageStats.notProcessed, 0, 'No pages should be notProcessed');
  assert.equal(result.warning, undefined, 'No warning should be emitted for 100 text pages');
});

test('PDF cancel mid-OCR: returns partial results with warning and does not count unprocessed pages as empty', async () => {
  const buf = fs.readFileSync('tests/fixtures/synthetic_mixed_document.pdf');
  const file = new File([buf], 'synthetic_mixed_document.pdf', { type: 'application/pdf' });

  const controller = new AbortController();
  const onProgress = (p) => {
    if (p.stage && p.stage.toLowerCase().includes('ocr')) {
      controller.abort();
    }
  };

  const result = await extractFromPdf(file, onProgress, { signal: controller.signal });

  assert.ok(result.rawPages.length >= 1, 'Should return partial results for text pages already extracted');
  assert.ok(result.warning, 'Warning should be returned on cancel');
  assert.ok(result.warning.toLowerCase().includes('cancel'), `Warning should mention cancellation: ${result.warning}`);
  assert.ok(result.pageStats.notProcessed > 0, `Unprocessed pages should be recorded in notProcessed: ${result.pageStats.notProcessed}`);
  assert.equal(result.pageStats.empty, 0, 'Unprocessed pages must NOT count as empty');
  assert.equal(result.emptyPages, 0, 'emptyPages property must NOT count unprocessed pages as empty');
});

test('PDF OCR page cap limit: pages beyond OCR_MAX_PAGES (120) are marked notProcessed with limit warning', async () => {
  function createPdfWithImagePages(count) {
    let out = '%PDF-1.4\n';
    const offsets = [];
    function addObj(str) { offsets.push(out.length); out += str + '\n'; }
    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    const kids = [];
    for (let i = 0; i < count; i++) kids.push((4 + i * 2) + ' 0 R');
    addObj('2 0 obj\n<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + count + ' >>\nendobj');
    addObj('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
    
    for (let i = 0; i < count; i++) {
      const pageObjNum = 4 + i * 2;
      const contentObjNum = pageObjNum + 1;
      if (i === 0) {
        addObj(pageObjNum + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ' + contentObjNum + ' 0 R >>\nendobj');
        const stream = 'BT /F1 12 Tf 72 712 Td (Substantive study notes for page 1 explaining high-throughput distributed systems and data processing.) Tj ET';
        addObj(contentObjNum + ' 0 obj\n<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream\nendobj');
      } else {
        const imgObjNum = 4 + count * 2 + (i - 1);
        addObj(pageObjNum + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 ' + imgObjNum + ' 0 R >> >> /Contents ' + contentObjNum + ' 0 R >>\nendobj');
        const pstream = 'q 612 0 0 792 0 0 cm /Im1 Do Q';
        addObj(contentObjNum + ' 0 obj\n<< /Length ' + pstream.length + ' >>\nstream\n' + pstream + '\nendstream\nendobj');
      }
    }

    for (let i = 1; i < count; i++) {
      const imgObjNum = 4 + count * 2 + (i - 1);
      addObj(imgObjNum + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width 600 /Height 800 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length 1 >>\nstream\n \nendstream\nendobj');
    }

    const xrefOffset = out.length;
    out += 'xref\n0 ' + (offsets.length + 1) + '\n0000000000 65535 f \n';
    for (const off of offsets) out += String(off).padStart(10, '0') + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + (offsets.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
    return Buffer.from(out, 'utf8');
  }

  // 1 text page + 125 image pages = 126 pages
  const buf = createPdfWithImagePages(126);
  const file = new File([buf], 'test_126_pages.pdf', { type: 'application/pdf' });
  const controller = new AbortController();
  const onProgress = (p) => {
    if (p.stage && p.stage.toLowerCase().includes('ocr')) {
      controller.abort();
    }
  };
  const result = await extractFromPdf(file, onProgress, { signal: controller.signal });
  assert.equal(result.pageCount, 126);
  assert.ok(result.warnings.some(w => w.includes("were not OCR'd (limit 120)")), `Expected OCR cap warning, got: ${result.warning}`);
  assert.ok(result.warnings.some(w => w.includes("Pages 122-126 were not OCR'd (limit 120)")), `Expected Pages 122-126 warning, got: ${result.warning}`);
});



