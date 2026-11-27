import {
  SocialPlatforms,
  type SocialPostObservation,
} from '@toxictoast/shared-social';
import type { Nullable } from '@toxictoast/shared-types';
import type { YouTubeChannelAnemic } from '@toxictoast/youtube-domain';
import { YOUTUBE_URLS } from '../constants/index.js';
import type {
  YouTubeVideo,
  YouTubeVideoAnalytics,
} from '../interfaces/index.js';

/** Aufrufe, Likes, Kommentare aus der Data API; der Rest aus Analytics, sonst null. Saves und Reichweite kennt YouTube nicht. */
export const postObservationOf = (
  channel: YouTubeChannelAnemic,
  video: YouTubeVideo,
  analytics: Nullable<YouTubeVideoAnalytics>,
): SocialPostObservation => {
  return {
    platform: SocialPlatforms.YOUTUBE,
    remote_id: video.video_id,
    account_remote_id: channel.youtube_id,
    url: `${YOUTUBE_URLS.VIDEO}${video.video_id}`,
    title: video.title,
    published_at: video.published_at,
    duration_seconds: video.duration_seconds,
    metrics: {
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      shares: analytics?.shares ?? null,
      saves: null,
      reach: null,
      avg_watch_time_ms: analytics?.avg_watch_time_ms ?? null,
      total_watch_time_ms: analytics?.total_watch_time_ms ?? null,
      avg_view_percentage: analytics?.avg_view_percentage ?? null,
      followers_gained: analytics?.followers_gained ?? null,
    },
  };
};
