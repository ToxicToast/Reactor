import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';
import type { ChannelReference } from '../interfaces/index.js';

export const channelReference = (
  channel: TwitchChannelAnemic,
): ChannelReference => {
  return {
    channel_id: channel.twitch_id,
    channel_login: channel.login,
    channel_name: channel.display_name,
  };
};
