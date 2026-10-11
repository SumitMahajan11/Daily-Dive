import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir) {
  const mimeTypes = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json'
  };
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const resolvedPath = path.resolve(distDir, '.' + reqPath);
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      const ext = path.extname(resolvedPath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(resolvedPath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function runAudioTest() {
  const { server, port } = await serveStatic(path.resolve('dist'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/`);

    // Install Web Audio API Gain spy
    const result = await page.evaluate(() => {
      const AudioController = window.__daily_dive_audio;
      AudioController.soundEnabled = true;

      const gainValues = [];
      const origCreateGain = AudioContext.prototype.createGain;
      AudioContext.prototype.createGain = function() {
        const gainNode = origCreateGain.call(this);
        const origSetValue = gainNode.gain.setValueAtTime.bind(gainNode.gain);
        gainNode.gain.setValueAtTime = function(val, time) {
          gainValues.push(Number(val.toFixed(4)));
          return origSetValue(val, time);
        };
        return gainNode;
      };

      // Test tick volume at start (progress = 0) and landing (progress = 1)
      AudioController.playTick(0);
      const tickStart = gainValues[gainValues.length - 1];

      AudioController.playTick(1);
      const tickEnd = gainValues[gainValues.length - 1];

      // Test landing sounds
      const lenBeforeLanding = gainValues.length;
      AudioController.playLanding();
      const landingGains = gainValues.slice(lenBeforeLanding);

      // Test sound disabled
      AudioController.soundEnabled = false;
      const countBeforeDisabled = gainValues.length;
      AudioController.playTick(0.5);
      AudioController.playLanding();
      const disabledCalls = gainValues.length - countBeforeDisabled;

      return {
        tickStart,
        tickEnd,
        landingGains,
        disabledCalls
      };
    });

    console.log('Audio Spy Results:', JSON.stringify(result, null, 2));

    // Verify tick volume raised by ~50% (was 0.07 -> 0.105, 0.10 -> 0.15)
    assert.strictEqual(result.tickStart, 0.105, 'Tick volume at progress 0 must be 0.105 (was 0.07)');
    assert.strictEqual(result.tickEnd, 0.15, 'Tick volume at progress 1 must be 0.15 (was 0.10)');

    // Verify landing thud and chime raised by ~50% (thud was 0.24 -> 0.36, chime was 0.12 -> 0.18)
    assert.strictEqual(result.landingGains[0], 0.36, 'Landing thud gain must be 0.36 (was 0.24)');
    assert.strictEqual(result.landingGains[1], 0.18, 'Landing chime note 1 must be 0.18 (was 0.12)');
    assert.strictEqual(result.landingGains[2], 0.18, 'Landing chime note 2 must be 0.18 (was 0.12)');
    assert.strictEqual(result.landingGains[3], 0.18, 'Landing chime note 3 must be 0.18 (was 0.12)');

    // Verify all gain values <= 1.0
    for (const g of [result.tickStart, result.tickEnd, ...result.landingGains]) {
      assert.ok(g <= 1.0, `Gain value ${g} must be <= 1.0 to prevent clipping`);
    }

    // Verify sound disabled produces 0 audio calls
    assert.strictEqual(result.disabledCalls, 0, 'Disabled sound must produce 0 audio gain calls');

    console.log('[PASS] Audio spy test passed successfully.');
  } finally {
    await browser.close();
    server.close();
  }
}

runAudioTest().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
