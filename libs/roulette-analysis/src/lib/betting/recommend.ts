import type { BetSuggestion, RecommendBetsOptions } from '../types';
import {
  columnForPocket,
  dozenForPocket,
  isBlack,
  isEven,
  isHigh,
  isLow,
  isOdd,
  isRed,
  EUROPEAN_POCKET_COUNT,
} from '../wheel';
import { dirichletPosteriorMeans } from './smoothed';

type BetKind = BetSuggestion['betKind'];

interface InternalBet {
  kind: BetKind;
  label: string;
  winProb: number;
  ev: number;
}

function sumProb(
  probs: Readonly<Record<number, number>>,
  predicate: (pocket: number) => boolean,
): number {
  let s = 0;
  for (let pocket = 0; pocket < EUROPEAN_POCKET_COUNT; pocket++) {
    if (predicate(pocket)) {
      s += probs[pocket] ?? 0;
    }
  }
  return s;
}

function buildAllBets(probs: Readonly<Record<number, number>>): InternalBet[] {
  const out: InternalBet[] = [];
  for (let pocket = 0; pocket < EUROPEAN_POCKET_COUNT; pocket++) {
    const p = probs[pocket] ?? 0;
    out.push({
      kind: 'straight',
      label: `Straight ${pocket}`,
      winProb: p,
      ev: 36 * p - 1,
    });
  }
  const pRed = sumProb(probs, (x) => isRed(x));
  const pBlack = sumProb(probs, (x) => isBlack(x));
  const pOdd = sumProb(probs, (x) => isOdd(x));
  const pEven = sumProb(probs, (x) => isEven(x));
  const pHigh = sumProb(probs, (x) => isHigh(x));
  const pLow = sumProb(probs, (x) => isLow(x));
  out.push(
    { kind: 'red', label: 'Red', winProb: pRed, ev: 2 * pRed - 1 },
    { kind: 'black', label: 'Black', winProb: pBlack, ev: 2 * pBlack - 1 },
    { kind: 'odd', label: 'Odd', winProb: pOdd, ev: 2 * pOdd - 1 },
    { kind: 'even', label: 'Even', winProb: pEven, ev: 2 * pEven - 1 },
    { kind: 'high', label: 'High (19–36)', winProb: pHigh, ev: 2 * pHigh - 1 },
    { kind: 'low', label: 'Low (1–18)', winProb: pLow, ev: 2 * pLow - 1 },
  );
  for (const d of [1, 2, 3] as const) {
    const pd = sumProb(probs, (x) => dozenForPocket(x) === d);
    out.push({
      kind: `dozen${d}` as BetKind,
      label: `Dozen ${d}`,
      winProb: pd,
      ev: 3 * pd - 1,
    });
  }
  for (const c of [1, 2, 3] as const) {
    const pc = sumProb(probs, (x) => columnForPocket(x) === c);
    out.push({
      kind: `column${c}` as BetKind,
      label: `Column ${c}`,
      winProb: pc,
      ev: 3 * pc - 1,
    });
  }
  return out;
}

function confidenceNotes(opts: {
  readonly n: number;
  readonly chiSquarePValue?: number;
  readonly modeledEv: number;
}): string[] {
  const notes: string[] = [
    'Illustrative model only; not betting advice. A fair wheel has no exploitable edge.',
  ];
  if (opts.n < 50) {
    notes.push('Low sample size; estimates are unstable.');
  }
  if (opts.chiSquarePValue !== undefined && opts.chiSquarePValue > 0.05) {
    notes.push(
      'Uniformity test not significant at 5%; deviations may be noise.',
    );
  }
  if (opts.modeledEv > 0) {
    notes.push(
      'Positive theoretical EV under smoothed model; many comparisons inflate false positives.',
    );
  }
  return notes;
}

export function recommendTheoreticalBets(
  counts: Readonly<Record<number, number>>,
  options: RecommendBetsOptions,
): BetSuggestion[] {
  const alpha = options.dirichletAlpha ?? 1;
  const { probabilities, n } = dirichletPosteriorMeans(counts, alpha);
  const bets = buildAllBets(probabilities);
  const ranking = options.ranking ?? 'maxEv';
  const score = (b: InternalBet) => (ranking === 'maxEv' ? b.ev : b.winProb);

  const sorted = [...bets].sort((a, b) => {
    const ds = score(b) - score(a);
    if (ds !== 0) {
      return ds;
    }
    return a.label.localeCompare(b.label);
  });

  const top = sorted.slice(0, 12);
  return top.map((b) => ({
    betKind: b.kind,
    selection: b.label,
    modelWinProbability: b.winProb,
    theoreticalEvPerUnit: b.ev,
    confidenceNotes: confidenceNotes({
      n,
      chiSquarePValue: options.chiSquarePValue,
      modeledEv: b.ev,
    }),
    rankScore: score(b),
  }));
}
