import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { extractTopicsLocally, isMetaOrAsideLine } from '../../src/lib/topicExtractor.js';
import { safeLog } from '../safeLog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const roadmapPath = path.resolve(__dirname, '../../tests/fixtures/real_roadmap.md');

if (!fs.existsSync(roadmapPath)) {
  console.error('File not found:', roadmapPath);
  process.exit(1);
}

const content = fs.readFileSync(roadmapPath, 'utf8');

// In-app upload path: extractTopicsLocally(rawText, [], file.name)
const topics = extractTopicsLocally(content, [], 'ROADMAP.md');

safeLog('=== REAL ROADMAP CANDIDATES ===');
safeLog({ total_candidates: topics.length });

assert(topics.length > 0, 'Must extract candidates from real ROADMAP.md');

topics.forEach((t, idx) => {
  // Requirement 2 assertions:
  assert(!t.title.toLowerCase().includes('internal build-and-test order'), 'H1 document title must be rejected');
  assert(!/^#\s+/.test(t.title), 'Title must not start with markdown heading #');
  assert(!/^depends\s+(?:on|upon)\b/i.test(t.description), 'Description must not start with "depends on"');
  assert(!isMetaOrAsideLine(t.description), 'Description must not be a pure dependency/ordering note');
  assert(/^[A-Z]/.test(t.description), 'Description must start with a capital letter');
  assert(/[.!?]$/.test(t.description), 'Description must end with terminal sentence punctuation');
  
  // Tag quality assertions
  const junkTags = ['---', '===', 'roadmap', 'phase', 'stage', 'part', 'custom-notes-only'];
  for (const tag of t.tags) {
    assert(!/^\d+$/.test(tag), `Tag "${tag}" must not be pure digits`);
    assert(!/^[-_]+$/.test(tag), `Tag "${tag}" must not be pure dashes/symbols`);
  }

  // Line recording assertions (recorded during parsing)
  assert(typeof t.title_source_line === 'number' && t.title_source_line > 0, 'Must have recorded title_source_line during parsing');
  assert(Array.isArray(t.source_lines) && t.source_lines.length === 2, 'Must have recorded source_lines during parsing');
  assert(Array.isArray(t.description_source_lines) && t.description_source_lines.length > 0, 'Must have recorded description_source_lines during parsing');

  safeLog({
    candidate: idx + 1,
    source_line: t.title_source_line,
    confidence: t.confidence,
    rating: t.confidence_rating || 'medium',
    needs_review: t.needs_review,
    category: t.category,
    source_lines: t.source_lines,
    desc_lines: t.description_source_lines
  });
});

safeLog('=== ROADMAP EXTRACTION VERIFIED ===');
