import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchFriendId } from '../types/index.js';

export interface TwitchFriendEventPayload {
  readonly id: TwitchFriendId;
  readonly twitch_id: string;
  readonly login: string;
  readonly display_name: string;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
