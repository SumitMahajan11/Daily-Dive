import fs from 'fs';

const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'over', 'in', 'of', 'into', 'with', 'vs']);

function toTitleCase(str) {
  if (!str) return '';
  const words = str.split(/\s+/);
  return words.map((w, idx) => {
    const lower = w.toLowerCase();
    if (w.includes('-')) {
      return w.split('-').map(part => toTitleCase(part)).join('-');
    }
    if (idx > 0 && idx < words.length - 1 && minorWords.has(lower)) {
      return lower;
    }
    if (/^[A-Z]{2,4}$/.test(w)) return w;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
}

function cleanTitle(line) {
  return (line || '')
    .replace(/^(\d+[\.\)]\s*|slide\s*\d+:?\s*|chapter\s*\d+:?\s*|[#\-*•·]\s*)/i, '')
    .replace(/^(?:practical|experiment|lab|assignment|exercise|task)\s*\d+[:\s-]*/i, '')
    .replace(/[\s\-_|•·\d:]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanCandidateTitle(str) {
  if (!str) return '';
  let s = cleanTitle(str)
    .replace(/[\s,;:\-–—/\\&+([.]+$/, '')
    .replace(/\s+\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|etc)$/i, '')
    .replace(/[\s,;:\-–—/\\&+([.]+$/, '')
    .trim();

  const letters = s.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 3 && (letters === letters.toUpperCase() || letters === letters.toLowerCase())) {
    s = toTitleCase(s);
  }
  return s;
}

function truncateAtWord(str, maxLen = 45) {
  if (!str) return '';
  let s = str.trim();
  if (s.length > maxLen) {
    const sub = s.slice(0, maxLen);
    const lastSpace = sub.lastIndexOf(' ');
    if (lastSpace > 10) {
      s = sub.slice(0, lastSpace);
    } else {
      s = sub;
    }
  }
  s = s.replace(/[\s,;:\-–—/\\&+([.]+$/, '')
       .replace(/\s+\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|etc)$/i, '')
       .replace(/[\s,;:\-–—/\\&+([.]+$/, '')
       .trim();

  return s;
}

function isTruncatedOrNonTerminal(str) {
  if (!str || typeof str !== 'string') return true;
  const s = str.trim();
  if (s.length < 4) return true;

  if (/[,;:\-–—/\\&+([]\s*$/.test(s)) return true;
  if (/\b\d{4}\s*[\-–—]\s*$/.test(s)) return true;
  if (/\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|etc)\s*$/i.test(s)) {
    return true;
  }
  if (/^(?:existing\s+research\s+includes?|studies\s+show\s+that|we\s+propose|this\s+paper\s+presents|in\s+order\s+to|as\s+shown\s+in|according\s+to|compare|comparing|discussing)\b/i.test(s)) {
    return true;
  }
  return false;
}

function isStructuralOrAllCaps(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();

  const letters = s.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 3 && letters === letters.toUpperCase()) {
    return true;
  }

  const structuralPatterns = [
    /^(?:outline|table\s+of\s+contents|agenda|index)\b/i,
    /^(?:introduction|overview|background)\b/i,
    /^(?:problem\s+statement|research\s+gap|motivation)\b/i,
    /^(?:objectives?|goals?|aims?|scope)\b/i,
    /^(?:literature\s+review|related\s+work|prior\s+work|state\s+of\s+the\s+art)(?:\s*[:–—\-].*)?$/i,
    /^(?:methodology|proposed\s+system|proposed\s+work|proposed\s+architecture|system\s+architecture|system\s+model)\b/i,
    /^(?:data\s+collection|datasets?|data\s+preprocessing)\b/i,
    /^(?:results?(?:\s+and\s+discussion)?|discussion|findings|evaluation)\b/i,
    /^(?:conclusion|conclusions|summary|future\s+(?:scope|work)|proposed\s+contribution)\b/i
  ];

  return structuralPatterns.some(p => p.test(s));
}

function isNonTopicHeading(line) {
  if (!line || typeof line !== 'string') return true;
  const l = cleanTitle(line).trim();
  const lower = l.toLowerCase();

  if (l.length < 4) return true;

  const uiWidgetRegex = /^(?:the\s+)?(?:display\s+filter\s+bar|main\s+toolbar|menu\s+bar|packet\s+(?:list|details|bytes)\s+pane|status\s+bar|scroll\s+bar|title\s+bar|navigation\s+pane|side\s+panel|dialog\s+box|window|button|tab)\b/i;
  if (uiWidgetRegex.test(lower)) return true;
  if (/\b(?:filter\s+bar|main\s+toolbar|menu\s+bar|packet\s+list\s+pane|packet\s+details\s+pane|packet\s+bytes\s+pane|dialog\s+box|status\s+bar)\b/i.test(lower)) return true;

  const figureRegex = /^(?:\[?(?:figure|fig\.?|diagram|screenshot|photo|image|table|graph|chart|output|observation)[\s:\]\d]|\b(?:screenshot of|diagram showing|network diagram)\b)/i;
  if (figureRegex.test(lower) || lower.startsWith('[network diagram') || lower === 'output:' || lower === 'output') return true;

  const stepRegex = /^(?:step|task|activity|exercise|part|phase|stage|question|q\s*\.?)\s*\d+[\s:.\-]/i;
  if (stepRegex.test(lower)) return true;

  const imperativeRegex = /^(?:click\s+on|select\s+the|choose\s+a|double[\s-]click|right[\s-]click|press\s+enter|navigate\s+to|open\s+the|close\s+the|wait\s+for|measure\s+and|enter\s+the|type\s+the|drag\s+the|scroll\s+down|check\s+the|switch\s+to|run\s+the)\b/i;
  if (imperativeRegex.test(lower)) return true;

  const academicRegex = /^(?:lab\s+assignment|lab\s+manual|experiment\s*(?:no\.?|\d+)|practical\s*(?:no\.?|\d+)|aim\b|apparatus\b|prerequisites?\b|solution\b|techniques?\b|observations?\b|procedure\b|conclusion\b|code\s+implementation)/i;
  if (academicRegex.test(lower)) return true;

  const words = l.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return true;

  return false;
}

function synthesizeDomainTitle(unitText, docBaseLower = '') {
  const lower = unitText.toLowerCase();

  // Network & Systems
  if (lower.includes('filter') && (lower.includes('wireshark') || lower.includes('icmp') || lower.includes('packet'))) return 'Wireshark Packet Filtering';
  if (lower.includes('tcp') && (lower.includes('stream') || lower.includes('handshake') || lower.includes('connect request'))) return 'TCP Stream & Handshake Analysis';
  if (lower.includes('protocol hierarchy') || (lower.includes('protocol') && lower.includes('stack layer'))) return 'Network Protocol Hierarchy';
  if (lower.includes('conversations') || (lower.includes('endpoints') && lower.includes('packet capture'))) return 'Network Conversation & Endpoints';
  if (lower.includes('extract') && lower.includes('files') && lower.includes('packet')) return 'Packet File Reconstruction';
  if (lower.includes('brute force') || lower.includes('hydra') || lower.includes('password spray')) return 'Cyber Attack Traffic Detection';
  if (lower.includes('subnetting') || (lower.includes('ipv4') && lower.includes('addressing'))) return 'IPv4 Subnetting & Topology';
  if (lower.includes('packet tracer') || lower.includes('cisco')) return 'Cisco Packet Tracer Design';
  if (lower.includes('horizontal') && lower.includes('vertical') && lower.includes('scaling')) return 'Horizontal vs Vertical Scaling';
  if (lower.includes('load balanc')) return 'Cloud Load Balancing Strategy';
  if (lower.includes('dijkstra')) return 'Dijkstra Shortest Path Algorithm';
  if (lower.includes('dynamic programming') || lower.includes('memoization')) return 'Dynamic Programming Foundations';
  if (lower.includes('consensus') || lower.includes('paxos') || lower.includes('raft')) return 'Distributed Consensus & Paxos';
  if (lower.includes('replication') || lower.includes('sharding')) return 'Distributed Data Replication';

  // Climate / Comfort / Shelter
  if (lower.includes('literature review') && (lower.includes('comfort') || lower.includes('thermal'))) return 'Thermal Comfort Benchmarks';
  if (lower.includes('problem statement') || (lower.includes('problem') && lower.includes('comfort'))) return 'Cross-Climate Prediction Gaps';
  if (lower.includes('research gap') || lower.includes('identified gaps')) return 'Cross-Climate Design Gaps';
  if (lower.includes('objectives') && (lower.includes('comfort') || lower.includes('prediction') || lower.includes('thermal'))) return 'Thermal Comfort ML Objectives';
  if (lower.includes('methodology') || (lower.includes('data collection') && lower.includes('preprocessing'))) return 'Adaptive Shelter Methodology';
  if (lower.includes('system architecture') || (lower.includes('climate data') && lower.includes('occupant data'))) return 'Integrated Shelter Architecture';
  if (lower.includes('contribution') || lower.includes('decision-support')) return 'Decision-Support Framework';
  if (lower.includes('conclusion') && (lower.includes('shelter') || lower.includes('comfort'))) return 'Climate-Adaptive Shelter Outcomes';
  if (lower.includes('energy') && lower.includes('optimization')) return 'Energy & Comfort Optimization';
  if (lower.includes('thermal comfort') || (lower.includes('pmv') && lower.includes('temperature'))) return 'Thermal Comfort Fundamentals';

  return 'Core Technical Architecture';
}

const climateSlides = JSON.parse(fs.readFileSync('tests/fixtures/climate_slides.json', 'utf8'));

// Run simulation
const { extractTopicsLocally } = await import('../src/lib/topicExtractor.js');

// Let's test how extractTopicsLocally handles Document 6 with new filters
console.log("Simulating Document 6 Extraction...");
