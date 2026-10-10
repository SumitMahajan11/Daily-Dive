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
  console.log('=== [E2E] OFFLINE FUNCTIONALITY & GROUP TOGGLE TEST ===\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" before testing.');
  }

  const server = await serveStatic(distDir, 4181);
  console.log('1. Static server listening on http://localhost:4181');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Warm up online
  console.log('2. Warming up Service Worker and precached assets online...');
  await page.goto('http://localhost:4181/');
  await page.evaluate(() => {
    localStorage.setItem('daily_dive_onboarding_seen', 'true');
    localStorage.setItem('daily_dive_first_run_dismissed', 'true');
  });
  await page.reload();
  await page.waitForSelector('#spin');

  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }
  });
  console.log('   App shell and group chunks cached.');

  // 2. Go offline
  console.log('3. Simulating network disconnect (context.setOffline(true))...');
  await context.setOffline(true);

  // 3. Reload while offline
  console.log('4. Hard reloading page while fully offline...');
  await page.reload();
  await page.waitForSelector('#spin', { timeout: 10000 });
  console.log('   App loaded cleanly from Service Worker cache while offline.');

  // 4. Enable a group that was off (Money & Career is off by default)
  console.log('5. Enabling "Money & Career" group while offline...');
  await page.evaluate(() => {
    const raw = localStorage.getItem('daily_dive_guest_settings');
    const settings = raw ? JSON.parse(raw) : { enabled_categories: {} };
    settings.enabled_categories = settings.enabled_categories || {};
    settings.enabled_categories['money-career'] = true;
    settings.enabled_categories['money-career::finance'] = true;
    settings.enabled_categories['money-career::career-strategy'] = true;
    localStorage.setItem('daily_dive_guest_settings', JSON.stringify(settings));
    window.location.reload();
  });

  await page.waitForSelector('#spin', { timeout: 10000 });

  // 5. Press Spin
  console.log('6. Pressing Spin button while offline...');
  const spinBtn = page.locator('#spin button').filter({ hasText: /spin|dive/i }).first();
  await spinBtn.click();

  // 6. Hard assert: a real topic title appears
  console.log('7. Waiting for topic result and asserting real topic title...');
  await page.waitForSelector('#spin h2, #spin [data-testid="topic-title"], #spin article h3', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const topicTitle = await page.evaluate(() => {
    const heading = document.querySelector('#spin article h2, #spin article h3, #spin [data-testid="topic-title"], #spin h2');
    return heading ? heading.textContent.trim() : '';
  });

  console.log(`   Landed Topic Title: "${topicTitle}"`);
  assert.ok(topicTitle.length > 3, `Topic title must be a valid non-empty string. Found: "${topicTitle}"`);
  assert.ok(!topicTitle.includes('undefined') && !topicTitle.includes('null'), 'Topic title must not contain undefined or null');

  console.log('\n[PASS]: Offline group toggle and spin successfully verified with hard assertions.');

  await browser.close();
  server.close();
}

testOffline().catch(err => {
  console.error('\n[FAIL]: Offline E2E test failed:', err);
  process.exit(1);
});
