import type { Spin } from '@contracting/roulette-analysis';

/**
 * Abstraction for non-manual spin ingestion. v1 is a stub; a future
 * `PlaywrightLiveDataSource` can poll or scrape a table and push `Spin` rows.
 */
export interface LiveSpinSource {
  readonly id: string;
  connect(): AsyncIterableIterator<Spin>;
}

/** Placeholder implementation — wire Playwright in the e2e or a Node worker later. */
export class PlaywrightLiveDataSourceStub implements LiveSpinSource {
  readonly id = 'playwright-stub';

  async *connect(): AsyncIterableIterator<Spin> {
    yield* [];
  }
}
