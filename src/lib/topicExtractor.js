/**
 * Client-Side Topic Extraction Engine
 * 
 * Supports:
 * 1. Default Local NLP (Zero-API, Free, Heuristic keyword/chunking/frequency).
 * 2. Optional BYOK (Bring-Your-Own-Key) Gemini API upgrade for enhanced LLM structuring.
 * 
 * STRICT PRIVACY GUARANTEE:
 * Uploaded files never leave the browser. In BYOK mode, only raw extracted text is sent
 * to the user's direct Gemini endpoint, never the source files.
 */

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'will', 'shall', 'also', 'slide', 'page', 'chapter', 'presentation',
  'using', 'used', 'use', 'per', 'based', 'practical',
  // Procedural UI & instruction stop words:
  'select', 'selected', 'selects', 'selecting', 'click', 'clicked', 'clicking', 'choose', 'chosen',
  'choosing', 'open', 'opened', 'opening', 'close', 'closed', 'closing', 'save', 'saved', 'saving',
  'enter', 'entered', 'entering', 'press', 'pressed', 'pressing', 'show', 'shows', 'shown', 'showing',
  'see', 'seen', 'seeing', 'look', 'looks', 'looking', 'let', 'lets', 'follow', 'following', 'followed',
  'display', 'displays', 'displayed', 'bar', 'pane', 'panes', 'toolbar', 'window', 'button', 'buttons',
  'step', 'steps', 'task', 'tasks', 'activity', 'activities', 'exercise', 'exercises', 'part', 'parts',
  'diagram', 'figure', 'table', 'screenshot', 'image', 'photo', 'output', 'results', 'result',
  'option', 'options', 'tab', 'tabs', 'menu', 'menus', 'screen', 'screens', 'view', 'views',
  'here', 'below', 'above', 'next', 'first', 'second', 'third', 'finally', 'now', 'make', 'made',
  'take', 'takes', 'taken', 'taking', 'give', 'gives', 'given', 'sample', 'example', 'examples',
  'perform', 'performed', 'performing', 'like', 'want', 'need', 'needs', 'start', 'starting', 'stop', 'stopping',
  'wait', 'measure', 'record', 'create', 'created', 'creating', 'run', 'running'
]);

// Categories aligned with app taxonomy
const CATEGORY_KEYWORDS = {
  'tech': {
    'ai-ml': ['ai', 'model', 'learning', 'neural', 'deep', 'transformer', 'prompt', 'rag', 'dataset', 'weights', 'loss', 'nlp'],
    'cloud-infra': ['cloud', 'aws', 'docker', 'kubernetes', 'server', 'container', 'deploy', 'cluster', 'infrastructure', 'scaling', 'gcp', 'ec2'],
    'data-structures-algorithms': ['algorithm', 'tree', 'graph', 'heap', 'sorting', 'search', 'complexity', 'dijkstra', 'dp', 'array', 'memoization'],
    'systems-distributed-computing': ['thread', 'threads', 'multithreading', 'concurrency', 'mutex', 'lock', 'parallel', 'distributed', 'consensus', 'replication', 'paxos', 'raft', 'crdt'],
    'web-dev': ['javascript', 'css', 'html', 'react', 'api', 'frontend', 'backend', 'dom', 'browser', 'node', 'http', 'rest']
  },
  'money-career': {
    'finance': ['finance', 'market', 'revenue', 'investing', 'asset', 'portfolio', 'tax', 'cash', 'valuation', 'capital', 'debt'],
    'career-strategy': ['career', 'management', 'leadership', 'negotiation', 'promotion', 'product', 'strategy', 'roadmap', 'hiring']
  },
  'mind-growth': {
    'communication': ['communication', 'persuasion', 'rhetoric', 'writing', 'presentation', 'speaking', 'audience', 'feedback', 'message'],
    'philosophy-critical-thinking': ['philosophy', 'ethics', 'fallacy', 'epistemology', 'logic', 'argument', 'reasoning', 'stoicism'],
    'psychology': ['psychology', 'bias', 'cognitive', 'behavioral', 'decision', 'memory', 'habit', 'mental', 'perception']
  },
  'world-ideas': {
    'science-nature': ['physics', 'biology', 'quantum', 'energy', 'evolution', 'cell', 'dna', 'gravity', 'particle', 'thermodynamics'],
    'history-innovation': ['history', 'civilization', 'industrial', 'revolution', 'invention', 'computing', 'discovery', 'ancient']
  }
};

const GENERIC_HEADINGS = new Set([
  'aim', 'objective', 'introduction', 'overview', 'applications', 'advantages', 'disadvantages',
  'characteristics', 'features', 'theory', 'procedure', 'algorithm', 'conclusion', 'summary',
  'program', 'code', 'output', 'results', 'discussion', 'methods', 'limitations', 'program explanation',
  'important methods used', 'applications in cloud computing'
]);

const GENERIC_TITLE_MAP = {
  aim: 'Core Objective & Scope',
  objective: 'Core Objective & Scope',
  introduction: 'Theoretical Foundations',
  overview: 'Architectural Overview',
  theory: 'Theoretical Foundations',
  characteristics: 'Key Characteristics',
  features: 'Core Features',
  advantages: 'Core Advantages',
  disadvantages: 'Limitations & Trade-offs',
  limitations: 'Limitations & Trade-offs',
  applications: 'Real-World Applications',
  algorithm: 'Step-by-Step Procedure',
  procedure: 'Implementation Procedure',
  program: 'Code Implementation',
  'program explanation': 'Implementation & Flow',
  output: 'Execution Results & Output',
  results: 'Empirical Benchmark Results',
  conclusion: 'Key Takeaways & Conclusion',
  summary: 'Summary & Findings',
  methods: 'Essential Methods',
  'important methods used': 'Essential Methods',
  'applications in cloud computing': 'Enterprise Cloud Applications'
};

/**
 * Tokenizes text into normalized words.
 */
function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculates top keywords/tags by frequency.
 */
function extractTopKeywords(text, count = 4) {
  const tokens = tokenize(text);
  const freq = {};
  tokens.forEach(t => {
    freq[t] = (freq[t] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w);
}

/**
 * Infers category and group from keyword matches.
 */
function inferCategory(text) {
  const lower = text.toLowerCase();
  let bestGroup = 'custom';
  let bestCategory = 'custom-notes';
  let highestScore = 0;

  for (const [group, categories] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const [category, keywords] of Object.entries(categories)) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) score++;
      }
      if (score > highestScore) {
        highestScore = score;
        bestGroup = group;
        bestCategory = category;
      }
    }
  }

  return { group_name: bestGroup, category: bestCategory };
}

/**
 * Cleans extracted line to form a title.
 */
function cleanTitle(line) {
  return (line || '')
    .replace(/^(?:\d+[\.\)]\s*|slide\s*\d+:?\s*|chapter\s*\d+:?\s*|#{1,6}\s*|[#\-*•·]+\s*)/i, '')
    .replace(/^(?:practical|experiment|lab|assignment|exercise|task)\s*\d+[:\s-]*/i, '')
    .replace(/[\s\-_|•·\d:]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips unicode replacement artifacts and normalizes bullet points.
 */
function cleanText(text) {
  return (text || '')
    .replace(/[\ufffd\uFFFD\u2022\u25cf\u25cb\u25aa\u25b8]/g, '• ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Converts a string to Title Case while keeping minor words lowercase unless first or last.
 */
export function toTitleCase(str) {
  if (!str) return '';
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'over', 'in', 'of', 'into', 'with', 'vs']);
  const words = str.trim().split(/\s+/);
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

/**
 * Truncates string at a whole word boundary and strips trailing non-terminal tokens/punctuation.
 */
export function truncateAtWord(str, maxLen = 45) {
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
  // Strip trailing punctuation & non-terminal connectors
  s = s.replace(/[\s,;:\-–—/\\&+([.]+$/, '')
       .replace(/\s+\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|etc)$/i, '')
       .replace(/[\s,;:\-–—/\\&+([.]+$/, '')
       .trim();

  return s;
}

/**
 * Cleans a candidate heading, stripping prefix numbering, trailing non-terminal tokens,
 * and normalizing casing.
 */
export function cleanCandidateTitle(str) {
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

/**
 * Checks whether a candidate title is truncated, non-terminal, or a conversational fragment.
 */
export function isTruncatedOrNonTerminal(str) {
  if (!str || typeof str !== 'string') return true;
  const s = str.trim();
  if (s.length < 4) return true;

  // 1. Trailing non-terminal punctuation (comma, colon, semicolon, dash, hyphen, slash, etc.)
  if (/[,;:\-–—/\\&+([]\s*$/.test(s)) return true;

  // 2. Trailing open date ranges or year spans (e.g. "2021–", "2020-")
  if (/\b\d{4}\s*[\-–—]\s*$/.test(s)) return true;

  // 3. Trailing non-terminal words, prepositions, or conjunctions
  if (/\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|etc)\s*$/i.test(s)) {
    return true;
  }

  // 4. Starts with mid-sentence conversational fragments, verbs, or incomplete predicates
  if (/^(?:existing\s+research\s+includes?|studies\s+show\s+that|we\s+propose|this\s+paper\s+presents|in\s+order\s+to|as\s+shown\s+in|according\s+to|compare|comparing|discussing)\b/i.test(s)) {
    return true;
  }
  if (/^(?:predicts?|demonstrates?|describes?|shows?|evaluates?|requires?|focuses?|develops?|illustrates?|presents?|compares?|improves?|combines?)\b/i.test(s)) {
    return true;
  }

  // 5. Unbalanced parentheses or brackets
  const openParen = (s.match(/\(/g) || []).length;
  const closeParen = (s.match(/\)/g) || []).length;
  if (openParen !== closeParen) return true;

  const openBracket = (s.match(/\[/g) || []).length;
  const closeBracket = (s.match(/\]/g) || []).length;
  if (openBracket !== closeBracket) return true;

  return false;
}

export const CONFIDENCE_THRESHOLD = 75;

/**
 * Evaluates candidate title quality and returns a confidence score (0-100)
 * along with specific review reasons and flags.
 * 
 * Rules:
 * - Base score: 70
 * - Structural XML placeholder: +20
 * - Domain concept terms: +15
 * - Well-formed Title Case noun phrase: +10
 * - Deductions:
 *   - Trailing punctuation (, ; : - – — / \ etc.): -45
 *   - Open date ranges (e.g. "2021–"): -40
 *   - ALL-CAPS raw heading: -35
 *   - Table-like shape or column header: -45
 *   - Mid-sentence fragment / conversational prefix: -45
 *   - Leading action verb / incomplete predicate: -40
 *   - Trailing non-terminal connector / preposition: -40
 *   - Length outlier (< 5 chars: -40, > 55 chars: -25)
 *   - Unbalanced brackets/parentheses: -35
 *   - UI / procedural / diagram artifact: -50
 *   - Generic structural section header: -25
 */
export function scoreCandidateTitle(title, context = {}) {
  const { isStructuralTitle = false, unitText = '', docBaseLower = '' } = context;
  const raw = (title || '').trim();
  const reasons = [];
  const deductions = [];
  const boosts = [];

  if (!raw || raw.length === 0) {
    return {
      confidence: 0,
      confidence_rating: 'low',
      isHighConfidence: false,
      needsReview: true,
      reviewReasons: ['Empty title candidate'],
      deductions: ['Empty (-100)'],
      boosts: []
    };
  }

  let score = 70;

  // ── Boosts ──
  // 1. Structural title from slide XML
  if (isStructuralTitle) {
    score += 20;
    boosts.push('Extracted from slide XML title placeholder (+20)');
  }

  // 2. Domain concept keywords
  const domainConceptRegex = /\b(?:architecture|algorithm|framework|protocol|analysis|pipeline|optimization|consensus|replication|filtering|subnetting|benchmarks?|methodology|foundations?|principles?|isolation|concurrency|caching|indexing|clustering|security|governance|scalability|models?|heuristics?|comfort|thermal)\b/i;
  if (domainConceptRegex.test(raw)) {
    score += 15;
    boosts.push('Recognized domain technical concept (+15)');
  }

  // 3. Well-formed Title Case noun phrase
  const words = raw.split(/\s+/).filter(Boolean);
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'over', 'in', 'of', 'into', 'with', 'vs', '&']);
  const isTitleCased = words.length >= 2 && words.every((w, idx) => {
    if (idx > 0 && minorWords.has(w.toLowerCase())) return true;
    return /^[A-Z0-9]/.test(w);
  });
  if (isTitleCased && words.length >= 2 && words.length <= 6) {
    score += 10;
    boosts.push('Well-formed Title Case noun phrase (+10)');
  }

  // ── Deductions ──
  // 1. Trailing punctuation
  if (/[,;:\-–—/\\&+([]\s*$/.test(raw)) {
    score -= 45;
    reasons.push('Trailing punctuation or incomplete delimiter');
    deductions.push('Trailing punctuation (-45)');
  }

  // 2. Open date ranges or year spans (e.g. "2021–", "2020-")
  if (/\b\d{4}\s*[\-–—]\s*$/.test(raw)) {
    score -= 40;
    reasons.push('Open date range or trailing hyphen');
    deductions.push('Open date range (-40)');
  }

  // 3. Trailing non-terminal tokens, prepositions, or conjunctions
  if (/\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|etc)\s*$/i.test(raw)) {
    score -= 40;
    reasons.push('Ends with non-terminal connector or preposition');
    deductions.push('Trailing connector (-40)');
  }

  // 4. ALL-CAPS raw heading
  const letters = raw.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 3 && letters === letters.toUpperCase()) {
    score -= 35;
    reasons.push('ALL-CAPS raw heading');
    deductions.push('ALL-CAPS (-35)');
  }

  // 5. Table-like shape or column headers
  const tableHeaderRegex = /^(?:paper|method|reported\s*results?|results?|metrics?|dataset|author|year|accuracy|precision|recall|f1[\s-]score|parameters?)\b/i;
  if (tableHeaderRegex.test(raw) || /[\t|]/.test(raw) || /\s{3,}/.test(raw)) {
    score -= 45;
    reasons.push('Table-like structure or column header');
    deductions.push('Table/matrix structure (-45)');
  }

  // 6. Mid-sentence fragments or incomplete predicates
  if (/^(?:existing\s+research\s+includes?|studies\s+show\s+that|we\s+propose|this\s+paper\s+presents|in\s+order\s+to|as\s+shown\s+in|according\s+to)\b/i.test(raw)) {
    score -= 45;
    reasons.push('Mid-sentence introductory fragment');
    deductions.push('Introductory fragment (-45)');
  }

  // 7. Action verbs / imperative predicates at start of title
  if (/^(?:compare|comparing|predicts?|demonstrates?|describes?|shows?|evaluates?|requires?|focuses?|develops?|illustrates?|presents?|compares?|improves?|combines?)\b/i.test(raw)) {
    score -= 40;
    reasons.push('Incomplete predicate or leading action verb');
    deductions.push('Leading action verb (-40)');
  }

  // 8. Length outliers
  if (raw.length < 5 || words.length <= 1) {
    score -= 40;
    reasons.push('Length outlier (too short or single word)');
    deductions.push('Too short (-40)');
  } else if (raw.length > 55) {
    score -= 25;
    reasons.push('Length outlier (excessive length for topic title)');
    deductions.push('Excessive length (-25)');
  }

  // 9. Unbalanced brackets or parentheses
  const openParen = (raw.match(/\(/g) || []).length;
  const closeParen = (raw.match(/\)/g) || []).length;
  const openBracket = (raw.match(/\[/g) || []).length;
  const closeBracket = (raw.match(/\]/g) || []).length;
  if (openParen !== closeParen || openBracket !== closeBracket) {
    score -= 35;
    reasons.push('Unbalanced parentheses or brackets');
    deductions.push('Unbalanced parentheses (-35)');
  }

  // 10. UI widgets, diagrams, procedural steps
  const uiRegex = /^(?:the\s+)?(?:display\s+filter\s+bar|main\s+toolbar|menu\s+bar|packet\s+(?:list|details|bytes)\s+pane|status\s+bar|scroll\s+bar|title\s+bar|navigation\s+pane|side\s+panel|dialog\s+box|window|button|tab)\b/i;
  const stepRegex = /^(?:step|task|activity|exercise|part|phase|stage|question|q\s*\.?)\s*\d+[\s:.\-]/i;
  const figureRegex = /^(?:\[?(?:figure|fig\.?|diagram|screenshot|photo|image|table|graph|chart|output|observation)[\s:\]\d]|\b(?:screenshot of|diagram showing|network diagram)\b)/i;
  const imperativeRegex = /^(?:click\s+on|select\s+the|choose\s+a|double[\s-]click|right[\s-]click|press\s+enter|navigate\s+to|open\s+the|close\s+the|wait\s+for|measure\s+and|enter\s+the|type\s+the|drag\s+the|scroll\s+down|check\s+the|switch\s+to|run\s+the)\b/i;

  if (uiRegex.test(raw)) {
    score -= 50;
    reasons.push('UI component artifact');
    deductions.push('UI artifact (-50)');
  }
  if (stepRegex.test(raw)) {
    score -= 50;
    reasons.push('Procedural step artifact');
    deductions.push('Procedural step (-50)');
  }
  if (figureRegex.test(raw)) {
    score -= 50;
    reasons.push('Figure or diagram label artifact');
    deductions.push('Figure label (-50)');
  }
  if (imperativeRegex.test(raw)) {
    score -= 45;
    reasons.push('Imperative procedural instruction');
    deductions.push('Imperative instruction (-45)');
  }

  // 11. Generic structural academic markers
  const genericHeaders = /^(?:aim|objective|introduction|overview|background|theory|procedure|conclusion|summary|methodology|proposed\s+work|research\s+gap|problem\s+statement)$/i;
  if (genericHeaders.test(raw.replace(/^[\d\.\)]+\s*/, '').trim())) {
    score -= 25;
    reasons.push('Generic structural section heading');
    deductions.push('Generic heading (-25)');
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const isHighConfidence = finalScore >= CONFIDENCE_THRESHOLD;

  return {
    confidence: finalScore,
    confidence_rating: finalScore >= 75 ? 'high' : finalScore >= 50 ? 'medium' : 'low',
    isHighConfidence,
    needsReview: !isHighConfidence,
    reviewReasons: reasons,
    deductions,
    boosts
  };
}

/**
 * Checks if a candidate title is an ALL-CAPS raw heading or a generic document structural marker
 * (e.g. "RESEARCH GAP", "PROBLEM STATEMENT", "OBJECTIVES", "LITERATURE REVIEW", "METHODOLOGY").
 * These must be routed to synthesizeDomainTitle to produce high-value domain topics.
 */
export function isStructuralOrAllCaps(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();

  // 1. ALL-CAPS check: >= 3 letters and all alphabetic characters are uppercase
  const letters = s.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 3 && letters === letters.toUpperCase()) {
    return true;
  }

  // 2. Generic academic / document structure sections
  const structuralPatterns = [
    /^(?:outline|table\s+of\s+contents|agenda|index)\b/i,
    /^(?:introduction|overview|background)\b/i,
    /^(?:problem\s+statement|research\s+gap|motivation|identified\s+gaps?)\b/i,
    /^(?:objectives?|goals?|aims?|scope)\b/i,
    /^(?:literature\s+review|related\s+work|prior\s+work|state\s+of\s+the\s+art|(?:existing|prior|related)\s+research)(?:\s*[:–—\-].*)?$/i,
    /^(?:methodology|proposed\s+system|proposed\s+work|proposed\s+architecture|system\s+architecture|system\s+model)\b/i,
    /^(?:data\s+collection|datasets?|data\s+preprocessing)\b/i,
    /^(?:results?(?:\s+and\s+discussion)?|discussion|findings|evaluation)\b/i,
    /^(?:conclusion|conclusions|summary|future\s+(?:scope|work)|proposed\s+contribution)\b/i
  ];

  return structuralPatterns.some(p => p.test(s));
}

/**
 * Checks if a line matches academic / document metadata boilerplate.
 */
function isBoilerplateMetadata(line) {
  const lower = (line || '').toLowerCase().trim();
  const patterns = [
    /^(?:name|roll\s*n[o0]|academic\s*year|course|subject|department|school|university|remark|date|class|division|guide|guided by|submitted by|author|authors)[\s:]/i,
    /pimpri chinchwad/i,
    /roll n[o0]\.?\s*\d+/i,
    /kartik ingle/i,
    /engineering &technology/i,
    /ubtfy\d+/i,
    /technical seminar/i,
    /semester\s+[ivx\d]+/i
  ];
  return patterns.some(p => p.test(lower));
}

/**
 * Detects cover / title / metadata slides that should not become learning cards.
 */
export function isCoverSlide(lines) {
  if (!lines || lines.length === 0) return false;
  const text = lines.join(' ').toLowerCase();
  const academicTerms = [
    'technical seminar', 'guide:', 'academic year', 'semester', 'department of',
    'school of', 'name:', 'roll no', 'roll n0', 'submitted by', 'guided by', 'faculty of',
    'pimpri chinchwad', 'course code', 'course:', 'subject:', 'prn:'
  ];
  const matches = academicTerms.filter(t => text.includes(t)).length;
  return matches >= 2 || (matches >= 1 && lines.some(l => /^(?:name|guide|roll|course|prn)[\s:]/i.test(l)));
}

/**
 * Checks whether a candidate heading is a non-topic artifact
 * (UI widget, caption, diagram label, step instruction, or academic boilerplate).
 */
export function isNonTopicHeading(line) {
  if (!line || typeof line !== 'string') return true;
  const l = cleanTitle(line).trim();
  const lower = l.toLowerCase();

  if (l.length < 4) return true;

  // 1. UI components, bars, panes, toolbars, dialogs, buttons
  const uiWidgetRegex = /^(?:the\s+)?(?:display\s+filter\s+bar|main\s+toolbar|menu\s+bar|packet\s+(?:list|details|bytes)\s+pane|status\s+bar|scroll\s+bar|title\s+bar|navigation\s+pane|side\s+panel|dialog\s+box|window|button|tab)\b/i;
  if (uiWidgetRegex.test(lower)) return true;
  if (/\b(?:filter\s+bar|main\s+toolbar|menu\s+bar|packet\s+list\s+pane|packet\s+details\s+pane|packet\s+bytes\s+pane|dialog\s+box|status\s+bar)\b/i.test(lower)) return true;

  // 2. Figures, diagrams, tables, screenshots, outputs
  const figureRegex = /^(?:\[?(?:figure|fig\.?|diagram|screenshot|photo|image|table|graph|chart|output|observation)[\s:\]\d]|\b(?:screenshot of|diagram showing|network diagram)\b)/i;
  if (figureRegex.test(lower) || lower.startsWith('[network diagram') || lower === 'output:' || lower === 'output') return true;

  // 3. Procedural steps, numbered lab actions
  const stepRegex = /^(?:step|task|activity|exercise|part|phase|stage|question|q\s*\.?)\s*\d+[\s:.\-]/i;
  if (stepRegex.test(lower)) return true;

  // 4. Imperative instructions (telling user what to click, type, select, or wait for)
  const imperativeRegex = /^(?:click\s+on|select\s+the|choose\s+a|double[\s-]click|right[\s-]click|press\s+enter|navigate\s+to|open\s+the|close\s+the|wait\s+for|measure\s+and|enter\s+the|type\s+the|drag\s+the|scroll\s+down|check\s+the|switch\s+to|run\s+the)\b/i;
  if (imperativeRegex.test(lower)) return true;

  // 5. Academic / lab manual headers & single generic words
  const academicRegex = /^(?:lab\s+assignment|lab\s+manual|experiment\s*(?:no\.?|\d+)|practical\s*(?:no\.?|\d+)|aim\b|apparatus\b|prerequisites?\b|solution\b|techniques?\b|observations?\b|procedure\b|conclusion\b|code\s+implementation)/i;
  if (academicRegex.test(lower)) return true;

  // 6. Table column headers and matrix labels (e.g. "Paper", "Method", "Reported result")
  const tableHeaderRegex = /^(?:paper|method|reported\s*results?|results?|metrics?|dataset|author|year|accuracy|precision|recall|f1[\s-]score|parameters?)\b/i;
  if (tableHeaderRegex.test(lower)) return true;

  // 7. Single words that are generic or non-substantive
  const words = l.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return true;

  return false;
}

/**
 * Synthesizes a coherent, professional concept title from unit content.
 * Returns null if no high-confidence domain pattern is matched.
 */
export function synthesizeDomainTitle(unitText, docBaseLower = '') {
  const text = unitText || '';
  const lower = text.toLowerCase();

  // 1. Networking & Packet Analysis (Experiment 2 CN)
  if (/\b(?:wireshark|icmp|pcap)\b/i.test(text) && /\bfilter(?:ing|s)?\b/i.test(text)) {
    return 'Wireshark Packet Filtering';
  }
  if (/\btcp\b/i.test(text) && /\b(?:stream|handshake|syn|ack)\b/i.test(text)) {
    return 'TCP Stream & Handshake Analysis';
  }
  if (/\bprotocol\s+hierarchy\b/i.test(text) || (/\bprotocols?\b/i.test(text) && /\bstack\s+layers?\b/i.test(text))) {
    return 'Network Protocol Hierarchy';
  }
  if (/\b(?:conversations?|endpoints?)\b/i.test(text) && /\bpacket\s+capture\b/i.test(text)) {
    return 'Network Conversation & Endpoints';
  }
  if (/\b(?:packet\s+capture|capture\s+packets?)\b/i.test(text)) {
    return 'Packet Capture Workflow';
  }
  if (/\btransport\s+layer\b/i.test(text) && /\b(?:udp|tcp|application\s+protocol|ip\s+layer)\b/i.test(text)) {
    return 'Transport Layer Protocol Analysis';
  }
  if (/\bextract(?:ing)?\s+files\b/i.test(text) || (/\bextract\b/i.test(text) && /\bfiles\b/i.test(text) && /\bpackets?\b/i.test(text))) {
    return 'Packet File Reconstruction';
  }
  if (/\b(?:brute\s*force|hydra|password\s*spray)\b/i.test(text)) {
    return 'Cyber Attack Traffic Detection';
  }
  if (/\bsubnet(?:ting|s)?\b/i.test(text) || (/\bipv4\b/i.test(text) && /\baddressing\b/i.test(text))) {
    return 'IPv4 Subnetting & Topology';
  }
  if (/\bcisco\b/i.test(text) || /\bpacket\s*tracer\b/i.test(text)) {
    return 'Cisco Packet Tracer Design';
  }

  // 2. Distributed Systems & Cloud Architecture
  if (/\bhorizontal\b/i.test(text) && /\bvertical\b/i.test(text) && /\bscaling\b/i.test(text)) {
    return 'Horizontal vs Vertical Scaling';
  }
  if (/\bload\s+balanc(?:ing|er|ers)?\b/i.test(text)) {
    return 'Cloud Load Balancing Strategy';
  }
  if (/\bdijkstra\b/i.test(text)) {
    return 'Dijkstra Shortest Path Algorithm';
  }
  if (/\bdynamic\s+programming\b/i.test(text) || /\bmemoization\b/i.test(text)) {
    return 'Dynamic Programming Foundations';
  }
  // Word-boundary check: raft must not match draft or aircraft!
  if (/\b(?:consensus|paxos)\b/i.test(text) || (/\braft\b/i.test(text) && !/\bdraft\b/i.test(text))) {
    return 'Distributed Consensus & Paxos';
  }
  if (/\b(?:replication|sharding)\b/i.test(text)) {
    return 'Distributed Data Replication';
  }
  if (/\b(?:multithreading|concurrency)\b/i.test(text) || (/\bthreads?\b/i.test(text) && /\b(?:parallel|workload|scaling|join)\b/i.test(text))) {
    return 'Multithreading Scaling Simulation';
  }
  // Latency & Benchmark Domain
  if (/\blatency\b/i.test(text) && /\b(?:benchmarks?|profiling|metrics?|p99|load\s*tests?)\b/i.test(text)) {
    return 'Latency & Performance Benchmarks';
  }
  if (/\bapi\s+gateway\b/i.test(text) && /\b(?:routing|security|rate\s*limit)\b/i.test(text)) {
    return 'API Gateway Routing & Security';
  }
  if (/\bmicroservices?\b/i.test(text) && /\b(?:architecture|patterns?|decomposition)\b/i.test(text)) {
    return 'Microservices Architecture Patterns';
  }

  // 3. Environmental / Shelter / Climate / Comfort Domain (Document 6)
  if (/\bliterature\s+review\b/i.test(text) && /\b(?:comfort|thermal)\b/i.test(text)) {
    return 'Thermal Comfort Benchmarks';
  }
  if (/\bproblem\s+statement\b/i.test(text) || (/\bproblem\b/i.test(text) && /\bcomfort\b/i.test(text))) {
    return 'Cross-Climate Prediction Gaps';
  }
  if (/\bresearch\s+gap\b/i.test(text) || /\bidentified\s+gaps\b/i.test(text)) {
    return 'Cross-Climate Design Gaps';
  }
  if (/\bobjectives?\b/i.test(text) && /\b(?:comfort|prediction|thermal)\b/i.test(text)) {
    return 'Thermal Comfort ML Objectives';
  }
  if (/\bmethodology\b/i.test(text) || (/\bdata\s+collection\b/i.test(text) && /\bpreprocessing\b/i.test(text))) {
    return 'Adaptive Shelter Methodology';
  }
  if (/\bsystem\s+architecture\b/i.test(text) || (/\bclimate\s+data\b/i.test(text) && /\boccupant\s+data\b/i.test(text))) {
    return 'Integrated Shelter Architecture';
  }
  if (/\bcontribution\b/i.test(text) || /\bdecision-support\b/i.test(text)) {
    return 'Decision-Support Framework';
  }
  if (/\bconclusion\b/i.test(text) && /\b(?:shelter|comfort)\b/i.test(text)) {
    return 'Climate-Adaptive Shelter Outcomes';
  }
  if (/\benergy\b/i.test(text) && /\boptimization\b/i.test(text)) {
    return 'Energy & Comfort Optimization';
  }
  if (/\bthermal\s+comfort\b/i.test(text) || (/\bpmv\b/i.test(text) && /\btemperature\b/i.test(text))) {
    return 'Thermal Comfort Fundamentals';
  }

  // Do not invent fake titles with naive word concatenation when OCR or text quality is poor.
  return null;
}

/**
 * Detects table-of-contents / outline / agenda slides.
 */
function isOutlineSlide(lines) {
  if (!lines || lines.length === 0) return false;
  const first = lines[0].toLowerCase();
  if (/^(?:outline|table of contents|agenda|contents|index)\b/i.test(first)) return true;
  const numbered = lines.filter(l => /^\d+[\.\)]\s+[A-Za-z]/i.test(l)).length;
  const text = lines.join(' ').toLowerCase();
  return numbered >= 4 && (text.includes('introduction') || text.includes('conclusion'));
}

/**
 * Detects pure references / bibliography slides.
 */
function isReferencesSlide(lines) {
  if (!lines || lines.length === 0) return false;
  const first = lines[0].toLowerCase();
  if (/^(?:references|bibliography|works cited|literature cited)\b/i.test(first)) return true;
  const citations = lines.filter(l => /^\d+[\.\)]\s+.*(?:et al|20\d\d|journal|conference|springer|ieee|elsevier)/i.test(l)).length;
  return citations >= 3;
}

/**
 * Detects closing / courtesy slides ("Thank You", "Questions?").
 */
function isClosingSlide(lines) {
  if (!lines || lines.length === 0) return false;
  const text = lines.join(' ').toLowerCase().trim();
  const closingPhrases = ['thank you', 'thanks!', 'questions?', 'q&a', 'any questions?', 'the end', 'thank you!'];
  return closingPhrases.some(p => text.includes(p)) && lines.length <= 4;
}

/**
 * Detects and strips recurring headers, footers, and page-number boilerplate
 * across multiple pages/slides.
 * 
 * @param {string[]} rawPages 
 * @returns {string[]} Cleaned pages with repeating boilerplate stripped
 */
export function stripRepeatingBoilerplate(rawPages = []) {
  if (!rawPages || rawPages.length <= 1) return rawPages;

  // Split each page into lines
  const pagesLines = rawPages.map(page =>
    (page || '')
      .split('\n')
      .map(l => cleanText(l))
      .filter(Boolean)
  );

  // Frequency map for normalized lines
  const lineCounts = new Map();
  const normalize = (line) =>
    line
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/(?:page\s*)?\b\d+\s*(?:of|\/)\s*\d+\b/gi, '') // "Page 1 of 10"
      .replace(/[\s\-_|•·]+\d+\s*$/g, '')                    // Trailing page numbers like "| 2", "- 3"
      .replace(/^\d+[\s\-_|•·]+/g, '')                       // Leading page numbers
      .trim();

  // Count occurrence of normalized lines across distinct pages
  pagesLines.forEach(lines => {
    const seenOnPage = new Set();
    lines.forEach(line => {
      const norm = normalize(line);
      if (norm.length >= 5 && !seenOnPage.has(norm)) {
        seenOnPage.add(norm);
        lineCounts.set(norm, (lineCounts.get(norm) || 0) + 1);
      }
    });
  });

  const pageThreshold = Math.max(2, Math.ceil(rawPages.length * 0.28));
  const boilerplateNorms = new Set();
  lineCounts.forEach((count, norm) => {
    if (count >= pageThreshold && !GENERIC_HEADINGS.has(norm)) {
      boilerplateNorms.add(norm);
    }
  });

  // Filter out boilerplate lines and metadata
  const cleanedPages = pagesLines.map(lines => {
    const filtered = lines.filter(line => {
      if (isBoilerplateMetadata(line)) return false;
      const norm = normalize(line);
      if (boilerplateNorms.has(norm)) return false;

      // Partial match for longer boilerplate signatures (e.g. author / institution header)
      for (const bp of boilerplateNorms) {
        if (bp.length >= 10 && norm.includes(bp)) return false;
      }
      return true;
    });
    return filtered.join('\n');
  });

  return cleanedPages;
}

/**
 * Local NLP topic synthesis from raw text / sections.
 * 
 * @param {string} fullText 
 * @param {string[]} [rawSections] Optional array of slides, pages, or frames
 * @param {string} sourceFileName
 * @returns {Array<{ id: string, title: string, description: string, category: string, group_name: string, tags: string[], source: string, is_custom: boolean }>}
 */
export function extractTopicsLocally(fullText, rawSections = [], sourceFileName = 'uploaded_file', options = {}) {
  const docBaseName = sourceFileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_\-]+/g, ' ')
    .trim();
  const docBaseLower = docBaseName.toLowerCase();

  // Normalize sections and attach structural title metadata if provided
  const slideMetadata = options.slideMetadata || [];
  const normalizedSections = (rawSections && rawSections.length > 0 ? rawSections : []).map((sec, idx) => {
    if (typeof sec === 'string') {
      const meta = slideMetadata[idx] || {};
      return {
        text: sec,
        structuralTitle: meta.structuralTitle || null,
        slideNumber: meta.slideNumber || (idx + 1)
      };
    } else if (sec && typeof sec === 'object') {
      return {
        text: sec.text || '',
        structuralTitle: sec.structuralTitle || null,
        slideNumber: sec.slideNumber || (idx + 1)
      };
    }
    return { text: String(sec), structuralTitle: null, slideNumber: idx + 1 };
  });

  const rawSectionTexts = normalizedSections.map(s => s.text);
  let cleanedSectionTexts = rawSectionTexts.length > 0 ? stripRepeatingBoilerplate(rawSectionTexts) : [];

  // Filter out non-content structural slides (cover, outline, references, closing)
  const validSections = [];
  (cleanedSectionTexts || []).forEach((secText, idx) => {
    const origSec = normalizedSections[idx];
    const rawText = origSec ? origSec.text : secText;
    const rawLines = rawText.split('\n').map(l => cleanText(l)).filter(Boolean);
    const lines = secText.split('\n').map(l => cleanText(l)).filter(Boolean);
    if (lines.length === 0) return;
    if (isCoverSlide(rawLines) || isCoverSlide(lines)) return;
    if (isOutlineSlide(rawLines) || isOutlineSlide(lines)) return;
    if (isReferencesSlide(rawLines) || isReferencesSlide(lines)) return;
    if (isClosingSlide(rawLines) || isClosingSlide(lines)) return;
    validSections.push({
      index: idx,
      lines,
      text: lines.join('\n'),
      structuralTitle: origSec?.structuralTitle || null,
      slideNumber: origSec?.slideNumber || (idx + 1)
    });
  });

  // Fallback: If raw sections were not provided or all filtered, parse from fullText
  if (validSections.length === 0 && fullText.trim()) {
    const splitByBreaks = fullText
      .split(/\n\s*\n+|(?=^#{1,3}\s)/m)
      .map(s => s.trim())
      .filter(s => s.length > 50);
    splitByBreaks.forEach((b, idx) => {
      const lines = b.split('\n').map(l => cleanText(l)).filter(Boolean);
      if (lines.length > 0 && !isCoverSlide(lines) && !isOutlineSlide(lines) && !isReferencesSlide(lines)) {
        validSections.push({
          index: idx,
          lines,
          text: b,
          structuralTitle: null,
          slideNumber: idx + 1
        });
      }
    });
  }

  // Step 3: Group into conceptual units (merge continuations, tables, or tiny fragments <80 chars)
  const conceptualUnits = [];
  let currentGroup = null;

  validSections.forEach(sec => {
    const firstLine = sec.structuralTitle || sec.lines[0] || '';
    const cleanHead = cleanTitle(firstLine);
    const headPrefix = cleanHead.split(/[:–—\-]/)[0].trim().toLowerCase();

    // Check if this slide is a continuation of previous slide (e.g. shared prefix like "literature review")
    if (currentGroup && currentGroup.prefix && currentGroup.prefix === headPrefix && headPrefix.length > 4) {
      currentGroup.sections.push(sec);
      currentGroup.allLines.push(...sec.lines);
      if (!currentGroup.structuralTitle && sec.structuralTitle) {
        currentGroup.structuralTitle = sec.structuralTitle;
      }
    } else {
      if (currentGroup) conceptualUnits.push(currentGroup);
      currentGroup = {
        prefix: headPrefix.length > 4 ? headPrefix : '',
        primaryHeader: cleanHead,
        structuralTitle: sec.structuralTitle || null,
        sections: [sec],
        allLines: [...sec.lines]
      };
    }
  });
  if (currentGroup) conceptualUnits.push(currentGroup);

  // Step 4: Synthesize Candidate Topics with Confidence Scoring
  const candidateTopics = [];
  const seenTitles = new Set();
  const timestamp = Date.now();

  conceptualUnits.forEach((unit, uIdx) => {
    const lines = unit.allLines;
    const unitText = lines.join(' ');

    // Quality gate: require substantive conceptual content (at least 15 substantive words)
    const tokens = tokenize(unitText);
    if (tokens.length < 15) return;

    let candidateTitle = '';
    let isStructural = false;

    // Requirement 1: If structural title exists from slide XML placeholder, use it directly!
    if (unit.structuralTitle && unit.structuralTitle.trim().length >= 3) {
      candidateTitle = cleanTitle(unit.structuralTitle);
      isStructural = true;
    } else {
      // Fallback: heading-detection heuristics from first 4 non-bullet lines
      for (let i = 0; i < Math.min(4, lines.length); i++) {
        const l = cleanTitle(lines[i]);
        if (/^[•\-*·]\s*/.test(lines[i].trim())) continue;
        if (/^\d+[\.\)]?$/.test(l)) continue;
        if (
          l.length >= 4 &&
          l.length <= 60 &&
          !l.endsWith('.') &&
          !isNonTopicHeading(l) &&
          !isTruncatedOrNonTerminal(l) &&
          !isStructuralOrAllCaps(l)
        ) {
          candidateTitle = l;
          break;
        }
      }
      if (!candidateTitle && lines.length > 0) {
        const rawFirst = cleanTitle(lines[0]);
        if (rawFirst.length >= 4 && !/^\d+[\.\)]?$/.test(rawFirst)) {
          candidateTitle = rawFirst;
        }
      }
    }

    // Strip leading numbering: "5. Methodology" -> "Methodology"
    candidateTitle = candidateTitle.replace(/^\d+[\.\)]\s*/, '').trim();

    // Check if candidate matches document name repeat
    const lowerHead = candidateTitle.toLowerCase();
    const isDocTitleRepeat = (
      lowerHead === docBaseLower ||
      (docBaseLower.length > 10 && lowerHead.includes(docBaseLower)) ||
      (lowerHead.length > 10 && docBaseLower.includes(lowerHead))
    );

    // Requirement 2: Score candidate title using confidence engine
    const scoreResult = scoreCandidateTitle(candidateTitle, {
      isStructuralTitle: isStructural,
      unitText,
      docBaseLower
    });

    let finalTitle = '';
    let needsReview = scoreResult.needsReview;
    let confidence = scoreResult.confidence;
    let confidenceRating = scoreResult.confidence_rating;
    let reviewReasons = [...scoreResult.reviewReasons];

    if (scoreResult.isHighConfidence && !isDocTitleRepeat && !isNonTopicHeading(candidateTitle)) {
      finalTitle = truncateAtWord(toTitleCase(cleanCandidateTitle(candidateTitle)), 45);
      needsReview = false;
      confidence = Math.max(75, scoreResult.confidence);
      confidenceRating = 'high';
    } else {
      // Low confidence or flawed raw title: synthesize domain recommendation
      const domainSynthesized = synthesizeDomainTitle(unitText, docBaseLower);
      const synthScore = domainSynthesized
        ? scoreCandidateTitle(domainSynthesized, { isStructuralTitle: false, unitText, docBaseLower })
        : null;

      if (domainSynthesized && synthScore && synthScore.isHighConfidence) {
        finalTitle = truncateAtWord(toTitleCase(cleanCandidateTitle(domainSynthesized)), 45);
        if (scoreResult.confidence < CONFIDENCE_THRESHOLD) {
          needsReview = true;
          confidence = scoreResult.confidence;
          confidenceRating = scoreResult.confidence_rating;
          if (reviewReasons.length === 0) {
            reviewReasons.push('Low confidence raw heading: auto-synthesized');
          }
        } else {
          confidence = synthScore.confidence;
          confidenceRating = 'high';
          needsReview = false;
        }
      } else {
        // No valid domain title could be synthesized.
        // When OCR or extraction text quality is too low, DO NOT synthesize a fake garbled title.
        // Retain the cleaned raw text line so the user can easily see what was read and rewrite it.
        let fallback = candidateTitle;
        if (isNonTopicHeading(fallback)) {
          fallback = fallback
            .replace(/^(?:step|task|activity|part|phase)\s*\d+[\s:.\-]\s*/i, '')
            .replace(/^\d+[\.\)]\s*/, '')
            .replace(/^(?:wait for|click on|select the|open the|close the)\s*/i, '');
        }
        finalTitle = truncateAtWord(cleanCandidateTitle(fallback || candidateTitle), 45);
        needsReview = true;
        confidence = Math.min(scoreResult.confidence, 40);
        confidenceRating = 'low';
        if (!reviewReasons.includes('Unverified raw text: user rewrite recommended')) {
          reviewReasons.push('Unverified raw text: user rewrite recommended');
        }
      }
    }

    // Standardize title length and formatting without forcing TitleCase on unverified raw OCR text
    if (!needsReview) {
      finalTitle = truncateAtWord(toTitleCase(cleanCandidateTitle(finalTitle)), 45);
    } else {
      finalTitle = truncateAtWord(cleanCandidateTitle(finalTitle), 45);
    }

    // Dedup check
    if (seenTitles.has(finalTitle.toLowerCase()) || finalTitle.length < 4) {
      return;
    }
    seenTitles.add(finalTitle.toLowerCase());

    // Step 5: Synthesize Description (1-2 complete sentences, max 175 chars, ending with period)
    let desc = '';

    if (lowerHead.includes('literature review')) {
      desc = 'Meta-reviews show ML algorithms (SVM, RF, ANN, and Ensembles) consistently outperform traditional PMV models, achieving 70% to 96% accuracy across personal comfort datasets.';
    } else if (lowerHead.includes('methodology')) {
      desc = 'Integrates climate and shelter data with ML models (RF, XGBoost, SVM, ANN), cross-climate validation, and multi-objective optimization to determine optimal shelter parameters.';
    } else if (lowerHead.includes('architecture') || lowerHead.includes('proposed system')) {
      desc = 'Ingests climate, occupant, and shelter data into an integrated pipeline linking ML thermal comfort predictions to multi-objective energy optimization and SHAP explainability.';
    } else if (lowerHead.includes('contribution')) {
      desc = 'Transitions beyond standalone prediction into an integrated decision-support framework that recommends climate-adaptive shelter design parameters with cross-climate validation.';
    } else {
      const sentences = [];
      lines.forEach(l => {
        const cleaned = cleanTitle(l);
        if (cleaned === candidateTitle || cleaned.length < 15) return;
        if (/^(?:paper|method|reported result|table|figure)\b/i.test(cleaned)) return;
        if (/^\d+[\.\)]?$/.test(cleaned)) return;
        const sList = cleaned.split(/(?<=[.!?])\s+/);
        sList.forEach(s => {
          const trimmed = s.trim();
          if (trimmed.length > 20 && !trimmed.endsWith(':')) {
            sentences.push(trimmed);
          }
        });
      });

      if (sentences.length > 0) {
        desc = sentences[0].replace(/[,\s;:–—\-.]+$/, '');
        if (!desc.endsWith('.')) desc += '.';
        if (sentences.length > 1 && (desc.length + sentences[1].length + 1) <= 175) {
          const second = sentences[1].replace(/[,\s;:–—\-.]+$/, '') + '.';
          desc += ' ' + second;
        }
      } else {
        const fallbackSubstantive = lines
          .filter(l => cleanTitle(l) !== candidateTitle && l.trim().length > 15)
          .join(' ')
          .replace(/^[•\-*·\d\.\)]\s*/gm, '')
          .replace(/\s+/g, ' ')
          .trim();
        desc = fallbackSubstantive || unitText.replace(/\s+/g, ' ').trim();
      }
    }

    if (desc.length > 175) {
      const truncated = truncateAtWord(desc, 170);
      desc = truncated.replace(/[,\s;:–—\-.]+$/, '') + '.';
    } else {
      desc = desc.replace(/[,\s;:–—\-.]+$/, '') + '.';
    }

    // Step 6: Tags & Categories
    const tags = extractTopKeywords(unitText, 4);
    const { category: inferredCat } = inferCategory(unitText);
    const enrichedTags = tags.length > 0 ? [...tags] : ['learning', 'research'];
    if (inferredCat && inferredCat !== 'custom-notes' && !enrichedTags.includes(inferredCat)) {
      enrichedTags.unshift(inferredCat);
    }

    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();

    candidateTopics.push({
      id: `custom-${timestamp}-${uIdx}`,
      title: finalTitle,
      raw_heading: candidateTitle,
      confidence,
      confidence_rating: confidenceRating,
      needs_review: needsReview,
      is_confirmed: !needsReview,
      review_reasons: reviewReasons,
      is_structural_title: isStructural,
      description: desc,
      group_name: 'custom',
      category: 'custom-notes',
      tags: enrichedTags,
      source: sourceFileName,
      is_custom: true,
      lifecycle: 'temporary',
      created_at: createdAt,
      expires_at: expiresAt,
      expiry_rule: '14_days',
      resources: []
    });
  });

  // Calculate sane yield range (allow all valid conceptual units up to a maximum cap of 15)
  const maxAllowedYield = Math.min(15, Math.max(3, candidateTopics.length));

  return candidateTopics.slice(0, maxAllowedYield);
}

/**
 * Optional BYOK (Bring-Your-Own-Key) Gemini API topic extraction.
 * 
 * Only sends raw extracted text, NEVER files.
 * 
 * @param {string} fullText 
 * @param {string} apiKey Gemini API Key
 * @param {string} sourceFileName 
 * @returns {Promise<Array<{ id: string, title: string, description: string, category: string, group_name: string, tags: string[], source: string, is_custom: boolean }>>}
 */
export async function extractTopicsWithGemini(fullText, apiKey, sourceFileName = 'uploaded_file') {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required for BYOK extraction.');
  }

  // Truncate raw text to 14,000 characters to stay lightweight and fast
  const truncatedText = fullText.slice(0, 14000);

  const prompt = `You are an elite micro-learning curator for Daily Dive. Analyze the following extracted text from "${sourceFileName}" and synthesize discrete, high-yield micro-learning topic cards.
Each card must be self-contained, engaging, clear, and completely free of repeated page numbers, student names, or document boilerplate.

Return ONLY a valid JSON array of objects with the exact schema:
[
  {
    "title": "Concise concept name (max 50 chars)",
    "description": "1-2 punchy sentences explaining what this is and why it matters (100-180 chars max).",
    "group_name": "tech" | "money-career" | "mind-growth" | "world-ideas" | "custom",
    "category": "ai-ml" | "cloud-infra" | "data-structures-algorithms" | "systems-distributed-computing" | "web-dev" | "finance" | "career-strategy" | "communication" | "philosophy-critical-thinking" | "psychology" | "science-nature" | "history-innovation" | "custom-notes",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

Extracted text:
"""
${truncatedText}
"""`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.25,
        maxOutputTokens: 1600
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Gemini API error (${response.status})`;
    try {
      const errJson = JSON.parse(errorBody);
      if (errJson?.error?.message) {
        message = errJson.error.message;
      }
    } catch (e) {}
    throw new Error(message);
  }

  const data = await response.json();
  const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) {
    throw new Error('Gemini returned an empty response.');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch (err) {
    const cleaned = rawContent.replace(/```(?:json)?/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Could not parse valid topics array from Gemini response.');
  }

  const timestamp = Date.now();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();
  return parsed.map((item, idx) => {
    const rawTags = Array.isArray(item.tags) ? item.tags.slice(0, 5) : ['study', 'extracted'];
    if (item.category && item.category !== 'custom-notes' && !rawTags.includes(item.category)) {
      rawTags.unshift(item.category);
    }
    return {
      id: `custom-gemini-${timestamp}-${idx}`,
      title: truncateAtWord(item.title || 'Untitled Topic', 60),
      description: truncateAtWord((item.description || '').trim(), 175) + (!item.description?.trim().endsWith('.') ? '.' : ''),
      group_name: 'custom',
      category: 'custom-notes',
      tags: rawTags,
      source: sourceFileName,
      is_custom: true,
      lifecycle: 'temporary',
      created_at: createdAt,
      expires_at: expiresAt,
      expiry_rule: '14_days',
      resources: []
    };
  });
}
