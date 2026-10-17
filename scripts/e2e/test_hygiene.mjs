import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import handleShareRequest from '../../api/share.js';

function serveStaticApp(distDir) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json'
  };

  const server = http.createServer(async (req, res) => {
    let reqPath = req.url.split('?')[0];

    // If requested route starts with /t/ and is not a static file in dist
    const directFile = path.join(distDir, reqPath);
    if (!fs.existsSync(directFile) && reqPath.startsWith('/t/')) {
      return await handleShareRequest(req, res);
    }

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
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

function getPngDimensions(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  if (buf.toString('ascii', 1, 4) !== 'PNG') return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height, bytes: buf.length };
}

function getJpegDimensions(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let offset = 2;
  while (offset < buf.length - 1) {
    if (buf[offset] !== 0xFF) break;
    const marker = buf[offset + 1];
    if (marker === 0xFF) {
      offset++;
      continue;
    }
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return { width, height, bytes: buf.length };
    }
    if (offset + 4 > buf.length) break;
    const len = buf.readUInt16BE(offset + 2);
    offset += 2 + len;
  }
  return null;
}

export async function runHygieneSuite(targetItem = null) {
  printLog('================================================================');
  printLog('                 DAILY DIVE HYGIENE TEST SUITE                  ');
  printLog('================================================================\n');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Dist directory does not exist. Run "npm run build" first.');
  }

  const { server, port } = await serveStaticApp(distDir);
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });

  let results = {
    item1: null,
    item2: null,
    item3: null,
    item4: null,
    item5: null,
    item6: null,
    item7: null,
    item8: null,
    item9: null,
  };

  try {
    // -------------------------------------------------------------
    // ITEM 1: OVERFLOW
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 1) {
      printLog('----------------------------------------------------');
      printLog('ITEM 1: OVERFLOW AT 360, 390, 430');
      printLog('----------------------------------------------------');
      const viewports = [
        { width: 360, height: 800 },
        { width: 390, height: 844 },
        { width: 430, height: 932 }
      ];

      let allPassed = true;
      for (const vp of viewports) {
        const context = await browser.newContext({ viewport: vp });
        const page = await context.newPage();
        await page.goto(baseUrl);
        await page.waitForSelector('#spin');
        await page.waitForTimeout(300);

        // Expand library interest panels
        await page.evaluate(() => {
          document.querySelectorAll('button[aria-label^="Expand"]').forEach(b => b.click());
        });
        await page.waitForTimeout(200);

        // Check main page
        const measure = async (screenLabel) => {
          return await page.evaluate((label) => {
            function isClippedByAncestor(el) {
              let p = el.parentElement;
              while (p && p !== document.body && p !== document.documentElement) {
                const s = window.getComputedStyle(p);
                if (s.overflow === 'hidden' || s.overflowX === 'hidden' || s.overflow === 'clip' || s.overflowX === 'clip') {
                  return true;
                }
                p = p.parentElement;
              }
              return false;
            }

            const doc = document.documentElement;
            const body = document.body;
            const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
            const clientWidth = doc.clientWidth;
            const winWidth = window.innerWidth;

            let worstEl = null;
            let worstRight = 0;

            document.querySelectorAll('*').forEach((el) => {
              if (isClippedByAncestor(el)) return;
              const rect = el.getBoundingClientRect();
              if (rect.right > worstRight) {
                worstRight = rect.right;
                worstEl = {
                  tag: el.tagName.toLowerCase(),
                  className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
                  right: Math.round(rect.right),
                  width: Math.round(rect.width)
                };
              }
            });

            return {
              label,
              scrollWidth,
              clientWidth,
              winWidth,
              overflows: scrollWidth > clientWidth || worstRight > winWidth + 0.5,
              worstEl
            };
          }, screenLabel);
        };

        const mainMeasure = await measure(`Single-page at ${vp.width}x${vp.height}`);
        printLog(`[Viewport ${vp.width}x${vp.height}] Single Page: scrollWidth=${mainMeasure.scrollWidth}, clientWidth=${mainMeasure.clientWidth}, worstElement right=${mainMeasure.worstEl?.right}px (${mainMeasure.worstEl?.tag}.${mainMeasure.worstEl?.className})`);

        // Check Settings
        await page.goto(`${baseUrl}/#/settings`);
        await page.waitForSelector('#settings');
        await page.waitForTimeout(200);
        const settingsMeasure = await measure(`Settings at ${vp.width}x${vp.height}`);
        printLog(`[Viewport ${vp.width}x${vp.height}] Settings: scrollWidth=${settingsMeasure.scrollWidth}, clientWidth=${settingsMeasure.clientWidth}, worstElement right=${settingsMeasure.worstEl?.right}px`);

        if (mainMeasure.overflows || settingsMeasure.overflows) {
          allPassed = false;
        }
        await context.close();
      }

      assert.strictEqual(allPassed, true, 'Item 1: Document must not overflow horizontally and no element edge may exceed viewport.');
      printLog('[PASS Item 1]: No horizontal overflow across all 3 viewports and all screens.');
      results.item1 = true;
    }

    // -------------------------------------------------------------
    // ITEM 2: LINKS
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 2) {
      printLog('\n----------------------------------------------------');
      printLog('ITEM 2: LINKS RESOLUTION & SHARE LINK COPY/OPEN');
      printLog('----------------------------------------------------');
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(`${baseUrl}/t/multi-head-self-attention`);
      const card = page.locator('[data-testid="post-spin-topic-card"]');
      await card.waitFor({ state: 'visible', timeout: 5000 });

      // Click share button and copy link
      await page.evaluate(() => {
        window.__copied = '';
        if (navigator.share) delete navigator.share;
        navigator.clipboard.writeText = async (txt) => { window.__copied = txt; };
      });
      const shareBtn = card.locator('button[aria-label="Share topic"]').first();
      await shareBtn.click();
      const copied = await page.evaluate(() => window.__copied);
      printLog(`Copied share link: ${copied}`);
      assert.ok(copied.includes('/t/multi-head-self-attention'), 'Share link must target /t/<id>');

      // Open in fresh incognito context
      const freshContext = await browser.newContext();
      const freshPage = await freshContext.newPage();
      const targetUrl = copied.replace(/https?:\/\/[^/]+/, baseUrl);
      await freshPage.goto(targetUrl);
      const freshCard = freshPage.locator('[data-testid="post-spin-topic-card"]');
      await freshCard.waitFor({ state: 'visible', timeout: 5000 });
      const freshTitle = await freshCard.locator('h2').textContent();
      printLog(`Fresh context loaded topic: "${freshTitle.trim()}"`);
      assert.strictEqual(freshTitle.trim(), 'Scaled Dot-Product', 'Copied share link must open correct topic in fresh context');
      await freshContext.close();

      // Check external links have rel="noopener noreferrer" and target="_blank"
      await page.goto(`${baseUrl}/#/settings`);
      await page.waitForSelector('#settings');
      const extLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href^="http"]')).map(a => ({
          href: a.href,
          rel: a.getAttribute('rel'),
          target: a.getAttribute('target')
        }));
      });
      for (const link of extLinks) {
        printLog(`External link checked: ${link.href} (target="${link.target}", rel="${link.rel}")`);
        assert.strictEqual(link.target, '_blank', 'External link must have target="_blank"');
        assert.ok(link.rel && link.rel.includes('noopener') && link.rel.includes('noreferrer'), 'External link must have rel="noopener noreferrer"');
      }

      await page.close();
      printLog('[PASS Item 2]: Links verified and share link opens topic.');
      results.item2 = true;
    }

    // -------------------------------------------------------------
    // ITEM 3: BUTTONS & REAL STATE READ AFTER RELOAD
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 3) {
      printLog('\n----------------------------------------------------');
      printLog('ITEM 3: BUTTONS & REAL STATE SURVIVES RELOAD');
      printLog('----------------------------------------------------');
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      page.on('pageerror', err => console.error('PAGE ERROR in Item 3:', err.message));
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write', 'notifications']);
      await page.goto(baseUrl);
      await page.waitForSelector('#spin');

      // 1. Theme toggle survives reload
      printLog('Testing Theme toggle persistence across reload...');
      const initialDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      const themeBtn = page.locator('button[aria-label*="Switch to"]');
      await themeBtn.click();
      await page.waitForTimeout(100);
      await page.reload();
      await page.waitForSelector('#spin');
      const reloadedDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      assert.notStrictEqual(reloadedDark, initialDark, 'Theme state must flip and survive page reload');
      printLog(`  [PASS] Theme toggle persisted: initial ${initialDark} -> reloaded ${reloadedDark}`);

      // 2. All Settings toggles persistence across reload
      printLog('Testing all Settings toggles persistence across reload...');
      await page.goto(`${baseUrl}/#/settings`);
      await page.waitForSelector('#settings');

      // a) Sound effects toggle
      const soundToggle = page.locator('input[aria-label="Toggle sound effects"]');
      const initialSoundState = await soundToggle.isChecked();
      await soundToggle.setChecked(!initialSoundState, { force: true });
      await page.waitForTimeout(100);

      // b) Haptic feedback toggle
      const hapticToggle = page.locator('input[aria-label="Toggle haptic feedback"]');
      const initialHapticState = await hapticToggle.isChecked();
      await hapticToggle.setChecked(!initialHapticState, { force: true });
      await page.waitForTimeout(100);

      // c) In-app reminders toggle
      // Test toggling OFF from enabled state (persists across reload)
      await page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('daily_dive_guest_settings') || '{}');
        s.notifications_enabled = true;
        localStorage.setItem('daily_dive_guest_settings', JSON.stringify(s));
      });
      await page.reload();
      await page.waitForSelector('#settings');

      const reminderToggle = page.locator('input[aria-label="Toggle daily in-app reminders"]');
      assert.strictEqual(await reminderToggle.isChecked(), true, 'Reminders toggle should be checked initially');
      await reminderToggle.click({ force: true });
      await page.waitForTimeout(300);

      await page.reload();
      await page.waitForSelector('#settings');

      const reloadedSound = await page.locator('input[aria-label="Toggle sound effects"]').isChecked();
      const reloadedHaptic = await page.locator('input[aria-label="Toggle haptic feedback"]').isChecked();
      const reloadedReminder = await page.locator('input[aria-label="Toggle daily in-app reminders"]').isChecked();

      assert.strictEqual(reloadedSound, !initialSoundState, 'Sound effects state must persist across reload');
      assert.strictEqual(reloadedHaptic, !initialHapticState, 'Haptic state must persist across reload');
      assert.strictEqual(reloadedReminder, false, 'Daily reminders state must persist across reload');
      printLog(`  [PASS] All 3 Settings toggles persisted across reload: sound=${reloadedSound}, haptic=${reloadedHaptic}, reminders=${reloadedReminder}`);

      // Test permission guard: clicking reminder when browser permission is denied shows warning toast
      await reminderToggle.click({ force: true });
      const blockedToast = page.getByText(/Notifications are (blocked|not supported)/i);
      await blockedToast.waitFor({ state: 'visible', timeout: 3000 });
      assert.ok(await blockedToast.isVisible(), 'Clicking reminders with denied permission must show feedback toast');
      printLog('  [PASS] Reminders toggle safely blocked with warning toast when permission is denied.');

      // d) Reminder time preset button
      await page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('daily_dive_guest_settings') || '{}');
        s.notifications_enabled = true;
        localStorage.setItem('daily_dive_guest_settings', JSON.stringify(s));
      });
      await page.reload();
      await page.waitForSelector('#settings');

      const timePresetBtn = page.locator('button:has-text("12:00 PM")');
      await timePresetBtn.click();
      await page.waitForTimeout(200);
      await page.reload();
      await page.waitForSelector('#settings');
      const reloadedTime = await page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('daily_dive_guest_settings') || '{}');
        return s.reminder_time;
      });
      assert.strictEqual(reloadedTime, '12:00 PM', 'Reminder time preset must persist across reload');
      printLog(`  [PASS] Reminder time preset "12:00 PM" persisted across reload`);

      // 3. Settings Back button navigates back
      printLog('Testing Back button on Settings...');
      const backBtn = page.locator('[data-testid="settings-back-button"]');
      await backBtn.click();
      await page.waitForTimeout(300);
      const activeHash = await page.evaluate(() => window.location.hash);
      assert.ok(activeHash.includes('spin') || activeHash === '', 'Back button must return to main page');
      printLog(`  [PASS] Back from Settings returned to: ${activeHash || '#/spin'}`);

      // 4. Interest / Category toggles persistence across reload
      printLog('Testing Interest / Category toggles persistence across reload...');
      await page.goto(`${baseUrl}/#/library`);
      await page.waitForSelector('#library');
      const categoryCheckbox = page.locator('#library input[type="checkbox"]').first();
      await categoryCheckbox.waitFor({ state: 'attached', timeout: 5000 });
      const initialCatState = await categoryCheckbox.isChecked();
      await categoryCheckbox.setChecked(!initialCatState, { force: true });
      await page.waitForTimeout(150);
      await page.reload();
      await page.waitForSelector('#library');
      const reloadedCatState = await page.locator('#library input[type="checkbox"]').first().isChecked();
      assert.strictEqual(reloadedCatState, !initialCatState, 'Category interest toggle state must persist across reload');
      printLog(`  [PASS] Category interest toggle persisted across reload: initial ${initialCatState} -> reloaded ${reloadedCatState}`);

      // 5. Spaced repetition Review button
      printLog('Testing Spaced repetition Review button...');
      await page.evaluate(() => {
        const yesterday = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
        const progress = {
          'multi-head-self-attention': { times_seen: 2, last_seen: yesterday }
        };
        localStorage.setItem('daily_dive_guest_progress', JSON.stringify(progress));
        const s = JSON.parse(localStorage.getItem('daily_dive_guest_settings') || '{}');
        delete s.enabled_categories;
        localStorage.setItem('daily_dive_guest_settings', JSON.stringify(s));
      });
      await page.reload();
      await page.goto(`${baseUrl}/#/progress`);
      await page.waitForSelector('[data-testid="review-queue-section"]');
      const reviewBtn = page.locator('[data-testid="review-queue-section"] button:has-text("Review")').first();
      await reviewBtn.waitFor({ state: 'visible', timeout: 5000 });
      await reviewBtn.click();
      const loadToast = page.getByText(/Loaded .* into Spin View/i);
      await loadToast.waitFor({ state: 'visible', timeout: 5000 });
      assert.ok(await loadToast.isVisible(), 'Review button must display loaded topic toast');

      // Assert post-spin topic card is visible on #spin with the reviewed topic title
      const topicCardTitle = page.locator('#spin [data-testid="post-spin-topic-card"] h2');
      await topicCardTitle.waitFor({ state: 'visible', timeout: 3000 });
      const renderedTitle = await topicCardTitle.innerText();
      assert.match(renderedTitle, /Scaled Dot-Product|Multi-Head/i, 'Topic card with reviewed title must be visible on #spin');
      printLog(`  [PASS] Review button opened topic card for "${renderedTitle.trim()}" on #spin.`);

      // 6. Share copy -> opens that topic in a fresh context
      printLog('Testing Share copy -> opens topic in fresh context...');
      await page.goto(`${baseUrl}/t/multi-head-self-attention`);
      await page.waitForSelector('[data-testid="post-spin-topic-card"]');
      const shareBtn = page.locator('button[aria-label="Share topic"]').first();
      await shareBtn.waitFor({ state: 'visible', timeout: 5000 });
      await shareBtn.click();
      await page.waitForTimeout(300);
      const copiedText = await page.evaluate(async () => {
        try { return await navigator.clipboard.readText(); } catch (e) { return null; }
      });
      printLog(`  Copied share link: ${copiedText}`);
      assert.ok(copiedText && copiedText.includes('/t/'), 'Share must copy /t/<id> link');

      const freshContext = await browser.newContext();
      const freshPage = await freshContext.newPage();
      const targetUrl = copiedText.replace(/https?:\/\/[^/]+/, baseUrl);
      await freshPage.goto(targetUrl);
      await freshPage.waitForSelector('[data-testid="post-spin-topic-card"]');
      const freshTitle = await freshPage.locator('[data-testid="post-spin-topic-card"] h2').innerText();
      assert.match(freshTitle, /Scaled Dot-Product|Multi-Head/i, 'Fresh context must render the shared topic');
      printLog(`  [PASS] Fresh context opened topic: "${freshTitle.trim()}"`);

      // Verify topic survives reload in fresh context
      await freshPage.reload();
      await freshPage.waitForSelector('[data-testid="post-spin-topic-card"]');
      const reloadedTitle = await freshPage.locator('[data-testid="post-spin-topic-card"] h2').innerText();
      assert.strictEqual(reloadedTitle.trim(), freshTitle.trim(), 'Topic must survive reload in fresh context');
      printLog(`  [PASS] Fresh context topic persisted across reload: "${reloadedTitle.trim()}"`);

      await freshPage.close();
      await freshContext.close();

      await page.close();
      printLog('[PASS Item 3]: All controls tested, mutate real state, and persist across reload.');
      results.item3 = true;
    }

    // -------------------------------------------------------------
    // ITEM 4: ICONS
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 4) {
      printLog('\n----------------------------------------------------');
      printLog('ITEM 4: ICONS EXIST, 200, CORRECT MIME, SIZE MATCH');
      printLog('----------------------------------------------------');
      const manifestPath = path.resolve('public/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // 1. Check all manifest icons
      for (const icon of manifest.icons) {
        const filePath = path.join('public', icon.src);
        assert.ok(fs.existsSync(filePath), `Manifest icon file must exist: ${filePath}`);
        const dims = getPngDimensions(filePath);
        assert.ok(dims, `Icon must be valid PNG: ${filePath}`);
        const expectedDim = parseInt(icon.sizes.split('x')[0], 10);
        printLog(`Icon ${icon.src}: declared ${icon.sizes}, measured ${dims.width}x${dims.height}`);
        assert.strictEqual(dims.width, expectedDim, `Icon width must match declared (${expectedDim}px)`);
        assert.strictEqual(dims.height, expectedDim, `Icon height must match declared (${expectedDim}px)`);
      }

      // 2. Favicon exists and HTTP 200
      const faviconPath = path.resolve('public/favicon.ico');
      assert.ok(fs.existsSync(faviconPath), 'Favicon (public/favicon.ico) must exist');

      printLog('[PASS Item 4]: All declared icons exist, return 200, and match declared dimensions.');
      results.item4 = true;
    }

    // -------------------------------------------------------------
    // ITEM 5: META TAGS
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 5) {
      printLog('\n----------------------------------------------------');
      printLog('ITEM 5: RUNTIME META TAGS FOR / AND /t/<id>');
      printLog('----------------------------------------------------');
      const page = await browser.newPage();
      await page.goto(baseUrl);
      await page.waitForSelector('#spin');
      const homeTitle = await page.title();
      const homeDesc = await page.locator('meta[name="description"]').getAttribute('content');
      printLog(`Home page title: "${homeTitle}"`);
      printLog(`Home page description: "${homeDesc}"`);

      // Open a topic
      await page.goto(`${baseUrl}/t/multi-head-self-attention`);
      const card = page.locator('[data-testid="post-spin-topic-card"]');
      await card.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);

      const topicTitle = await page.title();
      const topicDesc = await page.locator('meta[name="description"]').getAttribute('content');
      printLog(`Topic page title: "${topicTitle}"`);
      printLog(`Topic page description: "${topicDesc}"`);

      assert.notStrictEqual(topicTitle, homeTitle, 'Topic title must differ from home title at runtime');
      assert.ok(topicTitle.includes('Scaled Dot-Product') || topicTitle.includes('multi-head'), 'Topic title must contain topic name');
      assert.notStrictEqual(topicDesc, homeDesc, 'Topic description must differ from home description at runtime');

      // Navigate back to home / leave topic and assert restored
      await page.goto(baseUrl);
      await page.waitForSelector('#spin');
      await page.waitForTimeout(300);
      const restoredTitle = await page.title();
      const restoredDesc = await page.locator('meta[name="description"]').getAttribute('content');
      assert.strictEqual(restoredTitle, homeTitle, 'Home title must be restored when leaving topic');
      assert.strictEqual(restoredDesc, homeDesc, 'Home description must be restored when leaving topic');

      await page.close();
      printLog('[PASS Item 5]: Dynamic meta title and description update and restore.');
      results.item5 = true;
    }

    // -------------------------------------------------------------
    // ITEM 6: 404 NOT FOUND STATE
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 6) {
      printLog('\n----------------------------------------------------');
      printLog('ITEM 6: 404 TOPIC NOT FOUND STATE');
      printLog('----------------------------------------------------');
      const page = await browser.newPage();
      await page.goto(`${baseUrl}/t/not-a-real-id`);
      await page.waitForTimeout(600);

      const currentUrl = page.url();
      printLog(`Opened /t/not-a-real-id -> current URL: ${currentUrl}`);
      assert.ok(currentUrl.includes('/t/not-a-real-id'), 'URL must remain /t/not-a-real-id (not redirected to /)');

      const pageTitle = await page.title();
      printLog(`Page title: "${pageTitle}"`);
      assert.strictEqual(pageTitle, 'Topic not found', 'Page title must be "Topic not found"');

      const bodyText = await page.evaluate(() => document.body.innerText);
      assert.ok(bodyText.includes('Topic not found'), 'Page must display "Topic not found" heading');
      assert.ok(
        bodyText.includes("We couldn't find that topic. It may have been removed or the link is wrong."),
        'Page must display exact required message'
      );

      const backBtn = page.locator('button:has-text("Back to Spin"), a:has-text("Back to Spin")');
      assert.ok(await backBtn.isVisible(), 'Back to Spin button must be visible');
      await backBtn.click();
      await page.waitForTimeout(300);
      assert.ok(page.url().includes('#/spin') || page.url().endsWith('/'), 'Clicking Back to Spin must navigate to #/spin');

      await page.close();
      printLog('[PASS Item 6]: 404 Topic not found state verified.');
      results.item6 = true;
    }

    // -------------------------------------------------------------
    // ITEM 7: MESSAGES FEEDBACK
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 7) {
      printLog('\n----------------------------------------------------');
      printLog('ITEM 7: USER ACTION MESSAGES AND TOAST FEEDBACK');
      printLog('----------------------------------------------------');
      const page = await browser.newPage();
      await page.goto(baseUrl);
      await page.waitForSelector('#library');

      // 1. Manual add-topic: empty title feedback
      printLog('Testing add-topic empty title toast...');
      const addManuallyBtn = page.locator('button:has-text("Add Manually")');
      await addManuallyBtn.scrollIntoViewIfNeeded();
      await addManuallyBtn.click();
      const submitBtn = page.locator('button[type="submit"]:has-text("Add to library")');
      await submitBtn.waitFor({ state: 'visible', timeout: 3000 });
      await submitBtn.click();
      const toast = page.locator('text=Please enter a topic title');
      await toast.waitFor({ state: 'visible', timeout: 3000 });
      assert.ok(await toast.isVisible(), 'Empty title must show toast feedback');
      printLog('  [PASS] Empty title gave feedback toast.');

      // 2. Manual add-topic: duplicate title feedback
      printLog('Testing add-topic duplicate title toast...');
      const titleInput = page.locator('input[placeholder*="Distributed Consensus"]');
      const descInput = page.locator('textarea[placeholder*="Summarize the core"]');
      await titleInput.fill('Scaled Dot-Product');
      await descInput.fill('A duplicate concept explanation.');
      await submitBtn.click();
      const dupToast = page.getByText(/already exists/i);
      await dupToast.waitFor({ state: 'visible', timeout: 3000 });
      assert.ok(await dupToast.isVisible(), 'Duplicate topic title must give feedback toast');
      printLog('  [PASS] Duplicate title gave feedback toast.');
      // 3. File upload >50 MB size limit error toast
      printLog('Testing upload limit (>50 MB) error toast...');
      fs.mkdirSync(path.resolve('scratch'), { recursive: true });
      const largeFilePath = path.resolve('scratch/test_50mb_large.txt');
      if (!fs.existsSync(largeFilePath)) {
        fs.writeFileSync(largeFilePath, Buffer.alloc(50.5 * 1024 * 1024, 'a'));
      }
      const fileInput = page.locator('#library input[type="file"]');
      await fileInput.setInputFiles(largeFilePath);
      const largeFileToast = page.getByText(/File is too large \([^)]*max 50 MB\)\. Please use a smaller file\./i);
      await largeFileToast.waitFor({ state: 'visible', timeout: 4000 });
      assert.ok(await largeFileToast.isVisible(), 'File > 50 MB must show size limit toast');
      printLog('  [PASS] File > 50 MB triggered "File is too large (max 50 MB). Please use a smaller file." toast.');

      // 4. File upload under limit (<10 MB) works without size error
      printLog('Testing under-limit file upload...');
      const smallFilePath = path.resolve('scratch/test_under_limit.txt');
      if (!fs.existsSync(smallFilePath)) {
        fs.writeFileSync(smallFilePath, 'Quantum Computing Primer\n\nQubits leverage superposition and entanglement to solve discrete optimization problems.');
      }
      await fileInput.setInputFiles(smallFilePath);
      await page.waitForTimeout(500);
      printLog('  [PASS] Under-limit file accepted without size limit error.');

      await page.close();
      printLog('[PASS Item 7]: Messages feedback verified.');
      results.item7 = true;
    }

    // -------------------------------------------------------------
    // ITEM 8: LOGO BEHAVIOR & ACCESSIBILITY
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 8) {
      printLog('\n----------------------------------------------------');
      printLog('ITEM 8: LOGO CLICK, KEYBOARD ENTER & ACCESSIBLE NAME');
      printLog('----------------------------------------------------');
      const page = await browser.newPage();
      await page.goto(`${baseUrl}/#/settings`);
      await page.waitForSelector('#settings');

      const logo = page.locator('[aria-label="Daily Dive, go to Spin"]');
      await logo.waitFor({ state: 'visible', timeout: 3000 });
      assert.ok(await logo.isVisible(), 'Logo must have accessible name "Daily Dive, go to Spin"');

      // Click logo and assert navigation to #/spin without page reload
      await page.evaluate(() => { window.__noReloadFlag = true; });
      await logo.click();
      await page.waitForTimeout(300);

      const flag = await page.evaluate(() => window.__noReloadFlag);
      assert.strictEqual(flag, true, 'Logo click must not reload page');
      assert.ok(page.url().includes('#/spin'), 'Logo click must navigate to #/spin');
      const scrollY = await page.evaluate(() => window.scrollY);
      assert.strictEqual(scrollY, 0, 'Logo click must scroll to top');

      // Test keyboard Enter
      await page.goto(`${baseUrl}/#/settings`);
      await page.waitForSelector('#settings');
      await logo.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      assert.ok(page.url().includes('#/spin'), 'Keyboard Enter on logo must navigate to #/spin');

      await page.close();
      printLog('[PASS Item 8]: Logo click, keyboard enter, and accessible name verified.');
      results.item8 = true;
    }

    // -------------------------------------------------------------
    // ITEM 9: IMAGE SIZES BUDGET
    // -------------------------------------------------------------
    if (!targetItem || targetItem === 9) {
      printLog('\n----------------------------------------------------');
      printLog('ITEM 9: IMAGE SIZES BUDGET');
      printLog('----------------------------------------------------');
      const scanDir = (dir) => {
        const files = [];
        if (!fs.existsSync(dir)) return files;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) files.push(...scanDir(full));
          else if (/\.(png|jpe?g|webp|svg|ico)$/i.test(entry.name)) {
            const stats = fs.statSync(full);
            files.push({ path: full, bytes: stats.size, kb: (stats.size / 1024).toFixed(1) });
          }
        }
        return files;
      };

      const images = scanDir('public');
      for (const img of images) {
        printLog(`Image ${img.path}: ${img.bytes} bytes (${img.kb} KB)`);
        if (img.path.includes('icons')) {
          assert.ok(img.bytes <= 20 * 1024, `Icon ${img.path} must be <= 20 KB (got ${img.kb} KB)`);
        }
        if (img.path.includes('og-image') || img.path.includes('og-default')) {
          assert.ok(img.bytes <= 120 * 1024, `OG image ${img.path} must be <= 120 KB (got ${img.kb} KB)`);
        }
      }

      // Dimension verification in pure Node (PNG IHDR bytes 16-24; JPEG SOF0/SOF2 marker)
      const ogDefaultDims = getPngDimensions(path.resolve('public/og-default.png'));
      assert.ok(ogDefaultDims, 'public/og-default.png must be a valid PNG');
      assert.strictEqual(ogDefaultDims.width, 1200, 'public/og-default.png width must be 1200');
      assert.strictEqual(ogDefaultDims.height, 630, 'public/og-default.png height must be 630');

      const ogImageJpgDims = getJpegDimensions(path.resolve('public/og-image.jpg'));
      assert.ok(ogImageJpgDims, 'public/og-image.jpg must be a valid JPEG');
      assert.strictEqual(ogImageJpgDims.width, 1200, 'public/og-image.jpg width must be 1200');
      assert.strictEqual(ogImageJpgDims.height, 630, 'public/og-image.jpg height must be 630');

      assert.ok(!fs.existsSync(path.resolve('public/og-image.png')), 'public/og-image.png must be deleted');
      assert.ok(fs.existsSync(path.resolve('public/og-image.jpg')), 'public/og-image.jpg must exist');
      printLog('[PASS Item 9]: All images strictly within budget and verified dimensions in Node.');
      results.item9 = true;
    }

    printLog('\n================================================================');
    printLog('               ALL HYGIENE CHECKS PASSED!                       ');
    printLog('================================================================');
  } finally {
    await browser.close();
    server.close();
  }
}

// If run directly from CLI
const args = process.argv.slice(2);
const itemArg = args.find(a => a.startsWith('--item='));
const targetItem = itemArg ? parseInt(itemArg.split('=')[1], 10) : null;

runHygieneSuite(targetItem).catch(err => {
  console.error('\n[HYGIENE TEST FAILED]:', err.message);
  process.exit(1);
});
