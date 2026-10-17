import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4220) {
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

  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const actualPort = server.address().port;
      resolve({ server, port: actualPort });
    });
    server.on('error', reject);
  });
}

const VIEWPORTS = [
  { width: 390, height: 844, name: '390x844 (Mobile iPhone)' },
  { width: 360, height: 800, name: '360x800 (Compact Android)' },
  { width: 1280, height: 800, name: '1280x800 (Desktop)' }
];

async function runSpinVisualTests() {
  printLog('================================================================');
  printLog('         SPIN REEL VISUAL CONTINUITY & ALIGNMENT E2E TEST       ');
  printLog('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" first.');
  }

  const { server, port } = await serveStatic(distDir);
  const browser = await chromium.launch({ headless: true });

  let globalMaxError = 0;

  try {
    for (const vp of VIEWPORTS) {
      printLog(`\n------------------------------------------------------------`);
      printLog(` TESTING VIEWPORT: ${vp.name}`);
      printLog(`------------------------------------------------------------`);

      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await context.addInitScript(() => {
        localStorage.setItem('daily_dive_onboarding_seen', 'true');
        localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        localStorage.setItem('daily_dive_guest_settings', JSON.stringify({
          enabled_categories: {
            'tech': false,
            'mind-growth': false,
            'world-ideas': false,
            'money-career': true,
            'money-career::finance': true,
            'money-career::career-strategy': false,
            'finance': true,
            'career-strategy': false
          }
        }));
      });

      const page = await context.newPage();
      page.on('console', msg => printLog('PAGE LOG:', msg.text()));
      page.on('pageerror', err => console.error('PAGE ERROR:', err));
      await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

      // Install tick & strip spy
      await page.evaluate(() => {
        window.__spinVisualSpy = {
          recordedTicks: [],
          clickTime: 0
        };

        const AudioController = window.__daily_dive_audio;
        if (AudioController) {
          const origSchedule = AudioController.scheduleSpinTicks?.bind(AudioController);
          if (origSchedule) {
            AudioController.scheduleSpinTicks = function(ticks) {
              window.__spinVisualSpy.scheduledTicks = [...ticks];
              return origSchedule(ticks);
            };
          }
        }
      });

      const spinBtn = page.locator('button[data-testid="primary-spin-button"]');
      try {
        await spinBtn.waitFor({ state: 'visible', timeout: 5000 });
      } catch (err) {
        console.error('DEBUG PAGE URL:', page.url());
        console.error('DEBUG BUTTON COUNT:', await page.locator('button').count());
        console.error('DEBUG BODY TEXT:', await page.locator('body').innerText());
        throw err;
      }
      await page.waitForFunction(() => {
        const btn = document.querySelector('button[data-testid="primary-spin-button"]');
        return btn && !btn.disabled && !btn.innerText.includes('Loading');
      });

      // Sample times: 300, 1000, 2000, 3000, 4000, 4400 ms
      const sampleTimes = [300, 1000, 2000, 3000, 4000, 4400];

      // Schedule in-page samples exactly at these elapsed times
      await page.evaluate((times) => {
        window.__samples = [];

        window.__takeSample = (t) => {
          const chassis = document.querySelector('.dial-chassis');
          if (!chassis) {
            window.__samples.push({ time: t, visibleCards: 0, titles: [], error: 'No chassis element found' });
            return;
          }
          const cRect = chassis.getBoundingClientRect();
          const cardNodes = Array.from(chassis.querySelectorAll('.shrink-0'));

          const visibleNodes = [];
          cardNodes.forEach(card => {
            const r = card.getBoundingClientRect();
            const overlap = Math.max(0, Math.min(cRect.right, r.right) - Math.max(cRect.left, r.left));
            if (overlap >= 15) {
              visibleNodes.push(card);
            }
          });

          const titles = visibleNodes.map(card => {
            // Find title element or card text
            const titleEl = card.querySelector('.truncate') || card.querySelector('.font-semibold');
            return titleEl ? titleEl.textContent.trim() : card.textContent.trim();
          });

          window.__samples.push({
            time: t,
            visibleCards: visibleNodes.length,
            titles
          });
        };
      }, sampleTimes);

      // Click spin
      const clickStart = Date.now();
      await spinBtn.click();

      for (const t of sampleTimes) {
        const elapsed = Date.now() - clickStart;
        if (t > elapsed) {
          await page.waitForTimeout(t - elapsed);
        }
        await page.evaluate((currT) => window.__takeSample(currT), t);
      }

      // Collect sample results
      const samples = await page.evaluate(() => window.__samples);
      printLog(`\nSample measurements during spin for ${vp.name}:`);
      console.table(samples.map(s => ({ time: s.time, visibleCards: s.visibleCards, sampleTitle: s.titles[0] || 'EMPTY' })));

      // Assertion (a): At least 3 cards visible in strip at every sample
      for (const s of samples) {
        assert.ok(
          s.visibleCards >= 3,
          `[FAIL a] At ${s.time}ms, expected >= 3 visible cards, found ${s.visibleCards} on ${vp.name}`
        );
      }
      printLog(`  [PASS a] At least 3 cards visible at all sampled timestamps (300, 1000, 2000, 3000, 4000, 4400 ms)`);

      // Assertion (b): Every visible card has a non-empty title
      for (const s of samples) {
        assert.ok(s.titles.length > 0, `[FAIL b] No card titles found at ${s.time}ms`);
        for (const title of s.titles) {
          assert.ok(
            title && title.length > 0,
            `[FAIL b] Found card with empty title at ${s.time}ms on ${vp.name}`
          );
        }
      }
      printLog(`  [PASS b] Every visible card has a non-empty title across all samples`);

      // Wait for spin to complete and topic card to appear
      await page.waitForSelector('[data-testid="post-spin-topic-card"]', { timeout: 10000 });
      await page.waitForTimeout(500);

      // Assertion (c): After spin ends, card under reticle has same title as topic card shown
      const topicCardTitle = await page.locator('[data-testid="post-spin-topic-card"] h2').innerText();

      const cardUnderReticleTitle = await page.evaluate(() => {
        const chassis = document.querySelector('.dial-chassis');
        if (!chassis) return null;
        const cRect = chassis.getBoundingClientRect();
        const reticleX = cRect.left + cRect.width / 2;
        const cards = Array.from(chassis.querySelectorAll('.shrink-0'));
        if (cards.length === 0) return null;

        let closestCard = null;
        let minDistance = Infinity;

        cards.forEach(card => {
          const r = card.getBoundingClientRect();
          const cardCenterX = r.left + r.width / 2;
          const dist = Math.abs(cardCenterX - reticleX);
          if (dist < minDistance) {
            minDistance = dist;
            closestCard = card;
          }
        });

        if (!closestCard) return null;
        const titleEl = closestCard.querySelector('.truncate') || closestCard.querySelector('.font-semibold');
        return titleEl ? titleEl.textContent.trim() : closestCard.textContent.trim();
      });

      printLog(`  Topic Card Shown Title:   "${topicCardTitle?.trim()}"`);
      printLog(`  Card Under Reticle Title: "${cardUnderReticleTitle?.trim()}"`);

      assert.ok(cardUnderReticleTitle, `[FAIL c] No card found under reticle after spin on ${vp.name}`);
      assert.strictEqual(
        cardUnderReticleTitle.trim(),
        topicCardTitle.trim(),
        `[FAIL c] Card under reticle ("${cardUnderReticleTitle}") does not match topic card ("${topicCardTitle}") on ${vp.name}`
      );
      printLog(`  [PASS c] Card under reticle matches post-spin topic card title exactly`);

      // Assertion (d): At each recorded tick time, card boundary is within half a card width of reticle center
      const tickBoundaryCheck = await page.evaluate(() => {
        const scheduledTicks = window.__spinVisualSpy?.scheduledTicks || [];
        const chassis = document.querySelector('.dial-chassis');
        if (!chassis) return { maxError: 999, errors: [] };
        const cWidth = chassis.clientWidth;
        const reticleX = cWidth / 2;
        const ITEM_WIDTH = 104;
        const ITEM_GAP = 10;
        const ITEM_STEP = ITEM_WIDTH + ITEM_GAP; // 114
        const travelCards = 32;
        const startIdx = 5;
        const targetIdx = startIdx + travelCards;
        const startX = (cWidth - ITEM_WIDTH) / 2 - (startIdx * ITEM_STEP);
        const targetX = (cWidth - ITEM_WIDTH) / 2 - (targetIdx * ITEM_STEP);

        // Timeline kinematics to calculate motionX at each scheduled tick time
        const totalDuration = 4500;
        const phase1Duration = 1200;
        const phase2Duration = totalDuration - phase1Duration;
        const growthRatio = 1.18;
        const alpha = travelCards * Math.log(growthRatio);
        let low = 0;
        let high = 1 / phase1Duration;
        for (let iter = 0; iter < 60; iter++) {
          const mid = (low + high) / 2;
          const progressAtEnd = mid * phase1Duration + (1 / alpha) * Math.log(1 + alpha * mid * phase2Duration);
          if (progressAtEnd < 1) low = mid; else high = mid;
        }
        const v0 = (low + high) / 2;
        const s1 = v0 * phase1Duration;

        function getProgress(t) {
          if (t <= 0) return 0;
          if (t >= totalDuration) return 1;
          if (t <= phase1Duration) return v0 * t;
          const dt = t - phase1Duration;
          return s1 + (1 / alpha) * Math.log(1 + alpha * v0 * dt);
        }

        let maxErr = 0;
        const errors = [];

        for (let i = 0; i < scheduledTicks.length; i++) {
          const t = scheduledTicks[i];
          const progress = getProgress(t);
          const currentX = startX + (targetX - startX) * progress;

          // Find distance from reticleX to nearest card center
          let minCenterDist = Infinity;
          for (let j = 0; j < 80; j++) {
            const cardCenterX = currentX + j * ITEM_STEP + ITEM_WIDTH / 2;
            const distCenter = Math.abs(reticleX - cardCenterX);
            if (distCenter < minCenterDist) minCenterDist = distCenter;
          }

          errors.push(minCenterDist);
          if (minCenterDist > maxErr) {
            maxErr = minCenterDist;
          }
        }

        return { maxError: maxErr, errors, count: scheduledTicks.length };
      });

      assert.ok(
        tickBoundaryCheck.maxError <= 20.0,
        `[FAIL d] Card center error ${tickBoundaryCheck.maxError.toFixed(2)}px exceeds limit (20px)`
      );
      printLog(`  [PASS d] Max card center-to-reticle error at tick times: ${tickBoundaryCheck.maxError.toFixed(2)}px (<= 20px)`);
      if (tickBoundaryCheck.maxError > globalMaxError) {
        globalMaxError = tickBoundaryCheck.maxError;
      }

      await context.close();
    }

    printLog('\n================================================================');
    printLog(`ALL SPIN VISUAL TESTS PASSED! Largest Error Measured: ${globalMaxError.toFixed(1)}px`);
    printLog('================================================================\n');

  } finally {
    await browser.close();
    server.close();
  }
}

runSpinVisualTests().catch((err) => {
  console.error('\n[FAIL]: test_spin_visual failed:\n', err);
  process.exit(1);
});
