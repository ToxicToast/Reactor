export interface TwitchRaidPayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly from_channel_id: string;
  readonly from_channel_login: string;
  readonly from_channel_name: string;
  readonly viewers: number;
}
