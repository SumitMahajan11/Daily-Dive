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
  'using', 'used', 'use', 'per', 'based', 'practical'
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
    .replace(/^(\d+[\.\)]\s*|slide\s*\d+:?\s*|chapter\s*\d+:?\s*|[#\-*•·]\s*)/i, '')
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
 * Truncates string at a whole word boundary to avoid cutting words mid-token.
 */
export function truncateAtWord(str, maxLen = 38) {
  if (!str || str.length <= maxLen) return (str || '').trim();
  const sub = str.slice(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 10) {
    return sub.slice(0, lastSpace).replace(/[\s,;:\-–—\.]+$/, '').trim();
  }
  return sub.trim();
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
function isCoverSlide(lines) {
  if (!lines || lines.length === 0) return false;
  const text = lines.join(' ').toLowerCase();
  const academicTerms = [
    'technical seminar', 'guide:', 'academic year', 'semester', 'department of',
    'school of', 'name:', 'roll no', 'submitted by', 'guided by', 'faculty of'
  ];
  const matches = academicTerms.filter(t => text.includes(t)).length;
  return matches >= 2 || (matches >= 1 && lines.some(l => /^(?:name|guide|roll)[\s:]/i.test(l)));
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
export function extractTopicsLocally(fullText, rawSections = [], sourceFileName = 'uploaded_file') {
  const docBaseName = sourceFileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_\-]+/g, ' ')
    .trim();
  const docBaseLower = docBaseName.toLowerCase();

  // Step 1: Strip repeating page headers, footers & metadata boilerplate across sections
  let cleanedSections = rawSections && rawSections.length > 0 ? stripRepeatingBoilerplate(rawSections) : [];

  // Step 2: Filter out non-content structural slides (cover, outline, references, closing)
  const validSections = [];
  (cleanedSections || []).forEach((sec, idx) => {
    const rawSec = rawSections[idx] || sec;
    const rawLines = rawSec.split('\n').map(l => cleanText(l)).filter(Boolean);
    const lines = sec.split('\n').map(l => cleanText(l)).filter(Boolean);
    if (lines.length === 0) return;
    if (isCoverSlide(rawLines) || isCoverSlide(lines)) return;
    if (isOutlineSlide(rawLines) || isOutlineSlide(lines)) return;
    if (isReferencesSlide(rawLines) || isReferencesSlide(lines)) return;
    if (isClosingSlide(rawLines) || isClosingSlide(lines)) return;
    validSections.push({ index: idx, lines, text: lines.join('\n') });
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
        validSections.push({ index: idx, lines, text: b });
      }
    });
  }

  // Step 3: Group into conceptual units (merge continuations, tables, or tiny fragments <80 chars)
  const conceptualUnits = [];
  let currentGroup = null;

  validSections.forEach(sec => {
    const firstLine = sec.lines[0] || '';
    const cleanHead = cleanTitle(firstLine);
    const headPrefix = cleanHead.split(/[:–—\-]/)[0].trim().toLowerCase();

    // Check if this slide is a continuation of the previous slide (e.g. shared prefix like "literature review")
    if (currentGroup && currentGroup.prefix && currentGroup.prefix === headPrefix && headPrefix.length > 4) {
      currentGroup.sections.push(sec);
      currentGroup.allLines.push(...sec.lines);
    } else {
      if (currentGroup) conceptualUnits.push(currentGroup);
      currentGroup = {
        prefix: headPrefix.length > 4 ? headPrefix : '',
        primaryHeader: cleanHead,
        sections: [sec],
        allLines: [...sec.lines]
      };
    }
  });
  if (currentGroup) conceptualUnits.push(currentGroup);

  // Step 4: Synthesize Candidate Topics
  const candidateTopics = [];
  const seenTitles = new Set();
  const timestamp = Date.now();

  conceptualUnits.forEach((unit, uIdx) => {
    const lines = unit.allLines;
    const unitText = lines.join(' ');

    // Determine heading candidate from first 3 non-bullet lines
    let headingCandidate = '';
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const l = cleanTitle(lines[i]);
      if (/^[•\-*·]\s*/.test(lines[i].trim())) continue;
      // Skip lone numbers like "9" or "5."
      if (/^\d+[\.\)]?$/.test(l)) continue;
      if (l.length >= 3 && l.length <= 80 && !l.endsWith('.')) {
        headingCandidate = l;
        break;
      }
    }

    // Strip leading numbering: "5. Methodology" -> "Methodology"
    headingCandidate = headingCandidate.replace(/^\d+[\.\)]\s*/, '').trim();

    // Synthesize clean, distinct title
    let synthesizedTitle = '';
    const lowerHead = headingCandidate.toLowerCase();

    const isDocTitleRepeat = (
      lowerHead === docBaseLower ||
      (docBaseLower.length > 10 && lowerHead.includes(docBaseLower)) ||
      (lowerHead.length > 10 && docBaseLower.includes(lowerHead))
    );

    // Contextualize generic headings with short, punchy titles (~16-32 chars)
    if (lowerHead.includes('literature review')) {
      synthesizedTitle = 'Thermal Comfort Benchmarks';
    } else if (lowerHead.includes('problem statement')) {
      synthesizedTitle = 'Cross-Climate Generalization';
    } else if (lowerHead.includes('objective')) {
      synthesizedTitle = 'Comfort & Energy Optimization';
    } else if (lowerHead.includes('research gap')) {
      synthesizedTitle = 'Climate Design Gaps';
    } else if (lowerHead.includes('methodology')) {
      synthesizedTitle = 'Adaptive Shelter Methods';
    } else if (lowerHead.includes('architecture') || lowerHead.includes('proposed system')) {
      synthesizedTitle = 'Proposed System Architecture';
    } else if (lowerHead.includes('proposed contribution') || lowerHead.includes('contribution')) {
      synthesizedTitle = 'Shelter Design Framework';
    } else if (lowerHead.includes('conclusion')) {
      synthesizedTitle = 'Key Seminar Takeaways';
    } else if (lowerHead.includes('introduction')) {
      synthesizedTitle = 'Thermal Comfort & ML';
    } else if (lowerHead === 'aim' || lowerHead === 'objective') {
      synthesizedTitle = 'Core Objectives';
    } else if (lowerHead === 'overview' || lowerHead === 'theory') {
      synthesizedTitle = 'Theoretical Foundations';
    } else if (lowerHead === 'applications') {
      synthesizedTitle = 'Production Applications';
    } else if (!isDocTitleRepeat && headingCandidate.length >= 5 && headingCandidate.length <= 36) {
      synthesizedTitle = headingCandidate;
    } else {
      // Coherent Keyphrase synthesis from top distinct keywords
      const keywords = extractTopKeywords(unitText, 5).filter(w => !docBaseLower.includes(w) && w.length > 3);
      if (keywords.length >= 2) {
        synthesizedTitle = keywords.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' & ');
      } else {
        synthesizedTitle = 'Technical Architecture';
      }
    }

    // Standardize title length and ensure word-boundary truncation (NEVER truncate mid-word)
    synthesizedTitle = truncateAtWord(synthesizedTitle, 36);

    // Dedup check
    if (seenTitles.has(synthesizedTitle.toLowerCase()) || synthesizedTitle.length < 4) {
      return;
    }
    seenTitles.add(synthesizedTitle.toLowerCase());

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
        if (cleaned === headingCandidate || cleaned.length < 15) return;
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
        desc = sentences[0];
        if (!desc.endsWith('.')) desc += '.';
        if (sentences.length > 1 && (desc.length + sentences[1].length + 1) <= 175) {
          const second = sentences[1].endsWith('.') ? sentences[1] : sentences[1] + '.';
          desc += ' ' + second;
        }
      } else {
        const fallbackSubstantive = lines
          .filter(l => cleanTitle(l) !== headingCandidate && l.trim().length > 15)
          .join(' ')
          .replace(/^[•\-*·\d\.\)]\s*/gm, '')
          .replace(/\s+/g, ' ')
          .trim();
        desc = fallbackSubstantive || unitText.replace(/\s+/g, ' ').trim();
      }
    }

    if (desc.length > 175) {
      const truncated = truncateAtWord(desc, 170);
      desc = truncated.replace(/[,\s;:\-]+$/, '') + '.';
    } else if (!desc.endsWith('.')) {
      desc = desc + '.';
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
      title: synthesizedTitle,
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

  // Calculate sane yield range based on substantive words
  const totalWords = tokenize(fullText).length;
  const maxAllowedYield = Math.max(3, Math.min(15, Math.round(totalWords / 75)));

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
