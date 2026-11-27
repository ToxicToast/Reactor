import type { YouTubeChannelAnemic } from '@toxictoast/youtube-domain';
import { YOUTUBE_URLS } from '../constants/index.js';

export const channelUrlOf = (
  channel: Pick<YouTubeChannelAnemic, 'youtube_id' | 'handle'>,
): string => {
  if (channel.handle !== null) {
    return `${YOUTUBE_URLS.BASE}${channel.handle}`;
  }
  return `${YOUTUBE_URLS.CHANNEL}${channel.youtube_id}`;
};
