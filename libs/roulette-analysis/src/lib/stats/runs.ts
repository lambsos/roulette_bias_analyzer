import type { Spin } from '../types';
import { isRed } from '../wheel';

/**
 * Wald–Wolfowitz runs test on red/black (0 treated as neither → filtered out).
 */
export function runsTestRedBlack(
  spins: readonly Spin[],
): { n: number; runs: number; pValueTwoSided: number } | null {
  const bits: boolean[] = [];
  for (const s of spins) {
    if (s.pocket === 0) {
      continue;
    }
    bits.push(isRed(s.pocket));
  }
  const n = bits.length;
  if (n < 2) {
    return null;
  }
  let runs = 1;
  for (let i = 1; i < n; i++) {
    if (bits[i] !== bits[i - 1]) {
      runs++;
    }
  }
  const n1 = bits.filter(Boolean).length;
  const n2 = n - n1;
  if (n1 === 0 || n2 === 0) {
    return null;
  }
  const mu = (2 * n1 * n2) / n + 1;
  const sigmaSq = (2 * n1 * n2 * (2 * n1 * n2 - n)) / (n * n * (n - 1));
  const sigma = Math.sqrt(sigmaSq);
  const z = (runs - mu) / sigma;
  const pTwo = 2 * (1 - normalCdf(Math.abs(z)));
  return { n, runs, pValueTwoSided: Math.min(1, pTwo) };
}

function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** Error function approximation (Abramowitz & Stegun). */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}
