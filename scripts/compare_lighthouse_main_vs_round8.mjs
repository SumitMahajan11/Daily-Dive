import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

function serveStatic(distDir, port) {
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

async function runLighthousePass(port, rawJsonPath) {
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

  if (rawJsonPath) {
    fs.writeFileSync(rawJsonPath, JSON.stringify(report, null, 2), 'utf8');
  }

  return {
    perf: Math.round((report.categories.performance?.score || 0) * 100),
    a11y: Math.round((report.categories.accessibility?.score || 0) * 100),
    bp: Math.round((report.categories['best-practices']?.score || 0) * 100),
    seo: Math.round((report.categories.seo?.score || 0) * 100),
    fcp: report.audits['first-contentful-paint']?.numericValue || 0,
    lcp: report.audits['largest-contentful-paint']?.numericValue || 0,
    tbt: report.audits['total-blocking-time']?.numericValue || 0,
    cls: report.audits['cumulative-layout-shift']?.numericValue || 0
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

async function auditBranch(branchName, distDir, port, outPrefix, evidenceDir) {
  console.log(`\n================================================================`);
  console.log(`   RUNNING 5 LIGHTHOUSE AUDITS ON: ${branchName}`);
  console.log(`   Dist Directory: ${distDir} | Port: ${port}`);
  console.log(`================================================================\n`);

  const server = await serveStatic(distDir, port);
  const runs = [];

  for (let i = 1; i <= 5; i++) {
    const rawPath = path.resolve(evidenceDir, `${outPrefix}_run_${i}.json`);
    console.log(`Executing ${branchName} Run ${i}/5...`);
    const res = await runLighthousePass(port, rawPath);
    runs.push(res);
    console.log(`  Run ${i}: Perf=${res.perf} | A11y=${res.a11y} | BP=${res.bp} | SEO=${res.seo} | FCP=${Math.round(res.fcp)}ms | LCP=${Math.round(res.lcp)}ms | TBT=${Math.round(res.tbt)}ms | CLS=${res.cls.toFixed(3)}`);
    console.log(`  -> Saved raw report: ${rawPath}`);
  }

  server.close();

  return {
    branch: branchName,
    runs,
    perf: stats(runs.map(r => r.perf)),
    a11y: stats(runs.map(r => r.a11y)),
    bp: stats(runs.map(r => r.bp)),
    seo: stats(runs.map(r => r.seo)),
    fcp: stats(runs.map(r => r.fcp)),
    lcp: stats(runs.map(r => r.lcp)),
    tbt: stats(runs.map(r => r.tbt)),
    cls: stats(runs.map(r => r.cls))
  };
}

async function main() {
  const evidenceDir = path.resolve('evidence/round-8');
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  // 1. Audit main (Baseline)
  const mainDist = path.resolve('../daily-dive-main-worktree/dist');
  const mainStats = await auditBranch('main (Baseline)', mainDist, 4175, 'lighthouse_main', evidenceDir);

  // 2. Audit polish/round-8
  const round8Dist = path.resolve('dist');
  const round8Stats = await auditBranch('polish/round-8 (Optimized First Spin & SW)', round8Dist, 4174, 'lighthouse_round8', evidenceDir);

  console.log('\n\n================================================================');
  console.log('         LIGHTHOUSE 5-RUN COMPARISON REPORT (MAIN vs ROUND-8)    ');
  console.log('================================================================\n');

  console.log('--- [1] CATEGORY SCORES (Min / Median / Max) ---');
  console.log(`Performance       | main: ${mainStats.perf.min} / ${mainStats.perf.median} / ${mainStats.perf.max} | round-8: ${round8Stats.perf.min} / ${round8Stats.perf.median} / ${round8Stats.perf.max}`);
  console.log(`Accessibility     | main: ${mainStats.a11y.min} / ${mainStats.a11y.median} / ${mainStats.a11y.max} | round-8: ${round8Stats.a11y.min} / ${round8Stats.a11y.median} / ${round8Stats.a11y.max}`);
  console.log(`Best Practices    | main: ${mainStats.bp.min} / ${mainStats.bp.median} / ${mainStats.bp.max} | round-8: ${round8Stats.bp.min} / ${round8Stats.bp.median} / ${round8Stats.bp.max}`);
  console.log(`SEO               | main: ${mainStats.seo.min} / ${mainStats.seo.median} / ${mainStats.seo.max} | round-8: ${round8Stats.seo.min} / ${round8Stats.seo.median} / ${round8Stats.seo.max}`);

  console.log('\n--- [2] CORE WEB VITALS (Median values) ---');
  console.log(`FCP (ms)          | main: ${Math.round(mainStats.fcp.median)}ms | round-8: ${Math.round(round8Stats.fcp.median)}ms`);
  console.log(`LCP (ms)          | main: ${Math.round(mainStats.lcp.median)}ms | round-8: ${Math.round(round8Stats.lcp.median)}ms`);
  console.log(`TBT (ms)          | main: ${Math.round(mainStats.tbt.median)}ms | round-8: ${Math.round(round8Stats.tbt.median)}ms`);
  console.log(`CLS               | main: ${mainStats.cls.median.toFixed(3)} | round-8: ${round8Stats.cls.median.toFixed(3)}`);

  console.log('\n================================================================');
  console.log('All 10 raw Lighthouse JSON reports saved to evidence/round-8/');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('[FAIL]: Lighthouse comparison failed:', err);
  process.exit(1);
});
