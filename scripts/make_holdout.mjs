#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { safeLog } from './safeLog.mjs';

// Canonical existing holdout set (marked as SMOKE_ONLY)
const EXISTING_HOLDOUT_SET = new Map([
  ['052E9DEEE9E6E3B56C3B9F7517242C0848F7D3CD8EFEE69E1B2CC52EF9362462', 'awp 10 kartik.pdf'],
  ['48D2892DD216B4151110E9D5C0C1DFBA03E707F61B4FD50D6A8062ABB94035E4', 'CC_Unit-3.pdf'],
  ['9F8220585E59B7270601DF3C6B295A12D785455B417C64818C2C667991846117', 'Sumit AWP 10.docx'],
  ['D6CA193D4F1ED4D57B93B7F2F8577A25D3DAA7974E2D1B5B7240BFEBAB7320D0', 'Sumit AWP 10.pdf'],
  ['DC4517B81F4F211B24ECB87303268F7B491622A317160275E13B8A667946E72F', 'SumitAWP practical no.10.docx'],
  ['BE33911D88AABE7968512637E4648F9045E2AE04E0B1C797B2F6BA3A389CF78C', 'SumitAWP practical no.10.pdf'],
  ['15061683F5B4116D61CD27F66C10CCDCD6C1B126C94F2B486DF6697A246A93FE', 'Unit-4.pdf']
]);

export const BANNED_FILENAME_PATTERN = /resume|cv|certificate|attendance|passport|invoice/i;

/**
 * Computes raw SHA-256 hex digest without decoding or inspecting contents.
 * @param {string} filePath
 * @returns {string} 64-character uppercase hex digest
 */
export function computeSha256(filePath) {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex').toUpperCase();
}

/**
 * Normalizes a filename for case- and delimiter-insensitive matching,
 * stripping single or compound extensions (e.g., .pptx.pdf, .pdf).
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name) {
  let base = path.basename(name).toLowerCase();
  base = base.replace(/(\.[a-z0-9]+)+$/i, '');
  return base.replace(/[\s\-_.]+/g, ' ').trim();
}

/**
 * Normalizes a document stem for build-family comparison:
 * lowercase, strip compound extensions, copy suffixes, digits, "updated", "for students", and punctuation.
 * @param {string} name
 * @returns {string}
 */
export function normalizeBuildStem(name) {
  let base = path.basename(name).toLowerCase();
  base = base.replace(/(\.[a-z0-9]+)+$/i, ''); // strip extensions
  // strip leading 32-hex prefix before digit stripping
  base = base.replace(/^[0-9a-f]{32}[_\-\s]*/i, '');
  // strip copy suffixes like (1), (2), _1, - copy, etc.
  base = base.replace(/\s*\(\d+\)/g, '');
  base = base.replace(/[\s\-_]+copy/gi, '');
  base = base.replace(/[_\s]+\d+$/g, '');
  
  // replace underscores and hyphens with spaces
  base = base.replace(/[_\-]+/g, ' ');

  // strip 'updated' and 'for students'
  base = base.replace(/\bupdated\b/gi, '');
  base = base.replace(/\bfor\s+students\b/gi, '');

  // strip digits
  base = base.replace(/\d+/g, '');

  // collapse punctuation & whitespace
  base = base.replace(/[\W_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return base;
}

/**
 * Extracts the document family stem by stripping digits and punctuation.
 * @param {string} filename
 * @returns {string}
 */
export function extractFamily(filename) {
  let stem = path.parse(filename).name;
  // If stem has a 32-character hex hash prefix, strip it
  stem = stem.replace(/^[0-9a-f]{32}[_-]/i, '');
  // Strip digits and punctuation
  const family = stem.replace(/[\d\W_]+/g, ' ').trim().replace(/\s+/g, ' ').toLowerCase();
  return family || 'default';
}

/**
 * Recursively collects file paths from a directory.
 * @param {string} dir
 * @returns {string[]}
 */
export function collectFilesRecursively(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        files.push(...collectFilesRecursively(fullPath));
      } else if (ent.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

/**
 * Collects SHA-256 hashes, normalized names, and build-family stems of build files.
 * @returns {{ buildHashes: Set<string>, buildNormNames: Set<string>, buildStems: Set<string> }}
 */
export function getBuildSources() {
  const buildHashes = new Set();
  const buildNormNames = new Set();
  const buildStems = new Set();
  const buildDirs = ['D:/DailyDive-Eval/build'];
  for (const dir of buildDirs) {
    const files = collectFilesRecursively(dir);
    for (const file of files) {
      try {
        const hash = computeSha256(file);
        buildHashes.add(hash);
        buildNormNames.add(normalizeName(file));
        const bStem = normalizeBuildStem(file);
        if (bStem) buildStems.add(bStem);
      } catch (e) {}
    }
  }
  return { buildHashes, buildNormNames, buildStems };
}

/**
 * Collects SHA-256 hashes and normalized names of flag_labels.json sources.
 * @returns {{ flagLabelHashes: Set<string>, flagLabelNormNames: Set<string> }}
 */
export function getFlagLabelSources() {
  const flagLabelHashes = new Set([
    '0E35601CDB0D52527C1FA21FF469E26AB21BC5F9EDAE6500BDCF04F20E08ADD4', // Unit IV Updated SAS.pptx.pdf
    'C212AB509E2B2A3EBBCBE7F3B6681F0E4CE21E90F477FECE7D4397B1A40CE64A', // AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx
    '5C863F9233075CD0EFCE737BE1B33DB887961AC5499268CF9A4926C0FFB37363', // kartik_ccl_1.pdf / ccl_document.pdf
    '46FBA0136A4CE18247BBDCFBD5A83CC2DE8FF9D2EAAFC4CFE0A865064D7E2F13'  // Experiment no 2 cn.pdf
  ]);
  const flagLabelNormNames = new Set([
    normalizeName('Unit IV Updated SAS.pptx.pdf'),
    normalizeName('AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx'),
    normalizeName('kartik_ccl_1.pdf'),
    normalizeName('Experiment no 2 cn.pdf')
  ]);

  const flagJsonPath = 'tests/fixtures/flag_labels.json';
  if (fs.existsSync(flagJsonPath)) {
    try {
      const records = JSON.parse(fs.readFileSync(flagJsonPath, 'utf8'));
      for (const rec of records) {
        if (rec.file) {
          flagLabelNormNames.add(normalizeName(rec.file));
        }
      }
    } catch (e) {}
  }

  const lookupDirs = ['tests/fixtures', 'tests/fixtures/real', 'D:/DailyDive-Eval/build'];
  for (const norm of flagLabelNormNames) {
    for (const d of lookupDirs) {
      if (!fs.existsSync(d)) continue;
      const files = fs.readdirSync(d);
      for (const f of files) {
        if (normalizeName(f) === norm) {
          try {
            flagLabelHashes.add(computeSha256(path.join(d, f)));
          } catch (e) {}
        }
      }
    }
  }

  return { flagLabelHashes, flagLabelNormNames };
}

/**
 * Collects SHA-256 hashes and normalized names of heldout_labels sources from tests/fixtures/excluded_sources.json.
 * Also parses excluded_series prefix list.
 * @returns {{ heldoutLabelHashes: Set<string>, heldoutLabelNormNames: Set<string>, excludedSeries: string[] }}
 */
export function getHeldoutLabelSources() {
  const heldoutLabelHashes = new Set();
  const heldoutLabelNormNames = new Set();
  const excludedSeries = [];

  const excludedSourcesPath = 'tests/fixtures/excluded_sources.json';
  if (fs.existsSync(excludedSourcesPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(excludedSourcesPath, 'utf8'));
      const records = Array.isArray(data) ? data : (data.excluded_sources || data.sources || []);
      for (const rec of records) {
        const name = typeof rec === 'string' ? rec : rec.file;
        if (name) {
          heldoutLabelNormNames.add(normalizeName(name));
        }
      }
      if (data && !Array.isArray(data) && Array.isArray(data.excluded_series)) {
        for (const s of data.excluded_series) {
          if (typeof s === 'string' && s.trim()) {
            excludedSeries.push(s.trim().toLowerCase());
          }
        }
      }
    } catch (e) {}
  }

  const heldoutJsonPath = 'tests/fixtures/heldout_labels.json';
  if (fs.existsSync(heldoutJsonPath)) {
    try {
      const records = JSON.parse(fs.readFileSync(heldoutJsonPath, 'utf8'));
      for (const rec of records) {
        if (rec.file) {
          heldoutLabelNormNames.add(normalizeName(rec.file));
        }
      }
    } catch (e) {}
  }

  const lookupDirs = ['tests/fixtures', 'tests/fixtures/real', 'D:/DailyDive-Eval/build'];
  for (const norm of heldoutLabelNormNames) {
    for (const d of lookupDirs) {
      if (!fs.existsSync(d)) continue;
      const files = fs.readdirSync(d);
      for (const f of files) {
        if (normalizeName(f) === norm) {
          try {
            heldoutLabelHashes.add(computeSha256(path.join(d, f)));
          } catch (e) {}
        }
      }
    }
  }

  return { heldoutLabelHashes, heldoutLabelNormNames, excludedSeries };
}

/**
 * Collects SHA-256 hashes and normalized names for every fixture in tests/fixtures.
 * @returns {{ fixtureHashes: Set<string>, fixtureNormNames: Set<string> }}
 */
export function getFixtureSources() {
  const fixtureHashes = new Set();
  const fixtureNormNames = new Set();
  const fixtureDirs = ['tests/fixtures'];
  for (const dir of fixtureDirs) {
    const files = collectFilesRecursively(dir);
    for (const file of files) {
      try {
        const hash = computeSha256(file);
        fixtureHashes.add(hash);
        fixtureNormNames.add(normalizeName(file));
      } catch (e) {}
    }
  }
  return { fixtureHashes, fixtureNormNames };
}

/**
 * Retrieves the current Git commit hash of the script.
 * @returns {string}
 */
function getScriptGitHash() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    return 'UNKNOWN';
  }
}

/**
 * Main holdout generation function.
 * @param {string} candidateDir Directory containing candidate documents
 * @param {number|null} [count=null] Number of holdout documents to select (null = all remaining)
 * @param {string} [manifestPath='reports/holdout_manifest.csv'] Target manifest path
 */
export function generateHoldout(candidateDir, count = null, manifestPath = 'reports/holdout_manifest.csv') {
  if (!fs.existsSync(candidateDir)) {
    throw new Error(`Candidate directory not found: ${candidateDir}`);
  }

  const { buildHashes, buildNormNames, buildStems } = getBuildSources();
  const { flagLabelHashes, flagLabelNormNames } = getFlagLabelSources();
  const { heldoutLabelHashes, heldoutLabelNormNames, excludedSeries } = getHeldoutLabelSources();
  const { fixtureHashes, fixtureNormNames } = getFixtureSources();

  const entries = fs.readdirSync(candidateDir, { withFileTypes: true });
  const rawCandidates = [];
  const seenCandidateHashes = new Set();
  const decisions = [];

  let rejectedNonPdf = 0;
  let rejectedDuplicateHash = 0;
  let rejectedBannedPattern = 0;
  let rejectedDevLabel = 0;
  let rejectedHeldoutLabel = 0;
  let rejectedFixture = 0;
  let rejectedBuild = 0;
  let rejectedBuildFamily = 0;
  let rejectedExcludedSeries = 0;

  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    const fullPath = path.join(candidateDir, ent.name);
    const normName = normalizeName(ent.name);
    const bStem = normalizeBuildStem(ent.name);

    // 1. Only PDFs can be processed through extractFromPdf
    if (ext !== '.pdf') {
      rejectedNonPdf++;
      decisions.push({ name: ent.name, status: 'rejectedNonPdf' });
      continue;
    }

    const sha256 = computeSha256(fullPath);

    // 2. Deduplicate candidate files by raw SHA-256 hash
    if (seenCandidateHashes.has(sha256)) {
      rejectedDuplicateHash++;
      decisions.push({ name: ent.name, sha256, status: 'rejectedDuplicateHash' });
      continue;
    }
    seenCandidateHashes.add(sha256);

    // 3. Remove files matching resume|cv|certificate|attendance|passport|invoice
    if (BANNED_FILENAME_PATTERN.test(ent.name)) {
      rejectedBannedPattern++;
      decisions.push({ name: ent.name, sha256, status: 'rejectedBannedPattern' });
      continue;
    }

    // 4. Reject any candidate matching flag_labels source (by SHA-256 or normalized name)
    if (flagLabelHashes.has(sha256) || flagLabelNormNames.has(normName)) {
      rejectedDevLabel++;
      decisions.push({ name: ent.name, sha256, status: 'rejectedDevLabel' });
      continue;
    }

    // 5. Reject any candidate matching heldout_labels source (by SHA-256 or normalized name)
    if (heldoutLabelHashes.has(sha256) || heldoutLabelNormNames.has(normName)) {
      rejectedHeldoutLabel++;
      decisions.push({ name: ent.name, sha256, status: 'rejectedHeldoutLabel' });
      continue;
    }

    // 6. Reject any candidate matching every fixture in tests/fixtures (by SHA-256 or normalized name)
    if (fixtureHashes.has(sha256) || fixtureNormNames.has(normName)) {
      rejectedFixture++;
      decisions.push({ name: ent.name, sha256, status: 'rejectedFixture' });
      continue;
    }

    // 7. Reject any candidate matching a build file (by SHA-256 or normalized name)
    if (buildHashes.has(sha256) || buildNormNames.has(normName)) {
      rejectedBuild++;
      decisions.push({ name: ent.name, sha256, status: 'rejectedBuild' });
      continue;
    }

    // 8. Reject on equal build family stem (equality on normalised stems only, no prefix matching)
    if (buildStems.has(bStem)) {
      rejectedBuildFamily++;
      decisions.push({ name: ent.name, sha256, status: 'rejectedBuildFamily' });
      continue;
    }

    // 9. Reject candidates whose normalised stem starts with any excluded series
    if (excludedSeries.some(s => bStem.startsWith(s))) {
      rejectedExcludedSeries++;
      decisions.push({ name: ent.name, sha256, status: 'rejectedExcludedSeries' });
      continue;
    }

    const stat = fs.statSync(fullPath);
    const family = extractFamily(ent.name);

    rawCandidates.push({
      path: fullPath,
      name: ent.name,
      extension: ext,
      size_bytes: stat.size,
      sha256,
      family
    });
  }

  // Populate canonical existing holdouts marked as SMOKE_ONLY
  const smokeOnlyRows = [];
  for (const [sha, name] of EXISTING_HOLDOUT_SET.entries()) {
    let size = 0;
    try {
      const bPath = `D:\\DailyDive-Eval\\build\\${name}`;
      const dlPath = path.join('C:/Users/SUMIT/Downloads', name);
      if (fs.existsSync(bPath)) size = fs.statSync(bPath).size;
      else if (fs.existsSync(dlPath)) size = fs.statSync(dlPath).size;
    } catch (e) {}

    smokeOnlyRows.push({
      path: `D:\\DailyDive-Eval\\build\\${name}`,
      name,
      extension: path.extname(name).toLowerCase(),
      size_bytes: size,
      sha256: sha,
      family: extractFamily(name),
      split: 'SMOKE_ONLY'
    });
  }

  // Filter out any candidates that match smoke-only hashes
  const smokeHashes = new Set(smokeOnlyRows.map(s => s.sha256));
  const cleanCandidates = rawCandidates.filter(c => !smokeHashes.has(c.sha256));

  // 9. Group candidates sharing a family stem; keep ONE per family (lowest SHA-256 hash)
  const familyMap = new Map();
  for (const c of cleanCandidates) {
    if (!familyMap.has(c.family)) {
      familyMap.set(c.family, []);
    }
    familyMap.get(c.family).push(c);
  }

  const finalCandidates = [];
  let rejectedFamilyDuplicate = 0;

  for (const [, group] of familyMap.entries()) {
    group.sort((a, b) => a.sha256.localeCompare(b.sha256));
    finalCandidates.push(group[0]);
    decisions.push({ name: group[0].name, sha256: group[0].sha256, status: 'accepted' });

    for (let i = 1; i < group.length; i++) {
      rejectedFamilyDuplicate++;
      decisions.push({ name: group[i].name, sha256: group[i].sha256, status: 'rejectedFamilyDuplicate' });
    }
  }

  // Sort final holdout candidates ascending by SHA-256
  finalCandidates.sort((a, b) => a.sha256.localeCompare(b.sha256));

  // Holdout N = all remaining candidates (no top-N cut if count is null or <= 0 or >= length)
  const selectedHoldout = (count && count > 0 && count < finalCandidates.length)
    ? finalCandidates.slice(0, count)
    : finalCandidates;

  // Construct manifest content
  const gitHash = getScriptGitHash();
  const headerLines = [
    '# RULE: Candidate documents are sorted ascending by raw SHA-256 hash. Rejection of build files, dev-labels, heldout-labels, fixtures, non-PDFs, banned patterns, duplicate hashes, build-family matches, excluded series, and family duplicates enforced.',
    `# SCRIPT_GIT_HASH: ${gitHash}`,
    'path,name,extension,size_bytes,sha256,family,split'
  ];

  const csvRows = [];
  // 1. Existing holdouts marked as SMOKE_ONLY
  for (const s of smokeOnlyRows) {
    csvRows.push(`"${s.path}","${s.name}","${s.extension}",${s.size_bytes},"${s.sha256}","${s.family}","SMOKE_ONLY"`);
  }

  // 2. Newly assigned holdouts (remaining clean candidates)
  for (const h of selectedHoldout) {
    csvRows.push(`"${h.path}","${h.name}","${h.extension}",${h.size_bytes},"${h.sha256}","${h.family}","holdout"`);
  }

  const manifestContent = headerLines.concat(csvRows).join('\n') + '\n';

  // Write manifest to specified path
  const outDir = path.dirname(manifestPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(manifestPath, manifestContent, 'utf8');

  // Mirror to D:/DailyDive-Eval/holdout_manifest.csv if evaluation directory exists
  const evalManifest = 'D:/DailyDive-Eval/holdout_manifest.csv';
  if (fs.existsSync('D:/DailyDive-Eval')) {
    try {
      fs.writeFileSync(evalManifest, manifestContent, 'utf8');
    } catch (e) {}
  }

  // Print only file names, hashes (8 hex), and counts using safeLog
  safeLog('Candidate count:', rawCandidates.length);
  safeLog('Rejected non-PDF:', rejectedNonPdf);
  safeLog('Rejected duplicate hash:', rejectedDuplicateHash);
  safeLog('Rejected banned pattern:', rejectedBannedPattern);
  safeLog('Rejected dev-label:', rejectedDevLabel);
  safeLog('Rejected heldout-label:', rejectedHeldoutLabel);
  safeLog('Rejected fixture:', rejectedFixture);
  safeLog('Rejected build:', rejectedBuild);
  safeLog('Rejected build family:', rejectedBuildFamily);
  safeLog('Rejected excluded series:', rejectedExcludedSeries);
  safeLog('Rejected family duplicate:', rejectedFamilyDuplicate);
  safeLog('Smoke-only count:', smokeOnlyRows.length);
  safeLog('Holdout count:', selectedHoldout.length);

  for (const h of selectedHoldout) {
    const displayName = h.name.length > 40 ? h.name.slice(0, 40) : h.name;
    const hash8 = h.sha256.slice(0, 8);
    safeLog(displayName, hash8);
  }

  return {
    candidateCount: rawCandidates.length,
    rejectedNonPdf,
    rejectedDuplicateHash,
    rejectedBannedPattern,
    rejectedDevLabel,
    rejectedHeldoutLabel,
    rejectedFixture,
    rejectedBuild,
    rejectedBuildFamily,
    rejectedExcludedSeries,
    rejectedFamilyDuplicate,
    smokeOnlyCount: smokeOnlyRows.length,
    holdoutCount: selectedHoldout.length,
    selected: selectedHoldout,
    decisions
  };
}

// CLI invocation
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
if (isMain) {
  const targetDir = process.argv[2] || (fs.existsSync('D:/DailyDive-Candidates') ? 'D:/DailyDive-Candidates' : '.');
  const n = process.argv[3] ? parseInt(process.argv[3], 10) : null;
  generateHoldout(targetDir, n);
}
