import type { FailedAttemptCounter } from '../interfaces/index.js';

export class InMemoryFailedAttemptCounter implements FailedAttemptCounter {
  readonly counts = new Map<string, number>();

  async increment(ip: string): Promise<number> {
    const next = (this.counts.get(ip) ?? 0) + 1;
    this.counts.set(ip, next);
    return next;
  }

  async reset(ip: string): Promise<void> {
    this.counts.delete(ip);
  }
}
