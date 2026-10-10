import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { spawn } from 'child_process';
import fs from 'fs';

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function runLighthouseIteration(port) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  try {
    const options = {
      logLevel: 'error',
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

    const runnerResult = await lighthouse(`http://localhost:${port}`, options);
    const lhr = runnerResult.lhr;

    const perf = Math.round((lhr.categories.performance?.score || 0) * 100);
    const a11y = Math.round((lhr.categories.accessibility?.score || 0) * 100);
    const bp = Math.round((lhr.categories['best-practices']?.score || 0) * 100);
    const seo = Math.round((lhr.categories.seo?.score || 0) * 100);

    const fcp = lhr.audits['first-contentful-paint']?.numericValue || 0;
    const lcp = lhr.audits['largest-contentful-paint']?.numericValue || 0;
    const tbt = lhr.audits['total-blocking-time']?.numericValue || 0;
    const cls = lhr.audits['cumulative-layout-shift']?.numericValue || 0;

    return { perf, a11y, bp, seo, fcp, lcp, tbt, cls };
  } finally {
    if (chrome) await chrome.kill();
  }
}

async function runAudit3Runs(branchLabel = 'polish/round-5') {
  console.log('========================================================');
  console.log(`   LIGHTHOUSE MOBILE 3-RUN AUDIT (${branchLabel})   `);
  console.log('========================================================\n');

  console.log('Starting preview server on port 4173...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  await new Promise(r => setTimeout(r, 2500));

  const runs = [];
  try {
    for (let i = 1; i <= 3; i++) {
      console.log(`[Run ${i}/3] Executing mobile Lighthouse audit...`);
      const res = await runLighthouseIteration(4173);
      runs.push(res);
      console.log(`  -> Run ${i}: Perf=${res.perf}, A11y=${res.a11y}, BP=${res.bp}, SEO=${res.seo}, FCP=${res.fcp.toFixed(0)}ms, LCP=${res.lcp.toFixed(0)}ms, TBT=${res.tbt.toFixed(0)}ms, CLS=${res.cls.toFixed(3)}`);
      await new Promise(r => setTimeout(r, 1000));
    }

    const medPerf = median(runs.map(r => r.perf));
    const medA11y = median(runs.map(r => r.a11y));
    const medBP = median(runs.map(r => r.bp));
    const medSeo = median(runs.map(r => r.seo));
    const medFcp = median(runs.map(r => r.fcp));
    const medLcp = median(runs.map(r => r.lcp));
    const medTbt = median(runs.map(r => r.tbt));
    const medCls = median(runs.map(r => r.cls));

    console.log('\n========================================================');
    console.log(`       MEDIAN LIGHTHOUSE SCORES (${branchLabel})        `);
    console.log('========================================================');
    console.log(`Performance:    ${medPerf}/100`);
    console.log(`Accessibility:  ${medA11y}/100`);
    console.log(`Best Practices: ${medBP}/100`);
    console.log(`SEO:            ${medSeo}/100`);
    console.log('--------------------------------------------------------');
    console.log(`FCP (First Contentful Paint):   ${medFcp.toFixed(1)} ms`);
    console.log(`LCP (Largest Contentful Paint): ${medLcp.toFixed(1)} ms`);
    console.log(`TBT (Total Blocking Time):      ${medTbt.toFixed(1)} ms`);
    console.log(`CLS (Cumulative Layout Shift):  ${medCls.toFixed(3)}`);
    console.log('========================================================\n');

  } finally {
    server.kill();
  }
}

runAudit3Runs(process.argv[2] || 'polish/round-5').catch(err => {
  console.error(err);
  process.exit(1);
});
