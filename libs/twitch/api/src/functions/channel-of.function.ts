import type { ChannelRef } from '@toxictoast/twitch-domain';
import type { PayloadReader } from '@toxictoast/shared-kernel';

export const channelOf = (payload: PayloadReader): ChannelRef => {
  return {
    channel_id: payload.string('channel_id'),
    channel_login: payload.string('channel_login'),
    channel_name: payload.string('channel_name'),
  };
};
