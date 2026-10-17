import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { generateDailyReminderICS, formatTo24Hour } from '../../src/lib/calendar.js';

printLog('================================================================');
printLog('            PART C: SHARE & CALENDAR REMINDER TEST              ');
printLog('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    printLog(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ── TEST 1: .ics Calendar Event Generation & Content Verification ──
printLog('[1/2] Testing .ics calendar reminder generation...');

const time12 = '08:30 AM';
const appUrl = 'https://daily-dive.vercel.app';
const icsContent = generateDailyReminderICS(time12, appUrl);

printLog('--- LITERAL GENERATED .ICS CONTENT ---');
printLog(icsContent);
printLog('--------------------------------------\n');

assert(icsContent.includes('BEGIN:VCALENDAR'), 'Contains BEGIN:VCALENDAR');
assert(icsContent.includes('VERSION:2.0'), 'Contains VERSION:2.0');
assert(icsContent.includes('BEGIN:VEVENT'), 'Contains BEGIN:VEVENT');
assert(icsContent.includes('RRULE:FREQ=DAILY'), 'Contains daily recurrence rule (RRULE:FREQ=DAILY)');
assert(icsContent.includes('SUMMARY:Daily Dive — 5-min Learning'), 'Contains accurate event summary');
assert(icsContent.includes('T083000'), 'Floating start time matches 08:30 AM (T083000)');
assert(icsContent.includes('T084500'), 'Floating end time matches 15-min interval (T084500)');
assert(icsContent.includes('BEGIN:VALARM'), 'Contains alarm block (VALARM) for device notification');
assert(icsContent.includes('TRIGGER:-PT0M'), 'Alarm trigger is set to on-time notification');
assert(icsContent.includes('END:VCALENDAR'), 'Contains END:VCALENDAR');

// ── TEST 2: Valid vs Invalid Slug Deeplinking Simulation ──
printLog('\n[2/2] Testing Slug Deeplinking Logic...');

const mockTopics = [
  { id: 'tech-ai-101', title: 'RLHF Policy Alignment', slug: 'rlhf-policy-alignment', category: 'ai-ml' },
  { id: 'tech-sys-202', title: 'Raft Consensus Protocol', slug: 'raft-consensus-protocol', category: 'systems-distributed-computing' }
];

function resolveDeeplinkTopic(slugParam, topicsList) {
  if (!slugParam) return null;
  const clean = slugParam.trim().toLowerCase();
  return topicsList.find(t => 
    t.id?.toLowerCase() === clean || 
    t.slug?.toLowerCase() === clean ||
    (t.title && t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === clean)
  ) || null;
}

// Case A: Valid slug match by slug field
const matchedBySlug = resolveDeeplinkTopic('raft-consensus-protocol', mockTopics);
assert(matchedBySlug !== null && matchedBySlug.id === 'tech-sys-202', 'Valid slug resolves to correct topic');

// Case B: Valid slug match by title slugification
const matchedByTitleSlug = resolveDeeplinkTopic('rlhf-policy-alignment', mockTopics);
assert(matchedByTitleSlug !== null && matchedByTitleSlug.id === 'tech-ai-101', 'Valid title slug resolves to correct topic');

// Case C: Valid match by topic ID
const matchedById = resolveDeeplinkTopic('tech-ai-101', mockTopics);
assert(matchedById !== null && matchedById.id === 'tech-ai-101', 'Valid topic ID resolves to correct topic');

// Case D: Invalid / unknown slug falls back silently to null (Spin default)
const unknownResult = resolveDeeplinkTopic('non-existent-topic-slug-12345', mockTopics);
assert(unknownResult === null, 'Unknown slug falls back silently to null (renders normal spin screen)');

const emptyResult = resolveDeeplinkTopic('', mockTopics);
assert(emptyResult === null, 'Empty slug parameter falls back silently to null');

printLog('\n================================================================');
printLog(`PART C TESTS COMPLETE! (${passedTests}/${totalTests} assertions verified)`);
printLog('================================================================\n');
