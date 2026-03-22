import type { Spin } from './types';
import { emptyPocketCounts, validateSpin } from './validation';

export function countsFromSpins(
  spins: readonly Spin[],
): Record<number, number> {
  const counts = emptyPocketCounts();
  for (const s of spins) {
    validateSpin(s);
    counts[s.pocket]++;
  }
  return counts;
}
