import type { DomainContext } from '@toxictoast/shared-kernel';

export const TEST_NOW = new Date('2026-10-23T12:10:00Z');

export const createTestContext = (now: Date = TEST_NOW): DomainContext => {
  let counter = 0;
  return {
    id: { generate: () => `id-${++counter}` as never },
    date: { now: () => now },
  };
};
