import type { Clip } from '@toxictoast/twitch-domain';
import type { MediaChangeKinds } from '../constants/index.js';

export interface ClipChange {
  readonly kind: typeof MediaChangeKinds.CLIP;
  readonly clip: Clip;
}
