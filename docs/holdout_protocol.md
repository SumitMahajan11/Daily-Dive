# Holdout Selection Protocol

## 1. Overview and Purpose
This document defines the deterministic protocol for creating and maintaining evaluation holdout datasets for the DailyDive document processing pipeline. The goal is to guarantee objective, leak-free, and reproducible holdout document selection without inspecting document contents, titles, or headings.

## 2. Core Protocol Rules

### Rule 1: Content-Blind Hashing
Candidate documents are processed strictly by computing their raw SHA-256 cryptographic digest directly from binary file buffers or streams:
- File contents are **never opened**, parsed, decoded, or tokenized as text, HTML, PDF objects, or DOCX/PPTX structures.
- No string derived from document text or headings enters the selection logic.

### Rule 2: Deterministic Ordering by Hash
Candidate documents are sorted in ascending ASCII lexicographical order by their full 64-character SHA-256 hexadecimal digest (`a.sha256.localeCompare(b.sha256)`):
- This provides a deterministic, pseudorandom partition across document types without human selection bias.

### Rule 3: All-Remaining Selection (No Top-N Cut)
The holdout partition is populated with all candidate documents that satisfy all eligibility criteria and family deduplication:
$$\text{Holdout} = \{ d \in \text{EligibleCandidates} \mid d \text{ is lowest-hash in its family} \}$$

### Rule 4: Candidate Eligibility & Leakage Prevention
To prevent train/dev leakage, contamination, and evaluation incompatibilities, candidate documents must satisfy the following criteria:
1. **Source Independence**: Candidate documents must be supplied strictly from outside the `build/` evaluation set.
2. **Build-Set Exclusion**: Any candidate whose SHA-256 hash or normalized name matches any file in the build dataset (`D:/DailyDive-Eval/build`) is rejected.
3. **Dev-Label Exclusion**: Any candidate whose SHA-256 hash or normalized name matches any labeled fixture document referenced in `flag_labels.json` (such as `Unit IV Updated SAS.pptx.pdf`, `kartik_ccl_1.pdf`, `Experiment no 2 cn.pdf`, `AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx`) is rejected to prevent dev-label leakage.
4. **Heldout-Label Exclusion**: Any candidate whose SHA-256 hash or normalized name matches any heldout label source document (`Experiment no 3 cn.pdf`, `study_guide_algorithms.pdf`, `lecture_systems.pptx`, `microservices_architecture_spec.md`, `real_roadmap.md`) is rejected.
5. **Fixture-Set Exclusion**: Any candidate whose SHA-256 hash or normalized name matches any fixture in `tests/fixtures` (including subdirectories) is rejected.
6. **Banned Keyword Exclusion**: Candidates whose filenames match the pattern `/resume|cv|certificate|attendance|passport|invoice/i` are rejected.
7. **Format Compatibility**: Only `.pdf` documents are accepted into the candidate pool because evaluation relies on `extractFromPdf` (non-PDFs like `.docx` cannot undergo PDF extraction).
8. **Cryptographic Deduplication**: Candidates are deduplicated by SHA-256 hash so that no identical document is considered or counted more than once.

### Rule 5: Family Grouping and Single-Document Representation
Candidates are categorized by a deterministic document family stem:
1. The filename stem (excluding compound extensions like `.pptx.pdf` or `.pdf` and optional hex hash prefixes) has all digits, punctuation, and non-alphanumeric characters stripped, normalized to lowercase single-space tokens.
2. Candidates sharing the same family stem are grouped together.
3. Within each family group, candidates are sorted ascending by raw SHA-256 hash, and strictly **ONE** document per family (the lowest hash) is retained for the holdout; subsequent family duplicates are rejected.

### Rule 6: Existing Holdout Classification (`SMOKE_ONLY`)
Any pre-existing holdout documents that were previously inspected, audited, or referenced during pipeline diagnostics are designated as `SMOKE_ONLY` in the manifest:
- `SMOKE_ONLY` documents serve exclusively for smoke testing and regression sanity checks.
- True generalization benchmarks require fresh holdout partitions chosen strictly via this protocol from candidate documents.

### Rule 7: Provenance and Script Git Hash Header
Every generated holdout manifest CSV must include a structured header with:
1. The exact selection rule description (`# RULE: ...`).
2. The Git commit hash of the selection script (`# SCRIPT_GIT_HASH: ...`).
3. Standard CSV columns.

### Rule 8: Output and Reporting Hygiene
Execution of the holdout generator script must print **only**:
- File names
- Truncated hashes (8 hex characters)
- Integer counts (candidate count, per-path rejected counts, smoke-only count, holdout count)
No text derived from document contents, titles, or headings may be logged.

## 3. Manifest Specification
The holdout manifest is written in CSV format with the following columns:
- `path`: Absolute or relative path to the candidate document.
- `name`: File basename.
- `extension`: File extension in lowercase (e.g., `.pdf`, `.docx`).
- `size_bytes`: File size in bytes.
- `sha256`: Full 64-character uppercase SHA-256 hash.
- `family`: Document family stem derived by stripping digits and punctuation.
- `split`: Partition assignment (`holdout` or `SMOKE_ONLY`).

## 4. Automation Tooling
The protocol is implemented and automated by [`scripts/make_holdout.mjs`](file:///d:/Projects/daily-dive/scripts/make_holdout.mjs).
