import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4199) {
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

const VIEWPORTS = [
  { width: 390, height: 844, name: '390x844 (Mobile)' },
  { width: 1280, height: 800, name: '1280x800 (Desktop)' }
];

async function runSinglePageSuite() {
  printLog('================================================================');
  printLog('       SINGLE PAGE (SPIN + PROGRESS + LIBRARY) E2E SUITE        ');
  printLog('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" first.');
  }

  const port = 4199;
  const server = await serveStatic(distDir, port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of VIEWPORTS) {
      printLog(`\n------------------------------------------------------------`);
      printLog(`TESTING VIEWPORT: ${vp.name}`);
      printLog(`------------------------------------------------------------`);

      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('daily_dive_onboarding_seen', 'true');
        localStorage.setItem('daily_dive_first_run_dismissed', 'true');
      });

      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // ── a) All three section ids exist on one page in order: spin, progress, library ──
      printLog('\n[TEST a] Verifying all 3 sections exist on one page in order [spin, progress, library]...');
      const sectionIds = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#spin, #progress, #library')).map(el => el.id);
      });
      printLog(`  Found sections: [${sectionIds.join(', ')}]`);
      assert.strictEqual(sectionIds.length, 3, `Expected all 3 sections in DOM, got ${sectionIds.length}: [${sectionIds}]`);
      assert.strictEqual(sectionIds[0], 'spin', `First section must be "spin", found "${sectionIds[0]}"`);
      assert.strictEqual(sectionIds[1], 'progress', `Second section must be "progress", found "${sectionIds[1]}"`);
      assert.strictEqual(sectionIds[2], 'library', `Third section must be "library", found "${sectionIds[2]}"`);
      printLog('  [PASS a] All 3 sections exist in DOM in correct order: spin -> progress -> library.');

      // ── b) Page scrolls vertically (scrollHeight > clientHeight); no horizontal scroll ──
      printLog('\n[TEST b] Verifying page scrolls vertically and has no horizontal overflow...');
      const scrollMetrics = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      printLog(`  Metrics: scrollHeight=${scrollMetrics.scrollHeight}px vs clientHeight=${scrollMetrics.clientHeight}px | scrollWidth=${scrollMetrics.scrollWidth}px vs clientWidth=${scrollMetrics.clientWidth}px`);
      assert.ok(
        scrollMetrics.scrollHeight > scrollMetrics.clientHeight,
        `Page must vertically scroll: scrollHeight (${scrollMetrics.scrollHeight}) must be > clientHeight (${scrollMetrics.clientHeight})`
      );
      assert.ok(
        scrollMetrics.scrollWidth <= scrollMetrics.clientWidth,
        `Page must not horizontally overflow: scrollWidth (${scrollMetrics.scrollWidth}) must be <= clientWidth (${scrollMetrics.clientWidth})`
      );
      printLog('  [PASS b] Page scrolls vertically and has zero horizontal overflow.');

      // ── c) Clicking each sidebar/nav item scrolls its section into view (top within 80px) ──
      printLog('\n[TEST c] Verifying clicking each nav item scrolls section into view (top within 80px)...');
      for (const targetId of ['progress', 'library', 'spin']) {
        const navBtn = page.locator(`[data-nav-id="${targetId}"]:visible`).first();
        await navBtn.click();
        await page.waitForTimeout(800);

        const boundingTop = await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return el.getBoundingClientRect().top;
        }, targetId);

        printLog(`  Clicked "${targetId}" -> bounding top: ${boundingTop !== null ? boundingTop.toFixed(1) : 'null'}px`);
        assert.ok(
          boundingTop !== null && boundingTop >= -20 && boundingTop <= 80,
          `Section #${targetId} top must be within 80px of viewport top after scrolling, got: ${boundingTop}px`
        );
      }
      printLog('  [PASS c] Clicking each nav item scrolled its section within 80px of top.');

      // ── d) Active sidebar item matches the section in view after scrolling ──
      printLog('\n[TEST d] Verifying active sidebar/nav item matches the section in view...');
      for (const targetId of ['spin', 'progress', 'library']) {
        const navBtn = page.locator(`[data-nav-id="${targetId}"]:visible`).first();
        await navBtn.click();
        await page.waitForTimeout(800);

        const ariaCurrent = await navBtn.getAttribute('aria-current');
        printLog(`  Section "${targetId}" nav aria-current: "${ariaCurrent}"`);
        assert.strictEqual(
          ariaCurrent,
          'page',
          `Nav item for "${targetId}" must have aria-current="page" when scrolled into view, got "${ariaCurrent}"`
        );
      }
      printLog('  [PASS d] Active nav item matches section in view with aria-current="page".');

      // ── e) Opening #/library and #/progress directly scrolls to that section ──
      printLog('\n[TEST e] Verifying direct URL loads (#/library and #/progress) scroll to section...');
      for (const targetId of ['library', 'progress']) {
        await page.goto(`${baseUrl}/#/${targetId}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(900);

        const boundingTop = await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return el.getBoundingClientRect().top;
        }, targetId);

        printLog(`  Opened direct #/${targetId} -> bounding top: ${boundingTop !== null ? boundingTop.toFixed(1) : 'null'}px`);
        assert.ok(
          boundingTop !== null && boundingTop >= -20 && boundingTop <= 80,
          `Direct open #/${targetId} must scroll section to top within 80px, got: ${boundingTop}px`
        );
      }
      printLog('  [PASS e] Direct open #/library and #/progress correctly scrolled to respective sections.');

      // ── f) Space inside a Library input does not start a spin; Space elsewhere does ──
      printLog('\n[TEST f] Verifying Space inside Library input does NOT spin, but Space elsewhere DOES...');
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Open Library manual input form
      const addManuallyBtn = page.locator('#library button:has-text("Add Manually")').first();
      await addManuallyBtn.scrollIntoViewIfNeeded();
      await addManuallyBtn.click();
      await page.waitForTimeout(400);

      const titleInput = page.locator('#library input[placeholder*="Distributed Consensus"]').first();
      await titleInput.waitFor({ state: 'visible', timeout: 5000 });
      await titleInput.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(400);

      const isSpinningInside = await page.evaluate(() => {
        const spinBtn = document.querySelector('button[data-testid="primary-spin-button"]');
        return spinBtn ? spinBtn.disabled : false;
      });
      assert.strictEqual(
        isSpinningInside,
        false,
        'Space pressed while focused inside Library input must NOT start spin'
      );
      printLog('  [PASS] Space inside Library text input did not trigger spin.');

      // Unfocus / click outside and press Space
      await page.evaluate(() => {
        if (document.activeElement) document.activeElement.blur();
      });
      await page.keyboard.press('Space');
      await page.waitForTimeout(400);

      const isSpinningOutside = await page.evaluate(() => {
        const spinBtn = document.querySelector('button[data-testid="primary-spin-button"]');
        return spinBtn ? spinBtn.disabled : false;
      });
      assert.strictEqual(
        isSpinningOutside,
        true,
        'Space pressed outside input MUST trigger spin'
      );
      printLog('  [PASS] Space pressed outside input successfully triggered spin.');

      // Wait for spin to land
      await page.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 12000 });

      // ── g) One full spin works with page scrolled halfway down and back ──
      printLog('\n[TEST g] Verifying full spin works while scrolling away mid-spin and back...');
      await page.evaluate(() => window.scrollTo(0, 450));
      await page.waitForTimeout(300);

      const spinAgainBtn = page.locator('#spin button:has-text("Spin another"), #spin button:has-text("Spin again")').first();
      await spinAgainBtn.scrollIntoViewIfNeeded();
      await spinAgainBtn.click();

      // Mid-spin: scroll back to top, then scroll down to library, then back
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));

      // Wait for completion and ensure card is visible
      const landedTopicCard = page.locator('#spin [data-testid="post-spin-topic-card"]');
      await landedTopicCard.waitFor({ state: 'visible', timeout: 12000 });

      // Verify no stuck landing rings or visual artifacts
      await page.waitForTimeout(1600);
      const stuckRings = await page.locator('.landing-ring').count();
      assert.strictEqual(stuckRings, 0, 'No landing ring must remain after spin finish');
      printLog('  [PASS g] Full spin completed cleanly while scrolling across sections.');

      // ── l) Scroll page with window.scrollTo without clicking nav items -> aria-current moves to matching nav within 500ms ──
      printLog('\n[TEST l] Verifying window.scrollTo moves aria-current to matching nav item within 500ms...');
      for (const secId of ['progress', 'library', 'spin']) {
        const targetScrollTop = await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (!el) return 0;
          return Math.max(0, el.offsetTop - 56);
        }, secId);

        await page.evaluate((top) => {
          window.scrollTo({ top, behavior: 'instant' });
        }, targetScrollTop);

        // Assert aria-current moves to matching nav item within 500 ms
        const navBtn = page.locator(`[data-nav-id="${secId}"]:visible`).first();
        await page.waitForFunction(
          (id) => {
            const btn = document.querySelector(`[data-nav-id="${id}"][aria-current="page"]`);
            return btn !== null;
          },
          secId,
          { timeout: 500 }
        );

        const ariaCurrent = await navBtn.getAttribute('aria-current');
        printLog(`  Scrolled to #${secId} -> nav item aria-current: "${ariaCurrent}"`);
        assert.strictEqual(
          ariaCurrent,
          'page',
          `Nav item for #${secId} must have aria-current="page" within 500ms when scrolled via window.scrollTo`
        );
      }
      printLog('  [PASS l] Pure scroll via window.scrollTo successfully moved aria-current to matching nav item within 500ms.');

      await context.close();
    }

    printLog('\n================================================================');
    printLog('ALL SINGLE-PAGE E2E TESTS PASSED AT 390x844 AND 1280x800!');
    printLog('================================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runSinglePageSuite().catch((err) => {
  console.error('\n[FAIL]: Single Page E2E Test Suite failed:\n', err);
  process.exit(1);
});
