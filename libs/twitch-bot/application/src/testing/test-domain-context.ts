import type { DomainContext } from '@toxictoast/shared-kernel';

export const TEST_NOW = new Date('2026-10-26T20:00:00Z');

export const createTestContext = (now: Date = TEST_NOW): DomainContext => {
  let counter = 0;
  return {
    id: { generate: () => `id-${++counter}` as never },
    date: { now: () => now },
  };
};
