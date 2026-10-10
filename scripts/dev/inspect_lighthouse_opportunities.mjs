import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { spawn } from 'child_process';

async function inspectOpportunities() {
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    shell: true,
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  await new Promise(r => setTimeout(r, 2000));

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  try {
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance'],
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

    console.log('=== TOP LIGHTHOUSE AUDIT OPPORTUNITIES ===');
    const opps = Object.values(lhr.audits)
      .filter(a => a.details && a.details.type === 'opportunity' && (a.numericValue || 0) > 0)
      .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0));

    opps.forEach((opp, i) => {
      console.log(`[${i + 1}] ${opp.title} (${opp.id}): ${opp.displayValue || opp.numericValue + 'ms'}`);
      console.log(`    Description: ${opp.description}`);
    });

    console.log('\n=== DIAGNOSTICS ===');
    const diags = Object.values(lhr.audits)
      .filter(a => a.score !== null && a.score < 1 && a.details && a.details.type === 'table')
      .sort((a, b) => (a.score || 0) - (b.score || 0));

    diags.slice(0, 5).forEach((d, i) => {
      console.log(`[${i + 1}] ${d.title} (${d.id}): Score=${d.score}`);
    });

  } finally {
    await chrome.kill();
    server.kill();
  }
}

inspectOpportunities().catch(console.error);
