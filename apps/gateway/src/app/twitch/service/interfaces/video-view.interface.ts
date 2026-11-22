import type { TwitchVideo } from '@toxictoast/contracts-grpc';
import type { Optional } from '@toxictoast/shared-types';
import type { VIDEO_TYPES } from '../constants/index.js';

export interface VideoView extends Omit<TwitchVideo, 'type'> {
  readonly type: Optional<keyof typeof VIDEO_TYPES>;
}
