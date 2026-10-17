import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4195) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(distDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexFile = path.join(distDir, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexFile).pipe(res);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

const VIEWPORTS = [
  { width: 390, height: 844, name: '390x844 (iPhone 12/13/14)' },
  { width: 360, height: 740, name: '360x740 (Android Compact)' }
];

async function runTopicCardE2ETests() {
  printLog('================================================================');
  printLog('     ROUND 12: TOPIC CARD DEPTH, GO DEEPER & SHARE E2E SUITE     ');
  printLog('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" first.');
  }

  const evidenceDir = path.resolve('evidence/12');
  fs.mkdirSync(evidenceDir, { recursive: true });

  const port = 4195;
  const server = await serveStatic(distDir, port);
  printLog(`1. Static server listening on http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of VIEWPORTS) {
      printLog(`\n============================================================`);
      printLog(` TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
      printLog(`============================================================\n`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        permissions: ['clipboard-read', 'clipboard-write']
      });

      // Override navigator.share to null to test clipboard fallback cleanly
      await context.addInitScript(() => {
        // @ts-ignore
        delete window.navigator.share;
        // @ts-ignore
        delete window.navigator.canShare;
      });

      const page = await context.newPage();

      const syntheticTopic = {
        id: 'synthetic-empty-topic',
        title: 'Synthetic Topic With Empty Resources',
        description: 'This is a synthetic test topic designed specifically to verify that topics with zero resources hide the Go deeper button gracefully.',
        group: 'tech',
        category: 'Algorithms',
        resources: []
      };

      // Clear local storage and seed synthetic custom topic fixture for empty-resources test
      await page.goto(`http://localhost:${port}/`);
      await page.evaluate((fixture) => {
        localStorage.clear();
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify([fixture]));
      }, syntheticTopic);

      // ── TEST (A): Topic with lesson ──────────────────────────────────────────
      printLog('Test (a): Loading topic with lesson (?topic=multi-head-self-attention)...');
      await page.goto(`http://localhost:${port}/?topic=multi-head-self-attention`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 10000 });

      // Assert "The idea", "Why it matters", "Example"
      const lessonBlocks = page.locator('[data-testid="topic-lesson-blocks"]');
      await assert.doesNotReject(async () => {
        await lessonBlocks.waitFor({ state: 'visible', timeout: 5000 });
      }, 'Lesson blocks must be visible for topic with lesson');

      const textContent = await lessonBlocks.textContent();
      assert.ok(textContent.includes('The idea'), 'Must contain "The idea" block label');
      assert.ok(textContent.includes('Why it matters'), 'Must contain "Why it matters" block label');
      assert.ok(textContent.includes('Example'), 'Must contain "Example" block label');

      // Assert "~2 min dive" badge is visible
      const badge = page.locator('text=~2 min dive');
      const hasBadge = await badge.isVisible();
      assert.strictEqual(hasBadge, true, '~2 min dive badge must be visible for topic with lesson');

      // Assert "Spin another" button is visible
      const spinAnotherBtn = page.locator('button:has-text("Spin another")');
      assert.strictEqual(await spinAnotherBtn.isVisible(), true, '"Spin another" button must be visible');

      if (vp.width === 390) {
        await page.screenshot({ path: path.join(evidenceDir, 'card_with_lesson.png'), fullPage: false });
        printLog('  [OK] Saved screenshot: evidence/12/card_with_lesson.png');
      }
      printLog('  [PASS] Test (a): 3 lesson blocks & ~2 min dive badge rendered correctly.');

      // ── TEST (E): Go deeper button full title & no overflow ─────────────────
      printLog('Test (e): Verifying Go deeper button full title and bounding overflow...');
      const goDeeperBtn = page.locator('[data-testid="go-deeper-button"]');
      assert.strictEqual(await goDeeperBtn.isVisible(), true, 'Go deeper button must be visible');
      const goDeeperText = (await goDeeperBtn.textContent()).trim();
      assert.ok(goDeeperText.startsWith('Go deeper:'), 'Go deeper button must start with "Go deeper:"');
      assert.ok(!goDeeperText.includes('...'), 'Go deeper button title must wrap, never truncate with ellipsis');

      // Assert no horizontal overflow
      const overflowMetrics = await goDeeperBtn.evaluate(el => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        offsetWidth: el.offsetWidth
      }));
      assert.ok(
        overflowMetrics.scrollWidth <= overflowMetrics.clientWidth + 2,
        `Go deeper button must not horizontally overflow (scrollWidth: ${overflowMetrics.scrollWidth}, clientWidth: ${overflowMetrics.clientWidth})`
      );
      printLog(`  [PASS] Test (e): Go deeper button rendered "${goDeeperText}" without horizontal overflow.`);

      // ── TEST (D): Share button clipboard fallback & toast ───────────────────
      printLog('Test (d): Clicking share button with navigator.share disabled...');
      const shareBtn = page.locator('button[aria-label="Share topic"]');
      assert.strictEqual(await shareBtn.isVisible(), true, 'Share button must be visible in card toolbar');
      await shareBtn.click();

      // Assert toast "Link copied" appears
      const toast = page.locator('text=Link copied');
      await assert.doesNotReject(async () => {
        await toast.waitFor({ state: 'visible', timeout: 5000 });
      }, 'Toast with "Link copied" must appear');

      // Verify clipboard content matches /t/<id>
      const clipboardText = await page.evaluate(async () => {
        return await navigator.clipboard.readText();
      });
      assert.strictEqual(
        clipboardText,
        `http://localhost:${port}/t/multi-head-self-attention`,
        `Clipboard must contain full /t/<id> share URL (got: ${clipboardText})`
      );
      printLog(`  [PASS] Test (d): Toast "Link copied" shown and clipboard text verified (${clipboardText}).`);

      // ── TEST (B): Topic without lesson ─────────────────────────────────────
      const curatedTopics = JSON.parse(fs.readFileSync(path.resolve('data/topics.curated.json'), 'utf8'));
      const lessonsData = JSON.parse(fs.readFileSync(path.resolve('data/lessons.json'), 'utf8'));
      const topicWithoutLesson = curatedTopics.find(t => !lessonsData[t.id])?.id;
      assert.ok(topicWithoutLesson, 'Must find at least one curated topic without a lesson');

      printLog(`Test (b): Loading topic without lesson (?topic=${topicWithoutLesson})...`);
      await page.goto(`http://localhost:${port}/?topic=${topicWithoutLesson}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 10000 });

      // Assert lesson blocks do NOT exist
      const absentLessonBlocks = page.locator('[data-testid="topic-lesson-blocks"]');
      assert.strictEqual(await absentLessonBlocks.count(), 0, 'Topic without lesson must NOT render lesson blocks');

      // Assert ~2 min dive badge does NOT exist
      const absentBadge = page.locator('text=~2 min dive');
      assert.strictEqual(await absentBadge.count(), 0, '~2 min dive badge must NOT be visible for topic without lesson');

      // Assert description is visible
      const cardText = await page.locator('[data-testid="post-spin-topic-card"]').textContent();
      assert.ok(cardText.length > 50, 'Topic card must render topic description');

      if (vp.width === 390) {
        await page.screenshot({ path: path.join(evidenceDir, 'card_without_lesson.png'), fullPage: false });
        printLog('  [OK] Saved screenshot: evidence/12/card_without_lesson.png');
      }
      printLog('  [PASS] Test (b): Fallback description shown, 3 labels & badge omitted.');

      // ── TEST (C): Unknown topic ID (?topic=does-not-exist) ──────────────────
      printLog('Test (c): Loading unknown topic ID (?topic=does-not-exist)...');
      await page.goto(`http://localhost:${port}/?topic=does-not-exist`, { waitUntil: 'networkidle' });

      // Wait a short moment for resolution to complete
      await page.waitForTimeout(500);

      // Assert spin button is visible and no card is rendered
      const spinBtn = page.locator('#spin button').filter({ hasText: /spin|dive/i }).first();
      assert.strictEqual(await spinBtn.isVisible(), true, 'Spin button must be visible on standard home screen');

      const card = page.locator('[data-testid="post-spin-topic-card"]');
      assert.strictEqual(await card.count(), 0, 'No topic card should be rendered for unknown ID');

      // ── TEST (F): Topic with empty resources hides "Go deeper" ─────────────
      const fixturePage = await context.newPage();
      printLog(`Test (f): Loading synthetic topic with empty resources (?topic=${syntheticTopic.id})...`);
      await fixturePage.goto(`http://localhost:${port}/?topic=${syntheticTopic.id}`, { waitUntil: 'networkidle' });
      await fixturePage.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 10000 });

      // Assert "Go deeper" button does NOT exist
      const absentGoDeeperBtn = fixturePage.locator('[data-testid="go-deeper-button"]');
      assert.strictEqual(await absentGoDeeperBtn.count(), 0, 'UI must hide "Go deeper" when resources is empty');

      // Assert description is rendered
      const emptyCardText = await fixturePage.locator('[data-testid="post-spin-topic-card"]').textContent();
      assert.ok(emptyCardText.length > 50, 'Topic card must render topic description even with empty resources');

      if (vp.width === 390) {
        await fixturePage.screenshot({ path: path.join(evidenceDir, 'card_empty_resources.png'), fullPage: false });
        printLog('  [OK] Saved screenshot: evidence/12/card_empty_resources.png');
      }
      printLog('  [PASS] Test (f): "Go deeper" successfully hidden when resources is empty.');
      await fixturePage.close();

      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  printLog('\n================================================================');
  printLog('     ALL TOPIC CARD E2E TESTS PASSED (10/10 assertions)         ');
  printLog('================================================================\n');
}

runTopicCardE2ETests().catch(err => {
  console.error('[FAIL]: Topic Card E2E Test Suite Failed:', err);
  process.exit(1);
});
