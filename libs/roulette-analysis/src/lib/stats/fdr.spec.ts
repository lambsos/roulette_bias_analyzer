import { describe, expect, it } from 'vitest';
import { benjaminiHochbergRejected } from './fdr';

describe('benjaminiHochbergRejected', () => {
  it('rejects none when all p-values are 1', () => {
    const p = Array(10).fill(1);
    expect(benjaminiHochbergRejected(p, 0.05).size).toBe(0);
  });

  it('rejects all for very small p-values', () => {
    const p = [0.001, 0.001, 0.001];
    const r = benjaminiHochbergRejected(p, 0.05);
    expect(r.size).toBe(3);
  });

  it('matches classic BH step-up example', () => {
    const p = [0.01, 0.03, 0.06];
    const r = benjaminiHochbergRejected(p, 0.05);
    expect(r.has(0)).toBe(true);
    expect(r.has(1)).toBe(true);
    expect(r.has(2)).toBe(false);
  });
});
