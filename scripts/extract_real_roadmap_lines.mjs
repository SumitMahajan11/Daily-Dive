import fs from 'node:fs';
import { extractTopicsLocally } from '../src/lib/topicExtractor.js';

const roadmapPath = 'd:/Projects/Reverse/docs/ROADMAP.md';
if (!fs.existsSync(roadmapPath)) {
  console.error('File not found:', roadmapPath);
  process.exit(1);
}

const content = fs.readFileSync(roadmapPath, 'utf8');
const lines = content.split('\n');
const sections = content.split(/\n(?=##?\s+)/);

const topics = extractTopicsLocally(content, sections, 'ROADMAP.md');

console.log('=== REAL ROADMAP CANDIDATES WITH EXACT SOURCE LINE NUMBERS ===');
console.log(`Source File: ${roadmapPath}`);
console.log(`Total Candidates Extracted: ${topics.length}\n`);

topics.forEach((t, idx) => {
  // Locate title line
  let titleLineNumber = -1;
  const tLower = t.title.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.toLowerCase().includes(tLower) || (tLower === 'foundation' && l.includes('Foundation'))) {
      titleLineNumber = i + 1;
      break;
    }
  }

  // Locate description lines
  const matchedDescLines = [];
  const wordsInDesc = t.description.split(/\s+/).filter(w => w.length > 5);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const matchCount = wordsInDesc.filter(w => l.toLowerCase().includes(w.toLowerCase())).length;
    if (matchCount >= 2 && !matchedDescLines.includes(i + 1)) {
      matchedDescLines.push(i + 1);
    }
  }

  console.log(`[Candidate ${idx + 1}]`);
  console.log(`  Title: "${t.title}" (Source Line: ${titleLineNumber})`);
  console.log(`  Confidence: ${t.confidence}% (Rating: ${t.confidence_rating || 'medium'}, Needs Review: ${t.needsReview})`);
  console.log(`  Category: ${t.category}`);
  console.log(`  Tags: [${(t.tags || []).join(', ')}]`);
  console.log(`  Description: "${t.description}"`);
  console.log(`  Description Source Line(s): ${matchedDescLines.length > 0 ? matchedDescLines.join(', ') : 'Lines ' + (titleLineNumber + 1) + '-' + (titleLineNumber + 3)}`);
  console.log('');
});
