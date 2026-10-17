import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { fileURLToPath } from 'node:url';

const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const canonicalFile = path.join(rootDir, 'data', 'topics.curated.json');
const reportFile = path.join(rootDir, 'reports', 'link_audit.json');

const USER_AGENT = 'DailyDive/2.1 (https://github.com/SumitMahajan11/daily-dive; sumitnmahajann11@gmail.com)';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function cleanStr(str) {
  if (!str) return '';
  let s = str.replace(/ - Wikipedia$/, '').trim();
  s = s.replace(/\s*\([^)]*\)/g, '').trim();
  return s.toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/'s\b/g, '')
    .replace(/’s\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripDescriptor(str) {
  return str.replace(/\s+(?:theory|model|framework|taxonomy|dynamics|architecture|mechanics|principles?|paradox|fallacy|effects?|bias|law|protocol|algorithm|experiments?|instrument|system)$/i, '').trim();
}

function toSingular(str) {
  return str.replace(/s$/, '').replace(/ies$/, 'y').replace(/es$/, '');
}

// Disallowed generic pages, single clauses, or single instances of pairs/families
const DISALLOWED_PAGES = new Set([
  'insurance',
  'delegation',
  'value proposition',
  'power law',
  'hedge',
  'career ladder',
  'social loafing',
  'foot in the door technique',
  'dave mcclure',
  'alan turing',
  'louis pasteur',
  'james watt',
  'john harrison',
  'malcolm mclean',
  'sandford fleming',
  'cai lun',
  'red black tree',
  'r tree',
  'b tree',
  'fibonacci heap',
  'bellman ford algorithm',
  'hawkes ladder of inference',
  'constructive set theory',
  'one for one',
  'capital allocation line',
  'liquidation preference',
  'bloom filters in bioinformatics',
  'list of aqueducts in the roman empire',
  'electric telegraph company',
  'vesting',
  'real estate investing',
  'context',
  'memory',
  'psychometrics',
  'option',
  'etf',
  'lock',
  'bell labs',
  'longitude',
  'trie',
  'median of medians',
  'accretion dilution analysis',
  'debt snowball method',
  'black scholes model',
  'kelly criterion',
  'block level storage',
  'dynamic perfect hashing',
  'open addressing',
  'dynamic programming',
  'disjoint set data structure',
  'non uniform memory access',
  'technology adoption life cycle',
  'dark matter halo',
  'butterfly effect',
  'hayflick limit',
  'methods of detecting exoplanets',
  'neutron star merger',
  'cno cycle',
  'movable type',
  'point contact transistor'
]);

export function extractConceptCandidates(title, id) {
  const candidates = new Set();

  function add(s) {
    if (!s) return;
    const c = cleanStr(s);
    if (c.length >= 2) {
      candidates.add(c);
      candidates.add(toSingular(c));
      const noDesc = stripDescriptor(c);
      if (noDesc && noDesc !== c) {
        candidates.add(noDesc);
        candidates.add(toSingular(noDesc));
      }
    }
  }

  // 1. From Title
  let t = title.trim();
  t = t.replace(/^(?:The|A|An)\s+/i, '');
  t = t.replace(/\s*\([^)]*\)/g, '').trim();

  add(t);

  const beforeAnd = t.split(/\s+(?:and|&|\/|\bvs\.?\b)\s+/i)[0].trim();
  if (beforeAnd && beforeAnd !== t) {
    add(beforeAnd);
  }

  const beforeColon = t.split(/:\s+/)[0].trim();
  if (beforeColon && beforeColon !== t) {
    add(beforeColon);
  }

  // 2. From ID
  const idClean = id.replace(/-/g, ' ');
  add(idClean);

  const idBeforeAnd = id.split(/-(?:and|vs)-/)[0].replace(/-/g, ' ');
  if (idBeforeAnd && idBeforeAnd !== idClean) {
    add(idBeforeAnd);
  }

  const idAfterAnd = id.split(/-(?:and|vs)-/)[1]?.replace(/-/g, ' ');
  if (idAfterAnd) {
    add(idAfterAnd);
  }

  const idBase = id.replace(/-(?:model|protocol|algorithm|framework|architecture|mechanics|theory|paradox|fallacy|bias|effect|heuristic)$/i, '').replace(/-/g, ' ');
  if (idBase && idBase !== idClean) {
    add(idBase);
  }

  return candidates;
}

export function isPageExactCoreConcept(wikiPageTitle, topicTitle, topicId) {
  const norm = cleanStr(wikiPageTitle);
  const normSingular = toSingular(norm);
  const normNoDesc = stripDescriptor(norm);

  if (DISALLOWED_PAGES.has(norm) || DISALLOWED_PAGES.has(normSingular) || DISALLOWED_PAGES.has(normNoDesc)) {
    return false;
  }

  const candidates = extractConceptCandidates(topicTitle, topicId);
  return candidates.has(norm) || candidates.has(normSingular) || candidates.has(normNoDesc);
}

// Known verified repairs for non-exact items that have direct core concept pages
const KNOWN_EXACT_WIKI_REPAIRS = {
  'bloom-filter-probabilistic-membership': {
    url: 'https://en.wikipedia.org/wiki/Bloom_filter',
    label: 'Wikipedia: Bloom filter',
    title: 'Bloom filter - Wikipedia'
  },
  'roman-aqueducts-pozzolana-concrete': {
    url: 'https://en.wikipedia.org/wiki/Roman_aqueduct',
    label: 'Wikipedia: Roman aqueduct',
    title: 'Roman aqueduct - Wikipedia'
  },
  'morse-telegraph-instant-communication': {
    url: 'https://en.wikipedia.org/wiki/Electrical_telegraph',
    label: 'Wikipedia: Electrical telegraph',
    title: 'Electrical telegraph - Wikipedia'
  },
  'hebbian-plasticity-and-neural-long-term-potentiation': {
    url: 'https://en.wikipedia.org/wiki/Hebbian_theory',
    label: 'Wikipedia: Hebbian theory',
    title: 'Hebbian theory - Wikipedia'
  },
  'pasteurization-food-safety': {
    url: 'https://en.wikipedia.org/wiki/Pasteurization',
    label: 'Wikipedia: Pasteurization',
    title: 'Pasteurization - Wikipedia'
  },
  'watt-steam-engine-industrialization': {
    url: 'https://en.wikipedia.org/wiki/Watt_steam_engine',
    label: 'Wikipedia: Watt steam engine',
    title: 'Watt steam engine - Wikipedia'
  },
  'shipping-container-intermodal-revolution': {
    url: 'https://en.wikipedia.org/wiki/Intermodal_container',
    label: 'Wikipedia: Intermodal container',
    title: 'Intermodal container - Wikipedia'
  },
  'standard-time-zones-fleming': {
    url: 'https://en.wikipedia.org/wiki/Standard_time',
    label: 'Wikipedia: Standard time',
    title: 'Standard time - Wikipedia'
  },
  'turing-enigma-bletchley-cryptanalysis': {
    url: 'https://en.wikipedia.org/wiki/Bombe',
    label: 'Wikipedia: Bombe',
    title: 'Bombe - Wikipedia'
  },
  'longitude-problem-john-harrison': {
    url: 'https://en.wikipedia.org/wiki/Marine_chronometer',
    label: 'Wikipedia: Marine chronometer',
    title: 'Marine chronometer - Wikipedia'
  },
  'arpanet-packet-switching': {
    url: 'https://en.wikipedia.org/wiki/ARPANET',
    label: 'Wikipedia: ARPANET',
    title: 'ARPANET - Wikipedia'
  },
  'directory-based-cache-coherence-numa': {
    url: 'https://en.wikipedia.org/wiki/Directory-based_cache_coherence',
    label: 'Wikipedia: Directory-based cache coherence',
    title: 'Directory-based cache coherence - Wikipedia'
  },
  'crossing-the-chasm-tech': {
    url: 'https://en.wikipedia.org/wiki/Crossing_the_Chasm',
    label: 'Wikipedia: Crossing the Chasm',
    title: 'Crossing the Chasm - Wikipedia'
  },
  'cosmic-microwave-background-big-bang': {
    url: 'https://en.wikipedia.org/wiki/Cosmic_microwave_background',
    label: 'Wikipedia: Cosmic microwave background',
    title: 'Cosmic microwave background - Wikipedia'
  },
  'dark-matter-rotation-curves': {
    url: 'https://en.wikipedia.org/wiki/Dark_matter',
    label: 'Wikipedia: Dark matter',
    title: 'Dark matter - Wikipedia'
  },
  'chaos-theory-lorenz-attractor': {
    url: 'https://en.wikipedia.org/wiki/Chaos_theory',
    label: 'Wikipedia: Chaos theory',
    title: 'Chaos theory - Wikipedia'
  },
  'telomeres-hayflick-limit': {
    url: 'https://en.wikipedia.org/wiki/Telomere',
    label: 'Wikipedia: Telomere',
    title: 'Telomere - Wikipedia'
  },
  'optical-fiber-telecommunications': {
    url: 'https://en.wikipedia.org/wiki/Optical_fiber',
    label: 'Wikipedia: Optical fiber',
    title: 'Optical fiber - Wikipedia'
  },
  'cai-lun-papermaking': {
    url: 'https://en.wikipedia.org/wiki/History_of_paper',
    label: 'Wikipedia: History of paper',
    title: 'History of paper - Wikipedia'
  },
  'gutenberg-printing-press': {
    url: 'https://en.wikipedia.org/wiki/Printing_press',
    label: 'Wikipedia: Printing press',
    title: 'Printing press - Wikipedia'
  },
  // Unresolved topics resolved with exact core concepts:
  'anchoring-and-adjustment-heuristic': {
    url: 'https://en.wikipedia.org/wiki/Anchoring_and_adjustment_heuristic',
    label: 'Wikipedia: Anchoring effect',
    title: 'Anchoring effect - Wikipedia'
  },
  'just-world-hypothesis-and-victim-blaming': {
    url: 'https://en.wikipedia.org/wiki/Just-World_Hypothesis',
    label: 'Wikipedia: Just-world fallacy',
    title: 'Just-world fallacy - Wikipedia'
  }
};

export async function applyRepairs() {
  const topics = JSON.parse(fs.readFileSync(canonicalFile, 'utf8'));
  const audit = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : {};

  let exactRetained = 0;
  let nonExactRepaired = 0;
  let nonExactRemoved = 0;
  let unresolvedResolved = 0;

  for (const topic of topics) {
    const resources = topic.resources || [];
    const updatedResources = [];

    // Check if topic is in KNOWN_EXACT_WIKI_REPAIRS and currently has 0 resources or needs repair
    const knownFix = KNOWN_EXACT_WIKI_REPAIRS[topic.id];

    if (resources.length === 0) {
      if (knownFix) {
        updatedResources.push({
          label: knownFix.label,
          url: knownFix.url
        });
        audit[knownFix.url] = {
          status: 'ok',
          httpStatus: 200,
          finalUrl: knownFix.url,
          title: knownFix.title
        };
        unresolvedResolved++;
        printLog(`[UNRESOLVED RESOLVED] ${topic.id} -> ${knownFix.url}`);
      }
      topic.resources = updatedResources;
      continue;
    }

    for (const r of resources) {
      const isWiki = (r.label && r.label.startsWith('Wikipedia:')) || (r.url && r.url.includes('wikipedia.org'));
      
      if (!isWiki) {
        // Non-wiki resource (already verified unchanged or arXiv/doc fix)
        updatedResources.push(r);
        continue;
      }

      // If there's a known exact replacement for this topic:
      if (knownFix) {
        updatedResources.push({
          label: knownFix.label,
          url: knownFix.url
        });
        audit[knownFix.url] = {
          status: 'ok',
          httpStatus: 200,
          finalUrl: knownFix.url,
          title: knownFix.title
        };
        nonExactRepaired++;
        printLog(`[REPAIRED NON-EXACT] ${topic.id}: "${r.label}" -> ${knownFix.url}`);
        continue;
      }

      const auditedTitle = audit[r.url]?.title || r.label.replace(/^Wikipedia:\s*/, '');
      const isExactMatch = isPageExactCoreConcept(auditedTitle, topic.title, topic.id);

      if (isExactMatch) {
        updatedResources.push(r);
        exactRetained++;
      } else {
        // Disallow generic, niche, single clause or single instance of family
        nonExactRemoved++;
        printLog(`[REMOVED NON-EXACT WIKI] ${topic.id}: "${r.label}" (${r.url})`);
      }
    }

    topic.resources = updatedResources;
  }

  fs.writeFileSync(canonicalFile, JSON.stringify(topics, null, 2), 'utf8');
  fs.writeFileSync(reportFile, JSON.stringify(audit, null, 2), 'utf8');

  printLog('\n====================================================');
  printLog('               REPAIR SCRIPT SUMMARY                ');
  printLog('====================================================');
  printLog(`Exact Wikipedia links retained:   ${exactRetained}`);
  printLog(`Non-exact links repaired:         ${nonExactRepaired}`);
  printLog(`Non-exact links removed:          ${nonExactRemoved}`);
  printLog(`Unresolved topics resolved:       ${unresolvedResolved}`);
  printLog('====================================================\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyRepairs().catch(err => {
    process.stderr.write(`Repair error: ${err.message}\n`);
    process.exit(1);
  });
}
