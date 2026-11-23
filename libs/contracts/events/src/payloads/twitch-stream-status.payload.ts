export interface TwitchStreamStatusPayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly stream_id: string;
  readonly title: string;
  readonly game_id: string;
  readonly game_name: string;
  readonly viewer_count: number;
  readonly started_at: string;
}
