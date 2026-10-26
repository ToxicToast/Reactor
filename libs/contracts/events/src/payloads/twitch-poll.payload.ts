import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchPollChoicePayloadV1 } from './twitch-poll-choice.payload.js';

export interface TwitchPollPayloadV1 {
  readonly channel_id: string;
  readonly channel_login: string;
  readonly channel_name: string;
  readonly poll_id: string;
  readonly title: string;
  readonly choices: ReadonlyArray<TwitchPollChoicePayloadV1>;
  readonly status: string;
  readonly started_at: string;
  readonly ends_at: Nullable<string>;
  readonly ended_at: Nullable<string>;
}
