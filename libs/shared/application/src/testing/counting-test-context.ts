import type { DomainContext } from '@toxictoast/shared-kernel';

export const createCountingTestContext = (now: Date): DomainContext => {
  let counter = 0;
  return {
    id: { generate: () => `id-${++counter}` as never },
    date: { now: () => now },
  };
};
