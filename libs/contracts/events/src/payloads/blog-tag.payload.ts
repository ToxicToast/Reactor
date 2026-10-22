import type { Nullable } from '@toxictoast/shared-types';

export interface BlogTagPayloadV1 {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
