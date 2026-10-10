import { spawn } from 'node:child_process';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs';

async function runLighthousePass(port = 4173) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
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
      deviceScaleFactor: 2,
      disabled: false
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1638.4,
      uploadThroughputKbps: 750
    }
  };

  const runnerResult = await lighthouse(`http://localhost:${port}/`, options);
  const report = runnerResult.lhr;
  await chrome.kill();

  return {
    perf: Math.round(report.categories.performance.score * 100),
    a11y: Math.round(report.categories.accessibility.score * 100),
    bp: Math.round(report.categories['best-practices'].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
    fcp: report.audits['first-contentful-paint'].numericValue,
    lcp: report.audits['largest-contentful-paint'].numericValue,
    tbt: report.audits['total-blocking-time'].numericValue,
    cls: report.audits['cumulative-layout-shift'].numericValue,
    opportunities: Object.values(report.audits)
      .filter(a => a.details && a.details.type === 'opportunity' && a.numericValue > 50)
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, 3)
      .map(a => ({ id: a.id, title: a.title, savingsMs: Math.round(a.numericValue) }))
  };
}

function stats(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1]
  };
}

async function main() {
  console.log('=== RUNNING 5 LIGHTHOUSE MOBILE AUDITS ON VITE PREVIEW ===\n');

  // Spawn vite preview
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--host'], {
    shell: true,
    stdio: 'pipe'
  });

  await new Promise(res => setTimeout(res, 2500));

  const runs = [];
  for (let i = 1; i <= 5; i++) {
    console.log(`Executing Run ${i}/5...`);
    const res = await runLighthousePass(4173);
    runs.push(res);
    console.log(`  Run ${i}: Perf=${res.perf} | A11y=${res.a11y} | FCP=${Math.round(res.fcp)}ms | LCP=${Math.round(res.lcp)}ms | TBT=${Math.round(res.tbt)}ms | CLS=${res.cls.toFixed(3)}`);
  }

  preview.kill();

  const perfStats = stats(runs.map(r => r.perf));
  const fcpStats = stats(runs.map(r => r.fcp));
  const lcpStats = stats(runs.map(r => r.lcp));
  const tbtStats = stats(runs.map(r => r.tbt));
  const clsStats = stats(runs.map(r => r.cls));

  console.log('\n=== LIGHTHOUSE 5-RUN SUMMARY (polish/round-6) ===');
  console.log(`Performance Score : Min=${perfStats.min} | Median=${perfStats.median} | Max=${perfStats.max}`);
  console.log(`FCP (ms)          : Min=${Math.round(fcpStats.min)} | Median=${Math.round(fcpStats.median)} | Max=${Math.round(fcpStats.max)}`);
  console.log(`LCP (ms)          : Min=${Math.round(lcpStats.min)} | Median=${Math.round(lcpStats.median)} | Max=${Math.round(lcpStats.max)}`);
  console.log(`TBT (ms)          : Min=${Math.round(tbtStats.min)} | Median=${Math.round(tbtStats.median)} | Max=${Math.round(tbtStats.max)}`);
  console.log(`CLS               : Min=${clsStats.min.toFixed(3)} | Median=${clsStats.median.toFixed(3)} | Max=${clsStats.max.toFixed(3)}`);

  console.log('\nTop 3 Performance Opportunities (from median run):');
  const medianOpportunities = runs[2].opportunities;
  if (medianOpportunities.length > 0) {
    medianOpportunities.forEach((op, idx) => {
      console.log(`  ${idx + 1}. ${op.title} — Potential savings: ~${op.savingsMs} ms (${op.id})`);
    });
  } else {
    console.log('  No high-impact opportunities detected (>50ms savings).');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
