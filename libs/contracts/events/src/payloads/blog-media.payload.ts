import type { Nullable } from '@toxictoast/shared-types';

export interface BlogMediaPayloadV1 {
  readonly id: string;
  readonly object_key: string;
  readonly filename: string;
  readonly mime_type: string;
  readonly size: number;
  readonly alt_text: Nullable<string>;
  readonly status: 'pending' | 'ready';
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
