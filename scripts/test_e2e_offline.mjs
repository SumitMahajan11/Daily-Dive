import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { topics as moneyCareerTopics } from '../src/data/groups/money-career.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function serveStatic(distDir) {
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
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

async function testOffline() {
  console.log('=== [E2E] OFFLINE FUNCTIONALITY & GROUP TOGGLE TEST ===\n');

  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" before testing.');
  }

  const moneyCareerTitleSet = new Set(
    moneyCareerTopics.map(t => t.title.trim().toLowerCase())
  );
  console.log(`Loaded ${moneyCareerTopics.length} topics from src/data/groups/money-career.js`);

  const { server, port } = await serveStatic(distDir);
  console.log(`1. Static server listening on http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    reducedMotion: 'reduce' // Instant spin for deterministic test
  });
  const page = await context.newPage();

  // 1. Warm up online to precache all screen chunks and assets
  console.log('2. Warming up Service Worker and precaching all lazy-loaded screens...');
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => {
    localStorage.setItem('daily_dive_onboarding_seen', 'true');
    localStorage.setItem('daily_dive_first_run_dismissed', 'true');
  });
  await page.reload();
  await page.waitForSelector('#spin');

  // Scroll to other screens to trigger dynamic chunk loads for SW precache
  await page.evaluate(() => {
    document.getElementById('library')?.scrollIntoView();
    document.getElementById('progress')?.scrollIntoView();
    document.getElementById('settings')?.scrollIntoView();
    document.getElementById('spin')?.scrollIntoView();
  });
  await page.waitForTimeout(500);

  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }
  });
  console.log('   All screens and group chunks cached.');

  // 2. Go offline
  console.log('3. Simulating network disconnect (context.setOffline(true))...');
  await context.setOffline(true);

  // 3. Reload while offline
  console.log('4. Hard reloading page while fully offline...');
  await page.reload();
  await page.waitForSelector('#spin', { timeout: 10000 });
  await page.waitForSelector('#spin button[data-testid="primary-spin-button"]:not([disabled])', { timeout: 10000 });
  console.log('   App loaded cleanly from Service Worker cache while offline.');

  // 4. Toggle groups on Spin screen while offline
  console.log('5. Configuring group toggles on Spin screen while offline...');
  const techBtn = page.locator('#spin button[aria-label="Toggle Tech"]');
  const moneyBtn = page.locator('#spin button[aria-label="Toggle Money"]');
  const mindBtn = page.locator('#spin button[aria-label="Toggle Mind"]');
  const worldBtn = page.locator('#spin button[aria-label="Toggle World"]');

  // Turn OFF Tech, Mind, World leaving only Money enabled
  await techBtn.click();
  await mindBtn.click();
  await worldBtn.click();
  await page.waitForTimeout(200);

  const moneyPressed = await moneyBtn.getAttribute('aria-pressed');
  assert.equal(moneyPressed, 'true', 'Money button must remain active');

  // 5. Spin while offline
  console.log('6. Pressing Spin button while offline with only Money & Career enabled...');
  const spinBtn = page.locator('#spin button[data-testid="primary-spin-button"]');
  await spinBtn.click();

  await page.waitForSelector('#spin article h2, #spin [data-testid="post-spin-topic-card"] h2, #spin [data-testid="topic-title"], #spin h2', { timeout: 10000 });
  await page.waitForTimeout(300);

  const landedTitle = await page.evaluate(() => {
    const heading = document.querySelector('#spin article h2, #spin [data-testid="post-spin-topic-card"] h2, #spin [data-testid="topic-title"], #spin h2');
    return heading ? heading.textContent.trim() : '';
  });

  console.log(`   Landed Topic Title: "${landedTitle}"`);

  // Assert the title belongs to Money & Career group
  assert.ok(landedTitle.length > 0, 'Landed topic title must be non-empty');
  const isMatch = moneyCareerTitleSet.has(landedTitle.toLowerCase());
  assert.equal(isMatch, true, `Landed topic "${landedTitle}" must belong to Money & Career group topics`);

  console.log('\n[PASS]: Offline group toggle and spin successfully verified with hard assertions.');

  await browser.close();
  server.close();
}

testOffline().catch(err => {
  console.error('\n[FAIL]: Offline E2E test failed:', err);
  process.exit(1);
});
