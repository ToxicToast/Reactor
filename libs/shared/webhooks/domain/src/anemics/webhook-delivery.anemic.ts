import type { Anemic } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  WebhookDeliveryId,
  WebhookDeliveryStatusValue,
  WebhookId,
} from '../types/index.js';

export interface WebhookDeliveryAnemic extends Anemic<WebhookDeliveryId> {
  readonly webhook_id: WebhookId;
  readonly event_id: string;
  readonly event_key: string;
  readonly occurred_at: Date;
  readonly payload: object;
  readonly status: WebhookDeliveryStatusValue;
  readonly attempts: number;
  readonly last_status_code: Nullable<number>;
  readonly last_error: Nullable<string>;
  readonly next_attempt_at: Nullable<Date>;
  readonly delivered_at: Nullable<Date>;
}
