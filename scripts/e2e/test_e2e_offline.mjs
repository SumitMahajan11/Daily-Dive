import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { topics as moneyCareerTopics } from '../../src/data/groups/money-career.js';

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
  printLog('=== [E2E] OFFLINE FUNCTIONALITY & GROUP TOGGLE TEST ===\n');

  const distDir = path.resolve(__dirname, '../../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" before testing.');
  }

  const moneyCareerTitleSet = new Set(
    moneyCareerTopics.map(t => t.title.trim().toLowerCase())
  );
  printLog(`Loaded ${moneyCareerTopics.length} topics from src/data/groups/money-career.js`);

  const { server, port } = await serveStatic(distDir);
  printLog(`1. Static server listening on http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    reducedMotion: 'reduce' // Instant spin for deterministic test
  });
  const page = await context.newPage();

  // 1. Warm up online to precache all screen chunks and assets
  printLog('2. Warming up Service Worker and precaching all lazy-loaded screens...');
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => {
    localStorage.setItem('daily_dive_onboarding_seen', 'true');
    localStorage.setItem('daily_dive_first_run_dismissed', 'true');
  });
  await page.reload();
  await page.waitForSelector('#spin');

  // Navigate to Library to ensure Library chunk is loaded and cached
  await page.locator('[data-nav-id="library"]').first().click();
  await page.waitForSelector('#library input[aria-label="Toggle Money & Career"]', { state: 'attached', timeout: 10000 });

  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }
  });
  printLog('   All screens and group chunks cached.');

  // Return to Spin before going offline
  await page.locator('[data-nav-id="spin"]').first().click();
  await page.waitForSelector('#spin');

  // 2. Go offline
  printLog('3. Simulating network disconnect (context.setOffline(true))...');
  await context.setOffline(true);

  // 3. Reload while offline
  printLog('4. Hard reloading page while fully offline...');
  await page.reload();
  await page.waitForSelector('#spin', { timeout: 10000 });
  printLog('   App loaded cleanly from Service Worker cache while offline.');

  // 4. Navigate to Library to inspect and configure category toggles
  await page.locator('[data-nav-id="library"]').first().click();
  await page.waitForSelector('#library input[aria-label="Toggle Money & Career"]', { state: 'attached', timeout: 10000 });

  const moneyCareerToggle = page.locator('#library input[aria-label="Toggle Money & Career"]');
  const techToggle = page.locator('#library input[aria-label="Toggle Tech"]');
  const mindGrowthToggle = page.locator('#library input[aria-label="Toggle Mind & Growth"]');
  const worldIdeasToggle = page.locator('#library input[aria-label="Toggle World & Ideas"]');

  // a. Before clicking, read whether Money & Career toggle is ON or OFF. Assert OFF.
  const moneyCareerInitial = await moneyCareerToggle.isChecked();
  printLog(`   Initial Money & Career toggle state: ${moneyCareerInitial ? 'ON' : 'OFF'}`);
  assert.equal(moneyCareerInitial, false, 'Money & Career toggle must be OFF initially');

  // b. Turn OFF every other group toggle
  printLog('6. Turning OFF all other group toggles in Library...');
  await page.evaluate(() => {
    const tech = document.querySelector('#library input[aria-label="Toggle Tech"]');
    if (tech && tech.checked) tech.click();
    const mind = document.querySelector('#library input[aria-label="Toggle Mind & Growth"]');
    if (mind && mind.checked) mind.click();
    const world = document.querySelector('#library input[aria-label="Toggle World & Ideas"]');
    if (world && world.checked) world.click();
  });
  await page.waitForTimeout(200);

  const techAfter = await techToggle.isChecked();
  assert.equal(techAfter, false, 'Tech toggle must be OFF');

  const mindGrowthAfter = await mindGrowthToggle.isChecked();
  assert.equal(mindGrowthAfter, false, 'Mind & Growth toggle must be OFF');

  const worldIdeasAfter = await worldIdeasToggle.isChecked();
  assert.equal(worldIdeasAfter, false, 'World & Ideas toggle must be OFF');

  // c. Click Money & Career toggle. Assert it is now ON.
  printLog('7. Turning ON Money & Career toggle in Library...');
  await page.evaluate(() => {
    const mc = document.querySelector('#library input[aria-label="Toggle Money & Career"]');
    if (mc && !mc.checked) mc.click();
  });
  await page.waitForTimeout(200);

  const moneyCareerAfter = await moneyCareerToggle.isChecked();
  printLog(`   Money & Career toggle state after click: ${moneyCareerAfter ? 'ON' : 'OFF'}`);
  assert.equal(moneyCareerAfter, true, 'Money & Career toggle must be ON after click');

  // d. Spin. Read the landed topic title.
  await page.locator('[data-nav-id="spin"]').first().click();
  await page.waitForTimeout(300);

  const spinBtn = page.locator('#spin button[data-testid="primary-spin-button"], #spin button').filter({ hasText: /spin|dive/i }).first();
  await spinBtn.waitFor({ state: 'visible', timeout: 10000 });
  await spinBtn.click();

  await page.waitForSelector('#spin article h2, #spin [data-testid="post-spin-topic-card"] h2, #spin [data-testid="topic-title"], #spin h2', { timeout: 10000 });
  await page.waitForTimeout(300);

  const landedTitle = await page.evaluate(() => {
    const heading = document.querySelector('#spin article h2, #spin [data-testid="post-spin-topic-card"] h2, #spin [data-testid="topic-title"], #spin h2');
    return heading ? heading.textContent.trim() : '';
  });

  printLog(`   Landed Topic Title: "${landedTitle}"`);

  // e. Assert the title is in the topic list of the Money & Career group
  assert.ok(landedTitle.length > 0, 'Landed topic title must be non-empty');
  const isMatch = moneyCareerTitleSet.has(landedTitle.toLowerCase());
  assert.equal(isMatch, true, `Landed topic "${landedTitle}" must belong to Money & Career group topics`);

  printLog('\n[PASS]: Offline group toggle and spin successfully verified with hard assertions.');

  await browser.close();
  server.close();
}

testOffline().catch(err => {
  console.error('\n[FAIL]: Offline E2E test failed:', err);
  process.exit(1);
});
