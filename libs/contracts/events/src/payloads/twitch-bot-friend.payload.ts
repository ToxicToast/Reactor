import type { Nullable } from '@toxictoast/shared-types';

export interface TwitchBotFriendPayloadV1 {
  readonly id: string;
  readonly twitch_id: string;
  readonly login: string;
  readonly display_name: string;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
