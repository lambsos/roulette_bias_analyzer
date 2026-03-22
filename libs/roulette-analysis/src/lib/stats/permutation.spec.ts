import { describe, expect, it } from 'vitest';
import { permutationChiSquarePValue } from './permutation';
import { emptyPocketCounts } from '../validation';

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

describe('permutationChiSquarePValue', () => {
  it('is deterministic with seeded rng', () => {
    const c = emptyPocketCounts();
    c[0] = 5;
    c[1] = 15;
    for (let p = 2; p < 37; p++) {
      c[p] = 1;
    }
    const a = permutationChiSquarePValue(c, 500, makeRng(42));
    const b = permutationChiSquarePValue(c, 500, makeRng(42));
    expect(a).toBe(b);
  });

  it('returns 1 for empty table', () => {
    expect(
      permutationChiSquarePValue(emptyPocketCounts(), 100, makeRng(1)),
    ).toBe(1);
  });
});
