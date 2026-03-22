import { describe, expect, it } from 'vitest';
import {
  buildWheelMoveRows,
  GROUP_SIZES,
  shortestWheelStepsBetween,
  tallyMoveGroupWindows,
  transitionMovesFromRows,
} from './wheel-moves';

describe('shortestWheelStepsBetween', () => {
  it('matches video: 0 to 25 is 7 steps', () => {
    expect(shortestWheelStepsBetween(0, 25)).toBe(7);
  });

  it('matches video: 25 to 9 is 17 steps', () => {
    expect(shortestWheelStepsBetween(25, 9)).toBe(17);
  });

  it('is 0 for repeat pocket', () => {
    expect(shortestWheelStepsBetween(2, 2)).toBe(0);
  });
});

describe('buildWheelMoveRows', () => {
  it('first spin has null move', () => {
    expect(buildWheelMoveRows([{ pocket: 0 }])).toEqual([
      { pocket: 0, move: null },
    ]);
  });

  it('chains video example', () => {
    const rows = buildWheelMoveRows([
      { pocket: 0 },
      { pocket: 25 },
      { pocket: 9 },
    ]);
    expect(rows[1].move).toBe(7);
    expect(rows[2].move).toBe(17);
  });

  it('records repeat as move 0', () => {
    const rows = buildWheelMoveRows([{ pocket: 2 }, { pocket: 2 }]);
    expect(rows[1].move).toBe(0);
  });
});

describe('tallyMoveGroupWindows', () => {
  it('uses expected group sizes', () => {
    expect(GROUP_SIZES).toEqual([3, 5, 7, 9, 11, 14]);
  });

  it('increments every window that contains m for group 7', () => {
    const tallies = tallyMoveGroupWindows([7]);
    const g7 = tallies.find((t) => t.groupSize === 7);
    expect(g7).toBeDefined();
    const binFor1to7 = g7!.bins.find((b) => b.low === 1 && b.high === 7);
    const binFor7to13 = g7!.bins.find((b) => b.low === 7 && b.high === 13);
    expect(binFor1to7?.count).toBe(1);
    expect(binFor7to13?.count).toBe(1);
    const binFor2to8 = g7!.bins.find((b) => b.low === 2 && b.high === 8);
    expect(binFor2to8?.count).toBe(1);
  });

  it('ignores move 0 (repeat)', () => {
    const withRepeat = tallyMoveGroupWindows([0, 7]);
    const g7 = withRepeat.find((t) => t.groupSize === 7);
    const binFor1to7 = g7!.bins.find((b) => b.low === 1 && b.high === 7);
    expect(binFor1to7?.count).toBe(1);
  });
});

describe('transitionMovesFromRows', () => {
  it('collects moves in order', () => {
    const rows = buildWheelMoveRows([
      { pocket: 0 },
      { pocket: 25 },
      { pocket: 9 },
    ]);
    expect(transitionMovesFromRows(rows)).toEqual([7, 17]);
  });
});
