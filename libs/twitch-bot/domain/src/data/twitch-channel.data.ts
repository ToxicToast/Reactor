import type { TwitchChannelAnemic } from '../anemics/index.js';

export type TwitchChannelData = Pick<
  TwitchChannelAnemic,
  'twitch_id' | 'login' | 'display_name' | 'scopes'
>;
