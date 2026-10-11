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
    // ── 1. SPIN GROUP PILLS: REAL SAVED STATE INITIALIZATION ─────────────
    console.log('Testing Spin Group Pills with saved state (Tech ON, Money/Mind/World OFF)...');
    await page.addInitScript(() => {
      localStorage.setItem('daily_dive_onboarding_seen', 'true');
      localStorage.setItem('daily_dive_guest_settings', JSON.stringify({
        content_source: 'curated',
        enabled_categories: {
          'tech::ai-ml': true,
          'ai-ml': true,
          'tech': true,
          'tech::web-dev': false,
          'web-dev': false,
          'tech::cloud-infra': false,
          'cloud-infra': false,
          'tech::data-structures-algorithms': false,
          'data-structures-algorithms': false,
          'tech::systems-distributed-computing': false,
          'systems-distributed-computing': false,
          'money-career': false,
          'money-career::finance': false,
          'money-career::career-strategy': false,
          'finance': false,
          'career-strategy': false,
          'mind-growth': false,
          'mind-growth::psychology': false,
          'mind-growth::philosophy-critical-thinking': false,
          'mind-growth::communication': false,
          'psychology': false,
          'philosophy-critical-thinking': false,
          'communication': false,
          'world-ideas': false,
          'world-ideas::science-nature': false,
          'world-ideas::history-innovation': false,
          'science-nature': false,
          'history-innovation': false,
          'custom': true
        }
      }));
    });

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });

    const techPill = page.locator('[data-testid="spin-group-pill-tech"]');
    const moneyPill = page.locator('[data-testid="spin-group-pill-money-career"]');
    const mindPill = page.locator('[data-testid="spin-group-pill-mind-growth"]');
    const worldPill = page.locator('[data-testid="spin-group-pill-world-ideas"]');

    await techPill.waitFor({ state: 'visible', timeout: 5000 });
    await moneyPill.waitFor({ state: 'visible', timeout: 5000 });
    await mindPill.waitFor({ state: 'visible', timeout: 5000 });
    await worldPill.waitFor({ state: 'visible', timeout: 5000 });

    const techPressed = await techPill.getAttribute('aria-pressed');
    const moneyPressed = await moneyPill.getAttribute('aria-pressed');
    const mindPressed = await mindPill.getAttribute('aria-pressed');
    const worldPressed = await worldPill.getAttribute('aria-pressed');

    assert.strictEqual(techPressed, 'true', 'Tech pill must be aria-pressed="true"');
    assert.strictEqual(moneyPressed, 'false', 'Money pill must be aria-pressed="false"');
    assert.strictEqual(mindPressed, 'false', 'Mind pill must be aria-pressed="false"');
    assert.strictEqual(worldPressed, 'false', 'World pill must be aria-pressed="false"');

    // Outline vs filled style check
    const moneyClasses = await moneyPill.getAttribute('class');
    const techClasses = await techPill.getAttribute('class');
    assert.ok(moneyClasses.includes('bg-transparent') || moneyClasses.includes('border'), 'Money pill has outline style');
    assert.ok(techClasses.includes('bg-primary'), 'Tech pill has ON style');
    console.log('  [PASS] Saved state group pills verified: Tech ON, Money/Mind/World OFF with outline style.');

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

    // ── 3. PROGRESS SCREEN: REAL SPIN FLOW & REVIEW QUEUE EXCLUSION ───────
    console.log('\nTesting real spin flow in UI, reload, and review queue exclusion...');
    await page.evaluate(() => document.getElementById('spin')?.scrollIntoView());
    await page.waitForTimeout(300);

    const spinBtn = page.locator('#spin button[data-testid="primary-spin-button"]');
    await spinBtn.waitFor({ state: 'visible', timeout: 5000 });
    await spinBtn.click();

    // Wait for landed topic
    const topicHeading = page.locator('#spin [data-testid="post-spin-topic-card"] h2, #spin article h2');
    await topicHeading.waitFor({ state: 'visible', timeout: 10000 });
    const landedTitle = (await topicHeading.textContent()).trim();
    console.log(`  Landed on topic via real spin: "${landedTitle}"`);

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });

    // Open Progress screen
    await page.evaluate(() => document.getElementById('progress')?.scrollIntoView());
    await page.waitForTimeout(500);

    const progressText = await page.innerText('#progress');
    assert.ok(!progressText.includes(landedTitle), `Spun topic "${landedTitle}" must NOT be in the Review queue`);

    const toReviewMatch = progressText.match(/(\d+)\s+to review today/i);
    if (toReviewMatch) {
      assert.strictEqual(toReviewMatch[1], '0', 'To review today count must be 0 after fresh spin');
    }
    console.log('  [PASS] Real spin + reload verified: topic is not in review queue and not counted in "to review today".');

    // ── 4. SPIN SCREEN STATUS LINE: PIXEL GAP < 2PX AT 390x844 ────────────
    console.log('\nTesting Streak status line pixel gap at 390x844...');
    await page.evaluate(() => {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({
        current_streak: 2,
        longest_streak: 2,
        last_active_date: today
      }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => document.getElementById('spin')?.scrollIntoView());
    await page.waitForTimeout(500);

    const streakNumberEl = page.locator('#spin .font-mono').first();
    await streakNumberEl.waitFor({ state: 'visible', timeout: 5000 });

    const statusLineText = (await page.locator('[data-testid="spin-status-line"]').first().innerText()).trim();
    assert.ok(statusLineText.replace(/\s+/g, ' ').includes('2-day streak'), `Status line must read "2-day streak", found: "${statusLineText}"`);

    const gap = await page.evaluate(() => {
      const statusLine = document.querySelector('[data-testid="spin-status-line"]');
      const numSpan = statusLine?.querySelector('.font-mono');
      if (!numSpan) return null;
      const numRect = numSpan.getBoundingClientRect();
      const parent = numSpan.parentElement;
      let textNode = null;
      for (const node of parent.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('-day')) {
          textNode = node;
          break;
        }
      }
      if (!textNode) return null;
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const textRect = range.getBoundingClientRect();
      return textRect.left - numRect.right;
    });

    console.log(`  Pixel gap between number and "-day": ${gap?.toFixed(2)}px`);
    assert.ok(gap !== null, 'Pixel gap could not be measured');
    assert.ok(gap < 2, `Pixel gap between "2" and "-day" must be < 2px, but measured: ${gap}px`);
    console.log('  [PASS] Status line reads "2-day streak" with gap < 2px.');

    // ── 5. SETTINGS SCREEN: FULL-SCREEN VIEW, THEME ROW REMOVED, SUN BUTTON STAYS ─
    console.log('\nTesting Settings Screen: Full screen via gear, theme text absent, Sun button remains...');
    const settingsGearBtn = page.locator('header button[aria-label="Settings"]');
    await settingsGearBtn.click();
    await page.waitForSelector('#settings', { state: 'visible', timeout: 5000 });

    // Assert only Settings content is visible
    const isSpinVisible = await page.locator('#spin').isVisible();
    const isProgressVisible = await page.locator('#progress').isVisible();
    assert.strictEqual(isSpinVisible, false, 'Spin screen must NOT be visible when Settings is open');
    assert.strictEqual(isProgressVisible, false, 'Progress screen must NOT be visible when Settings is open');

    const settingsContent = await page.innerText('#settings');
    assert.ok(!settingsContent.toLowerCase().includes('theme'), 'Settings contains no element with text "Theme"');
    assert.ok(!settingsContent.toLowerCase().includes('light and dark'), 'Settings contains no element with text "light and dark"');
    console.log('  [PASS] Settings contains no element with text "Theme" or "light and dark".');

    // Test Back button returns to previous view
    const backBtn = page.locator('[data-testid="settings-back-button"]');
    await backBtn.click();
    await page.waitForTimeout(400);
    const isSpinBackVisible = await page.locator('#spin').isVisible();
    assert.strictEqual(isSpinBackVisible, true, 'Clicking Back returns to previous view');
    console.log('  [PASS] Back button returned to previous view.');

    // Sun/moon button stays in header
    const navbarThemeButton = page.locator('header button[title*="Switch to"], header button[aria-label*="theme" i], header button:has(svg.lucide-sun), header button:has(svg.lucide-moon)').first();
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
