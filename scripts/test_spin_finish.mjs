import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4230) {
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

const VIEWPORTS = [
  { width: 390, height: 844, name: '390x844 (Mobile)' },
  { width: 1280, height: 800, name: '1280x800 (Desktop)' }
];

async function runSpinFinishTests() {
  console.log('================================================================');
  console.log('         SPIN FINISH SLOW-DOWN & LANDING EFFECT TEST            ');
  console.log('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" first.');
  }

  const { server, port } = await serveStatic(distDir, 4230);
  const browser = await chromium.launch({ headless: true });

  const allFailures = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n----------------------------------------------------`);
      console.log(`Testing viewport: ${vp.name}`);
      console.log(`----------------------------------------------------`);

      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      // Pre-set localStorage before navigation
      await page.addInitScript(() => {
        localStorage.setItem('daily_dive_onboarding_seen', 'true');
        localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        localStorage.setItem('daily_dive_guest_settings', JSON.stringify({
          sound_enabled: true,
          haptics_enabled: true
        }));
      });

      await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

      // Install spies
      await page.evaluate(() => {
        window.__spinTestSpy = {
          clickTime: 0,
          spinStartTime: 0,
          tickTimes: [],
          landingTime: 0,
          vibrateCalls: [],
          ringDetectedAtLanding: false,
          ringGoneAfter1500: false,
          cardNotVisibleAt100: false,
          cardVisibleAt500: false,
          rafFrames: [],
          centerDistAtEnd: null
        };

        // Spy on navigator.vibrate
        if (typeof navigator !== 'undefined') {
          navigator.vibrate = function(pattern) {
            window.__spinTestSpy.vibrateCalls.push(pattern);
            return true;
          };
        }

        // Spy on AudioController
        const AudioController = window.__daily_dive_audio;
        if (AudioController) {
          AudioController.soundEnabled = true;
          let audioBase = null;

          const origWhoosh = AudioController.playWhoosh.bind(AudioController);
          AudioController.playWhoosh = function(dur) {
            window.__spinTestSpy.spinStartTime = performance.now();
            return origWhoosh(dur);
          };

          const origTick = AudioController.playTick.bind(AudioController);
          AudioController.playTick = function(progress, scheduledTime) {
            if (this.ctx && audioBase === null) {
              audioBase = this.ctx.currentTime;
            }
            const tMs = scheduledTime !== null
              ? Number(((scheduledTime - audioBase) * 1000).toFixed(2))
              : Number((performance.now() - window.__spinTestSpy.spinStartTime).toFixed(2));
            window.__spinTestSpy.tickTimes.push(tMs);
            return origTick(progress, scheduledTime);
          };

          const origLanding = AudioController.playLanding.bind(AudioController);
          AudioController.playLanding = function() {
            window.__spinTestSpy.landingTime = performance.now();

            // Check landing-ring within 100ms
            setTimeout(() => {
              const ring = document.querySelector('[data-testid="landing-ring"]');
              if (ring) {
                window.__spinTestSpy.ringDetectedAtLanding = true;
              }
            }, 50);

            // Check topic card not visible at landing + 100ms
            setTimeout(() => {
              const card = document.querySelector('[data-testid="post-spin-topic-card"]');
              window.__spinTestSpy.cardNotVisibleAt100 = !card;
            }, 100);

            // Check topic card visible at landing + 500ms
            setTimeout(() => {
              const card = document.querySelector('[data-testid="post-spin-topic-card"]');
              window.__spinTestSpy.cardVisibleAt500 = !!card;
            }, 500);

            // Check landing-ring gone 1500ms later
            setTimeout(() => {
              const ring = document.querySelector('[data-testid="landing-ring"]');
              window.__spinTestSpy.ringGoneAfter1500 = !ring;
            }, 1500);

            return origLanding();
          };
        }

        // rAF logger
        let logging = false;
        window.__startRafLogging = () => {
          logging = true;
          function loop(now) {
            if (logging) {
              const chassis = document.querySelector('.dial-chassis');
              const firstCard = chassis ? chassis.querySelector('.shrink-0') : null;
              const strip = firstCard ? firstCard.parentElement : null;
              let x = null;
              let centerDiff = null;
              if (strip && chassis) {
                const transform = window.getComputedStyle(strip).transform;
                if (transform && transform !== 'none') {
                  try {
                    const m = new DOMMatrix(transform);
                    x = m.m41;
                  } catch (e) {
                    const parts = transform.match(/-?\d+(\.\d+)?/g);
                    if (parts) x = parseFloat(parts.length > 6 ? parts[12] : parts[4]);
                  }
                }
                const cRect = chassis.getBoundingClientRect();
                const reticleX = cRect.left + cRect.width / 2;
                const cards = Array.from(chassis.querySelectorAll('.shrink-0'));
                let minD = Infinity;
                cards.forEach(card => {
                  const r = card.getBoundingClientRect();
                  const cx = r.left + r.width / 2;
                  const d = Math.abs(cx - reticleX);
                  if (d < minD) minD = d;
                });
                centerDiff = minD;
              }
              window.__spinTestSpy.rafFrames.push({ t: now, x, centerDiff });
              if (centerDiff !== null) {
                window.__spinTestSpy.centerDistAtEnd = centerDiff;
              }
              requestAnimationFrame(loop);
            }
          }
          requestAnimationFrame(loop);
        };
        window.__stopRafLogging = () => { logging = false; };
      });

      const spinBtn = page.locator('#spin button[data-testid="primary-spin-button"]');
      await spinBtn.waitFor({ state: 'visible', timeout: 5000 });

      // Start rAF logging and click spin
      await page.evaluate(() => {
        window.__spinTestSpy.clickTime = performance.now();
        window.__startRafLogging();
      });
      await spinBtn.click();

      // Wait for spin to finish and settle
      await page.waitForTimeout(5500);
      await page.evaluate(() => window.__stopRafLogging());
      await page.waitForTimeout(1600); // Wait for 1500ms ring check

      const spy = await page.evaluate(() => window.__spinTestSpy);

      // Analyze rAF frame speeds
      const validFrames = spy.rafFrames.filter(f => f.x !== null);
      const speeds = [];
      for (let i = 1; i < validFrames.length; i++) {
        const dt = validFrames[i].t - validFrames[i - 1].t;
        const dx = Math.abs(validFrames[i].x - validFrames[i - 1].x);
        if (dt > 2) {
          speeds.push({
            t: validFrames[i].t - spy.clickTime,
            dt,
            dx,
            v: dx / dt,
            x: validFrames[i].x
          });
        }
      }

      // Filter frames after Phase 1 (1200ms from spin start)
      const p1EndMs = 1200;
      const totalSpinDuration = spy.landingTime - spy.clickTime;
      const p2Speeds = speeds.filter(s => s.t >= p1EndMs && s.t <= totalSpinDuration);

      let maxIncrease = 0;
      let maxDrop = 0;
      const last100msThreshold = totalSpinDuration - 100;

      for (let i = 1; i < p2Speeds.length; i++) {
        const vPrev = p2Speeds[i - 1].v;
        const vCurr = p2Speeds[i].v;
        if (vPrev > 0.01) {
          if (vCurr > vPrev) {
            const incPct = ((vCurr - vPrev) / vPrev) * 100;
            if (incPct > maxIncrease) maxIncrease = incPct;
          } else {
            const dropPct = ((vPrev - vCurr) / vPrev) * 100;
            if (p2Speeds[i].t < last100msThreshold && dropPct > maxDrop) {
              maxDrop = dropPct;
            }
          }
        }
      }

      const vAt1200 = p2Speeds[0]?.v || 1.0;
      const settleFrames = speeds.filter(s => s.t >= totalSpinDuration);
      const lastFrameSpeed = settleFrames.length > 0 ? settleFrames[settleFrames.length - 1].v : (speeds[speeds.length - 1]?.v || 0);
      const finalSpeedPct = (lastFrameSpeed / vAt1200) * 100;

      console.log(`Measured Speed Dynamics after Phase 1:`);
      console.log(`  Speed at 1200 ms: ${vAt1200.toFixed(4)} px/ms`);
      console.log(`  Final Speed at end: ${lastFrameSpeed.toFixed(4)} px/ms (${finalSpeedPct.toFixed(2)}% of 1200ms speed)`);
      console.log(`  Largest Speed Increase: ${maxIncrease.toFixed(2)}%`);
      console.log(`  Largest Speed Drop (excl. last 100ms): ${maxDrop.toFixed(2)}%`);

      // Print first 10 and last 10 frames of Phase 2 deceleration
      console.log(`\nFirst 10 frames of slow-down (Phase 2):`);
      console.log(p2Speeds.slice(0, 10).map((f, idx) => `  [#${idx + 1}] t=${f.t.toFixed(1)}ms, x=${f.x.toFixed(2)}px, v=${f.v.toFixed(4)}px/ms`).join('\n'));
      console.log(`\nLast 10 frames of slow-down (Phase 2):`);
      console.log(p2Speeds.slice(-10).map((f, idx) => `  [#${idx + 1}] t=${f.t.toFixed(1)}ms, x=${f.x.toFixed(2)}px, v=${f.v.toFixed(4)}px/ms`).join('\n'));

      // Check a: Speed never increases by more than 5% frame to frame after phase 1
      try {
        assert.ok(
          maxIncrease <= 5.0,
          `Speed increased by ${maxIncrease.toFixed(2)}% frame to frame (must be <= 5%)`
        );
        console.log(`  [PASS a] Largest frame-to-frame speed increase: ${maxIncrease.toFixed(2)}% (<= 5%)`);
      } catch (err) {
        console.error(`  [FAIL a] ${err.message}`);
        allFailures.push(`[${vp.name}] Check a: ${err.message}`);
      }

      // Check b: Overall speed at end must be below 15% of speed at 1200ms
      try {
        assert.ok(
          finalSpeedPct <= 15.0,
          `Final speed is ${finalSpeedPct.toFixed(2)}% of speed at 1200ms (must be < 15%)`
        );
        console.log(`  [PASS b] Final speed is ${finalSpeedPct.toFixed(2)}% of speed at 1200ms (< 15%)`);
      } catch (err) {
        console.error(`  [FAIL b] ${err.message}`);
        allFailures.push(`[${vp.name}] Check b: ${err.message}`);
      }

      // Compute tick gaps
      const gaps = [];
      for (let i = 1; i < spy.tickTimes.length; i++) {
        gaps.push(Number((spy.tickTimes[i] - spy.tickTimes[i - 1]).toFixed(1)));
      }

      let p1TickIndex = 0;
      for (let i = 0; i < spy.tickTimes.length; i++) {
        if (spy.tickTimes[i] <= 1200) p1TickIndex = i;
      }

      const p2Gaps = gaps.slice(p1TickIndex);
      const gapRatios = [];
      for (let i = 1; i < p2Gaps.length; i++) {
        gapRatios.push(Number((p2Gaps[i] / p2Gaps[i - 1]).toFixed(3)));
      }

      const lastTickTime = spy.tickTimes[spy.tickTimes.length - 1];
      const lastTickGap = gaps[gaps.length - 1];
      const stopDuration = Number(((spy.landingTime - spy.spinStartTime) - lastTickTime).toFixed(1));
      const stopRatio = Number((stopDuration / lastTickGap).toFixed(3));

      console.log(`\nTick Gaps in Phase 2 (ms):`, p2Gaps);
      console.log(`Phase 2 Tick Gap Ratios:`, gapRatios);

      // Check c: Tick gaps after phase 1: each gap is between 1.0 and 1.4 times previous gap
      try {
        for (let i = 0; i < gapRatios.length; i++) {
          const r = gapRatios[i];
          assert.ok(
            r >= 1.0 && r <= 1.4,
            `Gap ratio at index ${i} is ${r} (must be between 1.0 and 1.4)`
          );
        }
        console.log(`  [PASS c] All ${gapRatios.length} gap ratios in Phase 2 are between 1.0 and 1.4`);
      } catch (err) {
        console.error(`  [FAIL c] ${err.message}`);
        allFailures.push(`[${vp.name}] Check c: ${err.message}`);
      }

      // Check d: Time from last tick to the stop is at most 1.4 times the last tick gap
      try {
        console.log(`  Time from last tick to stop: ${stopDuration} ms, Last tick gap: ${lastTickGap} ms (ratio: ${stopRatio}x)`);
        assert.ok(
          stopRatio <= 1.4,
          `Time from last tick to stop (${stopDuration} ms) is ${stopRatio}x last tick gap (${lastTickGap} ms), must be <= 1.4x`
        );
        console.log(`  [PASS d] Time from last tick to stop is ${stopRatio}x last tick gap (<= 1.4x)`);
      } catch (err) {
        console.error(`  [FAIL d] ${err.message}`);
        allFailures.push(`[${vp.name}] Check d: ${err.message}`);
      }

      // Check e: After the settle, card center to reticle center is within 1 px
      const centerDist = spy.centerDistAtEnd ?? 999;
      try {
        console.log(`  Card center to reticle center distance: ${centerDist.toFixed(2)} px`);
        assert.ok(
          centerDist <= 1.0,
          `Card center distance ${centerDist.toFixed(2)}px exceeds 1.0px`
        );
        console.log(`  [PASS e] Card center to reticle center is ${centerDist.toFixed(2)} px (<= 1.0 px)`);
      } catch (err) {
        console.error(`  [FAIL e] ${err.message}`);
        allFailures.push(`[${vp.name}] Check e: ${err.message}`);
      }

      // Check j: Topic card not visible at 100ms, visible at 500ms
      try {
        assert.ok(
          spy.cardNotVisibleAt100,
          'Topic card must not be visible at landing + 100 ms'
        );
        assert.ok(
          spy.cardVisibleAt500,
          'Topic card must be visible at landing + 500 ms'
        );
        console.log(`  [PASS j] Topic card is not visible at landing + 100ms and visible at landing + 500ms`);
      } catch (err) {
        console.error(`  [FAIL j] ${err.message}`);
        allFailures.push(`[${vp.name}] Check j: ${err.message}`);
      }

      // Check f: landing-ring exists within 100 ms of the landing sound, and is gone 1500 ms later
      try {
        assert.ok(
          spy.ringDetectedAtLanding,
          'landing-ring was not detected within 100 ms of landing sound'
        );
        assert.ok(
          spy.ringGoneAfter1500,
          'landing-ring is still present 1500 ms later'
        );
        console.log(`  [PASS f] landing-ring detected within 100 ms and removed 1500 ms later`);
      } catch (err) {
        console.error(`  [FAIL f] ${err.message}`);
        allFailures.push(`[${vp.name}] Check f: ${err.message}`);
      }

      // Check g: A spy on navigator.vibrate shows exactly 1 call, with 20
      try {
        console.log(`  navigator.vibrate calls:`, spy.vibrateCalls);
        assert.strictEqual(
          spy.vibrateCalls.length,
          1,
          `Expected 1 vibrate call, got ${spy.vibrateCalls.length}`
        );
        assert.strictEqual(
          spy.vibrateCalls[0],
          20,
          `Expected vibrate(20), got vibrate(${JSON.stringify(spy.vibrateCalls[0])})`
        );
        console.log(`  [PASS g] navigator.vibrate called exactly once with 20`);
      } catch (err) {
        console.error(`  [FAIL g] ${err.message}`);
        allFailures.push(`[${vp.name}] Check g: ${err.message}`);
      }

      // Check i: Total click-to-landing time is between 4000 and 5200 ms
      const totalTimeMs = spy.landingTime - spy.clickTime;
      try {
        console.log(`  Total click-to-landing duration: ${totalTimeMs.toFixed(1)} ms`);
        assert.ok(
          totalTimeMs >= 4000 && totalTimeMs <= 5200,
          `Total click-to-landing time (${totalTimeMs.toFixed(1)} ms) outside [4000, 5200]`
        );
        console.log(`  [PASS i] Total click-to-landing time: ${totalTimeMs.toFixed(1)} ms (within 4000-5200 ms)`);
      } catch (err) {
        console.error(`  [FAIL i] ${err.message}`);
        allFailures.push(`[${vp.name}] Check i: ${err.message}`);
      }

      await context.close();
    }

    // Check h: Reduced motion emulation: no landing-ring, no vibrate call
    console.log(`\n----------------------------------------------------`);
    console.log(`Testing reduced motion mode`);
    console.log(`----------------------------------------------------`);
    const rmContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce'
    });
    const rmPage = await rmContext.newPage();
    await rmPage.addInitScript(() => {
      localStorage.setItem('daily_dive_onboarding_seen', 'true');
      localStorage.setItem('daily_dive_first_run_dismissed', 'true');
      localStorage.setItem('daily_dive_guest_settings', JSON.stringify({
        sound_enabled: true,
        haptics_enabled: true
      }));
    });
    await rmPage.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

    await rmPage.evaluate(() => {
      window.__rmSpy = {
        vibrateCalls: []
      };
      if (typeof navigator !== 'undefined') {
        navigator.vibrate = function(p) {
          window.__rmSpy.vibrateCalls.push(p);
          return true;
        };
      }
    });

    const rmBtn = rmPage.locator('#spin button[data-testid="primary-spin-button"]');
    await rmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await rmBtn.click();
    await rmPage.waitForTimeout(600);

    const rmSpy = await rmPage.evaluate(() => {
      const ring = document.querySelector('[data-testid="landing-ring"]');
      return {
        hasRing: !!ring,
        vibrateCalls: window.__rmSpy.vibrateCalls
      };
    });

    try {
      assert.strictEqual(rmSpy.hasRing, false, 'landing-ring must not exist when reduced motion is on');
      assert.strictEqual(rmSpy.vibrateCalls.length, 0, 'navigator.vibrate must not be called when reduced motion is on');
      console.log(`  [PASS h] Reduced motion: no landing-ring and no vibrate calls`);
    } catch (err) {
      console.error(`  [FAIL h] ${err.message}`);
      allFailures.push(`[Reduced Motion] Check h: ${err.message}`);
    }
    await rmContext.close();

    console.log('\n================================================================');
    if (allFailures.length > 0) {
      console.error(`TEST FINISHED WITH ${allFailures.length} FAILURES:`);
      allFailures.forEach(f => console.error(` - ${f}`));
      console.log('================================================================\n');
      process.exit(1);
    } else {
      console.log('ALL SPIN FINISH TESTS PASSED SUCCESSFULLY!');
      console.log('================================================================\n');
    }

  } finally {
    await browser.close();
    server.close();
  }
}

runSpinFinishTests().catch((err) => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});
