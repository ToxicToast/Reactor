import type { Nullable } from '@toxictoast/shared-types';
import type { YouTubeChannelAnemic } from '@toxictoast/youtube-domain';
import type { YouTubeVideoAnalytics } from './youtube-video-analytics.interface.js';

export interface YouTubeAnalyticsSource {
  /** null, solange die Analytics API für das Video noch nichts hat oder nicht erreichbar ist */
  videoAnalytics(
    channel: YouTubeChannelAnemic,
    videoId: string,
  ): Promise<Nullable<YouTubeVideoAnalytics>>;
}
