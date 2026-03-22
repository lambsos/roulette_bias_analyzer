import { describe, expect, it } from 'vitest';
import { chiSquareSurvival, logGamma, upperRegularizedGamma } from './gamma';

describe('logGamma', () => {
  it('matches known values', () => {
    expect(logGamma(1)).toBeCloseTo(0, 10);
    expect(logGamma(2)).toBeCloseTo(0, 10);
    expect(logGamma(5)).toBeCloseTo(Math.log(24), 6);
  });
});

describe('chiSquareSurvival', () => {
  it('is about 0.05 at median for df=1', () => {
    const p = chiSquareSurvival(3.841, 1);
    expect(p).toBeGreaterThan(0.04);
    expect(p).toBeLessThan(0.06);
  });

  it('decreases with larger statistic', () => {
    expect(chiSquareSurvival(10, 5)).toBeLessThan(chiSquareSurvival(5, 5));
  });
});

describe('upperRegularizedGamma', () => {
  it('Q(a,0) is 1', () => {
    expect(upperRegularizedGamma(2, 0)).toBe(1);
  });
});
