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

  console.log(`[TEST 1 PDF] Extracted text length: ${result.textLength}, Overlap: ${overlapPct}%, Topics: ${result.topicCount}`);
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

  console.log(`[TEST 2 IMAGE] Extracted text length: ${result.textLength}, Overlap: ${overlapPct}%, Topics: ${result.topicCount}`);
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

  console.log(`[TEST 3 VIDEO] Frames sampled: ${result.frameCount}, Topics: ${result.topicCount}`);
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
  console.log(`[TEST 4 RAW FRAMES] Extracted topics count: ${topics.length}`);
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

  console.log(`[TEST 5 PER-PAGE OCR] Extracted pages: ${result.rawPagesCount}/4, Text length: ${result.textLength}, Topics: ${result.topicCount}`);
  assert.equal(result.rawPagesCount, 4, `Expected all 4 pages extracted (3 OCR + 1 text layer), got ${result.rawPagesCount}`);
  assert.ok(result.text.toLowerCase().includes('consensus') || result.text.toLowerCase().includes('raft'), 'Expected OCR text from page 1 in extracted text');
  assert.ok(result.text.toLowerCase().includes('database') || result.text.toLowerCase().includes('b-tree') || result.text.toLowerCase().includes('lsm'), 'Expected OCR text from page 2 in extracted text');
  assert.ok(result.text.toLowerCase().includes('streaming') || result.text.toLowerCase().includes('kafka'), 'Expected OCR text from page 3 in extracted text');
  assert.ok(result.text.toLowerCase().includes('telemetry') || result.text.toLowerCase().includes('observability'), 'Expected text layer from page 4 in extracted text');
  assert.ok(result.topicCount >= 3, `Expected at least 3 topics from mixed document, got ${result.topicCount}`);
});

