# Daily Dive – Results Snapshot (commit 15d)

## Build Numbers (24-File Evaluation Set)

Ran `extractFromPdf` + `extractTopicsFromSections` over the 24 evaluation PDFs in `D:\DailyDive-Eval\build` (same 24 files as the 324/114 baseline, excluding 3 unreadable/scanned files `1000142068 (1).pdf`, `Chapter 2 DES Updated.pptx (1).pdf`, `Chapter 2 DES Updated.pptx.pdf`, 2 resumes `Sumit_Mahajan_Resume (3) (1).pdf`, `Sumit_Mahajan_Resume.pdf`, and 2 one-page files `Coursera Agile Management.pdf`, `Coursera Agile with Atlassian Jira.pdf`). Baseline values are reconstructed from the task-1503 logs:

| Metric | Baseline (Task-1503 Logs) | Current Run (15d) | Delta |
|---|---|---|---|
| Evaluation PDFs | 24 | 24 | 0 |
| Total topics extracted | 320 | **333** | **+13** |
| Topics flagged for review | 114 | **120** | **+6** |
| Provenance violations | 0 | **0** | **0** |
| Full test suite | 630 pass · 0 fail | **630 pass · 0 fail** | 0 |

### Per-File Topics and Deltas (24 Files)

| File | Baseline Topics | Current Topics | Delta | Flagged | Lowercase | Filename | Other |
|---|---|---|---|---|---|---|---|
| `4.Transport Layer and Its services.pdf` | 8 | 8 | 0 | 0 | 0 | 0 | 0 |
| `Assignment No. 05 _2026 _Updated (1).pdf` | 1 | 2 | +1 | 0 | 0 | 0 | 0 |
| `Assignment No. 05 _2026 _Updated.pdf` | 1 | 2 | +1 | 0 | 0 | 0 | 0 |
| `Coursera Introduction to Docker.pdf` | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| `SEPM-unit 3.pptx.pdf` | 18 | 18 | 0 | 5 | 0 | 0 | 5 |
| `SEPM-unit 4.pptx.pdf` | 29 | 29 | 0 | 4 | 0 | 0 | 4 |
| `SEPM_ASSIGNMENT-5.pdf` | 1 | 1 | 0 | 1 | 0 | 0 | 1 |
| `Sumit AWP.9.pdf` | 14 | 14 | 0 | 7 | 0 | 0 | 7 |
| `Sumit awp 5 (1).pdf` | 4 | 4 | 0 | 2 | 0 | 0 | 2 |
| `Sumit awp 5.pdf` | 4 | 4 | 0 | 2 | 0 | 0 | 2 |
| `SumitAWP practical no.8.pdf` | 1 | 1 | 0 | 1 | 0 | 0 | 1 |
| `SumitAWP practical no.9 (1).pdf` | 14 | 14 | 0 | 7 | 0 | 0 | 7 |
| `SumitAWP practical no.9.pdf` | 14 | 14 | 0 | 7 | 0 | 0 | 7 |
| `UNIT 3.pdf` | 56 | 56 | 0 | 20 | 5 | 0 | 15 |
| `UNIT 4.pdf` | 63 | 63 | 0 | 26 | 6 | 0 | 20 |
| `UNIT III Number Theory SAS.pptx.pdf` | 10 | 10 | 0 | 0 | 0 | 0 | 0 |
| `Unit IV Updated SAS.pptx (1).pdf` | 1 | 1 | 0 | 1 | 0 | 0 | 1 |
| `Unit IV Updated SAS.pptx.pdf` | 1 | 1 | 0 | 1 | 0 | 0 | 1 |
| `awp kartik 5 (1).pdf` | 4 | 4 | 0 | 2 | 0 | 0 | 2 |
| `awp kartik 5.pdf` | 4 | 4 | 0 | 2 | 0 | 0 | 2 |
| `kartik awp 9.pdf` | 5 | 6 | +1 | 5 | 1 | 0 | 4 |
| `notes-3-4.docx.pdf` | 26 | 33 | +7 | 12 | 2 | 0 | 10 |
| `unit-III  front end framework (5).pptx.pdf` | 21 | 23 | +2 | 13 | 0 | 0 | 13 |
| `unit-IV Back End Technology -2 (1).pptx.pdf` | 19 | 20 | +1 | 2 | 0 | 0 | 2 |
| **Total (24 files)** | **320** | **333** | **+13** | **120** | **14** | **0** | **106** |

### Flag Attribution Breakdown
The 120 flagged topics across the 24 build files attribute to:
- **Lowercase Rule**: **14** topics (UNIT 3: 5, UNIT 4: 6, notes-3-4: 2, kartik awp 9: 1) where candidate titles begin with an uncapitalized non-brand token.
- **Filename Rule**: **0** topics (no topic titles derived from file names).
- **Other Reasons**: **106** topics flagged by length thresholds (<15 or >70 chars), boilerplate academic metadata filtering, or low structural confidence.

---

## Test Regressions (Commit 47d8cdb vs HEAD)

Measured directly in a clean worktree at commit `47d8cdb` (after `npm install` and build) and at `HEAD`:

| Script | Exit Code (47d8cdb) | Exit Code (HEAD) | First Failing Assertion / Outcome | Regressed in 10a? |
|---|---|---|---|---|
| `test_e2e_real_tabs.mjs` | **1** | **1** | `Library section top must be within 80px, got: 1089.5` (47d8cdb) / `1113.5` (HEAD) | **No** (pre-existing single-page scroll offset) |
| `test_hygiene.mjs` | **0** | **0** | All 9 checks passed on both commits | **No** |
| `test_spin_timing.mjs` | **1** | **1** | `AssertionError: Number of ticks must be at least 15, got 0` | **No** (pre-existing; Web Audio ticks disabled in headless) |

---

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

**Why holdout numbers are unchanged between 15a and HEAD**:
The 8 holdout documents comprise 4 digital slide presentations with selectable text layers and 4 handwritten lecture notes where pages 2+ contain purely vector-drawn ink without embedded text. In Node.js, `extractFromPdf` lacks a DOM/canvas implementation, so OCR cannot run and pages 2+ produce zero text, falling back to 1 topic extracted from the page 1 cover text. Because neither digital slide sectioning nor the Node OCR stub was altered, extraction yields the exact same 63 topics and 16 flagged topics.

---

## Known Gaps

1. **OCR cannot run in Node.js (Vector-page browser gap)** – `pdfjs-dist` requires a canvas element to render pages for OCR. While a browser renders vector-ink handwriting to canvas and triggers OCR, Node.js marks pages with `ocrCouldNotRun: true` ("no canvas"), leaving vector-only pages without extracted text.
2. **21:20 pdfjs exposure** – The parser emits `TT: undefined function: 21` and `TT: undefined function: 32` warnings during TrueType font table parsing. These benign font-encoding interpreter warnings can occasionally cause dropped glyphs on certain slide decks.
3. **Old 7-file smoke holdout** – The 8 holdout files (frozen from an earlier 7-file sample set) originate from a single university course (MIT 6.046J). They serve purely as pipeline smoke tests and do not evaluate qualitative multi-domain topic extraction.
4. **Circular dev labels** – Dev labels in `tests/fixtures/flag_labels.json` were authored during pipeline development against the same build documents rather than by an independent double-blind annotator.
5. **Holdout titles un-blinded** – `reports/holdout_titles_blind.csv` retains the `label` column added in 14b, but inspection during the 14b diagnosis means the holdout dataset is no longer blind.
