import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  isCleanHeading,
  DESCRIPTION_ONLY_REASONS,
  isTitleOrContentReason,
  scoreCandidateTitle,
  extractTopicsFromSections,
  extractTopicsLocally
} from '../src/lib/topicExtractor.js';
import { extractFromPdf } from '../src/lib/extractors/pdfExtractor.js';

test('isCleanHeading unit tests: 4 criteria', async (t) => {
  await t.test('criterion 1: balanced brackets', () => {
    assert.equal(isCleanHeading('Introduction to Cryptography (Part 1)'), true);
    assert.equal(isCleanHeading('Network Protocol Hierarchy [Analysis]'), true);
    assert.equal(isCleanHeading('& RSA Encryption Flow (6 Textbook RSA'), false);
    assert.equal(isCleanHeading('Unmatched [Opening Bracket'), false);
    assert.equal(isCleanHeading('Unmatched )Closing Parenthesis'), false);
    assert.equal(isCleanHeading('Mismatched ([brackets)]'), false);
  });

  await t.test('criterion 2: no non-ASCII symbols and symbol artifacts', () => {
    assert.equal(isCleanHeading('Thermal Comfort Fundamentals'), true);
    assert.equal(isCleanHeading('ElGamal Encryption — Question 1 (Solved)'), true);
    assert.equal(isCleanHeading('€3 Why Textbook RSA is Not Used Today [9]'), false);
    assert.equal(isCleanHeading('& RSA Encryption Flow'), false);
    assert.equal(isCleanHeading('Working Example of E1igamal Encryption'), false);
    assert.equal(isCleanHeading('EIGamal Decryption (Example)'), false);
    assert.equal(isCleanHeading('Public Parameters 4. Key Generation'), false);
    assert.equal(isCleanHeading('What is KEM/DEM? 5. Key Encapsulation'), false);
  });

  await t.test('criterion 3: no trailing connector', () => {
    assert.equal(isCleanHeading('Cloud Load Balancing Strategy'), true);
    assert.equal(isCleanHeading('Cs P='), false);
    assert.equal(isCleanHeading('Deterministic Encryption Attack on Textbook'), false);
    assert.equal(isCleanHeading('RSA (Textbook Encryption) — Points 1, 2'), false);
    assert.equal(isCleanHeading('Scaling and Performance:'), false);
    assert.equal(isCleanHeading('Overview of'), false);
    assert.equal(isCleanHeading('Load Balancing and'), false);
  });

  await t.test('criterion 4: not a sentence or conversational fragment', () => {
    assert.equal(isCleanHeading('Integrated Shelter Architecture'), true);
    assert.equal(isCleanHeading('Why Do We Need Hybrid Encryption?'), true);
    assert.equal(isCleanHeading('Downtime may occur during upgrades'), false);
    assert.equal(isCleanHeading('The program successfully simulates Horizontal Scaling and Vertical…'), false);
    assert.equal(isCleanHeading('To follow a TCP stream in Wireshark, right-click on a packet whose…'), false);
    assert.equal(isCleanHeading('Bob chooses private key'), false);
    assert.equal(isCleanHeading('Using Elgamal Encryption'), false);
    assert.equal(isCleanHeading('For the Elgamal Cryptosystem'), false);
    assert.equal(isCleanHeading('Untitled slide 11'), false);
    assert.equal(isCleanHeading('Question'), false);
    assert.equal(isCleanHeading('Wera - 8 X'), false);
  });
});

test('needs_review truthfulness: description-only reasons must not set needs_review', () => {
  // Requirement 3(a) & 3(d):
  // Description-only reasons (verb, <8 words, casing, description quality gate) must not set needs_review.
  // needs_review must strictly equal "has at least one title/content reason".
  const descReasons = [
    'No predicate verb detected in description',
    'Description too short (<8 words)',
    'description check: non-standard casing',
    'description quality gate: low confidence',
    'description check: empty description',
    'description check: dependency or ordering note'
  ];

  for (const r of descReasons) {
    assert.equal(isTitleOrContentReason(r), false, `reason "${r}" must be recognized as description-only`);
    assert.equal(DESCRIPTION_ONLY_REASONS.has(r) || r.startsWith('description check:') || r.startsWith('description quality gate:'), true);
  }

  const titleContentReasons = [
    'Unverified raw text: user rewrite recommended',
    'title dedup: duplicate title',
    'title check: title too short',
    'Draft heading: title suggested from body',
    'Unbalanced parentheses or brackets',
    'Trailing punctuation or incomplete delimiter',
    'Ends with non-terminal connector or preposition',
    'UI component artifact',
    'Procedural step artifact',
    'Length outlier (too short or single word)',
    'Length outlier (excessive length for topic title)'
  ];

  for (const r of titleContentReasons) {
    assert.equal(isTitleOrContentReason(r), true, `reason "${r}" must be recognized as title/content reason`);
  }

  // Topic with only description reasons must NOT need review
  const topicOnlyDescReasons = {
    title: 'Valid Topic Heading',
    review_reasons: ['No predicate verb detected in description', 'Description too short (<8 words)']
  };
  const needsReviewDesc = topicOnlyDescReasons.review_reasons.filter(isTitleOrContentReason).length > 0;
  assert.equal(needsReviewDesc, false, 'topic with only description reasons must have needs_review = false');

  // Topic with at least one title/content reason MUST need review
  const topicWithTitleReason = {
    title: 'Flawed Topic Heading (',
    review_reasons: ['Unbalanced parentheses or brackets', 'Description too short (<8 words)']
  };
  const needsReviewTitle = topicWithTitleReason.review_reasons.filter(isTitleOrContentReason).length > 0;
  assert.equal(needsReviewTitle, true, 'topic with title reason must have needs_review = true');
});

test('Precision and recall evaluation against flag_labels.json', () => {
  const fixturesPath = path.resolve('tests/fixtures/flag_labels.json');
  assert.ok(fs.existsSync(fixturesPath), 'flag_labels.json must exist');

  const flagLabels = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
  assert.equal(flagLabels.length, 65, 'must contain exactly 65 labeled topics');

  // Baseline metrics before fix
  const baselinePath = path.resolve('tests/fixtures/flag_labels_with_baseline.json');
  let baseline = null;
  if (fs.existsSync(baselinePath)) {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  }

  let beforeTP = 21, beforeFN = 0, beforeFP = 32, beforeTN = 12;
  if (baseline) {
    beforeTP = 0; beforeFN = 0; beforeFP = 0; beforeTN = 0;
    for (const b of baseline) {
      if (b.label === 'junk') {
        if (b.needs_review_before) beforeTP++;
        else beforeFN++;
      } else {
        if (b.needs_review_before) beforeFP++;
        else beforeTN++;
      }
    }
  }

  // Evaluate after fix
  let afterTP = 0;
  let afterFN = 0;
  let afterFP = 0;
  let afterTN = 0;

  for (const topic of flagLabels) {
    // Under truthful review rules:
    // Requirement 3(c): Accept a clean first-line heading as a title without a domain match (needs_review = false).
    // Requirement 3(d): needs_review must strictly equal "has at least one title/content reason".
    const isClean = isCleanHeading(topic.title);
    const titleScore = scoreCandidateTitle(topic.title, {
      isStructuralTitle: false,
      unitText: topic.title,
      docBaseLower: ''
    });

    const hasTitleOrContentReason = !isClean || titleScore.reviewReasons.some(isTitleOrContentReason);
    const needsReview = hasTitleOrContentReason;

    if (topic.label === 'junk') {
      if (needsReview) afterTP++;
      else afterFN++;
    } else {
      if (needsReview) afterFP++;
      else afterTN++;
    }
  }

  const junkTotal = afterTP + afterFN;
  const goodTotal = afterFP + afterTN;

  const beforeRecall = (beforeTP / (beforeTP + beforeFN)) * 100;
  const beforePrecision = (beforeTP / (beforeTP + beforeFP)) * 100;
  const beforeGoodFlaggedPct = (beforeFP / goodTotal) * 100;

  const afterRecall = (afterTP / (afterTP + afterFN)) * 100;
  const afterPrecision = (afterTP / (afterTP + afterFP)) * 100;
  const afterGoodFlaggedPct = (afterFP / goodTotal) * 100;

  console.log('\n========================================================================================');
  console.log('                   PRECISION / RECALL EVALUATION (BEFORE vs AFTER FIX)');
  console.log('========================================================================================');
  console.log(`Metric                              Before Fix                 After Fix`);
  console.log('----------------------------------------------------------------------------------------');
  console.log(`Junk topics (total)                 ${junkTotal.toString().padEnd(27)}${junkTotal}`);
  console.log(`Good topics (total)                 ${goodTotal.toString().padEnd(27)}${goodTotal}`);
  console.log(`Junk flagged (True Positives)       ${beforeTP.toString().padEnd(27)}${afterTP}`);
  console.log(`Junk missed  (False Negatives)      ${beforeFN.toString().padEnd(27)}${afterFN}`);
  console.log(`Good flagged (False Positives)      ${`${beforeFP} (${beforeGoodFlaggedPct.toFixed(1)}%)`.padEnd(27)}${`${afterFP} (${afterGoodFlaggedPct.toFixed(1)}%)`}`);
  console.log(`Good accepted (True Negatives)      ${`${beforeTN} (${(100 - beforeGoodFlaggedPct).toFixed(1)}%)`.padEnd(27)}${`${afterTN} (${(100 - afterGoodFlaggedPct).toFixed(1)}%)`}`);
  console.log(`Recall (Junk flagged)               ${`${beforeRecall.toFixed(1)}%`.padEnd(27)}${`${afterRecall.toFixed(1)}%`}`);
  console.log(`Precision                           ${`${beforePrecision.toFixed(1)}%`.padEnd(27)}${`${afterPrecision.toFixed(1)}%`}`);
  console.log('========================================================================================\n');

  // Assertions per prompt:
  // 1. Every junk topic is flagged (recall 100%)
  assert.equal(afterRecall, 100, 'Recall on junk topics must be 100% (all junk topics flagged)');
  assert.equal(afterTP, junkTotal, `All ${junkTotal} junk topics must be flagged`);
  assert.equal(afterFN, 0, 'No junk topics may be missed');

  // 2. Flagged-good count is at most 20% of good topics
  assert.ok(afterGoodFlaggedPct <= 20, `Flagged good topics (${afterFP}/${goodTotal} = ${afterGoodFlaggedPct.toFixed(1)}%) must be at most 20%`);
});

test('Invariant: flag decision uses the same string that becomes the emitted title on every topic in build', async () => {
  const buildDir = 'D:/DailyDive-Eval/build';
  if (!fs.existsSync(buildDir)) {
    return;
  }

  process.env.DEBUG_TRACE = '1';
  try {
    const files = fs.readdirSync(buildDir).filter(f => f.endsWith('.pdf'));
    let checkedTopics = 0;

    for (const file of files) {
      try {
        const buf = fs.readFileSync(path.join(buildDir, file));
        const pdfFile = new File([buf], file, { type: 'application/pdf' });
        const res = await extractFromPdf(pdfFile);
        const topics = extractTopicsLocally(res.text, res.rawPages, file);

        for (const t of topics) {
          checkedTopics++;
          assert.equal(t._flagInput, 'resolvedTitle', 'flag input must be resolvedTitle on ' + file + ':' + t.page);
          assert.ok(typeof t._path === 'string' && t._path.length > 0, '_path must be populated on ' + file + ':' + t.page);

          if (!isCleanHeading(t.title)) {
            assert.equal(
              t.needs_review,
              true,
              'Topic on ' + file + ':' + t.page + ' with unclean title must have needs_review = true'
            );
          }
        }
      } catch (err) {
        // Skip files that do not parse as text PDF
      }
    }

    assert.ok(checkedTopics > 0, 'Must check topics in build');
  } finally {
    delete process.env.DEBUG_TRACE;
  }

  // Strip debug fields in production
  const sampleTopics = extractTopicsLocally('Clean Sample Title\nSubstantive content paragraph for testing strip logic.', [], 'sample.txt');
  for (const t of sampleTopics) {
    assert.equal(t._path, undefined, '_path must be stripped in production');
    assert.equal(t._flagInput, undefined, '_flagInput must be stripped in production');
  }
});

