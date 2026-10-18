import path from 'node:path';

/**
 * Central path resolver for evaluation, smoke test, and holdout directories.
 * Configurable via environment variables with defaults to standard local paths.
 * NOTE: Never read, list, or scan HOLDOUT_DIR here.
 */
export const EVAL_DIR = process.env.DD_EVAL_DIR || 'D:/DailyDive-Eval';
export const SMOKE_DIR = process.env.DD_SMOKE_DIR || 'D:/DailyDive-SmokeTest';
export const HOLDOUT_DIR = process.env.DD_HOLDOUT_DIR || 'D:/DailyDive-Holdout-Final';
export const CANDIDATES_DIR = process.env.DD_CANDIDATES_DIR || 'D:/DailyDive-Candidates';

export const EVAL_BUILD_DIR = path.join(EVAL_DIR, 'build');
