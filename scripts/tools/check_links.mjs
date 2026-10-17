import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { fileURLToPath } from 'node:url';

const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const canonicalFile = path.join(rootDir, 'data', 'topics.curated.json');
const lessonsFile = path.join(rootDir, 'data', 'lessons.json');
const reportFile = path.join(rootDir, 'reports', 'link_audit.json');

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself', 'just',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'et', 'al', 'via', 'vs', 'com', 'org', 'edu',
  'gov', 'html', 'pdf', 'abs', 'paper', 'article', 'journal', 'proceedings'
]);

export function getSignificantWords(str) {
  if (!str) return [];
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

export function countSharedWords(label, title) {
  const labelWords = new Set(getSignificantWords(label));
  const titleWords = new Set(getSignificantWords(title));
  let count = 0;
  for (const w of labelWords) {
    if (titleWords.has(w)) count++;
  }
  return count;
}

export function isHomepage(urlStr) {
  try {
    const u = new URL(urlStr);
    const p = u.pathname.replace(/\/+$/, '');
    return (p === '' || p === '/') && !u.search;
  } catch {
    return false;
  }
}

export function extractTitle(html) {
  if (!html) return '';
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return '';
  return m[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)) || _)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)) || _)
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractInventory() {
  const topics = JSON.parse(fs.readFileSync(canonicalFile, 'utf8'));
  let lessons = {};
  if (fs.existsSync(lessonsFile)) {
    try {
      lessons = JSON.parse(fs.readFileSync(lessonsFile, 'utf8'));
    } catch {}
  }

  const allEntries = [];
  const urlMap = new Map();
  const domainSet = new Set();
  let etAlCount = 0;
  let authorPaperCount = 0;

  for (const t of topics) {
    for (const r of t.resources || []) {
      if (!r.url) continue;
      const entry = {
        topicId: t.id,
        topicTitle: t.title,
        label: r.label || '',
        url: r.url
      };
      allEntries.push(entry);

      if (!urlMap.has(r.url)) {
        urlMap.set(r.url, {
          url: r.url,
          labels: [],
          topics: []
        });
      }
      const uEntry = urlMap.get(r.url);
      uEntry.labels.push(r.label || '');
      uEntry.topics.push(t.id);

      try {
        const u = new URL(r.url);
        domainSet.add(u.hostname);
      } catch {}

      const label = r.label || '';
      if (/\bet al\.?/i.test(label)) {
        etAlCount++;
      }
      if (
        /\bet al\.?/i.test(label) ||
        /^[A-Z][a-zA-Z\s.,'-]+(\([0-9]{4}\))?:/.test(label) ||
        /\((19|20)\d\d\)/.test(label) ||
        /\b(paper|arxiv|proceedings|journal)\b/i.test(label)
      ) {
        authorPaperCount++;
      }
    }
  }

  return {
    topicsCount: topics.length,
    lessonsCount: Object.keys(lessons).length,
    totalUrls: allEntries.length,
    uniqueUrls: urlMap.size,
    uniqueDomains: domainSet.size,
    etAlCount,
    authorPaperCount,
    urlMap,
    allEntries
  };
}

async function fetchUrl(targetUrl, retryCount = 0) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('TIMEOUT')), 25000);
  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    clearTimeout(timer);

    const finalUrl = res.url || targetUrl;
    const httpStatus = res.status;

    if (httpStatus >= 400) {
      if (retryCount < 2 && (httpStatus === 429 || httpStatus >= 500)) {
        await new Promise(r => setTimeout(r, 2000));
        return fetchUrl(targetUrl, retryCount + 1);
      }
      return {
        status: 'dead',
        httpStatus,
        finalUrl,
        title: '',
        error: `HTTP ${httpStatus}`
      };
    }

    if (!isHomepage(targetUrl) && isHomepage(finalUrl)) {
      return {
        status: 'redirected-to-homepage',
        httpStatus,
        finalUrl,
        title: ''
      };
    }

    const html = await res.text();
    const title = extractTitle(html);
    return {
      status: 'success',
      httpStatus,
      finalUrl,
      title
    };
  } catch (err) {
    clearTimeout(timer);
    if (retryCount < 2) {
      await new Promise(r => setTimeout(r, 2000));
      return fetchUrl(targetUrl, retryCount + 1);
    }
    const isTimeout = err.name === 'AbortError' || err.message.includes('TIMEOUT');
    return {
      status: 'dead',
      httpStatus: null,
      finalUrl: targetUrl,
      title: '',
      error: isTimeout ? 'TIMEOUT' : (err.code || err.message)
    };
  }
}

export async function runCheck({ cache = false, maxConcurrent = 3, domainDelayMs = 300 } = {}) {
  const inv = extractInventory();

  printLog('====================================================');
  printLog('              DAILY DIVE LINK AUDIT                 ');
  printLog('====================================================');
  printLog(`Topics:                   ${inv.topicsCount}`);
  printLog(`Lessons:                  ${inv.lessonsCount}`);
  printLog(`Total URLs (resources):   ${inv.totalUrls}`);
  printLog(`Unique URLs:              ${inv.uniqueUrls}`);
  printLog(`Unique Domains:           ${inv.uniqueDomains}`);
  printLog(`Labels naming "et al.":   ${inv.etAlCount}`);
  printLog(`Labels naming author/doc: ${inv.authorPaperCount}`);
  printLog('----------------------------------------------------\n');

  let existingReport = {};
  if (cache && fs.existsSync(reportFile)) {
    try {
      existingReport = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      printLog(`Loaded ${Object.keys(existingReport).length} cached entries from ${reportFile}`);
    } catch {}
  }

  const uniqueUrlList = Array.from(inv.urlMap.values());
  const auditResults = {};

  const domainLastTime = new Map();
  let inFlight = 0;
  let processed = 0;
  const total = uniqueUrlList.length;

  const classCounts = {
    'ok': 0,
    'dead': 0,
    'redirected-to-homepage': 0,
    'title-mismatch': 0
  };

  const domainStats = new Map();

  function recordResult(url, res) {
    auditResults[url] = {
      status: res.status,
      httpStatus: res.httpStatus,
      finalUrl: res.finalUrl,
      title: res.title
    };

    classCounts[res.status] = (classCounts[res.status] || 0) + 1;

    try {
      const dom = new URL(url).hostname;
      if (!domainStats.has(dom)) {
        domainStats.set(dom, { total: 0, ok: 0, dead: 0, 'redirected-to-homepage': 0, 'title-mismatch': 0 });
      }
      const dStat = domainStats.get(dom);
      dStat.total++;
      dStat[res.status] = (dStat[res.status] || 0) + 1;
    } catch {}
  }

  const queue = [];
  for (const item of uniqueUrlList) {
    if (cache && existingReport[item.url] && existingReport[item.url].status === 'ok') {
      recordResult(item.url, existingReport[item.url]);
      processed++;
    } else {
      queue.push(item);
    }
  }

  printLog(`Beginning verification of ${total} unique URLs (${processed} cached, ${queue.length} to fetch, concurrency: ${maxConcurrent}, delay: ${domainDelayMs}ms per domain)...`);

  await new Promise((resolve) => {
    function tryNext() {
      if (processed >= total) {
        return resolve();
      }

      while (inFlight < maxConcurrent && queue.length > 0) {
        const now = Date.now();
        let candidateIdx = -1;
        let waitMs = 0;

        for (let i = 0; i < queue.length; i++) {
          const item = queue[i];
          let dom = '';
          try { dom = new URL(item.url).hostname; } catch {}
          const lastTime = domainLastTime.get(dom) || 0;
          const diff = now - lastTime;
          if (diff >= domainDelayMs) {
            candidateIdx = i;
            waitMs = 0;
            break;
          } else if (candidateIdx === -1 || (domainDelayMs - diff) < waitMs) {
            waitMs = domainDelayMs - diff;
          }
        }

        if (candidateIdx === -1) {
          setTimeout(tryNext, Math.max(10, waitMs));
          return;
        }

        const [item] = queue.splice(candidateIdx, 1);
        let dom = '';
        try { dom = new URL(item.url).hostname; } catch {}
        domainLastTime.set(dom, Date.now());

        inFlight++;

        (async () => {
          const fetchRes = await fetchUrl(item.url);

          let finalStatus = fetchRes.status;
          let sharedWords = 0;

          if (finalStatus === 'success') {
            let maxShared = 0;
            for (const lbl of item.labels) {
              const shared = countSharedWords(lbl, fetchRes.title);
              if (shared > maxShared) maxShared = shared;
            }
            sharedWords = maxShared;

            if (maxShared >= 2) {
              finalStatus = 'ok';
            } else {
              finalStatus = 'title-mismatch';
            }
          }

          recordResult(item.url, {
            status: finalStatus,
            httpStatus: fetchRes.httpStatus,
            finalUrl: fetchRes.finalUrl,
            title: fetchRes.title,
            sharedWords
          });

          processed++;
          inFlight--;

          if (processed % 50 === 0 || processed === total) {
            printLog(`Progress: ${processed}/${total} URLs processed (${classCounts.ok} ok, ${classCounts.dead} dead, ${classCounts['redirected-to-homepage']} redirected, ${classCounts['title-mismatch']} mismatch)`);
            if (!fs.existsSync(path.dirname(reportFile))) {
              fs.mkdirSync(path.dirname(reportFile), { recursive: true });
            }
            fs.writeFileSync(reportFile, JSON.stringify(auditResults, null, 2), 'utf8');
          }

          tryNext();
        })();
      }
    }

    tryNext();
  });

  if (!fs.existsSync(path.dirname(reportFile))) {
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  }
  fs.writeFileSync(reportFile, JSON.stringify(auditResults, null, 2), 'utf8');
  printLog(`\nSaved link audit report to: ${reportFile}\n`);

  printLog('====================================================');
  printLog('                 AUDIT SUMMARY                      ');
  printLog('====================================================');
  printLog(`Total Checked URLs:           ${total}`);
  printLog(`  - OK:                       ${classCounts.ok}`);
  printLog(`  - Dead (4xx, 5xx, DNS, TO): ${classCounts.dead}`);
  printLog(`  - Redirected to Homepage:   ${classCounts['redirected-to-homepage']}`);
  printLog(`  - Title Mismatch:           ${classCounts['title-mismatch']}`);
  printLog('----------------------------------------------------');

  printLog('\nDomain Breakdown (Top 30 by volume):');
  const sortedDomains = Array.from(domainStats.entries()).sort((a, b) => b[1].total - a[1].total);
  printLog('Domain'.padEnd(35) + 'Total'.padStart(8) + 'OK'.padStart(8) + 'Dead'.padStart(8) + 'Redir'.padStart(8) + 'Mism'.padStart(8));
  for (const [dom, st] of sortedDomains.slice(0, 30)) {
    printLog(
      dom.padEnd(35) +
      String(st.total).padStart(8) +
      String(st.ok).padStart(8) +
      String(st.dead).padStart(8) +
      String(st['redirected-to-homepage']).padStart(8) +
      String(st['title-mismatch']).padStart(8)
    );
  }
  printLog('====================================================\n');

  return {
    classCounts,
    domainStats,
    auditResults
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const cacheFlag = args.includes('--cache');
  const inventoryOnly = args.includes('--inventory-only');

  if (inventoryOnly) {
    const inv = extractInventory();
    printLog('=== INVENTORY REPORT ===');
    printLog(`Topics:                   ${inv.topicsCount}`);
    printLog(`Lessons:                  ${inv.lessonsCount}`);
    printLog(`Total URLs (resources):   ${inv.totalUrls}`);
    printLog(`Unique URLs:              ${inv.uniqueUrls}`);
    printLog(`Unique Domains:           ${inv.uniqueDomains}`);
    printLog(`Labels naming "et al.":   ${inv.etAlCount}`);
    printLog(`Labels naming paper/author: ${inv.authorPaperCount}`);
    process.exit(0);
  }

  runCheck({ cache: cacheFlag }).then(({ classCounts }) => {
    const hasFailures = (classCounts.dead > 0 || classCounts['title-mismatch'] > 0 || classCounts['redirected-to-homepage'] > 0);
    if (args.includes('--strict') && hasFailures) {
      process.exit(1);
    }
  }).catch((err) => {
    process.stderr.write(`Link check failed: ${err.message}\n`);
    process.exit(1);
  });
}
