import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir) {
  const mimeTypes = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json'
  };
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const resolvedPath = path.resolve(distDir, '.' + reqPath);
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      const ext = path.extname(resolvedPath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(resolvedPath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function testLibraryWrappingAtWidth(port, width) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(`http://127.0.0.1:${port}/#/library`);
    await page.waitForSelector('#library');
    await page.waitForTimeout(500);

    const summaries = page.locator('[data-testid^="library-group-summary-"]');
    const count = await summaries.count();
    assert.strictEqual(count, 4, `Must find 4 group summaries in Library, found: ${count}`);

    for (let i = 0; i < count; i++) {
      const el = summaries.nth(i);
      const text = await el.innerText();
      const testId = await el.getAttribute('data-testid');

      // Check line count in browser layout
      const lineCount = await el.evaluate((node) => {
        const cs = window.getComputedStyle(node);
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25;
        const h = node.getBoundingClientRect().height;
        return Math.max(1, Math.round(h / lh));
      });

      printLog(`[Width ${width}px] ${testId}: "${text}" -> lines: ${lineCount}`);
      assert.strictEqual(lineCount, 1, `Group summary "${text}" at ${width}px must NOT wrap (lineCount must be 1, found ${lineCount})`);
    }
  } finally {
    await browser.close();
  }
}

async function run() {
  const { server, port } = await serveStatic(path.resolve('dist'));
  try {
    printLog('Testing Library group row wrapping at 390px wide...');
    await testLibraryWrappingAtWidth(port, 390);

    printLog('Testing Library group row wrapping at 360px wide...');
    await testLibraryWrappingAtWidth(port, 360);

    printLog('[PASS] All Library group rows maintain strictly 1 line on 390px and 360px viewports.');
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
