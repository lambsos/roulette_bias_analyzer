import { describe, expect, it } from 'vitest';
import { assertValidPocket, validateSession } from './validation';

describe('validation', () => {
  it('rejects bad pockets', () => {
    expect(() => assertValidPocket(-1)).toThrow();
    expect(() => assertValidPocket(37)).toThrow();
  });

  it('requires session id', () => {
    expect(() => validateSession({ id: '   ', spins: [] })).toThrow();
  });
});
