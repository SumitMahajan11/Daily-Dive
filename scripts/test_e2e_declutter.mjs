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
  console.log('================================================================');
  console.log('       ROUND 14: DECLUTTER VERIFICATION E2E SUITE               ');
  console.log('================================================================\n');

  const distDir = path.resolve('dist');
  assert.ok(fs.existsSync(distDir), 'dist directory not found. Please run "npm run build" first.');

  const port = 4194;
  const server = await serveStatic(distDir, port);
  console.log(`Static server listening on http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\nTesting viewport ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('daily_dive_onboarding_seen', 'true');
      });

      await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

      // Scroll through page to ensure all lazy loaded screens mount
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForSelector('a[href*="github.com/SumitMahajan11/Daily-Dive/issues"]', { timeout: 10000 });
      await page.waitForSelector('#library', { timeout: 10000 });
      await page.waitForSelector('#progress', { timeout: 10000 });
      await page.waitForSelector('#settings', { timeout: 10000 });

      const pageText = await page.evaluate(() => document.body.innerText);

      // Hard asserts: forbidden strings must NOT be present
      for (const str of FORBIDDEN_STRINGS) {
        assert.equal(
          pageText.includes(str),
          false,
          `[FAIL] Page at ${vp.name} must NOT contain forbidden string "${str}"`
        );
        console.log(`  [PASS] Forbidden string absent: "${str}"`);
      }

      // Hard asserts: required strings MUST be present
      for (const str of REQUIRED_STRINGS) {
        assert.equal(
          pageText.includes(str),
          true,
          `[FAIL] Page at ${vp.name} MUST contain required string "${str}"`
        );
        console.log(`  [PASS] Required string present: "${str}"`);
      }

      // Hard assert: "on your device" appears at most once on the whole page
      const deviceMatches = (pageText.match(/on your device/gi) || []).length;
      assert.ok(
        deviceMatches <= 1,
        `[FAIL] "on your device" appeared ${deviceMatches} times (max allowed: 1)`
      );
      console.log(`  [PASS] "on your device" count: ${deviceMatches} (<= 1)`);

      await context.close();
    }
    console.log('\nAll declutter assertions passed across all viewports!');
  } finally {
    await browser.close();
    server.close();
  }
}

runDeclutterE2ETests().catch((err) => {
  console.error('[FAIL]', err.message);
  process.exit(1);
});
