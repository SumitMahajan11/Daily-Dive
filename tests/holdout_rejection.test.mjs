import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateHoldout } from '../scripts/make_holdout.mjs';
import { safeLog } from '../scripts/safeLog.mjs';

test('Holdout Rejection Paths: proves every rejection path fires on synthetic files', () => {
  const syntheticDir = path.resolve('scratch/synthetic_test_candidates');
  if (fs.existsSync(syntheticDir)) {
    fs.rmSync(syntheticDir, { recursive: true, force: true });
  }
  fs.mkdirSync(syntheticDir, { recursive: true });

  const tempManifest = path.resolve('scratch/synthetic_manifest.csv');

  try {
    // Path 1: Non-PDF rejection (.docx)
    fs.writeFileSync(path.join(syntheticDir, 'test_synthetic_doc.docx'), 'dummy non-pdf');

    // Path 2: Duplicate hash rejection (exact byte-for-byte duplicate)
    fs.writeFileSync(path.join(syntheticDir, 'duplicate_hash_sample_a.pdf'), 'same-binary-payload-xyz');
    fs.writeFileSync(path.join(syntheticDir, 'duplicate_hash_sample_b.pdf'), 'same-binary-payload-xyz');

    // Path 3: Banned keyword pattern (resume|cv|certificate|attendance|passport|invoice)
    fs.writeFileSync(path.join(syntheticDir, 'synthetic_user_resume.pdf'), 'resume-content');
    fs.writeFileSync(path.join(syntheticDir, 'attendance_log_file.pdf'), 'attendance-content');

    // Path 4: Dev-label source rejection (flag_labels.json source name or hash)
    fs.writeFileSync(path.join(syntheticDir, 'Unit IV Updated SAS.pptx.pdf'), 'synthetic-dev-label-payload');

    // Path 5: Heldout-label source rejection (heldout_labels source name or hash)
    fs.writeFileSync(path.join(syntheticDir, 'lecture_systems.pptx.pdf'), 'synthetic-heldout-label-payload');

    // Path 6: Fixture rejection (tests/fixtures name or hash)
    if (fs.existsSync('tests/fixtures/corrupt_test_file.pdf')) {
      fs.copyFileSync('tests/fixtures/corrupt_test_file.pdf', path.join(syntheticDir, 'fixture_copy_sample.pdf'));
    } else {
      fs.writeFileSync(path.join(syntheticDir, 'corrupt_test_file.pdf'), 'corrupt-fixture');
    }

    // Path 7: Build rejection (D:/DailyDive-Eval/build name or hash)
    if (fs.existsSync('D:/DailyDive-Eval/build')) {
      const buildFiles = fs.readdirSync('D:/DailyDive-Eval/build');
      if (buildFiles.length > 0) {
        fs.copyFileSync(path.join('D:/DailyDive-Eval/build', buildFiles[0]), path.join(syntheticDir, 'build_copy_sample.pdf'));
      }
    } else {
      fs.writeFileSync(path.join(syntheticDir, '1000142068 (1).pdf'), 'build-name');
    }

    // Path 7b: Build family rejection (matches normalized stem of build file, e.g. Activity Template_ Add estimation)
    fs.writeFileSync(path.join(syntheticDir, 'Activity Template_ Add estimation _Copy.pdf'), 'synthetic-build-family-payload');

    // Path 7c: Excluded series rejection (starts with assignment, coursera, awp, sepm, experiment)
    fs.writeFileSync(path.join(syntheticDir, 'coursera_novel_deep_learning.pdf'), 'synthetic-excluded-series-payload');

    // Path 8: Family duplicate rejection (same stem 'synthetic report', different content)
    fs.writeFileSync(path.join(syntheticDir, 'synthetic_report_v1.pdf'), 'family-report-alpha');
    fs.writeFileSync(path.join(syntheticDir, 'synthetic_report_v2.pdf'), 'family-report-beta');

    // Valid Clean Document (passes all filters and enters holdout)
    fs.writeFileSync(path.join(syntheticDir, 'valid_unique_whitepaper.pdf'), 'pristine-clean-content-12345');

    const result = generateHoldout(syntheticDir, null, tempManifest);

    // Assert that every single rejection path fired (count > 0)
    assert.ok(result.rejectedNonPdf > 0, 'rejectedNonPdf path must fire');
    assert.ok(result.rejectedDuplicateHash > 0, 'rejectedDuplicateHash path must fire');
    assert.ok(result.rejectedBannedPattern > 0, 'rejectedBannedPattern path must fire');
    assert.ok(result.rejectedDevLabel > 0, 'rejectedDevLabel path must fire');
    assert.ok(result.rejectedHeldoutLabel > 0, 'rejectedHeldoutLabel path must fire');
    assert.ok(result.rejectedFixture > 0, 'rejectedFixture path must fire');
    assert.ok(result.rejectedBuild > 0, 'rejectedBuild path must fire');
    assert.ok(result.rejectedBuildFamily > 0, 'rejectedBuildFamily path must fire');
    assert.ok(result.rejectedExcludedSeries > 0, 'rejectedExcludedSeries path must fire');
    assert.ok(result.rejectedFamilyDuplicate > 0, 'rejectedFamilyDuplicate path must fire');
    assert.ok(result.holdoutCount > 0, 'clean document must be accepted into holdout');

    // Print per-path counts as required
    safeLog('[TEST] Rejection path counts:');
    safeLog('rejectedNonPdf:', result.rejectedNonPdf);
    safeLog('rejectedDuplicateHash:', result.rejectedDuplicateHash);
    safeLog('rejectedBannedPattern:', result.rejectedBannedPattern);
    safeLog('rejectedDevLabel:', result.rejectedDevLabel);
    safeLog('rejectedHeldoutLabel:', result.rejectedHeldoutLabel);
    safeLog('rejectedFixture:', result.rejectedFixture);
    safeLog('rejectedBuild:', result.rejectedBuild);
    safeLog('rejectedBuildFamily:', result.rejectedBuildFamily);
    safeLog('rejectedExcludedSeries:', result.rejectedExcludedSeries);
    safeLog('rejectedFamilyDuplicate:', result.rejectedFamilyDuplicate);
    safeLog('acceptedHoldout:', result.holdoutCount);

  } finally {
    if (fs.existsSync(syntheticDir)) {
      fs.rmSync(syntheticDir, { recursive: true, force: true });
    }
    if (fs.existsSync(tempManifest)) {
      fs.unlinkSync(tempManifest);
    }
  }
});
