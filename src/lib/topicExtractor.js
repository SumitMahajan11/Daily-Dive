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
  'yourself', 'yourselves', 'will', 'shall', 'also', 'slide', 'page', 'chapter', 'presentation'
]);

const CATEGORY_KEYWORDS = {
  'tech': {
    'ai-ml': ['ai', 'model', 'learning', 'neural', 'deep', 'transformer', 'prompt', 'rag', 'dataset', 'algorithm', 'weights', 'loss'],
    'cloud': ['cloud', 'aws', 'docker', 'kubernetes', 'server', 'container', 'deploy', 'cluster', 'microservices', 'infrastructure'],
    'web': ['javascript', 'css', 'html', 'react', 'api', 'frontend', 'backend', 'dom', 'browser', 'node', 'http', 'rest']
  },
  'science': {
    'biology': ['cell', 'dna', 'rna', 'gene', 'protein', 'organism', 'biology', 'tissue', 'species', 'evolution'],
    'physics': ['energy', 'force', 'quantum', 'mass', 'gravity', 'velocity', 'particle', 'wave', 'thermodynamics']
  },
  'business': {
    'strategy': ['market', 'customer', 'revenue', 'product', 'growth', 'sales', 'business', 'pricing', 'strategy', 'metrics']
  },
  'design': {
    'ui-ux': ['design', 'interface', 'ux', 'ui', 'user', 'typography', 'layout', 'color', 'wireframe', 'prototype']
  }
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
  return line
    .replace(/^(\d+[\.\)]\s*|slide\s*\d+:?\s*|chapter\s*\d+:?\s*|[#\-*•]\s*)/i, '')
    .trim();
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
  let chunks = [];

  if (rawSections && rawSections.length > 0) {
    chunks = rawSections
      .map(s => s.trim())
      .filter(s => s.length > 25);
  }

  // If no sections or only 1 big section, split by double line breaks or headers
  if (chunks.length <= 1) {
    const splitByBreaks = fullText
      .split(/\n\s*\n+|(?=^#{1,3}\s)/m)
      .map(s => s.trim())
      .filter(s => s.length > 30);

    if (splitByBreaks.length > 1) {
      chunks = splitByBreaks;
    } else {
      // Chunk by paragraph/sentence groups
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
      let currentChunk = '';
      for (const sent of sentences) {
        currentChunk += ' ' + sent.trim();
        if (currentChunk.length >= 180) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      }
      if (currentChunk.trim().length > 25) {
        chunks.push(currentChunk.trim());
      }
    }
  }

  // If still empty, fall back to entire text
  if (chunks.length === 0 && fullText.trim()) {
    chunks = [fullText.trim()];
  }

  const candidateTopics = [];
  const seenTitles = new Set();
  const timestamp = Date.now();

  chunks.forEach((chunk, index) => {
    const lines = chunk
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    // 1. Identify Candidate Title
    let rawTitle = '';
    let bodyStartIndex = 0;

    // Check first 1-3 lines for a short title-like line (< 70 chars)
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const candidateLine = cleanTitle(lines[i]);
      if (candidateLine.length >= 3 && candidateLine.length <= 70 && !candidateLine.endsWith('.')) {
        rawTitle = candidateLine;
        bodyStartIndex = i + 1;
        break;
      }
    }

    // Fallback: Use top 2-3 keywords if no header found
    if (!rawTitle) {
      const topWords = extractTopKeywords(chunk, 3);
      if (topWords.length > 0) {
        rawTitle = topWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' & ');
      } else {
        rawTitle = cleanTitle(lines[0]).slice(0, 50);
      }
    }

    // Title deduplication & cleanup
    const normalizedTitle = rawTitle.slice(0, 65).trim();
    if (seenTitles.has(normalizedTitle.toLowerCase()) || normalizedTitle.length < 3) {
      return;
    }
    seenTitles.add(normalizedTitle.toLowerCase());

    // 2. Synthesize 2-3 sentence description
    const remainingLines = lines.slice(bodyStartIndex);
    let rawDescription = remainingLines
      .join(' ')
      .replace(/^[\-*•\d\.\)]\s*/gm, '')
      .replace(/\s+/g, ' ')
      .trim();

    // If remaining is empty, use the whole chunk
    if (rawDescription.length < 30) {
      rawDescription = chunk.replace(/\s+/g, ' ').trim();
    }

    // Clean up description to 2-3 punchy sentences (max ~280 characters)
    let description = rawDescription;
    if (description.length > 280) {
      // Find sentence boundary near 240-280 chars
      const periodIdx = description.indexOf('.', 120);
      if (periodIdx !== -1 && periodIdx <= 280) {
        description = description.slice(0, periodIdx + 1).trim();
      } else {
        description = description.slice(0, 260).trim() + '...';
      }
    }

    // 3. Extract Tags
    const tags = extractTopKeywords(chunk, 4);

    // 4. Infer Category
    const { group_name, category } = inferCategory(chunk);

    candidateTopics.push({
      id: `custom-${timestamp}-${index}`,
      title: normalizedTitle,
      description,
      group_name,
      category,
      tags: tags.length > 0 ? tags : ['notes', 'learning'],
      source: sourceFileName,
      is_custom: true,
      resources: []
    });
  });

  // Limit to top 8 candidate topics to keep review focused
  return candidateTopics.slice(0, 8);
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

  // Truncate raw text to 12,000 characters to stay lightweight and fast
  const truncatedText = fullText.slice(0, 12000);

  const prompt = `You are a micro-learning curator for Daily Dive. Analyze the following extracted text from "${sourceFileName}" and synthesize 3 to 7 discrete, high-yield micro-learning topic cards.
Each card must be self-contained, engaging, and clear.

Return ONLY a valid JSON array of objects with the exact schema:
[
  {
    "title": "Concise concept name (max 50 chars)",
    "description": "2-3 informative sentences explaining what this is and why it matters (120-250 chars).",
    "group_name": "tech" | "science" | "business" | "design" | "custom",
    "category": "ai-ml" | "cloud" | "web" | "biology" | "physics" | "strategy" | "ui-ux" | "custom-notes",
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
        temperature: 0.3,
        maxOutputTokens: 1200
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
    // Strip markdown code block if model wrapped in ```json
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
