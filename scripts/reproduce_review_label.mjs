import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

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

async function main() {
  const { server, port } = await serveStatic(path.resolve('dist'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://127.0.0.1:${port}/`);
    
    // Seed last_seen = yesterday 20:00 local
    await page.evaluate(() => {
      localStorage.clear();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(20, 0, 0, 0);
      
      const progress = {
        'multi-head-self-attention': {
          times_seen: 1,
          last_seen: yesterday.toISOString(),
          learned: false
        }
      };
      localStorage.setItem('daily_dive_guest_progress', JSON.stringify(progress));
    });
    
    await page.reload();
    
    // Open Progress screen
    await page.click('button[data-nav-id="progress"]:visible');
    await page.waitForTimeout(500);
    
    // Wait for review queue age label
    const ageLabelLocator = page.locator('[data-testid="review-queue-age"]').first();
    await ageLabelLocator.waitFor({ timeout: 5000 });
    const labelText = (await ageLabelLocator.innerText()).trim();
    console.log(`ROW_LABEL: "${labelText}"`);
    if (labelText === 'Today') {
      throw new Error(`Review queue row label failed: expected "1d ago", got "${labelText}"`);
    }
    if (labelText !== '1d ago') {
      throw new Error(`Review queue row label unexpected: expected "1d ago", got "${labelText}"`);
    }
    console.log('[PASS]: Review queue age label is "1d ago"');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
