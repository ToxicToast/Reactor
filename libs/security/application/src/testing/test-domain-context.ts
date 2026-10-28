import { createCountingTestContext } from '@toxictoast/shared-application';
import type { DomainContext } from '@toxictoast/shared-kernel';

export const TEST_NOW = new Date('2026-10-23T12:10:00Z');

export const createTestContext = (now: Date = TEST_NOW): DomainContext => {
  return createCountingTestContext(now);
};
