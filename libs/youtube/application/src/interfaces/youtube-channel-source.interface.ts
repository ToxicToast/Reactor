import type { YouTubeChannelAnemic } from '@toxictoast/youtube-domain';
import type { YouTubeChannelProfile } from './youtube-channel-profile.interface.js';

export interface YouTubeChannelSource {
  profile(channel: YouTubeChannelAnemic): Promise<YouTubeChannelProfile>;
}
