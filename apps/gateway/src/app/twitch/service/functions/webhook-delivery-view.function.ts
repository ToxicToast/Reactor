import type { TwitchWebhookDelivery } from '@toxictoast/contracts-grpc';
import { WEBHOOK_DELIVERY_STATUS_NAMES } from '../constants/index.js';
import type { WebhookDeliveryView } from '../interfaces/index.js';

export const webhookDeliveryView = (
  delivery: TwitchWebhookDelivery,
): WebhookDeliveryView => {
  return {
    ...delivery,
    status: WEBHOOK_DELIVERY_STATUS_NAMES[delivery.status] ?? delivery.status,
  };
};
