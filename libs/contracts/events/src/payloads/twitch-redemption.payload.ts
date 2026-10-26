export interface TwitchRedemptionPayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly redemption_id: string;
  readonly reward_id: string;
  readonly reward_title: string;
  readonly reward_cost: number;
  readonly user_id: string;
  readonly user_login: string;
  readonly user_name: string;
  readonly user_input: string;
  readonly status: string;
  readonly redeemed_at: string;
}
