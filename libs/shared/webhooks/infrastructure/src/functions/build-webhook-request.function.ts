import type { FormattedWebhook } from '@toxictoast/shared-webhooks-application';
import type {
  WebhookAnemic,
  WebhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-domain';
import { WEBHOOK_HEADERS, WEBHOOK_HTTP } from '../constants/index.js';
import type { WebhookRequest } from '../interfaces/index.js';
import { signWebhook } from './sign-webhook.function.js';

export const buildWebhookRequest = (
  webhook: WebhookAnemic,
  delivery: WebhookDeliveryAnemic,
  formatted: FormattedWebhook,
  now: Date,
): WebhookRequest => {
  const timestamp = Math.floor(now.getTime() / 1000);
  return {
    url: webhook.url,
    body: formatted.body,
    headers: {
      'Content-Type': formatted.content_type,
      'User-Agent': WEBHOOK_HTTP.USER_AGENT,
      [WEBHOOK_HEADERS.EVENT]: delivery.event_key,
      [WEBHOOK_HEADERS.DELIVERY]: delivery.id,
      [WEBHOOK_HEADERS.TIMESTAMP]: String(timestamp),
      [WEBHOOK_HEADERS.SIGNATURE]: signWebhook(
        webhook.secret,
        timestamp,
        formatted.body,
      ),
    },
  };
};
