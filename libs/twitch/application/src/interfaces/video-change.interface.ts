import type { Video } from '@toxictoast/twitch-domain';
import type { MediaChangeKinds } from '../constants/index.js';

export interface VideoChange {
  readonly kind: typeof MediaChangeKinds.VIDEO;
  readonly video: Video;
}
