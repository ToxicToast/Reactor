import type {
  FormattedWebhook,
  WebhookFormatter,
} from '@toxictoast/shared-webhooks-application';
import {
  WebhookFormats,
  type WebhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-domain';
import { WEBHOOK_HTTP } from '../constants/index.js';

export class JsonWebhookFormatter implements WebhookFormatter {
  readonly name = WebhookFormats.JSON;

  render(delivery: WebhookDeliveryAnemic): FormattedWebhook {
    return {
      content_type: WEBHOOK_HTTP.CONTENT_TYPE_JSON,
      body: JSON.stringify({
        id: delivery.event_id,
        event: delivery.event_key,
        occurred_at: delivery.occurred_at.toISOString(),
        data: delivery.payload,
      }),
    };
  }
}
