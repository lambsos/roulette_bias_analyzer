/** Physical order on a standard European single-zero wheel (one direction). */
export const EUROPEAN_WHEEL_ORDER: readonly number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;

const RED_POCKETS = new Set<number>([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export const EUROPEAN_POCKET_COUNT = 37;

export function pocketIndexOnWheel(pocket: number): number {
  const idx = EUROPEAN_WHEEL_ORDER.indexOf(pocket);
  if (idx < 0) {
    throw new Error(`Invalid pocket ${pocket}; expected 0–36.`);
  }
  return idx;
}

export function isRed(pocket: number): boolean {
  if (pocket === 0) {
    return false;
  }
  return RED_POCKETS.has(pocket);
}

export function isBlack(pocket: number): boolean {
  if (pocket === 0) {
    return false;
  }
  return !RED_POCKETS.has(pocket);
}

export function isOdd(pocket: number): boolean {
  if (pocket === 0) {
    return false;
  }
  return pocket % 2 === 1;
}

export function isEven(pocket: number): boolean {
  if (pocket === 0) {
    return false;
  }
  return pocket % 2 === 0;
}

export function isHigh(pocket: number): boolean {
  if (pocket === 0) {
    return false;
  }
  return pocket >= 19;
}

export function isLow(pocket: number): boolean {
  if (pocket === 0) {
    return false;
  }
  return pocket <= 18;
}

export function dozenForPocket(pocket: number): 1 | 2 | 3 | null {
  if (pocket === 0) {
    return null;
  }
  if (pocket <= 12) {
    return 1;
  }
  if (pocket <= 24) {
    return 2;
  }
  return 3;
}

export function columnForPocket(pocket: number): 1 | 2 | 3 | null {
  if (pocket === 0) {
    return null;
  }
  const m = pocket % 3;
  if (m === 1) {
    return 1;
  }
  if (m === 2) {
    return 2;
  }
  return 3;
}

/**
 * Contiguous arc in wheel order, length `arcLength` pockets starting at `startPocket` (inclusive along wheel).
 */
export function wheelArcPockets(
  startPocket: number,
  arcLength: number,
): readonly number[] {
  if (arcLength < 1 || arcLength > EUROPEAN_WHEEL_ORDER.length) {
    throw new Error('arcLength must be between 1 and 37.');
  }
  const start = pocketIndexOnWheel(startPocket);
  const out: number[] = [];
  for (let i = 0; i < arcLength; i++) {
    out.push(EUROPEAN_WHEEL_ORDER[(start + i) % EUROPEAN_WHEEL_ORDER.length]);
  }
  return out;
}

/** Split wheel into `binCount` contiguous sectors of (nearly) equal size. */
export function wheelSectorBins(
  binCount: number,
): readonly { readonly label: string; readonly pockets: readonly number[] }[] {
  if (binCount < 2 || binCount > 18) {
    throw new Error(
      'binCount should be between 2 and 18 for sensible sectors.',
    );
  }
  const n = EUROPEAN_WHEEL_ORDER.length;
  const base = Math.floor(n / binCount);
  const remainder = n % binCount;
  const bins: { label: string; pockets: number[] }[] = [];
  let cursor = 0;
  for (let b = 0; b < binCount; b++) {
    const len = base + (b < remainder ? 1 : 0);
    const pockets: number[] = [];
    for (let i = 0; i < len; i++) {
      pockets.push(EUROPEAN_WHEEL_ORDER[cursor % n]);
      cursor++;
    }
    bins.push({ label: `sector_${b + 1}`, pockets });
  }
  return bins;
}
