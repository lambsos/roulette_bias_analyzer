import type { Spin } from '../types';
import { EUROPEAN_POCKET_COUNT } from '../wheel';
import { chiSquareSurvival } from './gamma';

export interface TransitionMatrixResult {
  readonly statistic: number;
  readonly degreesOfFreedom: number;
  readonly pValue: number;
  readonly contingency: readonly (readonly number[])[];
  readonly activePockets: readonly number[];
}

/**
 * Chi-square test of independence for first-order transitions (prev pocket → next pocket).
 * Uses only pockets that appear as previous state with positive count.
 */
export function transitionIndependenceTest(
  spins: readonly Spin[],
): TransitionMatrixResult | null {
  if (spins.length < 3) {
    return null;
  }
  const size = EUROPEAN_POCKET_COUNT;
  const table: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(0),
  );
  for (let i = 0; i < spins.length - 1; i++) {
    const a = spins[i].pocket;
    const b = spins[i + 1].pocket;
    table[a][b]++;
  }
  const rowSum = table.map((row) => row.reduce((s, v) => s + v, 0));
  const colSum = Array(size).fill(0) as number[];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      colSum[j] += table[i][j];
    }
  }
  const total = rowSum.reduce((s, v) => s + v, 0);
  if (total < 5) {
    return null;
  }
  const activeRows: number[] = [];
  for (let i = 0; i < size; i++) {
    if (rowSum[i] > 0) {
      activeRows.push(i);
    }
  }
  const activeCols: number[] = [];
  for (let j = 0; j < size; j++) {
    if (colSum[j] > 0) {
      activeCols.push(j);
    }
  }
  if (activeRows.length < 2 || activeCols.length < 2) {
    return null;
  }
  let stat = 0;
  const sub: number[][] = [];
  for (const i of activeRows) {
    const row: number[] = [];
    for (const j of activeCols) {
      const o = table[i][j];
      const e = (rowSum[i] * colSum[j]) / total;
      if (e > 0) {
        const d = o - e;
        stat += (d * d) / e;
      }
      row.push(o);
    }
    sub.push(row);
  }
  const df = (activeRows.length - 1) * (activeCols.length - 1);
  if (df <= 0) {
    return null;
  }
  const pValue = chiSquareSurvival(stat, df);
  const activePockets = [...new Set([...activeRows, ...activeCols])].sort(
    (a, b) => a - b,
  );
  return {
    statistic: stat,
    degreesOfFreedom: df,
    pValue,
    contingency: sub,
    activePockets,
  };
}
