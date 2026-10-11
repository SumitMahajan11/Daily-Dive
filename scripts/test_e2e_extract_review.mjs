import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function serveStatic(distDir, port = 4192) {
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

async function testExtractReviewFlow() {
  console.log('================================================================');
  console.log('     EXTRACT TOPICS REVIEW FLOW (E2E PLAYWRIGHT TEST)           ');
  console.log('================================================================\n');

  const distDir = path.resolve('dist');
  assert.ok(fs.existsSync(distDir), 'Production build dist/ must exist');

  const server = await serveStatic(distDir, 4192);
  const browser = await chromium.launch({ headless: true });

  const evidenceDir = path.resolve('evidence/extract-review');
  fs.mkdirSync(evidenceDir, { recursive: true });

  try {
    // ------------------------------------------------------------
    // VIEWPORT: 390x844 (Mobile)
    // ------------------------------------------------------------
    console.log('Testing at 390x844 mobile viewport...');
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    await page.goto('http://localhost:4192/');
    await page.evaluate(() => localStorage.setItem('daily_dive_onboarding_seen', 'true'));
    await page.reload();

    // Navigate to Library
    const libraryNavBtn = page.locator('button[data-nav-id="library"]:visible').first();
    if (await libraryNavBtn.isVisible()) {
      await libraryNavBtn.click();
    } else {
      await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
    }
    await page.waitForTimeout(600);

    const uploadBtn = page.locator('#library button:has-text("Upload notes"), #library button:has-text("Choose a file")').first();
    await uploadBtn.waitFor({ state: 'visible', timeout: 5000 });

    const fixturePath = path.resolve('tests/fixtures/real_roadmap.md');
    assert.ok(fs.existsSync(fixturePath), 'Fixture tests/fixtures/real_roadmap.md must exist');

    // ── CHECK 1: LIST APPEARS BEFORE SAVING ──
    console.log('\n[TEST 1] Uploading real file and verifying review list appears BEFORE saving...');
    const [fileChooser1] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadBtn.click()
    ]);
    await fileChooser1.setFiles(fixturePath);

    const reviewHeading = page.locator('h3:has-text("Review Extracted Topics")');
    await reviewHeading.waitFor({ state: 'visible', timeout: 15000 });

    const rows = page.locator('div[data-testid="review-topic-row"]');
    const initialCount = await rows.count();
    console.log(`  Found ${initialCount} candidate topic rows in review list.`);
    assert.ok(initialCount >= 2, `Expected at least 2 candidate topics, got ${initialCount}`);

    // Verify all rows have checked checkbox by default
    for (let i = 0; i < initialCount; i++) {
      const checkbox = rows.nth(i).locator('input[type="checkbox"]');
      const isChecked = await checkbox.isChecked();
      assert.ok(isChecked, `Row ${i + 1} must be checked by default`);
    }

    // Verify Save button shows correct initial count
    const saveBtn = page.locator(`button:has-text("Save selected (${initialCount})")`);
    await saveBtn.waitFor({ state: 'visible', timeout: 3000 });
    console.log(`  [PASS] Review list appeared with all ${initialCount} topics checked by default.`);

    // Verify topics are NOT yet saved in localStorage
    const savedBefore = await page.evaluate(() => {
      const raw = localStorage.getItem('daily_dive_custom_topics');
      return raw ? JSON.parse(raw) : [];
    });
    assert.equal(savedBefore.length, 0, 'No custom topics should be saved before clicking Save');
    console.log('  [PASS] Verified 0 topics saved before user confirms save.');

    // Save screenshot of the review list at 390x844 under evidence/extract-review/
    const screenshotPath = path.join(evidenceDir, 'review_list_390x844.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  [SCREENSHOT] Saved review list screenshot at 390x844: ${screenshotPath}`);

    // ── CHECK 2: CANCEL SAVES NOTHING ──
    console.log('\n[TEST 2] Verifying Cancel saves nothing...');
    const cancelBtn = page.locator('#library button:has-text("Cancel")').first();
    await cancelBtn.click();
    await page.waitForTimeout(500);

    // Verify review list closed
    const reviewVisibleAfterCancel = await reviewHeading.isVisible();
    assert.ok(!reviewVisibleAfterCancel, 'Review list should close after Cancel');

    // Verify localStorage still contains zero custom topics
    const savedAfterCancel = await page.evaluate(() => {
      const raw = localStorage.getItem('daily_dive_custom_topics');
      return raw ? JSON.parse(raw) : [];
    });
    assert.equal(savedAfterCancel.length, 0, 'Cancel must save nothing');
    console.log('  [PASS] Cancel saved nothing and returned to idle state.');

    // ── CHECK 3 & 4: UNCHECKING A ROW SKIPS IT & EDITING A TITLE IS SAVED ──
    console.log('\n[TEST 3 & 4] Uploading again to test unchecking a row and editing a title...');
    const uploadBtn2 = page.locator('#library button:has-text("Upload notes"), #library button:has-text("Choose a file")').first();
    const [fileChooser2] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadBtn2.click()
    ]);
    await fileChooser2.setFiles(fixturePath);
    await reviewHeading.waitFor({ state: 'visible', timeout: 15000 });

    const rows2 = page.locator('div[data-testid="review-topic-row"]');
    const rowCount2 = await rows2.count();

    // Record original title of first topic to uncheck
    const firstRowTitle = (await rows2.nth(0).locator('input[type="text"]').inputValue()).trim();
    console.log(`  Unchecking row 1 ("${firstRowTitle}")...`);
    await rows2.nth(0).locator('input[type="checkbox"]').uncheck();

    // Verify live update of button text
    const expectedRemaining = rowCount2 - 1;
    const saveBtnRemaining = page.locator(`button:has-text("Save selected (${expectedRemaining})")`);
    await saveBtnRemaining.waitFor({ state: 'visible', timeout: 3000 });
    console.log(`  [PASS] Save button updated live to "Save selected (${expectedRemaining})".`);

    // Edit the title of row 2
    const editedTitle = 'Structural Backbone (Edited for Verification)';
    console.log(`  Editing row 2 title to: "${editedTitle}"...`);
    const secondRowInput = rows2.nth(1).locator('input[type="text"]');
    await secondRowInput.fill(editedTitle);

    // Click Save selected
    console.log('  Clicking Save selected...');
    await saveBtnRemaining.click();
    await page.waitForTimeout(800);

    // Verify review list closed
    const reviewOpenAfterSave = await reviewHeading.isVisible();
    assert.ok(!reviewOpenAfterSave, 'Review list should close after saving');

    // Verify custom topics in localStorage
    const savedCustomTopics = await page.evaluate(() => {
      const raw = localStorage.getItem('daily_dive_custom_topics');
      return raw ? JSON.parse(raw) : [];
    });
    console.log(`  Saved ${savedCustomTopics.length} custom topics.`);
    assert.equal(savedCustomTopics.length, expectedRemaining, `Expected ${expectedRemaining} saved topics`);

    // Verify the edited title is saved
    const hasEditedTitle = savedCustomTopics.some(t => t.title === editedTitle);
    assert.ok(hasEditedTitle, `Saved topics must contain edited title: "${editedTitle}"`);
    console.log(`  [PASS] Editing a title was successfully saved: "${editedTitle}".`);

    // Verify the unchecked row was skipped
    const hasUncheckedTopic = savedCustomTopics.some(t => t.title === firstRowTitle);
    assert.ok(!hasUncheckedTopic, `Unchecked topic "${firstRowTitle}" must NOT be saved`);
    console.log(`  [PASS] Unchecked row ("${firstRowTitle}") was skipped.`);

    // Verify the edited topic is rendered in the Library screen DOM
    const editedTopicEl = page.locator(`text=${editedTitle}`).first();
    await editedTopicEl.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] Edited topic title is visible in Library screen.');

    // ── CHECK 5: IF NOTHING IS CHECKED, SAVE SELECTED IS DISABLED ──
    console.log('\n[TEST 5] Verifying disabled state when nothing is checked...');
    const uploadBtn3 = page.locator('#library button:has-text("Upload notes"), #library button:has-text("Choose a file")').first();
    const [fileChooser3] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadBtn3.click()
    ]);
    await fileChooser3.setFiles(fixturePath);
    await reviewHeading.waitFor({ state: 'visible', timeout: 15000 });

    const rows3 = page.locator('div[data-testid="review-topic-row"]');
    const count3 = await rows3.count();
    for (let i = 0; i < count3; i++) {
      await rows3.nth(i).locator('input[type="checkbox"]').uncheck();
    }

    const disabledSaveBtn = page.locator('button:has-text("Save selected (0)")');
    await disabledSaveBtn.waitFor({ state: 'visible', timeout: 3000 });
    const isDisabled = await disabledSaveBtn.isDisabled();
    assert.ok(isDisabled, 'Save selected button must be disabled when 0 topics are checked');
    console.log('  [PASS] "Save selected (0)" is disabled when nothing is checked.');

    // Cancel out
    await page.locator('#library button:has-text("Cancel")').first().click();
    await page.waitForTimeout(400);

    await context.close();

    console.log('\n================================================================');
    console.log('ALL EXTRACT TOPICS REVIEW FLOW E2E ASSERTIONS PASSED!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

testExtractReviewFlow().catch(err => {
  console.error('\n[FAIL]: Extract review E2E test failed:', err);
  process.exit(1);
});
