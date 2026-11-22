import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';

export interface DisconnectChannelInput {
  readonly id: TwitchChannelId;
}

export interface RevokeChannelInput {
  readonly twitch_id: string;
}

export interface ResumeSubscriptionsOutput {
  readonly started: Array<string>;
  readonly failed: Array<string>;
}
