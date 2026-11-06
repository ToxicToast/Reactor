import type { DomainContext } from '@toxictoast/shared-kernel';
import { createCountingTestContext } from '@toxictoast/shared-kernel/testing';

export const TEST_NOW = new Date('2026-10-19T12:00:00Z');

export const createTestContext = (now: Date = TEST_NOW): DomainContext => {
  return createCountingTestContext(now);
};
