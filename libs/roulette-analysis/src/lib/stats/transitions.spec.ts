import { describe, expect, it } from 'vitest';
import { transitionIndependenceTest } from './transitions';

describe('transitionIndependenceTest', () => {
  it('returns null for short sequences', () => {
    expect(
      transitionIndependenceTest([{ pocket: 1 }, { pocket: 2 }]),
    ).toBeNull();
  });

  it('runs on repeated independent-like sequence', () => {
    const spins = Array.from({ length: 200 }, (_, i) => ({ pocket: i % 37 }));
    const r = transitionIndependenceTest(spins);
    expect(r).not.toBeNull();
    if (!r) {
      return;
    }
    expect(r.degreesOfFreedom).toBeGreaterThan(0);
  });
});
