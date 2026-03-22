import { describe, expect, it } from 'vitest';
import { recommendTheoreticalBets } from './recommend';
import { emptyPocketCounts } from '../validation';

describe('recommendTheoreticalBets', () => {
  it('ranks straight 7 highest EV when mass on 7', () => {
    const c = emptyPocketCounts();
    c[7] = 100;
    const top = recommendTheoreticalBets(c, { ranking: 'maxEv' });
    expect(top[0].betKind).toBe('straight');
    expect(top[0].selection).toContain('7');
    expect(top[0].theoreticalEvPerUnit).toBeGreaterThan(0);
  });

  it('maxWinProb prefers red when all red pockets are overweighted', () => {
    const c = emptyPocketCounts();
    const redPockets = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    for (const p of redPockets) {
      c[p] = 50;
    }
    for (let p = 0; p < 37; p++) {
      if (!redPockets.includes(p)) {
        c[p] = 1;
      }
    }
    const top = recommendTheoreticalBets(c, { ranking: 'maxWinProb' });
    expect(top[0].betKind).toBe('red');
  });

  it('sort order is stable with tie-breaker on label', () => {
    const c = emptyPocketCounts();
    const a = recommendTheoreticalBets(c, { ranking: 'maxEv' });
    const b = recommendTheoreticalBets(c, { ranking: 'maxEv' });
    expect(a.map((x) => x.selection)).toEqual(b.map((x) => x.selection));
  });
});
