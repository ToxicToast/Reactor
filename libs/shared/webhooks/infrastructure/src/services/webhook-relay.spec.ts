import {
  createWebhookTestContext,
  InMemoryWebhookDeliveryRepository,
  InMemoryWebhookRepository,
  WEBHOOK_TEST_NOW,
  webhookAnemic,
  webhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-application';
import {
  WebhookDeliveryFactory,
  WebhookRetryPolicy,
} from '@toxictoast/shared-webhooks-domain';
import {
  immediateAdvisoryLock,
  RecordingWebhookSender,
} from '../testing/index.js';
import { JsonWebhookFormatter } from './json-webhook-formatter.service.js';
import { WebhookRelay } from './webhook-relay.service.js';

describe('WebhookRelay', () => {
  let webhooks: InMemoryWebhookRepository;
  let deliveries: InMemoryWebhookDeliveryRepository;
  let sender: RecordingWebhookSender;
  let relay: WebhookRelay;

  beforeEach(async () => {
    webhooks = new InMemoryWebhookRepository();
    deliveries = new InMemoryWebhookDeliveryRepository();
    sender = new RecordingWebhookSender();
    relay = new WebhookRelay(
      immediateAdvisoryLock(),
      webhooks,
      deliveries,
      new WebhookDeliveryFactory(createWebhookTestContext()),
      [new JsonWebhookFormatter()],
      sender,
      new WebhookRetryPolicy(),
      { now: () => WEBHOOK_TEST_NOW },
    );
    await webhooks.save(webhookAnemic('webhook-1'));
  });

  const stored = (id: string) => {
    return deliveries.items.find((delivery) => delivery.id === id);
  };

  it('delivers due deliveries and marks them delivered', async () => {
    await deliveries.save(webhookDeliveryAnemic('delivery-1'));

    const result = await relay.run();

    expect(result).toEqual({ processed: 1, error: null });
    expect(sender.requests.map((request) => request.url)).toEqual([
      'https://hooks.example.com/twitch',
    ]);
    expect(stored('delivery-1')).toMatchObject({
      status: 'delivered',
      attempts: 1,
      last_status_code: 204,
    });
  });

  it('schedules a retry when the receiver answers with an error', async () => {
    sender.respond = async () => ({ status_code: 503 });
    await deliveries.save(webhookDeliveryAnemic('delivery-1'));

    await relay.run();

    expect(stored('delivery-1')).toMatchObject({
      status: 'pending',
      attempts: 1,
      last_status_code: 503,
      last_error: 'HTTP 503',
      next_attempt_at: new Date(WEBHOOK_TEST_NOW.getTime() + 30_000),
    });
  });

  it('schedules a retry when the request fails', async () => {
    sender.respond = async () => {
      throw new Error('connect ECONNREFUSED');
    };
    await deliveries.save(webhookDeliveryAnemic('delivery-1'));

    await relay.run();

    expect(stored('delivery-1')).toMatchObject({
      status: 'pending',
      last_status_code: null,
      last_error: 'connect ECONNREFUSED',
    });
  });

  it('abandons deliveries of inactive webhooks without sending', async () => {
    await webhooks.save(webhookAnemic('webhook-1', { active: false }));
    await deliveries.save(webhookDeliveryAnemic('delivery-1'));

    await relay.run();

    expect(sender.requests).toEqual([]);
    expect(stored('delivery-1')).toMatchObject({
      status: 'failed',
      last_error: 'Webhook is deleted or inactive',
    });
  });

  it('abandons deliveries with an unknown format', async () => {
    await webhooks.save(webhookAnemic('webhook-1', { format: 'discord' }));
    await deliveries.save(webhookDeliveryAnemic('delivery-1'));

    await relay.run();

    expect(stored('delivery-1')).toMatchObject({
      status: 'failed',
      last_error: 'Unknown webhook format discord',
    });
  });

  it('leaves deliveries alone that are not due yet', async () => {
    await deliveries.save(
      webhookDeliveryAnemic('delivery-1', {
        next_attempt_at: new Date(WEBHOOK_TEST_NOW.getTime() + 1),
      }),
    );

    const result = await relay.run();

    expect(result.processed).toBe(0);
    expect(sender.requests).toEqual([]);
  });
});
