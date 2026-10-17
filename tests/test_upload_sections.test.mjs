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
import { extractTopicsFromSections, isCleanHeading } from '../src/lib/topicExtractor.js';

const DELETED_LOOKUP_STRINGS = new Set([
  'Wireshark Packet Filtering',
  'TCP Stream & Handshake Analysis',
  'Network Protocol Hierarchy',
  'Network Conversation & Endpoints',
  'Packet Capture Workflow',
  'Transport Layer Protocol Analysis',
  'Packet File Reconstruction',
  'Cyber Attack Traffic Detection',
  'IPv4 Subnetting & Topology',
  'Cisco Packet Tracer Design',
  'Horizontal vs Vertical Scaling',
  'Cloud Load Balancing Strategy',
  'Dijkstra Shortest Path Algorithm',
  'Dynamic Programming Foundations',
  'Distributed Consensus & Paxos',
  'Distributed Data Replication',
  'Multithreading Scaling Simulation',
  'Latency & Performance Benchmarks',
  'API Gateway Routing & Security',
  'Microservices Architecture Patterns',
  'Integrated Shelter Architecture',
  'Decision-Support Framework',
  'Thermal Comfort Benchmarks',
  'Cross-Climate Prediction Gaps',
  'Cross-Climate Design Gaps',
  'Thermal Comfort ML Objectives',
  'Adaptive Shelter Methodology',
  'Climate-Adaptive Shelter Outcomes',
  'Energy & Comfort Optimization',
  'Thermal Comfort Fundamentals'
]);

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

  // 4. Topic count equals page count minus skipped pages
  const skippedPages = pageOutcomes.filter(po => po.outcome === 'skipped' || po.outcome === 'merged').length;
  assert.equal(topics.length, extractedData.slideCount - skippedPages, 'topic count equals page count minus skipped pages');

  // 5. Every non-flagged title passes isCleanHeading
  for (const t of topics) {
    if (!t.needs_review) {
      assert.ok(isCleanHeading(t.title), `non-flagged title "${t.title}" must pass isCleanHeading`);
    }
  }

  // 6. No two titles are equal
  const titles = topics.map(t => t.title);
  const uniqueTitles = new Set(titles);
  assert.equal(uniqueTitles.size, titles.length, 'no two titles are equal');

  // 7. No title equals a string from the deleted lookup
  for (const t of topics) {
    assert.ok(!DELETED_LOOKUP_STRINGS.has(t.title), `title "${t.title}" must not equal any string from the deleted lookup`);
  }

  // 8. Provenance invariant (report-only mode):
  // For each topic, normalised title (lowercase, alphanumerics only) must be
  // a substring of the normalised text of its source page, unless needs_review is true.
  let provenanceViolations = 0;
  for (const t of topics) {
    if (t.needs_review) continue;
    const pageNum = t.page != null ? t.page : t.slideNumber;
    const pageItem = extractedData.rawSlides ? extractedData.rawSlides[pageNum - 1] : '';
    const pageText = typeof pageItem === 'string' ? pageItem : (pageItem?.text || '');
    const normTitle = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normPage = (pageText || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normPage.includes(normTitle)) {
      provenanceViolations++;
    }
  }
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

  // 4. Topic count equals page count minus skipped pages
  const skippedPages = pageOutcomes.filter(po => po.outcome === 'skipped' || po.outcome === 'merged').length;
  assert.equal(topics.length, extractedData.pageCount - skippedPages, 'topic count equals page count minus skipped pages');

  // 5. Every non-flagged title passes isCleanHeading
  for (const t of topics) {
    if (!t.needs_review) {
      assert.ok(isCleanHeading(t.title), `non-flagged title "${t.title}" must pass isCleanHeading`);
    }
  }

  // 6. No two titles are equal
  const titles = topics.map(t => t.title);
  const uniqueTitles = new Set(titles);
  assert.equal(uniqueTitles.size, titles.length, 'no two titles are equal');

  // 7. No title equals a string from the deleted lookup
  for (const t of topics) {
    assert.ok(!DELETED_LOOKUP_STRINGS.has(t.title), `title "${t.title}" must not equal any string from the deleted lookup`);
  }

  // 8. Provenance invariant (report-only mode):
  // For each topic, normalised title (lowercase, alphanumerics only) must be
  // a substring of the normalised text of its source page, unless needs_review is true.
  let provenanceViolations = 0;
  for (const t of topics) {
    if (t.needs_review) continue;
    const pageNum = t.page != null ? t.page : t.slideNumber;
    const pageItem = extractedData.rawPages ? extractedData.rawPages[pageNum - 1] : (extractedData.pages ? extractedData.pages[pageNum - 1] : '');
    const pageText = typeof pageItem === 'string' ? pageItem : (pageItem?.text || '');
    const normTitle = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normPage = (pageText || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normPage.includes(normTitle)) {
      provenanceViolations++;
    }
  }
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

test('PDF page index preservation: a PDF where page 2 is empty and page 3 has text must report page 3, not 2', async () => {
  function create3PagePdf() {
    let out = '%PDF-1.4\n';
    const offsets = [];
    function addObj(str) { offsets.push(out.length); out += str + '\n'; }
    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    addObj('2 0 obj\n<< /Type /Pages /Kids [4 0 R 6 0 R 8 0 R] /Count 3 >>\nendobj');
    addObj('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');

    // Page 1: with text
    addObj('4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>\nendobj');
    const p1Stream = 'BT /F1 12 Tf 72 712 Td (Horizontal and Vertical Database Scaling Models) Tj 0 -24 Td (Database replication across distributed database clusters provides fault tolerance and high throughput. Read replicas offload primary database instances effectively across cloud availability zones.) Tj ET';
    addObj('5 0 obj\n<< /Length ' + p1Stream.length + ' >>\nstream\n' + p1Stream + '\nendstream\nendobj');

    // Page 2: empty
    addObj('6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 7 0 R >>\nendobj');
    addObj('7 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj');

    // Page 3: with text
    addObj('8 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 9 0 R >>\nendobj');
    const p3Stream = 'BT /F1 12 Tf 72 712 Td (Consensus Mechanisms and Distributed Protocols) Tj 0 -24 Td (Paxos and Raft consensus algorithms ensure leader election and deterministic state machine log replication. Distributed nodes coordinate transaction commits and state transitions reliably.) Tj ET';
    addObj('9 0 obj\n<< /Length ' + p3Stream.length + ' >>\nstream\n' + p3Stream + '\nendstream\nendobj');

    const xrefOffset = out.length;
    out += 'xref\n0 ' + (offsets.length + 1) + '\n0000000000 65535 f \n';
    for (const off of offsets) out += String(off).padStart(10, '0') + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + (offsets.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
    return Buffer.from(out, 'utf8');
  }

  const buf = create3PagePdf();
  const file = new File([buf], 'test_p2_empty_p3_text.pdf', { type: 'application/pdf' });
  const extracted = await extractFromPdf(file);
  assert.equal(extracted.pageCount, 3);
  assert.equal(extracted.pages.length, 3);
  assert.equal(extracted.pages[0].page, 1);
  assert.equal(extracted.pages[1].page, 2);
  assert.equal(extracted.pages[1].text, '');
  assert.equal(extracted.pages[2].page, 3);
  assert.ok(extracted.pages[2].text.includes('Consensus'));

  const topics = await extractTopicsFromSections(extracted, file.name);
  assert.ok(topics.length >= 2, 'Should extract topics for non-empty pages');

  const pageOutcomes = topics.pageOutcomes || [];
  assert.equal(pageOutcomes.length, 3, 'All 3 pages must have outcomes');

  const p2Outcome = pageOutcomes.find(po => po.page === 2);
  assert.ok(p2Outcome, 'Page 2 must have an outcome record');
  assert.equal(p2Outcome.outcome, 'skipped');
  assert.equal(p2Outcome.reason, 'empty or unreadable');

  const p3Outcome = pageOutcomes.find(po => po.page === 3);
  assert.ok(p3Outcome, 'Page 3 must have an outcome record');
  assert.equal(p3Outcome.outcome, 'topic');

  const consensusTopic = topics.find(t => t.title.toLowerCase().includes('consensus') || t.full_text.toLowerCase().includes('consensus'));
  assert.ok(consensusTopic, 'Must extract consensus topic');
  assert.equal(consensusTopic.page, 3, 'Topic from page 3 must report page 3, not 2');
});

test('Outcome reasons: cancel after page 5 of a 30-page scan asserts pages 6-30 outcome reason is "not processed", not "empty or unreadable"', async () => {
  const mockPages = [];
  for (let i = 1; i <= 30; i++) {
    if (i <= 5) {
      mockPages.push({
        page: i,
        text: `Substantive study topic content for slide ${i}. Detailed explanation of distributed algorithms and metrics for system reliability.`,
        status: 'ocr'
      });
    } else {
      mockPages.push({
        page: i,
        text: '',
        status: 'notProcessed'
      });
    }
  }

  const extracted = {
    text: mockPages.slice(0, 5).map(p => p.text).join('\n\n'),
    pageCount: 30,
    pages: mockPages
  };

  const topics = await extractTopicsFromSections(extracted, 'mock_scan_30.pdf');
  const pageOutcomes = topics.pageOutcomes || [];
  assert.equal(pageOutcomes.length, 30, 'Every page must have an outcome');

  for (let p = 6; p <= 30; p++) {
    const outcome = pageOutcomes.find(po => po.page === p);
    assert.ok(outcome, `Page ${p} must have an outcome record`);
    assert.equal(outcome.outcome, 'skipped');
    assert.ok(
      outcome.reason && outcome.reason.toLowerCase().includes('not processed'),
      `Page ${p} reason must contain "not processed", got: ${outcome.reason}`
    );
    assert.ok(
      !outcome.reason.toLowerCase().includes('empty or unreadable'),
      `Page ${p} reason must not be "empty or unreadable", got: ${outcome.reason}`
    );
  }
});

test('Outcome reasons: immediate cancel before any text found (<20 chars) produces valid notProcessed page outcomes', async () => {
  const mockPages = [];
  for (let i = 1; i <= 10; i++) {
    mockPages.push({
      page: i,
      text: '',
      status: 'notProcessed'
    });
  }

  const extracted = {
    text: '',
    pageCount: 10,
    pages: mockPages
  };

  const topics = await extractTopicsFromSections(extracted, 'immediate_cancelled.pdf');
  assert.equal(topics.length, 0, 'Should return empty topics list when text < 20 characters');

  const pageOutcomes = topics.pageOutcomes || [];
  assert.equal(pageOutcomes.length, 10, 'All 10 pages must have outcome records');
  for (let p = 1; p <= 10; p++) {
    const outcome = pageOutcomes.find(po => po.page === p);
    assert.ok(outcome, `Page ${p} must have an outcome record`);
    assert.equal(outcome.outcome, 'skipped');
    assert.ok(
      outcome.reason && outcome.reason.toLowerCase().includes('not processed'),
      `Page ${p} reason must contain "not processed", got: ${outcome.reason}`
    );
    assert.ok(
      !outcome.reason.toLowerCase().includes('empty or unreadable'),
      `Page ${p} reason must not be "empty or unreadable", got: ${outcome.reason}`
    );
  }
});



