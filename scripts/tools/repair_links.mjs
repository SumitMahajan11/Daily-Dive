import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { fileURLToPath } from 'node:url';
import { getSignificantWords, countSharedWords, extractTitle } from './check_links.mjs';

const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const canonicalFile = path.join(rootDir, 'data', 'topics.curated.json');
const reportFile = path.join(rootDir, 'reports', 'link_audit.json');

const USER_AGENT = 'DailyDiveLinkChecker/1.0 (https://github.com/SumitMahajan11/daily-dive; sumitnmahajann11@gmail.com)';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanString(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const fetchCache = new Map();

export async function fetchPage(urlStr) {
  if (fetchCache.has(urlStr)) return fetchCache.get(urlStr);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('TIMEOUT')), 10000);
  try {
    const res = await fetch(urlStr, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timer);
    if (res.status >= 400) {
      fetchCache.set(urlStr, null);
      return null;
    }
    const finalUrl = res.url || urlStr;
    const html = await res.text();
    const title = extractTitle(html);
    const result = {
      status: res.status,
      finalUrl,
      title
    };
    fetchCache.set(urlStr, result);
    return result;
  } catch {
    clearTimeout(timer);
    fetchCache.set(urlStr, null);
    return null;
  }
}

const wikiSearchCache = new Map();

export async function searchWikipedia(query) {
  if (!query || query.trim().length < 2) return [];
  const clean = query.trim();
  if (wikiSearchCache.has(clean)) return wikiSearchCache.get(clean);

  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(clean)}&utf8=&format=json`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!res.ok) {
      wikiSearchCache.set(clean, []);
      return [];
    }
    const data = await res.json();
    const hits = (data.query && data.query.search) || [];
    const results = [];
    for (const hit of hits.slice(0, 3)) {
      if (hit.title.includes('(disambiguation)')) continue;
      results.push(hit.title);
    }
    wikiSearchCache.set(clean, results);
    return results;
  } catch {
    wikiSearchCache.set(clean, []);
    return [];
  }
}

export async function repairCatalog() {
  const topics = JSON.parse(fs.readFileSync(canonicalFile, 'utf8'));
  const audit = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : {};

  printLog('====================================================');
  printLog('       RUNNING ORDERED LINK REPAIR PIPELINE         ');
  printLog('====================================================');

  let totalLinksBefore = 0;
  let repairedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;
  const unresolvedTopicIds = [];

  const KNOWN_ARXIV_FIXES = {
    'https://arxiv.org/abs/1906.00707': {
      url: 'https://arxiv.org/abs/1806.03377',
      label: 'PipeDream: Fast and Efficient Pipeline Parallel DNN Training (Narayanan et al.)'
    },
    'https://arxiv.org/abs/2407.21783': {
      url: 'https://arxiv.org/abs/2407.21783',
      label: 'The Llama 3 Herd of Models (Meta AI)'
    },
    'https://arxiv.org/abs/2310.06825': {
      url: 'https://arxiv.org/abs/2310.06825',
      label: 'Mistral 7B (arXiv:2310.06825)'
    },
    'https://arxiv.org/abs/2307.01952': {
      url: 'https://arxiv.org/abs/2307.01952',
      label: 'SDXL: Improving Latent Diffusion Models (Stability AI)'
    },
    'https://arxiv.org/abs/1605.06431': {
      url: 'https://arxiv.org/abs/1605.06431',
      label: 'Residual Networks Behave Like Ensembles of Relatively Shallow Networks (Veit et al.)'
    },
    'https://arxiv.org/abs/1805.04154': {
      url: 'https://arxiv.org/abs/1805.08612',
      label: 'Auger, Jugé, Nicaud, Pivoteau: On the Worst-Case Complexity of TimSort (ESA 2015)'
    }
  };

  const KNOWN_DOC_FIXES = {
    'http://www.paulgraham.com/makersschedule.html': {
      url: 'https://www.paulgraham.com/makersschedule.html',
      label: "Maker's Schedule, Manager's Schedule"
    },
    'http://leancoffee.org/': {
      url: 'https://leancoffee.org/',
      label: 'Lean Coffee | Start one in your city!'
    },
    'http://www.kaaj.com/psych/smorder.html': {
      url: 'https://www.kaaj.com/psych/smorder.html',
      label: '"Silent Messages" -- Description and Ordering Information'
    },
    'https://pytorch.org/vision/main/models/swin_transformer.html': {
      url: 'https://pytorch.org/vision/stable/models/swin_transformer.html',
      label: 'PyTorch SwinTransformer Implementation'
    },
    'https://huggingface.co/docs/peft/conceptual_guides/lora': {
      url: 'https://huggingface.co/docs/peft/en/conceptual_guides/lora',
      label: 'Hugging Face PEFT LoRA Conceptual Guide'
    },
    'https://en.wikipedia.org/wiki/Second_law_of_thermodynamics': {
      url: 'https://en.wikipedia.org/wiki/Second_law_of_thermodynamics',
      label: 'Wikipedia: Second law of thermodynamics'
    }
  };

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const resources = topic.resources || [];
    totalLinksBefore += resources.length;
    const finalResources = [];

    for (let rIdx = 0; rIdx < resources.length; rIdx++) {
      const res = resources[rIdx];

      // 1. Known ArXiv Fixes
      if (KNOWN_ARXIV_FIXES[res.url]) {
        const fix = KNOWN_ARXIV_FIXES[res.url];
        const page = await fetchPage(fix.url);
        if (page && page.status === 200 && countSharedWords(fix.label, page.title) >= 2) {
          finalResources.push({ label: fix.label, url: fix.url });
          audit[fix.url] = {
            status: 'ok',
            httpStatus: 200,
            finalUrl: page.finalUrl,
            title: page.title
          };
          repairedCount++;
          printLog(`[ARXIV KNOWN FIX] ${topic.id}: -> ${fix.url}`);
          continue;
        }
      }

      // 2. Known Doc Fixes
      if (KNOWN_DOC_FIXES[res.url]) {
        const fix = KNOWN_DOC_FIXES[res.url];
        const targetUrl = fix.url;
        const targetLabel = fix.label;
        const page = await fetchPage(targetUrl);
        if (page && page.status === 200 && countSharedWords(targetLabel, page.title) >= 2) {
          finalResources.push({ label: targetLabel, url: targetUrl });
          audit[targetUrl] = {
            status: 'ok',
            httpStatus: 200,
            finalUrl: page.finalUrl,
            title: page.title
          };
          repairedCount++;
          printLog(`[DOC KNOWN FIX] ${topic.id}: -> ${targetUrl}`);
          continue;
        }
      }

      // 3. Existing OK & HTTPS
      const existingAudit = audit[res.url];
      if (existingAudit && existingAudit.status === 'ok' && res.url.startsWith('https://')) {
        finalResources.push(res);
        unchangedCount++;
        continue;
      }

      // 4. HTTP -> HTTPS upgrade
      if (existingAudit && existingAudit.status === 'ok' && res.url.startsWith('http://')) {
        const httpsUrl = res.url.replace(/^http:\/\//, 'https://');
        const page = await fetchPage(httpsUrl);
        if (page && page.status === 200 && countSharedWords(res.label, page.title) >= 2) {
          finalResources.push({ label: res.label, url: httpsUrl });
          audit[httpsUrl] = {
            status: 'ok',
            httpStatus: 200,
            finalUrl: page.finalUrl,
            title: page.title
          };
          repairedCount++;
          printLog(`[HTTP->HTTPS] ${topic.id}: ${res.url} -> ${httpsUrl}`);
          continue;
        }
      }

      // If dead, redirected, or mismatched:
      removedCount++;
      printLog(`[DROPPED UNVERIFIED LINK] ${topic.id}: "${res.label}" (${res.url})`);
    }

    // If topic now has 0 valid resources, search Wikipedia for the concept (Step 3b)
    if (finalResources.length === 0) {
      const cleanTopicTitle = topic.title
        .replace(/^The\s+/i, '')
        .replace(/\s*\([^)]*\)\s*$/, '')
        .trim();

      const searchQueries = [
        cleanTopicTitle,
        topic.id.replace(/-/g, ' ')
      ];

      let foundWiki = null;

      for (const q of searchQueries) {
        if (!q || q.length < 2) continue;
        await sleep(300);
        const candidateTitles = await searchWikipedia(q);

        for (const hitTitle of candidateTitles) {
          // Strict concept validation
          const cleanHit = hitTitle.replace(/\([^)]*\)/g, '').trim().toLowerCase();
          const cleanQ = q.toLowerCase();
          const cleanTitle = cleanTopicTitle.toLowerCase();

          const exactMatch = cleanHit === cleanQ || cleanHit === cleanTitle;
          const hitSigWords = getSignificantWords(hitTitle.replace(/\([^)]*\)/g, ''));
          const topicSigWords = getSignificantWords(topic.title);
          const topicWordSet = new Set(topicSigWords);

          const commonWithTopic = hitSigWords.filter(w => topicWordSet.has(w)).length;
          const hitWordCoverage = hitSigWords.length > 0 ? (commonWithTopic / hitSigWords.length) : 0;

          const isLegitimateConceptMatch =
            exactMatch ||
            (hitSigWords.length >= 2 && commonWithTopic >= 2 && hitWordCoverage >= 0.5);

          if (!isLegitimateConceptMatch) {
            continue;
          }

          const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(hitTitle.replace(/ /g, '_'))}`;
          await sleep(200);
          const page = await fetchPage(wikiUrl);
          if (!page || page.status !== 200 || !page.title) continue;

          const candidateLabel = `Wikipedia: ${hitTitle}`;
          const sharedWords = countSharedWords(candidateLabel, page.title);

          if (sharedWords >= 2) {
            foundWiki = {
              label: candidateLabel,
              url: wikiUrl,
              pageTitle: page.title
            };
            break;
          }
        }
        if (foundWiki) break;
      }

      if (foundWiki) {
        finalResources.push({
          label: foundWiki.label,
          url: foundWiki.url
        });
        audit[foundWiki.url] = {
          status: 'ok',
          httpStatus: 200,
          finalUrl: foundWiki.url,
          title: foundWiki.pageTitle
        };
        repairedCount++;
        printLog(`[WIKI CONCEPT REPAIR] ${topic.id}: -> ${foundWiki.url} ("${foundWiki.label}")`);
      }
    }

    // Deduplicate
    const seenUrls = new Set();
    const deduped = [];
    for (const r of finalResources) {
      if (!seenUrls.has(r.url)) {
        seenUrls.add(r.url);
        deduped.push(r);
      }
    }

    if (deduped.length === 0) {
      unresolvedTopicIds.push(topic.id);
      topic.resources = [];
      printLog(`[UNRESOLVED TOPIC - GO DEEPER REMOVED] ${topic.id}`);
    } else {
      topic.resources = deduped;
    }
  }

  const totalLinksAfter = topics.reduce((acc, t) => acc + (t.resources || []).length, 0);

  fs.writeFileSync(canonicalFile, JSON.stringify(topics, null, 2), 'utf8');
  fs.writeFileSync(reportFile, JSON.stringify(audit, null, 2), 'utf8');

  printLog('\n====================================================');
  printLog('                 REPAIR SUMMARY                     ');
  printLog('====================================================');
  printLog(`Total links before:            ${totalLinksBefore}`);
  printLog(`Total links after:             ${totalLinksAfter}`);
  printLog(`Unchanged OK links:            ${unchangedCount}`);
  printLog(`Links repaired:                ${repairedCount}`);
  printLog(`Links removed:                 ${removedCount}`);
  printLog(`Topics with Go deeper removed: ${unresolvedTopicIds.length}`);
  if (unresolvedTopicIds.length > 0) {
    printLog('Unresolved topic IDs:');
    for (const tid of unresolvedTopicIds) {
      printLog(`  - ${tid}`);
    }
  }
  printLog('====================================================\n');

  return {
    totalLinksBefore,
    totalLinksAfter,
    repairedCount,
    removedCount,
    unresolvedTopicIds
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  repairCatalog().catch(e => {
    process.stderr.write(`Repair error: ${e.message}\n`);
    process.exit(1);
  });
}
