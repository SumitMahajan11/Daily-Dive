import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections, buildExtractionWarning } from '../src/lib/topicExtractor.js';
import './_setup.mjs';

function createMixedTextAndVectorPdf() {
  let out = '%PDF-1.4\n';
  const offsets = [];
  function addObj(str) {
    offsets.push(out.length);
    out += str + '\n';
  }

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  addObj('2 0 obj\n<< /Type /Pages /Kids [4 0 R 6 0 R] /Count 2 >>\nendobj');
  addObj('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');

  // Page 1: Text layer
  addObj('4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>\nendobj');
  const p1Stream = 'BT /F1 12 Tf 72 712 Td (Distributed Systems Principles) Tj 0 -24 Td (Fault tolerance and Byzantine agreement mechanisms maintain state across distributed consensus networks.) Tj ET';
  addObj('5 0 obj\n<< /Length ' + p1Stream.length + ' >>\nstream\n' + p1Stream + '\nendstream\nendobj');

  // Page 2: Vector drawing operators only (0 text items)
  addObj('6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 7 0 R >>\nendobj');
  const p2Stream = '100 100 m 200 200 l S 50 50 150 150 re f 300 300 m 400 400 l S';
  addObj('7 0 obj\n<< /Length ' + p2Stream.length + ' >>\nstream\n' + p2Stream + '\nendstream\nendobj');

  const xrefOffset = out.length;
  out += 'xref\n0 ' + (offsets.length + 1) + '\n0000000000 65535 f \n';
  for (const off of offsets) out += String(off).padStart(10, '0') + ' 00000 n \n';
  out += 'trailer\n<< /Size ' + (offsets.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
  return Buffer.from(out, 'utf8');
}

test('Synthetic vector-only PDF: OCR gating detects 0 text items + drawing operators as needing OCR', async () => {
  const pdfBuf = createMixedTextAndVectorPdf();
  const file = new File([pdfBuf], 'mixed_vector_text.pdf', { type: 'application/pdf' });

  const extracted = await extractFromPdf(file);
  assert.equal(extracted.pageCount, 2);
  assert.equal(extracted.pages.length, 2);

  // Page 1 should be recognized as textLayer
  assert.equal(extracted.pages[0].page, 1);
  assert.equal(extracted.pages[0].status, 'textLayer');

  // Page 2 (vector only) had 0 text items and non-empty drawing ops
  assert.equal(extracted.pages[1].page, 2);
  assert.equal(extracted.pages[1].hasDrawingOps, true, 'Page 2 must have hasDrawingOps = true');
  assert.equal(extracted.pages[1].neededOcr, true, 'Page 2 must have neededOcr = true');
  assert.equal(extracted.pages[1].text.length, 0);

  // In Node environment without canvas, OCR could not run
  assert.equal(extracted.ocrCouldNotRun, true, 'OCR could not run due to no canvas');
  assert.equal(extracted.ocrSkippedReason, 'no canvas');
});

test('Page coverage: page with <20 text chars and no OCR result gets explicit "no text found" page outcome and warning', async () => {
  const pdfBuf = createMixedTextAndVectorPdf();
  const file = new File([pdfBuf], 'mixed_vector_text.pdf', { type: 'application/pdf' });

  const extracted = await extractFromPdf(file);
  const topics = await extractTopicsFromSections(extracted, 'mixed_vector_text.pdf');

  const pageOutcomes = topics.pageOutcomes || [];
  assert.equal(pageOutcomes.length, 2, 'All 2 pages must have page outcomes');

  const p1Outcome = pageOutcomes.find(po => po.page === 1);
  assert.ok(p1Outcome);
  assert.equal(p1Outcome.outcome, 'topic');

  // Page 2 has <20 text chars and no OCR result -> must get explicit "no text found" outcome
  const p2Outcome = pageOutcomes.find(po => po.page === 2);
  assert.ok(p2Outcome, 'Page 2 must have an outcome record');
  assert.equal(p2Outcome.reason, 'no text found', 'Page 2 reason must be "no text found"');
  assert.ok(
    p2Outcome.outcome === 'skipped' || p2Outcome.outcome === 'no text found',
    'Page 2 outcome must be skipped or no text found'
  );

  // Must appear in buildExtractionWarning
  const warning = buildExtractionWarning(pageOutcomes);
  assert.ok(warning, 'Extraction warning must be generated');
  assert.ok(
    warning.includes('Page 2 was skipped: no text found'),
    `Warning should state page 2 was skipped for no text found, got: ${warning}`
  );
});

test('Page coverage: short text (<20 chars) page with no OCR result receives "no text found" outcome', async () => {
  const mockSections = [
    { page: 1, text: 'Valid Title and Content\nThis is substantive body text explaining the architectural model.', status: 'textLayer' },
    { page: 2, text: 'short note', status: 'textLayer' } // 10 chars < 20 chars
  ];

  const topics = await extractTopicsFromSections({ text: 'Valid Title and Content\n...\nshort note', pages: mockSections }, 'short_test.txt');
  const p2Outcome = (topics.pageOutcomes || []).find(po => po.page === 2);

  assert.ok(p2Outcome);
  assert.equal(p2Outcome.reason, 'no text found');
  assert.ok(p2Outcome.outcome === 'skipped' || p2Outcome.outcome === 'no text found');

  const warning = buildExtractionWarning(topics.pageOutcomes);
  assert.ok(warning.includes('Page 2 was skipped: no text found'));
});
