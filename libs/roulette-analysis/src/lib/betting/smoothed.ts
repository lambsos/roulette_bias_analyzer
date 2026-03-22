import { EUROPEAN_POCKET_COUNT } from '../wheel';

export function dirichletPosteriorMeans(
  counts: Readonly<Record<number, number>>,
  alpha: number,
): { probabilities: Record<number, number>; n: number } {
  if (alpha <= 0) {
    throw new Error('alpha must be positive.');
  }
  let n = 0;
  for (let p = 0; p < EUROPEAN_POCKET_COUNT; p++) {
    n += counts[p] ?? 0;
  }
  const denom = n + alpha * EUROPEAN_POCKET_COUNT;
  const probabilities: Record<number, number> = {};
  for (let p = 0; p < EUROPEAN_POCKET_COUNT; p++) {
    const c = counts[p] ?? 0;
    probabilities[p] = (c + alpha) / denom;
  }
  return { probabilities, n };
}
