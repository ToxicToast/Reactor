export interface TwitchStreamOnlinePayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly stream_id: string;
  readonly type: string;
  readonly started_at: string;
}
