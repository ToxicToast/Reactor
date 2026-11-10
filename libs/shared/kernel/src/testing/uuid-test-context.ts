import { randomUUID } from 'node:crypto';
import type { DomainContext } from '../interfaces/index.js';

export const createUuidTestContext = (now: Date): DomainContext => {
  return {
    id: { generate: () => randomUUID() as never },
    date: { now: () => now },
  };
};
