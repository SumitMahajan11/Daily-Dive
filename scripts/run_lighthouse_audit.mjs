import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { spawn } from 'child_process';
import fs from 'fs';

async function runAudit() {
  console.log('Starting preview server for Lighthouse audit...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  await new Promise(r => setTimeout(r, 2500));

  let chrome;
  try {
    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        disabled: false
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      }
    };

    const runnerResult = await lighthouse('http://localhost:4173', options);
    const lhr = runnerResult.lhr;

    const perfScore = Math.round((lhr.categories.performance?.score || 0) * 100);
    const a11yScore = Math.round((lhr.categories.accessibility?.score || 0) * 100);
    const bpScore = Math.round((lhr.categories['best-practices']?.score || 0) * 100);
    const seoScore = Math.round((lhr.categories.seo?.score || 0) * 100);

    const lcp = lhr.audits['largest-contentful-paint']?.displayValue || 'N/A';
    const tbt = lhr.audits['total-blocking-time']?.displayValue || 'N/A';
    const cls = lhr.audits['cumulative-layout-shift']?.displayValue || 'N/A';
    const fcp = lhr.audits['first-contentful-paint']?.displayValue || 'N/A';
    const si = lhr.audits['speed-index']?.displayValue || 'N/A';

    console.log('\n========================================================');
    console.log('       LIGHTHOUSE MOBILE AUDIT RESULTS (ROUND 4)        ');
    console.log('========================================================');
    console.log(`Performance:    ${perfScore}/100`);
    console.log(`Accessibility:  ${a11yScore}/100`);
    console.log(`Best Practices: ${bpScore}/100`);
    console.log(`SEO:            ${seoScore}/100`);
    console.log('--------------------------------------------------------');
    console.log(`LCP (Largest Contentful Paint): ${lcp}`);
    console.log(`TBT (Total Blocking Time):      ${tbt}`);
    console.log(`CLS (Cumulative Layout Shift):  ${cls}`);
    console.log(`FCP (First Contentful Paint):   ${fcp}`);
    console.log(`Speed Index:                    ${si}`);
    console.log('========================================================\n');

  } finally {
    if (chrome) await chrome.kill();
    server.kill();
  }
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
