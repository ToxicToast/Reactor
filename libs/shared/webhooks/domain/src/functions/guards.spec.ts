import { isWebhookActive } from './is-webhook-active.function.js';
import { isWebhookDeliveryDue } from './is-webhook-delivery-due.function.js';
import { truncateWebhookError } from './truncate-webhook-error.function.js';
import { validateWebhookSecret } from './validate-webhook-secret.function.js';

const NOW = new Date('2026-10-28T10:00:00Z');

describe('validateWebhookSecret', () => {
  it('accepts a secret and refuses an empty one', () => {
    expect(validateWebhookSecret('whsec_1').isSuccess).toBe(true);
    expect(validateWebhookSecret('').error.code).toBe('VALIDATION');
  });
});

describe('isWebhookActive', () => {
  it.each([
    [{ active: true, deleted_at: null }, true],
    [{ active: false, deleted_at: null }, false],
    [{ active: true, deleted_at: NOW }, false],
  ])('%p is active: %p', (webhook, expected) => {
    expect(isWebhookActive(webhook)).toBe(expected);
  });
});

describe('isWebhookDeliveryDue', () => {
  it.each([
    [{ status: 'pending', next_attempt_at: NOW }, true],
    [
      { status: 'pending', next_attempt_at: new Date('2026-10-28T10:00:01Z') },
      false,
    ],
    [{ status: 'pending', next_attempt_at: null }, false],
    [{ status: 'delivered', next_attempt_at: NOW }, false],
  ] as const)('%p is due: %p', (delivery, expected) => {
    expect(isWebhookDeliveryDue(delivery, NOW)).toBe(expected);
  });
});

describe('truncateWebhookError', () => {
  it('keeps short errors and cuts long ones', () => {
    expect(truncateWebhookError('timeout')).toBe('timeout');
    expect(truncateWebhookError('x'.repeat(2000))).toHaveLength(500);
  });
});
