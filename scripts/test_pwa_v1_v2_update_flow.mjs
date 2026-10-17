import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function createDynamicServer(getDistDir, port = 4180) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json'
  };

  const server = http.createServer((req, res) => {
    const distDir = getDistDir();
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(distDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexFile = path.join(distDir, 'index.html');
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      fs.createReadStream(indexFile).pipe(res);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function runUpdateTest() {
  printLog('================================================================');
  printLog('     TEST: PWA V1 -> V2 UPDATE & SEAMLESS RECOVERY TEST         ');
  printLog('================================================================\n');

  const v1Dist = path.resolve('dist_v1');
  const v2Dist = path.resolve('dist_v2');
  let currentDist = v1Dist;

  // Step 1: Build Release V1
  printLog('1. Building Release V1 (Commit stamp: v1-commit-round7)...');
  execSync('npm run build', {
    stdio: 'pipe',
    env: { ...process.env, VITE_COMMIT_HASH: 'v1-commit-round7', VITE_BUILD_DATE: '2026-10-10' }
  });
  if (fs.existsSync(v1Dist)) fs.rmSync(v1Dist, { recursive: true, force: true });
  fs.cpSync(path.resolve('dist'), v1Dist, { recursive: true });
  printLog('   V1 built and staged.');

  // Step 2: Build Release V2
  printLog('2. Building Release V2 (Commit stamp: v2-commit-round7)...');
  execSync('npm run build', {
    stdio: 'pipe',
    env: { ...process.env, VITE_COMMIT_HASH: 'v2-commit-round7', VITE_BUILD_DATE: '2026-10-10' }
  });
  if (fs.existsSync(v2Dist)) fs.rmSync(v2Dist, { recursive: true, force: true });
  fs.cpSync(path.resolve('dist'), v2Dist, { recursive: true });
  printLog('   V2 built and staged.\n');

  // Step 3: Start Server pointing to V1
  currentDist = v1Dist;
  const server = await createDynamicServer(() => currentDist, 4180);
  printLog('3. Static Server listening on http://localhost:4180 (serving V1).');

  // Step 4: Open Browser and Load V1
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:4180/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.waitForSelector('#spin');
  
  // Wait for Service Worker registration and activation
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }
  });
  
  // Reload once to ensure the active SW controls the document
  await page.reload();
  await page.waitForSelector('#spin');
  
  const isControlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  printLog(`4. Client running V1 (SW controller active: ${isControlled}).`);
  assert.ok(isControlled, 'V1 page must be controlled by Service Worker');

  // Verify V1 build stamp in Settings
  const settingsGearBtn = page.locator('header button[aria-label="Settings"]');
  await settingsGearBtn.click();
  await page.waitForSelector('#settings', { state: 'visible', timeout: 3000 });
  const v1SettingsContent = await page.evaluate(() => {
    return document.querySelector('#settings')?.textContent || '';
  });
  assert.ok(v1SettingsContent.includes('v1-commit-round7'), 'Initial page must run V1 build "v1-commit-round7"');

  // Click Back button to return to previous view
  const settingsBackBtn = page.locator('[data-testid="settings-back-button"]');
  await settingsBackBtn.click();
  await page.waitForTimeout(500);

  // Step 5: Deploy V2 to server
  printLog('5. Deploying V2 to server...');
  currentDist = v2Dist;
  printLog('   Server swapped to V2 bundle.');

  // Step 6: User clicks Library WITHOUT reloading
  printLog('6. User clicks Library WITHOUT reloading the page...');
  const libraryBtn = page.locator('aside [data-nav-id="library"], nav button[data-nav-id="library"], nav button:has-text("Library")').first();
  if (await libraryBtn.isVisible()) {
    await libraryBtn.click();
  } else {
    await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
  }
  await page.waitForTimeout(800);

  // Assert recovery: Library screen is visible and interactive
  const libraryVisible = await page.isVisible('#library');
  printLog(`   Library screen recovered and rendered: ${libraryVisible}`);
  assert.ok(libraryVisible, 'Library screen must be visible without crash');

  // Step 7: Trigger SW update check and assert update toast appears
  printLog('7. Triggering Service Worker update check...');
  page.on('console', msg => printLog(`   [Browser Console] ${msg.type()}: ${msg.text()}`));

  const swStatus = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'no-sw';
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return 'no-reg';
    printLog('Current SW controller:', navigator.serviceWorker.controller?.state);
    printLog('Reg active:', reg.active?.state);
    printLog('Reg installing:', reg.installing?.state);
    printLog('Reg waiting:', reg.waiting?.state);
    await reg.update();
    printLog('After update() - installing:', reg.installing?.state, 'waiting:', reg.waiting?.state);
    return {
      hasWaiting: !!reg.waiting,
      hasInstalling: !!reg.installing
    };
  });
  printLog('   SW Status after update():', swStatus);

  await page.waitForSelector('#pwa-update-toast', { timeout: 10000 });
  const toastVisible = await page.isVisible('#pwa-update-toast');
  printLog(`   Update toast visible: ${toastVisible}`);
  assert.ok(toastVisible, 'Update toast #pwa-update-toast must appear on screen');

  const toastText = await page.locator('#pwa-update-toast').innerText();
  printLog(`   Update toast text: "${toastText.replace(/\s+/g, ' ').trim()}"`);
  assert.ok(toastText.includes('Update available'), 'Toast must indicate update availability');

  // Step 8: Click Reload button in update toast
  printLog('8. Clicking "Reload" button in update toast...');
  const reloadBtn = page.locator('#pwa-reload-btn');
  assert.ok(await reloadBtn.isVisible(), 'Reload button #pwa-reload-btn must be clickable');
  await reloadBtn.click();

  await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.waitForSelector('#library, #spin');

  // Step 9: Assert V2 is now active and build stamp changed
  const settingsGearBtnAfterReload = page.locator('header button[aria-label="Settings"]');
  await settingsGearBtnAfterReload.click();
  await page.waitForSelector('#settings', { state: 'visible', timeout: 3000 });

  const v2SettingsContent = await page.evaluate(() => {
    return document.querySelector('#settings')?.textContent || '';
  });
  printLog(`9. Verified V2 loaded after reload.`);
  assert.ok(v2SettingsContent.includes('v2-commit-round7'), `Settings screen must show V2 build stamp "v2-commit-round7". Found: ${v2SettingsContent.slice(0, 200)}`);

  printLog('\n================================================================');
  printLog(' [PASS]: PWA V1 -> V2 UPDATE & RECOVERY TEST PASSED COMPLETELY! ');
  printLog('================================================================\n');

  // Cleanup
  await browser.close();
  server.close();
  if (fs.existsSync(v1Dist)) fs.rmSync(v1Dist, { recursive: true, force: true });
  if (fs.existsSync(v2Dist)) fs.rmSync(v2Dist, { recursive: true, force: true });
}

runUpdateTest().catch(err => {
  console.error('\n[FAIL]: Update test failed:', err);
  process.exit(1);
});
