import type { Mapper } from '@toxictoast/shared-persistence';
import type {
  WebhookDeliveryAnemic,
  WebhookDeliveryId,
  WebhookId,
} from '@toxictoast/shared-webhooks-domain';
import type { WebhookDeliveryRow } from '../interfaces/index.js';

export class WebhookDeliveryMapper implements Mapper<
  WebhookDeliveryAnemic,
  WebhookDeliveryRow
> {
  toAnemic(row: WebhookDeliveryRow): WebhookDeliveryAnemic {
    return {
      id: row.id as WebhookDeliveryId,
      webhook_id: row.webhook_id as WebhookId,
      event_id: row.event_id,
      event_key: row.event_key,
      occurred_at: row.occurred_at,
      payload: row.payload,
      status: row.status,
      attempts: row.attempts,
      last_status_code: row.last_status_code,
      last_error: row.last_error,
      next_attempt_at: row.next_attempt_at,
      delivered_at: row.delivered_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: WebhookDeliveryAnemic): WebhookDeliveryRow {
    return {
      id: anemic.id,
      webhook_id: anemic.webhook_id,
      event_id: anemic.event_id,
      event_key: anemic.event_key,
      occurred_at: anemic.occurred_at,
      payload: anemic.payload,
      status: anemic.status,
      attempts: anemic.attempts,
      last_status_code: anemic.last_status_code,
      last_error: anemic.last_error,
      next_attempt_at: anemic.next_attempt_at,
      delivered_at: anemic.delivered_at,
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
