export interface TwitchLiveStream {
  readonly twitch_id: string;
  readonly stream_id: string;
  readonly type: string;
  readonly title: string;
  readonly game_id: string;
  readonly game_name: string;
  readonly viewer_count: number;
  readonly started_at: Date;
}
