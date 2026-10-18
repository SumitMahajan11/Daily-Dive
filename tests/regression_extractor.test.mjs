import fs from 'fs';
import path from 'path';
import {
  extractTopicsLocally,
  scoreCandidateTitle,
  CONFIDENCE_THRESHOLD,
  isNonTopicHeading,
  truncateTitle
} from '../src/lib/topicExtractor.js';


let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ── PART 1: BAD TITLE REGRESSION FIXTURES (Round 1 + Round 2 + Historic) ──

const badTitleCases = [
  {
    title: 'Compare Random Forest,',
    expectedReason: 'Trailing punctuation or incomplete delimiter',
    desc: 'Mid-sentence action verb with trailing comma'
  },
  {
    title: 'Literature Review: 2021–',
    expectedReason: 'Open date range or trailing hyphen',
    desc: 'Section with trailing en-dash and open year range'
  },
  {
    title: 'Existing research includes RF, SVM, ANN,',
    expectedReason: 'Mid-sentence introductory fragment',
    desc: 'Conversational incomplete sentence fragment'
  },
  {
    title: 'RESEARCH GAP',
    expectedReason: 'ALL-CAPS raw heading',
    desc: 'Uncased ALL-CAPS raw section header'
  },
  {
    title: 'Display filter bar',
    expectedReason: 'UI component artifact',
    desc: 'Wireshark UI toolbar widget'
  },
  {
    title: 'Packet list pane',
    expectedReason: 'UI component artifact',
    desc: 'Wireshark packet view pane'
  },
  {
    title: 'Step 1: Open the file in Wireshark',
    expectedReason: 'Procedural step artifact',
    desc: 'Numbered lab manual procedural action'
  },
  {
    title: 'Click on the Capture Interface',
    expectedReason: 'Imperative procedural instruction',
    desc: 'Imperative user instruction'
  },
  {
    title: 'Figure 2.1: Network topology diagram',
    expectedReason: 'Figure or diagram label artifact',
    desc: 'Diagram figure caption'
  },
  {
    title: 'Paper',
    expectedReason: 'Table-like structure or column header',
    desc: 'Comparative table column header'
  },
  {
    title: 'AIM',
    expectedReason: 'Length outlier (too short or single word)',
    desc: 'Generic lab manual header'
  }
];

badTitleCases.forEach(tc => {
  const result = scoreCandidateTitle(tc.title);
  assert(
    result.needsReview === true,
    `"${tc.title}" flagged for review (Confidence: ${result.confidence}%, Rating: ${result.confidence_rating})`
  );
  assert(
    result.confidence < CONFIDENCE_THRESHOLD,
    `"${tc.title}" score (${result.confidence}%) < threshold (${CONFIDENCE_THRESHOLD}%)`
  );
  assert(
    result.reviewReasons.some(r => r.toLowerCase().includes(tc.expectedReason.toLowerCase().slice(0, 15))),
    `"${tc.title}" includes expected reason matching: ${tc.expectedReason}`
  );
});

// ── PART 2: CLEAN HIGH-CONFIDENCE TITLE FIXTURES ──

const cleanTitleCases = [
  'Thermal Comfort Benchmarks',
  'Cross-Climate Prediction Gaps',
  'Adaptive Shelter Methodology',
  'Wireshark Packet Filtering',
  'IPv4 Subnetting & Topology',
  'Dynamic Programming Foundations',
  'Integrated Shelter Architecture',
  'Decision-Support Framework',
  'Climate-Adaptive Shelter Outcomes',
  'Saga Pattern Distributed Orchestration',
  'CQRS Read Model Synchronization',
  'Circuit Breaker Resilience Telemetry'
];

cleanTitleCases.forEach(title => {
  const result = scoreCandidateTitle(title);
  assert(
    result.isHighConfidence === true,
    `"${title}" auto-accepted as high confidence (${result.confidence}%)`
  );
  assert(
    result.needsReview === false,
    `"${title}" needsReview is false (Rating: ${result.confidence_rating})`
  );
});

// ── PART 3: ALL 6 HISTORIC FIXTURES REGRESSION RUN ──

const fixtureFiles = [
  { file: 'tests/fixtures/exp2_pages.json', name: 'Experiment no 2 cn.pdf' },
  { file: 'tests/fixtures/exp3_pages.json', name: 'Experiment no 3 cn.pdf' },
  { file: 'tests/fixtures/ccl1_pages.json', name: 'kartik_ccl_1.pdf' },
  { file: 'tests/fixtures/algo_pages.json', name: 'study_guide_algorithms.pdf' },
  { file: 'tests/fixtures/systems_slides.json', name: 'lecture_systems.pptx' },
  { file: 'tests/fixtures/climate_slides.json', name: 'AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx' }
];

fixtureFiles.forEach(({ file, name }) => {
  const rawPages = JSON.parse(fs.readFileSync(file, 'utf8'));
  const fullText = rawPages.join('\n\n');
  const topics = extractTopicsLocally(fullText, rawPages, name);

  assert(topics.length >= 2, `${name} yielded ${topics.length} topics (>= 2 required)`);

  topics.forEach(t => {
    // Assert no raw UI widgets or diagram headers leaked
    assert(!isNonTopicHeading(t.title) || t.needs_review === true,
      `${name} -> "${t.title}" is a non-topic heading and is not flagged needs_review`);
    assert(typeof t.confidence === 'number', `${name} -> "${t.title}" has numeric confidence (${t.confidence}%)`);
    assert(typeof t.needs_review === 'boolean', `${name} -> "${t.title}" has boolean needs_review flag`);
    assert(Array.isArray(t.review_reasons), `${name} -> "${t.title}" has review_reasons array`);
  });
});

// ── PART 4: VERIFICATION ON DOCUMENT 6 & NEW DOCUMENT TYPE ──

function displayDocumentAudit(title, fileName, sections, isMarkdown = false) {
  const fullText = isMarkdown ? sections : sections.join('\n\n');
  const rawSections = isMarkdown
    ? sections.split(/\n\s*---+\s*\n|\n(?=#{1,3}\s)/m).map(s => s.trim()).filter(s => s.length > 20)
    : sections;

  const topics = extractTopicsLocally(fullText, rawSections, fileName);


  const autoAccepted = topics.filter(t => !t.needs_review && t.confidence >= CONFIDENCE_THRESHOLD);
  const flaggedForReview = topics.filter(t => t.needs_review || t.confidence < CONFIDENCE_THRESHOLD);

  if (autoAccepted.length === 0) {
  } else {
    autoAccepted.forEach((t, i) => {
    });
  }

  if (flaggedForReview.length === 0) {
  } else {
    flaggedForReview.forEach((t, i) => {
      const displayRawHeading = t.raw_heading !== undefined
        ? (t.raw_heading.trim() ? `"${t.raw_heading}"` : '"" (empty)')
        : `"${t.title}"`;
    });
  }


  return { autoAccepted, flaggedForReview };
}

// 1. Document 6: Climate Seminar PPTX
const climateSlides = JSON.parse(fs.readFileSync('tests/fixtures/climate_slides.json', 'utf8'));
const doc6Audit = displayDocumentAudit(
  'Document 6: Climate Seminar (PPTX)',
  'AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx',
  climateSlides,
  false
);

// 2. New Document Type: Microservices Architecture Specification (Markdown)
const mdContent = fs.readFileSync('tests/fixtures/microservices_architecture_spec.md', 'utf8');
const newDocAudit = displayDocumentAudit(
  'New Document Type: Microservices Spec (Markdown RFC)',
  'microservices_architecture_spec.md',
  mdContent,
  true
);

// 3. Observed Markdown Roadmap Fixture (4 Observed Cases)
const roadmapContent = fs.readFileSync('tests/fixtures/markdown_roadmap.md', 'utf8');
const roadmapAudit = displayDocumentAudit(
  'Observed Markdown Roadmap (4 Observed Cases)',
  'markdown_roadmap.md',
  roadmapContent,
  true
);

// 4. Nested Lists Markdown Fixture
const nestedListsContent = fs.readFileSync('tests/fixtures/nested_lists.md', 'utf8');
const nestedListsAudit = displayDocumentAudit(
  'Markdown Fixture: Nested Lists',
  'nested_lists.md',
  nestedListsContent,
  true
);

// 5. Tables Markdown Fixture
const tablesContent = fs.readFileSync('tests/fixtures/tables_fixture.md', 'utf8');
const tablesAudit = displayDocumentAudit(
  'Markdown Fixture: Tables',
  'tables_fixture.md',
  tablesContent,
  true
);

// 6. Code Blocks Markdown Fixture
const codeBlocksContent = fs.readFileSync('tests/fixtures/code_blocks_fixture.md', 'utf8');
const codeBlocksAudit = displayDocumentAudit(
  'Markdown Fixture: Code Blocks',
  'code_blocks_fixture.md',
  codeBlocksContent,
  true
);

// 7. README-Style Markdown Fixture
const readmeContent = fs.readFileSync('tests/fixtures/readme_style_fixture.md', 'utf8');
const readmeAudit = displayDocumentAudit(
  'Markdown Fixture: README Style',
  'readme_style_fixture.md',
  readmeContent,
  true
);

// Assertions on Document 6
assert(doc6Audit.autoAccepted.length > 0, 'Document 6 produces clean high-confidence topics');
assert(
  !doc6Audit.autoAccepted.some(t => /[,;:\-–—/\\&+([]\s*$/.test(t.title)),
  'No auto-accepted title in Document 6 has trailing punctuation'
);
assert(
  !doc6Audit.autoAccepted.some(t => t.title === t.title.toUpperCase() && t.title.replace(/[^A-Za-z]/g, '').length >= 3),
  'No auto-accepted title in Document 6 is ALL-CAPS'
);

// Assertions on New Document Type
assert(
  newDocAudit.autoAccepted.some(t => t.title.includes('Saga Pattern')),
  'New Markdown document auto-accepts "Saga Pattern Distributed Orchestration"'
);
assert(
  newDocAudit.autoAccepted.some(t => t.title.includes('CQRS Read Model')),
  'New Markdown document auto-accepts "CQRS Read Model Synchronization"'
);
assert(
  newDocAudit.autoAccepted.some(t => t.title.includes('Circuit Breaker')),
  'New Markdown document auto-accepts "Circuit Breaker Resilience Telemetry"'
);
assert(
  newDocAudit.flaggedForReview.length > 0,
  'New Markdown document correctly flags the draft section ending with trailing punctuation'
);

// Assertions on 4 Observed Cases from Markdown Roadmap
const allRoadmapTopics = [...roadmapAudit.autoAccepted, ...roadmapAudit.flaggedForReview];
assert(
  allRoadmapTopics.some(t => t.title === 'Foundation'),
  'Roadmap Case 1: Title "# Stage 1 - Foundation" stripped to "Foundation"'
);
assert(
  allRoadmapTopics.some(t => t.title === 'Structural Backbone'),
  'Roadmap Case 2: Title "# Stage 2 - Structural Backbone" stripped to "Structural Backbone"'
);
assert(
  allRoadmapTopics.some(t => t.title === 'Understanding Layer'),
  'Roadmap Case 3: Title "# Stage 3 - Understanding Layer" stripped to "Understanding Layer"'
);
assert(
  !allRoadmapTopics.some(t => t.title.startsWith('#') || t.title.includes('Stage ')),
  'No roadmap topic title contains raw markdown "#" or "Stage " prefix'
);
assert(
  !allRoadmapTopics.some(t => t.description.includes('**Layer') || t.description.includes('**')),
  'No roadmap topic description contains raw bold "**" markdown syntax'
);
assert(
  !allRoadmapTopics.some(t => t.description.includes('DECISIONS_LOG.md') || t.description.includes('Note:')),
  'No roadmap topic description contains file reference "DECISIONS_LOG.md" or "Note:" asides'
);
assert(
  !allRoadmapTopics.some(t => t.tags.includes('ai-ml') || t.tags.includes('career-strategy')),
  'Uncategorized custom roadmap uploads do not assign built-in "#ai-ml" or "#career-strategy" tags'
);
assert(
  allRoadmapTopics.every(t => t.category === 'custom-notes' && t.tags.includes('custom-notes')),
  'All roadmap upload topics receive default "custom-notes" category and tag'
);

// Assertions on 4 New Markdown Fixtures
assert(nestedListsAudit.autoAccepted.length > 0, 'Nested lists fixture extracted valid topics');
assert(
  !nestedListsAudit.autoAccepted.some(t => t.description.includes('- ') || t.description.includes('* ')),
  'Nested lists fixture stripped bullet markers from description'
);

assert(tablesAudit.autoAccepted.length > 0, 'Tables fixture extracted valid topics');
assert(
  !tablesAudit.autoAccepted.some(t => t.description.includes('|')),
  'Tables fixture stripped markdown table pipes from description'
);

assert(codeBlocksAudit.autoAccepted.length > 0, 'Code blocks fixture extracted valid topics');
assert(
  !codeBlocksAudit.autoAccepted.some(t => t.description.includes('```')),
  'Code blocks fixture stripped code fences from description'
);

assert(readmeAudit.autoAccepted.length > 0, 'README fixture extracted valid topics');
assert(
  !readmeAudit.autoAccepted.some(t => t.description.includes('[![') || t.description.includes('img.shields.io')),
  'README fixture stripped markdown badges and image links from description'
);

// ── PART 4: TITLE TRUNCATION UNIT TESTS (70 Chars, Word Boundary, Ellipsis) ──

// Case 1: Short title unchanged (<= 70 characters)
const shortTitle = 'Thermal Comfort Fundamentals';
assert(
  truncateTitle(shortTitle) === shortTitle,
  `Case 1: Short title unchanged: "${shortTitle}"`
);

// Case 2: Long title cut at a word (> 70 characters, cut at last word before 70, adds …)
const longTitle = 'AI ML Climate Adaptive Shelter Technical Seminar: Interpretable Machine Learning';
const expectedLongCut = 'AI ML Climate Adaptive Shelter Technical Seminar: Interpretable…';
assert(
  truncateTitle(longTitle) === expectedLongCut,
  `Case 2: Long title cut at a word with ellipsis: "${truncateTitle(longTitle)}"`
);

// Case 3: A single very long word with no spaces (> 70 characters, never cut inside a word)
const longWord = 'SupercalifragilisticexpialidociousSupercalifragilisticexpialidociousLongWord';
assert(
  truncateTitle(longWord) === longWord,
  `Case 3: Single very long word with no spaces uncut: "${truncateTitle(longWord)}"`
);

