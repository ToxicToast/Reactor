import type { Nullable } from '@toxictoast/shared-types';
import type { MediaStatus } from '../enums/index.js';
import type { MediaId } from '../types/index.js';

export interface MediaEventPayload {
  readonly id: MediaId;
  readonly object_key: string;
  readonly filename: string;
  readonly mime_type: string;
  readonly size: number;
  readonly alt_text: Nullable<string>;
  readonly status: MediaStatus;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
