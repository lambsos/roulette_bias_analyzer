import type { Session, Spin } from './types';
import { EUROPEAN_POCKET_COUNT } from './wheel';

export function assertValidPocket(pocket: number): void {
  if (!Number.isInteger(pocket) || pocket < 0 || pocket > 36) {
    throw new Error(`Invalid pocket ${pocket}; must be integer 0–36.`);
  }
}

export function validateSpin(spin: Spin): void {
  assertValidPocket(spin.pocket);
}

export function validateSession(session: Session): void {
  if (!session.id?.trim()) {
    throw new Error('Session id is required.');
  }
  for (const s of session.spins) {
    validateSpin(s);
  }
}

export function emptyPocketCounts(): Record<number, number> {
  const c: Record<number, number> = {};
  for (let p = 0; p < EUROPEAN_POCKET_COUNT; p++) {
    c[p] = 0;
  }
  return c;
}
