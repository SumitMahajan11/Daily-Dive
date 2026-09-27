import fs from 'fs';
import { extractTopicsLocally, isNonTopicHeading } from '../src/lib/topicExtractor.js';

// Load all our test fixtures
const exp2Pages = JSON.parse(fs.readFileSync('tests/fixtures/exp2_pages.json', 'utf8'));
const exp3Pages = JSON.parse(fs.readFileSync('tests/fixtures/exp3_pages.json', 'utf8'));
const ccl1Pages = JSON.parse(fs.readFileSync('tests/fixtures/ccl1_pages.json', 'utf8'));
const algoPages = JSON.parse(fs.readFileSync('tests/fixtures/algo_pages.json', 'utf8'));
const sysSlides = JSON.parse(fs.readFileSync('tests/fixtures/systems_slides.json', 'utf8'));
const climateSlides = JSON.parse(fs.readFileSync('tests/fixtures/climate_slides.json', 'utf8'));

function runDocTest(pages, name) {
  const fullText = pages.join('\n\n');
  const topics = extractTopicsLocally(fullText, pages, name);
  console.log(`\n======================================================`);
  console.log(`DOCUMENT: ${name} (Yield: ${topics.length} topics)`);
  console.log(`======================================================`);
  
  let anyJunkFound = false;
  topics.forEach((t, i) => {
    const isJunk = isNonTopicHeading(t.title);
    if (isJunk) anyJunkFound = true;
    console.log(`[${i + 1}] "${t.title}" ${isJunk ? '<< FLAG: LOOKS LIKE NON-TOPIC >>' : '✓'}`);
    console.log(`    Category: ${t.category} | Group: ${t.group_name}`);
    console.log(`    Desc: "${t.description}"`);
  });

  return { topics, anyJunkFound };
}

console.log('=== MULTI-DOCUMENT TOPIC EXTRACTION TEST ===');
const res2 = runDocTest(exp2Pages, 'Experiment no 2 cn.pdf');
const res3 = runDocTest(exp3Pages, 'Experiment no 3 cn.pdf');
const resCcl = runDocTest(ccl1Pages, 'kartik_ccl_1.pdf');
const resAlgo = runDocTest(algoPages, 'study_guide_algorithms.pdf');
const resSys = runDocTest(sysSlides, 'lecture_systems.pptx');
const resClimate = runDocTest(climateSlides, 'AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx');

console.log('\n=== SUMMARY AUDIT ===');
console.log(`Exp 2 CN PDF: ${res2.topics.length} topics | Non-topic detected: ${res2.anyJunkFound}`);
console.log(`Exp 3 CN PDF: ${res3.topics.length} topics | Non-topic detected: ${res3.anyJunkFound}`);
console.log(`CCL 1 PDF:    ${resCcl.topics.length} topics | Non-topic detected: ${resCcl.anyJunkFound}`);
console.log(`Algo Guide:   ${resAlgo.topics.length} topics | Non-topic detected: ${resAlgo.anyJunkFound}`);
console.log(`Systems PPTX: ${resSys.topics.length} topics | Non-topic detected: ${resSys.anyJunkFound}`);
console.log(`Climate PPTX: ${resClimate.topics.length} topics | Non-topic detected: ${resClimate.anyJunkFound}`);

if (!res2.anyJunkFound && !res3.anyJunkFound && !resCcl.anyJunkFound && !resAlgo.anyJunkFound && !resSys.anyJunkFound && !resClimate.anyJunkFound) {
  console.log('\n>>> ALL 6 DOCUMENTS EXTRACTED CLEAN CONCEPTS WITH ZERO NON-TOPIC JUNK! <<<');
} else {
  console.log('\n>>> WARNING: SOME TOPICS WERE FLAGGED AS POTENTIAL JUNK <<<');
}
