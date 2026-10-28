import type {
  WebhookDeliveryAnemic,
  WebhookDeliveryId,
  WebhookId,
} from '@toxictoast/shared-webhooks-domain';

export const webhookDeliveryAnemic = (
  id: string,
  overrides: Partial<WebhookDeliveryAnemic> = {},
): WebhookDeliveryAnemic => {
  return {
    id: id as WebhookDeliveryId,
    webhook_id: 'webhook-1' as WebhookId,
    event_id: 'event-1',
    event_key: 'twitch.stream.online',
    occurred_at: new Date('2026-10-28T09:59:00Z'),
    payload: { channel_login: 'toxictoast' },
    status: 'pending',
    attempts: 0,
    last_status_code: null,
    last_error: null,
    next_attempt_at: new Date('2026-10-28T10:00:00Z'),
    delivered_at: null,
    created_at: new Date('2026-10-28T10:00:00Z'),
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
