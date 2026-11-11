import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchChannelId } from '../types/index.js';

export interface TwitchChannelEventPayload {
  readonly id: TwitchChannelId;
  readonly twitch_id: string;
  readonly login: string;
  readonly display_name: string;
  readonly scopes: ReadonlyArray<string>;
  readonly connected: boolean;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
