import type {
  TwitchWebhook,
  TwitchWebhookDelivery,
} from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';
import type {
  WebhookAnemic,
  WebhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-domain';
import { WEBHOOK_DELIVERY_STATUS_TO_PROTO } from '../constants/webhook-delivery-status-maps.constant.js';

export class TwitchWebhookGrpcMapper {
  /** Das Secret verlässt den Service nur bei Create und Rotate. */
  toWebhook(webhook: WebhookAnemic): TwitchWebhook {
    return {
      id: webhook.id,
      url: webhook.url,
      events: [...webhook.events],
      description: webhook.description ?? undefined,
      active: webhook.active,
      created_at: webhook.created_at.toISOString(),
      updated_at: toIso(webhook.updated_at),
    };
  }

  toDelivery(delivery: WebhookDeliveryAnemic): TwitchWebhookDelivery {
    return {
      id: delivery.id,
      webhook_id: delivery.webhook_id,
      event_key: delivery.event_key,
      event_id: delivery.event_id,
      status: WEBHOOK_DELIVERY_STATUS_TO_PROTO[delivery.status],
      attempts: delivery.attempts,
      last_status_code: delivery.last_status_code ?? undefined,
      last_error: delivery.last_error ?? undefined,
      next_attempt_at: toIso(delivery.next_attempt_at),
      delivered_at: toIso(delivery.delivered_at),
      created_at: delivery.created_at.toISOString(),
    };
  }
}
