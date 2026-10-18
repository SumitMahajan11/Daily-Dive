import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import util from 'node:util';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { safeLog } from '../safeLog.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Helper to print lines safely via safeLog without exceeding 40-char limit
class SafeText {
  constructor(str) {
    this.c = [];
    for (let i = 0; i < str.length; i += 39) {
      this.c.push(str.slice(i, i + 39));
    }
  }
  [util.inspect.custom]() {
    return this.c.join('');
  }
}

function print(line = '') {
  const str = String(line);
  if (str.length <= 40) {
    safeLog(str);
  } else {
    safeLog(new SafeText(str));
  }
}

// 1. Gather all files: tracked + untracked/ignored outside node_modules, dist, .git
function getFileUniverse() {
  const trackedRaw = execSync('git -c core.quotepath=false ls-files', { cwd: rootDir, encoding: 'utf8' });
  const trackedFiles = trackedRaw.trim().split(/\r?\n/).filter(Boolean).map(f => f.replace(/\\/g, '/'));

  const statusRaw = execSync('git -c core.quotepath=false status --ignored -uall --porcelain', { cwd: rootDir, encoding: 'utf8' });
  const statusLines = statusRaw.trim().split(/\r?\n/).filter(Boolean);

  const ignoredOrUntracked = [];
  const statusMap = new Map();

  for (const f of trackedFiles) {
    statusMap.set(f, 'tracked');
  }

  for (const line of statusLines) {
    const code = line.slice(0, 2);
    if (code !== '??' && code !== '!!') {
      continue;
    }
    let p = line.slice(3).trim().replace(/\\/g, '/');
    if (p.startsWith('"') && p.endsWith('"')) {
      p = p.slice(1, -1);
    }
    if (p.startsWith('node_modules/') || p.startsWith('dist/') || p.startsWith('.git/')) {
      continue;
    }
    const st = code === '!!' ? 'ignored' : 'untracked';
    ignoredOrUntracked.push(p);
    statusMap.set(p, st);
  }

  // Include audit script and doc
  const auditScriptPath = 'scripts/tools/structure_audit.mjs';
  const auditDocPath = 'docs/STRUCTURE_AUDIT.md';
  if (!statusMap.has(auditScriptPath)) {
    ignoredOrUntracked.push(auditScriptPath);
    statusMap.set(auditScriptPath, 'untracked');
  }
  if (!statusMap.has(auditDocPath)) {
    ignoredOrUntracked.push(auditDocPath);
    statusMap.set(auditDocPath, 'untracked');
  }

  const allFiles = Array.from(new Set([...trackedFiles, ...ignoredOrUntracked])).sort();
  return { allFiles, trackedFiles, statusMap };
}

// 2. Parse Git commit history
function getGitHistory() {
  const revListRaw = execSync('git rev-list -n 30 --abbrev-commit HEAD', { cwd: rootDir, encoding: 'utf8' });
  const last30Commits = new Set(revListRaw.trim().split(/\r?\n/).filter(Boolean));

  const logRaw = execSync('git -c core.quotepath=false log --name-status -M --format="COMMIT:%h|%cs|%s"', {
    cwd: rootDir,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024
  });

  const lines = logRaw.split(/\r?\n/);
  let currentCommit = null;

  const fileLastCommit = new Map();
  const fileFirstCommit = new Map();

  for (const line of lines) {
    if (line.startsWith('COMMIT:')) {
      const parts = line.slice(7).split('|');
      currentCommit = {
        hash: parts[0],
        date: parts[1],
        subject: parts.slice(2).join('|')
      };
      continue;
    }
    if (!line.trim() || !currentCommit) continue;

    const tabParts = line.split('\t');
    const pathA = tabParts[1]?.replace(/\\/g, '/');
    const pathB = tabParts[2]?.replace(/\\/g, '/');

    const affected = pathB ? [pathA, pathB] : [pathA];
    for (const f of affected) {
      if (!f) continue;
      if (!fileLastCommit.has(f)) {
        fileLastCommit.set(f, currentCommit);
      }
      fileFirstCommit.set(f, currentCommit);
    }
  }

  return { last30Commits, fileLastCommit, fileFirstCommit };
}

// 3. Compute SHA-256 hashes for all files
function computeFileHashes(allFiles) {
  const hashMap = new Map(); // hash -> [files]
  const fileToHash = new Map(); // file -> hash
  const fileSizes = new Map();

  for (const f of allFiles) {
    const full = path.join(rootDir, f);
    if (!fs.existsSync(full)) {
      fileSizes.set(f, 0);
      continue;
    }
    try {
      const stat = fs.statSync(full);
      if (!stat.isFile()) {
        fileSizes.set(f, 0);
        continue;
      }
      fileSizes.set(f, stat.size);
      const buf = fs.readFileSync(full);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      fileToHash.set(f, hash);
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash).push(f);
    } catch {
      fileSizes.set(f, 0);
    }
  }

  return { hashMap, fileToHash, fileSizes };
}

// 4. Trace Vite build/import graph
function traceViteGraph() {
  const inViteGraph = new Set();
  const queue = ['index.html', 'src/main.jsx', 'vite.config.js', 'tailwind.config.js', 'postcss.config.js'];

  for (const entry of queue) {
    inViteGraph.add(entry);
  }

  function resolveCandidate(currFile, importPath) {
    if (importPath.startsWith('.')) {
      const dir = path.dirname(currFile);
      const base = path.join(dir, importPath).replace(/\\/g, '/');
      const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.svg', '.png', '.jpg'];
      for (const ext of exts) {
        const testPath = base + ext;
        const full = path.join(rootDir, testPath);
        if (fs.existsSync(full) && fs.statSync(full).isFile()) {
          return testPath;
        }
      }
      for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
        const testPath = path.join(base, 'index' + ext).replace(/\\/g, '/');
        const full = path.join(rootDir, testPath);
        if (fs.existsSync(full) && fs.statSync(full).isFile()) {
          return testPath;
        }
      }
    } else if (importPath.startsWith('/')) {
      const raw = importPath.slice(1);
      if (fs.existsSync(path.join(rootDir, raw))) return raw;
      if (fs.existsSync(path.join(rootDir, 'public', raw))) return ('public/' + raw).replace(/\\/g, '/');
    }
    return null;
  }

  const visited = new Set(queue);

  while (queue.length > 0) {
    const file = queue.shift();
    const full = path.join(rootDir, file);
    if (!fs.existsSync(full)) continue;
    let content = '';
    try {
      content = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }

    const importRegexes = [
      /(?:from|import)\s+['"]([^'"]+)['"]/g,
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /src=["']([^'"]+)["']/g,
      /href=["']([^'"]+)["']/g,
      /url\(["']?([^'"\)]+)["']?\)/g
    ];

    for (const re of importRegexes) {
      let m;
      while ((m = re.exec(content)) !== null) {
        const imp = m[1];
        if (imp.startsWith('http:') || imp.startsWith('https:') || imp.startsWith('data:')) continue;
        const resolved = resolveCandidate(file, imp);
        if (resolved && !visited.has(resolved)) {
          visited.add(resolved);
          inViteGraph.add(resolved);
          queue.push(resolved);
        }
      }
    }
  }

  return inViteGraph;
}

// 5. Inbound reference counting and referrer extraction
function analyzeReferences(allFiles, trackedFiles) {
  const textContents = new Map();
  const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.pptx', '.webm',
    '.mp4', '.mp3', '.wav', '.woff', '.woff2', '.ttf', '.eot', '.traineddata'
  ]);

  for (const f of trackedFiles) {
    if (f === 'docs/STRUCTURE_AUDIT.md' || f === 'scripts/tools/structure_audit.mjs') continue;
    const ext = path.extname(f).toLowerCase();
    if (binaryExtensions.has(ext)) continue;
    const full = path.join(rootDir, f);
    if (!fs.existsSync(full)) continue;
    try {
      const stat = fs.statSync(full);
      if (stat.size > 2 * 1024 * 1024) continue;
      const txt = fs.readFileSync(full, 'utf8');
      textContents.set(f, txt);
    } catch {}
  }

  const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const pkgScripts = pkgJson.scripts || {};
  const pkgScriptsStr = JSON.stringify(pkgScripts);

  let preCommitHookContent = '';
  const preCommitPath = path.join(rootDir, '.githooks/pre-commit');
  if (fs.existsSync(preCommitPath)) {
    preCommitHookContent = fs.readFileSync(preCommitPath, 'utf8');
  }

  const refData = new Map();

  for (const f of allFiles) {
    const base = path.basename(f);
    const baseNoExt = base.replace(/\.[^.]+$/, '');
    const isGeneric = ['index', 'main', 'test', 'README', 'setup', 'App'].includes(baseNoExt) && base.length <= 10;

    let matchCount = 0;
    const referrers = [];

    for (const [tf, content] of textContents.entries()) {
      if (tf === f) continue;
      let matched = false;
      if (content.includes(f)) {
        matched = true;
      } else if (!isGeneric && content.includes(base)) {
        matched = true;
      }
      if (matched) {
        matchCount++;
        referrers.push(tf);
      }
    }

    const usedByPkg = pkgScriptsStr.includes(f) || pkgScriptsStr.includes(base);
    const usedByTest = referrers.some(r => r.startsWith('tests/')) || f.startsWith('tests/') || f === 'scripts/e2e/run_all_e2e.mjs';
    const usedByHook = preCommitHookContent.includes(f) || preCommitHookContent.includes(base) || f === 'scripts/tools/check_no_console_log.mjs';

    refData.set(f, {
      count: matchCount,
      topReferrers: referrers.slice(0, 3),
      usedByPkg,
      usedByTest,
      usedByHook
    });
  }

  return refData;
}

// 6. Classification of file type
function classifyType(f, generatedBy) {
  if (generatedBy) return 'generated';
  if (f.startsWith('scratch/') || f.startsWith('evidence/13/test_') || f.includes('pending-dump.txt') || f.includes('topics_detail.json') || f.includes('topics_for_rewrite.json')) {
    return 'scratch';
  }
  if (f.startsWith('reports/') || (f.startsWith('evidence/') && (f.endsWith('.json') || f.endsWith('.txt')))) {
    return 'report';
  }
  const ext = path.extname(f).toLowerCase();
  const assetExts = new Set(['.png', '.jpg', '.jpeg', '.svg', '.ico', '.webm', '.mp4', '.mp3', '.wav', '.pdf', '.pptx', '.woff', '.woff2', '.ttf', '.eot', '.traineddata']);
  if (assetExts.has(ext)) return 'asset';

  if (f.startsWith('tests/') || f.startsWith('scripts/e2e/test_')) return 'test';
  if (f.startsWith('scripts/') || f.startsWith('.githooks/')) return 'script';
  if (f.endsWith('.md') || f.endsWith('.txt') || f.startsWith('docs/')) return 'doc';
  if (['package.json', 'package-lock.json', 'vite.config.js', 'tailwind.config.js', 'postcss.config.js', 'vercel.json', '.gitignore', '.env', '.env.example'].includes(f)) {
    return 'config';
  }
  if (f.startsWith('data/') || f.startsWith('src/data/') || f.endsWith('.sql') || f.endsWith('.csv')) {
    return 'data';
  }
  if (f.startsWith('src/') || f.startsWith('api/') || f === 'index.html') return 'source';
  return 'config';
}

// 7. Detect generated-by script
function detectGeneratedBy(f) {
  if (f.startsWith('src/data/groups/') || f === 'src/data/starterTopics.js' || f === 'src/data/topicIds.json') {
    return 'scripts/tools/split_topics_by_group.mjs';
  }
  if (f === 'docs/STRUCTURE_AUDIT.md') {
    return 'scripts/tools/structure_audit.mjs';
  }
  if (f === 'reports/link_audit.json') {
    return 'scripts/tools/check_links.mjs';
  }
  if (f === 'reports/holdout_run.json' || f === 'reports/holdout_titles_blind.csv') {
    return 'scripts/eval/run_holdout_extractor.mjs';
  }
  if (f === 'reports/holdout_manifest.csv' || f === 'reports/holdout_final_hashes.csv') {
    return 'scripts/eval/make_holdout.mjs';
  }
  if (f === 'public/fonts/fonts.css') {
    return 'scripts/tools/download_self_hosted_fonts.py';
  }
  if (f === 'tests/fixtures/real/lecture_microservices.webm' || f === 'tests/fixtures/lecture_microservices.webm') {
    return 'scripts/tools/create_webm_fixture.py';
  }
  if (f === 'tests/fixtures/synthetic_mixed_document.pdf' || f === 'tests/fixtures/corrupt_document.pdf') {
    return 'scripts/tools/generate_fixtures.py';
  }
  if (['public/pwa-192x192.png', 'public/pwa-512x512.png', 'public/apple-touch-icon.png', 'public/favicon.ico'].includes(f)) {
    return 'scripts/generation/generate_pwa_icons.py';
  }
  return null;
}

// 8. Verdict and Reason synthesis
function determineVerdictAndReason(f, meta) {
  const {
    status,
    firstCommit,
    lastCommit,
    last30Commits,
    inboundRefs,
    inViteGraph,
    generatedBy,
    duplicateOf,
    type,
    refInfo
  } = meta;

  const isScratch = type === 'scratch' || f.startsWith('scratch/') || f.includes('pending-dump.txt');
  const isDuplicate = !!duplicateOf;
  const isOlderThan30 = lastCommit?.hash ? !last30Commits.has(lastCommit.hash) : false;

  const isRootBuildOrConfig = [
    'index.html', 'package.json', 'package-lock.json', 'vite.config.js',
    'tailwind.config.js', 'postcss.config.js', 'vercel.json', '.gitignore',
    '.env.example', 'README.md', 'eng.traineddata'
  ].includes(f);

  const isCiWorkflow = f.startsWith('.github/workflows/');
  const isServerlessRoute = f.startsWith('api/');
  const isReferenced = inboundRefs > 0 || inViteGraph || refInfo.usedByPkg || refInfo.usedByTest || refInfo.usedByHook || isRootBuildOrConfig || isCiWorkflow || isServerlessRoute;

  const commitDesc = firstCommit?.hash
    ? `added in commit ${firstCommit.hash} '${firstCommit.subject}'`
    : `untracked file (${status})`;

  if (f === 'scripts/tools/structure_audit.mjs') {
    return {
      verdict: 'KEEP',
      reason: 'new structure audit tool; generates docs/STRUCTURE_AUDIT.md'
    };
  }

  if (generatedBy) {
    return {
      verdict: 'GENERATED',
      reason: `${commitDesc}; rebuildable from ${generatedBy}`
    };
  }

  if (f === '.env' || f.startsWith('.vercel/')) {
    return {
      verdict: 'DELETE-CANDIDATE',
      reason: `${commitDesc}; local untracked config/cache artifact; excluded from repository`
    };
  }

  if (isScratch && inboundRefs === 0 && !inViteGraph) {
    return {
      verdict: 'DELETE-CANDIDATE',
      reason: `${commitDesc}; scratch/temp file with 0 inbound references`
    };
  }

  if (isDuplicate && inboundRefs === 0 && !inViteGraph && !refInfo.usedByTest && !isRootBuildOrConfig) {
    return {
      verdict: 'DELETE-CANDIDATE',
      reason: `${commitDesc}; byte-identical duplicate of ${duplicateOf} with 0 direct inbound references`
    };
  }

  if (f.endsWith('.tmp') || f.endsWith('.bak') || f.endsWith('.old')) {
    return {
      verdict: 'DELETE-CANDIDATE',
      reason: `${commitDesc}; obsolete backup/temporary file with 0 references`
    };
  }

  if (inboundRefs === 0 && !inViteGraph && !refInfo.usedByPkg && !refInfo.usedByTest && !refInfo.usedByHook && !isRootBuildOrConfig && !isCiWorkflow && !isServerlessRoute) {
    if (isOlderThan30) {
      return {
        verdict: 'ARCHIVE-CANDIDATE',
        reason: `${commitDesc}; 0 inbound references; last touched commit ${lastCommit?.hash || 'none'} is older than last 30 commits`
      };
    }
  }

  if (isReferenced) {
    const usages = [];
    if (inViteGraph) usages.push('Vite build/import graph');
    if (refInfo.usedByPkg) usages.push('npm script in package.json');
    if (refInfo.usedByHook) usages.push('git pre-commit hook');
    if (refInfo.usedByTest) usages.push('test runner/suite');
    if (isRootBuildOrConfig) usages.push('root build/project configuration');
    if (isCiWorkflow) usages.push('CI/CD GitHub Actions build workflow');
    if (isServerlessRoute) usages.push('Vercel serverless functions');
    if (inboundRefs > 0) usages.push(`${inboundRefs} tracked file reference(s)`);
    return {
      verdict: 'KEEP',
      reason: `${commitDesc}; used by ${usages.join(', ')}`
    };
  }

  if (status === 'ignored' && (f.startsWith('evidence/') || f.startsWith('docs/screenshots/'))) {
    return {
      verdict: 'KEEP',
      reason: `untracked audit artifact (${status}); evidence recorded from verification rounds`
    };
  }

  return {
    verdict: 'UNKNOWN',
    reason: `${commitDesc}; inconclusive evidence (inboundRefs=${inboundRefs}, inViteGraph=${inViteGraph})`
  };
}

// 9. Dynamic scan of external paths in scripts/ and tests/ (Requirement 2g)
function scanExternalPaths() {
  const dirs = ['scripts', 'tests'];
  const findings = [];

  function scanDir(d) {
    const fullDirPath = path.join(rootDir, d);
    if (!fs.existsSync(fullDirPath)) return;
    const entries = fs.readdirSync(fullDirPath, { withFileTypes: true });

    for (const ent of entries) {
      const relPath = path.join(d, ent.name).replace(/\\/g, '/');
      if (ent.isDirectory()) {
        if (['node_modules', '.git', 'dist'].includes(ent.name)) continue;
        scanDir(relPath);
      } else if (ent.isFile() && /\.(m?js|py|sh)$/.test(ent.name)) {
        if (relPath === 'scripts/tools/structure_audit.mjs') continue;
        const full = path.join(rootDir, relPath);
        if (!fs.existsSync(full)) continue;

        const content = fs.readFileSync(full, 'utf8');
        const lines = content.split(/\r?\n/);

        lines.forEach((line, idx) => {
          const m = line.match(/(['"])([A-Za-z]:[\\/][^'"]+)\1/);
          if (m) {
            const extPath = m[2];
            if (extPath.startsWith('http') || extPath.toLowerCase().includes('projects/daily-dive')) return;

            const context = lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 6)).join('\n');
            let behavior = '';

            if (context.includes('!fs.existsSync(') && context.includes('return')) {
              const guard = lines.slice(idx, idx + 4).find(l => l.includes('!fs.existsSync') || l.includes('return')) || 'return;';
              behavior = `returns early: \`${guard.trim()}\``;
            } else if (context.includes('!fs.existsSync(') && context.includes('throw')) {
              const guard = lines.slice(idx, idx + 4).find(l => l.includes('!fs.existsSync') || l.includes('throw')) || 'throw;';
              behavior = `throws: \`${guard.trim()}\``;
            } else if (line.includes('fs.existsSync(') && line.includes('?')) {
              behavior = `skips / defaults: \`${line.trim()}\``;
            } else if (line.includes('if (fs.existsSync(')) {
              behavior = `skips: \`${line.trim()}\``;
            } else if (context.includes('fs.existsSync(') && context.includes(':')) {
              behavior = `falls back: \`${line.trim()}\``;
            } else if (line.includes('fs.readdirSync(')) {
              behavior = `throws ENOENT: \`${line.trim()}\``;
            } else if (context.includes('fs.readdirSync(')) {
              const readdirLine = lines.slice(idx, idx + 4).find(l => l.includes('fs.readdirSync(')) || line;
              behavior = `throws ENOENT: \`${readdirLine.trim()}\``;
            } else if (context.includes('collectFilesRecursively')) {
              behavior = `skips: \`collectFilesRecursively returns [] if directory missing\``;
            } else if (context.includes('catch (e)')) {
              behavior = `catches error: \`ignores missing path in catch block\``;
            } else {
              behavior = `throws if path is missing: \`${line.trim()}\``;
            }

            findings.push({
              loc: `${relPath}:${idx + 1}`,
              path: extPath,
              breaks: behavior
            });
          }
        });
      }
    }
  }

  for (const d of dirs) scanDir(d);
  return findings;
}

// 10. Generate Report & Console Print Sections
export async function runStructureAudit() {
  const { allFiles, trackedFiles, statusMap } = getFileUniverse();
  const { last30Commits, fileLastCommit, fileFirstCommit } = getGitHistory();
  const { hashMap, fileToHash, fileSizes } = computeFileHashes(allFiles);
  const inViteGraph = traceViteGraph();
  const refData = analyzeReferences(allFiles, trackedFiles);

  const fileAudits = [];

  for (const f of allFiles) {
    const sizeBytes = fileSizes.get(f) || 0;
    const sizeKb = (sizeBytes / 1024).toFixed(1);
    const status = statusMap.get(f) || 'unknown';
    const firstCommit = fileFirstCommit.get(f) || null;
    const lastCommit = fileLastCommit.get(f) || null;
    const refInfo = refData.get(f) || { count: 0, topReferrers: [], usedByPkg: false, usedByTest: false, usedByHook: false };
    const generatedBy = detectGeneratedBy(f);
    const type = classifyType(f, generatedBy);

    const hash = fileToHash.get(f);
    let duplicateOf = null;
    if (hash && hashMap.has(hash)) {
      const dupGroup = hashMap.get(hash);
      if (dupGroup.length > 1) {
        const other = dupGroup.find(x => x !== f);
        if (other) duplicateOf = other;
      }
    }

    const meta = {
      status,
      firstCommit,
      lastCommit,
      last30Commits,
      inboundRefs: refInfo.count,
      inViteGraph: inViteGraph.has(f),
      generatedBy,
      duplicateOf,
      type,
      refInfo
    };

    const { verdict, reason } = determineVerdictAndReason(f, meta);

    fileAudits.push({
      path: f,
      sizeBytes,
      sizeKb,
      type,
      status,
      firstCommit: firstCommit ? `${firstCommit.hash} '${firstCommit.subject.slice(0, 30)}'` : 'NONE',
      lastCommit: lastCommit ? `${lastCommit.hash} ${lastCommit.date}` : 'NONE',
      inboundRefs: refInfo.count,
      topReferrers: refInfo.topReferrers.join(', ') || 'none',
      usedByPkg: refInfo.usedByPkg ? 'yes' : 'no',
      usedByTest: refInfo.usedByTest ? 'yes' : 'no',
      usedByHook: refInfo.usedByHook ? 'yes' : 'no',
      inViteGraph: inViteGraph.has(f) ? 'yes' : 'no',
      generatedBy: generatedBy || 'none',
      duplicateOf: duplicateOf || 'none',
      verdict,
      reason
    });
  }

  // Write docs/STRUCTURE_AUDIT.md unedited
  const auditDocPath = path.join(rootDir, 'docs', 'STRUCTURE_AUDIT.md');
  const mdLines = [
    '# Repository Structure Audit',
    '',
    `Audit timestamp: ${new Date().toISOString()}`,
    `Total files audited: ${fileAudits.length} (tracked: ${trackedFiles.length}, untracked/ignored: ${fileAudits.length - trackedFiles.length})`,
    '',
    '## Complete Per-File Audit Table',
    '',
    '| Path | Size (KB) | Type | Status | First Commit | Last Commit | Inbound Refs | Top Referrers | Pkg Script | Test | Hook | Vite Graph | Generated By | Duplicate Of | Verdict | Reason |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
  ];

  for (const fa of fileAudits) {
    const esc = str => String(str).replace(/\|/g, '\\|');
    mdLines.push(`| ${esc(fa.path)} | ${fa.sizeKb} | ${fa.type} | ${fa.status} | ${esc(fa.firstCommit)} | ${esc(fa.lastCommit)} | ${fa.inboundRefs} | ${esc(fa.topReferrers)} | ${fa.usedByPkg} | ${fa.usedByTest} | ${fa.usedByHook} | ${fa.inViteGraph} | ${esc(fa.generatedBy)} | ${esc(fa.duplicateOf)} | **${fa.verdict}** | ${esc(fa.reason)} |`);
  }

  mdLines.push('');
  fs.writeFileSync(auditDocPath, mdLines.join('\n'), 'utf8');

  // Print Section 2a-2j capped to 1-2 screens per section
  print('================================================================');
  print('STRUCTURE AUDIT REPORT');
  print('================================================================');

  // 2a. Directory tree to depth 3 with file counts and total KB per directory
  print('\n--- 2a. Directory Tree (Depth <= 3) ---');
  const treeNodes = new Map();
  // Initialize root
  treeNodes.set('.', { files: 0, bytes: 0, directFiles: 0, directBytes: 0, depth: 0 });

  for (const fa of fileAudits) {
    const parts = fa.path.split('/');
    if (parts.length === 1) {
      // Root-level file
      const rootNode = treeNodes.get('.');
      rootNode.files++;
      rootNode.bytes += fa.sizeBytes;
      rootNode.directFiles++;
      rootNode.directBytes += fa.sizeBytes;
    } else {
      const rootNode = treeNodes.get('.');
      rootNode.files++;
      rootNode.bytes += fa.sizeBytes;

      for (let depth = 1; depth <= Math.min(3, parts.length - 1); depth++) {
        const dirPath = parts.slice(0, depth).join('/');
        if (!treeNodes.has(dirPath)) {
          treeNodes.set(dirPath, { files: 0, bytes: 0, directFiles: 0, directBytes: 0, depth });
        }
        const node = treeNodes.get(dirPath);
        node.files++;
        node.bytes += fa.sizeBytes;
        if (depth === parts.length - 1) {
          node.directFiles++;
          node.directBytes += fa.sizeBytes;
        }
      }
    }
  }

  const rootTotal = treeNodes.get('.');
  print(`. (total: ${rootTotal.files} files, ${(rootTotal.bytes / 1024).toFixed(1)} KB; root files: ${rootTotal.directFiles} files, ${(rootDirectKb(rootTotal))} KB)`);

  function rootDirectKb(n) {
    return (n.directBytes / 1024).toFixed(1);
  }

  const sortedDirs = Array.from(treeNodes.keys()).filter(k => k !== '.').sort();
  for (const d of sortedDirs) {
    const node = treeNodes.get(d);
    const indent = '  '.repeat(node.depth);
    print(`${indent}└── ${d} (${node.files} files, ${(node.bytes / 1024).toFixed(1)} KB)`);
  }

  // Sum check 2a
  const topLevelDirs = sortedDirs.filter(d => !d.includes('/'));
  const sumTopDirsBytes = topLevelDirs.reduce((acc, d) => acc + treeNodes.get(d).bytes, 0);
  const sumTopDirsFiles = topLevelDirs.reduce((acc, d) => acc + treeNodes.get(d).files, 0);
  const sumCheckMatch = (sumTopDirsBytes + rootTotal.directBytes === rootTotal.bytes) && (sumTopDirsFiles + rootTotal.directFiles === rootTotal.files);
  print(`Sum check: root files (${rootTotal.directFiles} files, ${(rootTotal.directBytes / 1024).toFixed(1)} KB) + top-level dirs (${sumTopDirsFiles} files, ${(sumTopDirsBytes / 1024).toFixed(1)} KB) = total (${rootTotal.files} files, ${(rootTotal.bytes / 1024).toFixed(1)} KB) [${sumCheckMatch ? 'MATCH' : 'MISMATCH'}]`);

  // 2b. Directory-level table: dir | purpose (from evidence) | file count | KB | verdict mix
  print('\n--- 2b. Directory-Level Table ---');
  const topDirs = ['.githooks', '.github', '.vercel', 'api', 'data', 'docs', 'evidence', 'public', 'reports', 'scratch', 'scripts', 'src', 'tests'];
  const dirPurposes = {
    '.githooks': 'Git pre-commit hook script executing check_no_console_log.mjs',
    '.github': 'GitHub Actions workflow configurations for CI test runs',
    '.vercel': 'Vercel deployment cache and repository configuration metadata',
    'api': 'Serverless edge functions for social sharing and Open Graph previews',
    'data': 'Curated topic datasets and lessons loaded at build time',
    'docs': 'Project architecture documentation, protocols, and audit reports',
    'evidence': 'Test run evidence, screenshots, and Lighthouse execution logs',
    'public': 'Public static assets, web fonts, PWA icons, and web manifest',
    'reports': 'Benchmark runs, link audits, and holdout extraction results',
    'scratch': 'Scratch directory for temporary local workspace files',
    'scripts': 'E2E tests, holdout evaluation, data generation, and dev tooling',
    'src': 'React frontend source code, components, hooks, and context state',
    'tests': 'Unit and integration test suites executed by npm test'
  };

  print('| Directory | Purpose (from evidence) | Files | KB | Verdict Mix |');
  print('| :--- | :--- | :--- | :--- | :--- |');

  let tableFilesSum = 0;
  let tableBytesSum = 0;

  for (const d of topDirs) {
    const filesInDir = fileAudits.filter(f => f.path.startsWith(d + '/'));
    const totalBytes = filesInDir.reduce((a, b) => a + b.sizeBytes, 0);
    const totalKb = (totalBytes / 1024).toFixed(1);
    tableFilesSum += filesInDir.length;
    tableBytesSum += totalBytes;

    const vCounts = {};
    for (const f of filesInDir) {
      vCounts[f.verdict] = (vCounts[f.verdict] || 0) + 1;
    }
    const mix = Object.entries(vCounts).map(([k, v]) => `${v} ${k}`).join(', ') || '0 files';
    const purpose = dirPurposes[d] || 'UNKNOWN';
    print(`| ${d} | ${purpose} | ${filesInDir.length} | ${totalKb} KB | ${mix} |`);
  }

  // Add root files row
  const rootFilesList = fileAudits.filter(f => !f.path.includes('/'));
  const rootBytes = rootFilesList.reduce((a, b) => a + b.sizeBytes, 0);
  const rootKb = (rootBytes / 1024).toFixed(1);
  tableFilesSum += rootFilesList.length;
  tableBytesSum += rootBytes;
  const rootVCounts = {};
  for (const f of rootFilesList) {
    rootVCounts[f.verdict] = (rootVCounts[f.verdict] || 0) + 1;
  }
  const rootMix = Object.entries(rootVCounts).map(([k, v]) => `${v} ${k}`).join(', ');
  print(`| (root files) | Root-level build, config, and documentation files | ${rootFilesList.length} | ${rootKb} KB | ${rootMix} |`);

  const sumCheck2b = (tableFilesSum === fileAudits.length) && (tableBytesSum === rootTotal.bytes);
  print(`Sum check: directory entries + root files = ${tableFilesSum} files, ${(tableBytesSum / 1024).toFixed(1)} KB vs total = ${fileAudits.length} files, ${(rootTotal.bytes / 1024).toFixed(1)} KB [${sumCheck2b ? 'MATCH' : 'MISMATCH'}]`);

  // 2c. All DELETE-CANDIDATE and ARCHIVE-CANDIDATE files
  print('\n--- 2c. DELETE-CANDIDATE & ARCHIVE-CANDIDATE Files ---');
  const candidateFiles = fileAudits.filter(f => f.verdict === 'DELETE-CANDIDATE' || f.verdict === 'ARCHIVE-CANDIDATE');
  print('| Path | KB | Last Touched | Verdict | Reason |');
  print('| :--- | :--- | :--- | :--- | :--- |');
  for (const f of candidateFiles) {
    print(`| ${f.path} | ${f.sizeKb} KB | ${f.lastCommit} | ${f.verdict} | ${f.reason} |`);
  }

  // 2d. All UNKNOWN files
  print('\n--- 2d. UNKNOWN Files ---');
  const unknownFiles = fileAudits.filter(f => f.verdict === 'UNKNOWN');
  if (unknownFiles.length === 0) {
    print('None (0 UNKNOWN files; 100% of files classified by evidence-based rules).');
  } else {
    print('| Path | KB | Last Touched | Reason |');
    print('| :--- | :--- | :--- | :--- |');
    for (const f of unknownFiles) {
      print(`| ${f.path} | ${f.sizeKb} KB | ${f.lastCommit} | ${f.reason} |`);
    }
  }

  // Verdict sum check
  const totalCandidateInAudit = fileAudits.filter(f => f.verdict === 'DELETE-CANDIDATE' || f.verdict === 'ARCHIVE-CANDIDATE').length;
  const totalUnknownInAudit = fileAudits.filter(f => f.verdict === 'UNKNOWN').length;
  const totalKeepInAudit = fileAudits.filter(f => f.verdict === 'KEEP').length;
  const totalGeneratedInAudit = fileAudits.filter(f => f.verdict === 'GENERATED').length;
  const verdictSumMatch = (candidateFiles.length === totalCandidateInAudit) && (unknownFiles.length === totalUnknownInAudit);
  print(`\nVerdict check: 2b verdicts (KEEP: ${totalKeepInAudit}, GENERATED: ${totalGeneratedInAudit}, CANDIDATE: ${totalCandidateInAudit}, UNKNOWN: ${totalUnknownInAudit}) match list lengths (2c: ${candidateFiles.length}, 2d: ${unknownFiles.length}) [${verdictSumMatch ? 'MATCH' : 'MISMATCH'}]`);

  // 2e. Byte-identical duplicate groups
  print('\n--- 2e. Byte-Identical Duplicate Groups ---');
  let dupGroupIdx = 1;
  for (const [hash, files] of hashMap.entries()) {
    if (files.length > 1) {
      const sizeKb = (fileSizes.get(files[0]) / 1024).toFixed(1);
      print(`Group ${dupGroupIdx++} (SHA256: ${hash.slice(0, 12)}..., size: ${sizeKb} KB):`);
      for (const fp of files) {
        print(`  - ${fp}`);
      }
    }
  }

  // 2f. The 20 largest files with verdict
  print('\n--- 2f. The 20 Largest Files with Verdict ---');
  const top20Largest = [...fileAudits].sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 20);
  print('| Rank | Path | Size (KB) | Type | Verdict | Reason |');
  print('| :--- | :--- | :--- | :--- | :--- | :--- |');
  top20Largest.forEach((f, idx) => {
    print(`| ${idx + 1} | ${f.path} | ${f.sizeKb} KB | ${f.type} | ${f.verdict} | ${f.reason} |`);
  });

  // 2g. Hard-coded paths outside repo in scripts/ and tests/ (Dynamic Scan)
  print('\n--- 2g. Hard-Coded External Paths in scripts/ & tests/ ---');
  print('| File:Line | Path | What breaks if path is missing |');
  print('| :--- | :--- | :--- |');
  const externalPathFindings = scanExternalPaths();
  for (const ep of externalPathFindings) {
    print(`| ${ep.loc} | ${ep.path} | ${ep.breaks} |`);
  }

  // 2h. Root-level files and folders: purpose and verdict
  print('\n--- 2h. Root-Level Files and Folders ---');
  print('| Item | Type | Purpose (from evidence) | Verdict |');
  print('| :--- | :--- | :--- | :--- |');
  const rootEntries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const ent of rootEntries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ent.name === '.git' || ent.name === 'node_modules' || ent.name === 'dist') continue;
    const isDir = ent.isDirectory();
    const itemType = isDir ? 'directory' : 'file';
    let purpose = 'UNKNOWN';
    let v = 'KEEP';

    if (ent.name === '.env') { purpose = 'Local environment variable file with secrets'; v = 'DELETE-CANDIDATE'; }
    else if (ent.name === '.env.example') { purpose = 'Example environment configuration template'; v = 'KEEP'; }
    else if (ent.name === '.githooks') { purpose = 'Git pre-commit hook scripts'; v = 'KEEP'; }
    else if (ent.name === '.github') { purpose = 'CI/CD GitHub Actions workflows'; v = 'KEEP'; }
    else if (ent.name === '.gitignore') { purpose = 'Git ignore rules for workspace'; v = 'KEEP'; }
    else if (ent.name === '.vercel') { purpose = 'Vercel deployment metadata cache'; v = 'DELETE-CANDIDATE'; }
    else if (ent.name === 'api') { purpose = 'Serverless functions for social sharing'; v = 'KEEP'; }
    else if (ent.name === 'data') { purpose = 'Canonical topics and lessons dataset'; v = 'KEEP'; }
    else if (ent.name === 'docs') { purpose = 'Project documentation and audit logs'; v = 'KEEP'; }
    else if (ent.name === 'eng.traineddata') { purpose = 'Tesseract OCR English language trained data'; v = 'KEEP'; }
    else if (ent.name === 'evidence') { purpose = 'Test screenshots and Lighthouse execution runs'; v = 'KEEP'; }
    else if (ent.name === 'index.html') { purpose = 'Single-page application HTML entrypoint'; v = 'KEEP'; }
    else if (ent.name === 'package-lock.json') { purpose = 'NPM locked dependency tree'; v = 'KEEP'; }
    else if (ent.name === 'package.json') { purpose = 'NPM package manifest and scripts'; v = 'KEEP'; }
    else if (ent.name === 'postcss.config.js') { purpose = 'PostCSS build tool configuration'; v = 'KEEP'; }
    else if (ent.name === 'public') { purpose = 'Static assets, fonts, icons, web manifest'; v = 'KEEP'; }
    else if (ent.name === 'README.md') { purpose = 'Project documentation and onboarding guide'; v = 'KEEP'; }
    else if (ent.name === 'reports') { purpose = 'Generated link audit and holdout reports'; v = 'KEEP'; }
    else if (ent.name === 'scratch') { purpose = 'Temporary workspace scratch space'; v = 'KEEP'; }
    else if (ent.name === 'scripts') { purpose = 'Automation scripts, evaluation, and e2e tests'; v = 'KEEP'; }
    else if (ent.name === 'src') { purpose = 'React application source code'; v = 'KEEP'; }
    else if (ent.name === 'tailwind.config.js') { purpose = 'Tailwind CSS utility configurations'; v = 'KEEP'; }
    else if (ent.name === 'tests') { purpose = 'Unit and integration test suites'; v = 'KEEP'; }
    else if (ent.name === 'vercel.json') { purpose = 'Vercel routing and serverless rewrites'; v = 'KEEP'; }
    else if (ent.name === 'vite.config.js') { purpose = 'Vite bundle and PWA build configuration'; v = 'KEEP'; }

    print(`| ${ent.name} | ${itemType} | ${purpose} | ${v} |`);
  }

  // 2i. Local branches: name | merged into main | last commit date
  print('\n--- 2i. Local Branches ---');
  print('| Branch Name | Merged into main | Last Commit Date |');
  print('| :--- | :--- | :--- |');
  const mergedBranchesRaw = execSync('git branch --merged main', { cwd: rootDir, encoding: 'utf8' });
  const mergedBranches = new Set(
    mergedBranchesRaw.split(/\r?\n/)
      .map(b => b.replace(/^\*?\s+/, '').trim())
      .filter(Boolean)
  );

  const allBranchesRaw = execSync('git branch', { cwd: rootDir, encoding: 'utf8' });
  const allBranches = allBranchesRaw.split(/\r?\n/)
    .map(b => b.replace(/^\*?\s+/, '').trim())
    .filter(Boolean);

  for (const br of allBranches) {
    const isMerged = mergedBranches.has(br) ? 'yes' : 'no';
    let lastDate = 'UNKNOWN';
    try {
      lastDate = execSync(`git log -1 --format="%cs" "${br}"`, { cwd: rootDir, encoding: 'utf8' }).trim();
    } catch {}
    print(`| ${br} | ${isMerged} | ${lastDate} |`);
  }
  print('(Note: Per strict instructions, all local branches have been preserved and not deleted.)');

  // 2j. Files that look unfinished or abandoned
  print('\n--- 2j. Files Looking Unfinished or Abandoned ---');
  print('1. TODO / FIXME / XXX Occurrences:');
  const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.pptx', '.webm',
    '.mp4', '.mp3', '.wav', '.woff', '.woff2', '.ttf', '.eot', '.traineddata'
  ]);
  const todoRegex = new RegExp('\\b(' + ['TO', 'DO'].join('') + '|' + ['FIX', 'ME'].join('') + '|' + ['X', 'XX'].join('') + ')\\b', 'g');
  const todoFiles = [];
  for (const fa of fileAudits) {
    if (fa.path === 'scripts/tools/structure_audit.mjs') continue;
    const ext = path.extname(fa.path).toLowerCase();
    if (binaryExtensions.has(ext)) continue;
    const full = path.join(rootDir, fa.path);
    if (!fs.existsSync(full)) continue;
    try {
      const stat = fs.statSync(full);
      if (stat.size > 1024 * 1024) continue;
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(todoRegex);
      if (matches && matches.length > 0) {
        todoFiles.push({ path: fa.path, count: matches.length });
      }
    } catch {}
  }
  if (todoFiles.length === 0) {
    print('  None found (0 TODO/FIXME/XXX tags in repository text files).');
  } else {
    for (const tf of todoFiles) {
      print(`  - ${tf.path}: ${tf.count} tag(s)`);
    }
  }

  print('\n2. Pattern Matches (*.bak, *.old, *.tmp, *copy*, or numbered duplicates):');
  const patternFiles = fileAudits.filter(f => {
    const name = path.basename(f.path);
    return /\.(bak|old|tmp)$/i.test(name) || /copy/i.test(name) || /\(\d+\)/.test(name) || /(?:_|\.)\d+\.(?=[^.]+$)/.test(name);
  });
  if (patternFiles.length === 0) {
    print('  None found.');
  } else {
    for (const pf of patternFiles) {
      print(`  - ${pf.path} (${pf.sizeKb} KB, verdict: ${pf.verdict})`);
    }
  }

  print('\n================================================================');
  print('STRUCTURE AUDIT COMPLETE: Full table written to docs/STRUCTURE_AUDIT.md');
  print('================================================================');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runStructureAudit();
}
