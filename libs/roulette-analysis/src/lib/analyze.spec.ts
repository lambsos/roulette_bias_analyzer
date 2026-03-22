import { describe, expect, it } from 'vitest';
import { analyzeRouletteSession } from './analyze';

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

describe('analyzeRouletteSession', () => {
  it('produces versioned report', () => {
    const report = analyzeRouletteSession({
      id: 's1',
      spins: [{ pocket: 1 }, { pocket: 2 }, { pocket: 3 }],
    });
    expect(report.version).toBe(1);
    expect(report.sampleSize).toBe(3);
    expect(report.theoreticalBetsMaxEv.length).toBeGreaterThan(0);
  });

  it('includes permutation p-value when rng provided', () => {
    const spins = Array.from({ length: 40 }, () => ({ pocket: 5 }));
    const report = analyzeRouletteSession(
      { id: 's2', spins },
      { permutationSamples: 100, random: makeRng(99) },
    );
    expect(report.chiSquareUniform?.permutationPValue).toBeDefined();
  });

  it('throws on invalid session', () => {
    expect(() => analyzeRouletteSession({ id: '', spins: [] })).toThrow();
  });
});
