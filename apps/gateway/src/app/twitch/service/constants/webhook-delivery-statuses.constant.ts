import { TwitchWebhookDeliveryStatus } from '@toxictoast/contracts-grpc';

export const WEBHOOK_DELIVERY_STATUS_QUERY = {
  pending: TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_PENDING,
  delivered:
    TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_DELIVERED,
  failed: TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_FAILED,
} as const;

export const WEBHOOK_DELIVERY_STATUS_NAMES: Readonly<
  Partial<Record<TwitchWebhookDeliveryStatus, string>>
> = Object.fromEntries(
  Object.entries(WEBHOOK_DELIVERY_STATUS_QUERY).map(([name, status]) => {
    return [status, name];
  }),
);
