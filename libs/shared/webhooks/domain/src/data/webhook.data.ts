import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { WebhookId } from '../types/index.js';

export interface WebhookDataInput {
  readonly url: string;
  readonly events: ReadonlyArray<string>;
  readonly description?: Optional<Nullable<string>>;
}

export interface WebhookData {
  readonly url: string;
  readonly events: ReadonlyArray<string>;
  readonly description: Nullable<string>;
}

export interface CreateWebhookData extends WebhookDataInput {
  readonly secret: string;
}

export interface UpdateWebhookData extends WebhookDataInput {
  readonly active: boolean;
}

export interface WebhookDeliveryData {
  readonly webhook_id: WebhookId;
  readonly event_id: string;
  readonly event_key: string;
  readonly occurred_at: Date;
  readonly payload: object;
}
