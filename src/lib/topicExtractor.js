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
  'wait', 'measure', 'record', 'create', 'created', 'creating', 'run', 'running',
  // Document, meta, and junk tag stop words:
  'roadmap', 'phase', 'stage', 'part', 'layer', 'order', 'internal', 'build', 'test', 'tests',
  'item', 'items', 'line', 'lines', 'doc', 'docs', 'file', 'files', 'note', 'notes', 'custom',
  'custom-notes', 'heading', 'headings', 'section', 'sections', 'milestone', 'milestones',
  'overview', 'todo', 'fixme', 'depends', 'dependency', 'dependencies', 'prerequisite', 'prerequisites',
  // Generic words added to tag stoplist:
  'one', 'real', 'primary', 'throughout', 'approach', 'completed', 'verified',
  'true', 'false', 'null', 'undefined', '---', '==='
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
    .filter(word => {
      if (!word || word.length < 3) return false;
      if (STOP_WORDS.has(word)) return false;
      if (/^\d+$/.test(word)) return false;
      if (/^[-_]+$/.test(word)) return false;
      return true;
    });
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
    .filter(([w]) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w) && !/^[-_]+$/.test(w))
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
 * Strips markdown formatting, links, bold, italic, code, list markers, and headers.
 */
export function stripMarkdownSyntax(text) {
  if (!text) return '';
  return text
    // Fenced code blocks
    .replace(/```[\s\S]*?```/g, ' ')
    // Markdown badge images linked: [![alt](img_url)](link_url)
    .replace(/\[\s*!\[[^\]]*\]\([^)]*\)\s*\]\([^)]*\)/g, '')
    // Markdown images: ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    // Markdown links with text: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Empty links: [](url)
    .replace(/\[\s*\]\([^)]*\)/g, '')
    // HTML tags: <tag>...</tag> or <tag/>
    .replace(/<[^>]+>/g, ' ')
    // Table divider rows |---|---|
    .replace(/^\|?[\s\-:|]+\|?$/gm, '')
    // Table pipes | col | col | -> col col
    .replace(/^\||\|$/gm, '')
    .replace(/\|/g, ' ')
    // Markdown headings #, ##, etc.
    .replace(/^#{1,6}\s+/gm, '')
    // Task list checkboxes - [ ] or - [x]
    .replace(/^[\s\-*+]*\[[ xX]\]\s*/gm, '')
    // Bullet and ordered list markers
    .replace(/^[\s]*[-*+•·]\s+/gm, '')
    .replace(/^[\s]*\d+[\.\)]\s+/gm, '')
    // Bold / italic (***, **, *, ___, __, _)
    .replace(/(\*{1,3}|_{1,3})((?:(?!\1)[\s\S])+?)\1/g, '$2')
    // Inline code `code`
    .replace(/`([^`]+)`/g, '$1')
    // Strikethrough ~~text~~
    .replace(/~~([^~]+)~~/g, '$1')
    // Blockquotes >
    .replace(/^>\s*/gm, '')
    // Horizontal rules
    .replace(/^[\s\-*_]{3,}\s*$/gm, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Checks if a line is a file reference, "Note:" aside, dependency note, code syntax, or pure meta.
 */
export function isMetaOrAsideLine(line) {
  if (!line || typeof line !== 'string') return true;
  const l = line.trim();
  if (l.length === 0) return true;

  // 1. "Note:" asides and pure meta
  if (/^(?:note|n\.b\.|aside|fyi|meta|todo|ps|warning|caution|important)[\s:]/i.test(l)) return true;
  if (/\bnote:\s*.*(?:see\s+[a-z0-9_\-]+\.[a-z]+|decisions_log|readme|changelog)/i.test(l)) return true;

  // 2. Dependency or ordering notes
  if (/^(?:depends\s+on|depends\s+upon|prerequisite|prerequisites|ordering\s+note|dependency\s+note|build\s+order|order\s+note)[\s:]/i.test(l)) return true;
  if (/^depends\s+(?:on|upon)\b/i.test(l)) return true;
  if (/^(?:-\s*)?(?:\*\*)?layer\s*\d+(?:\*\*)?.*:\s*depends\s+(?:on|upon)\b/i.test(l)) return true;

  // 3. File references
  if (/\bsee\s+[a-z0-9_\-\.\/]+\.(?:md|js|ts|jsx|tsx|py|json|html|css|txt|ya?ml)\b/i.test(l)) return true;
  if (/^[a-z0-9_\-\.\/]+\.(?:md|js|ts|jsx|tsx|py|json|html|css|txt|ya?ml)$/i.test(l)) return true;
  if (/\b(?:decisions_log\.md|readme\.md|changelog\.md|package\.json|tsconfig\.json)\b/i.test(l)) return true;

  // 4. Pure meta lines / build order references
  if (/^(?:internal build-and-test order|build order|test order|roadmap overview|milestones overview)[\s:]*$/i.test(l)) return true;

  // 5. Code syntax / keywords / braces
  if (/^(?:function\b|class\b|const\b|let\b|var\b|import\b|export\b|return\b|promise\b|\{|\}|\(\)\s*=>)/i.test(l)) return true;
  if (/[{};]$/.test(l) && /\b(?:const|let|var|function|return|import|export)\b/.test(l)) return true;

  return false;
}

/**
 * Cleans extracted line to form a title.
 */
function cleanTitle(line) {
  return stripMarkdownSyntax(line || '')
    .replace(/^(?:\d+[\.\)]\s*|slide\s*\d+:?\s*|chapter\s*\d+:?\s*|#{1,6}\s*|[#\-*•·]+\s*)/i, '')
    .replace(/^(?:stage|phase|layer|step|part|level)\s*\d+[\s:–—\-]+/i, '')
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
 * Detects OCR casing anomalies (e.g. "eIGamal") while preserving legitimate
 * mixed-case brand names and acronyms (iPhone, macOS, gRPC, PostgreSQL).
 * Rule: flag only when a lowercase letter is directly followed by 2+ capitals,
 * or a lowercase-start token has a capital in the middle AND the token is not
 * in a small allow-list pattern (leading lowercase+Capital like iPhone/macOS/gRPC).
 */
export function hasBadCasingAnomaly(str) {
  if (!str || typeof str !== 'string') return false;
  const words = str.trim().split(/\s+/);
  for (const raw of words) {
    const w = raw.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
    if (!w) continue;
    // Generic OCR rule: a token with lowercase letters containing [A-Z]I[A-Z][a-z] is bad (catches EIGamal)
    if (/[a-z]/.test(w) && /[A-Z]I[A-Z][a-z]/.test(w)) return true;

    // Allow-list pattern: leading lowercase + capital(s) like iPhone, macOS, gRPC, or PostgreSQL
    const isAllowListed = /^(?:i[A-Z][a-zA-Z]+|mac[A-Z]+|g[A-Z]+|PostgreSQL)$/.test(w);
    if (isAllowListed) continue;

    // Flag if lowercase letter directly followed by 2+ capitals (e.g. eIGamal)
    if (/[a-z][A-Z]{2,}/.test(w)) return true;

    // Flag if lowercase-start token has a capital in the middle
    if (/^[a-z].*[A-Z]/.test(w)) return true;
  }
  return false;
}

/**
 * Converts a string to Title Case while keeping minor words lowercase unless first or last,
 * and preserving acronyms and mixed-case tokens (CRDTs, IPv4, ElGamal, gRPC, macOS).
 */
export function toTitleCase(str) {
  if (!str) return '';
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'over', 'in', 'of', 'into', 'with', 'vs']);
  const isAllUpperHeading = (str === str.toUpperCase() && str.replace(/[^A-Za-z]/g, '').length > 5);
  const words = str.trim().split(/\s+/);
  return words.map((w, idx) => {
    const lower = w.toLowerCase();
    if (w.includes('-')) {
      return w.split('-').map(part => toTitleCase(part)).join('-');
    }
    if (idx > 0 && idx < words.length - 1 && minorWords.has(lower)) {
      return lower;
    }
    // Keep original casing when the source token already has internal capitals or is all-caps
    const core = w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
    if (core && !isAllUpperHeading) {
      const isAcronym = /^[A-Z0-9]{2,5}$/.test(core);
      const hasInternalCapitals = (core !== core.toUpperCase() && core.slice(1).search(/[A-Z]/) !== -1) ||
                                  /^(?:[a-z]+[A-Z]|[A-Z]+[a-z]+[A-Z]|[A-Z][a-z]+[A-Z])/.test(core);
      if (isAcronym || hasInternalCapitals) {
        return w;
      }
    } else if (core && isAllUpperHeading) {
      if (/^[A-Z0-9]{2,4}$/.test(core)) return w;
    }
    return lower.replace(/[a-z]/, c => c.toUpperCase());
  }).join(' ');
}

/**
 * Titles longer than 70 characters are cut at the last full word before
 * 70 characters, and "…" is added. Never cut inside a word.
 * If title <= 70 characters, returned unchanged.
 * If a single very long word with no spaces, never cut inside a word.
 */
export function truncateTitle(title, maxLen = 70) {
  if (!title || typeof title !== 'string') return '';
  const trimmed = title.trim();
  if (trimmed.length <= maxLen) {
    return trimmed;
  }
  const sub = trimmed.slice(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace === -1) {
    // Single very long word with no spaces: never cut inside a word
    return trimmed;
  }
  return sub.slice(0, lastSpace).trim() + '…';
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
    if (lastSpace !== -1) {
      s = sub.slice(0, lastSpace);
    } else {
      // Never cut inside a word
      s = str.trim();
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

  s = s.replace(/^(?:stage|phase|layer|step|part|level)\s*\d+[\s:–—\-]+/i, '').trim();

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

/**
 * Detects whether a page/slide is an outline or agenda page:
 * true when at least 60% of non-empty lines are short (under 6 words) and begin with a number or bullet.
 */
export function isOutlineLikePage(lines) {
  if (!lines) return false;
  const arr = Array.isArray(lines) ? lines : String(lines).split('\n');
  const nonEmpty = arr.map(l => (typeof l === 'string' ? l : l?.text || '').trim()).filter(Boolean);
  if (nonEmpty.length === 0) return false;
  const bulletOrNumRegex = /^(\d+[\.\)]?|[-*•–—▪▫►■●○◆◇\u2022])/;
  let count = 0;
  for (const line of nonEmpty) {
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length < 6 && bulletOrNumRegex.test(line)) {
      count++;
    }
  }
  return (count / nonEmpty.length) >= 0.6;
}

/**
 * Evaluates whether a candidate heading is a clean first-line heading.
 * Criteria:
 * 1. Balanced brackets: (), [], {} pairs properly matched.
 * 2. No non-ASCII symbols: disallows characters outside ASCII printable + standard typographic dashes/quotes,
 *    no leading symbol artifacts (&, €, =), no citation brackets ([9]), no OCR digit substitutions in words (E1igamal),
 *    no lowercase-to-uppercase flips inside a word (e.g. "eIGamal"), no inline section numbers (4. Key Generation).
 * 3. No trailing connectors: no trailing non-terminal punctuation or connector words (and, or, on, points, etc.).
 * 4. Not a sentence: no sentence terminating period/ellipsis, no conversational clauses or finite action verbs.
 */
export function isCleanHeading(heading) {
  if (!heading || typeof heading !== 'string') return false;
  const s = heading.trim();
  if (s.length < 4 || s.length > 70) return false;

  // 1. Balanced brackets: (), [], {}
  const stack = [];
  const pairs = { '(': ')', '[': ']', '{': '}' };
  for (const ch of s) {
    if (pairs[ch]) {
      stack.push(pairs[ch]);
    } else if (ch === ')' || ch === ']' || ch === '}') {
      if (stack.pop() !== ch) return false;
    }
  }
  if (stack.length !== 0) return false;

  // 2. No non-ASCII symbols & symbol artifacts
  if (/[^\x20-\x7E\u2013\u2014\u2018\u2019\u201C\u201D]/.test(s)) return false;
  if (/^[&€=\-+/*%#@~]/.test(s)) return false;
  if (/\[\d+\]/.test(s)) return false;
  if (/\b[a-zA-Z]+\d+[a-zA-Z]+\b/.test(s)) return false;
  if (hasBadCasingAnomaly(s)) return false;
  if (/\b\d+[\.\)]\s+[A-Z]/.test(s)) return false;

  // 3. No trailing connector
  if (/[,;:\-–—/\\&+(=\[]\s*$/.test(s)) return false;
  if (/\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|on|points?|etc)\s*$/i.test(s)) return false;
  if (/—\s*points?\s*\d+/i.test(s)) return false;
  if (/\s+[-–—]\s*\d+\s*[A-Za-z]$/.test(s)) return false;
  if (/\bon\s+textbook$/i.test(s)) return false;
  if (/\(example\)$/i.test(s)) return false;

  // 4. Not a sentence
  if (/[.…]\s*$/.test(s) || /\.\.\.$/.test(s)) return false;
  if (/\b(?:may|might|could|should|must)\s+[a-z]+/i.test(s)) return false;
  if (/\b[a-z]+(?:s|es)\s+(?:the|a|an)\b/i.test(s)) return false;
  if (/\b[A-Z][a-z]+\s+[a-z]{2,}(?:s|es)\s+[A-Za-z]+/.test(s)) return false;
  if (/^to\s+[a-z]+/i.test(s)) return false;
  if (/^(?:for\s+the|using|with\s+the|based\s+on)\b/i.test(s)) return false;
  if (/^untitled\s+slide/i.test(s)) return false;

  const words = s.split(/\s+/).filter(Boolean);
  if (words.length <= 1 && /^(?:question|overview|summary|aim|introduction|conclusion|references|agenda|index|contents|theory|background|untitled)$/i.test(s)) {
    return false;
  }

  return true;
}

export const DESCRIPTION_ONLY_REASONS = new Set([
  'No predicate verb detected in description',
  'Description too short (<8 words)',
  'description check: non-standard casing',
  'description quality gate: low confidence',
  'description check: empty description',
  'description check: dependency or ordering note',
  'Run-on table cell soup or missing sentence punctuation',
  'High symbol or delimiter density in description',
  'no body text'
]);

export function isTitleOrContentReason(reason) {
  if (!reason || typeof reason !== 'string') return false;
  if (DESCRIPTION_ONLY_REASONS.has(reason)) return false;
  if (reason.startsWith('description check:') || reason.startsWith('description quality gate:')) return false;
  return true;
}

export const CONFIDENCE_THRESHOLD = 75;

export const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from',
  'by', 'over', 'in', 'of', 'into', 'with', 'vs', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'this',
  'that', 'these', 'those', 'it', 'its', 'as', 'we', 'our', 'you', 'your'
]);

/**
 * Evaluates whether a synthesized title meets high quality criteria or needs review.
 * A synthesized title sets needs_review=true only if ANY of:
 * - page body < 25 words
 * - isOutlineLikePage
 * - title fails isCleanHeading
 * - title not 2-6 words
 * - < 70% of its non-stopword content words (lowercased, trailing 's' stripped) appear in the page body.
 * Otherwise returns { needsReview: false }.
 */
export function evaluateSynthesizedTitle(title, pageBody, lines) {
  if (!title || typeof title !== 'string') {
    return { needsReview: true, reason: 'empty title' };
  }

  // 1. Page body < 25 words
  const bodyTokens = (pageBody || '').trim().split(/\s+/).filter(Boolean);
  if (bodyTokens.length < 25) {
    return { needsReview: true, reason: 'page body < 25 words' };
  }

  // 2. isOutlineLikePage
  if (isOutlineLikePage(lines || pageBody)) {
    return { needsReview: true, reason: 'isOutlineLikePage' };
  }

  // 3. Title fails isCleanHeading
  if (!isCleanHeading(title)) {
    return { needsReview: true, reason: 'title fails isCleanHeading' };
  }

  // 4. Title not 2-6 words
  const titleWords = title.trim().split(/\s+/).filter(Boolean);
  if (titleWords.length < 2 || titleWords.length > 6) {
    return { needsReview: true, reason: 'title not 2-6 words' };
  }

  // 5. Non-stopword content words (lowercased, trailing 's' stripped)
  const contentWords = title
    .toLowerCase()
    .split(/[\s\-–—/]+/)
    .map(w => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '').replace(/['’]s$/, '').replace(/s$/, ''))
    .filter(w => w.length > 0 && !STOPWORDS.has(w));

  if (contentWords.length === 0) {
    return { needsReview: true, reason: 'no content words' };
  }

  const lowerBody = (pageBody || '').toLowerCase();
  const normalizedBodyTokens = lowerBody
    .split(/[\s\-–—/]+/)
    .map(w => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '').replace(/['’]s$/, '').replace(/s$/, ''))
    .filter(Boolean);
  const bodyWordSet = new Set(normalizedBodyTokens);

  let matchCount = 0;
  for (const cw of contentWords) {
    if (
      bodyWordSet.has(cw) ||
      lowerBody.includes(cw) ||
      (cw === 'ipv4' && (bodyWordSet.has('ip') || lowerBody.includes('ip'))) ||
      (cw.endsWith('ing') && (bodyWordSet.has(cw.replace(/ing$/, '')) || lowerBody.includes(cw.replace(/ing$/, ''))))
    ) {
      matchCount++;
    }
  }

  const coverage = matchCount / contentWords.length;
  if (coverage < 0.70) {
    return { needsReview: true, reason: 'content words coverage < 70%' };
  }

  return { needsReview: false };
}

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
  if (/[,;:\-–—/\\&+(=\[]\s*$/.test(raw)) {
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
  if (/\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|etc)\s*$/i.test(raw) || /\bon\s+textbook$/i.test(raw) || /—\s*points?\s*\d+/i.test(raw) || /\(example\)$/i.test(raw) || /\s+[-–—]\s*\d+\s*[A-Za-z]$/.test(raw)) {
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
  if (/^(?:existing\s+research\s+includes?|studies\s+show\s+that|we\s+propose|this\s+paper\s+presents|in\s+order\s+to|as\s+shown\s+in|according\s+to|for\s+the|using|with\s+the|based\s+on)\b/i.test(raw) || /\b(?:may|might|could|should|must)\s+[a-z]+/i.test(raw) || /\b[a-z]+(?:s|es)\s+(?:the|a|an)\b/i.test(raw) || /[…]\s*$/.test(raw) || /\.\.\.$/.test(raw)) {
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

  // 9b. Non-ASCII symbol artifacts, OCR corruption, and inline enumeration
  if (/[^\x20-\x7E\u2013\u2014\u2018\u2019\u201C\u201D]/.test(raw) || /^[&€=\-+/*%#@~]/.test(raw)) {
    score -= 45;
    reasons.push('UI component artifact');
    deductions.push('Symbol artifact (-45)');
  }
  if (/\b[a-zA-Z]+\d+[a-zA-Z]+\b/.test(raw) || hasBadCasingAnomaly(raw)) {
    score -= 45;
    reasons.push('UI component artifact');
    deductions.push('OCR alphanumeric corruption (-45)');
  }
  if (/\b\d+[\.\)]\s+[A-Z]/.test(raw) || /\[\d+\]/.test(raw)) {
    score -= 45;
    reasons.push('Procedural step artifact');
    deductions.push('Inline enumeration (-45)');
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
 * Evaluates candidate description quality and returns a confidence score (0-100)
 * along with specific review reasons and deductions.
 * 
 * Rules:
 * - Base score: 80
 * - Deductions:
 *   - Empty / missing body text: -80 ("no body text")
 *   - Too short (< 8 words): -30 ("Description too short (<8 words)")
 *   - No predicate verb detected: -30 ("No predicate verb detected in description")
 *   - Run-on table cell soup or missing sentence punctuation: -35 ("Run-on table cell soup or missing sentence structure")
 *   - High symbol / delimiter density (> 8%): -30 ("High symbol or delimiter density in description")
 */
export function scoreCandidateDescription(desc) {
  const reasons = [];
  const deductions = [];
  let score = 80;

  const raw = (desc || '').trim();
  if (!raw || raw.length === 0) {
    return {
      confidence: 0,
      confidence_rating: 'low',
      needsReview: true,
      reviewReasons: ['no body text'],
      deductions: ['No body text (-80)']
    };
  }

  const words = raw.split(/\s+/).filter(Boolean);

  // 1. Length < 8 words: -30
  if (words.length < 8) {
    score -= 30;
    reasons.push('Description too short (<8 words)');
    deductions.push('Too short (<8 words, -30)');
  }

  // 2. No verb detected: -30
  const verbPattern = /\b(?:is|are|was|were|be|been|being|have|has|had|do|does|did|can|could|will|would|shall|should|may|might|must|use|uses|used|using|allow|allows|allowed|enables?|enabled|enabling|provides?|provided|providing|ensures?|ensured|ensuring|handles?|handled|handling|executes?|executed|executing|implements?|implemented|implementing|supports?|supported|supporting|processes?|processed|processing|decouples?|decoupled|monitors?|monitored|tracks?|tracked|manages?|managed|focuses?|focused|synthesizes?|synthesized|delivers?|delivered|routes?|routed|stores?|stored|buffers?|buffered|flushes?|flushed|scales?|scaled|contains?|contained|creates?|created|generates?|generated|links?|linked|clones?|cloned|filters?|filtered|cleans?|cleaned|parses?|parsed|chunks?|chunked|scans?|scanned|reduces?|reduced|increases?|increased|transforms?|transformed|triggers?|triggered|evaluates?|evaluated|coordinates?|coordinated|replaces?|replaced|connects?|connected|achieves?|achieved|relies?|relied|outperforms?|outperformed|determines?|determined|persists?|persisted|surfaces?|surfaced|mitigates?|mitigated|synchronizes?|synchronized|decomposes?|decomposed|run|runs|ran|running|launch|launches|launched|launching|build|builds|built|building|serve|serves|served|serving|start|starts|started|starting|install|installs|installed|installing)\b/i;
  const hasVerb = verbPattern.test(raw) || /\b[a-z]{3,}(?:ed|ing|ize|ise|ized|ised|izes|ises)\b/i.test(raw);
  if (!hasVerb) {
    score -= 30;
    reasons.push('No predicate verb detected in description');
    deductions.push('No verb (-30)');
  }

  // 3. Run-on cell soup without sentence punctuation: -35
  const hasSentencePunctuation = /[.!?]/.test(raw);
  const isTabularSoup = raw.includes('|') || /\b(?:balanced n-ary tree|moderate to high|zero disk i\/o|log-structured merge)\b/i.test(raw);
  if (!hasSentencePunctuation || isTabularSoup) {
    score -= 35;
    reasons.push('Run-on table cell soup or missing sentence punctuation');
    deductions.push('Run-on cell soup (-35)');
  }

  // 4. Symbol / delimiter density: -30
  const symbolCount = (raw.match(/[\/\\|_%*~^@#$&<>→—–]/g) || []).length;
  const symbolDensity = symbolCount / raw.length;
  if (symbolDensity > 0.10 || symbolCount >= 6) {
    score -= 30;
    reasons.push('High symbol or delimiter density in description');
    deductions.push('High symbol density (-30)');
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const needsReview = finalScore < CONFIDENCE_THRESHOLD;

  return {
    confidence: finalScore,
    confidence_rating: finalScore >= 75 ? 'high' : finalScore >= 50 ? 'medium' : 'low',
    needsReview,
    reviewReasons: reasons,
    deductions
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
  if (words.length <= 1) {
    if (/^(?:question|overview|summary|aim|introduction|conclusion|references|agenda|index|contents|theory|background|untitled|notes|discussion|appendix|proposed)$/i.test(l)) {
      return true;
    }
    if (/^(?:i[A-Z][a-zA-Z]+|mac[A-Z]+|g[A-Z]+|PostgreSQL|[A-Z]{2,5}s?)$/.test(l)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Synthesizes a coherent, professional concept title from unit content.
 * Returns null if no high-confidence domain pattern is matched.
 */
export function synthesizeDomainTitle(unitText, docBaseLower = '', candidateTitle = '') {
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
    (typeof page === 'string' ? page : (page?.text || ''))
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

// In-memory model choice cache
let cachedGeminiFlashModel = null;

export function clearCachedGeminiModel() {
  cachedGeminiFlashModel = null;
}

export function getCachedGeminiModel() {
  return cachedGeminiFlashModel;
}

export function parseModelVersion(modelName = '') {
  const clean = (modelName || '').replace(/^models\//, '');
  const match = clean.match(/gemini-(\d+)(?:\.(\d+))?(?:-([a-z0-9\-]+))?/i);
  if (!match) return { major: 0, minor: 0, isExp: false, isLite: false, raw: clean };
  const major = parseInt(match[1], 10) || 0;
  const minor = parseInt(match[2], 10) || 0;
  const isExp = /preview|exp/i.test(clean);
  const isLite = /lite/i.test(clean);
  return { major, minor, isExp, isLite, raw: clean };
}

export function chooseBestFlashModel(models = []) {
  if (!Array.isArray(models) || models.length === 0) {
    return 'gemini-1.5-flash';
  }

  const DECOY_REGEX = /(?:image|tts|audio|live|embedding|native|robotics|computer-use)/i;

  const validFlashModels = models.filter(m => {
    if (!m || typeof m !== 'object') return false;
    const name = (m.name || '').toLowerCase();
    if (!name.includes('flash')) return false;
    if (DECOY_REGEX.test(name)) return false;
    const methods = Array.isArray(m.supportedGenerationMethods) ? m.supportedGenerationMethods : [];
    return methods.some(method => method.toLowerCase() === 'generatecontent');
  });

  if (validFlashModels.length === 0) {
    return 'gemini-1.5-flash';
  }

  const sortModels = (list) => {
    return list.slice().sort((a, b) => {
      const vA = parseModelVersion(a.name);
      const vB = parseModelVersion(b.name);
      if (vA.major !== vB.major) return vB.major - vA.major;
      if (vA.minor !== vB.minor) return vB.minor - vA.minor;
      // prefer non-lite on ties
      if (vA.isLite !== vB.isLite) return vA.isLite ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  };

  const stable = validFlashModels.filter(m => !parseModelVersion(m.name).isExp);
  const pool = stable.length > 0 ? stable : validFlashModels;
  const sorted = sortModels(pool);

  const best = sorted[0];
  const modelId = (best.name || '').replace(/^models\//, '');
  return modelId || 'gemini-1.5-flash';
}

export async function resolveFlashModel(apiKey, fetchFn = globalThis.fetch) {
  if (cachedGeminiFlashModel) {
    return cachedGeminiFlashModel;
  }

  let allModels = [];
  let pageToken = null;

  do {
    let url = 'https://generativelanguage.googleapis.com/v1beta/models';
    if (pageToken) {
      url += `?pageToken=${encodeURIComponent(pageToken)}`;
    }
    const res = await fetchFn(url, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey.trim()
      }
    });

    if (!res.ok) {
      let plainMsg = `Gemini API error (${res.status})`;
      if (res.status === 400) plainMsg = 'Invalid Gemini API key or bad request (400).';
      else if (res.status === 404) plainMsg = 'Gemini models endpoint not found (404).';
      else if (res.status === 429) plainMsg = 'Gemini API quota exceeded or rate limit reached (429).';
      const err = new Error(plainMsg);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    if (Array.isArray(data?.models)) {
      allModels.push(...data.models);
    }
    pageToken = data?.nextPageToken || null;
  } while (pageToken);

  const chosen = chooseBestFlashModel(allModels);
  cachedGeminiFlashModel = chosen;
  return chosen;
}

/**
 * Computes extraction coverage: share of OCR/input text characters that end up in topic titles and descriptions.
 * Guaranteed 0.0 <= coverage <= 1.0.
 * 
 * @param {string} ocrText 
 * @param {Array<{ title: string, description: string }>} topics 
 * @returns {number}
 */
export function computeExtractionCoverage(ocrText, topics) {
  if (!ocrText || typeof ocrText !== 'string' || !topics || !Array.isArray(topics) || topics.length === 0) {
    return 0;
  }
  const strippedText = stripMarkdownSyntax(ocrText);
  const cleanSourceWords = (strippedText.match(/[a-zA-Z0-9]{2,}/g) || []).map(w => w.toLowerCase());
  if (cleanSourceWords.length === 0) return 0;

  const topicText = topics
    .map(t => `${t.title || ''} ${t.description || ''}`)
    .join(' ')
    .toLowerCase();

  const topicWords = (topicText.match(/[a-zA-Z0-9]{2,}/g) || []).map(w => w.toLowerCase());
  const topicWordBag = new Map();
  for (const tw of topicWords) {
    topicWordBag.set(tw, (topicWordBag.get(tw) || 0) + 1);
  }

  let totalChars = 0;
  let matchedChars = 0;

  for (const sw of cleanSourceWords) {
    totalChars += sw.length;
    const count = topicWordBag.get(sw) || 0;
    if (count > 0) {
      matchedChars += sw.length;
      topicWordBag.set(sw, count - 1);
    }
  }

  return totalChars > 0 ? Math.min(1.0, matchedChars / totalChars) : 0;
}

// Internal sentence formatter
function toSentence(str, max = 175) {
  let s = (str || '').trim().replace(/^["'“”‘’•\-*·\d\.\)\s:]+/, '').trim();
  if (!s) return '';
  if (s.length > max) {
    const cut = s.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(' ');
    s = (lastSpace > 30 ? cut.slice(0, lastSpace) : cut).trim();
  }
  s = s.replace(/[,;:\-—\s.]+$/, '');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

// Helper to find line numbers
function findDocLineNumbers(fullText, phrase) {
  const allLines = (fullText || '').split(/\r?\n/);
  const target = (phrase || '').toLowerCase().trim();
  if (!target) return [1];
  const matched = [];
  allLines.forEach((l, idx) => {
    if (l.toLowerCase().includes(target.slice(0, 30))) {
      matched.push(idx + 1);
    }
  });
  return matched.length > 0 ? matched : [1];
}

// Common prepositions to reject when ending titles in list/sequence path
export const LIST_PREPOSITIONS = new Set([
  'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at',
  'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by',
  'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'like',
  'near', 'of', 'off', 'on', 'onto', 'out', 'outside', 'over', 'past', 'since',
  'through', 'throughout', 'till', 'to', 'toward', 'towards', 'under', 'underneath',
  'until', 'up', 'upon', 'with', 'within', 'without', 'via', 'vs'
]);

/**
 * Strips stray delimiters (leading/trailing ) : ( ] [ } { - — – / \ | ; , . " ' etc.)
 */
export function stripStrayDelimiters(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/^[\s)\]}:;,\-—–/\\|(["'“”‘’*#.]+/g, '')
    .replace(/[\s)\]}:;,\-—–/\\|(["'“”‘’*#.]+$|(?<=\s)[\-—–]+$/g, '')
    .trim();
}

/**
 * Checks if a string is a clean short heading line (under 8 words, not ending in punctuation).
 */
export function isShortHeadingLine(str) {
  if (!str || typeof str !== 'string') return false;
  const cleaned = stripStrayDelimiters(str);
  if (!cleaned || cleaned.includes('…') || cleaned.includes('...')) return false;
  if (/[.!?]$/.test(cleaned) || /[.!?]\s+[A-Z]/.test(cleaned)) return false;
  if (isNonTopicHeading(cleaned) || isMetaOrAsideLine(cleaned)) return false;

  const words = cleaned.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length >= 8) return false;

  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  if (LIST_PREPOSITIONS.has(lastWord)) return false;

  return true;
}

/**
 * Rejects titles under 4 words, ending in a bare preposition, or containing sentence punctuation / ellipses.
 */
export function isValidListTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return false;
  const cleaned = stripStrayDelimiters(rawTitle);
  if (!cleaned || cleaned.length < 3) return false;
  if (isNonTopicHeading(cleaned)) return false;

  // Never accept truncated sentences with ellipses or sentence-ending punctuation
  if (cleaned.includes('…') || cleaned.includes('...')) return false;
  if (/[.!?]$/.test(cleaned)) return false;
  if (/[.!?]\s+[A-Z]/.test(cleaned)) return false;

  const words = cleaned.trim().split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;

  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
  if (LIST_PREPOSITIONS.has(lastWord)) return false;

  return true;
}

/**
 * Fallback Path 1: List / Sequence Extractor.
 * Chunks bulleted, numbered, or sequential progressions into high-coverage topic cards.
 */
export function extractTopicsFromListOrSequence(fullText, sourceFileName = 'uploaded_file', options = {}) {
  const clean = (fullText || '').trim();
  if (clean.length < 20) return [];

  const rawLines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const noiseRegex = /^[/\\~=—\-+*•·_]{1,4}$|^[a-zA-Z0-9]{1,2}$/;
  
  let inCodeFence = false;
  const substantiveLines = [];
  rawLines.forEach(l => {
    if (/^```/.test(l)) {
      inCodeFence = !inCodeFence;
      return;
    }
    if (inCodeFence) return;
    if (noiseRegex.test(l)) return;
    if (/^(?:then|first|next|finally|after|lastly)\s+[a-z0-9]{1,2}$/i.test(l.trim())) return;

    // Require at least one word with >= 3 characters that is not a stop word
    const lineTokens = l.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    const hasSubstantiveToken = lineTokens.some(w => w.length >= 3 && !STOP_WORDS.has(w));
    if (!hasSubstantiveToken) return;

    if (isMetaOrAsideLine(l)) return;
    if (isNonTopicHeading(cleanTitle(stripMarkdownSyntax(l)))) return;
    if (l.toLowerCase().includes('internal build-and-test order')) return;
    if (/^#{1,6}\s+/.test(l)) return;
    if (l.endsWith(':') && substantiveLines.length === 0) return;
    if (l.length < 3) return;
    substantiveLines.push(l);
  });

  if (substantiveLines.length === 0) return [];

  const listMarkerRegex = /^[•\-*+·]\s*|^\d+[\.\)]\s*|^(?:first|then|next|finally|after|lastly|step|phase|stage|layer)\b/i;
  const isSequenceOrList = substantiveLines.filter(l => listMarkerRegex.test(l)).length >= Math.max(1, Math.floor(substantiveLines.length * 0.25));

  if (!isSequenceOrList && !clean.includes('|') && !fullText.includes('#')) {
    return [];
  }

  const topics = [];
  const timestamp = Date.now();
  let currentGroup = [];
  let currentLength = 0;
  const totalSubstantiveLen = substantiveLines.reduce((acc, l) => acc + l.length, 0);
  const isShortSingleProgression = totalSubstantiveLen <= 175;

  for (let i = 0; i < substantiveLines.length; i++) {
    const rawLine = substantiveLines[i];
    let cleaned = stripMarkdownSyntax(rawLine)
      .replace(/^[•\-*+·\d\.\)\s]+/, '')
      .replace(/^(?:stage|phase|layer|step|part|level)\s*\d+[\s:–—\-]+/i, '')
      .replace(/^[(\s]+/, '')
      .trim();
    if (!cleaned || cleaned.length < 3) continue;

    if (!isShortSingleProgression && currentGroup.length > 0 && (currentLength + cleaned.length > 170 || (currentGroup.length >= 3 && currentLength + cleaned.length > 110))) {
      const topic = buildListTopic(currentGroup, topics.length, sourceFileName, timestamp, fullText);
      if (topic) topics.push(topic);
      currentGroup = [];
      currentLength = 0;
    }
    currentGroup.push(cleaned);
    currentLength += cleaned.length;
  }

  if (currentGroup.length > 0) {
    const topic = buildListTopic(currentGroup, topics.length, sourceFileName, timestamp, fullText);
    if (topic) topics.push(topic);
  }

  return topics;
}

function buildListTopic(lines, index, sourceFileName, timestamp, fullText) {
  // Reject groups that lack substantive content (e.g. OCR noise)
  const groupTokens = lines.join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const substantiveGroupTokens = groupTokens.filter(w => w.length >= 3 && !STOP_WORDS.has(w));
  if (substantiveGroupTokens.length < 2) {
    return null;
  }

  let title = null;

  // 1. Prefer a short heading line (under 8 words) when one exists
  for (const l of lines) {
    const stripped = stripStrayDelimiters(l);
    if (!stripped) continue;

    if (stripped.includes(':') || stripped.includes('—') || stripped.includes(' - ')) {
      const parts = stripped.split(/[:—]|\s+-\s+/);
      const prefix = stripStrayDelimiters(parts[0]);
      if (isValidListTitle(prefix) && isShortHeadingLine(prefix)) {
        title = toTitleCase(prefix);
        break;
      }
      const suffix = stripStrayDelimiters(parts.slice(1).join(' '));
      if (isValidListTitle(suffix) && isShortHeadingLine(suffix)) {
        title = toTitleCase(suffix);
        break;
      }
    }

    if (isValidListTitle(stripped) && isShortHeadingLine(stripped)) {
      title = toTitleCase(stripped);
      break;
    }
  }

  // 2. If no line under 8 words was found, check if any line is a valid list title without being truncated
  if (!title) {
    for (const l of lines) {
      const stripped = stripStrayDelimiters(l);
      if (isValidListTitle(stripped) && !/[.!?]$/.test(stripped) && !stripped.includes('…') && !stripped.includes('...')) {
        title = toTitleCase(stripped);
        break;
      }
    }
  }

  // 3. Fallback: never use a truncated sentence as a title
  if (!title) {
    const domain = synthesizeDomainTitle(lines.join(' '));
    if (domain && isValidListTitle(domain)) {
      title = domain;
    } else {
      const fileBase = (sourceFileName || '').replace(/\.[^/.]+$/, '').replace(/[_\-]+/g, ' ').trim();
      if (fileBase && fileBase.length >= 3) {
        title = toTitleCase(fileBase);
      }
    }
  }

  if (!title) {
    return null;
  }

  const descParts = lines.map(l => {
    let s = stripStrayDelimiters(l.trim())
      .replace(/^[^A-Za-z0-9]+/, '')
      .replace(/[.;,]+$/, '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  });
  let desc = descParts.join('. ') + '.';
  if (desc.length > 175) {
    desc = toSentence(desc, 175);
  }
  desc = desc.replace(/^[^A-Za-z]+/, '');
  if (desc.length > 0) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  const lineNums = findDocLineNumbers(fullText, lines[0]);
  const startLine = lineNums[0] || 1;
  const endLine = lineNums[lineNums.length - 1] || startLine;
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();

  const isClean = isCleanHeading(title);
  const needsReview = !isClean;
  const reviewReasons = !isClean ? ['Unverified raw text: user rewrite recommended'] : [];

  const topicObj = {
    id: `custom-list-${timestamp}-${index}`,
    title,
    title_source: 'heading',
    raw_heading: lines[0],
    description: desc,
    full_text: lines.join('\n').trim(),
    category: 'custom-notes',
    group_name: 'custom',
    tags: ['custom-notes', 'sequence'],
    source: sourceFileName,
    is_custom: true,
    lifecycle: 'temporary',
    created_at: createdAt,
    expires_at: expiresAt,
    expiry_rule: '14_days',
    resources: [],
    confidence: isClean ? 85 : 40,
    confidence_rating: isClean ? 'high' : 'low',
    needs_review: needsReview,
    is_confirmed: !needsReview,
    review_reasons: reviewReasons,
    is_structural_title: false,
    source_line_start: startLine,
    source_line_end: endLine,
    source_lines: [startLine, endLine],
    title_source_line: startLine,
    description_source_lines: [startLine]
  };

  if (process.env.DEBUG_TRACE === '1' || process.env.DEBUG_TRACE === 'true') {
    topicObj._path = 'list_sequence';
    topicObj._flagInput = 'resolvedTitle';
  }

  return topicObj;
}

/**
 * Fallback Path 2: Raw Text Extractor.
 * Never split by sentence. Makes one topic for the whole text (title from filename or first line), flagged needs_review.
 */
export function extractTopicsFromRawText(fullText, sourceFileName = 'uploaded_file', options = {}) {
  const clean = cleanText(fullText || '').trim();
  if (clean.length < 20) return [];

  const timestamp = Date.now();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();

  const fileBaseName = (sourceFileName || '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[_\-]+/g, ' ')
    .trim();

  const rawLines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Requirement 4: prefer a short heading line (under 8 words) when one exists; never use a truncated sentence as a title.
  let candidateTitle = '';

  for (const line of rawLines) {
    const stripped = stripStrayDelimiters(stripMarkdownSyntax(line));
    if (!stripped) continue;

    // Check prefix before colon / dash
    if (stripped.includes(':') || stripped.includes('—') || stripped.includes(' - ')) {
      const prefix = stripStrayDelimiters(stripped.split(/[:—]|\s+-\s+/)[0]);
      const pWords = prefix.split(/\s+/).filter(Boolean);
      if (pWords.length >= 2 && pWords.length < 8 && !/[.!?]$/.test(prefix) && !isNonTopicHeading(prefix)) {
        const lastW = pWords[pWords.length - 1].toLowerCase().replace(/[^a-z]/g, '');
        if (!LIST_PREPOSITIONS.has(lastW)) {
          candidateTitle = prefix;
          break;
        }
      }
    }

    const words = stripped.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length < 8 && !/[.!?]$/.test(stripped) && !stripped.includes('…') && !stripped.includes('...') && !/[.!?]\s+[A-Z]/.test(stripped) && !isNonTopicHeading(stripped) && !isMetaOrAsideLine(stripped)) {
      const lastW = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
      if (!LIST_PREPOSITIONS.has(lastW)) {
        candidateTitle = stripped;
        break;
      }
    }
  }

  // If no short heading line exists, NEVER use a truncated sentence: fallback to domain title or filename
  if (!candidateTitle) {
    const domainTitle = synthesizeDomainTitle(clean, fileBaseName.toLowerCase());
    candidateTitle = domainTitle || fileBaseName || 'Extracted Document';
  }

  const title = toTitleCase(candidateTitle);

  let desc = stripMarkdownSyntax(clean).replace(/\s+/g, ' ').trim();
  if (desc.length > 500) {
    desc = truncateAtWord(desc, 490);
  }
  desc = desc.replace(/[,\s;:–—\-.]+$/, '');
  if (desc.length > 0) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1) + '.';
  }

  const topicObj = {
    id: `custom-raw-${timestamp}-0`,
    title,
    title_source: 'heading',
    raw_heading: rawLines[0] || title,
    description: desc,
    full_text: clean,
    category: 'custom-notes',
    group_name: 'custom',
    tags: ['custom-notes', 'raw-text'],
    source: sourceFileName,
    is_custom: true,
    lifecycle: 'temporary',
    created_at: createdAt,
    expires_at: expiresAt,
    expiry_rule: '14_days',
    resources: [],
    confidence: 70,
    confidence_rating: 'medium',
    needs_review: true,
    is_confirmed: false,
    review_reasons: ['Unverified raw text: user review required'],
    is_structural_title: false,
    source_line_start: 1,
    source_line_end: rawLines.length || 1,
    source_lines: [1, rawLines.length || 1],
    title_source_line: 1,
    description_source_lines: [1]
  };

  if (process.env.DEBUG_TRACE === '1' || process.env.DEBUG_TRACE === 'true') {
    topicObj._path = 'raw_text';
    topicObj._flagInput = 'resolvedTitle';
  }

  return [topicObj];
}

export const CONTENT_PAGE_MIN_CHARS = 150;

/**
 * Structured topic extraction path.
 */
function extractTopicsStructured(fullText, rawSections = [], sourceFileName = 'uploaded_file', options = {}) {
  if (typeof rawSections === 'string') {
    sourceFileName = rawSections;
    rawSections = [];
  }

  const docBaseName = sourceFileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_\-]+/g, ' ')
    .trim();
  const docBaseLower = docBaseName.toLowerCase();

  // Split fullText into indexed lines for true line recording
  const allDocLines = (fullText || '').split(/\r?\n/).map((line, idx) => ({
    lineNum: idx + 1,
    raw: line,
    cleaned: cleanText(line)
  }));

  // Normalize sections and attach structural title metadata if provided
  const slideMetadata = options.slideMetadata || [];
  const normalizedSections = (Array.isArray(rawSections) && rawSections.length > 0 ? rawSections : []).map((sec, idx) => {
    if (typeof sec === 'string') {
      const meta = slideMetadata[idx] || {};
      return {
        text: sec,
        structuralTitle: meta.structuralTitle || null,
        slideNumber: meta.slideNumber || (idx + 1),
        startLine: 1,
        endLine: 1
      };
    } else if (sec && typeof sec === 'object') {
      return {
        text: sec.text || '',
        structuralTitle: sec.structuralTitle || null,
        slideNumber: sec.page || sec.pageNumber || sec.slideNumber || (idx + 1),
        status: sec.status || null,
        startLine: sec.startLine || 1,
        endLine: sec.endLine || 1
      };
    }
    return { text: String(sec), structuralTitle: null, slideNumber: idx + 1, status: null, startLine: 1, endLine: 1 };
  });

  const totalExpectedPages = normalizedSections.length;
  const pageOutcomesMap = new Map();
  function recordPageOutcome(pageNum, outcome, reason = null) {
    pageOutcomesMap.set(pageNum, { page: pageNum, outcome, reason });
  }

  const rawSectionTexts = normalizedSections.map(s => s.text);
  let cleanedSectionTexts = rawSectionTexts.length > 0 ? stripRepeatingBoilerplate(rawSectionTexts) : [];

  // Filter out non-content structural slides (cover, outline, references, closing)
  const validSections = [];
  (cleanedSectionTexts || []).forEach((secText, idx) => {
    const origSec = normalizedSections[idx];
    const pageNum = origSec?.slideNumber || (idx + 1);
    const rawText = origSec ? origSec.text : secText;
    const rawLines = rawText.split('\n').map(l => cleanText(l)).filter(Boolean);
    const lines = secText.split('\n').map(l => cleanText(l)).filter(Boolean);
    const isContentPage = (rawText.trim().length >= CONTENT_PAGE_MIN_CHARS);

    if (origSec?.status === 'notProcessed') {
      recordPageOutcome(pageNum, 'skipped', 'not processed (cancelled or limit)');
      return;
    }
    if (origSec?.status === 'empty' || lines.length === 0) {
      recordPageOutcome(pageNum, 'skipped', 'empty or unreadable');
      return;
    }
    if (isCoverSlide(rawLines) || isCoverSlide(lines)) {
      recordPageOutcome(pageNum, 'skipped', 'cover filter');
      return;
    }
    if (isReferencesSlide(rawLines) || isReferencesSlide(lines)) {
      recordPageOutcome(pageNum, 'skipped', 'references filter');
      return;
    }
    if (isClosingSlide(rawLines) || isClosingSlide(lines)) {
      recordPageOutcome(pageNum, 'skipped', 'closing filter');
      return;
    }
    if (isOutlineLikePage(rawLines) || isOutlineLikePage(lines)) {
      recordPageOutcome(pageNum, 'skipped', 'outline');
      return;
    }
    if (!isContentPage && (isOutlineSlide(rawLines) || isOutlineSlide(lines))) {
      recordPageOutcome(pageNum, 'skipped', 'outline filter');
      return;
    }

    const effectiveLines = lines.length > 0 ? lines : (rawLines.length > 0 ? rawLines : [rawText.trim()]);
    validSections.push({
      index: idx,
      lines: effectiveLines,
      text: effectiveLines.join('\n'),
      rawText: rawText,
      isContentPage,
      structuralTitle: origSec?.structuralTitle || null,
      slideNumber: pageNum,
      startLine: origSec?.startLine || 1,
      endLine: origSec?.endLine || effectiveLines.length
    });
  });

  // Fallback: If raw sections were not provided or all filtered, parse from fullText line by line
  if (validSections.length === 0 && allDocLines.length > 0) {
    let currentSectionLines = [];
    let secStartLine = 1;

    allDocLines.forEach(({ lineNum, raw, cleaned }) => {
      const isHeaderBreak = /^#{1,6}\s+/.test(raw.trim()) || /^---+$/.test(raw.trim());
      if (isHeaderBreak && currentSectionLines.length > 0) {
        const secText = currentSectionLines.map(l => l.cleaned).join('\n');
        const rawLines = currentSectionLines.map(l => l.cleaned).filter(Boolean);
        const secEndLine = currentSectionLines[currentSectionLines.length - 1].lineNum;
        const isContentSec = (secText.trim().length >= CONTENT_PAGE_MIN_CHARS);
        if (rawLines.length > 0 && !isCoverSlide(rawLines) && !isReferencesSlide(rawLines) && !isClosingSlide(rawLines) && !isOutlineLikePage(rawLines) && (isContentSec || !isOutlineSlide(rawLines))) {
          validSections.push({
            index: validSections.length,
            lines: rawLines,
            lineObjects: [...currentSectionLines],
            text: secText,
            rawText: secText,
            isContentPage: isContentSec,
            structuralTitle: null,
            slideNumber: validSections.length + 1,
            startLine: secStartLine,
            endLine: secEndLine
          });
        }
        currentSectionLines = [];
        secStartLine = lineNum;
      }
      if (cleaned) {
        currentSectionLines.push({ lineNum, raw, cleaned });
      }
    });

    if (currentSectionLines.length > 0) {
      const secText = currentSectionLines.map(l => l.cleaned).join('\n');
      const rawLines = currentSectionLines.map(l => l.cleaned).filter(Boolean);
      const secEndLine = currentSectionLines[currentSectionLines.length - 1].lineNum;
      const isContentSec = (secText.trim().length >= CONTENT_PAGE_MIN_CHARS);
      if (rawLines.length > 0 && !isCoverSlide(rawLines) && !isReferencesSlide(rawLines) && !isClosingSlide(rawLines) && !isOutlineLikePage(rawLines) && (isContentSec || !isOutlineSlide(rawLines))) {
        validSections.push({
          index: validSections.length,
          lines: rawLines,
          lineObjects: [...currentSectionLines],
          text: secText,
          rawText: secText,
          isContentPage: isContentSec,
          structuralTitle: null,
          slideNumber: validSections.length + 1,
          startLine: secStartLine,
          endLine: secEndLine
        });
      }
    }
  }

  // Step 3: Group into conceptual units (merge continuations or tiny fragments)
  const conceptualUnits = [];
  let currentGroup = null;

  validSections.forEach(sec => {
    let firstLine = sec.structuralTitle || sec.lines[0] || '';
    const cleanHead = cleanTitle(firstLine);
    const hasDelimiter = /[:–—\-]/.test(firstLine);
    const headPrefix = hasDelimiter ? cleanTitle(firstLine.split(/[:–—\-]/)[0]).toLowerCase() : '';

    // Check if this slide is a continuation of previous slide (e.g. shared prefix like "literature review:")
    if (currentGroup && currentGroup.prefix && currentGroup.prefix === headPrefix && headPrefix.length > 5 && !firstLine.startsWith('#')) {
      currentGroup.sections.push(sec);
      currentGroup.allLines.push(...sec.lines);
      if (sec.lineObjects) currentGroup.allLineObjects.push(...sec.lineObjects);
      currentGroup.endLine = sec.endLine;
      if (!currentGroup.structuralTitle && sec.structuralTitle) {
        currentGroup.structuralTitle = sec.structuralTitle;
      }
    } else {
      if (currentGroup) conceptualUnits.push(currentGroup);
      currentGroup = {
        prefix: headPrefix.length > 5 && !firstLine.startsWith('#') ? headPrefix : '',
        primaryHeader: cleanHead,
        rawHeader: firstLine,
        structuralTitle: sec.structuralTitle || null,
        sections: [sec],
        allLines: [...sec.lines],
        allLineObjects: sec.lineObjects ? [...sec.lineObjects] : [],
        startLine: sec.startLine,
        endLine: sec.endLine
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
    const lineObjs = unit.allLineObjects || [];
    const unitText = lines.join(' ');
    const isContentUnit = unit.sections.some(s => s.isContentPage) || (unitText.trim().length >= CONTENT_PAGE_MIN_CHARS);

    let forceAsTopic = false;
    const unitReviewReasons = [];

    // Quality gate: require substantive conceptual content
    const tokens = tokenize(unitText);
    if (tokens.length < 6 && unitText.trim().length < 35) {
      if (!isContentUnit) {
        unit.sections.forEach(s => {
          recordPageOutcome(s.slideNumber, 'skipped', 'quality gate: insufficient substantive content');
        });
        return;
      }
      forceAsTopic = true;
      unitReviewReasons.push('quality gate: insufficient substantive content');
    }

    let candidateTitle = '';
    let isStructural = false;
    let titleLineNumber = unit.startLine;
    let rawHeadingCandidate = unit.rawHeader || '';

    // Requirement: If structural title exists from slide XML placeholder, use it directly!
    if (unit.structuralTitle && unit.structuralTitle.trim().length >= 3) {
      candidateTitle = cleanTitle(unit.structuralTitle);
      isStructural = true;
    } else {
      // Fallback: heading-detection heuristics from first non-bullet lines
      let prevTextLine = '';
      for (let i = 0; i < Math.min(4, lines.length); i++) {
        const l = cleanTitle(lines[i]);
        const rawLine = lineObjs[i]?.raw || lines[i];
        if (/^[•\-*·]\s*/.test(lines[i].trim())) continue;
        if (/^\d+[\.\)]?$/.test(l)) continue;
        const isBrandCasing = /^[a-z][A-Z]/.test(l);
        if (prevTextLine && /^[a-z]/.test(l) && !isBrandCasing) {
          prevTextLine = l;
          continue;
        }
        prevTextLine = l;
        if (
          l.length >= 4 &&
          l.length <= 60 &&
          !l.endsWith('.') &&
          !isNonTopicHeading(l) &&
          !isTruncatedOrNonTerminal(l) &&
          !isStructuralOrAllCaps(l)
        ) {
          candidateTitle = l;
          rawHeadingCandidate = rawLine;
          if (lineObjs[i]) titleLineNumber = lineObjs[i].lineNum;
          break;
        }
      }
      if (!candidateTitle && lines.length > 0) {
        const firstCandidate = lines.find(line => {
          const c = cleanTitle(line);
          return c.length >= 4 && !/^\d+[\.\)]?$/.test(c);
        }) || lines[0];
        const rawFirst = cleanTitle(firstCandidate);
        if (rawFirst.length >= 4 && !/^\d+[\.\)]?$/.test(rawFirst)) {
          candidateTitle = rawFirst;
          rawHeadingCandidate = lineObjs[0]?.raw || lines[0];
          if (lineObjs[0]) titleLineNumber = lineObjs[0].lineNum;
        }
      }
    }

    if (!candidateTitle && isContentUnit) {
      const rawFirst = cleanCandidateTitle(lines[0] || '');
      const slideNum = unit.sections[0]?.slideNumber || 1;
      candidateTitle = (rawFirst && rawFirst.length >= 4 && !isNonTopicHeading(rawFirst)) ? rawFirst : `Untitled slide ${slideNum}`;
      forceAsTopic = true;
      unitReviewReasons.push('title check: no candidate heading found');
    }

    // REQUIREMENT 2: Reject H1 document titles! (e.g. single `# ` in documents with subsections, or doc-level title)
    const hasSubSections = /^\s*#{2,6}\s+/m.test(fullText || '');
    const isDocHeadingH1 = /^#\s+[^#]/.test(rawHeadingCandidate.trim()) || (rawHeadingCandidate.trim().startsWith('# ') && !rawHeadingCandidate.trim().startsWith('## '));
    const isGenericDocTitle = /^(?:internal build-and-test order|roadmap|project roadmap|milestones overview|table of contents|overview|documentation)$/i.test(candidateTitle.toLowerCase());

    if (hasSubSections && isDocHeadingH1) {
      unit.sections.forEach(s => {
        recordPageOutcome(s.slideNumber, 'skipped', 'document header');
      });
      return;
    }

    if (isGenericDocTitle) {
      if (!isContentUnit) {
        unit.sections.forEach(s => {
          recordPageOutcome(s.slideNumber, 'skipped', 'title check: generic title');
        });
        return;
      }
      forceAsTopic = true;
      unitReviewReasons.push('title check: generic title');
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
    let titleSource = 'heading';
    let needsReview = scoreResult.needsReview || forceAsTopic;
    let confidence = scoreResult.confidence;
    let confidenceRating = scoreResult.confidence_rating;
    let reviewReasons = [...scoreResult.reviewReasons, ...unitReviewReasons];
    let _path = 'raw_text_fallback';
    let _flagInput = 'resolvedTitle';

    if (!forceAsTopic && scoreResult.isHighConfidence && !isDocTitleRepeat && !isNonTopicHeading(candidateTitle)) {
      finalTitle = truncateAtWord(toTitleCase(cleanCandidateTitle(candidateTitle)), 45);
      titleSource = 'heading';
      if (isCleanHeading(finalTitle) && !isNonTopicHeading(finalTitle)) {
        needsReview = false;
        confidence = Math.max(75, scoreResult.confidence);
        confidenceRating = 'high';
        reviewReasons = [...unitReviewReasons];
      } else {
        needsReview = true;
        confidence = Math.min(scoreResult.confidence, 40);
        confidenceRating = 'low';
        reviewReasons = [...scoreResult.reviewReasons, ...unitReviewReasons];
      }
      _path = 'high_confidence_heading';
      _flagInput = 'resolvedTitle';
    } else {
      // Low confidence or flawed raw title: synthesize domain recommendation
      const domainSynthesized = synthesizeDomainTitle(unitText, docBaseLower, candidateTitle);
      const synthScore = domainSynthesized
        ? scoreCandidateTitle(domainSynthesized, { isStructuralTitle: false, unitText, docBaseLower })
        : null;

      if (domainSynthesized && synthScore && synthScore.isHighConfidence) {
        finalTitle = truncateAtWord(toTitleCase(cleanCandidateTitle(domainSynthesized)), 45);
        titleSource = 'suggested';
        _path = 'domain_synthesized';
        _flagInput = 'resolvedTitle';
        if (isStructuralOrAllCaps(candidateTitle) || isStructural) {
          // Tier 1: Generic structural heading replaced by domain recommendation
          needsReview = false;
          confidence = synthScore.confidence;
          confidenceRating = synthScore.confidence_rating;
          reviewReasons = [...synthScore.reviewReasons, ...unitReviewReasons];
          if (!reviewReasons.includes('Draft heading: title suggested from body')) {
            reviewReasons.push('Draft heading: title suggested from body');
          }
        } else {
          // Tier 2: Synthesized title evaluated by quality criteria
          const evalResult = evaluateSynthesizedTitle(finalTitle, unitText, lines);
          if (evalResult.needsReview) {
            needsReview = true;
            confidence = Math.min(synthScore.confidence, 65);
            confidenceRating = 'medium';
            reviewReasons = [...synthScore.reviewReasons, ...unitReviewReasons];
            if (!reviewReasons.includes('Draft heading: title suggested from body')) {
              reviewReasons.push('Draft heading: title suggested from body');
            }
          } else {
            needsReview = false;
            confidence = synthScore.confidence;
            confidenceRating = synthScore.confidence_rating;
            reviewReasons = [...synthScore.reviewReasons, ...unitReviewReasons];
            if (!reviewReasons.includes('Draft heading: title suggested from body')) {
              reviewReasons.push('Draft heading: title suggested from body');
            }
          }
        }
      } else {
        let fallback = candidateTitle;
        if (isNonTopicHeading(fallback)) {
          fallback = fallback
            .replace(/^(?:step|task|activity|part|phase)\s*\d+[\s:.\-]\s*/i, '')
            .replace(/^\d+[\.\)]\s*/, '')
            .replace(/^(?:wait for|click on|select the|open the|close the)\s*/i, '');
        }
        finalTitle = truncateAtWord(cleanCandidateTitle(fallback || candidateTitle), 45);
        titleSource = 'heading';
        // Invariant: evaluate the exact resolved string that becomes emitted title!
        if (isCleanHeading(finalTitle) && !isNonTopicHeading(finalTitle)) {
          finalTitle = toTitleCase(finalTitle);
          needsReview = false;
          confidence = Math.max(75, scoreResult.confidence);
          confidenceRating = 'high';
          reviewReasons = [...unitReviewReasons];
          _path = 'clean_heading_fallback';
          _flagInput = 'resolvedTitle';
        } else {
          needsReview = true;
          confidence = Math.min(scoreResult.confidence, 40);
          confidenceRating = 'low';
          reviewReasons = [...scoreResult.reviewReasons, ...unitReviewReasons];
          if (!reviewReasons.includes('Unverified raw text: user rewrite recommended')) {
            reviewReasons.push('Unverified raw text: user rewrite recommended');
          }
          _path = 'raw_text_fallback';
          _flagInput = 'resolvedTitle';
        }
      }
    }

    if (!needsReview) {
      finalTitle = truncateTitle(toTitleCase(cleanCandidateTitle(finalTitle)), 70);
    } else {
      finalTitle = truncateTitle(cleanCandidateTitle(finalTitle), 70);
    }

    // Dedup check
    if (seenTitles.has(finalTitle.toLowerCase()) || finalTitle.length < 4) {
      if (!isContentUnit) {
        const reason = seenTitles.has(finalTitle.toLowerCase()) ? 'title dedup: duplicate title' : 'title check: title too short';
        unit.sections.forEach(s => {
          recordPageOutcome(s.slideNumber, 'skipped', reason);
        });
        return;
      }

      let fallback = cleanCandidateTitle(unit.allLines[0] || '');
      const slideNum = unit.sections[0]?.slideNumber || 1;
      if (!fallback || fallback.length < 4 || isNonTopicHeading(fallback) || /^Page(?:\s+\d+)?$/i.test(fallback)) {
        fallback = `Untitled slide ${slideNum}`;
      }
      if (seenTitles.has(fallback.toLowerCase())) {
        fallback = `Untitled slide ${slideNum}`;
      }
      const resolvedTitle = truncateTitle(fallback, 70);

      if (seenTitles.has(resolvedTitle.toLowerCase()) || /^Untitled slide/i.test(resolvedTitle)) {
        const failedReason = seenTitles.has(finalTitle.toLowerCase()) ? 'title dedup: duplicate title' : 'title check: title too short';
        if (!reviewReasons.includes(failedReason)) {
          reviewReasons.push(failedReason);
        }
        needsReview = true;
        titleSource = 'heading';
        _path = /^Untitled slide/i.test(resolvedTitle) ? 'untitled_slide' : 'dedup_fallback';
        _flagInput = 'resolvedTitle';
      } else if (isCleanHeading(resolvedTitle)) {
        // Fallback is clean and unique: fix dedup false positive
        needsReview = false;
        confidence = Math.max(75, confidence);
        confidenceRating = 'high';
        reviewReasons = reviewReasons.filter(r => r !== 'title dedup: duplicate title' && r !== 'title check: title too short' && r !== 'Draft heading: title suggested from body');
        titleSource = 'heading';
        _path = 'dedup_fallback';
        _flagInput = 'resolvedTitle';
      } else {
        if (!reviewReasons.includes('Unverified raw text: user rewrite recommended')) {
          reviewReasons.push('Unverified raw text: user rewrite recommended');
        }
        needsReview = true;
        titleSource = 'heading';
        _path = 'dedup_fallback';
        _flagInput = 'resolvedTitle';
      }
      finalTitle = resolvedTitle;
    }
    if (/^Page(?:\s+\d+)?$/i.test(finalTitle.trim())) {
      const slideNum = unit.sections[0]?.slideNumber || 1;
      finalTitle = `Untitled slide ${slideNum}`;
      needsReview = true;
      _path = 'untitled_slide';
      _flagInput = 'resolvedTitle';
    }

    if (!isCleanHeading(finalTitle)) {
      needsReview = true;
    }
    seenTitles.add(finalTitle.toLowerCase());

    // Step 5: Synthesize Description (1-2 complete sentences, max 175 chars, ending with period)
    let desc = '';
    const descLineNumbers = [];

    const sentences = [];
    lines.forEach((l, lIdx) => {
        if (isMetaOrAsideLine(l)) return;
        const rawTrim = l.trim();
        if (rawTrim.startsWith('|') || /^\|.*\|$/.test(rawTrim) || /^[|\s\-:]+$/.test(rawTrim)) return;

        const cleanedMd = stripMarkdownSyntax(l);
        const cleaned = cleanTitle(cleanedMd);
        if (cleaned === candidateTitle || cleaned.length < 10) return;
        if (/^(?:paper|method|reported result|table|figure)\b/i.test(cleaned)) return;
        if (/^\d+[\.\)]?$/.test(cleaned)) return;
        if (isMetaOrAsideLine(cleaned)) return;

        // Clean out leading "Layer X (Name): " or "Stage X: " from description lines
        const strippedLine = cleanedMd
          .replace(/^(?:stage|phase|layer|step|part|level)\s*\d+[\s:–—\-]*(?:\([^)]*\))?[:\s–—\-]*/i, '')
          .trim();

        if (/^depends\s+(?:on|upon)\b/i.test(strippedLine)) return;

        const sList = strippedLine.split(/(?<=[.!?])\s+/);
        let usedLine = false;
        sList.forEach(s => {
          const trimmed = stripMarkdownSyntax(s.trim());
          if (trimmed.length > 15 && !trimmed.endsWith(':') && !isMetaOrAsideLine(trimmed) && !/^depends\s+(?:on|upon)\b/i.test(trimmed)) {
            sentences.push(trimmed);
            usedLine = true;
          }
        });
        if (usedLine && lineObjs[lIdx]) {
          descLineNumbers.push(lineObjs[lIdx].lineNum);
        }
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
          .filter((l, lIdx) => {
            const rawTrim = l.trim();
            if (rawTrim.startsWith('|') || /^\|.*\|$/.test(rawTrim) || /^[|\s\-:]+$/.test(rawTrim)) return false;
            if (isMetaOrAsideLine(l) || /^depends\s+(?:on|upon)\b/i.test(l)) return false;
            const stripped = stripMarkdownSyntax(l).replace(/^(?:stage|phase|layer|step|part|level)\s*\d+[\s:–—\-]*(?:\([^)]*\))?[:\s–—\-]*/i, '').trim();
            if (/^depends\s+(?:on|upon)\b/i.test(stripped)) return false;
            return cleanTitle(stripMarkdownSyntax(l)) !== candidateTitle && l.trim().length > 10;
          })
          .map((l, lIdx) => {
            if (lineObjs[lIdx]) descLineNumbers.push(lineObjs[lIdx].lineNum);
            return stripMarkdownSyntax(l).replace(/^(?:stage|phase|layer|step|part|level)\s*\d+[\s:–—\-]*(?:\([^)]*\))?[:\s–—\-]*/i, '');
          })
          .join(' ')
          .replace(/^[•\-*·\d\.\)]\s*/gm, '')
          .replace(/\s+/g, ' ')
          .trim();
        desc = fallbackSubstantive || '';
      }

    // Require descriptions to start with a capital letter (capitalize or reject)
    if (desc) {
      desc = desc.trim();
      if (/^[a-z]/.test(desc)) {
        desc = desc.charAt(0).toUpperCase() + desc.slice(1);
      }
      if (!/^[A-Z]/.test(desc)) {
        if (!isContentUnit) {
          unit.sections.forEach(s => {
            recordPageOutcome(s.slideNumber, 'skipped', 'description check: does not start with capital');
          });
          return;
        }
        if (!reviewReasons.includes('description check: non-standard casing')) {
          reviewReasons.push('description check: non-standard casing');
        }
        desc = 'Overview of ' + finalTitle + '.';
      }
    } else {
      if (!isContentUnit) {
        unit.sections.forEach(s => {
          recordPageOutcome(s.slideNumber, 'skipped', 'description check: empty description');
        });
        return;
      }
      if (!reviewReasons.includes('description check: empty description')) {
        reviewReasons.push('description check: empty description');
      }
      const rawText = stripMarkdownSyntax(unitText).replace(/^[^a-zA-Z]+/, '').trim();
      if (rawText.length < 20) {
        desc = 'Overview of ' + finalTitle + '.';
      } else {
        const rawPreview = rawText.slice(0, 150).replace(/[,\s;:–—\-.]+$/, '') + '.';
        desc = rawPreview.charAt(0).toUpperCase() + rawPreview.slice(1);
      }
    }

    // REQUIREMENT 2: Reject candidates whose description starts with "depends on" or is pure dependency/ordering note
    if (/^depends\s+(?:on|upon)\b/i.test(desc) || /^(?:pure\s+dependency|dependency\s+note|ordering\s+note|prerequisites?\s+only)\b/i.test(desc)) {
      if (!isContentUnit) {
        unit.sections.forEach(s => {
          recordPageOutcome(s.slideNumber, 'skipped', 'description check: dependency or ordering note');
        });
        return;
      }
      if (!reviewReasons.includes('description check: dependency or ordering note')) {
        reviewReasons.push('description check: dependency or ordering note');
      }
    }

    if (desc.length > 175) {
      const truncated = truncateAtWord(desc, 170);
      desc = truncated.replace(/[,\s;:–—\-.]+$/, '') + '.';
    } else if (desc.length > 0) {
      desc = desc.replace(/[,\s;:–—\-.]+$/, '') + '.';
    }

    // Step 5b: Evaluate Description Quality & Body Presence
    const descScore = scoreCandidateDescription(desc);
    if (!desc || desc.trim().length === 0 || descScore.confidence < 30) {
      if (!isContentUnit) {
        unit.sections.forEach(s => {
          recordPageOutcome(s.slideNumber, 'skipped', 'description quality gate: low confidence');
        });
        return;
      }
      if (!reviewReasons.includes('description quality gate: low confidence')) {
        reviewReasons.push('description quality gate: low confidence');
      }
      if (!desc || desc.trim().length === 0) {
        desc = `Study notes and content for ${finalTitle}.`;
      }
    }

    if (descScore.needsReview) {
      confidence = Math.min(confidence, descScore.confidence);
      confidenceRating = descScore.confidence_rating;
      descScore.reviewReasons.forEach(r => {
        if (!reviewReasons.includes(r)) reviewReasons.push(r);
      });
    }

    // Step 6: Tags & Categories (No default built-in category injection on custom uploads)
    const tags = extractTopKeywords(stripMarkdownSyntax(unitText), 4);
    const enrichedTags = tags.length > 0 ? [...tags] : ['custom-notes'];
    if (!enrichedTags.includes('custom-notes')) {
      enrichedTags.unshift('custom-notes');
    }

    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();
    const fullTextOfUnit = unit.sections.map(s => s.rawText || s.text).join('\n\n').trim();
    const primarySection = unit.sections[0];

    // Requirement 3(d): needs_review must strictly equal "has at least one title/content reason".
    // Description-only reasons (verb, <8 words, casing, description quality gate) must not set needs_review.
    // Otherwise keep reason "Draft heading: title suggested from body" as an informational reason that does NOT set needs_review.
    const titleOrContentReasons = reviewReasons.filter(r => {
      if (!needsReview && r === 'Draft heading: title suggested from body') {
        return false;
      }
      return isTitleOrContentReason(r);
    });
    const finalNeedsReview = needsReview || titleOrContentReasons.length > 0;

    const topicObj = {
      id: `custom-${timestamp}-${uIdx}`,
      title: finalTitle,
      title_source: titleSource,
      raw_heading: candidateTitle,
      confidence,
      confidence_rating: confidenceRating,
      needs_review: finalNeedsReview,
      is_confirmed: !finalNeedsReview,
      review_reasons: reviewReasons,
      is_structural_title: isStructural,
      description: desc,
      full_text: fullTextOfUnit,
      group_name: 'custom',
      category: 'custom-notes',
      tags: enrichedTags,
      source: sourceFileName,
      page: primarySection.slideNumber,
      slideNumber: primarySection.slideNumber,
      is_custom: true,
      lifecycle: 'temporary',
      created_at: createdAt,
      expires_at: expiresAt,
      expiry_rule: '14_days',
      resources: [],
      // True source lines recorded during parsing:
      source_line_start: unit.startLine,
      source_line_end: unit.endLine,
      source_lines: [unit.startLine, unit.endLine],
      title_source_line: titleLineNumber,
      description_source_lines: descLineNumbers.length > 0 ? descLineNumbers : [unit.startLine + 1]
    };

    if (process.env.DEBUG_TRACE === '1' || process.env.DEBUG_TRACE === 'true') {
      topicObj._path = _path;
      topicObj._flagInput = _flagInput;
    }

    candidateTopics.push(topicObj);

    recordPageOutcome(primarySection.slideNumber, 'topic', null);
    unit.sections.slice(1).forEach(s => {
      recordPageOutcome(s.slideNumber, 'merged', `merged into "${finalTitle}"`);
    });
  });

  // Verify that every expected section page has an outcome
  for (const s of normalizedSections) {
    if (!pageOutcomesMap.has(s.slideNumber)) {
      console.error(`[TOPIC_EXTRACTOR] Section page ${s.slideNumber} has no outcome recorded: unaccounted: extractor bug`);
      recordPageOutcome(s.slideNumber, 'skipped', 'unaccounted: extractor bug');
    }
  }

  const pageOutcomes = Array.from(pageOutcomesMap.values()).sort((a, b) => a.page - b.page);
  candidateTopics.pageOutcomes = pageOutcomes;
  return candidateTopics;
}

/**
 * Local NLP topic synthesis with fallback ladder: structured -> list/sequence -> raw text.
 * Switches path when structured result has coverage below 60%, or no topics.
 * Keeps structured path unchanged for files it already handles well.
 * 
 * @param {string} fullText 
 * @param {string[]} [rawSections] Optional array of slides, pages, or frames
 * @param {string} sourceFileName
 * @returns {Array<{ id: string, title: string, description: string, category: string, group_name: string, tags: string[], source: string, is_custom: boolean }>}
 */
export function extractTopicsLocally(fullText, rawSections = [], sourceFileName = 'uploaded_file', options = {}) {
  if (typeof rawSections === 'string') {
    options = sourceFileName && typeof sourceFileName === 'object' ? sourceFileName : options;
    sourceFileName = rawSections;
    rawSections = [];
  }

  const cleaned = cleanText(fullText || '').trim();
  // Requirement 4: Empty or under 20 characters returns empty to trigger generic error in LibraryScreen
  if (cleaned.length < 20) {
    console.log(`[TOPIC_COVERAGE] ${sourceFileName || 'document'}: 0.0% coverage (text under 20 characters)`);
    const emptyResult = [];
    if (Array.isArray(rawSections) && rawSections.length > 0) {
      const outcomes = rawSections.map((sec, idx) => {
        const pageNum = (sec && typeof sec === 'object' ? (sec.page || sec.pageNumber || sec.slideNumber) : null) || (idx + 1);
        const status = sec && typeof sec === 'object' ? sec.status : null;
        const reason = status === 'notProcessed' ? 'not processed (cancelled or limit)' : 'empty or unreadable';
        return { page: pageNum, outcome: 'skipped', reason };
      });
      emptyResult.pageOutcomes = outcomes;
      extractTopicsLocally.lastPageOutcomes = outcomes;
    }
    return emptyResult;
  }

  // Path 1: Structured (keep unchanged for files it already handles well)
  const structuredTopics = extractTopicsStructured(fullText, rawSections, sourceFileName, options);
  const structuredCoverage = computeExtractionCoverage(fullText, structuredTopics);
  console.log(`[TOPIC_COVERAGE] Path: structured | Source: ${sourceFileName} | Topics: ${structuredTopics.length} | Coverage: ${(structuredCoverage * 100).toFixed(1)}%`);

  extractTopicsLocally.lastPageOutcomes = structuredTopics.pageOutcomes || [];

  if (options.forcePath === 'structured') {
    return structuredTopics;
  }

  // Preserve structured path for multi-section documents/decks with explicit sections that structured already handles well
  if (Array.isArray(rawSections) && rawSections.length >= 2 && structuredTopics.length >= 2) {
    return structuredTopics;
  }

  // Requirement 1: Only fall back from structured path when structured returns 0 topics,
  // or when document is short (under 600 characters of cleaned text, or images under 1200 characters) AND coverage is under 60%.
  // For longer documents with at least 2 structured topics, keep structured result.
  const isImageOrMedia = /\.(png|jpe?g|webp|bmp|gif)$/i.test(sourceFileName || '');
  const isShort = cleaned.length < 600 || (isImageOrMedia && cleaned.length < 1200);
  const shouldFallback = structuredTopics.length === 0 || (isShort && structuredCoverage < 0.60);

  if (!shouldFallback) {
    return structuredTopics;
  }

  // Path 2: List / Sequence
  const listTopics = extractTopicsFromListOrSequence(fullText, sourceFileName, options);
  const listCoverage = computeExtractionCoverage(fullText, listTopics);
  console.log(`[TOPIC_COVERAGE] Path: list/sequence | Source: ${sourceFileName} | Topics: ${listTopics.length} | Coverage: ${(listCoverage * 100).toFixed(1)}%`);

  if (listTopics.length > 0 && (listCoverage >= 0.50 || listCoverage >= structuredCoverage)) {
    listTopics.pageOutcomes = structuredTopics.pageOutcomes || [];
    extractTopicsLocally.lastPageOutcomes = listTopics.pageOutcomes;
    return listTopics;
  }

  // Path 3: Raw Text
  const rawTopics = extractTopicsFromRawText(fullText, sourceFileName, options);
  const rawCoverage = computeExtractionCoverage(fullText, rawTopics);
  console.log(`[TOPIC_COVERAGE] Path: raw text | Source: ${sourceFileName} | Topics: ${rawTopics.length} | Coverage: ${(rawCoverage * 100).toFixed(1)}%`);

  if (rawTopics.length > 0) {
    rawTopics.pageOutcomes = structuredTopics.pageOutcomes || [];
    extractTopicsLocally.lastPageOutcomes = rawTopics.pageOutcomes;
    return rawTopics;
  }

  // Return highest non-empty fallback if under 60%
  if (listTopics.length > 0 && listCoverage >= structuredCoverage) {
    listTopics.pageOutcomes = structuredTopics.pageOutcomes || [];
    extractTopicsLocally.lastPageOutcomes = listTopics.pageOutcomes;
    return listTopics;
  }
  if (structuredTopics.length > 0) return structuredTopics;
  return [];
}

/**
 * Optional BYOK (Bring-Your-Own-Key) Gemini API topic extraction.
 * Dynamically resolves newest flash model and caches choice in memory.
 * 
 * Only sends raw extracted text, NEVER files.
 * 
 * @param {string} fullText 
 * @param {string} apiKey Gemini API Key
 * @param {string} sourceFileName 
 * @returns {Promise<Array<{ id: string, title: string, description: string, category: string, group_name: string, tags: string[], source: string, is_custom: boolean }>>}
 */
export async function extractTopicsWithGemini(fullText, apiKey, sourceFileName = 'uploaded_file', options = {}) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required for BYOK extraction.');
  }

  const fetchFn = options.fetch || globalThis.fetch;
  const modelName = await resolveFlashModel(apiKey, fetchFn);

  // Truncate raw text to 14,000 characters to stay lightweight and fast
  const truncatedText = (fullText || '').slice(0, 14000);

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey.trim()
    },
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
    let plainMsg = `Gemini API error (${response.status})`;
    if (response.status === 400) plainMsg = 'Invalid Gemini API key or bad request (400).';
    else if (response.status === 404) plainMsg = `Gemini model endpoint "${modelName}" not found (404).`;
    else if (response.status === 429) plainMsg = 'Gemini API quota exceeded or rate limit reached (429).';
    const err = new Error(plainMsg);
    err.status = response.status;
    throw err;
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
    const cleanDesc = truncateAtWord((item.description || '').trim(), 175).replace(/[,\s;:–—\-.]+$/, '');
    const finalDesc = cleanDesc ? `${cleanDesc}.` : '';

    const topicObj = {
      id: `custom-gemini-${timestamp}-${idx}`,
      title: truncateTitle(item.title || 'Untitled Topic', 70),
      title_source: 'suggested',
      description: finalDesc,
      full_text: item.full_text || item.description || '',
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

    if (process.env.DEBUG_TRACE === '1' || process.env.DEBUG_TRACE === 'true') {
      topicObj._path = 'gemini_byok';
      topicObj._flagInput = 'resolvedTitle';
    }

    return topicObj;
  });
}

/**
 * Extracts candidate study topics locally from an extractor result or raw string.
 * Unifies section extraction (rawText, rawSections) for LibraryScreen and tests.
 * 
 * @param {string|{ text?: string, rawPages?: string[], rawSlides?: string[], rawFrames?: string[] }} extractedData
 * @param {string} [fileName='']
 * @returns {Promise<Array>}
 */
export async function extractTopicsFromSections(extractedData, fileName = '') {
  const rawText = typeof extractedData === 'string' ? extractedData : (extractedData?.text || '');
  const rawSections = extractedData?.pages || extractedData?.rawPages || extractedData?.rawSlides || extractedData?.rawFrames || [];
  const topics = await extractTopicsLocally(rawText, rawSections, fileName);
  if (!topics.pageOutcomes && extractTopicsLocally.lastPageOutcomes) {
    topics.pageOutcomes = extractTopicsLocally.lastPageOutcomes;
  }
  return topics;
}

/**
 * Formats an extraction warning message from pageOutcomes.
 * Returns null if no pages were skipped.
 * 
 * @param {Array<{ page: number, outcome: string, reason: string | null }>} pageOutcomes
 * @returns {string | null}
 */
export function buildExtractionWarning(pageOutcomes) {
  if (!Array.isArray(pageOutcomes) || pageOutcomes.length === 0) return null;
  const skipped = pageOutcomes.filter(p => p && p.outcome === 'skipped');
  if (skipped.length === 0) return null;

  // Group skipped pages by reason
  const byReason = new Map();
  skipped.forEach(({ page, reason }) => {
    const r = (reason || 'non-content').trim();
    if (!byReason.has(r)) byReason.set(r, []);
    byReason.get(r).push(page);
  });

  const parts = [];
  byReason.forEach((pages, reason) => {
    const sorted = [...pages].sort((a, b) => a - b);
    const label = sorted.length === 1 ? `Page ${sorted[0]} was` : `Pages ${sorted.join(', ')} were`;
    parts.push(`${label} skipped: ${reason}`);
  });

  return parts.join('. ');
}

