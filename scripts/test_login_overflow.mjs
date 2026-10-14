import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4225) {
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
    if (reqPath === '/' || reqPath.startsWith('/t/')) reqPath = '/index.html';
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
    server.listen(port, () => resolve({ server, port }));
  });
}

async function testLoginRenderingAndOverflow() {
  console.log('================================================================');
  console.log('   TEST: /login RENDERING AND NO HORIZONTAL OVERFLOW AT 360x800 ');
  console.log('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" first.');
  }

  const { server, port } = await serveStatic(distDir, 4225);
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await page.goto(`http://127.0.0.1:${port}/#/login`, { waitUntil: 'networkidle' });

    console.log('[1/4] Verifying /login route renders [data-testid="login-screen"]...');
    const loginScreen = page.locator('[data-testid="login-screen"]');
    await loginScreen.waitFor({ state: 'visible', timeout: 5000 });
    const isVisible = await loginScreen.isVisible();
    assert.strictEqual(isVisible, true, '/login screen must be visible');
    console.log('  [PASS] /login screen is rendered and visible.');

    console.log('\n[2/4] Asserting form elements visibility...');
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    const googleBtn = page.locator('[data-testid="google-auth-btn"]');
    const hasEmail = (await emailInput.count()) > 0;
    if (hasEmail) {
      const emailVisible = await emailInput.isVisible();
      const googleVisible = await googleBtn.isVisible();
      assert.strictEqual(emailVisible, true, 'Email input must be visible on /login');
      assert.strictEqual(googleVisible, true, 'Google button must be visible on /login');
      console.log(`  [PASS] Email field is visible: ${emailVisible}`);
      console.log(`  [PASS] Google button is visible: ${googleVisible}`);
    } else {
      const unconfNotice = page.locator('text=Sign-in isn\'t set up yet.');
      await unconfNotice.waitFor({ state: 'visible', timeout: 5000 });
      const unconfVisible = await unconfNotice.isVisible();
      assert.strictEqual(unconfVisible, true, 'Unconfigured notice must be visible');
      console.log(`  [PASS] Unconfigured notice is visible: ${unconfVisible}`);
    }

    console.log('\n[3/4] Measuring horizontal overflow at 360x800...');
    const overflowMetrics = await page.evaluate(() => {
      function isClippedByAncestor(el) {
        let p = el.parentElement;
        while (p && p !== document.body && p !== document.documentElement) {
          const s = window.getComputedStyle(p);
          if (s.overflow === 'hidden' || s.overflowX === 'hidden' || s.overflow === 'clip' || s.overflowX === 'clip') {
            return true;
          }
          p = p.parentElement;
        }
        return false;
      }

      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = doc.clientWidth;
      const innerWidth = window.innerWidth;

      let worstEl = null;
      let worstRight = 0;

      document.querySelectorAll('*').forEach((el) => {
        if (isClippedByAncestor(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.right > worstRight) {
          worstRight = rect.right;
          worstEl = {
            tag: el.tagName.toLowerCase(),
            className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          };
        }
      });

      return {
        scrollWidth,
        clientWidth,
        innerWidth,
        worstRight,
        worstEl,
        overflows: scrollWidth > clientWidth || worstRight > innerWidth + 0.5
      };
    });

    console.log(`  scrollWidth: ${overflowMetrics.scrollWidth}px`);
    console.log(`  clientWidth: ${overflowMetrics.clientWidth}px`);
    console.log(`  innerWidth:  ${overflowMetrics.innerWidth}px`);
    console.log(`  worstRight:  ${overflowMetrics.worstRight}px (${overflowMetrics.worstEl?.tag}.${overflowMetrics.worstEl?.className})`);

    assert.ok(
      overflowMetrics.scrollWidth <= overflowMetrics.clientWidth,
      `scrollWidth (${overflowMetrics.scrollWidth}px) exceeds clientWidth (${overflowMetrics.clientWidth}px)`
    );
    assert.ok(
      overflowMetrics.worstRight <= overflowMetrics.innerWidth + 0.5,
      `Element bounds right (${overflowMetrics.worstRight}px) exceeds innerWidth (${overflowMetrics.innerWidth}px)`
    );
    assert.strictEqual(overflowMetrics.overflows, false, 'No horizontal overflow allowed at 360x800');
    console.log('  [PASS] No horizontal overflow detected at 360x800.');

    console.log('\n[4/4] Verifying interactive controls within viewport bounds...');
    const loginCard = page.locator('[data-testid="login-screen"]');
    const bbox = await loginCard.boundingBox();
    assert.ok(bbox, 'Login card bounding box must exist');
    assert.ok(bbox.width <= 360, `Login card width (${bbox.width}px) must be <= 360px`);
    console.log(`  [PASS] Login card width: ${bbox.width}px <= 360px.`);

    console.log('\n[SUCCESS] /login renders without overflow at 360x800.');
  } finally {
    await browser.close();
    server.close();
  }
}

testLoginRenderingAndOverflow().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
