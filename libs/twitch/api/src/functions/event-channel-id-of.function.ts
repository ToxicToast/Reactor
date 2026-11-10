import type { PayloadReader } from '@toxictoast/shared-kernel';

/** Bot-Events tragen die Twitch-Id als twitch_id, alle anderen als channel_id. */
export const eventChannelIdOf = (payload: PayloadReader): string => {
  return payload.has('channel_id')
    ? payload.string('channel_id')
    : payload.string('twitch_id');
};
