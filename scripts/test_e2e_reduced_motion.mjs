import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

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
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

async function testReducedMotion() {
  console.log('=== [E2E] PREFERS-REDUCED-MOTION LATENCY & AUDIO TEST ===\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" before testing.');
  }

  const { server, port } = await serveStatic(distDir);
  console.log(`1. Static server listening on http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });
  
  // Emulate reduced motion preference
  const context = await browser.newContext({
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();

  console.log('2. Loading app with reducedMotion: "reduce"...');
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => {
    localStorage.setItem('daily_dive_onboarding_seen', 'true');
    localStorage.setItem('daily_dive_first_run_dismissed', 'true');
  });
  await page.reload();
  await page.waitForSelector('#spin');

  // Verify media query evaluation in browser
  const matchesReducedMotion = await page.evaluate(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  console.log(`   (prefers-reduced-motion: reduce) matches: ${matchesReducedMotion}`);
  assert.equal(matchesReducedMotion, true, 'Browser must report prefers-reduced-motion: reduce');

  // Spy on audio controller calls
  console.log('3. Installing AudioController spy in browser...');
  await page.evaluate(() => {
    window.__audio_ticks = 0;
    window.__audio_landings = 0;
    if (window.__daily_dive_audio) {
      const origTick = window.__daily_dive_audio.playTick.bind(window.__daily_dive_audio);
      const origLanding = window.__daily_dive_audio.playLanding.bind(window.__daily_dive_audio);
      window.__daily_dive_audio.playTick = (...args) => {
        window.__audio_ticks++;
        return origTick(...args);
      };
      window.__daily_dive_audio.playLanding = (...args) => {
        window.__audio_landings++;
        return origLanding(...args);
      };
    }
  });

  // Focus Spin button
  console.log('4. Focusing Spin button and triggering Space key press...');
  const spinBtn = page.locator('#spin button[data-testid="primary-spin-button"], #spin button').filter({ hasText: /spin|dive/i }).first();
  await spinBtn.focus();

  const isFocused = await spinBtn.evaluate(el => document.activeElement === el);
  assert.equal(isFocused, true, 'Spin button must receive keyboard focus');

  // Measure latency from Space keypress to result visible
  const startTime = Date.now();
  await page.keyboard.press('Space');

  await page.waitForSelector('#spin article h2, #spin article h3, #spin [data-testid="topic-title"], #spin h2', { timeout: 5000 });
  const latencyMs = Date.now() - startTime;
  console.log(`   Latency from keypress to result visible: ${latencyMs} ms`);

  // Hard assertion: latency < 300ms
  assert.ok(latencyMs < 300, `Result must appear in < 300ms under reduced motion. Took: ${latencyMs}ms`);

  // Spy on audio: tick = 0, landing = 1
  const audioStats = await page.evaluate(() => ({
    ticks: window.__audio_ticks || 0,
    landings: window.__audio_landings || 0
  }));
  console.log(`   AudioController Spies: ticks = ${audioStats.ticks}, landings = ${audioStats.landings}`);

  assert.equal(audioStats.ticks, 0, `Tick sound must not play under reduced motion (expected 0, got ${audioStats.ticks})`);
  assert.equal(audioStats.landings, 1, `Landing sound must play exactly once on result arrival (expected 1, got ${audioStats.landings})`);

  console.log('\n[PASS]: Reduced motion latency (<300ms) and audio (tick=0, landing=1) verified with hard assertions.');

  await browser.close();
  server.close();
}

testReducedMotion().catch(err => {
  console.error('\n[FAIL]: Reduced motion E2E test failed:', err);
  process.exit(1);
});
