import type { Nullable } from '@toxictoast/shared-types';

export interface TwitchChatMessagePayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly message_id: string;
  readonly user_id: string;
  readonly user_login: string;
  readonly user_name: string;
  readonly text: string;
  readonly color: Nullable<string>;
  readonly badges: ReadonlyArray<string>;
  readonly bits: number;
  readonly reply_to_message_id: Nullable<string>;
}
