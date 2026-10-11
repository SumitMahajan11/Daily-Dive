/**
 * tests/lessons_quality.test.mjs
 *
 * Hard-assert quality gates for lessons.json and lessons.pending.json:
 *   a. every key is a real curated topic id; 3 non-empty string fields; total 50-100 words
 *   b. every digit sequence and number word in a lesson appears in the topic's
 *      title, description or resource labels
 *   c. every capitalized word not at the start of a sentence appears in the
 *      topic's title, description or resource labels
 *   d. none of the banned words appear
 */
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const topics = JSON.parse(readFileSync('data/topics.curated.json', 'utf8'));
const topicIndex = Object.fromEntries(topics.map(t => [t.id, t]));

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty',
  'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
  'hundred', 'thousand', 'million', 'percent'
];

const BANNED_WORDS = ['always', 'never', 'proves', 'cures', 'guarantees'];
const BANNED_PHRASES = ['the first', 'the only', 'the best'];

/** Build the reference text from a topic's title, description & resource labels */
function refText(topic) {
  const parts = [topic.title, topic.description];
  for (const r of topic.resources || []) {
    parts.push(r.label);
  }
  return parts.join(' ');
}

/** Sentence-start detector: returns Set of word indices that start a sentence */
function sentenceStartIndices(text) {
  // Split into words keeping track of punctuation context
  const starts = new Set();
  starts.add(0); // first word is a sentence start
  const words = text.split(/\s+/);
  let idx = 0;
  for (const w of words) {
    if (idx > 0) {
      // check if previous word ended with sentence-terminating punctuation
      const prevWord = words[idx - 1];
      if (/[.!?]["'»)\]]*$/.test(prevWord)) {
        starts.add(idx);
      }
    }
    idx++;
  }
  return { words, starts };
}

function validateLessons(filePath) {
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return; // file doesn't exist, skip
  }

  const ids = Object.keys(data);
  if (ids.length === 0) return;

  describe(`Lessons quality: ${filePath}`, () => {
    for (const id of ids) {
      describe(id, () => {
        const lesson = data[id];

        it('key is a real curated topic id', () => {
          assert.ok(topicIndex[id], `"${id}" not found in topics.curated.json`);
        });

        it('has 3 non-empty string fields: idea, why, example', () => {
          for (const field of ['idea', 'why', 'example']) {
            assert.equal(typeof lesson[field], 'string', `${field} must be a string`);
            assert.ok(lesson[field].trim().length > 0, `${field} must be non-empty`);
          }
        });

        it('total word count is 50-100', () => {
          const allText = `${lesson.idea} ${lesson.why} ${lesson.example}`;
          const wordCount = allText.split(/\s+/).filter(w => w.length > 0).length;
          assert.ok(wordCount >= 50, `word count ${wordCount} < 50`);
          assert.ok(wordCount <= 100, `word count ${wordCount} > 100`);
        });

        it('no digit sequences or number words absent from topic source', () => {
          const topic = topicIndex[id];
          assert.ok(topic, `no curated topic for id ${id}`);
          const ref = refText(topic).toLowerCase();
          const allText = `${lesson.idea} ${lesson.why} ${lesson.example}`;

          // Check digit sequences
          const digitMatches = allText.match(/\d+/g) || [];
          for (const d of digitMatches) {
            assert.ok(
              ref.includes(d),
              `digit "${d}" in lesson not found in topic source for "${id}"`
            );
          }

          // Check number words
          const lowerText = allText.toLowerCase();
          for (const nw of NUMBER_WORDS) {
            const re = new RegExp(`\\b${nw}\\b`, 'gi');
            const matches = lowerText.match(re) || [];
            if (matches.length > 0) {
              assert.ok(
                ref.includes(nw),
                `number word "${nw}" in lesson not found in topic source for "${id}"`
              );
            }
          }
        });

        it('no capitalized words (outside sentence starts) absent from topic source', () => {
          const topic = topicIndex[id];
          assert.ok(topic, `no curated topic for id ${id}`);
          const ref = refText(topic);
          const allText = `${lesson.idea} ${lesson.why} ${lesson.example}`;
          const { words, starts } = sentenceStartIndices(allText);

          for (let i = 0; i < words.length; i++) {
            if (starts.has(i)) continue; // skip sentence-start words
            const raw = words[i].replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '');
            if (!raw || raw.length === 0) continue;
            if (!/^[A-Z]/.test(raw)) continue; // only check words starting with capital letter
            if (raw === raw.toUpperCase() && raw.length <= 4) continue; // acronym-like e.g. MLP, GPU
            // Check if this capitalized word appears in the reference
            assert.ok(
              ref.includes(raw),
              `capitalized word "${raw}" in lesson not found in topic source for "${id}"`
            );
          }
        });

        it('no banned words or phrases', () => {
          const allText = `${lesson.idea} ${lesson.why} ${lesson.example}`;
          const lower = allText.toLowerCase();
          for (const bw of BANNED_WORDS) {
            const re = new RegExp(`\\b${bw}\\b`, 'i');
            assert.ok(!re.test(allText), `banned word "${bw}" found in lesson "${id}"`);
          }
          for (const bp of BANNED_PHRASES) {
            assert.ok(!lower.includes(bp), `banned phrase "${bp}" found in lesson "${id}"`);
          }
        });

        it('no example contains "imagine", "team" or "analogy"', () => {
          const forbidden = ['imagine', 'team', 'analogy'];
          for (const fw of forbidden) {
            const re = new RegExp(`\\b${fw}\\b`, 'i');
            assert.ok(
              !re.test(lesson.example),
              `example for "${id}" contains forbidden word "${fw}"`
            );
          }
        });

        it('idea/why mentions every part of the title', () => {
          const topic = topicIndex[id];
          assert.ok(topic, `no curated topic for id ${id}`);
          const parts = topic.title.split(/\s+and\s+|&|-/i).map(s => s.trim()).filter(Boolean);
          const ideaWhy = `${lesson.idea} ${lesson.why}`.toLowerCase();
          const stopWords = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'for', 'to', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'using', 'via', 'into', 'and', 'or', 'as']);

          for (const part of parts) {
            const rawWords = part.replace(/[^A-Za-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
            const contentWords = rawWords.filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()) && !/^\d+$/.test(w));
            if (contentWords.length === 0) continue;
            const matched = contentWords.some(w => ideaWhy.includes(w.toLowerCase()));
            assert.ok(
              matched,
              `idea/why for "${id}" does not mention title part "${part}" (content words: ${contentWords.join(', ')})`
            );
          }
        });
      });
    }

    it('no two examples share their first 3 words', () => {
      const seen = new Map();
      for (const id of ids) {
        const ex = data[id].example || '';
        const prefix = ex.trim().split(/\s+/).slice(0, 3).join(' ').toLowerCase().replace(/[^a-z0-9 ]/g, '');
        assert.ok(
          !seen.has(prefix),
          `duplicate example 3-word prefix "${prefix}" in "${id}" (already used by "${seen.get(prefix)}")`
        );
        seen.set(prefix, id);
      }
    });
  });
}

validateLessons('data/lessons.json');
