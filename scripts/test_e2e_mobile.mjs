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

const VIEWPORTS = [
  { width: 390, height: 844, name: '390x844 (iPhone 12/13/14)' },
  { width: 360, height: 740, name: '360x740 (Android Compact)' }
];

async function runMobileE2ETests() {
  console.log('================================================================');
  console.log('     ROUND 10: MOBILE FIXES COMPREHENSIVE E2E SUITE             ');
  console.log('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" first.');
  }

  const server = await serveStatic(distDir, 4192);
  console.log('1. Static server listening on http://localhost:4192');

  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n============================================================`);
    console.log(` TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`============================================================\n`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    // Seed test data with active streak and review topics
    await page.goto('http://localhost:4192/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('daily_dive_onboarding_seen', 'true');
      localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({
        current_streak: 5,
        longest_streak: 8,
        last_active_date: new Date().toISOString().slice(0, 10)
      }));
      localStorage.setItem('daily_dive_guest_progress', JSON.stringify({
        'multi-head-self-attention': {
          topic_id: 'multi-head-self-attention',
          times_seen: 2,
          last_seen: new Date(Date.now() - 3 * 86400000).toISOString(),
          interval_days: 3,
          ease_factor: 2.5,
          learned: true
        },
        'mixture-of-experts-moe': {
          topic_id: 'mixture-of-experts-moe',
          times_seen: 1,
          last_seen: new Date().toISOString(),
          interval_days: 1,
          ease_factor: 2.5,
          learned: false
        }
      }));
    });
    await page.reload();
    await page.waitForSelector('#spin');
    await page.waitForTimeout(600);

    // ─────────────────────────────────────────────────────────────
    // TEST A: document.documentElement.scrollWidth <= window.innerWidth on every section
    // ─────────────────────────────────────────────────────────────
    console.log('[TEST A] Verifying no horizontal overflow on every section...');
    const sections = ['spin', 'library', 'progress', 'settings'];
    for (const secId of sections) {
      await page.evaluate((id) => {
        document.getElementById(id)?.scrollIntoView();
      }, secId);
      await page.waitForTimeout(400);

      const overflowData = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      }));

      assert.strictEqual(
        overflowData.scrollWidth <= overflowData.innerWidth,
        true,
        `Section #${secId} caused horizontal overflow: scrollWidth (${overflowData.scrollWidth}px) > innerWidth (${overflowData.innerWidth}px) at ${vp.width}x${vp.height}`
      );
      console.log(`   ✓ #${secId}: scrollWidth ${overflowData.scrollWidth}px <= innerWidth ${overflowData.innerWidth}px`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST B: After clicking each bottom tab, header contains no page title & clicked tab has aria-current="page"
    // ─────────────────────────────────────────────────────────────
    console.log('\n[TEST B] Testing bottom tab clicks, header title absence & aria-current="page"...');
    const tabs = ['spin', 'library', 'progress'];
    for (const tabId of tabs) {
      const tabBtn = page.locator(`nav.md\\:hidden button[data-nav-id="${tabId}"]`);
      await tabBtn.click();
      await page.waitForTimeout(500);

      const ariaCurrent = await tabBtn.getAttribute('aria-current');
      assert.strictEqual(
        ariaCurrent,
        'page',
        `Clicked tab "${tabId}" must have aria-current="page", found: ${ariaCurrent}`
      );

      const headerTextContent = await page.evaluate(() => {
        const header = document.querySelector('header');
        if (!header) return '';
        const wordmark = header.querySelector('.font-display')?.textContent || '';
        return {
          wordmark: wordmark.trim(),
          fullHeaderText: header.textContent.trim()
        };
      });

      assert.strictEqual(
        headerTextContent.wordmark,
        'Daily Dive',
        'Header wordmark must be "Daily Dive"'
      );

      // Verify no other heading or page title element exists inside header
      const extraTitlesCount = await page.evaluate(() => {
        const header = document.querySelector('header');
        if (!header) return 0;
        const headings = header.querySelectorAll('h1, h2, h3, .page-title, [data-testid="header-page-title"]');
        return headings.length;
      });
      assert.strictEqual(
        extraTitlesCount,
        0,
        `Header must contain no page title or subtitle elements after clicking tab ${tabId}`
      );

      console.log(`   ✓ Tab "${tabId}" clicked: aria-current="page" set, header has only "Daily Dive" wordmark`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST C: After scrolling to Progress, Progress is active; after scrolling to Settings, Settings is active
    // ─────────────────────────────────────────────────────────────
    console.log('\n[TEST C] Testing IntersectionObserver scroll-driven section activation...');
    
    // Scroll to Progress
    await page.evaluate(() => {
      document.getElementById('progress')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(600);

    const progressAriaCurrent = await page.locator('nav.md\\:hidden button[data-nav-id="progress"]').getAttribute('aria-current');
    assert.strictEqual(
      progressAriaCurrent,
      'page',
      `After scrolling to #progress, Progress bottom tab must have aria-current="page", found: ${progressAriaCurrent}`
    );
    console.log('   ✓ Scrolled to Progress -> Progress bottom tab became active (aria-current="page")');

    // Scroll to Settings
    await page.evaluate(() => {
      document.getElementById('settings')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(600);

    const settingsActive = await page.evaluate(() => {
      const gearBtn = document.querySelector('header button[aria-label="Settings"]');
      const gearCurrent = gearBtn?.getAttribute('aria-current');
      // Also verify that none of the bottom tabs is active when settings is active
      const bottomNavPages = Array.from(document.querySelectorAll('nav.md\\:hidden button[aria-current="page"]'));
      return {
        gearCurrent,
        bottomNavActiveCount: bottomNavPages.length
      };
    });

    assert.strictEqual(
      settingsActive.gearCurrent,
      'page',
      `After scrolling to #settings, Settings button must have aria-current="page", found: ${settingsActive.gearCurrent}`
    );
    assert.strictEqual(
      settingsActive.bottomNavActiveCount,
      0,
      'When Settings is active, bottom tabs must not have aria-current="page"'
    );
    console.log('   ✓ Scrolled to Settings -> Settings navbar button became active (aria-current="page")');

    // ─────────────────────────────────────────────────────────────
    // TEST D: Header height <= 64, streak pill height < 40 when visible
    // ─────────────────────────────────────────────────────────────
    console.log('\n[TEST D] Checking Header height <= 64 and Streak pill height < 40...');
    const headerBox = await page.locator('header').boundingBox();
    assert.ok(headerBox, 'Header must exist and have bounding box');
    assert.strictEqual(
      headerBox.height <= 64,
      true,
      `Header height must be <= 64px, found: ${headerBox.height}px`
    );

    const streakPill = page.locator('[data-testid="header-streak-pill"]');
    await streakPill.waitFor({ state: 'visible', timeout: 3000 });
    const pillBox = await streakPill.boundingBox();
    assert.ok(pillBox, 'Streak pill must be visible');
    assert.strictEqual(
      pillBox.height < 40,
      true,
      `Streak pill height must be < 40px, found: ${pillBox.height}px`
    );

    // Verify streak pill does not wrap (white-space: nowrap)
    const pillWhiteSpace = await streakPill.evaluate(el => window.getComputedStyle(el).whiteSpace);
    assert.strictEqual(
      pillWhiteSpace,
      'nowrap',
      `Streak pill must have white-space: nowrap, found: ${pillWhiteSpace}`
    );
    console.log(`   ✓ Header height: ${headerBox.height.toFixed(1)}px (<= 64px), Streak pill height: ${pillBox.height.toFixed(1)}px (< 40px, nowrap)`);

    // ─────────────────────────────────────────────────────────────
    // TEST E: Each group card in Filter has visible text for its group name
    // ─────────────────────────────────────────────────────────────
    console.log('\n[TEST E] Checking Filter Group cards visible group names & subline format...');
    await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
    await page.waitForTimeout(500);

    const expectedGroups = ['Tech', 'Money & Career', 'Mind & Growth', 'World & Ideas'];
    for (const groupName of expectedGroups) {
      const groupCard = page.locator('#library section').filter({ hasText: 'Your interests' })
        .locator(`span:has-text("${groupName}")`).first();
      await groupCard.waitFor({ state: 'visible', timeout: 4000 });
      const isVisible = await groupCard.isVisible();
      assert.strictEqual(
        isVisible,
        true,
        `Group card name "${groupName}" must be visible`
      );
    }
    console.log('   ✓ All 4 group cards in Filter have visible group names (Tech, Money & Career, Mind & Growth, World & Ideas)');

    // ─────────────────────────────────────────────────────────────
    // TEST F: Review queue age element: scrollWidth <= clientWidth
    // ─────────────────────────────────────────────────────────────
    console.log('\n[TEST F] Testing Review queue age elements (no truncation, scrollWidth <= clientWidth)...');
    await page.evaluate(() => document.getElementById('progress')?.scrollIntoView());
    await page.waitForTimeout(500);

    const ageElements = page.locator('[data-testid="review-queue-age"]');
    const ageCount = await ageElements.count();
    assert.strictEqual(
      ageCount > 0,
      true,
      `Review queue must display at least one topic with age text. Found: ${ageCount}`
    );

    for (let i = 0; i < ageCount; i++) {
      const ageEl = ageElements.nth(i);
      const metrics = await ageEl.evaluate(el => ({
        text: el.textContent.trim(),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
      }));

      assert.strictEqual(
        metrics.scrollWidth <= metrics.clientWidth,
        true,
        `Review queue age element [${i}] truncated: scrollWidth (${metrics.scrollWidth}) > clientWidth (${metrics.clientWidth}) for text "${metrics.text}"`
      );

      // Verify format is "Today" or "Xd ago"
      assert.ok(
        metrics.text === 'Today' || /^\d+d ago$/.test(metrics.text),
        `Age text must be "Today" or "Xd ago", found: "${metrics.text}"`
      );
      console.log(`   ✓ Review queue age item [${i}]: "${metrics.text}" (scrollWidth: ${metrics.scrollWidth}px <= clientWidth: ${metrics.clientWidth}px)`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST G: Post-spin card: Learned, Spin again, Share have same top within 2px; First source link scrollWidth <= clientWidth
    // ─────────────────────────────────────────────────────────────
    console.log('\n[TEST G] Testing Post-spin card button alignment and first source link wrap...');
    await page.evaluate(() => document.getElementById('spin')?.scrollIntoView());
    await page.waitForTimeout(400);

    // Click Spin button
    const spinBtn = page.locator('#spin button[data-testid="primary-spin-button"], #spin button:has-text("Spin")').first();
    await spinBtn.click();
    
    // Wait for post-spin card to appear
    const postSpinCard = page.locator('[data-testid="post-spin-topic-card"]');
    await postSpinCard.waitFor({ state: 'visible', timeout: 6000 });
    await page.waitForTimeout(500);

    // Locate the 3 action buttons
    const learnedBtn = postSpinCard.locator('button:has-text("Learned"), button:has-text("Mark as learned")').first();
    const spinAgainBtn = postSpinCard.locator('button:has-text("Spin again")').first();
    const shareBtn = postSpinCard.locator('button[aria-label="Share topic"]').first();

    await learnedBtn.waitFor({ state: 'visible', timeout: 3000 });
    await spinAgainBtn.waitFor({ state: 'visible', timeout: 3000 });
    await shareBtn.waitFor({ state: 'visible', timeout: 3000 });

    const boxLearned = await learnedBtn.boundingBox();
    const boxSpinAgain = await spinAgainBtn.boundingBox();
    const boxShare = await shareBtn.boundingBox();

    assert.ok(boxLearned, 'Learned button must have bounding box');
    assert.ok(boxSpinAgain, 'Spin again button must have bounding box');
    assert.ok(boxShare, 'Share button must have bounding box');

    const diffLearnedSpin = Math.abs(boxLearned.y - boxSpinAgain.y);
    const diffSpinShare = Math.abs(boxSpinAgain.y - boxShare.y);

    console.log(`   Action Buttons Y Coordinates:`);
    console.log(`   - Learned:    ${boxLearned.y.toFixed(2)}px`);
    console.log(`   - Spin again: ${boxSpinAgain.y.toFixed(2)}px (diff: ${diffLearnedSpin.toFixed(2)}px)`);
    console.log(`   - Share:      ${boxShare.y.toFixed(2)}px (diff: ${diffSpinShare.toFixed(2)}px)`);

    assert.strictEqual(
      diffLearnedSpin <= 2,
      true,
      `Learned and Spin again must have the same top within 2px, difference was ${diffLearnedSpin.toFixed(2)}px`
    );
    assert.strictEqual(
      diffSpinShare <= 2,
      true,
      `Spin again and Share must have the same top within 2px, difference was ${diffSpinShare.toFixed(2)}px`
    );

    // First source link test: scrollWidth <= clientWidth
    const firstSourceLink = postSpinCard.locator('a[target="_blank"]').first();
    if (await firstSourceLink.isVisible()) {
      const linkMetrics = await firstSourceLink.evaluate(el => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
      }));
      assert.strictEqual(
        linkMetrics.scrollWidth <= linkMetrics.clientWidth,
        true,
        `First source link must not overflow: scrollWidth (${linkMetrics.scrollWidth}) > clientWidth (${linkMetrics.clientWidth})`
      );
      console.log(`   ✓ First source link: scrollWidth (${linkMetrics.scrollWidth}px) <= clientWidth (${linkMetrics.clientWidth}px)`);
    }

    await context.close();
  }

  await browser.close();
  server.close();

  console.log('\n================================================================');
  console.log(' [PASS]: ALL ROUND 10 MOBILE E2E TESTS PASSED ON ALL VIEWPORTS! ');
  console.log('================================================================\n');
}

runMobileE2ETests().catch(err => {
  console.error('\n[FAIL]: Mobile E2E tests failed:', err);
  process.exit(1);
});
