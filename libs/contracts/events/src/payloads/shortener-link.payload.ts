import type { Nullable } from '@toxictoast/shared-types';

export interface ShortenerLinkPayloadV1 {
  readonly id: string;
  readonly target_url: string;
  readonly description: Nullable<string>;
  readonly active: boolean;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
