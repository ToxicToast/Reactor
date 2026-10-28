import type {
  WebhookAnemic,
  WebhookId,
} from '@toxictoast/shared-webhooks-domain';

export const webhookAnemic = (
  id: string,
  overrides: Partial<WebhookAnemic> = {},
): WebhookAnemic => {
  return {
    id: id as WebhookId,
    url: 'https://hooks.example.com/twitch',
    events: ['twitch.stream.online'],
    description: null,
    active: true,
    format: 'json',
    secret: 'whsec_test',
    created_at: new Date('2026-10-28T09:00:00Z'),
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
