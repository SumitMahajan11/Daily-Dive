import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function serveStatic(distDir, port = 4196) {
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

async function captureScreenshots() {
  const distDir = path.resolve('dist');
  const port = 4196;
  const server = await serveStatic(distDir, port);

  const outDir = path.resolve('evidence/14');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('daily_dive_onboarding_seen', 'true');
  });

  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

  // Ensure lazy sections are loaded
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForSelector('#library', { timeout: 10000 });
  await page.waitForSelector('#progress', { timeout: 10000 });
  await page.waitForSelector('#settings', { timeout: 10000 });

  // Capture Library
  const libraryEl = await page.$('#library');
  await libraryEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'library.png') });
  console.log('Saved evidence/14/library.png');

  // Capture Progress
  const progressEl = await page.$('#progress');
  await progressEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'progress.png') });
  console.log('Saved evidence/14/progress.png');

  // Capture Settings
  const settingsEl = await page.$('#settings');
  await settingsEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'settings.png') });
  console.log('Saved evidence/14/settings.png');

  await browser.close();
  server.close();
}

captureScreenshots().catch(err => {
  console.error(err);
  process.exit(1);
});
