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

async function test1a() {
  const { server, port } = await serveStatic(path.resolve('dist'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.evaluate(() => {
      localStorage.clear();
      const enabled = {
        'tech': true,
        'tech::ai-ml': true,
        'ai-ml': true,
        'tech::cloud-infra': false,
        'tech::data-structures-algorithms': false,
        'tech::systems-distributed-computing': false,
        'tech::web-dev': false,
        'money-career': false,
        'mind-growth': false,
        'world-ideas': false
      };
      localStorage.setItem('daily_dive_guest_settings', JSON.stringify({
        content_source: 'curated',
        reminder_time: '09:00 AM',
        notifications_enabled: false,
        sound_enabled: false,
        haptics_enabled: false,
        enabled_categories: enabled
      }));
    });
    await page.reload();
    await page.waitForSelector('[data-testid="spin-group-pill-tech"]');

    const techPressed = await page.getAttribute('[data-testid="spin-group-pill-tech"]', 'aria-pressed');
    const moneyPressed = await page.getAttribute('[data-testid="spin-group-pill-money-career"]', 'aria-pressed');
    const mindPressed = await page.getAttribute('[data-testid="spin-group-pill-mind-growth"]', 'aria-pressed');
    const worldPressed = await page.getAttribute('[data-testid="spin-group-pill-world-ideas"]', 'aria-pressed');

    assert.strictEqual(techPressed, 'true', 'Tech pill must be ON (aria-pressed="true")');
    assert.strictEqual(moneyPressed, 'false', 'Money pill must be OFF (aria-pressed="false")');
    assert.strictEqual(mindPressed, 'false', 'Mind pill must be OFF (aria-pressed="false")');
    assert.strictEqual(worldPressed, 'false', 'World pill must be OFF (aria-pressed="false")');

    // Outline style check
    const moneyClass = await page.getAttribute('[data-testid="spin-group-pill-money-career"]', 'class');
    assert.ok(moneyClass.includes('border-outline-variant'), 'Money pill must have outline style');
  } finally {
    await browser.close();
    server.close();
  }
}

async function test1b() {
  const { server, port } = await serveStatic(path.resolve('dist'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('button[data-testid="primary-spin-button"]');
    await page.click('button[data-testid="primary-spin-button"]');
    await page.waitForSelector('article h2, [data-testid="topic-title"], article h3', { timeout: 10000 });
    const spunTopicTitle = (await page.locator('article h2, [data-testid="topic-title"], article h3').first().innerText()).trim();

    await page.reload();
    await page.waitForTimeout(500);

    // Assert not counted in "to review today"
    const spinText = await page.innerText('body');
    assert.ok(!spinText.includes('to review today'), 'Spun topic must NOT be counted in "to review today"');

    // Assert topic is NOT in Review queue in Progress
    await page.evaluate(() => document.getElementById('progress')?.scrollIntoView());
    await page.waitForTimeout(500);
    const progressText = await page.innerText('#progress');
    assert.ok(!progressText.includes(spunTopicTitle), `Spun topic "${spunTopicTitle}" must NOT be in the Review queue`);
  } finally {
    await browser.close();
    server.close();
  }
}

async function test1c() {
  const { server, port } = await serveStatic(path.resolve('dist'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.evaluate(() => {
      localStorage.setItem('daily_dive_has_spun', 'true');
      localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({
        current_streak: 2,
        longest_streak: 2,
        last_active_date: new Date().toISOString().slice(0, 10)
      }));
    });
    await page.reload();
    await page.waitForSelector('[data-testid="spin-status-line"]');

    const statusLineText = await page.innerText('[data-testid="spin-status-line"]');
    assert.ok(statusLineText.includes('2-day streak'), `Status line must read "2-day streak", found: "${statusLineText}"`);

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

    assert.ok(gap !== null, 'Pixel gap could not be measured');
    assert.ok(gap < 2, `Pixel gap between "2" and "-day" must be < 2px, but measured: ${gap}px`);
  } finally {
    await browser.close();
    server.close();
  }
}

async function test1d() {
  const { server, port } = await serveStatic(path.resolve('dist'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForSelector('header button[aria-label="Settings"]');
    await page.click('header button[aria-label="Settings"]');
    await page.waitForSelector('#settings');
    const settingsText = await page.innerText('#settings');
    assert.ok(!settingsText.includes('Theme'), 'Settings must not contain element with text "Theme"');
    assert.ok(!settingsText.includes('light and dark'), 'Settings must not contain element with text "light and dark"');

    // Hardware / system back button simulation: page.goBack() closes Settings and stays on site
    await page.goBack();
    await page.waitForTimeout(300);
    const settingsVisible = await page.locator('#settings').isVisible();
    assert.strictEqual(settingsVisible, false, 'Settings must be closed after page.goBack()');
    const currentUrl = page.url();
    assert.ok(currentUrl.startsWith(`http://127.0.0.1:${port}`), `URL must still be the site, found: ${currentUrl}`);
  } finally {
    await browser.close();
    server.close();
  }
}

async function main() {
  const which = process.argv[2];
  if (which === '1a') {
    await test1a();
    console.log('[PASS] 1a: saved state pills');
    return;
  }
  if (which === '1b') {
    await test1b();
    console.log('[PASS] 1b: real spin review queue exclusion');
    return;
  }
  if (which === '1c') {
    await test1c();
    console.log('[PASS] 1c: streak status line pixel gap');
    return;
  }
  if (which === '1d') {
    await test1d();
    console.log('[PASS] 1d: settings screen declutter');
    return;
  }

  console.log('Running test 1a (saved state pills)...');
  await test1a();
  console.log('  [PASS] 1a: saved state pills');

  console.log('Running test 1b (real spin review queue exclusion)...');
  await test1b();
  console.log('  [PASS] 1b: real spin review queue exclusion');

  console.log('Running test 1c (streak status line pixel gap)...');
  await test1c();
  console.log('  [PASS] 1c: streak status line pixel gap');

  console.log('Running test 1d (settings screen declutter)...');
  await test1d();
  console.log('  [PASS] 1d: settings screen declutter');

  console.log('[PASS] All Round 17 real-state checks passed successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

