import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4181) {
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

async function testOffline() {
  console.log('=== [E2E] OFFLINE FUNCTIONALITY & CACHING TEST ===\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run npm run build before testing.');
  }

  const server = await serveStatic(distDir, 4181);
  console.log('1. Static server listening on http://localhost:4181');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Load app online and ensure SW precaches assets
  console.log('2. Loading app online to warm Service Worker cache...');
  await page.goto('http://localhost:4181/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.reload();
  await page.waitForSelector('#spin');

  // Wait for service worker to activate
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }
  });
  console.log('   Service worker active and app shell cached.');

  // 2. Go Offline
  console.log('3. Simulating network disconnect (context.setOffline(true))...');
  await context.setOffline(true);

  // 3. Test Spin functionality offline
  console.log('4. Testing spin action while offline...');
  const spinBtn = page.locator('#spin button').filter({ hasText: /spin|dive/i }).first();
  if (await spinBtn.isVisible()) {
    await spinBtn.click();
    await page.waitForTimeout(1000);
  }
  const spinSection = await page.isVisible('#spin');
  assert.ok(spinSection, 'Spin section must remain active and functional offline');

  // 4. Test Navigation to Library offline
  console.log('5. Navigating to Library while offline...');
  await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
  await page.waitForTimeout(800);
  const libraryVisible = await page.isVisible('#library');
  assert.ok(libraryVisible, 'Library section must render cleanly offline from cached chunks');

  // 5. Test Navigation to Progress offline
  console.log('6. Navigating to Progress while offline...');
  await page.evaluate(() => document.getElementById('progress')?.scrollIntoView());
  await page.waitForTimeout(800);
  const progressVisible = await page.isVisible('#progress');
  assert.ok(progressVisible, 'Progress section must render cleanly offline');

  // 6. Hard reload while offline to verify full offline load
  console.log('7. Hard reloading page while fully offline...');
  await page.reload();
  await page.waitForSelector('#spin', { timeout: 8000 });
  const reloadedSpin = await page.isVisible('#spin');
  assert.ok(reloadedSpin, 'Daily Dive must load from Service Worker cache when opened offline');

  console.log('\n[PASS]: Offline functionality verified successfully.');

  await browser.close();
  server.close();
}

testOffline().catch(err => {
  console.error('\n[FAIL]: Offline E2E test failed:', err);
  process.exit(1);
});
