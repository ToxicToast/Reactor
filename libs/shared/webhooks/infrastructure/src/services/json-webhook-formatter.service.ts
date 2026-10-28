import type {
  FormattedWebhook,
  WebhookFormatter,
} from '@toxictoast/shared-webhooks-application';
import {
  WebhookFormats,
  type WebhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-domain';

export class JsonWebhookFormatter implements WebhookFormatter {
  readonly name = WebhookFormats.JSON;

  render(delivery: WebhookDeliveryAnemic): FormattedWebhook {
    return {
      content_type: 'application/json',
      body: JSON.stringify({
        id: delivery.event_id,
        event: delivery.event_key,
        occurred_at: delivery.occurred_at.toISOString(),
        data: delivery.payload,
      }),
    };
  }
}
