# Extractor Limitations and Evaluation Status

## What Changed
- **Keyword lookup table deleted**: The artificial keyword lookup dictionary that directly produced clean synthetic titles was completely removed from the pipeline (`src/lib/topicExtractor.js`).
- **Unified title string for flag decisions**: Flagging and review decisions now evaluate the exact same title string that is emitted to the end user, rather than an unpruned intermediate candidate (enforced by invariant test in `tests/test_upload_sections.test.mjs`).
- **Lowercase-fragment rule and `BRAND_CASING` allowlist**: Added a rule rejecting uncapitalized non-brand opening tokens, governed by a unified `BRAND_CASING` regex allowlist.
- **Independence of tests 52 and 53**: Tests 52 and 53 in `tests/test_upload_sections.test.mjs` no longer derive expectations or dump runtime logging from the pipeline; report-only provenance blocks were moved to the deterministic CLI script `scripts/eval/provenance_report.mjs`.

## What Has Been Measured
- **Build-set statistics (reconciled across `D:\DailyDive-Eval\build`)**:
  - **(a) Full set (31 PDF files)**:
    - Total topics extracted: 396
    - Flagged for review: 167 (42.2%)
    - Clean non-flagged topics: 229 (57.8%)
  - **(b) Deduplicated set (26 unique PDF files, removing 5 byte-identical duplicates)**:
    - Total topics extracted: 375
    - Flagged for review: 157 (41.9%)
    - Clean non-flagged topics: 218 (58.1%)
- **Provenance audit**:
  - Across all 31 build files and 7 test fixtures (255 non-flagged topics total in the fixture set, 229 in the build set), provenance violations on clean topics are 0.
  - **Explicit caveat**: Provenance verification is a **weak check**. It only tests whether a normalized title appears as a substring anywhere within the normalized text of its source page or document. A title that is a substring passes even if it is a generic word, header artifact, or partial fragment.
- **Smoke test results (`reports/smoke_run_1.txt`)**:
  - **Label: Agent-selected smoke test, not an accuracy measure**.
  - Total topics across 8 smoke documents: 165
  - Flagged for review rate: 44 of 165 (26.7%)
  - Provenance violations: 18 provenance violations total, with 18 on the 4 slide decks and 0 on prose documents:
    - `mit18_05_s22_lec01.pdf` (Slide deck): 5 provenance violations (all 5 are fallback "Untitled slide" titles: slides 23, 24, 28, 32, 33; all flagged)
    - `mit7_91js14_lecture1.pdf` (Slide deck): 4 provenance violations (all 4 are fallback "Untitled slide" titles: slides 15, 21, 41, 49; all flagged)
    - `mit7_91js14_lecture2.pdf` (Slide deck): 1 provenance violation (fallback "Untitled slide 15"; flagged)
    - `mit9_00scf11_lec01.pdf` (Slide deck): 8 provenance violations (all 8 are fallback "Untitled slide" titles: slides 18, 21, 27, 46, 47, 50, 52, 53; all flagged)
    - Prose documents (`mit14_01scf11_lec01.pdf`, `mit18_05_s22_class01-prep-a.pdf`, `mit6_006s20_lec1.pdf`, `mit8_04s16_lecnotes1.pdf`): 0 provenance violations.
  - All 18 provenance violations are caused by synthetic fallback `"Untitled slide <N>"` strings that do not appear in the source document body text. All 18 are flagged for review (`needs_review = true`).
  - Breakdown by document:
    - `mit14_01scf11_lec01.pdf` (Economics transcript): 13 pages, 12 topics, 4 flagged (33.3%), 0 provenance violations, 1 lowercase title.
    - `mit18_05_s22_class01-prep-a.pdf` (Statistics notes): 3 pages, 3 topics, 0 flagged (0.0%), 0 provenance violations.
    - `mit18_05_s22_lec01.pdf` (Statistics slides): 34 pages, 29 topics, 11 flagged (37.9%), 5 provenance violations.
    - `mit6_006s20_lec1.pdf` (Algorithms notes): 5 pages, 5 topics, 1 flagged (20.0%), 0 provenance violations.
    - `mit7_91js14_lecture1.pdf` (Biology slides): 62 pages, 53 topics, 12 flagged (22.6%), 4 provenance violations, 2 titles >80 chars.
    - `mit7_91js14_lecture2.pdf` (Biology slides): 26 pages, 22 topics, 2 flagged (9.1%), 1 provenance violation.
    - `mit8_04s16_lecnotes1.pdf` (Physics notes): 15 pages, 15 topics, 5 flagged (33.3%), 0 provenance violations.
    - `mit9_00scf11_lec01.pdf` (Psychology slides): 54 pages, 26 topics, 9 flagged (34.6%), 8 provenance violations, 8 untitled slides.
- **Mid-sentence metric undercounts**:
  - The mid-sentence metric significantly undercounts sentence fragments and conversational discourse artifacts. Simple checks like testing for lowercase initial tokens or trailing punctuation only flag obvious fragments (e.g., `"come to taste later. OK?"`). Capitalized mid-sentence fragments, dialogue replies, and dependent clauses (such as `"Poor Who Would Get the Kidney If It Went"`, `"That's Right. There Could, but Let's Leave"`, `"Finished Files ARE the RE"`, and `"In the Picture Was There"`) remain unflagged as silent failures because their grammar cannot be detected by casing or character-level heuristics alone.

## What Has NOT Been Measured
- **Generalisation to unseen documents has NOT been measured**.
- **There is no accuracy number**: True generalization across arbitrary user-uploaded documents remains unquantified. No statistical precision, recall, or accuracy claims are established for uncurated corpora.

## Disclosures
- **Old 7-file holdout**: The original 7-file holdout set was used during iterative development and served strictly as a smoke sanity test, not a blind evaluation.
- **pdfjs exposure at 21:20**: Candidate documents were analyzed with `pdfjs` prior to establishing the dataset split, exposing document text layouts and parser behaviors prior to evaluation.
- **Dev-label circularity (Test 7 and Test 8)**: Precision and recall metrics evaluated against `tests/fixtures/flag_labels.json` are **circular; not accuracy**. The ground-truth labels in `flag_labels.json` were originally generated by the very keyword lookup table that was deleted. Consequently, any precision/recall scores against dev labels merely reflect consistency with the retired lookup table and must never be quoted or represented as system accuracy.
- **E2E Flake Resolution in `scripts/e2e/test_e2e_topic_card.mjs`**: During reliability stress testing (10 consecutive executions), an intermittent race condition was identified in Test (f): synthetic topics injected into `localStorage` without `is_custom: true` were dropped whenever `loadTopicsForEnabledCategories` resolved asynchronously in `DataContext`, as custom topics are retained via `prev.filter(t => t.is_custom)`. This caused `SpinScreen` to intermittently emit `isNotFound: true` and fail to render the topic card, yielding a 4/10 failure rate. Applying the test-side fix (setting `is_custom: true` on the synthetic fixture and awaiting app readiness via `#spin` before expecting the card) stabilized the suite to 10/10 PASS across consecutive runs.

## Known Issues
For a factual catalog of observed extractor anomalies and failure modes across novel lecture documents, see [docs/KNOWN_ISSUES.md](file:///d:/Projects/daily-dive/docs/KNOWN_ISSUES.md).
