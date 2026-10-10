import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

function startServer(distPath, port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json',
  };

  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${port}`);
    let reqPath = parsedUrl.pathname;
    if (reqPath === '/') reqPath = '/index.html';

    const filePath = path.join(distPath, reqPath);
    const ext = path.extname(filePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexPath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function captureScreenshots() {
  const PORT = 4193;
  const distDir = path.resolve(process.cwd(), 'dist');
  const server = await startServer(distDir, PORT);
  console.log(`Server started on http://localhost:${PORT}`);

  const evidenceDir = path.resolve(process.cwd(), 'evidence/10');
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });

  const page = await context.newPage();
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. First run screenshot (Hero / Spin screen)
  await page.screenshot({ path: path.join(evidenceDir, '01_first_run.png') });
  console.log('Saved 01_first_run.png');

  // 2. Post-spin screenshot
  const spinBtn = page.locator('button:has-text("Spin the Wheel"), button:has-text("Spin Again"), button:has-text("Explore Random Topic")').first();
  if (await spinBtn.count() > 0) {
    await spinBtn.click();
  } else {
    // Click action button
    await page.locator('#spin button').first().click();
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(evidenceDir, '02_post_spin.png') });
  console.log('Saved 02_post_spin.png');

  // 3. Filter screenshot
  await page.evaluate(() => {
    document.querySelector('#library')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(evidenceDir, '03_filter.png') });
  console.log('Saved 03_filter.png');

  // 4. Extract screenshot (switch to Extract tab in Library)
  const extractTabBtn = page.locator('button:has-text("Extract"), button:has-text("Notes")').first();
  if (await extractTabBtn.count() > 0) {
    await extractTabBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(evidenceDir, '04_extract.png') });
  console.log('Saved 04_extract.png');

  // 5. Progress screenshot
  await page.evaluate(() => {
    document.querySelector('#progress')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(evidenceDir, '05_progress.png') });
  console.log('Saved 05_progress.png');

  // 6. Settings screenshot
  await page.evaluate(() => {
    document.querySelector('#settings')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(evidenceDir, '06_settings.png') });
  console.log('Saved 06_settings.png');

  await browser.close();
  server.close();
  console.log('All 6 screenshots captured in evidence/10/');
}

captureScreenshots().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
