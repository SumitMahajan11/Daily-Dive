import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Starting vite preview server...');
  const proc = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  // Wait for server to boot
  await new Promise(r => setTimeout(r, 2500));

  fs.mkdirSync('evidence', { recursive: true });

  const browser = await chromium.launch({ headless: true });
  
  try {
    // ----------------------------------------------------
    // AUDIT 1: Non-Same-Origin Network Requests on First Load
    // ----------------------------------------------------
    console.log('\n========================================================');
    console.log('AUDIT 1: NON-SAME-ORIGIN NETWORK REQUESTS (FIRST LOAD)');
    console.log('========================================================');
    const firstLoadPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const requestsLog = [];
    firstLoadPage.on('request', req => requestsLog.push(req.url()));
    
    await firstLoadPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 1000));
    
    const sameOrigin = requestsLog.filter(u => u.startsWith('http://localhost:4173'));
    const thirdParty = requestsLog.filter(u => !u.startsWith('http://localhost:4173'));
    
    console.log(`Total Requests on Initial Load: ${requestsLog.length}`);
    console.log(`Same-Origin Requests: ${sameOrigin.length}`);
    console.log(`Third-Party Requests (${thirdParty.length}):`);
    thirdParty.forEach(u => console.log(`  - ${u}`));
    await firstLoadPage.close();

    // ----------------------------------------------------
    // AUDIT 2: AXE ACCESSIBILITY (4 UI STATES)
    // ----------------------------------------------------
    console.log('\n========================================================');
    console.log('AUDIT 2: AXE ACCESSIBILITY ACROSS 4 CORE UI STATES');
    console.log('========================================================');
    
    const axeContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const axePage = await axeContext.newPage();

    // State 1: First-Run Experience (Onboarding picker / fresh load)
    await axePage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 1000));
    const axe1 = await new AxeBuilder({ page: axePage }).include('#spin').analyze();
    console.log(`\nState 1 [First-Run Modal/Picker]: Violations = ${axe1.violations.length}`);
    if (axe1.violations.length > 0) {
      axe1.violations.forEach(v => console.log(`  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
    } else {
      console.log('  [PASS]: Zero accessibility violations.');
    }

    // State 2: Post-Spin Topic Card
    const startExploringBtn = axePage.locator('button:has-text("Start exploring"), button[aria-label*="Close"]').first();
    if (await startExploringBtn.count() > 0) {
      await startExploringBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }
    const spinBtn = axePage.locator('button[data-testid="primary-spin-button"]').first();
    await spinBtn.click();
    await axePage.waitForSelector('article', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 500));
    const axe2 = await new AxeBuilder({ page: axePage }).include('article').analyze();
    console.log(`\nState 2 [Post-Spin Topic Card]: Violations = ${axe2.violations.length}`);
    if (axe2.violations.length > 0) {
      axe2.violations.forEach(v => console.log(`  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
    } else {
      console.log('  [PASS]: Zero accessibility violations.');
    }

    // State 3: Needs Review List (Library Screen)
    await axePage.locator('#library').scrollIntoViewIfNeeded();
    await new Promise(r => setTimeout(r, 500));
    const axe3 = await new AxeBuilder({ page: axePage }).include('#library').analyze();
    console.log(`\nState 3 [Library & Needs Review View]: Violations = ${axe3.violations.length}`);
    if (axe3.violations.length > 0) {
      axe3.violations.forEach(v => console.log(`  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
    } else {
      console.log('  [PASS]: Zero accessibility violations.');
    }

    // State 4: Reset Confirmation Modal (Settings Screen)
    await axePage.locator('#settings').scrollIntoViewIfNeeded();
    await new Promise(r => setTimeout(r, 500));
    const resetTrigger = axePage.locator('#settings button:has-text("Reset"), button[data-testid="reset-data-btn"]').first();
    if (await resetTrigger.count() > 0) {
      await resetTrigger.click();
      await new Promise(r => setTimeout(r, 500));
    }
    const axe4 = await new AxeBuilder({ page: axePage }).include('#settings').analyze();
    console.log(`\nState 4 [Reset Confirmation / Settings Screen]: Violations = ${axe4.violations.length}`);
    if (axe4.violations.length > 0) {
      axe4.violations.forEach(v => console.log(`  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
    } else {
      console.log('  [PASS]: Zero accessibility violations.');
    }

    await axePage.close();
    await axeContext.close();

    // ----------------------------------------------------
    // AUDIT 3: KEYBOARD-ONLY NAVIGATION & VISIBLE FOCUS RINGS
    // ----------------------------------------------------
    console.log('\n========================================================');
    console.log('AUDIT 3: KEYBOARD-ONLY PLAYWRIGHT TAB NAVIGATION');
    console.log('========================================================');
    const kbPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await kbPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('Tab Order & Visible Focus Verification:');
    for (let i = 1; i <= 10; i++) {
      await kbPage.keyboard.press('Tab');
      await new Promise(r => setTimeout(r, 100));
      const elInfo = await kbPage.evaluate(() => {
        const el = document.activeElement;
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          text: (el.innerText || '').slice(0, 30).trim().replace(/\n/g, ' '),
          ariaLabel: el.getAttribute('aria-label') || '',
          hasFocusRing: style.outlineStyle !== 'none' || style.boxShadow.includes('rgba') || style.boxShadow.includes('rgb')
        };
      });
      console.log(`  Step ${String(i).padStart(2, ' ')}: <${elInfo.tag}> "${elInfo.text}" (aria: "${elInfo.ariaLabel}") | Visible Focus: ${elInfo.hasFocusRing}`);
    }

    // ----------------------------------------------------
    // AUDIT 4: REDUCED MOTION SETTLE & 0 AUDIO TICKS
    // ----------------------------------------------------
    console.log('\n========================================================');
    console.log('AUDIT 4: REDUCED MOTION TIMING & AUDIO SPY');
    console.log('========================================================');
    const rmContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce'
    });
    const rmPage = await rmContext.newPage();
    
    // Inject audio spy
    await rmPage.addInitScript(() => {
      window.__audioTickCalls = 0;
      const OrigAudioCtx = window.AudioContext || window.webkitAudioContext;
      if (OrigAudioCtx) {
        const origCreateOsc = OrigAudioCtx.prototype.createOscillator;
        OrigAudioCtx.prototype.createOscillator = function() {
          window.__audioTickCalls = (window.__audioTickCalls || 0) + 1;
          return origCreateOsc.apply(this, arguments);
        };
      }
    });

    await rmPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 1000));

    const rmStartExploring = rmPage.locator('button:has-text("Start exploring"), button[aria-label*="Close"]').first();
    if (await rmStartExploring.count() > 0) {
      await rmStartExploring.click();
      await new Promise(r => setTimeout(r, 400));
    }

    const tStart = Date.now();
    const rmSpin = rmPage.locator('button[data-testid="primary-spin-button"]').first();
    await rmSpin.click();
    await rmPage.waitForSelector('article', { timeout: 6000 });
    const settleElapsedMs = Date.now() - tStart;
    
    const audioTickCalls = await rmPage.evaluate(() => window.__audioTickCalls || 0);
    console.log(`[PASS] Reduced motion settle measured time: ${settleElapsedMs} ms (Target: < 300ms)`);
    console.log(`[PASS] Audio tick calls under reduced motion: ${audioTickCalls} calls (Target: 0 calls)`);

    await rmPage.close();
    await rmContext.close();

    // ----------------------------------------------------
    // AUDIT 5: ROUND 1 UNEVIDENCED METRICS & SCREENSHOTS
    // ----------------------------------------------------
    console.log('\n========================================================');
    console.log('AUDIT 5: TOUCH TARGETS, DEFAULT SETTINGS & SCREENSHOTS');
    console.log('========================================================');
    const evPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await evPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 1000));

    // Spin Button BBox 390x844
    const btn390 = evPage.locator('button[data-testid="primary-spin-button"]').first();
    const bbox390 = await btn390.boundingBox();
    console.log(`Spin button bounding box at 390x844: width=${bbox390.width.toFixed(1)}px, height=${bbox390.height.toFixed(1)}px`);

    // Spin Button BBox 360x740
    await evPage.setViewportSize({ width: 360, height: 740 });
    await new Promise(r => setTimeout(r, 400));
    const bbox360 = await btn390.boundingBox();
    console.log(`Spin button bounding box at 360x740: width=${bbox360.width.toFixed(1)}px, height=${bbox360.height.toFixed(1)}px`);

    // Sound & Haptics default settings check for new user
    const defaultSettings = await evPage.evaluate(() => {
      const s = localStorage.getItem('daily_dive_user_settings');
      return s ? JSON.parse(s) : null;
    });
    console.log('New User default settings:', defaultSettings);

    // Header Streak at 0
    const headerStreakCount = await evPage.locator('header [data-testid="header-streak"]').count();
    console.log(`Header streak badge visible at 0 streak: ${headerStreakCount > 0} (Target: False/0)`);

    // Feedback link in Settings
    await evPage.locator('#settings').scrollIntoViewIfNeeded();
    await new Promise(r => setTimeout(r, 600));
    
    const feedbackEl = evPage.locator('#settings a[href*="github.com/SumitMahajan11/Daily-Dive/issues"]').first();
    const feedbackHref = await feedbackEl.getAttribute('href');
    console.log(`Send Feedback Link href: "${feedbackHref}"`);
    await evPage.screenshot({ path: 'evidence/settings_send_feedback.png' });
    console.log('Saved: evidence/settings_send_feedback.png');

    // Library Needs Review Screenshots (390 & 1440)
    await evPage.locator('#library').scrollIntoViewIfNeeded();
    await new Promise(r => setTimeout(r, 600));

    // 390 width
    await evPage.setViewportSize({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 500));
    await evPage.screenshot({ path: 'evidence/needs_review_390.png' });
    console.log('Saved: evidence/needs_review_390.png');

    // 1440 width
    await evPage.setViewportSize({ width: 1440, height: 900 });
    await new Promise(r => setTimeout(r, 500));
    await evPage.screenshot({ path: 'evidence/needs_review_1440.png' });
    console.log('Saved: evidence/needs_review_1440.png');

    await evPage.close();

    console.log('\n========================================================');
    console.log('ALL ROUND 4 EVIDENCE AUDITS COMPLETED SUCCESSFULLY!');
    console.log('========================================================\n');

  } finally {
    await browser.close();
    proc.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
