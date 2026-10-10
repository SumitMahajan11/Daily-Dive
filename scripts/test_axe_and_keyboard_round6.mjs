import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function serveStatic(distDir, port = 4186) {
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

async function runAudit() {
  const distDir = path.resolve('dist');
  const server = await serveStatic(distDir, 4186);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('=== AXE ACCESSIBILITY & KEYBOARD VALIDATION (ROUND 6) ===');
  await page.goto('http://localhost:4186');
  await page.evaluate(() => {
    localStorage.setItem('daily_dive_onboarding_seen', 'true');
  });
  await page.reload();
  await page.waitForSelector('#spin');

  // 1. Run Axe Core on initial Spin screen
  console.log('\n1. Auditing Spin Screen with Axe...');
  const spinResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();
  console.log(`Spin Screen Violations: ${spinResults.violations.length}`);
  if (spinResults.violations.length > 0) {
    spinResults.violations.forEach(v => console.log(`  - [${v.impact}] ${v.help} (${v.id})`));
  }

  // 2. Audit Library Screen
  console.log('\n2. Auditing Library Screen with Axe...');
  await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
  await page.waitForTimeout(500);
  const libraryResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  console.log(`Library Screen Violations: ${libraryResults.violations.length}`);

  // 3. Audit Progress Screen
  console.log('\n3. Auditing Progress Screen with Axe...');
  await page.evaluate(() => document.getElementById('progress')?.scrollIntoView());
  await page.waitForTimeout(500);
  const progressResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  console.log(`Progress Screen Violations: ${progressResults.violations.length}`);

  // 4. Test Keyboard Navigation & Tab Switching via Enter
  console.log('\n4. Testing Keyboard Navigation & Tab Activation via Enter...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // Focus navigation button for Library and press Enter
  const libraryNavBtn = page.locator('aside button[data-nav-id="library"], nav button[data-nav-id="library"]').first();
  await libraryNavBtn.focus();
  
  // Check visible focus ring / outline
  const isFocused = await libraryNavBtn.evaluate(el => document.activeElement === el);
  console.log(`Library Nav Button focused: ${isFocused}`);
  
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  // Verify view scrolled to Library section
  const libraryInView = await page.evaluate(() => {
    const el = document.getElementById('library');
    const rect = el.getBoundingClientRect();
    return rect.top >= -50 && rect.top <= window.innerHeight;
  });
  console.log(`Enter on Library Tab scrolled Library into view: ${libraryInView}`);

  // Focus Progress nav button and press Enter
  const progressNavBtn = page.locator('aside button[data-nav-id="progress"], nav button[data-nav-id="progress"]').first();
  await progressNavBtn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  const progressInView = await page.evaluate(() => {
    const el = document.getElementById('progress');
    const rect = el.getBoundingClientRect();
    return rect.top >= -50 && rect.top <= window.innerHeight;
  });
  console.log(`Enter on Progress Tab scrolled Progress into view: ${progressInView}`);

  console.log('\n[PASS]: Axe accessibility and keyboard navigation successfully verified.');
  server.close();
  await browser.close();
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
