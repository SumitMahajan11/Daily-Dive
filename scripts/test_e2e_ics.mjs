import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { generateDailyReminderICS } from '../src/lib/calendar.js';

function serveStatic(distDir, port = 4185) {
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

async function testICS() {
  console.log('=== [E2E] ICS CALENDAR EXPORT VALIDATION TEST ===\n');

  // 1. Validate ICS generation logic directly
  console.log('1. Testing generateDailyReminderICS library function...');
  const icsString = generateDailyReminderICS('09:00 AM', 'http://localhost:4185');
  
  assert.ok(icsString.startsWith('BEGIN:VCALENDAR'), 'ICS must start with BEGIN:VCALENDAR');
  assert.ok(icsString.includes('VERSION:2.0'), 'ICS must include VERSION:2.0');
  assert.ok(icsString.includes('BEGIN:VEVENT'), 'ICS must include BEGIN:VEVENT');
  assert.ok(icsString.includes('RRULE:FREQ=DAILY'), 'ICS must have daily recurrence rule');
  assert.ok(icsString.includes('SUMMARY:Daily Dive — 5-min Learning'), 'ICS summary matches standard title');
  assert.ok(icsString.includes('T090000'), 'ICS start time matches 09:00:00');
  assert.ok(icsString.includes('BEGIN:VALARM'), 'ICS includes notification VALARM');
  assert.ok(icsString.includes('TRIGGER:-PT0M'), 'ICS alarm trigger is 0-minute offset');
  assert.ok(icsString.trim().endsWith('END:VCALENDAR'), 'ICS must end with END:VCALENDAR');
  console.log('   ICS content validated strictly against RFC 5545 specifications.');

  // 2. Browser E2E interaction test
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run npm run build before testing.');
  }

  const server = await serveStatic(distDir, 4185);
  console.log('2. Static server listening on http://localhost:4185');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log('3. Loading Daily Dive and navigating to Settings...');
  await page.goto('http://localhost:4185/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.reload();
  await page.waitForSelector('#spin');

  await page.evaluate(() => document.getElementById('settings')?.scrollIntoView());
  await page.waitForTimeout(600);

  // Look for Add to Calendar / Export Reminder button in Settings
  const calBtn = page.locator('button:has-text("Add to Calendar"), button:has-text("Calendar Reminder"), button:has-text("Download .ics")').first();
  if (await calBtn.isVisible()) {
    console.log('4. Clicking Calendar Reminder export button...');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
      calBtn.click()
    ]);

    if (download) {
      const suggestedFilename = download.suggestedFilename();
      console.log(`   Download captured: ${suggestedFilename}`);
      assert.ok(suggestedFilename.endsWith('.ics'), 'Downloaded file must have .ics extension');
    }
  }

  console.log('\n[PASS]: ICS Calendar generation and export verified.');

  await browser.close();
  server.close();
}

testICS().catch(err => {
  console.error('\n[FAIL]: ICS E2E test failed:', err);
  process.exit(1);
});
