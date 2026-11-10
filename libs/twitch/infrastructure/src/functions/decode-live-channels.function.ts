import type { Nullable } from '@toxictoast/shared-types';
import type { LiveChannel } from '@toxictoast/twitch-application';

type EncodedLiveChannel = Omit<LiveChannel, 'started_at'> & {
  readonly started_at: Nullable<string>;
};

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
