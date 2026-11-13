import type { Nullable } from '@toxictoast/shared-types';

export interface WebhookPayloadV1 {
  readonly id: string;
  readonly events: ReadonlyArray<string>;
  readonly description: Nullable<string>;
  readonly active: boolean;
  readonly format: string;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
