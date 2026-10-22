import type { UnitOfWork } from '../interfaces/index.js';

export class ImmediateUnitOfWork implements UnitOfWork {
  runs = 0;

  async run<T>(work: () => Promise<T>): Promise<T> {
    this.runs++;
    return work();
  }
}
