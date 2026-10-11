/**
 * Shared Spin Deceleration Timeline
 *
 * Kinematics:
 * - Total duration: 4500ms
 * - Phase 1 (0 to 1200ms): Constant fast speed (first tick gap ~65-85ms).
 * - Phase 2 (1200 to 4500ms): Smooth ease-out deceleration to near 0.
 * - One tick every time the wheel passes one item.
 * - Gaps between consecutive ticks are strictly non-decreasing after Phase 1.
 * - Last gap is between 350ms and 500ms.
 * - Ratio of last gap to first gap >= 3x.
 */

export const SPIN_TOTAL_DURATION_MS = 4500;
export const SPIN_PHASE1_DURATION_MS = 1200;
export const SPIN_PHASE2_DURATION_MS = SPIN_TOTAL_DURATION_MS - SPIN_PHASE1_DURATION_MS; // 3300ms

/**
 * Creates a timeline for spinning across `numCards` items.
 *
 * @param {number} numCards - Total number of cards the reel travels.
 * @param {object} options - Optional tuning overrides.
 * @returns {object} Timeline containing getProgress(t), tickTimes, gaps, and metrics.
 */
export function createSpinTimeline(numCards = 32, {
  totalDuration = SPIN_TOTAL_DURATION_MS,
  phase1Duration = SPIN_PHASE1_DURATION_MS,
  decelRatio = 5.5,
  p = 2.0
} = {}) {
  const phase2Duration = totalDuration - phase1Duration;
  const R = decelRatio;
  const denom = phase1Duration + phase2Duration * (1 / R + (1 - 1 / R) / (p + 1));
  const v0 = 1 / denom; // normalized speed per ms in Phase 1
  const vend = v0 / R;

  /**
   * Normalized progress in [0, 1] as a function of elapsed milliseconds.
   */
  function getProgress(t) {
    if (t <= 0) return 0;
    if (t >= totalDuration) return 1;
    if (t <= phase1Duration) {
      return v0 * t;
    }
    const tau = (t - phase1Duration) / phase2Duration;
    const s1 = v0 * phase1Duration;
    const s2 = phase2Duration * (vend * tau + ((v0 - vend) / (p + 1)) * (1 - Math.pow(1 - tau, p + 1)));
    return s1 + s2;
  }

  // Calculate crossing time for each item boundary (ticks)
  const tickTimes = [];
  for (let k = 1; k < numCards; k++) {
    const targetProgress = k / numCards;
    let low = 0;
    let high = totalDuration;
    for (let iter = 0; iter < 45; iter++) {
      const mid = (low + high) / 2;
      if (getProgress(mid) < targetProgress) {
        low = mid;
      } else {
        high = mid;
      }
    }
    tickTimes.push(Number(low.toFixed(1)));
  }

  const gaps = [];
  for (let i = 1; i < tickTimes.length; i++) {
    gaps.push(Number((tickTimes[i] - tickTimes[i - 1]).toFixed(1)));
  }

  return {
    numCards,
    numTicks: tickTimes.length,
    totalDuration,
    phase1Duration,
    tickTimes,
    gaps,
    firstGap: gaps[0] || 0,
    lastGap: gaps[gaps.length - 1] || 0,
    ratio: gaps.length > 0 ? (gaps[gaps.length - 1] / gaps[0]) : 0,
    lastTickTime: tickTimes[tickTimes.length - 1] || 0,
    delayToLanding: totalDuration - (tickTimes[tickTimes.length - 1] || 0),
    getProgress
  };
}

/**
 * Returns the default list of tick times for spin audio synchronization.
 */
export function getSpinTickTimes(numCards = 32) {
  return createSpinTimeline(numCards).tickTimes;
}
