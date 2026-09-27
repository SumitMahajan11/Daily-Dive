import fs from 'fs';

// Helper tests for title cleaning, truncation, and structural routing
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

function isTruncatedOrNonTerminal(str) {
  if (!str || typeof str !== 'string') return true;
  const s = str.trim();
  if (s.length < 4) return true;

  // 1. Trailing non-terminal punctuation
  if (/[,;:\-–—/\\&+([]\s*$/.test(s)) return true;

  // 2. Trailing open date ranges or year spans (e.g. "2021–", "2020-")
  if (/\b\d{4}\s*[\-–—]\s*$/.test(s)) return true;

  // 3. Trailing non-terminal words, prepositions, or conjunctions
  if (/\b(?:and|or|includes?|including|such as|for|with|of|in|to|the|a|an|from|by|at|as|between|into|through|during|before|after|that|which|is|are|was|were|vs|etc)\s*$/i.test(s)) {
    return true;
  }

  // 4. Starts with mid-sentence conversational fragments or incomplete predicates
  if (/^(?:existing\s+research\s+includes?|studies\s+show\s+that|we\s+propose|this\s+paper\s+presents|in\s+order\s+to|as\s+shown\s+in|according\s+to|compare|comparing|discussing)\b/i.test(s)) {
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

function isStructuralOrAllCaps(str) {
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

// Test cases reported by user:
const testCases = [
  "Compare Random Forest,",
  "Literature Review: 2021–",
  "Existing research includes RF, SVM, ANN,",
  "RESEARCH GAP"
];

console.log("=== TESTING TRUNCATION & STRUCTURAL DETECTION ===");
testCases.forEach(tc => {
  const truncated = isTruncatedOrNonTerminal(tc);
  const structural = isStructuralOrAllCaps(tc);
  console.log(`Candidate: "${tc}"`);
  console.log(`  -> isTruncatedOrNonTerminal: ${truncated}`);
  console.log(`  -> isStructuralOrAllCaps:    ${structural}`);
  console.log(`  -> Action: ${truncated || structural ? "REJECT/RE-SYNTHESIZE ✓" : "PASS THROUGH RAW ✗"}\n`);
});
