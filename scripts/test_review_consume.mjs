import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStaticApp(distDir) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
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
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

async function runReviewConsumeTest() {
  console.log('================================================================');
  console.log('       REVIEW TOPIC STATE CONSUMPTION TEST                      ');
  console.log('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Dist directory does not exist. Run "npm run build" first.');
  }

  const { server, port } = await serveStaticApp(distDir);
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await page.addInitScript(() => {
      localStorage.setItem('daily_dive_onboarding_seen', 'true');
      localStorage.setItem('daily_dive_first_run_dismissed', 'true');
      const past = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      localStorage.setItem('daily_dive_guest_progress', JSON.stringify({
        'multi-head-self-attention': { times_seen: 2, last_seen: past }
      }));
    });

    await page.goto(`${baseUrl}/#/progress`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="review-queue-section"]');

    // 1. Locate review button in Progress section
    console.log('[Step 1] Finding and clicking Review button on a topic in Progress...');
    const reviewBtn = page.locator('[data-testid="review-queue-section"] button:has-text("Review")').first();
    await reviewBtn.waitFor({ state: 'visible', timeout: 5000 });
    
    // Find the title of topic A being reviewed
    const topicARow = page.locator('[data-testid="review-queue-section"] div:has(> button:has-text("Review"))').first();
    const topicATitle = (await topicARow.locator('span.font-semibold, span.font-medium, div.font-semibold, h3').first().innerText()).trim();
    console.log(`  Topic A to review: "${topicATitle}"`);

    await reviewBtn.click();
    await page.waitForTimeout(800);

    // Verify topic A card is shown in Spin view
    const topicHeading = page.locator('#spin [data-testid="post-spin-topic-card"] h2, #spin article h2').first();
    await topicHeading.waitFor({ state: 'visible', timeout: 5000 });
    const currentTitleAfterReview = (await topicHeading.innerText()).trim();
    assert.match(currentTitleAfterReview, new RegExp(topicATitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Expected card A "${topicATitle}" to be visible`);
    console.log(`  [PASS] Topic card A displayed: "${currentTitleAfterReview}"`);

    // 2. Spin to topic B
    console.log('[Step 2] Spinning to topic B...');
    const spinBtn = page.locator('#spin [data-testid="primary-spin-button"], #spin button:has-text("Spin another")').first();
    await spinBtn.click();

    // Wait for spinning state to finish (~4.7s)
    await page.waitForTimeout(600);
    const spinningBtn = page.locator('button:has-text("Spinning")');
    if (await spinningBtn.isVisible()) {
      await spinningBtn.waitFor({ state: 'detached', timeout: 15000 });
    }
    await page.waitForTimeout(1000);

    const topicBTitle = (await topicHeading.innerText()).trim();
    console.log(`  Topic B after spin: "${topicBTitle}"`);
    assert.notStrictEqual(topicBTitle, topicATitle, 'Topic B must be different from Topic A after spin');
    console.log(`  [PASS] Spun successfully to topic B: "${topicBTitle}"`);

    // 3. Open Settings (unmounts SpinScreen)
    console.log('[Step 3] Opening Settings (unmounting SpinScreen)...');
    const settingsBtn = page.locator('button[aria-label="Settings"]');
    await settingsBtn.click();
    await page.waitForSelector('h1:has-text("Settings"), button:has-text("Back")', { timeout: 5000 });
    console.log('  Settings screen mounted.');

    // 4. Click Back (remounts SpinScreen)
    console.log('[Step 4] Clicking Back (remounting SpinScreen)...');
    const backBtn = page.locator('[data-testid="settings-back-button"], button[aria-label="Back"]').first();
    await backBtn.click();
    await page.waitForSelector('#spin', { timeout: 5000 });
    await page.waitForTimeout(600);

    // 5. Verify card does NOT show topic A
    const cardLocator = page.locator('#spin [data-testid="post-spin-topic-card"] h2, #spin article h2').first();
    const isCardVisible = await cardLocator.isVisible();
    if (isCardVisible) {
      const titleAfterBack = (await cardLocator.innerText()).trim();
      console.log(`  Topic card after returning from Settings: "${titleAfterBack}"`);
      assert.notStrictEqual(titleAfterBack, topicATitle, `Card must not show Topic A ("${topicATitle}")`);
      console.log(`  [PASS] Card shows "${titleAfterBack}", not Topic A ("${topicATitle}")`);
    } else {
      console.log(`  [PASS] Card does not show Topic A ("${topicATitle}"): SpinScreen remounted without stale reviewedTopic.`);
    }

    console.log('\n================================================================');
    console.log('       ALL REVIEW CONSUMPTION ASSERTIONS PASSED!                ');
    console.log('================================================================');
  } finally {
    await browser.close();
    server.close();
  }
}

runReviewConsumeTest().catch((err) => {
  console.error('\n[FAIL]: Review consume test failed:', err);
  process.exit(1);
});
