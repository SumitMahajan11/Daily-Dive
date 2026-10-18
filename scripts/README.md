# Scripts Directory Guide

- `scripts/archive/`: Archived generation scripts superseded by static seed compilation and client builds (reason: Step 4 commit 16d).
- `scripts/e2e/`: End-to-end Playwright tests, UI interaction suites, and test runners (reason: commit 15f7d58 "c1: move e2e test suites and runner to scripts/e2e").
- `scripts/eval/`: Pipeline evaluations, smoke dataset checks, provenance reports, and holdout scoring (reason: commit b815c67 "c2: move eval and holdout scripts to scripts/eval").
- `scripts/generation/`: PWA icon and visual asset generation scripts (reason: commit 4869dc7 "chore: reorganize project structure and add documentation").
- `scripts/tools/`: Development tooling, link checkers, console log validators, and repository structure audits (reason: commit 012761c "c3: move utility tools to scripts/tools and archive dup_check.json").
- `scripts/safeLog.mjs`: Centralized safe stdout logger utility to prevent unformatted console output (reason: commit 34b9fe6 "3").
