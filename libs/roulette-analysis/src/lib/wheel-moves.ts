import { EUROPEAN_WHEEL_ORDER, pocketIndexOnWheel } from './wheel';

/**
 * Widths (in “move units”) used for the client-style group tables.
 * Each size defines how many consecutive integers on the move scale are grouped
 * into one sliding window (e.g. size 7 → ranges 1–7, 2–8, …). Larger sizes
 * mean wider bands on the move axis and fewer possible windows (they must fit
 * inside 1..maxShortestStep).
 */
export const GROUP_SIZES = [3, 5, 7, 9, 11, 14] as const;

/** One session row: the observed pocket and, when applicable, the wheel move from the prior spin. */
export interface WheelMoveRow {
  /** Winning number on the European wheel (0–36) for this spin. */
  readonly pocket: number;
  /**
   * Shortest wheel distance from the *previous* spin’s pocket to this pocket.
   * `null` on the first spin (no predecessor). `0` when the same pocket repeats.
   */
  readonly move: number | null;
}

/** A single sliding window on the move scale: inclusive integer range plus how often it was hit. */
export interface MoveGroupWindowBin {
  /** Human-readable range, e.g. "2-8". */
  readonly label: string;
  /** Inclusive lower bound of the window on the move scale. */
  readonly low: number;
  /** Inclusive upper bound of the window on the move scale. */
  readonly high: number;
  /** How many transitions had a move `m` with `low <= m <= high`. */
  readonly count: number;
}

/** All sliding windows for one group width, with hit counts. */
export interface MoveGroupTally {
  /** Window width on the move axis (same as one of `GROUP_SIZES`). */
  readonly groupSize: number;
  readonly bins: readonly MoveGroupWindowBin[];
}

/** Shortest cyclic distance in steps between two pockets on the European wheel. */
export function shortestWheelStepsBetween(
  prevPocket: number,
  nextPocket: number,
): number {
  const i = pocketIndexOnWheel(prevPocket);
  const j = pocketIndexOnWheel(nextPocket);
  const n = EUROPEAN_WHEEL_ORDER.length;
  const clockwise = (j - i + n) % n;
  const counterClockwise = (i - j + n) % n;
  return Math.min(clockwise, counterClockwise);
}

/**
 * Builds one row per spin in order. Spin 0 is the “anchor”: no move.
 * Each later row’s `move` is `shortestWheelStepsBetween` the previous pocket and this one.
 */
export function buildWheelMoveRows(
  spins: readonly { pocket: number }[],
): readonly WheelMoveRow[] {
  if (spins.length === 0) {
    return [];
  }
  const rows: WheelMoveRow[] = [];
  for (let k = 0; k < spins.length; k++) {
    const pocket = spins[k].pocket;
    if (k === 0) {
      rows.push({ pocket, move: null });
    } else {
      rows.push({
        pocket,
        move: shortestWheelStepsBetween(spins[k - 1].pocket, pocket),
      });
    }
  }
  return rows;
}

/** Largest possible shortest-path move on a single-zero wheel (18 for 37 pockets). */
function maxShortestStepOnWheel(): number {
  return Math.floor(EUROPEAN_WHEEL_ORDER.length / 2);
}

function formatRangeLabel(low: number, high: number): string {
  return `${low}-${high}`;
}

/**
 * Aggregates how often each sliding window “catches” a transition’s move size.
 *
 * @param transitionMoves — ordered move values from the session (from spin 2 onward),
 *   including `0` for repeats. Repeats are skipped for binning (windows live on 1..18).
 * @returns For each `groupSize`, every window `[low, high]` within 1..maxShortest with
 *   width `groupSize`, and `count` = number of moves `m` in [1..maxShortest] such that
 *   `low <= m <= high`. One spin can increment multiple bins if `m` lies in overlapping windows.
 */
export function tallyMoveGroupWindows(
  transitionMoves: readonly number[],
): readonly MoveGroupTally[] {
  const maxMove = maxShortestStepOnWheel();
  const tallies: MoveGroupTally[] = [];

  for (const groupSize of GROUP_SIZES) {
    const lastStart = maxMove - groupSize + 1;
    const counts: number[] = [];
    for (let start = 1; start <= lastStart; start++) {
      counts.push(0);
    }

    for (const m of transitionMoves) {
      if (m < 1 || m > maxMove) {
        continue;
      }
      for (let s = 0; s < counts.length; s++) {
        const start = s + 1;
        const high = start + groupSize - 1;
        if (m >= start && m <= high) {
          counts[s]++;
        }
      }
    }

    const bins: MoveGroupWindowBin[] = [];
    for (let s = 0; s < counts.length; s++) {
      const start = s + 1;
      const high = start + groupSize - 1;
      bins.push({
        label: formatRangeLabel(start, high),
        low: start,
        high,
        count: counts[s],
      });
    }

    tallies.push({ groupSize, bins });
  }

  return tallies;
}

/**
 * Extracts the move column from `buildWheelMoveRows` (drops the first row’s `null`).
 * Order matches time order; used as input to `tallyMoveGroupWindows`.
 */
export function transitionMovesFromRows(
  rows: readonly WheelMoveRow[],
): number[] {
  return rows
    .filter((r): r is WheelMoveRow & { move: number } => r.move !== null)
    .map((r) => r.move);
}
