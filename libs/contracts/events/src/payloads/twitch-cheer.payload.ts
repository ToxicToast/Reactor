import type { Nullable } from '@toxictoast/shared-types';

export interface TwitchCheerPayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly user_id: Nullable<string>;
  readonly user_login: Nullable<string>;
  readonly user_name: Nullable<string>;
  readonly is_anonymous: boolean;
  readonly bits: number;
  readonly message: string;
}
