import type { Nullable } from '@toxictoast/shared-types';

export interface TwitchResubscribePayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly user_id: string;
  readonly user_login: string;
  readonly user_name: string;
  readonly tier: string;
  readonly cumulative_months: number;
  readonly streak_months: Nullable<number>;
  readonly duration_months: number;
  readonly message: string;
}
