import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const previewUrl = 'https://daily-dive-git-product-polish-1b-sumitnmahajan01-5449s-projects.vercel.app';
const fallbackUrl = 'http://127.0.0.1:4194';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  fs.mkdirSync('evidence/15', { recursive: true });

  let targetUrl = previewUrl;
  try {
    const res = await page.goto(previewUrl, { waitUntil: 'networkidle', timeout: 15000 });
    if (!res || res.status() >= 400) throw new Error('Preview returned ' + (res ? res.status() : 'no response'));
  } catch (err) {
    console.log('Falling back to local static preview server: ' + err.message);
    targetUrl = fallbackUrl;
  }

  // Set onboarded state
  await page.addInitScript(() => {
    localStorage.setItem('daily_dive_onboarding_seen', 'true');
  });

  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Capture Spin Screen
  await page.evaluate(() => document.getElementById('spin')?.scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'evidence/15/phone_spin_card.png' });
  console.log('Saved evidence/15/phone_spin_card.png');

  // 2. Capture Library Screen
  await page.evaluate(() => document.getElementById('library')?.scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'evidence/15/phone_library.png' });
  console.log('Saved evidence/15/phone_library.png');

  await browser.close();
}

capture().catch(console.error);
