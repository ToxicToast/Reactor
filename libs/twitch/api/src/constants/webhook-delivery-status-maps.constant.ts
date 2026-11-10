import { TwitchWebhookDeliveryStatus } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import {
  WebhookDeliveryStatus,
  type WebhookDeliveryStatusValue,
} from '@toxictoast/shared-webhooks-domain';

export const WEBHOOK_DELIVERY_STATUS_TO_PROTO: Readonly<
  Record<WebhookDeliveryStatusValue, TwitchWebhookDeliveryStatus>
> = {
  [WebhookDeliveryStatus.PENDING]:
    TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_PENDING,
  [WebhookDeliveryStatus.DELIVERED]:
    TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_DELIVERED,
  [WebhookDeliveryStatus.FAILED]:
    TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_FAILED,
};

export const WEBHOOK_DELIVERY_STATUS_FROM_PROTO = {
  [TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_UNSPECIFIED]:
    null,
  ...Object.fromEntries(
    Object.entries(WEBHOOK_DELIVERY_STATUS_TO_PROTO).map(([status, proto]) => {
      return [proto, status];
    }),
  ),
} as Readonly<
  Record<TwitchWebhookDeliveryStatus, Nullable<WebhookDeliveryStatusValue>>
>;
