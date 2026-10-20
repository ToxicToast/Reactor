import { randomUUID } from 'node:crypto';
import type { DomainContext } from '@toxictoast/shared-kernel';

export const createUuidTestContext = (now: Date): DomainContext => {
  return {
    id: { generate: () => randomUUID() as never },
    date: { now: () => now },
  };
};
