import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function serveStatic(distDir) {
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
    const resolvedPath = path.resolve(distDir, '.' + reqPath);
    if (!resolvedPath.startsWith(path.resolve(distDir))) {
      res.writeHead(403);
      res.end();
      return;
    }

    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      const ext = path.extname(resolvedPath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(resolvedPath).pipe(res);
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

async function runRound15E2ETests() {
  console.log('================================================================');
  console.log('       ROUND 15: VERIFICATION E2E SUITE                         ');
  console.log('================================================================\n');

  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Dist directory does not exist. Run "npm run build" first.');
  }

  const { server, port } = await serveStatic(distDir);
  console.log(`Static server listening on http://127.0.0.1:${port}`);

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    // ── 1. SPIN GROUP PILLS: ON / OFF STYLES & ARIA-PRESSED ──────────────
    console.log('Testing Spin Group Pills (ON/OFF styles, dots, and aria-pressed)...');
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });

    const techPill = page.locator('[data-testid="spin-group-pill-tech"]');
    const moneyPill = page.locator('[data-testid="spin-group-pill-money-career"]');

    await techPill.waitFor({ state: 'visible', timeout: 5000 });
    await moneyPill.waitFor({ state: 'visible', timeout: 5000 });

    // Assert initial ON state
    const techInitialPressed = await techPill.getAttribute('aria-pressed');
    assert.strictEqual(techInitialPressed, 'true', 'Tech pill initially has aria-pressed="true"');

    // Click Tech pill OFF
    await techPill.click();
    await page.waitForTimeout(100);

    const techAfterPressed = await techPill.getAttribute('aria-pressed');
    assert.strictEqual(techAfterPressed, 'false', 'Tech pill after click has aria-pressed="false"');

    const moneyPressed = await moneyPill.getAttribute('aria-pressed');
    assert.strictEqual(moneyPressed, 'true', 'Money pill remains ON with aria-pressed="true"');

    // Compare computed background-color
    const techBg = await techPill.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const moneyBg = await moneyPill.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    console.log(`  Tech (OFF) computed background: ${techBg}`);
    console.log(`  Money (ON) computed background: ${moneyBg}`);
    assert.notStrictEqual(techBg, moneyBg, 'Computed background-color of OFF pill must differ from ON pill');
    console.log('  [PASS] Spin group pill OFF aria-pressed is false and computed background-color differs from ON pill.');

    // ── 2. LIBRARY SCREEN: UPLOAD COPY & GEMINI PRIVACY NOTICE ───────────
    console.log('\nTesting Library Screen upload copy & Gemini disclosure notice...');
    await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
    await page.waitForTimeout(300);

    const libraryBodyText = await page.innerText('#library');
    assert.ok(
      !libraryBodyText.includes('collection tray'),
      'Library screen text must NOT contain "collection tray"'
    );
    console.log('  [PASS] Forbidden string absent: "collection tray"');

    assert.ok(
      libraryBodyText.includes('Drop files here or choose a file'),
      'Library screen must contain "Drop files here or choose a file"'
    );
    console.log('  [PASS] Upload line contains: "Drop files here or choose a file"');

    // Expand "Improve results (optional)" panel
    const detailsSummary = page.locator('#library summary:has-text("Improve results (optional)")');
    await detailsSummary.click();
    await page.waitForTimeout(200);

    const updatedLibraryText = await page.innerText('#library');
    const expectedGeminiNotice = 'If you add a Gemini key, extracted text is sent to Google.';
    assert.ok(
      updatedLibraryText.includes(expectedGeminiNotice),
      `Library "Improve results (optional)" panel must contain: "${expectedGeminiNotice}"`
    );
    console.log(`  [PASS] Improve results panel contains: "${expectedGeminiNotice}"`);

    // ── 3. PROGRESS SCREEN: REVIEW QUEUE EMPTY MESSAGE & COPY ─────────────
    console.log('\nTesting Progress Screen review queue empty message and singular copy...');
    await page.evaluate(() => document.getElementById('progress')?.scrollIntoView());
    await page.waitForTimeout(300);

    const expectedEmptyQueueMsg = 'Nothing to review yet. Topics you learn show up here the next day.';
    const progressBodyText = await page.innerText('#progress');
    assert.ok(
      progressBodyText.includes(expectedEmptyQueueMsg),
      `Progress screen must display empty queue message: "${expectedEmptyQueueMsg}"`
    );
    console.log(`  [PASS] Empty review queue message present: "${expectedEmptyQueueMsg}"`);

    // Seed 1-day streak into localStorage to test singular copy
    await page.evaluate(() => {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({
        current_streak: 1,
        longest_streak: 1,
        last_active_date: todayStr
      }));
      localStorage.setItem('daily_dive_history', JSON.stringify([{
        id: 'hist_1',
        topic_id: 'multi-head-self-attention',
        title: 'Multi-Head Attention',
        action: 'spin',
        timestamp: new Date().toISOString(),
        local_date: todayStr
      }]));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => document.getElementById('progress')?.scrollIntoView());
    await page.waitForTimeout(300);

    const streakProgressText = await page.innerText('#progress');
    assert.ok(
      !streakProgressText.includes('1 days'),
      'Progress screen must NOT contain "1 days"'
    );
    assert.ok(
      streakProgressText.includes('Best: 1 day'),
      'Progress screen with 1-day streak must display "Best: 1 day"'
    );
    console.log('  [PASS] Progress screen correctly displays singular "Best: 1 day" and no "1 days"');

    // ── 4. SPIN SCREEN STATUS LINE: "1-day streak" (NO SPACE BEFORE DASH) ─
    console.log('\nTesting Spin Screen status line copy...');
    await page.evaluate(() => document.getElementById('spin')?.scrollIntoView());
    await page.waitForTimeout(300);

    const spinBodyText = await page.innerText('body');
    assert.ok(
      !spinBodyText.includes(' -day'),
      'Page text must NOT contain " -day"'
    );
    console.log('  [PASS] Forbidden string absent: " -day"');

    // ── 5. SETTINGS SCREEN: THEME TOGGLE ROW REMOVED, SUN BUTTON STAYS ────
    console.log('\nTesting Settings Screen: Theme toggle row absent, Navbar sun button remains...');
    await page.evaluate(() => document.getElementById('settings')?.scrollIntoView());
    await page.waitForTimeout(300);

    const settingsThemeToggle = page.locator('button[aria-label="Toggle dark theme"]');
    const settingsThemeCount = await settingsThemeToggle.count();
    assert.strictEqual(settingsThemeCount, 0, 'Settings screen must NOT contain a theme toggle row');
    console.log('  [PASS] Theme toggle row absent in Settings');

    // Navbar sun/moon button stays
    const navbarThemeButton = page.locator('button[title*="Switch to"]');
    await navbarThemeButton.waitFor({ state: 'visible', timeout: 3000 });
    const isNavbarThemeVisible = await navbarThemeButton.isVisible();
    assert.ok(isNavbarThemeVisible, 'Navbar theme button must remain visible');
    console.log('  [PASS] Navbar theme toggle button is present in header');

    console.log('\nAll Round 15 E2E assertions passed successfully!');
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

runRound15E2ETests().catch((err) => {
  console.error('\n[FAIL]:', err);
  process.exit(1);
});
