import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTopicsLocally,
  extractTopicsFromSections,
  buildExtractionWarning,
  formatPageRanges,
  formatCancelToast
} from '../src/lib/topicExtractor.js';

test('8a. 20 sections, each at least 300 characters: old code returns 15 topics, new code returns 20', async () => {
  const concepts = [
    'Symmetric Encryption Primitives',
    'Asymmetric Key Exchange Mechanisms',
    'Elliptic Curve Cryptography Protocols',
    'Hash Function Security Standards',
    'Digital Signature Verification Methods',
    'Zero Knowledge Proof Foundations',
    'Homomorphic Computation Systems',
    'Post Quantum Lattice Cryptography',
    'Random Number Generator Standards',
    'Key Derivation Functions',
    'Authenticated Encryption Schemes',
    'Block Cipher Operating Modes',
    'Stream Cipher Synchronizations',
    'Public Key Infrastructure CAs',
    'Certificate Revocation Protocols',
    'Identity Based Encryption Schemes',
    'Attribute Based Access Controls',
    'Threshold Cryptography Clusters',
    'Verifiable Secret Sharing Protocols',
    'Oblivious RAM Architectural Models'
  ];

  const sections20 = concepts.map((concept, i) => {
    return `${concept} Architecture Overview
This is substantive body content for section ${i + 1} that describes distributed systems, secure state transitions, consensus algorithms, replication logs, network topologies, fault tolerance models, data structures, and state machine replication. More detailed technical exposition is provided here to ensure this page easily exceeds three hundred characters of readable information for this slide. Detailed discussion of cryptographic primitives continues across the entire page body.`;
  });

  const fullText = sections20.join('\n\n');
  const topics = await extractTopicsLocally(fullText, sections20, 'twenty_sections.txt', { forcePath: 'structured' });

  assert.equal(topics.length, 20, `Expected 20 topics from 20 sections, got ${topics.length}`);
});

test('8b. A 400-character page whose text looks like an outline is not dropped when length >= 300', async () => {
  const outlinePage = `Agenda and Course Outline: Systems Cryptography
• Introduction to Distributed Cryptography and Security Systems
• Key Encapsulation Mechanisms and Data Encapsulation Mechanisms
• Discrete Logarithm Problem and Cyclic Groups in Modern Primitives
• ElGamal Encryption Protocol Specifications and Mathematical Proofs
• Public Key Infrastructure and Parameter Generation Step-by-Step
• Comprehensive Vulnerability Analysis and Attack Vectors
• Summary of Best Practices in Applied Modern Cryptography and Systems.`;

  assert.ok(outlinePage.length >= 400, `Outline page should be at least 400 chars, got ${outlinePage.length}`);
  const topics = await extractTopicsLocally(outlinePage, [outlinePage], 'outline_slide.txt', { forcePath: 'structured' });

  assert.ok(topics.length >= 1, `Expected outline page with >= 300 chars to be kept as a topic, got ${topics.length}`);
});

test('8c. Every page has an outcome, and none is empty', async () => {
  const sections = [
    `Section One Topic Overview
Detailed technical explanation of the first concept with sufficient character length to ensure proper extraction without ambiguity across sections and modules.`,
    `Section Two Architecture Specification
Comprehensive design specification detailing internal component interactions, event queues, durable storage mechanisms, and API boundary definitions.`
  ];
  const fullText = sections.join('\n\n');
  const result = await extractTopicsFromSections({ text: fullText, rawPages: sections }, 'two_sections.txt');
  const pageOutcomes = result.pageOutcomes || extractTopicsLocally.lastPageOutcomes;

  assert.ok(Array.isArray(pageOutcomes) && pageOutcomes.length === 2, 'Expected pageOutcomes array with 2 entries');
  assert.equal(pageOutcomes[0].page, 1);
  assert.ok(['topic', 'merged', 'skipped'].includes(pageOutcomes[0].outcome), `Invalid outcome: ${pageOutcomes[0].outcome}`);
  assert.equal(pageOutcomes[1].page, 2);
  assert.ok(['topic', 'merged', 'skipped'].includes(pageOutcomes[1].outcome), `Invalid outcome: ${pageOutcomes[1].outcome}`);
});

test('8d. buildExtractionWarning lists skipped page numbers and returns null when none are skipped', () => {
  assert.equal(typeof buildExtractionWarning, 'function', 'buildExtractionWarning must be exported');

  const noneSkipped = [
    { page: 1, outcome: 'topic', reason: null },
    { page: 2, outcome: 'merged', reason: 'merged into a group ("Topic 1")' }
  ];
  assert.equal(buildExtractionWarning(noneSkipped), null);

  const someSkipped = [
    { page: 1, outcome: 'topic', reason: null },
    { page: 8, outcome: 'skipped', reason: 'cover filter' },
    { page: 9, outcome: 'skipped', reason: 'references filter' }
  ];
  const warning = buildExtractionWarning(someSkipped);
  assert.ok(typeof warning === 'string', 'Warning should be a string');
  assert.ok(warning.includes('8') && warning.includes('9'), `Warning should list pages 8 and 9: "${warning}"`);
});

test('8d-1. formatPageRanges pure function unit tests: empty list, single page, consecutive run, mixed, unsorted input, duplicates', () => {
  assert.equal(typeof formatPageRanges, 'function', 'formatPageRanges must be exported');

  // empty list
  assert.equal(formatPageRanges([]), '');

  // single page
  assert.equal(formatPageRanges([5]), '5');

  // consecutive run
  assert.equal(formatPageRanges([1, 2, 3, 4]), '1-4');

  // mixed
  assert.equal(formatPageRanges([2, 3, 4, 5, 9, 11, 12]), '2-5, 9, 11-12');

  // unsorted input
  assert.equal(formatPageRanges([12, 5, 2, 11, 4, 9, 3]), '2-5, 9, 11-12');

  // duplicates
  assert.equal(formatPageRanges([2, 3, 3, 4, 5, 5, 9, 11, 12, 12]), '2-5, 9, 11-12');
});

test('8d-2. buildExtractionWarning formats consecutive skipped pages as ranges', () => {
  const skippedRun = [
    { page: 1, outcome: 'topic', reason: null },
    { page: 2, outcome: 'skipped', reason: 'low text' },
    { page: 3, outcome: 'skipped', reason: 'low text' },
    { page: 4, outcome: 'skipped', reason: 'low text' },
    { page: 5, outcome: 'skipped', reason: 'low text' },
    { page: 9, outcome: 'skipped', reason: 'low text' },
    { page: 11, outcome: 'skipped', reason: 'low text' },
    { page: 12, outcome: 'skipped', reason: 'low text' }
  ];
  const warning = buildExtractionWarning(skippedRun);
  assert.equal(warning, 'Pages 2-5, 9, 11-12 were skipped: low text');
});

test('8d-3. Cancel toast: "Cancelled, showing N page(s)" with correct singular/plural for N=1 and N=2', () => {
  assert.equal(typeof formatCancelToast, 'function', 'formatCancelToast must be exported');
  assert.equal(formatCancelToast(1), 'Cancelled, showing 1 page');
  assert.equal(formatCancelToast(2), 'Cancelled, showing 2 pages');
  assert.equal(formatCancelToast(0), 'Cancelled, showing 0 pages');
  assert.equal(formatCancelToast(42), 'Cancelled, showing 42 pages');
});

test('8e. A cover slide with 300+ characters (title, names, academic year) is skipped as cover', async () => {
  const coverSlide300 = `AI/ML-Based Climate-Adaptive Shelter Design
for Thermal Comfort and Energy Efficiency
Technical Seminar
Name:
Vaishakhi Palkar
Sneha Dubey
Vardhan Sharma
Sumit Mahajan
Guide:
Amrut Nikam
Academic Year: 2026–27 | Semester V
School of Engineering & Technology
Department of Computer Science & Engineering
Pimpri Chinchwad College of Engineering`;

  assert.ok(coverSlide300.length >= 300, `Cover slide should be at least 300 chars, got ${coverSlide300.length}`);
  const contentSlide = `Thermal Comfort Modeling and Systems
This is substantive body content for slide 2 that provides in-depth technical analysis and formulations for building climate control systems. Extensive documentation is included here to ensure proper extraction across units and modules.`;

  const sections = [coverSlide300, contentSlide];
  const fullText = sections.join('\n\n');
  const topics = await extractTopicsLocally(fullText, sections, 'cover_test.txt', { forcePath: 'structured' });

  assert.ok(Array.isArray(topics.pageOutcomes), 'pageOutcomes array must be present');
  const page1Outcome = topics.pageOutcomes.find(p => p.page === 1);
  assert.ok(page1Outcome, 'Page 1 outcome must be recorded');
  assert.equal(page1Outcome.outcome, 'skipped');
  assert.equal(page1Outcome.reason, 'cover filter');
  assert.equal(topics.length, 1, `Expected only 1 topic (slide 2), got ${topics.length}`);
});
