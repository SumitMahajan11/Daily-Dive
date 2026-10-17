import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

import { safeLog } from './safeLog.mjs';

async function main() {
  const server = await createServer({ server: { port: 5210 } });
  await server.listen();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5210/');
  await page.waitForLoadState('networkidle');

  const fixtures16 = [
    { name: 'quote_card.md', type: 'text', main: 0 },
    { name: 'bullet_list.md', type: 'text', main: 1 },
    { name: 'table_page.md', type: 'text', main: 0 },
    { name: 'mind_map.png', type: 'image', main: 0 },
    { name: 'paragraph_note.txt', type: 'text', main: 0 },
    { name: 'decision_chain.jpg', type: 'image', main: 0 },
    { name: 'code_blocks_fixture.md', type: 'text', main: 1 },
    { name: 'markdown_roadmap.md', type: 'text', main: 4 },
    { name: 'microservices_architecture_spec.md', type: 'text', main: 4 },
    { name: 'nested_lists.md', type: 'text', main: 1 },
    { name: 'readme_style_fixture.md', type: 'text', main: 2 },
    { name: 'real_roadmap.md', type: 'text', main: 5 },
    { name: 'tables_fixture.md', type: 'text', main: 1 },
    { name: 'study_notes_computer_vision.png', type: 'image', main: 0 },
    { name: 'study_note_neural_nets.png', type: 'image', main: 1 },
    { name: 'scanned_tables_document.pdf', type: 'pdf', main: 0 }
  ];

  const results = [];

  for (const f of fixtures16) {
    const filePath = path.join('tests/fixtures/extraction', f.name);
    let extracted;

    if (f.type === 'image' || f.type === 'pdf') {
      const buf = fs.readFileSync(filePath);
      const b64 = buf.toString('base64');
      const mime = f.type === 'pdf' ? 'application/pdf' : (f.name.endsWith('.png') ? 'image/png' : 'image/jpeg');

      extracted = await page.evaluate(async ({ b64, name, mime }) => {
        const raw = atob(b64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        const file = new File([arr], name, { type: mime });

        let extractedData;
        if (mime === 'application/pdf') {
          const { extractFromPdf } = await import('/src/lib/extractors/pdfExtractor.js');
          extractedData = await extractFromPdf(file);
        } else {
          const { extractFromImage } = await import('/src/lib/extractors/imageExtractor.js');
          extractedData = await extractFromImage(file);
        }

        const { extractTopicsFromSections, computeExtractionCoverage } = await import('/src/lib/topicExtractor.js');
        const topics = await extractTopicsFromSections(extractedData, name);
        const coverage = computeExtractionCoverage(extractedData.text, topics);

        return {
          text: extractedData.text,
          topics: topics.map(t => ({ title: t.title, description: t.description })),
          coverage
        };
      }, { b64, name: f.name, mime });
    } else {
      const text = fs.readFileSync(filePath, 'utf8');
      extracted = await page.evaluate(async ({ text, name }) => {
        const { extractTopicsLocally, computeExtractionCoverage } = await import('/src/lib/topicExtractor.js');
        const topics = extractTopicsLocally(text, [], name);
        const coverage = computeExtractionCoverage(text, topics);
        return {
          text,
          topics: topics.map(t => ({ title: t.title, description: t.description })),
          coverage
        };
      }, { text, name: f.name });
    }

    const countChanged = extracted.topics.length !== f.main;
    const titles = extracted.topics.map(t => t.title);
    const exceeds2xMain = f.main > 0 && extracted.topics.length > 2 * f.main;

    results.push({
      name: f.name,
      type: f.type,
      main: f.main,
      newCount: extracted.topics.length,
      countChanged: countChanged ? 'Yes' : 'No',
      coverage: (extracted.coverage * 100).toFixed(1) + '%',
      rawCoverage: extracted.coverage,
      titlesChanged: countChanged ? titles.map(t => `"${t}"`).join(', ') : '-',
      exceeds2xMain
    });
  }

  safeLog('=== EVAL 16 SUMMARY ===');
  for (const r of results) {
    safeLog({
      file: r.name,
      main: r.main,
      topics: r.newCount,
      changed: r.countChanged === 'Yes',
      coverage: r.coverage
    });
  }

  await browser.close();
  await server.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
