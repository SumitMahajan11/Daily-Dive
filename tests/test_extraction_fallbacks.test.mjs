import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorker } from 'tesseract.js';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import {
  extractTopicsLocally,
  computeExtractionCoverage
} from '../src/lib/topicExtractor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extractionDir = path.resolve(__dirname, 'fixtures/extraction');

let worker = null;
let viteServer = null;
let browser = null;
const port = 5194;

test.before(async () => {
  try {
    worker = await createWorker('eng');
  } catch (err) {
    console.warn('[NOTICE] Tesseract node worker unavailable:', err.message);
  }

  try {
    viteServer = await createServer({
      server: { port }
    });
    await viteServer.listen();
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    console.warn('[NOTICE] Playwright browser not available in this environment:', err.message);
  }
});

test.after(async () => {
  if (worker) {
    await worker.terminate();
  }
  if (browser) {
    await browser.close();
  }
  if (viteServer) {
    await viteServer.close();
  }
});

test('Requirement 4: Text under 20 characters yields 0 topics (triggers generic error in LibraryScreen)', () => {
  assert.deepEqual(extractTopicsLocally('', [], 'empty.txt'), []);
  assert.deepEqual(extractTopicsLocally('Too short text', [], 'short.txt'), []);
  assert.deepEqual(extractTopicsLocally('1234567890123456789', [], 'nineteen.txt'), []);
});

const fixtures = [
  // 5 New Synthetic Files
  { name: 'quote_card.md', type: 'text', description: 'Quote Card' },
  { name: 'bullet_list.md', type: 'text', description: 'Bullet-Only List' },
  { name: 'table_page.md', type: 'text', description: 'Table-Only Page' },
  { name: 'mind_map.png', type: 'image', description: 'Mind-Map Style Image' },
  { name: 'paragraph_note.txt', type: 'text', description: 'One-Paragraph Note' },
  // Real Attached Image
  { name: 'decision_chain.jpg', type: 'image', description: 'Decision Chain Real Image' },
  // Existing Fixtures
  { name: 'code_blocks_fixture.md', type: 'text', description: 'Code Blocks Fixture' },
  { name: 'markdown_roadmap.md', type: 'text', description: 'Markdown Roadmap' },
  { name: 'microservices_architecture_spec.md', type: 'text', description: 'Microservices Architecture Spec' },
  { name: 'nested_lists.md', type: 'text', description: 'Nested Lists Fixture' },
  { name: 'readme_style_fixture.md', type: 'text', description: 'README-Style Markdown' },
  { name: 'real_roadmap.md', type: 'text', description: 'Real Roadmap' },
  { name: 'tables_fixture.md', type: 'text', description: 'Tables Fixture' },
  { name: 'study_notes_computer_vision.png', type: 'image', description: 'Study Notes Computer Vision' },
  { name: 'study_note_neural_nets.png', type: 'image', description: 'Study Note Neural Nets' },
  { name: 'scanned_tables_document.pdf', type: 'pdf', description: 'Scanned Tables Document' }
];

for (const fixture of fixtures) {
  test(`Extraction regression: ${fixture.name} (${fixture.description}) asserts valid topics and coverage`, async (t) => {
    const filePath = path.join(extractionDir, fixture.name);
    assert(fs.existsSync(filePath), `Fixture file missing: ${filePath}`);

    let text = '';
    let topics = [];

    if (fixture.type === 'text') {
      text = fs.readFileSync(filePath, 'utf8');
      topics = extractTopicsLocally(text, [], fixture.name);
    } else if (fixture.type === 'image') {
      if (browser) {
        const page = await browser.newPage();
        await page.goto(`http://localhost:${port}/`);
        await page.waitForLoadState('networkidle');

        const imgBuf = fs.readFileSync(filePath);
        const b64 = imgBuf.toString('base64');
        const mime = fixture.name.endsWith('.png') ? 'image/png' : 'image/jpeg';

        const extracted = await page.evaluate(async ({ b64, name, mime }) => {
          const raw = atob(b64);
          const arr = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
          const file = new File([arr], name, { type: mime });

          const { extractFromImage } = await import('/src/lib/extractors/imageExtractor.js');
          const { extractTopicsFromSections } = await import('/src/lib/topicExtractor.js');

          const data = await extractFromImage(file);
          const tops = await extractTopicsFromSections(data, file.name);
          return {
            text: data.text,
            topics: tops.map(tp => ({ title: tp.title, description: tp.description }))
          };
        }, { b64, name: fixture.name, mime });

        await page.close();
        text = extracted.text;
        topics = extracted.topics;
      } else if (worker) {
        const ret = await worker.recognize(filePath);
        text = ret?.data?.text || '';
        topics = extractTopicsLocally(text, [], fixture.name);
      } else {
        t.skip('Neither browser nor Tesseract worker available');
        return;
      }
    } else if (fixture.type === 'pdf') {
      if (!browser) {
        t.skip('Playwright browser unavailable for real PDF rendering & OCR');
        return;
      }
      const page = await browser.newPage();
      await page.goto(`http://localhost:${port}/`);
      await page.waitForLoadState('networkidle');

      const pdfBuf = fs.readFileSync(filePath);
      const b64 = pdfBuf.toString('base64');

      const extracted = await page.evaluate(async (base64) => {
        const raw = atob(base64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        const file = new File([arr], 'scanned_tables_document.pdf', { type: 'application/pdf' });

        const { extractFromPdf } = await import('/src/lib/extractors/pdfExtractor.js');
        const { extractTopicsFromSections } = await import('/src/lib/topicExtractor.js');

        const data = await extractFromPdf(file);
        const tops = await extractTopicsFromSections(data, file.name);
        return {
          text: data.text,
          topics: tops.map(tp => ({ title: tp.title, description: tp.description }))
        };
      }, b64);

      await page.close();
      text = extracted.text;
      topics = extracted.topics;
    }

    assert(text.trim().length >= 20, `${fixture.name} real extracted text must be >= 20 characters`);
    assert(topics.length > 0, `Expected topics > 0 for ${fixture.name}, got ${topics.length}`);

    const coverage = computeExtractionCoverage(text, topics);

    // Requirement: Coverage of 60% or more on all image & PDF fixtures
    if (fixture.type === 'image' || fixture.type === 'pdf') {
      assert(
        coverage >= 0.60,
        `Expected coverage >= 60% on media fixture ${fixture.name}, got ${(coverage * 100).toFixed(1)}%`
      );
    } else if (text.trim().length < 600) {
      assert(
        coverage >= 0.60,
        `Expected coverage >= 60% for short fixture ${fixture.name}, got ${(coverage * 100).toFixed(1)}%`
      );
    } else {
      // Structured documents must produce >= 1 topic and meaningful non-empty content
      assert(topics.length >= 1, `Expected >= 1 topic for structured ${fixture.name}`);
      assert(coverage > 0.15, `Expected non-zero content preservation for ${fixture.name}`);
    }

    // Assert no topic title ends in bare preposition, ellipsis or trailing delimiter
    for (const top of topics) {
      assert(
        !/[,;:\-–—/\\&+([]\s*$/.test(top.title),
        `Topic "${top.title}" in ${fixture.name} must not end in delimiter`
      );
      assert(
        !top.title.endsWith('…') && !top.title.endsWith('...'),
        `Topic "${top.title}" in ${fixture.name} must not end in ellipsis`
      );
      assert(
        !/\b(?:for|with|of|to|in|on|at|by|from|about|into|through|during|before|after|above|below|under)\s*$/i.test(top.title),
        `Topic "${top.title}" in ${fixture.name} must not end in bare preposition`
      );
    }
  });
}

test('decision_chain.jpg: Real OCR extraction contains all 6 keywords and no noise topics', async (t) => {
  if (!browser) {
    t.skip('Playwright browser unavailable for real OCR image extraction');
    return;
  }
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/`);
  await page.waitForLoadState('networkidle');

  const imgBuf = fs.readFileSync(path.join(extractionDir, 'decision_chain.jpg'));
  const b64 = imgBuf.toString('base64');

  const result = await page.evaluate(async (base64) => {
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    const file = new File([arr], 'decision_chain.jpg', { type: 'image/jpeg' });

    const { extractFromImage } = await import('/src/lib/extractors/imageExtractor.js');
    const { extractTopicsFromSections } = await import('/src/lib/topicExtractor.js');

    const data = await extractFromImage(file);
    const topics = await extractTopicsFromSections(data, file.name);
    return {
      text: data.text,
      topics: topics.map(tp => ({ title: tp.title, description: tp.description }))
    };
  }, b64);

  await page.close();

  const joinedTopicContent = result.topics
    .map(top => `${top.title} ${top.description}`)
    .join(' ')
    .toLowerCase();

  const requiredKeywords = ['decision', 'discipline', 'consistency', 'results', 'identity', 'freedom'];
  for (const kw of requiredKeywords) {
    assert(
      joinedTopicContent.includes(kw),
      `Expected keyword "${kw}" to appear in joined topic content, but got: "${joinedTopicContent}"`
    );
  }

  // Verify no topic is built from OCR noise like "Then NG"
  for (const top of result.topics) {
    assert(!top.title.toLowerCase().includes('then ng'), `Topic title must not be "Then NG": "${top.title}"`);
    assert(!top.description.toLowerCase().includes('then ng'), `Topic description must not contain "Then NG": "${top.description}"`);
  }
});
