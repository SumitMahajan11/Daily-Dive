import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
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

async function runSpinClearsNotFoundTest() {
  printLog('================================================================');
  printLog('       SPIN CLEARS NOT FOUND STATE TEST                         ');
  printLog('================================================================\n');

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
    });

    // 1. Open unknown topic deeplink
    printLog('[Step 1] Navigating to /t/not-a-real-id...');
    await page.goto(`${baseUrl}/t/not-a-real-id`, { waitUntil: 'networkidle' });

    const notFoundCard = page.locator('[data-testid="topic-not-found-card"]');
    await notFoundCard.waitFor({ state: 'visible', timeout: 5000 });
    const notFoundText = await notFoundCard.innerText();
    assert.match(notFoundText, /Topic not found/i, 'Expected "Topic not found" card to be visible');
    printLog('  [PASS] "Topic not found" card is visible.');

    // 2. Trigger spin
    printLog('[Step 2] Triggering spin while "Topic not found" is displayed...');
    const spinBtn = page.locator('[data-testid="primary-spin-button"]');
    await spinBtn.click();
    await page.waitForTimeout(600);

    // Wait for spinning to finish
    const spinningBtn = page.locator('button:has-text("Spinning")');
    if (await spinningBtn.isVisible()) {
      await spinningBtn.waitFor({ state: 'detached', timeout: 15000 });
    }
    await page.waitForTimeout(1000);

    // 3. Confirm "Topic not found" card is gone and post-spin card is visible
    printLog('[Step 3] Confirming "Topic not found" card is gone after spin lands...');
    const notFoundCount = await page.locator('[data-testid="topic-not-found-card"]').count();
    assert.strictEqual(
      notFoundCount,
      0,
      'Expected "Topic not found" card to be gone after spin lands, but it is still in DOM!'
    );
    printLog('  [PASS] "Topic not found" card is completely gone after spin lands.');

    printLog('\n================================================================');
    printLog('       ALL SPIN CLEARS NOT FOUND CHECKS PASSED!                 ');
    printLog('================================================================');
  } finally {
    await browser.close();
    server.close();
  }
}

runSpinClearsNotFoundTest().catch((err) => {
  console.error('\n[FAIL]: Spin clears not found test failed:', err);
  process.exit(1);
});
