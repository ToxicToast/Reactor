import type { ChannelReference } from '@toxictoast/twitch-bot-application';

export type WithoutChannel<T> = Omit<T, keyof ChannelReference>;
