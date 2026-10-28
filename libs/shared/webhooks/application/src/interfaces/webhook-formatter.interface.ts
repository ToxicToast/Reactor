import type { WebhookDeliveryAnemic } from '@toxictoast/shared-webhooks-domain';
import type { FormattedWebhook } from './formatted-webhook.interface.js';

export interface WebhookFormatter {
  readonly name: string;
  render(delivery: WebhookDeliveryAnemic): FormattedWebhook;
}
