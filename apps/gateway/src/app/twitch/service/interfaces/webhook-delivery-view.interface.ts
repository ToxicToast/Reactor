import type { TwitchWebhookDelivery } from '@toxictoast/contracts-grpc';

export interface WebhookDeliveryView extends Omit<
  TwitchWebhookDelivery,
  'status'
> {
  readonly status: string;
}
