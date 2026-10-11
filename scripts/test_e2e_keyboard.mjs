import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4183) {
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

async function testKeyboard() {
  console.log('=== [E2E] KEYBOARD NAVIGATION & ACCESSIBILITY SHORTCUTS TEST ===\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run npm run build before testing.');
  }

  const server = await serveStatic(distDir, 4183);
  console.log('1. Static server listening on http://localhost:4183');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('2. Loading Daily Dive...');
  await page.goto('http://localhost:4183/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.reload();
  await page.waitForSelector('#spin');

  // Test Space to Spin
  console.log('3. Testing Spacebar key on Spin button...');
  const spinBtn = page.locator('#spin button').filter({ hasText: /spin|dive/i }).first();
  await spinBtn.focus();
  const isFocused = await spinBtn.evaluate(el => document.activeElement === el);
  assert.ok(isFocused, 'Spin button must receive keyboard focus');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);

  // Test Tab Navigation to Library
  console.log('4. Testing Tab and Enter navigation to Library...');
  const libraryNavBtn = page.locator('aside button[data-nav-id="library"], nav button[data-nav-id="library"], nav button:has-text("Library")').first();
  await libraryNavBtn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);

  const libraryInView = await page.evaluate(() => {
    const el = document.getElementById('library');
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top >= -100 && rect.top <= window.innerHeight;
  });
  console.log(`   Library scrolled into view via Enter: ${libraryInView}`);
  assert.ok(libraryInView, 'Enter key on Library nav button must scroll Library into view');

  // Test Escape key behavior (e.g. closing modals or drawers)
  console.log('5. Testing Escape key handling...');
  // Open Settings or reset modal
  const settingsGearBtn = page.locator('header button[aria-label="Settings"]');
  await settingsGearBtn.click();
  await page.waitForSelector('#settings', { state: 'visible', timeout: 3000 });
  
  const resetBtn = page.locator('#reset-all-data-btn');
  await resetBtn.waitFor({ state: 'visible', timeout: 5000 });
  await resetBtn.click();
  await page.waitForTimeout(300);

  // Check that confirmation modal is open
  const modal = page.locator('[role="dialog"], [role="alertdialog"], .modal-container').first();
  await modal.waitFor({ state: 'visible', timeout: 3000 });
  console.log('   Confirmation modal opened, pressing Escape...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  const modalAfterEscape = await modal.isVisible().catch(() => false);
  assert.ok(!modalAfterEscape, 'Escape key must dismiss open modal dialog');
  console.log('   Modal dismissed cleanly by Escape key.');

  console.log('\n[PASS]: Keyboard navigation verified successfully.');

  await browser.close();
  server.close();
}

testKeyboard().catch(err => {
  console.error('\n[FAIL]: Keyboard E2E test failed:', err);
  process.exit(1);
});
