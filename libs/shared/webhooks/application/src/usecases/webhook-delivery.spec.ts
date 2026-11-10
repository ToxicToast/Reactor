import { WebhookDeliveryFactory } from '@toxictoast/shared-webhooks-domain';
import {
  createWebhookTestContext,
  InMemoryWebhookDeliveryRepository,
  InMemoryWebhookRepository,
  WEBHOOK_TEST_NOW,
  webhookAnemic,
} from '../testing/index.js';
import { DispatchWebhookEventUseCase } from './dispatch-webhook-event.usecase.js';
import { ListWebhookDeliveriesUseCase } from './list-webhook-deliveries.usecase.js';

const EVENT = {
  event_id: 'event-1',
  event_key: 'twitch.stream.online',
  occurred_at: new Date('2026-10-28T09:59:00Z'),
  payload: { channel_login: 'toxictoast' },
};

describe('webhook deliveries', () => {
  let webhooks: InMemoryWebhookRepository;
  let deliveries: InMemoryWebhookDeliveryRepository;
  let dispatch: DispatchWebhookEventUseCase;

  beforeEach(async () => {
    webhooks = new InMemoryWebhookRepository();
    deliveries = new InMemoryWebhookDeliveryRepository();
    dispatch = new DispatchWebhookEventUseCase(
      new WebhookDeliveryFactory(createWebhookTestContext()),
      webhooks,
      deliveries,
    );
    await webhooks.save(webhookAnemic('exact'));
    await webhooks.save(
      webhookAnemic('prefix', { events: ['twitch.stream.*'] }),
    );
    await webhooks.save(
      webhookAnemic('other', { events: ['twitch.community.raid'] }),
    );
    await webhooks.save(webhookAnemic('inactive', { active: false }));
    await webhooks.save(
      webhookAnemic('deleted', { deleted_at: WEBHOOK_TEST_NOW }),
    );
  });

  it('enqueues a pending delivery for every matching active webhook', async () => {
    const result = await dispatch.execute(EVENT);

    expect(result.value).toBe(2);
    expect(deliveries.items.map((delivery) => delivery.webhook_id)).toEqual([
      'exact',
      'prefix',
    ]);
    expect(deliveries.items[0]).toMatchObject({
      event_id: 'event-1',
      event_key: 'twitch.stream.online',
      status: 'pending',
      next_attempt_at: WEBHOOK_TEST_NOW,
    });
  });

  it('does not deliver the same event twice', async () => {
    await dispatch.execute(EVENT);
    await dispatch.execute(EVENT);

    expect(deliveries.items).toHaveLength(2);
  });

  it('does nothing without matching webhooks', async () => {
    const result = await dispatch.execute({
      ...EVENT,
      event_key: 'twitch.chat.message',
    });

    expect(result.value).toBe(0);
    expect(deliveries.items).toHaveLength(0);
  });

  it('lists the deliveries of a webhook, also after it was deleted', async () => {
    await dispatch.execute(EVENT);
    const list = new ListWebhookDeliveriesUseCase(webhooks, deliveries);

    const result = await list.execute({ webhook_id: 'exact' });
    const deleted = await list.execute({ webhook_id: 'deleted' });

    expect(result.value).toHaveLength(1);
    expect(deleted.value).toEqual([]);
  });

  it('fails for an unknown webhook', async () => {
    const result = await new ListWebhookDeliveriesUseCase(
      webhooks,
      deliveries,
    ).execute({ webhook_id: 'unknown' });

    expect(result.error.code).toBe('NOT_FOUND');
  });
});
