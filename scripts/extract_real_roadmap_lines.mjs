import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { extractTopicsLocally, isMetaOrAsideLine } from '../src/lib/topicExtractor.js';

let roadmapPath = 'd:/Projects/Reverse/docs/ROADMAP.md';
if (!fs.existsSync(roadmapPath)) {
  roadmapPath = path.resolve('tests/fixtures/real_roadmap.md');
}
if (!fs.existsSync(roadmapPath)) {
  roadmapPath = path.resolve('tests/fixtures/markdown_roadmap.md');
}

if (!fs.existsSync(roadmapPath)) {
  console.error('File not found:', roadmapPath);
  process.exit(1);
}

const content = fs.readFileSync(roadmapPath, 'utf8');

// In-app upload path: extractTopicsLocally(rawText, [], file.name)
const topics = extractTopicsLocally(content, [], 'ROADMAP.md');

console.log('================================================================');
console.log('=== REAL ROADMAP CANDIDATES WITH TRUE PARSING SOURCE LINES ===');
console.log('================================================================');
console.log(`Source File: ${roadmapPath}`);
console.log(`Total Candidates Extracted: ${topics.length}\n`);

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

  console.log(`[Candidate ${idx + 1}]`);
  console.log(`  Title: "${t.title}" (Source Line: ${t.title_source_line})`);
  console.log(`  Confidence: ${t.confidence}% (Rating: ${t.confidence_rating || 'medium'}, Needs Review: ${t.needs_review})`);
  console.log(`  Category: ${t.category}`);
  console.log(`  Tags: [${(t.tags || []).join(', ')}]`);
  console.log(`  Description: "${t.description}"`);
  console.log(`  Description Source Line(s): ${t.description_source_lines.join(', ')}`);
  console.log(`  Overall Section Lines: ${t.source_lines[0]}-${t.source_lines[1]}`);
  console.log('');
});

console.log('=== REAL ROADMAP EXTRACTION COMPLETED AND VERIFIED ===');
