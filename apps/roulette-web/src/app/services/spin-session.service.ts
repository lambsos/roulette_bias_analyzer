import { computed, Injectable, signal } from '@angular/core';
import {
  analyzeRouletteSession,
  type AnalysisReport,
  type Session,
  type Spin,
  validateSession,
} from '@contracting/roulette-analysis';

@Injectable({ providedIn: 'root' })
export class SpinSessionService {
  readonly sessionId = signal('session-1');
  readonly dealerId = signal('');
  readonly spins = signal<Spin[]>([]);

  readonly session = computed<Session>(() => ({
    id: this.sessionId().trim() || 'session-1',
    dealerId: this.dealerId().trim() || undefined,
    spins: this.spins(),
  }));

  readonly report = computed<AnalysisReport | null>(() => {
    const s = this.session();
    try {
      if (s.spins.length === 0) {
        return null;
      }
      validateSession(s);
      return analyzeRouletteSession(s, { permutationSamples: 1500 });
    } catch {
      return null;
    }
  });

  addSpin(pocket: number): void {
    this.spins.update((list) => [...list, { pocket }]);
  }

  undoLast(): void {
    this.spins.update((list) => list.slice(0, -1));
  }

  clearSpins(): void {
    this.spins.set([]);
  }

  loadSession(json: Session): void {
    validateSession(json);
    this.sessionId.set(json.id);
    this.dealerId.set(json.dealerId ?? '');
    this.spins.set([...json.spins]);
  }

  exportJson(): string {
    return JSON.stringify(this.session(), null, 2);
  }
}
