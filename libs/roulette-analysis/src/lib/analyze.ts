import type { AnalysisReport, AnalyzeOptions, Session } from './types';
import { countsFromSpins } from './counts';
import { validateSession } from './validation';
import { wheelSectorBins } from './wheel';
import {
  pearsonChiSquareUniform,
  pocketStandardizedResiduals,
  sectorChiSquare,
} from './stats/chi-square';
import { permutationChiSquarePValue } from './stats/permutation';
import { benjaminiHochbergRejected } from './stats/fdr';
import { runsTestRedBlack } from './stats/runs';
import { transitionIndependenceTest } from './stats/transitions';
import { pocketUniformPValues } from './betting/pocket-p-values';
import { recommendTheoreticalBets } from './betting/recommend';

const REPORT_VERSION = 1 as const;

export function analyzeRouletteSession(
  session: Session,
  options: AnalyzeOptions = {},
): AnalysisReport {
  validateSession(session);
  const alphaSig = options.alpha ?? 0.05;
  const dirichletAlpha = options.dirichletAlpha ?? 1;
  const permSamples = options.permutationSamples ?? 2000;
  const rng = options.random ?? Math.random;

  const counts = countsFromSpins(session.spins);
  const chi = pearsonChiSquareUniform(counts);
  const n = chi?.sampleSize ?? 0;

  const permutationP =
    n > 0 ? permutationChiSquarePValue(counts, permSamples, rng) : 1;

  const pocketResiduals =
    chi && n > 0
      ? pocketStandardizedResiduals(counts, chi.expectedPerCell)
      : [];

  const pvals = pocketUniformPValues(n, counts);
  const rejected = benjaminiHochbergRejected(pvals, alphaSig);
  const fdrPockets: number[] = [];
  rejected.forEach((idx) => fdrPockets.push(idx));
  fdrPockets.sort((a, b) => a - b);

  const thirds = wheelSectorBins(3);
  const sectorResult = sectorChiSquare(counts, thirds);

  const runs = runsTestRedBlack(session.spins);
  const trans = transitionIndependenceTest(session.spins);

  const chiP = chi?.pValue ?? 1;
  const caveats: string[] = [
    'Results assume accurate recording; transcription errors mimic bias.',
    'Multiple simultaneous tests inflate false positives unless interpreted jointly.',
    'Sequential peeking without fixed sample size invalidates nominal p-values.',
  ];

  const theoreticalBetsMaxEv = recommendTheoreticalBets(counts, {
    ranking: 'maxEv',
    dirichletAlpha,
    chiSquarePValue: chiP,
    sampleSize: n,
  });
  const theoreticalBetsMaxWinProb = recommendTheoreticalBets(counts, {
    ranking: 'maxWinProb',
    dirichletAlpha,
    chiSquarePValue: chiP,
    sampleSize: n,
  });

  return {
    version: REPORT_VERSION,
    sessionId: session.id,
    dealerId: session.dealerId,
    sampleSize: n,
    pocketCounts: { ...counts },
    chiSquareUniform: chi
      ? {
          ...chi,
          permutationPValue: permutationP,
        }
      : null,
    pocketResiduals,
    fdrSignificantPockets: fdrPockets,
    sectorThirds: sectorResult,
    runsRedBlack: runs
      ? {
          ...runs,
          encoding: 'red=true,black=false,zero omitted',
          pValueTwoSided: runs.pValueTwoSided,
        }
      : null,
    transitionIndependence: trans
      ? {
          statistic: trans.statistic,
          degreesOfFreedom: trans.degreesOfFreedom,
          pValue: trans.pValue,
          contingency: trans.contingency,
        }
      : null,
    caveats,
    theoreticalBetsMaxEv,
    theoreticalBetsMaxWinProb,
  };
}
