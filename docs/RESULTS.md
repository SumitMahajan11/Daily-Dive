# Daily Dive – Results Snapshot (commit 15c)

## Build Numbers (Evaluated over D:\DailyDive-Eval\build)

Ran `extractFromPdf` + `extractTopicsFromSections` over the 31 build PDFs in `D:\DailyDive-Eval\build` (same corpus set as the earlier 324/114/0 reference run; 28 digital text PDFs extracted, 3 scanned/vector-only require OCR):

| Metric | Earlier Run | Current Run (15c) | Delta |
|---|---|---|---|
| Extracted PDFs | 28 (of 31) | 28 (of 31) | 0 |
| Total topics extracted | 324 | **396** | **+72** |
| Topics flagged for review | 114 | **167** | **+53** |
| Provenance violations | 0 | **0** | **0** |
| Full test suite | 630 pass · 0 fail | **630 pass · 0 fail** | 0 |

### Per-File Deltas Where Topics Changed (8 files)
- `Sumit_Mahajan_Resume.pdf`: 1 -> 31 (+30) [list/sequence fallback extracts discrete items instead of raw text block]
- `Sumit_Mahajan_Resume (3) (1).pdf`: 1 -> 30 (+29) [list/sequence fallback extracts discrete items]
- `notes-3-4.docx.pdf`: 26 -> 33 (+7) [improved sectioning & cover slide filtering on multi-page text notes]
- `unit-III  front end framework (5).pptx.pdf`: 21 -> 23 (+2)
- `unit-IV Back End Technology -2 (1).pptx.pdf`: 19 -> 20 (+1)
- `Assignment No. 05 _2026 _Updated (1).pdf`: 1 -> 2 (+1)
- `Assignment No. 05 _2026 _Updated.pdf`: 1 -> 2 (+1)
- `kartik awp 9.pdf`: 5 -> 6 (+1)
- *Remaining 20 extracted PDFs*: identical topic counts across both runs.
- *3 OCR-dependent PDFs* (`1000142068 (1).pdf`, `Chapter 2 DES Updated.pptx (1).pdf`, `Chapter 2 DES Updated.pptx.pdf`): 0 text layer; require OCR.

## Test Regressions (Commit 47d8cdb vs HEAD)

Measured directly in a clean worktree at commit `47d8cdb` (after `npm install` and build) and at `HEAD`:

| Script | Exit Code (47d8cdb) | Exit Code (HEAD) | First Failing Assertion / Outcome | Regressed in 10a? |
|---|---|---|---|---|
| `test_e2e_real_tabs.mjs` | **1** | **1** | `Library section top must be within 80px, got: 1089.5` (47d8cdb) / `1113.5` (HEAD) | **No** (pre-existing single-page scroll offset) |
| `test_hygiene.mjs` | **0** | **0** | All 9 checks passed on both commits | **No** |
| `test_spin_timing.mjs` | **1** | **1** | `AssertionError: Number of ticks must be at least 15, got 0` | **No** (pre-existing; Web Audio ticks disabled in headless) |

## Holdout Coverage (scripts/run_holdout_extractor.mjs)

| Document | Pages | Path Counts (text / ocr / empty / notProcessed) | Topics | Flagged |
|---|---|---|---|---|
| `MIT6_046JS15_lec07.pdf` | 33 | 33 text / 0 ocr / 0 empty / 0 notProcessed | 26 | 9 |
| `MIT6_046JS15_lec10.pdf` | 7 | 7 text / 0 ocr / 0 empty / 0 notProcessed | 6 | 1 |
| `MIT6_046JS15_writtenlec23.pdf` | 11 | 1 text / 0 ocr / 10 empty / 0 notProcessed | 1 | 0 |
| `MIT6_046JS15_lec02.pdf` | 7 | 7 text / 0 ocr / 0 empty / 0 notProcessed | 7 | 3 |
| `MIT6_046JS15_writtenlec6.pdf` | 11 | 1 text / 0 ocr / 10 empty / 0 notProcessed | 1 | 0 |
| `MIT6_046JS15_lec13.pdf` | 20 | 20 text / 0 ocr / 0 empty / 0 notProcessed | 20 | 3 |
| `MIT6_046JS15_writtenlec3.pdf` | 8 | 1 text / 0 ocr / 7 empty / 0 notProcessed | 1 | 0 |
| `MIT6_046JS15_writtenlec11.pdf` | 9 | 1 text / 0 ocr / 8 empty / 0 notProcessed | 1 | 0 |
| **Total** | **106** | **71 text / 0 ocr / 35 empty / 0 notProcessed** | **63** | **16** |

Totals equal earlier run (63/16): 4 digital slide decks have selectable text layers; 4 handwritten lectures have vector handwriting without text layers on pages 2+ where OCR cannot run in Node (no canvas), falling back to 1 topic from page 1 text.

## Known Gaps

1. **OCR cannot run in Node.js** – `pdfjs-dist` requires a DOM/canvas; Node sets `ocrCouldNotRun: true` ("no canvas").
2. **One course only** – All 8 holdout files come from MIT 6.046J; coverage is not representative of a multi-domain corpus.
3. **Circular dev labels** – `flag_labels.json` was derived from development builds rather than external annotation.
4. **pdfjs font warnings** – Parser emits `TT: undefined function: 21/32` warnings for subsetted fonts.
5. **Holdout is smoke-only** – `reports/holdout_run.json` tests pipeline completion without qualitative ground truth.
6. **Holdout titles un-blinded** – `reports/holdout_titles_blind.csv` was unblinded in 14b; retained for reference only.
