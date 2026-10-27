import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';

export interface PublishTwitchEventInput {
  readonly channel: TwitchChannelAnemic;
  readonly topic: string;
  readonly name: string;
  readonly payload: object;
}
