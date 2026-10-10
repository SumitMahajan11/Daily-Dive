import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function serveStatic(distDir, port = 4192) {
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
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
    }
  });
  return new Promise(resolve => server.listen(port, () => resolve(server)));
}

async function capture() {
  const outDir = path.resolve(__dirname, '../evidence/8.1');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const server = await serveStatic(path.resolve(__dirname, '../dist'), 4192);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await context.newPage();

  await page.goto('http://localhost:4192/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.reload();
  await page.waitForSelector('#spin');

  const spinBtn = page.locator('#spin button').filter({ hasText: /spin|dive/i }).first();
  await spinBtn.click();
  await page.waitForSelector('#spin article, #spin [data-testid="post-spin-topic-card"]', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const card = page.locator('#spin article, #spin [data-testid="post-spin-topic-card"]').first();
  const targetImg = path.join(outDir, 'post_spin_topic_card.png');
  await card.screenshot({ path: targetImg });
  console.log(`Screenshot saved to: ${targetImg}`);

  await browser.close();
  server.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
