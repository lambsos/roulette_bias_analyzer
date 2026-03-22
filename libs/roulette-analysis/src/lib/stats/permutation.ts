import { EUROPEAN_POCKET_COUNT } from '../wheel';
import { pearsonChiSquareUniform } from './chi-square';
import type { ChiSquareUniformResult } from '../types';

function defaultRandom(): number {
  return Math.random();
}

/**
 * Monte Carlo p-value for Pearson chi-square vs uniform multinomial:
 * proportion of simulated statistics >= observed under uniform sampling.
 */
export function permutationChiSquarePValue(
  observedCounts: Readonly<Record<number, number>>,
  samples: number,
  random: () => number = defaultRandom,
): number {
  const base = pearsonChiSquareUniform(observedCounts);
  if (!base) {
    return 1;
  }
  const n = base.sampleSize;
  const observedStat = base.statistic;
  let extreme = 0;
  for (let s = 0; s < samples; s++) {
    const sim = simulateCounts(n, random);
    const res = pearsonChiSquareUniform(sim) as ChiSquareUniformResult;
    if (res.statistic >= observedStat) {
      extreme++;
    }
  }
  return (extreme + 1) / (samples + 1);
}

function simulateCounts(
  n: number,
  random: () => number,
): Record<number, number> {
  const c: Record<number, number> = {};
  for (let p = 0; p < EUROPEAN_POCKET_COUNT; p++) {
    c[p] = 0;
  }
  for (let i = 0; i < n; i++) {
    const u = random();
    const pocket = Math.min(
      EUROPEAN_POCKET_COUNT - 1,
      Math.floor(u * EUROPEAN_POCKET_COUNT),
    );
    c[pocket]++;
  }
  return c;
}
