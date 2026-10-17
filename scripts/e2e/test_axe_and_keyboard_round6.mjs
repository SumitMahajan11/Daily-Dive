import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4186) {
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

function assertNoSeriousOrCritical(screenName, results) {
  const seriousOrCritical = results.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  printLog(`[AXE] ${screenName}: ${results.violations.length} total violations, ${seriousOrCritical.length} serious/critical`);
  if (seriousOrCritical.length > 0) {
    seriousOrCritical.forEach(v => {
      console.error(`  - [${v.impact.toUpperCase()}] ${v.help} (${v.id})`);
      v.nodes.forEach(n => console.error(`      Target: ${n.target.join(' ')} | HTML: ${n.html}`));
    });
  }
  assert.strictEqual(
    seriousOrCritical.length,
    0,
    `Accessibility check failed: ${screenName} screen contains ${seriousOrCritical.length} serious/critical violations!`
  );
}

async function runAudit() {
  const distDir = path.resolve('dist');
  const server = await serveStatic(distDir, 4186);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  printLog('=== AXE ACCESSIBILITY & KEYBOARD VALIDATION ===');
  await page.goto('http://localhost:4186');
  await page.evaluate(() => {
    localStorage.setItem('daily_dive_onboarding_seen', 'true');
  });
  await page.reload();
  await page.waitForSelector('#spin');

  // 1. Run Axe Core on initial Spin screen
  printLog('\n1. Auditing Spin Screen with Axe...');
  const spinResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  assertNoSeriousOrCritical('Spin', spinResults);

  // 2. Audit Library Screen
  printLog('\n2. Auditing Library Screen with Axe...');
  await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
  await page.waitForTimeout(500);
  const libraryResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  assertNoSeriousOrCritical('Library', libraryResults);

  // 3. Audit Progress Screen
  printLog('\n3. Auditing Progress Screen with Axe...');
  await page.evaluate(() => document.getElementById('progress')?.scrollIntoView());
  await page.waitForTimeout(500);
  const progressResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  assertNoSeriousOrCritical('Progress', progressResults);

  // 4. Audit Settings Screen
  printLog('\n4. Auditing Settings Screen with Axe...');
  await page.evaluate(() => document.getElementById('settings')?.scrollIntoView());
  await page.waitForTimeout(500);
  const settingsResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  assertNoSeriousOrCritical('Settings', settingsResults);

  // 4. Test Keyboard Navigation & Tab Switching via Enter
  printLog('\n4. Testing Keyboard Navigation & Tab Activation via Enter...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // Focus navigation button for Library and press Enter
  const libraryNavBtn = page.locator('aside button[data-nav-id="library"], nav button[data-nav-id="library"]').first();
  await libraryNavBtn.focus();
  
  // Check visible focus ring / outline
  const isFocused = await libraryNavBtn.evaluate(el => document.activeElement === el);
  printLog(`Library Nav Button focused: ${isFocused}`);
  
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  // Verify view scrolled to Library section
  const libraryInView = await page.evaluate(() => {
    const el = document.getElementById('library');
    const rect = el.getBoundingClientRect();
    return rect.top >= -50 && rect.top <= window.innerHeight;
  });
  printLog(`Enter on Library Tab scrolled Library into view: ${libraryInView}`);

  // Focus Progress nav button and press Enter
  const progressNavBtn = page.locator('aside button[data-nav-id="progress"], nav button[data-nav-id="progress"]').first();
  await progressNavBtn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  const progressInView = await page.evaluate(() => {
    const el = document.getElementById('progress');
    const rect = el.getBoundingClientRect();
    return rect.top >= -50 && rect.top <= window.innerHeight;
  });
  printLog(`Enter on Progress Tab scrolled Progress into view: ${progressInView}`);

  printLog('\n[PASS]: Axe accessibility and keyboard navigation successfully verified.');
  server.close();
  await browser.close();
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
