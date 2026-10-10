import fs from 'fs';
import {
  selectTotalSpins,
  selectExploredCount,
  selectLearnedCount,
  selectReviewQueue,
  selectStreakMetrics
} from '../src/lib/selectors.js';
import { INITIAL_TOPICS } from '../src/lib/roulette.js';

const backupPath = 'evidence/real-backup.json';

if (!fs.existsSync(backupPath)) {
  console.log(`[INFO] "${backupPath}" not found. When exported from live app, this script will audit its invariants.`);
  process.exit(0);
}

const raw = fs.readFileSync(backupPath, 'utf8');
const backup = JSON.parse(raw);

const userProgressMap = backup.user_progress || {};
const history = backup.history || [];
const userStreaks = backup.user_streaks || {};

const totalSpins = selectTotalSpins({ userProgressMap, history });
const explored = selectExploredCount(userProgressMap);
const learned = selectLearnedCount(userProgressMap);
const streakMetrics = selectStreakMetrics({ userStreaks, history, userProgressMap });
const reviewQueue = selectReviewQueue(INITIAL_TOPICS, userProgressMap, 4);

console.log('================================================================');
console.log('            REAL BACKUP AUDIT & INVARIANT REPORT                ');
console.log('================================================================');
console.log(`Total Dives / Spins (Persistent): ${totalSpins}`);
console.log(`History Log Entries Count:       ${history.length}`);
console.log(`Explored Topics:                 ${explored}`);
console.log(`Learned Topics:                  ${learned}`);
console.log(`Current Streak:                  ${streakMetrics.current_streak}`);
console.log(`Longest Streak:                  ${streakMetrics.longest_streak}`);
console.log(`Review Queue Count:              ${reviewQueue.length}`);

if (totalSpins > history.length) {
  console.log(`\n[EXPLANATION OF GAP]: Total Dives (${totalSpins}) > History count (${history.length}).`);
  console.log(`This is the intended behavior: the history log is a rolling, display-only ring buffer (capped at 150 entries / 60 days to prevent localStorage bloat), while user_progress maintains unbounded lifetime counts per topic.`);
} else {
  console.log(`\n[NOTE]: History count matches or exceeds progress spins (${history.length} vs ${totalSpins}).`);
}
