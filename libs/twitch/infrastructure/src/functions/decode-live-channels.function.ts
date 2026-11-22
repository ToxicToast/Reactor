import type { LiveChannel } from '@toxictoast/twitch-application';
import type { EncodedLiveChannel } from '../types/index.js';

export const decodeLiveChannels = (message: string): Array<LiveChannel> => {
  const channels = JSON.parse(message) as Array<EncodedLiveChannel>;
  return channels.map((channel) => {
    return {
      ...channel,
      started_at:
        channel.started_at === null ? null : new Date(channel.started_at),
    };
  });
};
