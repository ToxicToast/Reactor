import type { Anemic, Nullable } from '@toxictoast/shared-kernel';
import type { MediaStatus } from '../enums/index.js';
import type { MediaId } from '../types/index.js';

export interface MediaAnemic extends Anemic<MediaId> {
  readonly object_key: string;
  readonly filename: string;
  readonly mime_type: string;
  readonly size: number;
  readonly alt_text: Nullable<string>;
  readonly status: MediaStatus;
}
