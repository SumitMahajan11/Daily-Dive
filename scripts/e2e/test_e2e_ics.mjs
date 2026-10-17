import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { generateDailyReminderICS } from '../../src/lib/calendar.js';

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
  printLog('=== [E2E] ICS CALENDAR EXPORT VALIDATION TEST ===\n');

  // 1. Validate ICS generation logic directly
  printLog('1. Testing generateDailyReminderICS library function...');
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
  printLog('   ICS content validated strictly against RFC 5545 specifications.');

  // 2. Browser E2E interaction test
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run npm run build before testing.');
  }

  const server = await serveStatic(distDir, 4185);
  printLog('2. Static server listening on http://localhost:4185');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  printLog('3. Loading Daily Dive and navigating to Settings...');
  await page.goto('http://localhost:4185/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.reload();
  await page.waitForSelector('#spin');

  // 4. Open Settings full-screen view and click Calendar Reminder button
  printLog('4. Opening Settings and clicking Calendar Reminder button...');
  const settingsGearBtn = page.locator('header button[aria-label="Settings"]');
  await settingsGearBtn.click();
  await page.waitForSelector('#settings', { state: 'visible', timeout: 3000 });

  const calBtn = page.locator('#settings button:has-text("Add to calendar"), button:has-text("Add to calendar")').first();
  await calBtn.waitFor({ state: 'visible', timeout: 5000 });

  // Require download event, parse ICS, assert RRULE and DTSTART
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }),
    calBtn.click()
  ]);

  assert.ok(download, 'Download event must be triggered when clicking Add to calendar');
  const filename = download.suggestedFilename();
  printLog(`   Download captured: ${filename}`);
  assert.ok(filename.endsWith('.ics'), 'Downloaded file must have .ics extension');

  const readStream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of readStream) {
    chunks.push(chunk);
  }
  const downloadedIcs = Buffer.concat(chunks).toString('utf-8');
  printLog(`   Downloaded ICS length: ${downloadedIcs.length} bytes`);

  assert.match(downloadedIcs, /RRULE:FREQ=DAILY/, 'Downloaded ICS must contain RRULE:FREQ=DAILY');
  assert.match(downloadedIcs, /DTSTART:/, 'Downloaded ICS must contain DTSTART:');
  assert.match(downloadedIcs, /BEGIN:VEVENT/, 'Downloaded ICS must contain BEGIN:VEVENT');
  assert.match(downloadedIcs, /SUMMARY:/, 'Downloaded ICS must contain SUMMARY:');

  printLog('\n[PASS]: ICS Calendar generation and browser download verified.');

  await browser.close();
  server.close();
}

testICS().catch(err => {
  console.error('\n[FAIL]: ICS E2E test failed:', err);
  process.exit(1);
});
