import type { DomainContext } from '@toxictoast/shared-kernel';
import { WebhookDeliveryFactory } from '../factories/index.js';
import { WebhookRetryPolicy } from '../services/index.js';
import type { WebhookId } from '../types/index.js';
import type { WebhookDeliveryDomain } from './webhook-delivery.domain.js';

let now = new Date('2026-10-28T10:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'delivery-1' as never },
  date: { now: () => now },
};

describe('WebhookDeliveryDomain', () => {
  const factory = new WebhookDeliveryFactory(ctx);
  const policy = new WebhookRetryPolicy({
    MAX_ATTEMPTS: 2,
    BASE_DELAY_MS: 30_000,
    MAX_DELAY_MS: 60_000,
  });

  const createDelivery = (): WebhookDeliveryDomain => {
    const result = factory.createDomain({
      webhook_id: 'webhook-1' as WebhookId,
      event_id: 'event-1',
      event_key: 'twitch.stream.online',
      occurred_at: new Date('2026-10-28T09:59:00Z'),
      payload: { channel_login: 'toxictoast' },
    });
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  };

  beforeEach(() => {
    now = new Date('2026-10-28T10:00:00Z');
  });

  it('starts pending and due immediately', () => {
    expect(createDelivery().toAnemic()).toMatchObject({
      status: 'pending',
      attempts: 0,
      next_attempt_at: now,
    });
  });

  it('marks a delivery as delivered', () => {
    const delivery = createDelivery();

    delivery.delivered(204);

    expect(delivery.toAnemic()).toMatchObject({
      status: 'delivered',
      attempts: 1,
      last_status_code: 204,
      next_attempt_at: null,
      delivered_at: now,
    });
  });

  it('schedules a retry after a failed attempt', () => {
    const delivery = createDelivery();

    delivery.attemptFailed({ status_code: 503, error: 'unavailable' }, policy);

    expect(delivery.toAnemic()).toMatchObject({
      status: 'pending',
      attempts: 1,
      last_status_code: 503,
      last_error: 'unavailable',
      next_attempt_at: new Date(now.getTime() + 30_000),
    });
  });

  it('fails after the last attempt', () => {
    const delivery = createDelivery();
    delivery.attemptFailed({ status_code: null, error: 'timeout' }, policy);

    delivery.attemptFailed({ status_code: null, error: 'timeout' }, policy);

    expect(delivery.toAnemic()).toMatchObject({
      status: 'failed',
      attempts: 2,
      next_attempt_at: null,
    });
  });

  it('shortens long errors', () => {
    const delivery = createDelivery();

    delivery.attemptFailed(
      { status_code: 500, error: 'x'.repeat(2000) },
      policy,
    );

    expect(delivery.toAnemic().last_error).toHaveLength(500);
  });

  it('abandons a delivery', () => {
    const delivery = createDelivery();

    delivery.abandon('Webhook was deleted');

    expect(delivery.toAnemic()).toMatchObject({
      status: 'failed',
      last_error: 'Webhook was deleted',
      next_attempt_at: null,
    });
  });

  it('only changes pending deliveries', () => {
    const delivery = createDelivery();
    delivery.delivered(200);

    expect(delivery.delivered(200).error.code).toBe('CONFLICT');
    expect(
      delivery.attemptFailed({ status_code: 500, error: 'x' }, policy).error
        .code,
    ).toBe('CONFLICT');
    expect(delivery.abandon('x').error.code).toBe('CONFLICT');
  });
});
