import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function getMimeType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'mov': return 'video/quicktime';
    case 'txt':
    case 'md': return 'text/plain';
    case 'json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

async function main() {
  const targetDir = process.argv[2] || 'tests/fixtures';
  const includeSubdirs = process.argv.includes('--all') || process.argv.includes('--recursive');

  function collectFiles(dir, recursive = false) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let fileList = [];
    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (recursive) {
          fileList = fileList.concat(collectFiles(fullPath, recursive));
        }
      } else {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const filePaths = collectFiles(targetDir, includeSubdirs).sort();

  const server = await createServer({ server: { port: 5218 } });
  await server.listen();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5218/');
  await page.waitForLoadState('networkidle');

  console.log('| file | pages | pages with outcome | skipped | flagged topics | topics | source chars | chars in topics\' full_text | coverage % | seconds |');
  console.log('|---|---|---|---|---|---|---|---|---|---|');

  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const relName = path.relative('tests/fixtures', filePath).replace(/\\/g, '/');
    const displayName = relName.startsWith('..') ? fileName : relName;
    const mime = getMimeType(fileName);

    const buf = fs.readFileSync(filePath);
    const b64 = buf.toString('base64');

    const t0 = performance.now();

    try {
      const result = await page.evaluate(async ({ b64, fileName, mime }) => {
        const raw = atob(b64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        const file = new File([arr], fileName, { type: mime });

        // ── Real upload path from LibraryScreen.jsx (lines 391-478) ──
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
        if (file.size > MAX_FILE_SIZE) {
          throw new Error('File is too large (max 10 MB).');
        }

        const ext = file.name.split('.').pop().toLowerCase();
        let extractedData = null;
        let pageCount = 0;

        if (ext === 'pdf') {
          const { extractFromPdf } = await import('/src/lib/extractors/pdfExtractor.js');
          extractedData = await extractFromPdf(file);
          pageCount = extractedData.pageCount || extractedData.totalPages || 0;
        } else if (ext === 'pptx') {
          const { extractFromPptx } = await import('/src/lib/extractors/pptxExtractor.js');
          extractedData = await extractFromPptx(file);
          pageCount = extractedData.slideCount || 0;
        } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
          const { extractFromImage } = await import('/src/lib/extractors/imageExtractor.js');
          extractedData = await extractFromImage(file);
          pageCount = 1;
        } else if (['mp4', 'webm', 'mov'].includes(ext)) {
          const { extractFromVideo } = await import('/src/lib/extractors/videoExtractor.js');
          extractedData = await extractFromVideo(file);
          pageCount = extractedData.frameCount || 0;
        } else if (['txt', 'md'].includes(ext)) {
          extractedData = await file.text();
          pageCount = 1;
        } else {
          throw new Error(`Unsupported file format .${ext}. Please upload a PDF, PPTX, image, or markdown note.`);
        }

        const rawText = typeof extractedData === 'string' ? extractedData : (extractedData?.text || '');
        if (!rawText || rawText.trim().length < 20) {
          throw new Error('No legible text could be found in the document.');
        }

        const { extractTopicsFromSections, computeExtractionCoverage } = await import('/src/lib/topicExtractor.js');
        const candidates = await extractTopicsFromSections(extractedData, file.name);

        if (!candidates || candidates.length === 0) {
          throw new Error('Could not identify clear concepts in this document.');
        }

        const scored = candidates.map(t => {
          return {
            ...t,
            id: t.id || `ext_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            confidence: typeof t.confidence === 'number' ? t.confidence : 75,
            needs_review: Boolean(t.needs_review),
            review_reasons: t.review_reasons || [],
            full_text: t.full_text || '',
            lifecycle: 'temporary'
          };
        });
        scored.pageOutcomes = candidates.pageOutcomes || [];

        const coverage = computeExtractionCoverage(rawText, scored);

        const pagesWithOutcome = scored.pageOutcomes?.length || 0;
        const skipped = scored.pageOutcomes?.filter(p => p.outcome === 'skipped').length || 0;
        const flagged = scored.filter(t => t.needs_review).length;
        const charsInFullText = scored.reduce((sum, t) => sum + (t.full_text || '').length, 0);

        return {
          ok: true,
          pages: pageCount,
          pagesWithOutcome,
          skipped,
          flagged,
          topics: scored.length,
          sourceChars: rawText.length,
          charsInFullText,
          coverage: (coverage * 100).toFixed(1) + '%'
        };
      }, { b64, fileName, mime });

      const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
      console.log(`| ${displayName} | ${result.pages} | ${result.pagesWithOutcome} | ${result.skipped} | ${result.flagged} | ${result.topics} | ${result.sourceChars} | ${result.charsInFullText} | ${result.coverage} | ${elapsed} |`);
    } catch (err) {
      const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
      console.log(`| ${displayName} | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.0% | ${elapsed} |`);
    }
  }

  await browser.close();
  await server.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
