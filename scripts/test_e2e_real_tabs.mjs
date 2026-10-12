import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4198) {
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
    if (reqPath === '/' || reqPath.startsWith('/t/')) reqPath = '/index.html';
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
  { width: 1280, height: 800, name: '1280x800 (Desktop)' },
  { width: 390, height: 844, name: '390x844 (Mobile)' }
];

async function runRealTabsE2E() {
  console.log('================================================================');
  console.log('      REAL TABS (SEPARATE SCREENS & URLS) E2E SUITE             ');
  console.log('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" first.');
  }

  const port = 4198;
  const server = await serveStatic(distDir, port);
  const baseUrl = `http://localhost:${port}`;

  const evidenceDir = path.resolve('evidence/real-tabs');
  fs.mkdirSync(evidenceDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n------------------------------------------------------------`);
      console.log(`TESTING VIEWPORT: ${vp.name}`);
      console.log(`------------------------------------------------------------`);

      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('daily_dive_onboarding_seen', 'true');
        localStorage.setItem('daily_dive_first_run_dismissed', 'true');
      });

      // ─────────────────────────────────────────────────────────────
      // a) Library open: #spin, #progress and #library all exist, and #library is scrolled into view (top within 80 px)
      // ─────────────────────────────────────────────────────────────
      console.log('\n[TEST a] Verifying Library open: all 3 sections exist and #library is scrolled into view...');
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#spin');

      // Click Library navigation tab
      const libraryTabBtn = page.locator('button[data-nav-id="library"]:visible').first();
      await libraryTabBtn.click();
      await page.waitForSelector('#library', { state: 'visible', timeout: 5000 });
      await page.waitForTimeout(600);

      // Check all 3 sections exist in DOM and #library is scrolled into view
      const spinSectionCount = await page.locator('#spin').count();
      const progressSectionCount = await page.locator('#progress').count();
      const librarySectionCount = await page.locator('#library').count();
      assert.strictEqual(spinSectionCount, 1, 'Expected #spin section to exist in DOM');
      assert.strictEqual(progressSectionCount, 1, 'Expected #progress section to exist in DOM');
      assert.strictEqual(librarySectionCount, 1, 'Expected #library section to exist in DOM');

      const libraryTop = await page.evaluate(() => {
        const el = document.getElementById('library');
        return el ? el.getBoundingClientRect().top : null;
      });
      assert.ok(libraryTop !== null && libraryTop >= -20 && libraryTop <= 80, `Library section top must be within 80px, got: ${libraryTop}`);
      console.log('  [PASS] (a) Library open: #spin, #progress and #library all exist, and #library is scrolled into view.');

      // ─────────────────────────────────────────────────────────────
      // b) Browser Back returns to the previous screen (scrolled back to #spin)
      // ─────────────────────────────────────────────────────────────
      console.log('\n[TEST b] Verifying Browser Back returns to the previous screen (scrolled to #spin)...');
      // We are currently on Library (#/library). Now click browser Back:
      await page.goBack();
      await page.waitForSelector('#spin', { state: 'visible', timeout: 5000 });
      await page.waitForTimeout(600);

      const spinVisibleAfterBack = await page.locator('#spin').isVisible();
      const spinTopAfterBack = await page.evaluate(() => {
        const el = document.getElementById('spin');
        return el ? el.getBoundingClientRect().top : null;
      });
      assert.strictEqual(spinVisibleAfterBack, true, 'Browser Back must restore the Spin screen');
      assert.ok(spinTopAfterBack !== null && spinTopAfterBack >= -20 && spinTopAfterBack <= 80, `Spin section top must be within 80px after Back, got: ${spinTopAfterBack}`);
      console.log('  [PASS] (b) Browser Back returned successfully: page is scrolled back to #spin.');

      // ─────────────────────────────────────────────────────────────
      // c) Refresh on the Library screen stays on Library
      // ─────────────────────────────────────────────────────────────
      console.log('\n[TEST c] Verifying Refresh on Library screen stays on Library...');
      // Re-navigate to Library
      await page.locator('button[data-nav-id="library"]:visible').first().click();
      await page.waitForSelector('#library', { state: 'visible', timeout: 5000 });

      // Refresh / reload the page
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('#library', { state: 'visible', timeout: 5000 });
      await page.waitForTimeout(600);

      const libraryVisibleAfterReload = await page.locator('#library').isVisible();
      const libraryTopAfterReload = await page.evaluate(() => {
        const el = document.getElementById('library');
        return el ? el.getBoundingClientRect().top : null;
      });
      const currentUrl = page.url();
      assert.strictEqual(libraryVisibleAfterReload, true, 'Library screen must remain visible after page reload');
      assert.ok(libraryTopAfterReload !== null && libraryTopAfterReload >= -20 && libraryTopAfterReload <= 80, `Library section top must be within 80px after reload, got: ${libraryTopAfterReload}`);
      assert.ok(currentUrl.includes('library'), `URL after reload must contain "library", got: ${currentUrl}`);
      console.log('  [PASS] (c) Refresh on Library screen maintained Library view and URL.');

      // ─────────────────────────────────────────────────────────────
      // d) Space on the Library screen (outside an input): a spin starts
      // ─────────────────────────────────────────────────────────────
      console.log('\n[TEST d] Verifying Space key on Library screen starts a spin...');
      // While on Library screen (outside an input), press Spacebar
      await page.keyboard.press('Space');
      await page.waitForTimeout(400);

      const isSpinningAfterSpace = await page.evaluate(() => {
        const spinBtn = document.querySelector('button[data-testid="primary-spin-button"]');
        return spinBtn ? spinBtn.disabled : false;
      });
      assert.strictEqual(isSpinningAfterSpace, true, 'Space on Library (outside an input) must start a spin');
      await page.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 12000 });
      console.log('  [PASS] (d) Space on Library (outside an input) successfully started a spin.');

      // ─────────────────────────────────────────────────────────────
      // e) /t/<id> still opens the topic
      // ─────────────────────────────────────────────────────────────
      console.log('\n[TEST e] Verifying /t/<id> still opens the topic...');
      const testTopicId = 'multi-head-self-attention';
      await page.goto(`${baseUrl}/t/${testTopicId}`, { waitUntil: 'networkidle' });

      // Wait for topic card to render
      await page.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 10000 });
      const topicCardVisible = await page.locator('[data-testid="post-spin-topic-card"]').isVisible();
      const topicHeading = await page.locator('[data-testid="post-spin-topic-card"] h2, #spin article h2').first().innerText();
      const spinVisibleOnDeeplink = await page.locator('#spin').isVisible();
      const spinTopOnDeeplink = await page.evaluate(() => {
        const el = document.getElementById('spin');
        return el ? el.getBoundingClientRect().top : null;
      });

      assert.strictEqual(topicCardVisible, true, `Topic card must be visible when opening /t/${testTopicId}`);
      assert.strictEqual(spinVisibleOnDeeplink, true, 'Spin screen must contain the topic card');
      assert.ok(spinTopOnDeeplink !== null && spinTopOnDeeplink >= -20 && spinTopOnDeeplink <= 80, `Spin section must be scrolled to top on /t/<id>, got: ${spinTopOnDeeplink}`);
      assert.ok(topicHeading.includes('Scaled Dot-Product'), `Expected heading to contain "Scaled Dot-Product", got: "${topicHeading}"`);
      console.log(`  [PASS] (e) Deeplink /t/${testTopicId} opened topic card "${topicHeading}".`);

      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // Capture mobile 390x844 screenshots of all 3 screens
    // ─────────────────────────────────────────────────────────────
    console.log('\n------------------------------------------------------------');
    console.log('CAPTURING SCREENSHOTS AT 390x844 UNDER evidence/real-tabs/');
    console.log('------------------------------------------------------------');

    const snapContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const snapPage = await snapContext.newPage();
    await snapPage.addInitScript(() => {
      localStorage.setItem('daily_dive_onboarding_seen', 'true');
      localStorage.setItem('daily_dive_first_run_dismissed', 'true');
    });

    // 1. Spin Screen
    await snapPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await snapPage.waitForSelector('#spin');
    await snapPage.waitForTimeout(400);
    const spinPath = path.join(evidenceDir, 'spin_390x844.png');
    await snapPage.screenshot({ path: spinPath });
    console.log(`  Saved screenshot: ${spinPath}`);

    // 2. Library Screen
    await snapPage.locator('button[data-nav-id="library"]:visible').first().click();
    await snapPage.waitForSelector('#library');
    await snapPage.waitForTimeout(400);
    const libraryPath = path.join(evidenceDir, 'library_390x844.png');
    await snapPage.screenshot({ path: libraryPath });
    console.log(`  Saved screenshot: ${libraryPath}`);

    // 3. Progress Screen
    await snapPage.locator('button[data-nav-id="progress"]:visible').first().click();
    await snapPage.waitForSelector('#progress');
    await snapPage.waitForTimeout(400);
    const progressPath = path.join(evidenceDir, 'progress_390x844.png');
    await snapPage.screenshot({ path: progressPath });
    console.log(`  Saved screenshot: ${progressPath}`);

    await snapContext.close();

    console.log('\n============================================================');
    console.log('ALL REAL TABS E2E ASSERTIONS PASSED (viewports: 1280x800 & 390x844)');
    console.log('============================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runRealTabsE2E().catch((err) => {
  console.error('[FAIL]: Real tabs E2E test failed:', err);
  process.exit(1);
});
