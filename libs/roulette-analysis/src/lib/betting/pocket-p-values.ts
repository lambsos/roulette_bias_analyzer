import { EUROPEAN_POCKET_COUNT } from '../wheel';

/** Two-sided binomial tail p-value vs p0 = 1/37 using normal approximation with continuity correction. */
export function pocketUniformPValues(
  n: number,
  counts: Readonly<Record<number, number>>,
): number[] {
  const p0 = 1 / EUROPEAN_POCKET_COUNT;
  const pvals: number[] = [];
  if (n === 0) {
    return Array(EUROPEAN_POCKET_COUNT).fill(1);
  }
  const varBin = n * p0 * (1 - p0);
  const sd = Math.sqrt(varBin);
  for (let pocket = 0; pocket < EUROPEAN_POCKET_COUNT; pocket++) {
    const o = counts[pocket] ?? 0;
    const e = n * p0;
    const z = sd > 0 ? (Math.abs(o - e) - 0.5) / sd : 0;
    pvals.push(2 * (1 - normalCdf(Math.max(0, z))));
  }
  return pvals;
}

function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

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
