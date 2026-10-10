import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4189) {
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

function assertNoSeriousOrCritical(screenName, results) {
  const seriousOrCritical = results.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  console.log(`[AXE] ${screenName}: ${results.violations.length} total violations, ${seriousOrCritical.length} serious/critical`);
  if (seriousOrCritical.length > 0) {
    seriousOrCritical.forEach(v => {
      console.error(`  - [${v.impact.toUpperCase()}] ${v.help} (${v.id})`);
      v.nodes.forEach(n => console.error(`      Target: ${n.target.join(' ')} | HTML: ${n.html}`));
    });
  }
  assert.strictEqual(
    seriousOrCritical.length,
    0,
    `Accessibility check failed: ${screenName} screen contains ${seriousOrCritical.length} serious/critical violations!`
  );
}

async function runVerification() {
  console.log('=== ROUND 9: HERO REDESIGN VERIFICATION & EVIDENCE SUITE ===\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" before running verification.');
  }

  const evidenceDir = path.resolve('evidence/9');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  const server = await serveStatic(distDir, 4189);
  console.log('1. Static server listening on http://localhost:4189');

  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // Test A: Mobile First-Run (390x844)
  // -------------------------------------------------------------
  console.log('\n2. Testing Mobile First-Run layout (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:4189/');
  await mobilePage.evaluate(() => {
    localStorage.clear();
  });
  await mobilePage.reload();
  await mobilePage.waitForSelector('#spin');
  await mobilePage.waitForTimeout(500);

  const spinBtnMobile = mobilePage.locator('#spin button[data-testid="primary-spin-button"], #spin button').filter({ hasText: /spin/i }).first();
  await spinBtnMobile.waitFor({ state: 'visible', timeout: 5000 });

  const boxMobileFirstRun = await spinBtnMobile.boundingBox();
  assert.ok(boxMobileFirstRun, 'Spin button must have a valid bounding box');
  const bottomEdgeFirstRun = boxMobileFirstRun.y + boxMobileFirstRun.height;
  console.log(`   Spin Button Bounding Box (First-Run Mobile 390x844):`);
  console.log(`   - Top (y): ${boxMobileFirstRun.y.toFixed(1)}px`);
  console.log(`   - Height: ${boxMobileFirstRun.height.toFixed(1)}px`);
  console.log(`   - Bottom Edge: ${bottomEdgeFirstRun.toFixed(1)}px`);
  console.log(`   - Viewport Height: 844px`);

  // Hard assertion: bottom edge must be < 844
  assert.ok(
    bottomEdgeFirstRun < 844,
    `Spin button bottom edge (${bottomEdgeFirstRun}px) must be less than 844px on 390x844 phone!`
  );
  console.log(`   ✓ PASS: Spin button bottom edge (${bottomEdgeFirstRun.toFixed(1)}px < 844px) is fully visible without scrolling!`);

  // Capture First-Run Mobile Screenshot
  const firstRunMobilePath = path.join(evidenceDir, 'spin_first_run_390x844.png');
  await mobilePage.screenshot({ path: firstRunMobilePath, fullPage: false });
  console.log(`   Saved screenshot: ${firstRunMobilePath}`);

  // Axe on First-Run
  console.log('\n3. Auditing First-Run Spin Screen with Axe...');
  const firstRunAxe = await new AxeBuilder({ page: mobilePage })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  assertNoSeriousOrCritical('Mobile First-Run Spin', firstRunAxe);

  // -------------------------------------------------------------
  // Test B: Mobile Returning (390x844)
  // -------------------------------------------------------------
  console.log('\n4. Testing Mobile Returning layout (390x844)...');
  await mobilePage.evaluate(() => {
    localStorage.setItem('daily_dive_has_spun', 'true');
    localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({
      current_streak: 4,
      longest_streak: 7,
      last_active_date: new Date().toISOString().split('T')[0]
    }));
    localStorage.setItem('daily_dive_guest_progress', JSON.stringify({
      't1': { times_seen: 2, last_seen: new Date().toISOString() },
      't2': { times_seen: 1, last_seen: new Date().toISOString() },
      't3': { times_seen: 1, last_seen: new Date().toISOString() }
    }));
    localStorage.setItem('daily_dive_guest_history', JSON.stringify([
      { id: 'h1', topic_id: 't1', action: 'spin', local_date: new Date().toISOString().split('T')[0] }
    ]));
  });
  await mobilePage.reload();
  await mobilePage.waitForSelector('#spin');
  await mobilePage.waitForTimeout(500);

  const spinBtnMobileRet = mobilePage.locator('#spin button[data-testid="primary-spin-button"], #spin button').filter({ hasText: /spin/i }).first();
  const boxMobileRet = await spinBtnMobileRet.boundingBox();
  assert.ok(boxMobileRet, 'Spin button must have a valid bounding box in returning view');
  const bottomEdgeRet = boxMobileRet.y + boxMobileRet.height;
  console.log(`   Spin Button Bounding Box (Returning Mobile 390x844):`);
  console.log(`   - Top (y): ${boxMobileRet.y.toFixed(1)}px`);
  console.log(`   - Height: ${boxMobileRet.height.toFixed(1)}px`);
  console.log(`   - Bottom Edge: ${bottomEdgeRet.toFixed(1)}px`);
  assert.ok(bottomEdgeRet < 844, `Spin button bottom edge (${bottomEdgeRet}px) must be less than 844px in returning view!`);
  console.log(`   ✓ PASS: Spin button bottom edge (${bottomEdgeRet.toFixed(1)}px < 844px) is fully visible without scrolling!`);

  // Capture Returning Mobile Screenshot
  const returningMobilePath = path.join(evidenceDir, 'spin_returning_390x844.png');
  await mobilePage.screenshot({ path: returningMobilePath, fullPage: false });
  console.log(`   Saved screenshot: ${returningMobilePath}`);

  // Axe on Returning
  console.log('\n5. Auditing Returning Spin Screen with Axe...');
  const returningAxe = await new AxeBuilder({ page: mobilePage })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  assertNoSeriousOrCritical('Mobile Returning Spin', returningAxe);

  await mobileContext.close();

  // -------------------------------------------------------------
  // Test C: Desktop First-Run (1280x800)
  // -------------------------------------------------------------
  console.log('\n6. Testing Desktop First-Run layout (1280x800)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:4189/');
  await desktopPage.evaluate(() => {
    localStorage.clear();
  });
  await desktopPage.reload();
  await desktopPage.waitForSelector('#spin');
  await desktopPage.waitForTimeout(500);

  const firstRunDesktopPath = path.join(evidenceDir, 'spin_first_run_1280x800.png');
  await desktopPage.screenshot({ path: firstRunDesktopPath, fullPage: false });
  console.log(`   Saved screenshot: ${firstRunDesktopPath}`);

  // -------------------------------------------------------------
  // Test D: Desktop Returning (1280x800)
  // -------------------------------------------------------------
  console.log('\n7. Testing Desktop Returning layout (1280x800)...');
  await desktopPage.evaluate(() => {
    localStorage.setItem('daily_dive_has_spun', 'true');
    localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({
      current_streak: 4,
      longest_streak: 7,
      last_active_date: new Date().toISOString().split('T')[0]
    }));
    localStorage.setItem('daily_dive_guest_progress', JSON.stringify({
      't1': { times_seen: 2, last_seen: new Date().toISOString() },
      't2': { times_seen: 1, last_seen: new Date().toISOString() },
      't3': { times_seen: 1, last_seen: new Date().toISOString() }
    }));
    localStorage.setItem('daily_dive_guest_history', JSON.stringify([
      { id: 'h1', topic_id: 't1', action: 'spin', local_date: new Date().toISOString().split('T')[0] }
    ]));
  });
  await desktopPage.reload();
  await desktopPage.waitForSelector('#spin');
  await desktopPage.waitForTimeout(500);

  const returningDesktopPath = path.join(evidenceDir, 'spin_returning_1280x800.png');
  await desktopPage.screenshot({ path: returningDesktopPath, fullPage: false });
  console.log(`   Saved screenshot: ${returningDesktopPath}`);

  await desktopContext.close();
  await browser.close();
  server.close();

  console.log('\n=============================================================');
  console.log('ALL ROUND 9 VERIFICATION AND ARTIFACT GENERATIONS PASSED!');
  console.log('=============================================================\n');
}

runVerification().catch(err => {
  console.error('\n[FAIL]: Round 9 verification failed:', err);
  process.exit(1);
});
