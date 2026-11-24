export interface TwitchFollowerCountPayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly total: number;
}
