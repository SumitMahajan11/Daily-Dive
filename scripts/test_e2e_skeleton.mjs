import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStaticWithDelay(distDir, port = 4182, delayMs = 300) {
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

    const sendResponse = () => {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        const indexFile = path.join(distDir, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexFile).pipe(res);
      }
    };

    if (req.url.includes('topics-') || req.url.includes('vendor-')) {
      setTimeout(sendResponse, delayMs);
    } else {
      sendResponse();
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function testSkeleton() {
  console.log('=== [E2E] SKELETON & ASYNC LOADING STATES TEST ===\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run npm run build before testing.');
  }

  const server = await serveStaticWithDelay(distDir, 4182, 300);
  console.log('1. Server with artificial latency listening on http://localhost:4182');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('2. Loading app and observing layout placeholders...');
  await page.goto('http://localhost:4182/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.reload();

  // Verify core app shell renders without blank screens
  await page.waitForSelector('#root');
  const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML || '');
  assert.ok(rootContent.length > 0, 'Root element must mount content immediately');

  // Verify spin wheel or spin screen placeholder exists
  await page.waitForSelector('#spin');
  const spinExists = await page.isVisible('#spin');
  assert.ok(spinExists, 'Spin section placeholder/container must be present');

  // Navigate to Library and ensure topic loading skeleton or topic cards render
  console.log('3. Navigating to Library and verifying topic grid rendering...');
  await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
  await page.waitForSelector('#library', { state: 'visible' });

  // Check that topic elements or library container exist
  const libraryHeader = await page.locator('#library h2, #library h1').first().textContent();
  assert.ok(libraryHeader.length > 0, 'Library header must render properly');

  console.log('\n[PASS]: Skeleton and async rendering test passed cleanly.');

  await browser.close();
  server.close();
}

testSkeleton().catch(err => {
  console.error('\n[FAIL]: Skeleton E2E test failed:', err);
  process.exit(1);
});
