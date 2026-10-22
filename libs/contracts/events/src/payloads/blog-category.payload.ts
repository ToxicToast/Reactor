import type { Nullable } from '@toxictoast/shared-types';

export interface BlogCategoryPayloadV1 {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly description: Nullable<string>;
  readonly parent_id: Nullable<string>;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
