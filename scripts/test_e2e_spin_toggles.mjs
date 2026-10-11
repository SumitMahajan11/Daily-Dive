import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { topics as moneyCareerTopics } from '../src/data/groups/money-career.js';

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

async function testSpinToggles() {
  console.log('=== [E2E] SPIN SCREEN GROUP TOGGLES & 5-SPIN DETERMINISM TEST ===\n');

  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run "npm run build" before testing.');
  }

  const moneyCareerTitleSet = new Set(
    moneyCareerTopics.map(t => t.title.trim().toLowerCase())
  );
  console.log(`1. Loaded ${moneyCareerTopics.length} topics from src/data/groups/money-career.js`);

  const { server, port } = await serveStatic(distDir);
  console.log(`2. Static server listening on http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    reducedMotion: 'reduce' // Instant spin for deterministic test
  });
  const page = await context.newPage();

  try {
    console.log('3. Loading app fresh on Spin screen...');
    await page.goto(`http://localhost:${port}/`);
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForSelector('#spin');
    await page.waitForSelector('#spin button[data-testid="primary-spin-button"]:not([disabled])', { timeout: 10000 });
    await page.waitForTimeout(300);

    // 4. Verify initial state of the 4 group buttons (all ON by default)
    console.log('4. Verifying initial group states (Tech & Mind ON, Money & World OFF in starter categories)...');
    const techBtn = page.locator('#spin button[aria-label="Toggle Tech"]');
    const moneyBtn = page.locator('#spin button[aria-label="Toggle Money"]');
    const mindBtn = page.locator('#spin button[aria-label="Toggle Mind"]');
    const worldBtn = page.locator('#spin button[aria-label="Toggle World"]');

    const techInitial = await techBtn.getAttribute('aria-pressed');
    const moneyInitial = await moneyBtn.getAttribute('aria-pressed');
    const mindInitial = await mindBtn.getAttribute('aria-pressed');
    const worldInitial = await worldBtn.getAttribute('aria-pressed');

    assert.equal(techInitial, 'true', 'Tech button must be aria-pressed="true" initially');
    assert.equal(moneyInitial, 'false', 'Money button must be aria-pressed="false" initially');
    assert.equal(mindInitial, 'true', 'Mind button must be aria-pressed="true" initially');
    assert.equal(worldInitial, 'false', 'World button must be aria-pressed="false" initially');

    // 5. Test Money toggle cycling, then turn OFF Tech, Mind leaving Money ON.
    console.log('5. Testing Money toggle interaction & turning OFF other groups...');
    
    // Turn Money ON
    await moneyBtn.click();
    await page.waitForTimeout(100);
    const moneyToggledOn = await moneyBtn.getAttribute('aria-pressed');
    assert.equal(moneyToggledOn, 'true', 'Money button must be aria-pressed="true" when toggled on');

    // Cycle Money OFF then back ON
    await moneyBtn.click();
    await page.waitForTimeout(100);
    const moneyToggledOff = await moneyBtn.getAttribute('aria-pressed');
    assert.equal(moneyToggledOff, 'false', 'Money button must be aria-pressed="false" when toggled off');

    await moneyBtn.click();
    await page.waitForTimeout(100);

    // Now turn OFF Tech and Mind (leaving only Money active)
    await techBtn.click();
    await page.waitForTimeout(100);
    await mindBtn.click();
    await page.waitForTimeout(100);

    const techAfter = await techBtn.getAttribute('aria-pressed');
    const moneyAfter = await moneyBtn.getAttribute('aria-pressed');
    const mindAfter = await mindBtn.getAttribute('aria-pressed');
    const worldAfter = await worldBtn.getAttribute('aria-pressed');

    assert.equal(techAfter, 'false', 'Tech button must be aria-pressed="false" after toggle');
    assert.equal(moneyAfter, 'true', 'Money button must remain aria-pressed="true"');
    assert.equal(mindAfter, 'false', 'Mind button must be aria-pressed="false" after toggle');
    assert.equal(worldAfter, 'false', 'World button must be aria-pressed="false" after toggle');

    // 6. Spin 5 consecutive times and verify every single landed topic belongs to Money group
    console.log('6. Executing 5 consecutive spins with only Money enabled...');
    for (let i = 1; i <= 5; i++) {
      const spinBtn = page.locator('#spin button[data-testid="primary-spin-button"], #spin button').filter({ hasText: /spin/i }).first();
      await spinBtn.waitFor({ state: 'visible', timeout: 10000 });
      await spinBtn.click();
      await page.waitForSelector('#spin article h2, #spin [data-testid="post-spin-topic-card"] h2', { state: 'visible', timeout: 10000 });

      const title = await page.evaluate(() => {
        const heading = document.querySelector('#spin article h2, #spin [data-testid="post-spin-topic-card"] h2');
        return heading ? heading.textContent.trim() : '';
      });

      console.log(`   [Spin ${i}/5] Landed Topic: "${title}"`);
      assert.ok(title.length > 0, `Spin ${i}: Topic title must be non-empty`);
      const isMoneyTopic = moneyCareerTitleSet.has(title.toLowerCase());
      assert.equal(isMoneyTopic, true, `Spin ${i}: Landed topic "${title}" must belong strictly to Money & Career group!`);
      await page.waitForTimeout(100);
    }

    console.log('\n[PASS]: Spin screen group toggles & 5-spin determinism verified with 100% hard assertions.');
  } finally {
    await browser.close();
    server.close();
  }
}

testSpinToggles().catch(err => {
  console.error('\n[FAIL]: Spin toggles E2E test failed:', err);
  process.exit(1);
});
