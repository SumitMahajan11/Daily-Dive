import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { scoreHoldout } from '../scripts/eval/score_holdout.mjs';

test('scoreHoldout correctly computes TP/FP/FN/TN metrics with stubbed extractor and synthetic CSV', async () => {
  const tempCsvPath = path.resolve('scratch/test_synthetic_labeled.csv');
  
  // 4 rows in CSV corresponding to 4 outcomes:
  // 1. label="junk", flagged -> TP
  // 2. label="junk", unflagged -> FN
  // 3. label="good", flagged -> FP
  // 4. label="good", unflagged -> TN
  const csvContent = [
    'file,page,title,label',
    '"synthetic_doc.pdf",1,"Topic 1 - Junk Flagged",junk',
    '"synthetic_doc.pdf",2,"Topic 2 - Junk Missed",junk',
    '"synthetic_doc.pdf",3,"Topic 3 - Good Flagged",good',
    '"synthetic_doc.pdf",4,"Topic 4 - Good Clean",good'
  ].join('\n') + '\n';

  fs.mkdirSync(path.dirname(tempCsvPath), { recursive: true });
  fs.writeFileSync(tempCsvPath, csvContent, 'utf8');

  try {
    const stubbedExtractor = async (fileName) => {
      assert.equal(fileName, 'synthetic_doc.pdf');
      return {
        extractedData: { pageCount: 4 },
        topics: [
          { title: 'Topic 1 - Junk Flagged', needs_review: true },
          { title: 'Topic 2 - Junk Missed', needs_review: false },
          { title: 'Topic 3 - Good Flagged', needs_review: true },
          { title: 'Topic 4 - Good Clean', needs_review: false }
        ]
      };
    };

    const result = await scoreHoldout({
      csvPath: tempCsvPath,
      files: ['synthetic_doc.pdf'],
      extractor: stubbedExtractor,
      silent: true
    });

    assert.equal(result.totals.overallTP, 1, 'TP must be 1');
    assert.equal(result.totals.overallFP, 1, 'FP must be 1');
    assert.equal(result.totals.overallFN, 1, 'FN must be 1');
    assert.equal(result.totals.overallTN, 1, 'TN must be 1');

    assert.equal(result.docStats.length, 1);
    assert.equal(result.docStats[0].TP, 1);
    assert.equal(result.docStats[0].FP, 1);
    assert.equal(result.docStats[0].FN, 1);
    assert.equal(result.docStats[0].TN, 1);
    assert.equal(result.docStats[0].pages, 4);
    assert.equal(result.docStats[0].topics, 4);
  } finally {
    if (fs.existsSync(tempCsvPath)) {
      fs.unlinkSync(tempCsvPath);
    }
  }
});

test('scoreHoldout refuses to run if labels are blank', async () => {
  const tempCsvPath = path.resolve('scratch/test_synthetic_blank_labels.csv');
  
  const csvContent = [
    'file,page,title,label',
    '"synthetic_doc.pdf",1,"Topic 1 - Good",good',
    '"synthetic_doc.pdf",2,"Topic 2 - Unlabeled",',
    '"synthetic_doc.pdf",3,"Topic 3 - Blank",""'
  ].join('\n') + '\n';

  fs.mkdirSync(path.dirname(tempCsvPath), { recursive: true });
  fs.writeFileSync(tempCsvPath, csvContent, 'utf8');

  try {
    await assert.rejects(
      async () => {
        await scoreHoldout({
          csvPath: tempCsvPath,
          files: ['synthetic_doc.pdf'],
          throwOnBlank: true,
          silent: true
        });
      },
      /Refusing to run: 2 labels are blank/
    );
  } finally {
    if (fs.existsSync(tempCsvPath)) {
      fs.unlinkSync(tempCsvPath);
    }
  }
});
