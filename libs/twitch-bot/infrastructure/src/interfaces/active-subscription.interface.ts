import type { EventSubSubscription } from '@twurple/eventsub-base';
import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';

export interface ActiveSubscription {
  readonly channel: TwitchChannelAnemic;
  readonly subscriptions: Array<EventSubSubscription>;
}
