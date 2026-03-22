/** Single observed spin (European 0–36). */
export interface Spin {
  readonly pocket: number;
  readonly timestamp?: string;
}

export interface Session {
  readonly id: string;
  readonly dealerId?: string;
  readonly spins: readonly Spin[];
}

export type BetRankingMode = 'maxEv' | 'maxWinProb';

export interface AnalyzeOptions {
  /** Alpha for significance notes (default 0.05). */
  readonly alpha?: number;
  /** Prior concentration per pocket for Dirichlet smoothing (default 1 = Laplace). */
  readonly dirichletAlpha?: number;
  /** Monte Carlo draws for permutation p-value (default 2000). */
  readonly permutationSamples?: number;
  /** RNG for permutation tests (deterministic in unit tests). */
  readonly random?: () => number;
}

export interface ChiSquareUniformResult {
  readonly statistic: number;
  readonly degreesOfFreedom: number;
  /** Asymptotic chi-square upper tail p-value. */
  readonly pValue: number;
  /** Monte Carlo permutation p-value when computed. */
  readonly permutationPValue?: number;
  readonly sampleSize: number;
  readonly expectedPerCell: number;
}

export interface PocketResidual {
  readonly pocket: number;
  readonly observed: number;
  readonly expected: number;
  readonly standardizedResidual: number;
}

export interface SectorBinResult {
  readonly label: string;
  readonly pockets: readonly number[];
  readonly observed: number;
  readonly expected: number;
}

export interface SectorChiSquareResult {
  readonly statistic: number;
  readonly degreesOfFreedom: number;
  readonly pValue: number;
  readonly bins: readonly SectorBinResult[];
}

export interface RunsTestResult {
  readonly n: number;
  readonly runs: number;
  readonly pValueTwoSided: number;
  readonly encoding: string;
}

export interface TransitionIndependenceResult {
  readonly statistic: number;
  readonly degreesOfFreedom: number;
  readonly pValue: number;
  readonly contingency: readonly (readonly number[])[];
}

export interface BetSuggestion {
  readonly betKind:
    | 'straight'
    | 'red'
    | 'black'
    | 'odd'
    | 'even'
    | 'high'
    | 'low'
    | 'dozen1'
    | 'dozen2'
    | 'dozen3'
    | 'column1'
    | 'column2'
    | 'column3';
  readonly selection: string;
  readonly modelWinProbability: number;
  readonly theoreticalEvPerUnit: number;
  readonly confidenceNotes: readonly string[];
  readonly rankScore: number;
}

export interface AnalysisReport {
  readonly version: 1;
  readonly sessionId: string;
  readonly dealerId?: string;
  readonly sampleSize: number;
  readonly pocketCounts: Readonly<Record<number, number>>;
  readonly chiSquareUniform: ChiSquareUniformResult | null;
  readonly pocketResiduals: readonly PocketResidual[];
  readonly fdrSignificantPockets: readonly number[];
  readonly sectorThirds: SectorChiSquareResult | null;
  readonly runsRedBlack: RunsTestResult | null;
  readonly transitionIndependence: TransitionIndependenceResult | null;
  readonly caveats: readonly string[];
  readonly theoreticalBetsMaxEv: readonly BetSuggestion[];
  readonly theoreticalBetsMaxWinProb: readonly BetSuggestion[];
}

export interface RecommendBetsOptions {
  readonly ranking: BetRankingMode;
  readonly dirichletAlpha?: number;
  readonly chiSquarePValue?: number;
  readonly sampleSize?: number;
}
