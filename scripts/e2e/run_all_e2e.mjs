import util from 'node:util';
const printLog = (...args) => process.stdout.write(util.format(...args) + '\n');
import { execSync } from 'node:child_process';
import path from 'node:path';

const suites = [
  'scripts/e2e/test_pwa_v1_v2_update_flow.mjs',
  'scripts/e2e/test_e2e_offline.mjs',
  'scripts/e2e/test_e2e_keyboard.mjs',
  'scripts/e2e/test_e2e_reduced_motion.mjs',
  'scripts/e2e/test_e2e_ics.mjs',
  'scripts/e2e/test_axe_and_keyboard_round6.mjs',
  'scripts/e2e/extract_real_roadmap_lines.mjs',
  'scripts/e2e/test_upload_real_roadmap.mjs',
  'scripts/e2e/test_e2e_spin_toggles.mjs',
  'scripts/e2e/verify_round9_hero.mjs',
  'scripts/e2e/test_e2e_mobile.mjs',
  'scripts/e2e/test_e2e_topic_card.mjs',
  'scripts/e2e/test_e2e_declutter.mjs',
  'scripts/e2e/test_e2e_round15.mjs',
  'scripts/e2e/test_e2e_share_pages.mjs',
  'scripts/e2e/test_audio_volume.mjs',
  'scripts/e2e/test_library_row_wrapping.mjs',
  'scripts/e2e/test_round17_real_state.mjs',
  'scripts/e2e/test_round18_look_and_hero.mjs',
  'scripts/e2e/test_e2e_real_tabs.mjs',
  'scripts/e2e/test_e2e_extract_review.mjs',
  'scripts/e2e/test_spin_timing.mjs',
  'scripts/e2e/test_spin_visual.mjs',
  'scripts/e2e/test_spin_finish.mjs',
  'scripts/e2e/test_single_page.mjs',
  'scripts/e2e/test_hygiene.mjs',
  'scripts/e2e/test_review_consume.mjs',
  'scripts/e2e/test_spin_clears_not_found.mjs',
  'scripts/e2e/test_login_overflow.mjs'
];

printLog('=== RUNNING ALL DAILY DIVE E2E SUITES ===\n');

let failed = 0;
for (const suite of suites) {
  printLog(`\n----------------------------------------------------`);
  printLog(`Running: ${suite}`);
  printLog(`----------------------------------------------------`);
  try {
    execSync(`node ${suite}`, { stdio: 'inherit' });
    printLog(`[PASS]: ${suite}`);
  } catch (err) {
    console.error(`[FAIL]: ${suite}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} test suites failed.`);
  process.exit(1);
} else {
  printLog(`\nAll ${suites.length} E2E test suites passed successfully!`);
}
