import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import handleShareRequest from '../api/share.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function serveStaticWithShareHandler(distDir) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json'
  };

  const server = http.createServer(async (req, res) => {
    let reqPath = req.url.split('?')[0];

    // Intercept /t/<id> routes with the real serverless function
    if (reqPath.startsWith('/t/')) {
      return await handleShareRequest(req, res);
    }

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
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

function fetchRawHtml(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runSharePagesE2ETests() {
  console.log('================================================================');
  console.log('       ROUND 16: SHARE PAGES & OPEN GRAPH E2E SUITE             ');
  console.log('================================================================\n');

  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Dist directory does not exist. Run "npm run build" first.');
  }

  const { server, port } = await serveStaticWithShareHandler(distDir);
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  // 1. Crawler / Serverless function direct inspection (No JS execution)
  console.log('Testing serverless response for link crawlers (WhatsApp/Facebook/Twitter)...');
  const crawlerRes = await fetchRawHtml(`${baseUrl}/t/multi-head-self-attention`);
  assert.strictEqual(crawlerRes.statusCode, 200, 'Crawler request must return 200 OK');
  assert.ok(crawlerRes.headers['content-type'].includes('text/html'), 'Response must be text/html');
  assert.ok(crawlerRes.body.includes('<meta property="og:type" content="website">'), 'Must contain og:type=website');
  assert.ok(crawlerRes.body.includes('<meta property="og:title" content="Scaled Dot-Product">'), 'Must contain og:title="Scaled Dot-Product"');
  assert.ok(crawlerRes.body.includes('Scaled dot-product attention allows a model to connect every word'), 'Must contain og:description with lesson idea');
  assert.ok(crawlerRes.body.includes(`/t/multi-head-self-attention`), 'Must contain canonical /t/ URL in og:url');
  assert.ok(crawlerRes.body.includes(`/og-default.png`), 'Must contain /og-default.png in og:image');
  assert.ok(crawlerRes.body.includes('<meta name="twitter:card" content="summary_large_image">'), 'Must contain twitter:card');
  console.log('  [PASS] Serverless HTML contains complete Open Graph and Twitter tags for crawlers.');

  // 2. Playwright Browser Tests
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      permissions: ['clipboard-read', 'clipboard-write']
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      localStorage.setItem('daily_dive_onboarding_seen', 'true');
    });

    // TEST A: Opening /t/<id> directly in a browser lands on the topic card
    console.log('\nTesting opening /t/multi-head-self-attention in browser...');
    await page.goto(`${baseUrl}/t/multi-head-self-attention`, { waitUntil: 'networkidle' });

    // Assert that the page redirects and lands on the topic card
    const postSpinCard = page.locator('[data-testid="post-spin-topic-card"]');
    await postSpinCard.waitFor({ state: 'visible', timeout: 7000 });
    assert.strictEqual(await postSpinCard.isVisible(), true, 'Topic card must be visible after /t/<id> redirect');

    const cardTitle = await postSpinCard.locator('h2').textContent();
    assert.strictEqual(cardTitle.trim(), 'Scaled Dot-Product', 'Topic card title must match topic');
    console.log(`  [PASS] Navigating to /t/multi-head-self-attention landed on topic card: "${cardTitle.trim()}".`);

    // TEST B: Clicking Share button copies /t/<id> to clipboard
    console.log('\nTesting Share button copies /t/<id> to clipboard...');
    // Override navigator.share to ensure clipboard path is taken
    await page.evaluate(() => {
      if (navigator.share) delete navigator.share;
    });

    const shareBtn = postSpinCard.locator('button[aria-label="Share topic"]').first();
    await shareBtn.waitFor({ state: 'visible', timeout: 3000 });
    await shareBtn.click();

    const toast = page.locator('text=Link copied');
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    assert.strictEqual(await toast.isVisible(), true, 'Toast "Link copied" must appear');

    const clipboardText = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    assert.strictEqual(
      clipboardText,
      `${baseUrl}/t/multi-head-self-attention`,
      `Clipboard text must match /t/<id> (got: ${clipboardText})`
    );
    console.log(`  [PASS] Share button copied exact /t/<id> URL: ${clipboardText}`);

    // TEST C: Opening /t/unknown-id redirects to / without crash
    console.log('\nTesting unknown topic id redirect...');
    await page.goto(`${baseUrl}/t/unknown-topic-id-999`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const spinHeader = page.locator('#spin');
    await spinHeader.waitFor({ state: 'visible', timeout: 5000 });
    assert.strictEqual(await spinHeader.isVisible(), true, 'Unknown topic redirects to root Spin screen');
    console.log('  [PASS] Unknown topic redirected gracefully to root Spin screen.');

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\nROUND 16 E2E SUITE COMPLETED SUCCESSFULLY!');
  console.log('[PASS]: scripts/test_e2e_share_pages.mjs');
}

runSharePagesE2ETests().catch((err) => {
  console.error('[FAIL] test_e2e_share_pages failed:', err);
  process.exit(1);
});
