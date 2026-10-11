import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4210) {
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

async function runSpinTimingTest() {
  console.log('================================================================');
  console.log('     SPIN DECELERATION & SYNCHRONIZED AUDIO TIMING TEST         ');
  console.log('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" first.');
  }

  const { server, port } = await serveStatic(distDir, 4210);
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

    // Ensure audio is enabled and install audio spy
    await page.evaluate(() => {
      localStorage.setItem('daily_dive_onboarding_seen', 'true');
      localStorage.setItem('daily_dive_first_run_dismissed', 'true');

      window.__spin_spy = {
        clickTime: 0,
        tickTimes: [],
        landingTime: 0,
        whooshTime: 0,
        cardAppearTime: 0,
        spinCount: 0
      };

      const AudioController = window.__daily_dive_audio;
      AudioController.soundEnabled = true;

      const origWhoosh = AudioController.playWhoosh.bind(AudioController);
      AudioController.playWhoosh = function(dur) {
        window.__spin_spy.whooshTime = performance.now();
        window.__spin_spy.spinCount++;
        return origWhoosh(dur);
      };

      let audioBase = null;
      const origTick = AudioController.playTick.bind(AudioController);
      AudioController.playTick = function(progress, scheduledTime) {
        if (this.ctx && audioBase === null) {
          audioBase = this.ctx.currentTime;
        }
        const tMs = scheduledTime !== null
          ? Number(((scheduledTime - audioBase) * 1000).toFixed(2))
          : Number((performance.now() - window.__spin_spy.clickTime).toFixed(2));
        window.__spin_spy.tickTimes.push(tMs);
        return origTick(progress, scheduledTime);
      };

      const origLanding = AudioController.playLanding.bind(AudioController);
      AudioController.playLanding = function() {
        window.__spin_spy.landingTime = performance.now();
        return origLanding();
      };

      // Watch for post-spin topic card appearance
      const obs = new MutationObserver(() => {
        const card = document.querySelector('[data-testid="post-spin-topic-card"]');
        if (card && !window.__spin_spy.cardAppearTime) {
          window.__spin_spy.cardAppearTime = performance.now();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    });

    // Locate spin button
    const spinBtn = page.locator('#spin button[data-testid="primary-spin-button"]');
    await spinBtn.waitFor({ state: 'visible', timeout: 5000 });

    console.log('[1/6] Clicking Spin and testing in-progress state...');
    await page.evaluate(() => {
      window.__spin_spy.clickTime = performance.now();
    });
    await spinBtn.click();

    // Verify button shows "Spinning..." and is disabled while spinning
    await page.waitForTimeout(400);
    const isDisabled = await spinBtn.isDisabled();
    const btnText = await spinBtn.innerText();
    assert.strictEqual(isDisabled, true, 'Spin button must be disabled while spinning');
    assert.match(btnText, /Spinning/i, 'Spin button must display "Spinning..." while spinning');
    console.log(`  [PASS] Button disabled = ${isDisabled}, button text = "${btnText.trim()}"`);

    // (f) Space during a spin does NOT start another spin
    console.log('\n[2/6] Pressing Space key during spin to test rejection of second spin...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    // Wait for the spin to complete and topic card to appear
    console.log('\n[3/6] Waiting for spin to finish and topic card to appear...');
    await page.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 10000 });
    await page.waitForTimeout(600); // Allow landing settle

    // Retrieve spy data
    const spy = await page.evaluate(() => window.__spin_spy);

    // Verify Space key did not start a second spin (whoosh count must be exactly 1)
    assert.strictEqual(spy.spinCount, 1, 'Space during spin must NOT trigger a second spin');
    console.log('  [PASS] (f) Only 1 spin was initiated; Space key during spin was ignored.');

    // a) Total time from click to landing is between 4000 and 5200 ms
    const totalTimeMs = spy.landingTime - spy.clickTime;
    console.log(`\n[4/6] Verifying total time from click to landing: ${totalTimeMs.toFixed(1)} ms...`);
    assert.ok(
      totalTimeMs >= 4000 && totalTimeMs <= 5200,
      `Total time from click to landing must be between 4000 and 5200 ms, got ${totalTimeMs.toFixed(1)} ms`
    );
    console.log(`  [PASS] (a) Total time is ${totalTimeMs.toFixed(1)} ms (within 4000-5200 ms).`);

    // e) Number of ticks is at least 15
    const tickCount = spy.tickTimes.length;
    console.log(`\n[5/6] Verifying tick count: ${tickCount} ticks recorded...`);
    assert.ok(tickCount >= 15, `Number of ticks must be at least 15, got ${tickCount}`);
    console.log(`  [PASS] (e) Number of ticks is ${tickCount} (>= 15).`);

    // Compute tick gaps
    const gaps = [];
    for (let i = 1; i < spy.tickTimes.length; i++) {
      gaps.push(Number((spy.tickTimes[i] - spy.tickTimes[i - 1]).toFixed(1)));
    }

    const firstGap = gaps[0];
    const lastGap = gaps[gaps.length - 1];
    const lastTickTime = spy.tickTimes[spy.tickTimes.length - 1];
    const landingDelay = totalTimeMs - lastTickTime;

    // b) Gaps between consecutive ticks never get shorter after phase 1 (non-decreasing)
    console.log('\n[6/6] Verifying gap progression & non-decreasing deceleration after Phase 1 (1200ms)...');
    let phase1EndIndex = 0;
    for (let i = 0; i < spy.tickTimes.length; i++) {
      if (spy.tickTimes[i] <= 1200) {
        phase1EndIndex = i;
      }
    }

    for (let i = phase1EndIndex; i < gaps.length; i++) {
      if (i > 0) {
        assert.ok(
          gaps[i] >= gaps[i - 1] - 0.2,
          `Gap at index ${i} (${gaps[i]} ms) must be non-decreasing compared to gap ${i - 1} (${gaps[i - 1]} ms)`
        );
      }
    }
    console.log(`  [PASS] (b) All ${gaps.length - phase1EndIndex} gaps after Phase 1 are strictly non-decreasing.`);

    // c) Last tick gap is at least 3 times the first tick gap
    const ratio = lastGap / firstGap;
    assert.ok(
      ratio >= 3.0,
      `Last tick gap (${lastGap} ms) must be at least 3x the first tick gap (${firstGap} ms), ratio: ${ratio.toFixed(2)}`
    );
    console.log(`  [PASS] (c) Last gap (${lastGap} ms) is ${ratio.toFixed(2)}x first gap (${firstGap} ms) (>= 3x).`);

    // d) Landing sound plays after last tick and within 150 ms of topic card appearance
    assert.ok(
      spy.landingTime > (spy.clickTime + lastTickTime),
      `Landing sound (${totalTimeMs.toFixed(1)} ms) must play after last tick (${lastTickTime.toFixed(1)} ms)`
    );
    const cardLandingDiff = Math.abs(spy.landingTime - spy.cardAppearTime);
    assert.ok(
      cardLandingDiff <= 150,
      `Landing sound must play within 150 ms of topic card appearance, diff: ${cardLandingDiff.toFixed(1)} ms`
    );
    console.log(`  [PASS] (d) Landing sound played after last tick (delay: ${landingDelay.toFixed(1)} ms) and within ${cardLandingDiff.toFixed(1)} ms of topic card.`);

    // Print measured numbers table
    console.log('\n================================================================');
    console.log('                 MEASURED TIMING NUMBERS                        ');
    console.log('================================================================');
    console.log(`Total Duration (Click to Landing): ${totalTimeMs.toFixed(1)} ms`);
    console.log(`Total Ticks Count:                 ${tickCount}`);
    console.log(`First Tick Gap:                    ${firstGap.toFixed(1)} ms`);
    console.log(`Last Tick Gap:                     ${lastGap.toFixed(1)} ms`);
    console.log(`Deceleration Ratio (Last / First): ${ratio.toFixed(2)}x`);
    console.log(`Last Tick Time:                    ${lastTickTime.toFixed(1)} ms`);
    console.log(`Landing Sound Delay (from last):   ${landingDelay.toFixed(1)} ms`);
    console.log(`Card Appearance vs Landing Diff:   ${cardLandingDiff.toFixed(1)} ms`);
    console.log('\nTable of All Consecutive Tick Gaps (ms):');
    console.log(gaps.map((g, idx) => `  [#${idx + 1}->#${idx + 2}] ${g.toFixed(1)} ms`).join('\n'));
    console.log('================================================================\n');

  } finally {
    await browser.close();
    server.close();
  }
}

runSpinTimingTest().catch((err) => {
  console.error('\n[FAIL]: Spin timing test failed:', err);
  process.exit(1);
});
