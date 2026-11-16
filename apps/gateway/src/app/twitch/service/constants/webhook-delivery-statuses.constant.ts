import { TwitchWebhookDeliveryStatus } from '@toxictoast/contracts-grpc';
import { enumNames } from '../../../common/functions/index.js';

export const WEBHOOK_DELIVERY_STATUS_QUERY = {
  pending: TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_PENDING,
  delivered:
    TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_DELIVERED,
  failed: TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_FAILED,
} as const;

export const WEBHOOK_DELIVERY_STATUS_NAMES = enumNames(
  WEBHOOK_DELIVERY_STATUS_QUERY,
);
