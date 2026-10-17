import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';

let server;
let browser;
let port = 5188;

test.before(async () => {
  try {
    server = await createServer({
      server: { port }
    });
    await server.listen();
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    console.warn('[NOTICE] Playwright browser not available in this environment:', err.message);
  }
});

test.after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
});

test('1. Scanned PDF OCR quality: scanned_tables_document.pdf yields >= 3 topics and word overlap >= 70%', async (t) => {
  if (!browser) {
    t.skip('Playwright Chromium not installed in this runner environment');
    return;
  }
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/`);
  await page.waitForLoadState('networkidle');

  const pdfBuffer = fs.readFileSync('tests/fixtures/scanned_tables_document.pdf');
  const base64Pdf = pdfBuffer.toString('base64');

  const result = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    const file = new File([arr], 'scanned_tables_document.pdf', { type: 'application/pdf' });

    const { extractFromPdf } = await import('/src/lib/extractors/pdfExtractor.js');
    const { extractTopicsFromSections } = await import('/src/lib/topicExtractor.js');

    const extracted = await extractFromPdf(file);
    const topics = await extractTopicsFromSections(extracted, file.name);

    return {
      text: extracted.text,
      textLength: extracted.text.length,
      topicCount: topics.length,
      topics
    };
  }, base64Pdf);

  await page.close();

  // True ground-truth words in scanned_tables_document.pdf
  const expectedPdfWords = new Set(
    ("Network Protocol Performance Analysis Comprehensive benchmarking of Layer transport protocols under varying link conditions Empirical measurements demonstrate significant queue delay reduction with pacing algorithms Database Indexing Strategies Comparison Evaluation of relational and key-value indexing structures for high-concurrency workloads Write amplification remains the governing trade-off in append-heavy write pipelines Distributed Consensus Protocol Characteristics Structural comparison of leader-driven vs leaderless fault-tolerant consensus mechanisms Leaderless approaches eliminate single-node bottlenecks at the expense of conflict resolution complexity")
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
  );

  const words = result.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const matched = new Set();
  words.forEach(w => {
    if (expectedPdfWords.has(w)) matched.add(w);
  });
  const overlapPct = parseFloat(((matched.size / expectedPdfWords.size) * 100).toFixed(1));

  assert.ok(result.topicCount >= 3, `Expected at least 3 topics, got ${result.topicCount}`);
  assert.ok(overlapPct >= 70.0, `Expected word overlap >= 70% (scale 2.5 baseline), got ${overlapPct}%`);
});

test('2. CV Image OCR quality: study_notes_computer_vision.png yields >= 1 topic and word overlap >= 80%', async (t) => {
  if (!browser) {
    t.skip('Playwright Chromium not installed in this runner environment');
    return;
  }
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/`);
  await page.waitForLoadState('networkidle');

  const imgBuffer = fs.readFileSync('tests/fixtures/study_notes_computer_vision.png');
  const base64Img = imgBuffer.toString('base64');

  const result = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    const file = new File([arr], 'study_notes_computer_vision.png', { type: 'image/png' });

    const { extractFromImage } = await import('/src/lib/extractors/imageExtractor.js');
    const { extractTopicsFromSections } = await import('/src/lib/topicExtractor.js');

    const extracted = await extractFromImage(file);
    const topics = await extractTopicsFromSections(extracted, file.name);

    return {
      text: extracted.text,
      textLength: extracted.text.length,
      topicCount: topics.length,
      topics
    };
  }, base64Img);

  await page.close();

  const expectedImgWords = new Set(
    ("Convolutional Feature Extraction layers apply localized mathematical kernels across input images Feature maps detect edge orientations spatial textures semantic shapes Downsampling pooling reduce dimensionality preserve translation invariance Evaluate split accuracy Empirical validation benchmarks indicate residual skip connections mitigate vanishing gradients Deep networks optimize gradient flow stacked LOSS FUNCTION MATRIX Paper Method Cross Entropy Loss Top Accuracy ResNet SGD Vision Transformer Adam")
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
  );

  const words = result.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const matched = new Set();
  words.forEach(w => {
    if (expectedImgWords.has(w)) matched.add(w);
  });
  const overlapPct = parseFloat(((matched.size / expectedImgWords.size) * 100).toFixed(1));

  assert.ok(result.topicCount >= 1, `Expected at least 1 topic from CV image, got ${result.topicCount}`);
  assert.ok(overlapPct >= 80.0, `Expected word overlap >= 80% (2x upscale baseline), got ${overlapPct}%`);
  assert.ok(!result.text.includes('ayersappy'), 'Expected 2x upscale to resolve blurred "layers apply" without artifact "ayersappy"');
});

test('3. Video extraction: lecture_microservices.webm with 2 slides yields >= 2 topics', async (t) => {
  if (!browser) {
    t.skip('Playwright Chromium not installed in this runner environment');
    return;
  }
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/`);
  await page.waitForLoadState('networkidle');

  const videoBuffer = fs.readFileSync('tests/fixtures/lecture_microservices.webm');
  const base64Video = videoBuffer.toString('base64');

  const result = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    const file = new File([arr], 'lecture_microservices.webm', { type: 'video/webm' });

    const { extractFromVideo } = await import('/src/lib/extractors/videoExtractor.js');
    const { extractTopicsFromSections } = await import('/src/lib/topicExtractor.js');

    const extracted = await extractFromVideo(file);
    const topics = await extractTopicsFromSections(extracted, file.name);

    return {
      frameCount: extracted.frameCount,
      duration: extracted.duration,
      textLength: extracted.text.length,
      topicCount: topics.length,
      topics
    };
  }, base64Video);

  await page.close();

  assert.ok(result.topicCount >= 2, `Expected at least 2 topics from 2-slide video, got ${result.topicCount}`);
});

test('4. Topic extraction: extractTopicsFromSections reads rawFrames', async () => {
  const extractedData = {
    text: 'Microservices Architecture Patterns\nIndependent deployment.\n\nAPI Gateway and Reverse Proxies\nCentralizes routing.',
    rawFrames: [
      'Microservices Architecture Patterns\nIndependent deployment and horizontal scaling across decoupled business boundaries.',
      'API Gateway and Reverse Proxies\nCentralizes authentication, rate limiting, and request routing for client applications.'
    ],
    frameCount: 2,
    duration: 6,
    sourceFormat: 'video'
  };
  const { extractTopicsFromSections } = await import('../src/lib/topicExtractor.js');
  const topics = await extractTopicsFromSections(extractedData, 'test_video.mp4');
  assert.equal(topics.length, 2, `Expected 2 topics from rawFrames, got ${topics.length}`);
});

test('5. Per-page OCR gating: synthetic_mixed_document.pdf (3 image pages, 1 text page) extracts all 4 pages via per-page OCR gating', async (t) => {
  if (!browser) {
    t.skip('Playwright Chromium not installed in this runner environment');
    return;
  }
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/`);
  await page.waitForLoadState('networkidle');

  const pdfBuffer = fs.readFileSync('tests/fixtures/synthetic_mixed_document.pdf');
  const base64Pdf = pdfBuffer.toString('base64');

  const result = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    const file = new File([arr], 'synthetic_mixed_document.pdf', { type: 'application/pdf' });

    const { extractFromPdf } = await import('/src/lib/extractors/pdfExtractor.js');
    const { extractTopicsFromSections } = await import('/src/lib/topicExtractor.js');

    const extracted = await extractFromPdf(file);
    const topics = await extractTopicsFromSections(extracted, file.name);

    return {
      text: extracted.text,
      textLength: extracted.text.length,
      rawPagesCount: extracted.rawPages.length,
      rawPages: extracted.rawPages,
      topicCount: topics.length,
      topics
    };
  }, base64Pdf);

  await page.close();

  assert.equal(result.rawPagesCount, 4, `Expected all 4 pages extracted (3 OCR + 1 text layer), got ${result.rawPagesCount}`);
  assert.ok(result.text.toLowerCase().includes('consensus') || result.text.toLowerCase().includes('raft'), 'Expected OCR text from page 1 in extracted text');
  assert.ok(result.text.toLowerCase().includes('database') || result.text.toLowerCase().includes('b-tree') || result.text.toLowerCase().includes('lsm'), 'Expected OCR text from page 2 in extracted text');
  assert.ok(result.text.toLowerCase().includes('streaming') || result.text.toLowerCase().includes('kafka'), 'Expected OCR text from page 3 in extracted text');
  assert.ok(result.text.toLowerCase().includes('telemetry') || result.text.toLowerCase().includes('observability'), 'Expected text layer from page 4 in extracted text');
  assert.ok(result.topicCount >= 3, `Expected at least 3 topics from mixed document, got ${result.topicCount}`);
});

test('6. Playwright test: scan_text 30 pages in real Chromium, cancel after page 5, assert partial pages and notProcessed count', async (t) => {
  if (!browser) {
    t.skip('Playwright Chromium not installed in this runner environment');
    return;
  }
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/`);
  await page.waitForLoadState('networkidle');

  // Build a 30-page scanned (image-only) PDF embedding a 736x920 JPEG with real scan text
  function createScannedPdf(count) {
    const jpgBuf = fs.readFileSync('tests/fixtures/extraction/decision_chain.jpg');
    let out = '%PDF-1.4\n';
    const offsets = [];
    function addObj(str) { offsets.push(Buffer.byteLength(out, 'latin1')); out += str + '\n'; }
    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    const kids = [];
    for (let i = 0; i < count; i++) kids.push((4 + i * 2) + ' 0 R');
    addObj('2 0 obj\n<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + count + ' >>\nendobj');
    addObj('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
    
    const imgObjNum = 4 + count * 2;
    for (let i = 0; i < count; i++) {
      const pageObjNum = 4 + i * 2;
      const contentObjNum = pageObjNum + 1;
      addObj(pageObjNum + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 ' + imgObjNum + ' 0 R >> >> /Contents ' + contentObjNum + ' 0 R >>\nendobj');
      const pstream = 'q 612 0 0 792 0 0 cm /Im1 Do Q';
      addObj(contentObjNum + ' 0 obj\n<< /Length ' + pstream.length + ' >>\nstream\n' + pstream + '\nendstream\nendobj');
    }

    const imgHeader = imgObjNum + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width 736 /Height 920 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpgBuf.length + ' >>\nstream\n';
    offsets.push(Buffer.byteLength(out, 'latin1'));
    const headerBuf = Buffer.from(out + imgHeader, 'latin1');
    const trailerPart = '\nendstream\nendobj\n';
    
    let out2 = trailerPart;
    const xrefOffset = headerBuf.length + jpgBuf.length + Buffer.byteLength(trailerPart, 'latin1');
    out2 += 'xref\n0 ' + (offsets.length + 1) + '\n0000000000 65535 f \n';
    for (const off of offsets) out2 += String(off).padStart(10, '0') + ' 00000 n \n';
    out2 += 'trailer\n<< /Size ' + (offsets.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
    
    return Buffer.concat([headerBuf, jpgBuf, Buffer.from(out2, 'latin1')]);
  }

  const pdfBuffer = createScannedPdf(30);
  const base64Pdf = pdfBuffer.toString('base64');

  const result = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    const file = new File([arr], 'scan_text_30_pages.pdf', { type: 'application/pdf' });

    const { extractFromPdf } = await import('/src/lib/extractors/pdfExtractor.js');
    const { extractTopicsFromSections } = await import('/src/lib/topicExtractor.js');

    const controller = new AbortController();
    const progressEvents = [];
    const onProgress = (p) => {
      progressEvents.push({ ...p });
      // Cancel after page 5 is completed (when OCR page 6 begins):
      if (p.stage && p.stage.toLowerCase().includes('ocr') && p.currentPage > 5) {
        controller.abort();
      }
    };

    const extracted = await extractFromPdf(file, onProgress, { signal: controller.signal });
    const topics = await extractTopicsFromSections(extracted, file.name);

    return {
      textLength: extracted.text.length,
      pageCount: extracted.pageCount,
      warning: extracted.warning,
      pageStats: extracted.pageStats,
      pages: extracted.pages,
      pagesLength: extracted.pages ? extracted.pages.length : 0,
      rawPagesLength: extracted.rawPages ? extracted.rawPages.length : 0,
      pageOutcomes: topics.pageOutcomes,
      progressEvents
    };
  }, base64Pdf);

  await page.close();

  assert.equal(result.pageCount, 30, 'Total pageCount must be 30');
  assert.ok(result.pageStats.ocr >= 5, `Expected at least 5 pages OCR'd, got ${result.pageStats.ocr}`);
  assert.equal(result.pageStats.notProcessed, 30 - result.pageStats.ocr, 'notProcessed count must equal 30 minus processed pages');
  assert.equal(result.pageStats.empty, 0, 'Unprocessed pages must not count as empty');
  assert.ok(result.warning && result.warning.toLowerCase().includes('cancel'), 'Warning must indicate cancellation');
  assert.ok(result.textLength > 0, 'Partial text must be returned');

  // Verify per-page status in pages[]
  assert.equal(result.pagesLength, 30, 'pages[] array must contain all 30 pages');
  assert.ok(Array.isArray(result.pages), 'pages must be an array');
  for (let p = 1; p <= 5; p++) {
    assert.equal(result.pages[p - 1].status, 'ocr', `Page ${p} status should be 'ocr'`);
  }
  for (let p = 6; p <= 30; p++) {
    assert.equal(result.pages[p - 1].status, 'notProcessed', `Page ${p} status should be 'notProcessed'`);
  }

  // Verify page outcomes: pages 6-30 reason is "not processed", not "empty or unreadable"
  assert.ok(Array.isArray(result.pageOutcomes) && result.pageOutcomes.length === 30, 'All 30 pages must have outcomes');
  for (let p = 6; p <= 30; p++) {
    const outcome = result.pageOutcomes.find(po => po.page === p);
    assert.ok(outcome, `Page ${p} must have an outcome record`);
    assert.equal(outcome.outcome, 'skipped', `Page ${p} outcome should be skipped`);
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

