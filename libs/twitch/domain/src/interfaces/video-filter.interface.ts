import type { Nullable } from '@toxictoast/shared-types';
import type { VideoType } from '../types/index.js';

export interface VideoFilter {
  readonly channel_id: string;
  readonly type: Nullable<VideoType>;
  readonly stream_id: Nullable<string>;
}
