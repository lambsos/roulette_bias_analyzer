import type {
  ChiSquareUniformResult,
  PocketResidual,
  SectorBinResult,
  SectorChiSquareResult,
} from '../types';
import { EUROPEAN_POCKET_COUNT } from '../wheel';
import { chiSquareSurvival } from './gamma';

export function pearsonChiSquareUniform(
  counts: Readonly<Record<number, number>>,
): ChiSquareUniformResult | null {
  const cells = EUROPEAN_POCKET_COUNT;
  let n = 0;
  for (let p = 0; p < cells; p++) {
    n += counts[p] ?? 0;
  }
  if (n === 0) {
    return null;
  }
  const expected = n / cells;
  let stat = 0;
  for (let p = 0; p < cells; p++) {
    const o = counts[p] ?? 0;
    const diff = o - expected;
    stat += (diff * diff) / expected;
  }
  const df = cells - 1;
  const pValue = chiSquareSurvival(stat, df);
  return {
    statistic: stat,
    degreesOfFreedom: df,
    pValue,
    sampleSize: n,
    expectedPerCell: expected,
  };
}

export function pocketStandardizedResiduals(
  counts: Readonly<Record<number, number>>,
  expectedPerCell: number,
): PocketResidual[] {
  const out: PocketResidual[] = [];
  for (let p = 0; p < EUROPEAN_POCKET_COUNT; p++) {
    const o = counts[p] ?? 0;
    const e = expectedPerCell;
    const std = e > 0 ? (o - e) / Math.sqrt(e) : 0;
    out.push({
      pocket: p,
      observed: o,
      expected: e,
      standardizedResidual: std,
    });
  }
  return out;
}

export function chiSquareFromBins(
  observed: readonly number[],
  expected: readonly number[],
): {
  statistic: number;
  df: number;
  pValue: number;
} {
  if (observed.length !== expected.length || observed.length < 2) {
    throw new Error('Bins length mismatch or too few bins.');
  }
  let stat = 0;
  for (let i = 0; i < observed.length; i++) {
    const e = expected[i];
    if (e <= 0) {
      throw new Error('Expected counts must be positive.');
    }
    const o = observed[i];
    const d = o - e;
    stat += (d * d) / e;
  }
  const df = observed.length - 1;
  return { statistic: stat, df, pValue: chiSquareSurvival(stat, df) };
}

export function sectorChiSquare(
  counts: Readonly<Record<number, number>>,
  bins: readonly {
    readonly label: string;
    readonly pockets: readonly number[];
  }[],
): SectorChiSquareResult | null {
  let n = 0;
  for (let p = 0; p < EUROPEAN_POCKET_COUNT; p++) {
    n += counts[p] ?? 0;
  }
  if (n === 0) {
    return null;
  }
  const binResults: SectorBinResult[] = [];
  const obs: number[] = [];
  const exp: number[] = [];
  for (const bin of bins) {
    let o = 0;
    for (const pocket of bin.pockets) {
      o += counts[pocket] ?? 0;
    }
    const e = (n * bin.pockets.length) / EUROPEAN_POCKET_COUNT;
    binResults.push({
      label: bin.label,
      pockets: bin.pockets,
      observed: o,
      expected: e,
    });
    obs.push(o);
    exp.push(e);
  }
  const { statistic, df, pValue } = chiSquareFromBins(obs, exp);
  return { statistic, degreesOfFreedom: df, pValue, bins: binResults };
}
