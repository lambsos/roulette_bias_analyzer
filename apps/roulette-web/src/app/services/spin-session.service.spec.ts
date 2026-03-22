import { TestBed } from '@angular/core/testing';
import { SpinSessionService } from './spin-session.service';

describe('SpinSessionService', () => {
  let service: SpinSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpinSessionService);
  });

  it('adds spins and exposes report when data exists', () => {
    expect(service.report()).toBeNull();
    service.addSpin(5);
    service.addSpin(5);
    expect(service.spins().length).toBe(2);
    expect(service.report()).not.toBeNull();
    expect(service.report()?.sampleSize).toBe(2);
  });

  it('clears spins', () => {
    service.addSpin(1);
    service.clearSpins();
    expect(service.spins().length).toBe(0);
    expect(service.report()).toBeNull();
  });
});
