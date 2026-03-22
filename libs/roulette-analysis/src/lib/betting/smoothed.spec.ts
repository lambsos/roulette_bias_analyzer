import { describe, expect, it } from 'vitest';
import { dirichletPosteriorMeans } from './smoothed';
import { emptyPocketCounts } from '../validation';

describe('dirichletPosteriorMeans', () => {
  it('is uniform when no data and alpha=1', () => {
    const { probabilities, n } = dirichletPosteriorMeans(
      emptyPocketCounts(),
      1,
    );
    expect(n).toBe(0);
    for (let p = 0; p < 37; p++) {
      expect(probabilities[p]).toBeCloseTo(1 / 37, 6);
    }
  });

  it('concentrates on observed pocket with large counts', () => {
    const c = emptyPocketCounts();
    c[7] = 370;
    const { probabilities } = dirichletPosteriorMeans(c, 1);
    expect(probabilities[7]).toBeGreaterThan(0.5);
  });
});
