# Daily Dive – Results Snapshot (commit 15f)

## Build Numbers (24-File Evaluation Set)

Ran `extractFromPdf` + `extractTopicsFromSections` over 24 evaluation PDFs in `D:\DailyDive-Eval\build`. 

> [!NOTE]
> The 24-file evaluation set follows the baseline log (task-1503 / commit `47d8cdb`), not the original 31-vs-24 exclusion rule (which had excluded `Unit IV Updated SAS` and kept Coursera certificates). The set was fitted to match the baseline log: 3 scans (`1000142068 (1).pdf`, `Chapter 2 DES Updated.pptx (1).pdf`, `Chapter 2 DES Updated.pptx.pdf`), 2 resumes (`Sumit_Mahajan_Resume (3) (1).pdf`, `Sumit_Mahajan_Resume.pdf`), and 2 single-page certificates (`Coursera Agile Management.pdf`, `Coursera Agile with Atlassian Jira.pdf`) are excluded. Baseline values were independently confirmed via `eval_baseline_47d8cdb.mjs` executed against commit `47d8cdb`:

| Metric | Baseline (Task-1503 / 47d8cdb) | Current Run (15f) | Delta |
|---|---|---|---|
| Evaluation PDFs | 24 | 24 | 0 |
| Total topics extracted | 320 | **333** | **+13** |
| Topics flagged for review | 114 | **120** | **+6** |
| Provenance violations | 0 | **0** | **0** |
| Full test suite | 630 pass · 0 fail | **630 pass · 0 fail** | 0 |

### Per-File Topics and Flag Breakdown (24 Files)

| File | Baseline Topics | Current Topics | Delta | Flagged | Lowercase | Sentence Boundary | Filename | Other |
|---|---|---|---|---|---|---|---|---|
| `4.Transport Layer and Its services.pdf` | 8 | 8 | 0 | 0 | 0 | 0 | 0 | 0 |
| `Assignment No. 05 _2026 _Updated (1).pdf` | 1 | 2 | +1 | 0 | 0 | 0 | 0 | 0 |
| `Assignment No. 05 _2026 _Updated.pdf` | 1 | 2 | +1 | 0 | 0 | 0 | 0 | 0 |
| `Coursera Introduction to Docker.pdf` | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `SEPM-unit 3.pptx.pdf` | 18 | 18 | 0 | 5 | 0 | 0 | 0 | 5 |
| `SEPM-unit 4.pptx.pdf` | 29 | 29 | 0 | 4 | 0 | 1 | 0 | 3 |
| `SEPM_ASSIGNMENT-5.pdf` | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 |
| `Sumit AWP.9.pdf` | 14 | 14 | 0 | 7 | 0 | 2 | 1 | 4 |
| `Sumit awp 5 (1).pdf` | 4 | 4 | 0 | 2 | 0 | 1 | 0 | 1 |
| `Sumit awp 5.pdf` | 4 | 4 | 0 | 2 | 0 | 1 | 0 | 1 |
| `SumitAWP practical no.8.pdf` | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 |
| `SumitAWP practical no.9 (1).pdf` | 14 | 14 | 0 | 7 | 0 | 3 | 1 | 3 |
| `SumitAWP practical no.9.pdf` | 14 | 14 | 0 | 7 | 0 | 3 | 1 | 3 |
| `UNIT 3.pdf` | 56 | 56 | 0 | 20 | 5 | 7 | 0 | 8 |
| `UNIT 4.pdf` | 63 | 63 | 0 | 26 | 6 | 10 | 0 | 10 |
| `UNIT III Number Theory SAS.pptx.pdf` | 10 | 10 | 0 | 0 | 0 | 0 | 0 | 0 |
| `Unit IV Updated SAS.pptx (1).pdf` | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 |
| `Unit IV Updated SAS.pptx.pdf` | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 |
| `awp kartik 5 (1).pdf` | 4 | 4 | 0 | 2 | 0 | 1 | 0 | 1 |
| `awp kartik 5.pdf` | 4 | 4 | 0 | 2 | 0 | 0 | 0 | 2 |
| `kartik awp 9.pdf` | 5 | 6 | +1 | 5 | 1 | 0 | 0 | 4 |
| `notes-3-4.docx.pdf` | 26 | 33 | +7 | 12 | 2 | 1 | 0 | 9 |
| `unit-III  front end framework (5).pptx.pdf` | 21 | 23 | +2 | 13 | 0 | 2 | 0 | 11 |
| `unit-IV Back End Technology -2 (1).pptx.pdf` | 19 | 20 | +1 | 2 | 0 | 0 | 0 | 2 |
| **Total (24 files)** | **320** | **333** | **+13** | **120** | **14** | **32** | **3** | **71** |

### Flag Attribution Breakdown (Baseline vs Current)

| Rule | Baseline (`47d8cdb`) | Current Run (`15f`) | Delta | Attribution Notes |
|---|---|---|---|---|
| **Lowercase** | 14 | **14** | **0** | Uncapitalized non-brand opening token (`UNIT 3`: 5, `UNIT 4`: 6, `notes-3-4`: 2, `kartik awp 9`: 1). |
| **Sentence Boundary** | 32 | **32** | **0** | Mid-sentence fragments, action verbs, terminal punctuation or conversational clauses. |
| **Filename** | 0 | **3** | **+3** | Known bug: 3 junk topics titled from file name (`Sumit Awp.9`, `SumitAWP Practical No.9 (1)`, `SumitAWP Practical No.9`). The extractor still produces them, but `enforceNoCleanFilenameDerivedTitles` now flags them. |
| **Other** | 68 | **71** | **+3** | Net +3: +3 flagged from newly unlocked sections in `notes-3-4.docx.pdf`, +1 in `kartik awp 9.pdf`, +1 in `SEPM_ASSIGNMENT-5.pdf`, minus 2 practical-9 titles reclassified from "other" to "filename". |
| **Total Flagged** | **114** | **120** | **+6** | **Fully attributed** (+3 filename rule, +3 other rule). |

---

## Test Regressions (Commit 47d8cdb vs HEAD)

Measured directly in a clean worktree at commit `47d8cdb` (after `npm install` and build) and at `HEAD`:

| Script | Exit Code (47d8cdb) | Exit Code (HEAD) | First Failing Assertion / Outcome | Regressed in 10a? |
|---|---|---|---|---|
| `test_e2e_real_tabs.mjs` | **1** | **1** | `Library section top must be within 80px, got: 1089.5` (47d8cdb) / `1113.5` (HEAD) | **No** (pre-existing single-page scroll offset) |
| `test_hygiene.mjs` | **0** | **0** | All 9 checks passed on both commits | **No** |
| `test_spin_timing.mjs` | **1** | **1** | `AssertionError: Number of ticks must be at least 15, got 0` | **No** (pre-existing; Web Audio ticks disabled in headless) |

---

## Holdout Coverage (scripts/eval/run_holdout_extractor.mjs)

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

**Why holdout numbers are unchanged between 15a and HEAD**:
Although commits 14b and 14c changed extractor and fallback code (introducing vector drawing-operator detection and page outcome classifications), Node.js cannot test OCR because it lacks canvas support (marking pages with `ocrCouldNotRun: true`). Consequently, the vector-page OCR fallback fix remains completely untested on real vector files in Node; the 4 handwritten notes still yield only the 1 page-1 cover topic in Node, leaving holdout totals unchanged at 63 topics and 16 flagged topics.

---

## Known Gaps

1. **OCR cannot run in Node.js (Vector-page browser gap)** – `pdfjs-dist` requires a canvas element to render pages for OCR. While a browser renders vector-ink handwriting to canvas and triggers OCR, Node.js marks pages with `ocrCouldNotRun: true` ("no canvas"), leaving vector-only pages without extracted text in test environments.
2. **21:20 exposure** – Holdout candidate documents were analyzed and inspected with `pdfjs` prior to freezing the train/holdout split, exposing document text structures and parser characteristics before the separation.
3. **Holdout limitations (Smoke Holdout vs. 8 MIT files)** – The earlier 7-file holdout used during early development served purely as a pipeline smoke test. The current 8 holdout files (`scripts/eval/make_holdout.mjs`) all originate from a single university course (MIT 6.046J), limiting domain variety and leaving multi-subject robustness unmeasured.
4. **Dev labels from deleted lookup** – Dev labels in `tests/fixtures/flag_labels.json` were derived from heuristics in the deleted lookup table rather than an independent external ground truth or blind human annotation.
5. **Holdout titles un-blinded** – The `label` column in `reports/holdout_titles_blind.csv` was added in commit 12, and the holdout titles were directly viewed and inspected after the dump during subsequent diagnostics, meaning the holdout dataset is no longer blind.
6. **Filename-derived title bug** – The extractor still produces junk topics titled directly from the document file name (`Sumit Awp.9` and two practical-9 copies). While `enforceNoCleanFilenameDerivedTitles` ensures they are flagged (`needs_review: true`), the extractor still fails to synthesize meaningful content titles for these documents.
