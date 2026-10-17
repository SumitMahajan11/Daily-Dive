import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';
import { extractTopicsFromSections, extractTopicsLocally } from '../src/lib/topicExtractor.js';
import './_setup.mjs';

function createSyntheticMultiPagePdf(pagesData) {
  let out = '%PDF-1.4\n';
  const offsets = [];
  function addObj(str) {
    offsets.push(out.length);
    out += str + '\n';
  }

  const pageCount = pagesData.length;
  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  const kids = [];
  for (let i = 0; i < pageCount; i++) kids.push((4 + i * 2) + ' 0 R');
  addObj('2 0 obj\n<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + pageCount + ' >>\nendobj');
  addObj('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');

  for (let i = 0; i < pageCount; i++) {
    const pageObjNum = 4 + i * 2;
    const contentObjNum = pageObjNum + 1;
    addObj(pageObjNum + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ' + contentObjNum + ' 0 R >>\nendobj');
    const { title, body } = pagesData[i];
    const stream = 'BT /F1 12 Tf 72 712 Td (' + title + ') Tj 0 -24 Td (' + body + ') Tj ET';
    addObj(contentObjNum + ' 0 obj\n<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream\nendobj');
  }

  const xrefOffset = out.length;
  out += 'xref\n0 ' + (offsets.length + 1) + '\n0000000000 65535 f \n';
  for (const off of offsets) out += String(off).padStart(10, '0') + ' 00000 n \n';
  out += 'trailer\n<< /Size ' + (offsets.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
  return Buffer.from(out, 'utf8');
}

test('Synthetic multi-page text PDF: extracts topics for each text page and avoids 1-topic collapse', async () => {
  const pagesData = [
    {
      title: 'Relational Database Design',
      body: 'Relational databases organize structured data into formal relations and tables with integrity constraints and relational algebra foundations.'
    },
    {
      title: 'Normal Forms and Anomalies',
      body: 'Normalization eliminates insertion update and deletion anomalies using functional dependencies Boyce Codd and third normal form definitions.'
    },
    {
      title: 'Query Optimization Strategies',
      body: 'Cost based query optimizers transform abstract algebraic query trees into efficient physical execution plans utilizing index scans.'
    },
    {
      title: 'Schema Modeling and Attributes',
      body: 'MongoDB schemas define document structures with properties like name and rollNo student identification fields for practical web applications.'
    },
    {
      title: 'Transaction Isolation Levels',
      body: 'ACID transactional guarantees prevent dirty reads non repeatable reads and phantom rows using multi version concurrency control locks.'
    }
  ];

  const pdfBuf = createSyntheticMultiPagePdf(pagesData);
  const file = new File([pdfBuf], 'synthetic_database_course.pdf', { type: 'application/pdf' });

  const extracted = await extractFromPdf(file);
  assert.equal(extracted.pageCount, 5, 'Should have exactly 5 pages');
  assert.equal(extracted.pages.length, 5, 'Should return 5 page objects');

  // Test 1: Extraction with section objects (extractTopicsFromSections)
  const sectionTopics = await extractTopicsFromSections(extracted, 'synthetic_database_course.pdf');
  assert.equal(sectionTopics.length, 5, 'Should produce 5 topics for 5 distinct text pages');
  
  // Verify Page 4 was not wrongly skipped as a cover slide due to name/rollNo keywords
  const page4Topic = sectionTopics.find(t => t.page === 4);
  assert.ok(page4Topic, 'Page 4 with schema properties must yield a topic and not be skipped by cover filter');

  // Test 2: Unsectioned raw text extraction (extractTopicsLocally with rawSections = [])
  // Prior to fix, 5 pages collapsed into 1 single topic. With form-feed page splitting, all 5 are recognized.
  const unsectionedTopics = extractTopicsLocally(extracted.text, [], 'synthetic_database_course.pdf');
  assert.equal(unsectionedTopics.length, 5, 'Unsectioned text extraction must extract 5 topics instead of collapsing to 1');
});
