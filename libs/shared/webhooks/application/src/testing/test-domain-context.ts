import type { DomainContext } from '@toxictoast/shared-kernel';

export const WEBHOOK_TEST_NOW = new Date('2026-10-28T10:00:00Z');

export const createWebhookTestContext = (
  now: Date = WEBHOOK_TEST_NOW,
): DomainContext => {
  let counter = 0;
  return {
    id: { generate: () => `id-${++counter}` as never },
    date: { now: () => now },
  };
};
