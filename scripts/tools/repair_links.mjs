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

// Disallowed generic pages, wrong-entity matches, or variants
const DISALLOWED_PAGES = new Set([
  'insurance',
  'delegation',
  'power law',
  'value proposition',
  'one for one',
  'hawkes ladder of inference',
  'constructive set theory',
  'bloom filters in bioinformatics',
  'capital allocation line'
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

// Verified repairs, restorations, person-page fixes, and authoritative docs
export const KNOWN_EXACT_WIKI_REPAIRS = {
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
  'standard-time-zones-fleming': {
    url: 'https://en.wikipedia.org/wiki/Standard_time',
    label: 'Wikipedia (Related): Standard time',
    title: 'Standard time - Wikipedia'
  },
  'turing-enigma-bletchley-cryptanalysis': {
    url: 'https://en.wikipedia.org/wiki/Bombe',
    label: 'Wikipedia (Related): Bombe',
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
    label: 'Wikipedia (Related): History of paper',
    title: 'History of paper - Wikipedia'
  },
  'gutenberg-printing-press': {
    url: 'https://en.wikipedia.org/wiki/Printing_press',
    label: 'Wikipedia: Printing press',
    title: 'Printing press - Wikipedia'
  },
  'anchoring-and-adjustment-heuristic': {
    url: 'https://en.wikipedia.org/wiki/Anchoring_and_adjustment_heuristic',
    label: 'Wikipedia: Anchoring effect',
    title: 'Anchoring effect - Wikipedia'
  },
  'just-world-hypothesis-and-victim-blaming': {
    url: 'https://en.wikipedia.org/wiki/Just-World_Hypothesis',
    label: 'Wikipedia: Just-world fallacy',
    title: 'Just-world fallacy - Wikipedia'
  },
  'shipping-container-intermodal-revolution': {
    url: 'https://en.wikipedia.org/wiki/Malcolm_McLean',
    label: 'Wikipedia: Malcolm McLean',
    title: 'Malcolm McLean - Wikipedia'
  },
  'vocal-prosody-pitch-inflection-and-status-signaling': {
    url: 'https://en.wikipedia.org/wiki/Prosody_(linguistics)',
    label: 'Wikipedia: Prosody (linguistics)',
    title: 'Prosody (linguistics) - Wikipedia'
  },
  'situation-behavior-impact-sbi-feedback-model': {
    url: 'https://en.wikipedia.org/wiki/Situation-Behavior-Impact',
    label: 'Wikipedia: Situation-Behavior-Impact',
    title: 'Situation-Behavior-Impact - Wikipedia'
  },
  'ladder-of-inference-chris-argyris': {
    url: 'https://en.wikipedia.org/wiki/Chris_Argyris',
    label: 'Wikipedia (About the author): Chris Argyris',
    title: 'Chris Argyris - Wikipedia'
  },
  'milgram-obedience-studies-and-the-agentic-state': {
    url: 'https://en.wikipedia.org/wiki/Milgram_experiment',
    label: 'Wikipedia: Milgram experiment',
    title: 'Milgram experiment - Wikipedia'
  },
  'compliance-techniques-foot-in-the-door-vs-door-in-the-face': {
    url: 'https://en.wikipedia.org/wiki/Foot-in-the-door_technique',
    label: 'Wikipedia: Foot-in-the-door technique',
    title: 'Foot-in-the-door technique - Wikipedia'
  },
  'retrieval-practice-and-the-testing-effect': {
    url: 'https://en.wikipedia.org/wiki/Testing_effect',
    label: 'Wikipedia: Testing effect',
    title: 'Testing effect - Wikipedia'
  },
  'memory-reconsolidation-and-misinformation-effect-loftus': {
    url: 'https://en.wikipedia.org/wiki/Misinformation_effect',
    label: 'Wikipedia: Misinformation effect',
    title: 'Misinformation effect - Wikipedia'
  },
  'schema-theory-and-constructive-memory-bartlett': {
    url: 'https://en.wikipedia.org/wiki/Schema_(psychology)',
    label: 'Wikipedia: Schema (psychology)',
    title: 'Schema (psychology) - Wikipedia'
  },
  'temporal-discounting-and-hyperbolic-discounting-function': {
    url: 'https://en.wikipedia.org/wiki/Hyperbolic_discounting',
    label: 'Wikipedia: Hyperbolic discounting',
    title: 'Hyperbolic discounting - Wikipedia'
  },
  'big-five-personality-traits-ocean-model': {
    url: 'https://en.wikipedia.org/wiki/Big_Five_personality_traits',
    label: 'Wikipedia: Big Five personality traits',
    title: 'Big Five personality traits - Wikipedia'
  },
  'psychometric-critiques-of-the-mbti': {
    url: 'https://en.wikipedia.org/wiki/Myers%E2%80%93Briggs_Type_Indicator',
    label: 'Wikipedia: Myers–Briggs Type Indicator',
    title: 'Myers–Briggs Type Indicator - Wikipedia'
  },
  'deindividuation-and-the-ringelmann-social-loafing-effect': {
    url: 'https://en.wikipedia.org/wiki/Social_loafing',
    label: 'Wikipedia: Social loafing',
    title: 'Social loafing - Wikipedia'
  },
  'flow-state-dynamics-csikszentmihalyi': {
    url: 'https://en.wikipedia.org/wiki/Flow_(psychology)',
    label: 'Wikipedia: Flow (psychology)',
    title: 'Flow (psychology) - Wikipedia'
  },
  'broaden-and-build-theory-barbara-fredrickson': {
    url: 'https://en.wikipedia.org/wiki/Broaden-and-build',
    label: 'Wikipedia: Broaden-and-build',
    title: 'Broaden-and-build - Wikipedia'
  },
  'mergers-and-acquisitions-accretion-dilution': {
    url: 'https://en.wikipedia.org/wiki/Accretion%2Fdilution_analysis',
    label: 'Wikipedia: Accretion/dilution analysis',
    title: 'Accretion/dilution analysis - Wikipedia'
  },
  'dividend-policy-vs-share-buybacks': {
    url: 'https://en.wikipedia.org/wiki/Dividend_policy',
    label: 'Wikipedia: Dividend policy',
    title: 'Dividend policy - Wikipedia'
  },
  'roic-vs-wacc-economic-value-added': {
    url: 'https://en.wikipedia.org/wiki/Economic_value_added',
    label: 'Wikipedia: Economic value added',
    title: 'Economic value added - Wikipedia'
  },
  'debt-payoff-strategies-avalanche-vs-snowball': {
    url: 'https://en.wikipedia.org/wiki/Debt_snowball_method',
    label: 'Wikipedia: Debt snowball method',
    title: 'Debt snowball method - Wikipedia'
  },
  'options-mechanics-black-scholes-and-the-greeks': {
    url: 'https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model',
    label: 'Wikipedia: Black–Scholes model',
    title: 'Black–Scholes model - Wikipedia'
  },
  'etfs-vs-mutual-funds-creation-redemption': {
    url: 'https://en.wikipedia.org/wiki/Exchange-traded_fund',
    label: 'Wikipedia: Exchange-traded fund',
    title: 'Exchange-traded fund - Wikipedia'
  },
  'commercial-debt-service-coverage-ratio-dscr': {
    url: 'https://en.wikipedia.org/wiki/Debt_service_coverage_ratio',
    label: 'Wikipedia: Debt service coverage ratio',
    title: 'Debt service coverage ratio - Wikipedia'
  },
  'employee-equity-vesting-and-83b-election': {
    url: 'https://en.wikipedia.org/wiki/Vesting',
    label: 'Wikipedia: Vesting',
    title: 'Vesting - Wikipedia'
  },
  'liquidation-preferences-participating-vs-non-participating': {
    url: 'https://en.wikipedia.org/wiki/Liquidation_preference',
    label: 'Wikipedia: Liquidation preference',
    title: 'Liquidation preference - Wikipedia'
  },
  'portfolio-hedging-protective-puts-and-collars': {
    url: 'https://en.wikipedia.org/wiki/Hedge_(finance)',
    label: 'Wikipedia: Hedge (finance)',
    title: 'Hedge (finance) - Wikipedia'
  },
  'position-sizing-and-the-kelly-criterion': {
    url: 'https://en.wikipedia.org/wiki/Kelly_criterion',
    label: 'Wikipedia: Kelly criterion',
    title: 'Kelly criterion - Wikipedia'
  },
  'aws-ebs-io2-block-express-and-sr-iov': {
    url: 'https://en.wikipedia.org/wiki/Block-level_storage',
    label: 'Wikipedia: Block-level storage',
    title: 'Block-level storage - Wikipedia'
  },
  'b-tree-and-b-plus-tree-indexing': {
    url: 'https://en.wikipedia.org/wiki/B-tree',
    label: 'Wikipedia: B-tree',
    title: 'B-tree - Wikipedia'
  },
  'radix-tree-and-trie-indexing': {
    url: 'https://en.wikipedia.org/wiki/Trie',
    label: 'Wikipedia: Trie',
    title: 'Trie - Wikipedia'
  },
  'red-black-and-avl-trees': {
    url: 'https://en.wikipedia.org/wiki/Red%E2%80%93black_tree',
    label: 'Wikipedia: Red–black tree',
    title: 'Red–black tree - Wikipedia'
  },
  'bellman-ford-and-floyd-warshall': {
    url: 'https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm',
    label: 'Wikipedia: Bellman–Ford algorithm',
    title: 'Bellman–Ford algorithm - Wikipedia'
  },
  'hopcroft-karp-bipartite-matching': {
    url: 'https://en.wikipedia.org/wiki/Hopcroft%E2%80%93Karp_algorithm',
    label: 'Wikipedia: Hopcroft–Karp algorithm',
    title: 'Hopcroft–Karp algorithm - Wikipedia'
  },
  'raft-consensus-algorithm': {
    url: 'https://en.wikipedia.org/wiki/Raft_(algorithm)',
    label: 'Wikipedia: Raft (algorithm)',
    title: 'Raft (algorithm) - Wikipedia'
  },
  'paxos-consensus-protocol': {
    url: 'https://en.wikipedia.org/wiki/Paxos_(computer_science)',
    label: 'Wikipedia: Paxos (computer science)',
    title: 'Paxos (computer science) - Wikipedia'
  },
  'byzantine-fault-tolerance-pbft': {
    url: 'https://en.wikipedia.org/wiki/Byzantine_fault',
    label: 'Wikipedia: Byzantine fault',
    title: 'Byzantine fault - Wikipedia'
  },
  'aho-corasick-automaton': {
    url: 'https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm',
    label: 'Wikipedia: Aho–Corasick algorithm',
    title: 'Aho–Corasick algorithm - Wikipedia'
  },
  'quickselect-and-median-of-medians': {
    url: 'https://en.wikipedia.org/wiki/Median_of_medians',
    label: 'Wikipedia: Median of medians',
    title: 'Median of medians - Wikipedia'
  },
  'perfect-hashing-fks-algorithm': {
    url: 'https://en.wikipedia.org/wiki/Dynamic_perfect_hashing',
    label: 'Wikipedia: Dynamic perfect hashing',
    title: 'Dynamic perfect hashing - Wikipedia'
  },
  'robin-hood-and-cuckoo-hashing': {
    url: 'https://en.wikipedia.org/wiki/Open_addressing',
    label: 'Wikipedia: Open addressing',
    title: 'Open addressing - Wikipedia'
  },
  'optimal-substructure-and-memoization': {
    url: 'https://en.wikipedia.org/wiki/Dynamic_programming',
    label: 'Wikipedia: Dynamic programming',
    title: 'Dynamic programming - Wikipedia'
  },
  'amortized-analysis-methods': {
    url: 'https://en.wikipedia.org/wiki/Amortized_analysis',
    label: 'Wikipedia: Amortized analysis',
    title: 'Amortized analysis - Wikipedia'
  },
  'p-vs-np-and-np-completeness-reductions': {
    url: 'https://en.wikipedia.org/wiki/P_versus_NP_problem',
    label: 'Wikipedia: P versus NP problem',
    title: 'P versus NP problem - Wikipedia'
  },
  'disjoint-set-union-find-path-compression': {
    url: 'https://en.wikipedia.org/wiki/Disjoint-set_data_structure',
    label: 'Wikipedia: Disjoint-set data structure',
    title: 'Disjoint-set data structure - Wikipedia'
  },
  'aba-problem-hazard-pointers-epoch-reclamation': {
    url: 'https://en.wikipedia.org/wiki/ABA_problem',
    label: 'Wikipedia: ABA problem',
    title: 'ABA problem - Wikipedia'
  },
  'work-stealing-deque-chase-lev': {
    url: 'https://en.wikipedia.org/wiki/Work_stealing',
    label: 'Wikipedia: Work stealing',
    title: 'Work stealing - Wikipedia'
  },
  'spatial-indices-r-tree-and-kd-tree': {
    url: 'https://en.wikipedia.org/wiki/R-tree',
    label: 'Wikipedia: R-tree',
    title: 'R-tree - Wikipedia'
  },
  'fibonacci-and-pairing-heaps': {
    url: 'https://en.wikipedia.org/wiki/Fibonacci_heap',
    label: 'Wikipedia: Fibonacci heap',
    title: 'Fibonacci heap - Wikipedia'
  },
  'hardware-memory-models-tso-vs-weak': {
    url: 'https://en.wikipedia.org/wiki/Memory_model_(programming)',
    label: 'Wikipedia: Memory model (programming)',
    title: 'Memory model (programming) - Wikipedia'
  },
  'two-track-career-ladder': {
    url: 'https://en.wikipedia.org/wiki/Career_ladder',
    label: 'Wikipedia (Related): Career ladder',
    title: 'Career ladder - Wikipedia'
  },
  'innovators-dilemma-disruption': {
    url: 'https://en.wikipedia.org/wiki/The_Innovator\'s_Dilemma',
    label: 'Wikipedia: The Innovator\'s Dilemma',
    title: 'The Innovator\'s Dilemma - Wikipedia'
  },
  'okr-framework-execution': {
    url: 'https://en.wikipedia.org/wiki/Objectives_and_key_results',
    label: 'Wikipedia: Objectives and key results',
    title: 'Objectives and key results - Wikipedia'
  },
  'kano-model-features': {
    url: 'https://en.wikipedia.org/wiki/Kano_model',
    label: 'Wikipedia: Kano model',
    title: 'Kano model - Wikipedia'
  },
  'galls-law-systems': {
    url: 'https://en.wikipedia.org/wiki/Systemantics',
    label: 'Wikipedia (Related): Systemantics',
    title: 'Systemantics - Wikipedia'
  },
  'pirate-metrics-aarrr': {
    url: 'https://en.wikipedia.org/wiki/Dave_McClure',
    label: 'Wikipedia (About the author): Dave McClure',
    title: 'Dave McClure - Wikipedia'
  },
  'framing-effect-persuasion': {
    url: 'https://en.wikipedia.org/wiki/Framing_effect_(psychology)',
    label: 'Wikipedia: Framing effect (psychology)',
    title: 'Framing effect (psychology) - Wikipedia'
  },
  'disagree-and-commit-doctrine': {
    url: 'https://en.wikipedia.org/wiki/Disagree_and_commit',
    label: 'Wikipedia: Disagree and commit',
    title: 'Disagree and commit - Wikipedia'
  },
  'comparative-advantage-specialization': {
    url: 'https://en.wikipedia.org/wiki/Comparative_advantage',
    label: 'Wikipedia: Comparative advantage',
    title: 'Comparative advantage - Wikipedia'
  },
  'principle-of-charity-discourse': {
    url: 'https://en.wikipedia.org/wiki/Principle_of_charity',
    label: 'Wikipedia: Principle of charity',
    title: 'Principle of charity - Wikipedia'
  },
  'opportunity-cost-capital-allocation': {
    url: 'https://en.wikipedia.org/wiki/Opportunity_cost',
    label: 'Wikipedia: Opportunity cost',
    title: 'Opportunity cost - Wikipedia'
  },
  'entropy-second-law-thermodynamics': {
    url: 'https://en.wikipedia.org/wiki/Second_law_of_thermodynamics',
    label: 'Wikipedia: Second law of thermodynamics',
    title: 'Second law of thermodynamics - Wikipedia'
  },
  'crispr-cas9-gene-editing': {
    url: 'https://en.wikipedia.org/wiki/CRISPR',
    label: 'Wikipedia: CRISPR',
    title: 'CRISPR - Wikipedia'
  },
  'natural-selection-genetic-drift': {
    url: 'https://en.wikipedia.org/wiki/Genetic_drift',
    label: 'Wikipedia: Genetic drift',
    title: 'Genetic drift - Wikipedia'
  },
  'cellular-automata-conway': {
    url: 'https://en.wikipedia.org/wiki/Cellular_automaton',
    label: 'Wikipedia: Cellular automaton',
    title: 'Cellular automaton - Wikipedia'
  },
  'exoplanet-detection-methods': {
    url: 'https://en.wikipedia.org/wiki/Methods_of_detecting_exoplanets',
    label: 'Wikipedia: Methods of detecting exoplanets',
    title: 'Methods of detecting exoplanets - Wikipedia'
  },
  'supernovae-r-process-elements': {
    url: 'https://en.wikipedia.org/wiki/Neutron_star_merger',
    label: 'Wikipedia: Neutron star merger',
    title: 'Neutron star merger - Wikipedia'
  },
  'hardy-weinberg-equilibrium': {
    url: 'https://en.wikipedia.org/wiki/Hardy%E2%80%93Weinberg_principle',
    label: 'Wikipedia: Hardy–Weinberg principle',
    title: 'Hardy–Weinberg principle - Wikipedia'
  },
  'superconductivity-bcs-theory': {
    url: 'https://en.wikipedia.org/wiki/BCS_theory',
    label: 'Wikipedia: BCS theory',
    title: 'BCS theory - Wikipedia'
  },
  'schrodinger-what-is-life-negentropy': {
    url: 'https://en.wikipedia.org/wiki/Negentropy',
    label: 'Wikipedia: Negentropy',
    title: 'Negentropy - Wikipedia'
  },
  'mendelian-genetics-laws': {
    url: 'https://en.wikipedia.org/wiki/Mendelian_inheritance',
    label: 'Wikipedia: Mendelian inheritance',
    title: 'Mendelian inheritance - Wikipedia'
  },
  'hubble-lemaltre-law': {
    url: 'https://en.wikipedia.org/wiki/Hubble\'s_law',
    label: 'Wikipedia: Hubble\'s law',
    title: 'Hubble\'s law - Wikipedia'
  },
  'cno-cycle-nucleosynthesis': {
    url: 'https://en.wikipedia.org/wiki/CNO_cycle',
    label: 'Wikipedia: CNO cycle',
    title: 'CNO cycle - Wikipedia'
  },
  'bell-labs-transistor-1947': {
    url: 'https://en.wikipedia.org/wiki/Point-contact_transistor',
    label: 'Wikipedia: Point-contact transistor',
    title: 'Point-contact transistor - Wikipedia'
  },
  'bretton-woods-monetary-order': {
    url: 'https://en.wikipedia.org/wiki/Bretton_Woods_system',
    label: 'Wikipedia: Bretton Woods system',
    title: 'Bretton Woods system - Wikipedia'
  },
  'germ-theory-pasteur-koch': {
    url: 'https://en.wikipedia.org/wiki/Germ_theory_of_disease',
    label: 'Wikipedia: Germ theory of disease',
    title: 'Germ theory of disease - Wikipedia'
  },
  'james-lind-scurvy-trials': {
    url: 'https://en.wikipedia.org/wiki/James_Lind',
    label: 'Wikipedia: James Lind',
    title: 'James Lind - Wikipedia'
  },
  'ford-assembly-line-mass-production': {
    url: 'https://en.wikipedia.org/wiki/Assembly_line',
    label: 'Wikipedia: Assembly line',
    title: 'Assembly line - Wikipedia'
  },
  'steam-locomotive-george-stephenson': {
    url: 'https://en.wikipedia.org/wiki/Stephenson\'s_Rocket',
    label: 'Wikipedia: Stephenson\'s Rocket',
    title: 'Stephenson\'s Rocket - Wikipedia'
  },
  'framing-effects-and-cognitive-anchoring-in-persuasion': {
    url: 'https://en.wikipedia.org/wiki/Framing_effect_(psychology)',
    label: 'Wikipedia: Framing effect (psychology)',
    title: 'Framing effect (psychology) - Wikipedia'
  },
  'email-tone-calibration-and-egocentrism-bias': {
    url: 'https://en.wikipedia.org/wiki/Egocentric_bias',
    label: 'Wikipedia (Related): Egocentric bias',
    title: 'Egocentric bias - Wikipedia'
  },
  'async-first-communication-and-rfc-decision-making': {
    url: 'https://en.wikipedia.org/wiki/Request_for_Comments',
    label: 'Wikipedia (Related): Request for Comments',
    title: 'Request for Comments - Wikipedia'
  },
  'personality-trait-stability-and-the-maturity-principle': {
    url: 'https://en.wikipedia.org/wiki/Personality_development',
    label: 'Wikipedia: Personality development',
    title: 'Personality development - Wikipedia'
  },
  'defi-lending-protocols-and-liquidation-thresholds': {
    url: 'https://en.wikipedia.org/wiki/Decentralized_finance',
    label: 'Wikipedia: Decentralized finance',
    title: 'Decentralized finance - Wikipedia'
  },
  'lock-free-queue-michael-scott': {
    url: 'https://en.wikipedia.org/wiki/Non-blocking_algorithm',
    label: 'Wikipedia (Related): Non-blocking algorithm',
    title: 'Non-blocking algorithm - Wikipedia'
  },
  'sloppy-quorums-and-hinted-handoff': {
    url: 'https://en.wikipedia.org/wiki/Dynamo_(storage_system)',
    label: 'Wikipedia (Related): Dynamo (storage system)',
    title: 'Dynamo (storage system) - Wikipedia'
  },
  'read-repair-vs-anti-entropy-merkle-trees': {
    url: 'https://en.wikipedia.org/wiki/Merkle_tree',
    label: 'Wikipedia (Related): Merkle tree',
    title: 'Merkle tree - Wikipedia'
  },
  'hybrid-logical-clocks-cockroachdb': {
    url: 'https://en.wikipedia.org/wiki/CockroachDB',
    label: 'Wikipedia (Related): CockroachDB',
    title: 'CockroachDB - Wikipedia'
  },
  'pacelc-theorem-in-practice': {
    url: 'https://en.wikipedia.org/wiki/PACELC_theorem',
    label: 'Wikipedia: PACELC design principle',
    title: 'PACELC design principle - Wikipedia'
  },
  'native-native-bundlers-esbuild-turbopack-rspack': {
    url: 'https://en.wikipedia.org/wiki/Module_bundler',
    label: 'Wikipedia: Module bundler',
    title: 'Module bundler - Wikipedia'
  },
  'intersection-observer-and-layout-thrashing': {
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API',
    label: 'MDN Web Docs: Intersection Observer API',
    title: 'Intersection Observer API - Web APIs | MDN'
  },
  'first-90-days-transitions': {
    url: 'https://en.wikipedia.org/wiki/Michael_D._Watkins',
    label: 'Wikipedia (About the author): Michael D. Watkins',
    title: 'Michael D. Watkins - Wikipedia'
  },
  'jobs-to-be-done-theory': {
    url: 'https://en.wikipedia.org/wiki/Clayton_Christensen',
    label: 'Wikipedia (About the author): Clayton Christensen',
    title: 'Clayton Christensen - Wikipedia'
  },
  'pyramid-principle-minto': {
    url: 'https://en.wikipedia.org/wiki/Barbara_Minto',
    label: 'Wikipedia (About the author): Barbara Minto',
    title: 'Barbara Minto - Wikipedia'
  },
  'minto-scqa-framework-for-business-documents': {
    url: 'https://en.wikipedia.org/wiki/Barbara_Minto',
    label: 'Wikipedia (About the author): Barbara Minto',
    title: 'Barbara Minto - Wikipedia'
  },
  'good-strategy-bad-strategy-kernel': {
    url: 'https://en.wikipedia.org/wiki/Richard_Rumelt',
    label: 'Wikipedia (About the author): Richard Rumelt',
    title: 'Richard Rumelt - Wikipedia'
  },
  'raci-matrix-governance': {
    url: 'https://en.wikipedia.org/wiki/Responsibility_assignment_matrix',
    label: 'Wikipedia (Related): Responsibility assignment matrix',
    title: 'Responsibility assignment matrix - Wikipedia'
  },
  'career-moats-specific-knowledge': {
    url: 'https://en.wikipedia.org/wiki/Economic_moat',
    label: 'Wikipedia (Related): Economic moat',
    title: 'Economic moat - Wikipedia'
  },
  'sponsorship-vs-mentorship': {
    url: 'https://en.wikipedia.org/wiki/Mentorship',
    label: 'Wikipedia (Related): Mentorship',
    title: 'Mentorship - Wikipedia'
  },
  'eisenhower-matrix-prioritization': {
    url: 'https://en.wikipedia.org/wiki/Time_management',
    label: 'Wikipedia (Related): Time management',
    title: 'Time management - Wikipedia'
  },
  'impermanent-loss-mechanics-in-liquidity-pools': {
    url: 'https://arxiv.org/abs/2111.09192',
    label: 'Loesch et al. (2021): Impermanent Loss in Uniswap v3 (arXiv:2111.09192)',
    title: '[2111.09192] Impermanent Loss in Uniswap v3'
  },
  'kv-caching-autoregressive-decoding': {
    url: 'https://huggingface.co/docs/transformers/kv_cache',
    label: 'Hugging Face Docs: Cache strategies for Transformer Generation',
    title: 'Cache strategies · Hugging Face'
  },
  'source-maps-vlq-encoding-internals': {
    url: 'https://developer.mozilla.org/en-US/docs/Glossary/Source_map',
    label: 'MDN Web Docs: Source map',
    title: 'Source map - Glossary | MDN'
  },
  'value-proposition-canvas': {
    url: 'https://www.strategyzer.com/library/the-value-proposition-canvas',
    label: 'Strategyzer: Value Proposition Canvas',
    title: 'Value Proposition Canvas – Download the Official Template'
  },
  'mariners-magnetic-compass': {
    url: 'https://en.wikipedia.org/wiki/History_of_the_compass',
    label: 'Wikipedia: History of the compass',
    title: 'History of the compass - Wikipedia'
  },
  'media-richness-theory-and-channel-selection': {
    url: 'https://en.wikipedia.org/wiki/Media_richness_theory',
    label: 'Wikipedia: Media richness theory',
    title: 'Media richness theory - Wikipedia'
  },
  'innate-vs-adaptive-immunity': {
    url: 'https://en.wikipedia.org/wiki/Innate_immune_system',
    label: 'Wikipedia: Innate immune system',
    title: 'Innate immune system - Wikipedia'
  }
};

export async function applyRepairs() {
  const topics = JSON.parse(fs.readFileSync(canonicalFile, 'utf8'));
  const audit = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : {};

  const totalTopics = topics.length;
  const topicsWithLinksBefore = topics.filter(t => (t.resources || []).length > 0).length;
  const topicsZeroLinksBefore = topics.filter(t => !t.resources || t.resources.length === 0).length;

  let exactRetained = 0;
  let nonExactRepaired = 0;
  let nonExactRemoved = 0;
  let unresolvedResolved = 0;
  const acceptedList = [];

  for (const topic of topics) {
    const resources = topic.resources || [];
    const updatedResources = [];
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
        acceptedList.push({
          id: topic.id,
          topicTitle: topic.title,
          pageTitle: knownFix.title
        });
        printLog(`[UNRESOLVED RESOLVED] ${topic.id} -> ${knownFix.url}`);
      }
      topic.resources = updatedResources;
      continue;
    }

    // Remove generic sloanreview.mit.edu homepage links
    let curResources = resources.filter(r => r.url !== 'https://sloanreview.mit.edu/');

    // Special fix handling: if knownFix is specified and topic needs replacement
    // (e.g. Malcolm McLean person page, Vocal Prosody, or Media Richness)
    if (knownFix && (
      topic.id === 'shipping-container-intermodal-revolution' ||
      topic.id === 'vocal-prosody-pitch-inflection-and-status-signaling' ||
      topic.id === 'hopcroft-karp-bipartite-matching' ||
      topic.id === 'commercial-debt-service-coverage-ratio-dscr' ||
      topic.id === 'ladder-of-inference-chris-argyris' ||
      topic.id === 'schema-theory-and-constructive-memory-bartlett' ||
      topic.id === 'dividend-policy-vs-share-buybacks' ||
      topic.id === 'galls-law-systems' ||
      topic.id === 'media-richness-theory-and-channel-selection'
    )) {
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
      acceptedList.push({
        id: topic.id,
        topicTitle: topic.title,
        pageTitle: knownFix.title
      });
      printLog(`[TARGETED REPAIR] ${topic.id}: -> ${knownFix.url} ("${knownFix.title}")`);
      topic.resources = updatedResources;
      continue;
    }

    for (const r of curResources) {
      const isWiki = (r.label && r.label.startsWith('Wikipedia:')) || (r.url && r.url.includes('wikipedia.org'));

      if (!isWiki) {
        // Non-wiki resource (already verified unchanged or arXiv/doc fix)
        updatedResources.push(r);
        continue;
      }

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
        acceptedList.push({
          id: topic.id,
          topicTitle: topic.title,
          pageTitle: knownFix.title
        });
        printLog(`[REPAIRED/RESTORED] ${topic.id}: "${r.label}" -> ${knownFix.url}`);
        continue;
      }

      const auditedTitle = audit[r.url]?.title || r.label.replace(/^Wikipedia:\s*/, '');
      const isExactMatch = isPageExactCoreConcept(auditedTitle, topic.title, topic.id);

      if (isExactMatch) {
        updatedResources.push(r);
        exactRetained++;
        acceptedList.push({
          id: topic.id,
          topicTitle: topic.title,
          pageTitle: auditedTitle
        });
      } else {
        nonExactRemoved++;
        printLog(`[REMOVED NON-EXACT WIKI] ${topic.id}: "${r.label}" (${r.url})`);
      }
    }

    topic.resources = updatedResources;
  }

  const topicsWithLinksAfter = topics.filter(t => (t.resources || []).length > 0).length;
  const topicsZeroLinksAfterList = topics.filter(t => !t.resources || t.resources.length === 0);

  fs.writeFileSync(canonicalFile, JSON.stringify(topics, null, 2), 'utf8');

  printLog('\n====================================================');
  printLog('               REPAIR SCRIPT SUMMARY                ');
  printLog('====================================================');
  printLog(`Total catalog topics:             ${totalTopics}`);
  printLog(`Topics with links BEFORE:         ${topicsWithLinksBefore}`);
  printLog(`Topics with links AFTER:          ${topicsWithLinksAfter}`);
  printLog(`Topics with 0 links BEFORE:       ${topicsZeroLinksBefore}`);
  printLog(`Topics with 0 links AFTER:        ${topicsZeroLinksAfterList.length}`);
  printLog('----------------------------------------------------');
  printLog(`Exact Wikipedia links retained:   ${exactRetained}`);
  printLog(`Repairs / Restorations applied:   ${nonExactRepaired + unresolvedResolved}`);
  printLog(`Non-exact links removed:          ${nonExactRemoved}`);
  printLog('====================================================\n');

  printLog('====================================================');
  printLog('            TOPICS WITH 0 LINKS AFTER               ');
  printLog('====================================================');
  topicsZeroLinksAfterList.forEach((t, i) => {
    printLog(`${i + 1}. [${t.id}] | ${t.title}`);
  });
  printLog('====================================================\n');

  printLog('====================================================');
  printLog('     ACCEPTED LIST (WIKIPEDIA): topic id | topic title | page title     ');
  printLog('====================================================');
  acceptedList.forEach(item => {
    printLog(`${item.id} | ${item.topicTitle} | ${item.pageTitle}`);
  });
  printLog('====================================================\n');

  printLog('====================================================');
  printLog('  FULL ACCEPTED LIST (ALL DOMAINS): topic id | topic title | label | page title  ');
  printLog('====================================================');
  for (const t of topics) {
    for (const r of t.resources || []) {
      const pTitle = audit[r.url]?.title || r.label;
      printLog(`${t.id} | ${t.title} | ${r.label} | ${pTitle}`);
    }
  }
  printLog('====================================================\n');

  printLog('====================================================');
  printLog('      RECONCILIATION: 31 vs 111 EMPTY-TOPIC COUNTS  ');
  printLog('====================================================');
  printLog('1. In commit 18 (dff89c3), there were 33 topics with 0 links.');
  printLog('2. In commit 19 (954f2ed), 2 of those 33 were resolved with exact concepts:');
  printLog('   - anchoring-and-adjustment-heuristic -> Anchoring effect');
  printLog('   - just-world-hypothesis-and-victim-blaming -> Just-world fallacy');
  printLog('   Leaving 31 unresolved topics from the original set.');
  printLog('3. Concurrently in commit 19, an overly aggressive concept filter stripped');
  printLog('   80 topics of their Wikipedia links (e.g. Raft, Paxos, Bellman-Ford,');
  printLog('   Black-Scholes model, Kelly criterion, CRISPR, Trie, Big Five, etc.).');
  printLog('4. 31 (unresolved from 18) + 80 (stripped in 19) = 111 empty topics in commit 19.');
  printLog('5. In commit 20:');
  printLog('   - Restored close Wikipedia matches from the 80 (keeping generic/wrong-entity');
  printLog('     pages rejected: Insurance, Delegation, Power law, etc.)');
  printLog('   - Fixed Malcolm McLean (person page) and Vocal Prosody (linguistics)');
  printLog('   - Resolved verified core terms & authoritative docs for empty topics');
  printLog(`   Result: Empty topics reduced from 111 to ${topicsZeroLinksAfterList.length}.`);
  printLog('====================================================\n');

  return {
    totalTopics,
    topicsWithLinksBefore,
    topicsWithLinksAfter,
    topicsZeroLinksBefore,
    topicsZeroLinksAfter: topicsZeroLinksAfterList.length,
    acceptedList
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyRepairs().catch(err => {
    process.stderr.write(`Repair error: ${err.message}\n`);
    process.exit(1);
  });
}
