import { describe, expect, it } from 'vitest';
import { runsTestRedBlack } from './runs';

describe('runsTestRedBlack', () => {
  it('returns null when only zeros', () => {
    expect(runsTestRedBlack([{ pocket: 0 }, { pocket: 0 }])).toBeNull();
  });

  it('returns null when only one color is present', () => {
    const spins = [1, 3, 12, 16].map((pocket) => ({ pocket }));
    expect(runsTestRedBlack(spins)).toBeNull();
  });

  it('counts two runs for a red block then a black block', () => {
    const reds = [1, 3, 12].map((pocket) => ({ pocket }));
    const blacks = [2, 4, 6].map((pocket) => ({ pocket }));
    const r = runsTestRedBlack([...reds, ...blacks]);
    expect(r).not.toBeNull();
    if (!r) {
      return;
    }
    expect(r.runs).toBe(2);
  });

  it('counts alternating runs', () => {
    const spins = [1, 2, 1, 2, 1, 2].map((pocket) => ({ pocket }));
    const r = runsTestRedBlack(spins);
    expect(r).not.toBeNull();
    if (!r) {
      return;
    }
    expect(r.runs).toBe(6);
  });
});
