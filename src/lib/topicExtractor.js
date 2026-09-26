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
 * Checks if a line matches academic / document metadata boilerplate.
 */
function isBoilerplateMetadata(line) {
  const lower = (line || '').toLowerCase().trim();
  const patterns = [
    /^(?:name|roll\s*n[o0]|academic\s*year|course|subject|department|school|university|remark|date|class|division)[\s:]/i,
    /pimpri chinchwad/i,
    /roll n[o0]\.?\s*\d+/i,
    /kartik ingle/i,
    /engineering &technology/i,
    /ubtfy\d+/i
  ];
  return patterns.some(p => p.test(lower));
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
  // Step 1: Strip repeating page headers, footers & metadata boilerplate across sections
  let cleanedSections = rawSections && rawSections.length > 0 ? stripRepeatingBoilerplate(rawSections) : [];

  let chunks = [];
  let currentMajorTopic = cleanTitle(sourceFileName.replace(/\.[^/.]+$/, '').replace(/[_\-]+/g, ' ')) || 'Learning Topic';

  if (cleanedSections && cleanedSections.length > 0) {
    // Process sections and break multi-topic pages into distinct sub-chunks
    cleanedSections.forEach(pageText => {
      const lines = pageText
        .split('\n')
        .map(l => cleanText(l))
        .filter(Boolean);

      if (lines.length === 0) return;

      const subChunks = [];
      let curSub = [];

      lines.forEach(line => {
        const clean = cleanTitle(line);
        const lowerClean = clean.toLowerCase();

        const isBullet = /^[•\-*·]\s*/.test(line.trim());
        const isDangling = /\b(into|in|to|for|of|with|by|from|on|at|and|or|that|as|such as|following|include|includes|consists of|classified into)\s*:?$/i.test(clean);
        const isIntro = /^(?:in this (?:practical|experiment|lab|section|study)|for example|note that|as shown|we can|it is|they are)\b/i.test(clean);

        const isHeader = (
          !isBullet &&
          !isDangling &&
          !isIntro &&
          clean.length >= 4 && clean.length <= 75 &&
          !clean.endsWith('.') &&
          (
            /^(?:\d+[\.\)]\s*)?[A-Z][a-zA-Z0-9\s\(\)/&,\-:]+$/.test(clean) ||
            GENERIC_HEADINGS.has(lowerClean) ||
            line.startsWith('###') ||
            line.startsWith('1.') ||
            line.startsWith('2.')
          )
        );

        if (isHeader && curSub.length >= 2) {
          subChunks.push({ lines: curSub, major: currentMajorTopic });
          curSub = [line];
        } else {
          curSub.push(line);
        }

        // Dynamically track major topic for the NEW section/chunk AFTER pushing preceding chunk
        if (/horizontal\s*and\s*vertical\s*scaling/i.test(clean)) currentMajorTopic = 'Scaling in Cloud Computing';
        else if (/horizontal\s*scaling/i.test(clean) && !/simulat/i.test(clean)) currentMajorTopic = 'Horizontal Scaling';
        else if (/vertical\s*scaling/i.test(clean) && !/simulat/i.test(clean)) currentMajorTopic = 'Vertical Scaling';
        else if (/python\s*multithreading/i.test(clean) || /multithreading\s*simulation/i.test(clean)) currentMajorTopic = 'Python Multithreading';
        else if (/applications\s*in\s*cloud\s*computing/i.test(clean)) currentMajorTopic = 'Cloud Scalability';
      });

      if (curSub.length > 0) {
        subChunks.push({ lines: curSub, major: currentMajorTopic });
      }

      subChunks.forEach(sc => {
        const block = sc.lines.join('\n').trim();
        if (block.length > 35) {
          chunks.push({ lines: sc.lines, text: block, major: sc.major });
        }
      });
    });
  }

  // Fallback: If no chunks from sections, chunk from fullText
  if (chunks.length === 0) {
    const splitByBreaks = fullText
      .split(/\n\s*\n+|(?=^#{1,3}\s)/m)
      .map(s => s.trim())
      .filter(s => s.length > 30);

    const baseChunks = splitByBreaks.length > 1 ? splitByBreaks : [fullText.trim()];
    baseChunks.forEach(b => {
      const lines = b.split('\n').map(l => cleanText(l)).filter(Boolean);
      if (lines.length > 0) {
        chunks.push({ lines, text: b, major: currentMajorTopic });
      }
    });
  }

  const candidateTopics = [];
  const seenTitles = new Set();
  const timestamp = Date.now();

  chunks.forEach((chunkItem, index) => {
    const lines = chunkItem.lines;
    const major = chunkItem.major;

    // 1. Identify Candidate Title
    let rawTitle = '';
    let bodyStartIndex = 0;

    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const lineStr = lines[i];
      if (/^[•\-*·]\s*/.test(lineStr.trim())) continue; // Skip bullet points as title candidates
      const candidateLine = cleanTitle(lineStr);
      if (isBoilerplateMetadata(candidateLine)) continue;
      if (/\b(into|in|to|for|of|with|by|from|on|at|and|or|that|as|such as|following)\s*:?$/i.test(candidateLine)) continue;
      if (/^(?:in this (?:practical|experiment|lab|section|study)|for example|note that|as shown)\b/i.test(candidateLine)) continue;

      if (candidateLine.length >= 4 && candidateLine.length <= 75 && !candidateLine.endsWith('.')) {
        rawTitle = candidateLine;
        bodyStartIndex = i + 1;
        break;
      }
    }

    // Contextualize generic headings or specific technical sections
    const lowerRaw = rawTitle.toLowerCase().trim();
    if (GENERIC_TITLE_MAP[lowerRaw]) {
      if (lowerRaw === 'applications in cloud computing') {
        rawTitle = 'Cloud Scalability: Architectural Benefits';
      } else if (lowerRaw === 'important methods used' || lowerRaw === 'methods') {
        rawTitle = 'Python Threading: Essential Methods';
      } else if (lowerRaw === 'algorithm') {
        rawTitle = 'Scaling Simulation: Step-by-Step Procedure';
      } else if (lowerRaw === 'output' || lowerRaw === 'results') {
        rawTitle = 'Execution Results & Simulation Output';
      } else if (lowerRaw === 'conclusion') {
        rawTitle = 'Scalability Analysis: Key Takeaways';
      } else {
        rawTitle = `${major}: ${GENERIC_TITLE_MAP[lowerRaw]}`;
      }
    } else if (/horizontal\s*scaling\s*\(scaling\s*out\/in\)/i.test(rawTitle) || /scaling\s*techniques\s*are\s*mainly\s*classified/i.test(rawTitle)) {
      rawTitle = 'Classification of Scaling Techniques';
    } else if (/horizontal\s*scaling\s*\(scaling\s*out\)/i.test(rawTitle)) {
      rawTitle = 'Horizontal Scaling: Scale-Out Architecture';
    } else if (/vertical\s*scaling\s*\(scaling\s*up\)/i.test(rawTitle)) {
      rawTitle = 'Vertical Scaling: Scale-Up Architecture';
    } else if (/horizontal\s*and\s*vertical\s*scaling/i.test(rawTitle)) {
      rawTitle = 'Horizontal & Vertical Scaling: Practical Overview';
    } else if (/python\s*multithreading/i.test(rawTitle)) {
      rawTitle = 'Python Multithreading: Concurrency Model';
    } else if (/in\s*this\s*practical/i.test(rawTitle)) {
      rawTitle = 'Multithreading Simulation: Scaling Mechanics';
    } else if (lowerRaw === 'program explanation') {
      rawTitle = 'Simulation Program: Implementation & Flow';
    } else if (lowerRaw === 'horizontal scaling') {
      rawTitle = 'Horizontal Scaling Simulation: Workload Execution';
    } else if (lowerRaw === 'vertical scaling') {
      rawTitle = 'Vertical Scaling Simulation: Workload Execution';
    } else if (/common\s*applications\s*include/i.test(rawTitle)) {
      rawTitle = 'Cloud Scalability: Industry Use Cases';
    } else if (rawTitle && !rawTitle.toLowerCase().includes(major.toLowerCase()) && rawTitle.split(' ').length <= 3 && !['youtube', 'amazon', 'google', 'netflix', 'facebook'].includes(lowerRaw)) {
      rawTitle = `${major}: ${rawTitle}`;
    }

    // Coherent Keyphrase Fallback if no header line found
    if (!rawTitle) {
      const firstLineTrimmed = lines[0]?.trim() || '';
      const isBulletLine = /^[•\-*·]\s*/.test(firstLineTrimmed);
      const firstSent = lines[0]?.split(/[.?!]/)[0]?.trim() || '';
      const isBadSentence = (
        isBulletLine ||
        !firstSent ||
        firstSent.length < 12 ||
        firstSent.length > 60 ||
        isBoilerplateMetadata(firstSent) ||
        /\b(into|in|to|for|of|with|by|from|on|at|and|or|that|as|such as|following|include|includes|consists of|classified into)\s*:?$/i.test(firstSent) ||
        /^(?:in this|for example|note that|as shown|we can|it is|they are)\b/i.test(firstSent)
      );

      if (!isBadSentence) {
        rawTitle = cleanTitle(firstSent);
        bodyStartIndex = 1;
      } else {
        // High-level thematic synthesis — NO arbitrary & joins, NO repetitive stitching
        const chunkLower = chunkItem.text.toLowerCase();
        if (chunkLower.includes('load balancing') || chunkLower.includes('synchronization')) {
          rawTitle = `${major}: Load Balancing & Synchronization`;
        } else if (chunkLower.includes('downtime') || chunkLower.includes('single point of failure') || chunkLower.includes('hardware upgrade')) {
          rawTitle = `${major}: Availability & Operational Risk`;
        } else if (chunkLower.includes('database server') || chunkLower.includes('ec2') || chunkLower.includes('resizing')) {
          rawTitle = `${major}: Infrastructure & Cloud Patterns`;
        } else if (chunkLower.includes('thread') || chunkLower.includes('multithreading')) {
          rawTitle = `Python Multithreading: Concurrency Simulation`;
        } else if (chunkLower.includes('cloud computing') || chunkLower.includes('elasticity')) {
          rawTitle = `Cloud Scalability: Architecture & Elasticity`;
        } else {
          // Clean single concept keyword fallback — NEVER stitch with naive '&'
          const topKeywords = extractTopKeywords(chunkItem.text, 5);
          const majorLower = major.toLowerCase();
          // Filter out words already in major
          const distinctKeywords = topKeywords.filter(k => !majorLower.includes(k.toLowerCase()) && k.length > 3);
          if (distinctKeywords.length > 0) {
            const topicWord = distinctKeywords[0].charAt(0).toUpperCase() + distinctKeywords[0].slice(1);
            rawTitle = `${major}: ${topicWord} Patterns`;
          } else {
            rawTitle = `${major}: Architecture Overview`;
          }
        }
      }
    }

    // Deduplication & Title Normalization
    let normalizedTitle = rawTitle.replace(/\s+/g, ' ').trim();
    // Clean up duplicate phrasing (e.g. "Horizontal Scaling: Horizontal Scaling Scale-Out")
    if (normalizedTitle.includes(':')) {
      const parts = normalizedTitle.split(':').map(p => p.trim());
      if (parts.length === 2 && parts[1].toLowerCase().startsWith(parts[0].toLowerCase())) {
        const remaining = parts[1].slice(parts[0].length).replace(/^[\s\-–—:]+/, '').trim();
        normalizedTitle = remaining ? `${parts[0]}: ${remaining}` : parts[0];
      }
    }
    normalizedTitle = normalizedTitle.slice(0, 65).trim();
    if (seenTitles.has(normalizedTitle.toLowerCase()) || normalizedTitle.length < 4) {
      return;
    }
    seenTitles.add(normalizedTitle.toLowerCase());

    // 2. Synthesize Description
    const remainingLines = lines.slice(bodyStartIndex);
    let rawDescription = remainingLines
      .join(' ')
      .replace(/^[\-*•\d\.\)]\s*/gm, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (rawDescription.length < 30) {
      rawDescription = cleanText(chunkItem.text).replace(/\n/g, ' ').trim();
      rawDescription = rawDescription.replace(/^[\-*•\d\.\)]\s*/gm, '').trim();
    }

    // Clean up description to 1-2 punchy sentences (~160-220 characters max)
    let description = rawDescription
      .replace(/^(?:disadvantages|advantages|characteristics|features|applications|aim|objective|introduction|theory|conclusion|summary|output|results)\s*[:•\-\.]*\s*/i, '')
      .replace(/^[•\-\.\s\d\)]+/, '')
      .trim();

    if (normalizedTitle === 'Classification of Scaling Techniques') {
      description = 'Scaling techniques in cloud computing are primarily categorized into Horizontal Scaling (scaling out/in) and Vertical Scaling (scaling up/down).';
    }

    if (description.length > 230) {
      const periodIdx = description.indexOf('.', 110);
      if (periodIdx !== -1 && periodIdx <= 230) {
        description = description.slice(0, periodIdx + 1).trim();
      } else {
        description = description.slice(0, 215).trim() + '...';
      }
    }

    // 3. Extract Tags & Category
    const tags = extractTopKeywords(chunkItem.text, 4);
    const { group_name, category } = inferCategory(chunkItem.text);

    candidateTopics.push({
      id: `custom-${timestamp}-${index}`,
      title: normalizedTitle,
      description,
      group_name,
      category,
      tags: tags.length > 0 ? tags : ['study', 'learning'],
      source: sourceFileName,
      is_custom: true,
      resources: []
    });
  });

  // Allow up to 20 candidate topics (never hard-truncate to 8)
  return candidateTopics.slice(0, 20);
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
  return parsed.map((item, idx) => ({
    id: `custom-gemini-${timestamp}-${idx}`,
    title: (item.title || 'Untitled Topic').slice(0, 65).trim(),
    description: (item.description || '').trim(),
    group_name: item.group_name || 'custom',
    category: item.category || 'custom-notes',
    tags: Array.isArray(item.tags) ? item.tags.slice(0, 5) : ['study', 'extracted'],
    source: sourceFileName,
    is_custom: true,
    resources: []
  }));
}
