import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4187) {
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

async function testUploadRealRoadmap() {
  console.log('=== [EXTRACTOR] REAL ROADMAP.MD UPLOAD UI TEST ===\n');

  const distDir = path.resolve('dist');
  const server = await serveStatic(distDir, 4187);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Loading Daily Dive and scrolling to Library...');
  await page.goto('http://localhost:4187/');
  await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
  await page.reload();
  await page.waitForSelector('#spin');

  await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
  await page.waitForTimeout(600);

  const chooseFileBtn = page.locator('#library button:has-text("Choose a file")').first();
  await chooseFileBtn.waitFor({ state: 'visible', timeout: 5000 });

  console.log('2. Triggering file chooser via real upload UI button...');
  const realRoadmapPath = path.resolve('tests/fixtures/real_roadmap.md');
  assert.ok(fs.existsSync(realRoadmapPath), 'tests/fixtures/real_roadmap.md must exist');

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    chooseFileBtn.click()
  ]);

  console.log(`3. Selecting real ROADMAP file: ${realRoadmapPath}`);
  await fileChooser.setFiles(realRoadmapPath);

  console.log('4. Waiting for extraction and Candidate Review UI...');
  const reviewHeading = page.locator('h3:has-text("Review Extracted Topics")');
  await reviewHeading.waitFor({ state: 'visible', timeout: 15000 });

  // Extract rendered candidates from the review list
  const candidateCards = page.locator('div[role="button"][aria-pressed]');
  const count = await candidateCards.count();
  console.log(`\nExtracted ${count} candidate topics from real ROADMAP.md:\n`);

  assert.ok(count > 0, 'Must extract at least one candidate topic from real ROADMAP.md');

  const candidates = [];
  for (let i = 0; i < count; i++) {
    const card = candidateCards.nth(i);
    const title = (await card.locator('h4').textContent()).trim();
    const desc = (await card.locator('p').first().textContent()).trim();
    const tagElements = await card.locator('span.font-mono, span.rounded-md').allTextContents();
    const tags = tagElements.map(t => t.trim()).filter(Boolean);

    candidates.push({ index: i + 1, title, description: desc, tags });
    console.log(`Candidate ${i + 1}:`);
    console.log(`  Title:       ${title}`);
    console.log(`  Description: ${desc}`);
    console.log(`  Tags:        ${tags.join(', ')}`);
    console.log('');

    // Assert description starts with a capital letter
    assert.match(desc, /^[A-Z]/, `Description for "${title}" must start with a capital letter`);
    
    // Assert stoplisted words are not present in tags
    const STOPLIST = ['one', 'real', 'primary', 'throughout', 'approach', 'completed', 'verified'];
    for (const stop of STOPLIST) {
      assert.ok(
        !tags.map(t => t.toLowerCase()).includes(stop),
        `Tag "${stop}" should be excluded by stoplist for candidate "${title}"`
      );
    }
  }

  console.log('[PASS]: Real ROADMAP.md successfully uploaded and verified through in-app UI.');

  await browser.close();
  server.close();
}

testUploadRealRoadmap().catch(err => {
  console.error('\n[FAIL]: Real ROADMAP upload test failed:', err);
  process.exit(1);
});
