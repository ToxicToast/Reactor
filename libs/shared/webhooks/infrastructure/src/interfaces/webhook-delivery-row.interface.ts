import type { AnemicRow } from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type { WebhookDeliveryStatusValue } from '@toxictoast/shared-webhooks-domain';

export interface WebhookDeliveryRow extends AnemicRow {
  webhook_id: string;
  event_id: string;
  event_key: string;
  occurred_at: Date;
  payload: object;
  status: WebhookDeliveryStatusValue;
  attempts: number;
  last_status_code: Nullable<number>;
  last_error: Nullable<string>;
  next_attempt_at: Nullable<Date>;
  delivered_at: Nullable<Date>;
}
