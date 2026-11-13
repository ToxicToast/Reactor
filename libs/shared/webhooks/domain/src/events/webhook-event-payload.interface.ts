import type { Nullable } from '@toxictoast/shared-types';
import type { WebhookId } from '../types/index.js';

export interface WebhookEventPayload {
  readonly id: WebhookId;
  readonly events: ReadonlyArray<string>;
  readonly description: Nullable<string>;
  readonly active: boolean;
  readonly format: string;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
