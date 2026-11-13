import { WebhookEvents } from '../events/index.js';
import { WebhookFactory } from '../factories/index.js';
import type { WebhookDomain } from './webhook.domain.js';
import { createFixedTestContext } from '@toxictoast/shared-kernel/testing';

const NOW = new Date('2026-10-28T10:00:00Z');

const ctx = createFixedTestContext('webhook-1', () => NOW);

describe('WebhookDomain events', () => {
  const factory = new WebhookFactory(ctx);

  const createWebhook = (): WebhookDomain => {
    const result = factory.createDomain({
      url: 'https://discord.com/api/webhooks/1/token',
      events: ['twitch.stream.*'],
      secret: 'whsec_1',
    });
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  };

  const eventNames = (webhook: WebhookDomain): Array<string> => {
    return webhook.toEvents().map((event) => event.event_name);
  };

  it('raises created when a webhook is created', () => {
    const [event] = createWebhook().toEvents();

    expect(event).toMatchObject({
      event_namespace: WebhookEvents.CREATED.namespace,
      event_name: WebhookEvents.CREATED.name,
      event_version: WebhookEvents.CREATED.version,
      aggregate_id: 'webhook-1',
      occurred_at: NOW,
    });
  });

  it('keeps url and secret out of the payload', () => {
    const [event] = createWebhook().toEvents();

    expect(event.payload).toEqual({
      id: 'webhook-1',
      events: ['twitch.stream.*'],
      description: null,
      active: true,
      format: 'json',
      created_at: NOW,
      updated_at: null,
      deleted_at: null,
    });
  });

  it('raises an event for every change', () => {
    const webhook = createWebhook();
    webhook.toEvents();

    webhook.update({
      url: 'https://hooks.example.com/neu',
      events: ['*'],
      active: true,
    });
    webhook.rotateSecret('whsec_2');
    webhook.delete();

    expect(eventNames(webhook)).toEqual([
      WebhookEvents.UPDATED.name,
      WebhookEvents.SECRET_ROTATED.name,
      WebhookEvents.DELETED.name,
    ]);
  });

  it('carries the deactivated state in the deleted event', () => {
    const webhook = createWebhook();
    webhook.toEvents();

    webhook.delete();
    const [event] = webhook.toEvents();

    expect(event.payload).toMatchObject({
      active: false,
      deleted_at: NOW,
    });
  });

  it('raises nothing for refused changes', () => {
    const webhook = createWebhook();
    webhook.toEvents();

    webhook.update({ url: 'kaputt', events: ['*'], active: true });
    webhook.rotateSecret('');

    expect(webhook.toEvents()).toEqual([]);
  });
});
