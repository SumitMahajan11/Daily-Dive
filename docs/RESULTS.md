# Daily Dive – Results Snapshot (commit 15a)

## Build numbers

| Metric | Value |
|---|---|
| Topics in build | **692** (313 tech · 113 money-career · 176 mind-growth · 90 world-ideas) |
| Source lessons | 64 (in `data/lessons.json`) |
| Flagged topics | **0** |
| Provenance violations | **0** |
| Test suite | **630 pass · 0 fail** (as of 15a) |

*Previous reference: 324 topics / 114 flagged / 0 violations – those numbers were from an earlier
corpus run before the lesson set was expanded to 692 topics across 4 group files.*

## Holdout coverage (7 PDFs + 1 written-lecture set, smoke-only)

| File | Pages | Topics | Flagged | Extraction path |
|---|---|---|---|---|
| MIT lec07.pdf | 33 | 26 | 9 | all text-layer |
| MIT lec10.pdf | 7 | 6 | 1 | all text-layer |
| MIT writtenlec23.pdf | 11 | 1 | 0 | 10 empty + 1 text |
| MIT lec02.pdf | 7 | 7 | 3 | all text-layer |
| MIT writtenlec6.pdf | 11 | 1 | 0 | 10 empty + 1 text |
| MIT lec13.pdf | 20 | 20 | 3 | all text-layer |
| MIT writtenlec3.pdf | 8 | 1 | 0 | 7 empty + 1 text |
| MIT writtenlec11.pdf | 9 | 1 | 0 | 8 empty + 1 text |
| **Total** | **106** | **63** | **16** | — |

## Known gaps

1. **OCR cannot run in Node.js** – `pdfjs-dist` requires a DOM/canvas for rendering;
   the Node extractor sets `ocrCouldNotRun: true` with reason `"no canvas"`. Vector-only
   PDF pages that need OCR are correctly detected and flagged in `buildExtractionWarning`
   but no OCR text is produced.

2. **One course only** – all 8 holdout files are from a single MIT 6.046J algorithms
   course. Coverage numbers are not representative of a diverse corpus.

3. **Circular dev labels** – `flag_labels.json` was constructed from the same build that
   produces the topics; precision/recall scores in `tests/truthful_review_flags.test.mjs`
   are informative but not independently validated.

4. **pdfjs 21:20 exposure** – parser emits `TT: undefined function: 21` and
   `TT: undefined function: 32` warnings for some PDFs. These are benign font-encoding
   gaps in pdfjs-dist but could cause missed glyphs in those documents.

5. **Old 7-file holdout is smoke-only** – `reports/holdout_run.json` covers 8 files
   frozen by `scripts/make_holdout.mjs`. It verifies extraction runs end-to-end but
   does not validate topic *quality* (no ground-truth labels).

6. **Holdout titles unlabeled and no longer blind** – `reports/holdout_titles_blind.csv`
   was un-blinded during the 14b investigation. Manual title review has not been
   conducted; the file is retained for reference only.
