import { describe, expect, it } from 'vitest';
import {
  chiSquareFromBins,
  pearsonChiSquareUniform,
  sectorChiSquare,
} from './chi-square';
import { emptyPocketCounts } from '../validation';
import { wheelSectorBins } from '../wheel';

describe('pearsonChiSquareUniform', () => {
  it('returns null for empty counts', () => {
    expect(pearsonChiSquareUniform(emptyPocketCounts())).toBeNull();
  });

  it('is zero statistic for perfect uniform sample', () => {
    const c = emptyPocketCounts();
    for (let p = 0; p < 37; p++) {
      c[p] = 1;
    }
    const r = pearsonChiSquareUniform(c);
    expect(r).not.toBeNull();
    if (!r) {
      return;
    }
    expect(r.statistic).toBeCloseTo(0, 5);
    expect(r.sampleSize).toBe(37);
  });
});

describe('chiSquareFromBins', () => {
  it('matches hand calculation for 2 bins', () => {
    const obs = [10, 30];
    const exp = [20, 20];
    const r = chiSquareFromBins(obs, exp);
    expect(r.statistic).toBeCloseTo(10, 5);
    expect(r.df).toBe(1);
  });
});

describe('sectorChiSquare', () => {
  it('aggregates wheel thirds', () => {
    const c = emptyPocketCounts();
    c[0] = 100;
    const thirds = wheelSectorBins(3);
    const s = sectorChiSquare(c, thirds);
    expect(s).not.toBeNull();
    if (!s) {
      return;
    }
    expect(s.bins).toHaveLength(3);
  });
});
