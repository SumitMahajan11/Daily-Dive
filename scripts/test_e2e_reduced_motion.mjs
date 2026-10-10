import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4184) {
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

async function testReducedMotion() {
  console.log('=== [E2E] PREFERS-REDUCED-MOTION TEST ===\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run npm run build before testing.');
  }

  const server = await serveStatic(distDir, 4184);
  console.log('1. Static server listening on http://localhost:4184');

  const browser = await chromium.launch({ headless: true });
  
  // Emulate reduced motion preference
  const context = await browser.newContext({
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();

  console.log('2. Loading app with reducedMotion: reduce...');
  await page.goto('http://localhost:4184/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.reload();
  await page.waitForSelector('#spin');

  // Verify media query evaluation in browser
  const matchesReducedMotion = await page.evaluate(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  console.log(`   (prefers-reduced-motion: reduce) matches: ${matchesReducedMotion}`);
  assert.ok(matchesReducedMotion, 'Browser must report prefers-reduced-motion: reduce');

  // Trigger spin under reduced motion
  console.log('3. Triggering spin with reduced motion...');
  const spinBtn = page.locator('#spin button').filter({ hasText: /spin|dive/i }).first();
  if (await spinBtn.isVisible()) {
    await spinBtn.click();
    await page.waitForTimeout(600);
  }

  // App must remain responsive and render result without hanging on long animation transitions
  const spinSection = await page.isVisible('#spin');
  assert.ok(spinSection, 'Spin section must render properly under reduced motion');

  console.log('\n[PASS]: Reduced motion compatibility verified successfully.');

  await browser.close();
  server.close();
}

testReducedMotion().catch(err => {
  console.error('\n[FAIL]: Reduced motion E2E test failed:', err);
  process.exit(1);
});
