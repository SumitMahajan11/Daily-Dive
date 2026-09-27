import fs from 'fs';
import { extractTopicsLocally } from '../src/lib/topicExtractor.js';

function testDoc(jsonFile, name) {
  const pages = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const fullText = pages.join('\n\n');
  const topics = extractTopicsLocally(fullText, pages, name);
  console.log(`\n========================================`);
  console.log(`FILE: ${name} (${topics.length} topics)`);
  console.log(`========================================`);
  topics.forEach((t, i) => {
    console.log(`[${i + 1}] "${t.title}"`);
    console.log(`     Desc: "${t.description}"`);
  });
}

testDoc('tests/fixtures/exp2_pages.json', 'Experiment no 2 cn.pdf');
testDoc('tests/fixtures/exp3_pages.json', 'Experiment no 3 cn.pdf');
testDoc('tests/fixtures/ccl1_pages.json', 'kartik_ccl_1.pdf');
testDoc('tests/fixtures/algo_pages.json', 'study_guide_algorithms.pdf');
