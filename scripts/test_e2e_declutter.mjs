import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4194) {
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
  { width: 390, height: 844, name: '390x844 (Mobile)' },
  { width: 1280, height: 800, name: '1280x800 (Desktop)' }
];

const FORBIDDEN_STRINGS = [
  'Master Topic Switch',
  'Taxonomy View',
  'of library',
  'Mastered',
  'pool coverage',
  'Retention:',
  'Basis:',
  'Ready for offline use'
];

const REQUIRED_STRINGS = [
  'Send feedback',
  'Reset',
  'Export'
];

async function runDeclutterE2ETests() {
  printLog('================================================================');
  printLog('       ROUND 14: DECLUTTER VERIFICATION E2E SUITE               ');
  printLog('================================================================\n');

  const distDir = path.resolve('dist');
  assert.ok(fs.existsSync(distDir), 'dist directory not found. Please run "npm run build" first.');

  const port = 4194;
  const server = await serveStatic(distDir, port);
  printLog(`Static server listening on http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of VIEWPORTS) {
      printLog(`\nTesting viewport ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('daily_dive_onboarding_seen', 'true');
      });

      await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

      // Visit Spin, Library, and Progress screens to collect page text
      await page.waitForSelector('#spin', { timeout: 10000 });
      const spinText = await page.evaluate(() => document.body.innerText);

      await page.locator('button[data-nav-id="library"]:visible').first().click();
      await page.waitForSelector('#library', { timeout: 10000 });
      const libraryText = await page.evaluate(() => document.body.innerText);

      await page.locator('button[data-nav-id="progress"]:visible').first().click();
      await page.waitForSelector('#progress', { timeout: 10000 });
      const progressText = await page.evaluate(() => document.body.innerText);

      const mainText = `${spinText}\n${libraryText}\n${progressText}`;

      // Open Settings full-screen view via gear button
      await page.locator('header button[aria-label="Settings"]').click();
      await page.waitForSelector('#settings', { timeout: 10000 });
      await page.waitForSelector('a[href*="github.com/SumitMahajan11/Daily-Dive/issues"]', { timeout: 10000 });
      const settingsText = await page.evaluate(() => document.body.innerText);

      const pageText = mainText + '\n' + settingsText;

      // Hard asserts: forbidden strings must NOT be present
      for (const str of FORBIDDEN_STRINGS) {
        assert.equal(
          pageText.includes(str),
          false,
          `[FAIL] Page at ${vp.name} must NOT contain forbidden string "${str}"`
        );
        printLog(`  [PASS] Forbidden string absent: "${str}"`);
      }

      // Hard asserts: required strings MUST be present
      for (const str of REQUIRED_STRINGS) {
        assert.equal(
          pageText.includes(str),
          true,
          `[FAIL] Page at ${vp.name} MUST contain required string "${str}"`
        );
        printLog(`  [PASS] Required string present: "${str}"`);
      }

      // Hard assert: "on your device" appears at most once on the whole page
      const deviceMatches = (pageText.match(/on your device/gi) || []).length;
      assert.ok(
        deviceMatches <= 1,
        `[FAIL] "on your device" appeared ${deviceMatches} times (max allowed: 1)`
      );
      printLog(`  [PASS] "on your device" count: ${deviceMatches} (<= 1)`);

      await context.close();
    }
    printLog('\nAll declutter assertions passed across all viewports!');
  } finally {
    await browser.close();
    server.close();
  }
}

runDeclutterE2ETests().catch((err) => {
  console.error('[FAIL]', err.message);
  process.exit(1);
});
