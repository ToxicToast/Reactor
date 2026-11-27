import type { YouTubeChannelAnemic } from '../anemics/index.js';

export type YouTubeChannelData = Pick<
  YouTubeChannelAnemic,
  'youtube_id' | 'handle' | 'title' | 'scopes'
>;
