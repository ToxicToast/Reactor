export interface TwitchUnbanPayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly user_id: string;
  readonly user_login: string;
  readonly user_name: string;
  readonly moderator_id: string;
  readonly moderator_login: string;
  readonly moderator_name: string;
}
