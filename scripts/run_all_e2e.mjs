import { execSync } from 'node:child_process';
import path from 'node:path';

const suites = [
  'scripts/test_pwa_v1_v2_update_flow.mjs',
  'scripts/test_e2e_offline.mjs',
  'scripts/test_e2e_keyboard.mjs',
  'scripts/test_e2e_reduced_motion.mjs',
  'scripts/test_e2e_ics.mjs',
  'scripts/test_axe_and_keyboard_round6.mjs',
  'scripts/extract_real_roadmap_lines.mjs',
  'scripts/test_upload_real_roadmap.mjs',
  'scripts/test_e2e_spin_toggles.mjs',
  'scripts/verify_round9_hero.mjs',
  'scripts/test_e2e_mobile.mjs',
  'scripts/test_e2e_topic_card.mjs',
  'scripts/test_e2e_declutter.mjs',
  'scripts/test_e2e_round15.mjs',
  'scripts/test_e2e_share_pages.mjs',
  'scripts/test_audio_volume.mjs',
  'scripts/test_library_row_wrapping.mjs',
  'scripts/test_round17_real_state.mjs',
  'scripts/test_round18_look_and_hero.mjs',
  'scripts/test_e2e_real_tabs.mjs'
];

console.log('=== RUNNING ALL DAILY DIVE E2E SUITES ===\n');

let failed = 0;
for (const suite of suites) {
  console.log(`\n----------------------------------------------------`);
  console.log(`Running: ${suite}`);
  console.log(`----------------------------------------------------`);
  try {
    execSync(`node ${suite}`, { stdio: 'inherit' });
    console.log(`[PASS]: ${suite}`);
  } catch (err) {
    console.error(`[FAIL]: ${suite}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} test suites failed.`);
  process.exit(1);
} else {
  console.log(`\nAll ${suites.length} E2E test suites passed successfully!`);
}
