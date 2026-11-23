import type { Nullable } from '@toxictoast/shared-types';

export interface TwitchSessionPayloadV1 {
  readonly id: string;
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly stream_id: string;
  readonly started_at: string;
  readonly ended_at: Nullable<string>;
  readonly duration_seconds: Nullable<number>;
  readonly peak_chatters: number;
  readonly messages: number;
  readonly unique_chatters: number;
  readonly follows: number;
  readonly subscriptions: number;
  readonly resubscriptions: number;
  readonly gifted_subs: number;
  readonly bits: number;
  readonly raids: number;
  readonly raid_viewers: number;
  readonly redemptions: number;
  readonly title: Nullable<string>;
  readonly game_id: Nullable<string>;
  readonly game_name: Nullable<string>;
  readonly viewer_count: number;
  readonly peak_viewers: number;
  readonly average_viewers: number;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
