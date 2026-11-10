import type { ChatDeletionReason } from '@toxictoast/twitch-domain';
import type { ChatChangeKinds } from '../constants/index.js';

export interface ChatUserCleared {
  readonly kind: typeof ChatChangeKinds.CLEARED;
  readonly channel_id: string;
  readonly user_id: string;
  readonly reason: ChatDeletionReason;
  readonly at: Date;
}
