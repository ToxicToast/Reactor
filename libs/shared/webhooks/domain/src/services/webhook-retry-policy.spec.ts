import { WebhookRetryPolicy } from './webhook-retry-policy.service.js';

describe('WebhookRetryPolicy', () => {
  const now = new Date('2026-10-28T10:00:00Z');
  const policy = new WebhookRetryPolicy();

  it.each([
    [1, 30_000],
    [2, 60_000],
    [3, 120_000],
    [7, 1_920_000],
  ])('waits after attempt %p for %p ms', (attempts, delay) => {
    expect(policy.nextAttemptAt(attempts, now)).toEqual(
      new Date(now.getTime() + delay),
    );
  });

  it('caps the delay', () => {
    const capped = new WebhookRetryPolicy({
      MAX_ATTEMPTS: 20,
      BASE_DELAY_MS: 30_000,
      MAX_DELAY_MS: 21_600_000,
    });

    expect(capped.nextAttemptAt(15, now)).toEqual(
      new Date(now.getTime() + 21_600_000),
    );
  });

  it('gives up after the last attempt', () => {
    expect(policy.nextAttemptAt(8, now)).toBeNull();
  });
});
