import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

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
    server.listen(port, () => resolve(server));
  });
}

async function runRound18Tests() {
  printLog('=== ROUND 18: LOOK + HERO REAL FLOWS VERIFICATION ===\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" before running tests.');
  }

  const server = await serveStatic(distDir, 4192);
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------------------
    // Flow (a): fresh profile with prefers-color-scheme: dark emulated -> dark NOT applied
    // -------------------------------------------------------------------------
    printLog('1. Testing Flow (a): Fresh profile with prefers-color-scheme: dark emulated...');
    const contextA = await browser.newContext({
      colorScheme: 'dark',
      viewport: { width: 1280, height: 800 }
    });
    const pageA = await contextA.newPage();
    await pageA.goto('http://localhost:4192/');
    await pageA.evaluate(() => localStorage.clear());
    await pageA.reload();
    await pageA.waitForSelector('#spin-button, button[data-testid="primary-spin-button"]');

    const htmlClassesA = await pageA.evaluate(() => document.documentElement.className);
    const hasDarkClassA = htmlClassesA.includes('dark');
    const { bodyBgA, btnBgA } = await pageA.evaluate(() => {
      const body = document.body;
      const btn = document.querySelector('#spin-button, button[data-testid="primary-spin-button"]');
      return {
        bodyBgA: window.getComputedStyle(body).backgroundColor,
        btnBgA: btn ? window.getComputedStyle(btn).backgroundColor : null
      };
    });

    printLog(`   - prefers-color-scheme emulated: dark`);
    printLog(`   - <html> classList: "${htmlClassesA}" (contains dark: ${hasDarkClassA})`);
    printLog(`   - Computed body background: ${bodyBgA}`);
    printLog(`   - Computed primary button background: ${btnBgA}`);

    assert.strictEqual(
      hasDarkClassA,
      false,
      `Flow (a) FAIL: Fresh profile must NOT have 'dark' class even when prefers-color-scheme is dark!`
    );
    assert.strictEqual(
      bodyBgA,
      'rgb(247, 243, 236)',
      `Flow (a) FAIL: Body background must match Sep 27 light surface rgb(247, 243, 236), got ${bodyBgA}`
    );
    assert.strictEqual(
      btnBgA,
      'rgb(181, 80, 46)',
      `Flow (a) FAIL: Primary button background must match Sep 27 terracotta rgb(181, 80, 46), got ${btnBgA}`
    );
    printLog('   ✓ PASS Flow (a): Fresh profile defaults to LIGHT (Sep 27 cream surface & terracotta accent)\n');
    await contextA.close();

    // -------------------------------------------------------------------------
    // Flow (b): stored dark choice -> dark applies
    // -------------------------------------------------------------------------
    printLog('2. Testing Flow (b): Stored dark choice in localStorage...');
    const contextB = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const pageB = await contextB.newPage();
    await pageB.goto('http://localhost:4192/');
    await pageB.evaluate(() => {
      localStorage.setItem('daily-dive-theme', 'dark');
    });
    await pageB.reload();
    await pageB.waitForSelector('#spin-button, button[data-testid="primary-spin-button"]');

    const htmlClassesB = await pageB.evaluate(() => document.documentElement.className);
    const hasDarkClassB = htmlClassesB.includes('dark');
    const bodyBgB = await pageB.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

    printLog(`   - Stored theme in localStorage: "dark"`);
    printLog(`   - <html> classList: "${htmlClassesB}" (contains dark: ${hasDarkClassB})`);
    printLog(`   - Computed body background: ${bodyBgB}`);

    assert.strictEqual(
      hasDarkClassB,
      true,
      `Flow (b) FAIL: Stored dark choice must apply 'dark' class to <html>!`
    );
    assert.strictEqual(
      bodyBgB,
      'rgb(28, 26, 23)',
      `Flow (b) FAIL: Dark body background must be rgb(28, 26, 23), got ${bodyBgB}`
    );
    printLog('   ✓ PASS Flow (b): Stored dark choice is respected and dark mode applies\n');
    await contextB.close();

    // -------------------------------------------------------------------------
    // Flow (c): Hero visibility on load for fresh & returning at 390x844 & 1280x800,
    //           hidden after a spin and on /t/<id>
    // -------------------------------------------------------------------------
    printLog('3. Testing Flow (c): Hero visibility across viewports, profiles, spin & deeplink...');

    // 3.1 Fresh profile @ 390x844
    const contextC_MobileFresh = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageC1 = await contextC_MobileFresh.newPage();
    await pageC1.goto('http://localhost:4192/');
    await pageC1.evaluate(() => localStorage.clear());
    await pageC1.reload();
    await pageC1.waitForSelector('[data-testid="spin-hero"]');

    const heroTextC1 = await pageC1.locator('[data-testid="spin-hero"] h1').innerText();
    const heroVisibleC1 = await pageC1.locator('[data-testid="spin-hero"]').isVisible();
    const spinBoxC1 = await pageC1.locator('button[data-testid="primary-spin-button"]').boundingBox();
    const bottomEdgeC1 = spinBoxC1.y + spinBoxC1.height;
    printLog(`   - Fresh @ 390x844: Hero visible = ${heroVisibleC1}, Headline = "${heroTextC1}", Spin bottom = ${bottomEdgeC1.toFixed(1)}px (< 844px)`);
    assert.ok(heroVisibleC1, 'Hero must be visible on fresh profile at 390x844');
    assert.match(heroTextC1, /Learn something new,\s*one spin at a time/i, 'Headline must match Oct 10 hero');
    assert.ok(bottomEdgeC1 < 844, `Spin button bottom edge (${bottomEdgeC1}px) must be < 844px`);
    await contextC_MobileFresh.close();

    // 3.2 Fresh profile @ 1280x800
    const contextC_DeskFresh = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageC2 = await contextC_DeskFresh.newPage();
    await pageC2.goto('http://localhost:4192/');
    await pageC2.evaluate(() => localStorage.clear());
    await pageC2.reload();
    await pageC2.waitForSelector('[data-testid="spin-hero"]');
    const heroVisibleC2 = await pageC2.locator('[data-testid="spin-hero"]').isVisible();
    printLog(`   - Fresh @ 1280x800: Hero visible = ${heroVisibleC2}`);
    assert.ok(heroVisibleC2, 'Hero must be visible on fresh profile at 1280x800');
    await contextC_DeskFresh.close();

    // 3.3 Returning profile @ 390x844
    const contextC_MobileRet = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageC3 = await contextC_MobileRet.newPage();
    await pageC3.goto('http://localhost:4192/');
    await pageC3.evaluate(() => {
      localStorage.setItem('daily_dive_has_spun', 'true');
      localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({ current_streak: 5 }));
    });
    await pageC3.reload();
    await pageC3.waitForSelector('[data-testid="spin-hero"]');
    const heroVisibleC3 = await pageC3.locator('[data-testid="spin-hero"]').isVisible();
    const spinBoxC3 = await pageC3.locator('button[data-testid="primary-spin-button"]').boundingBox();
    const bottomEdgeC3 = spinBoxC3.y + spinBoxC3.height;
    printLog(`   - Returning @ 390x844: Hero visible = ${heroVisibleC3}, Spin bottom = ${bottomEdgeC3.toFixed(1)}px (< 844px)`);
    assert.ok(heroVisibleC3, 'Hero must be visible on returning profile at 390x844 before spin');
    assert.ok(bottomEdgeC3 < 844, `Spin button bottom edge (${bottomEdgeC3}px) must be < 844px for returning user`);
    await contextC_MobileRet.close();

    // 3.4 Returning profile @ 1280x800
    const contextC_DeskRet = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageC4 = await contextC_DeskRet.newPage();
    await pageC4.goto('http://localhost:4192/');
    await pageC4.evaluate(() => {
      localStorage.setItem('daily_dive_has_spun', 'true');
      localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({ current_streak: 5 }));
    });
    await pageC4.reload();
    await pageC4.waitForSelector('[data-testid="spin-hero"]');
    const heroVisibleC4 = await pageC4.locator('[data-testid="spin-hero"]').isVisible();
    printLog(`   - Returning @ 1280x800: Hero visible = ${heroVisibleC4}`);
    assert.ok(heroVisibleC4, 'Hero must be visible on returning profile at 1280x800 before spin');
    await contextC_DeskRet.close();

    // 3.5 Hidden after a spin
    const contextC_Spin = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageC5 = await contextC_Spin.newPage();
    await pageC5.goto('http://localhost:4192/');
    await pageC5.waitForSelector('button[data-testid="primary-spin-button"]');
    // Trigger spin
    await pageC5.locator('button[data-testid="primary-spin-button"]').click();
    // Wait for post-spin topic card to appear
    await pageC5.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 10000 });
    const heroCountAfterSpin = await pageC5.locator('[data-testid="spin-hero"]').count();
    printLog(`   - After spin: Topic card visible = true, Hero count in DOM = ${heroCountAfterSpin}`);
    assert.strictEqual(heroCountAfterSpin, 0, 'Hero must hide after a spin results in a topic card');
    await contextC_Spin.close();

    // 3.6 Hidden on /t/<id>
    const contextC_Deep = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageC6 = await contextC_Deep.newPage();
    await pageC6.goto('http://localhost:4192/t/multi-head-self-attention');
    await pageC6.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 10000 });
    const heroCountDeeplink = await pageC6.locator('[data-testid="spin-hero"]').count();
    printLog(`   - On /t/<id>: Topic card visible = true, Hero count in DOM = ${heroCountDeeplink}`);
    assert.strictEqual(heroCountDeeplink, 0, 'Hero must hide when /t/<id> topic card is shown');
    await contextC_Deep.close();

    printLog('   ✓ PASS Flow (c): Hero visibility and hiding verified across all conditions\n');
  } finally {
    await browser.close();
    server.close();
  }

  printLog('=============================================================');
  printLog('ALL ROUND 18 TESTS PASSED SUCCESSFULLY!');
  printLog('=============================================================\n');
}

runRound18Tests().catch((err) => {
  console.error('[FAIL]: Round 18 tests failed:', err);
  process.exit(1);
});
