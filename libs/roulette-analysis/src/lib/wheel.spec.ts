import { describe, expect, it } from 'vitest';
import {
  EUROPEAN_WHEEL_ORDER,
  columnForPocket,
  dozenForPocket,
  isRed,
  pocketIndexOnWheel,
  wheelArcPockets,
  wheelSectorBins,
} from './wheel';

describe('EUROPEAN_WHEEL_ORDER', () => {
  it('has 37 unique pockets', () => {
    expect(EUROPEAN_WHEEL_ORDER).toHaveLength(37);
    expect(new Set(EUROPEAN_WHEEL_ORDER).size).toBe(37);
  });
});

describe('pocketIndexOnWheel', () => {
  it('finds 0 at index 0', () => {
    expect(pocketIndexOnWheel(0)).toBe(0);
  });

  it('throws on invalid pocket', () => {
    expect(() => pocketIndexOnWheel(40)).toThrow();
  });
});

describe('wheelArcPockets', () => {
  it('wraps around the wheel', () => {
    const arc = wheelArcPockets(26, 3);
    expect(arc).toEqual([26, 0, 32]);
  });
});

describe('wheelSectorBins', () => {
  it('covers all pockets once for 3 bins', () => {
    const bins = wheelSectorBins(3);
    const all = bins.flatMap((b) => b.pockets);
    expect(all).toHaveLength(37);
    expect(new Set(all).size).toBe(37);
  });
});

describe('dozen and column', () => {
  it('maps 1 to dozen 1 column 1', () => {
    expect(dozenForPocket(1)).toBe(1);
    expect(columnForPocket(1)).toBe(1);
  });

  it('maps 0 to null', () => {
    expect(dozenForPocket(0)).toBeNull();
    expect(columnForPocket(0)).toBeNull();
  });
});

describe('isRed', () => {
  it('marks 1 red and 2 black', () => {
    expect(isRed(1)).toBe(true);
    expect(isRed(2)).toBe(false);
    expect(isRed(0)).toBe(false);
  });
});
