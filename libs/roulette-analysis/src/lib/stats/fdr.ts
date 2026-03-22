/**
 * Benjamini–Hochberg FDR control at level q.
 * Returns indices of rejected hypotheses (0-based into `pValues`).
 */
export function benjaminiHochbergRejected(
  pValues: readonly number[],
  q: number,
): Set<number> {
  if (q <= 0 || q >= 1) {
    throw new Error('q must be in (0,1).');
  }
  const m = pValues.length;
  const order = pValues.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  let k = 0;
  for (let rank = m; rank >= 1; rank--) {
    if (order[rank - 1].p <= (q * rank) / m) {
      k = rank;
      break;
    }
  }
  const rejected = new Set<number>();
  if (k === 0) {
    return rejected;
  }
  for (let j = 0; j < k; j++) {
    rejected.add(order[j].i);
  }
  return rejected;
}
