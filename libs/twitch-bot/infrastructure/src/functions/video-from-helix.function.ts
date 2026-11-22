import type { HelixVideo } from '@twurple/api';
import type { TwitchVideo } from '@toxictoast/twitch-bot-application';
import { VIDEO_THUMBNAIL } from '../constants/index.js';

export const videoFromHelix = (video: HelixVideo): TwitchVideo => {
  return {
    video_id: video.id,
    stream_id: video.streamId,
    type: video.type,
    title: video.title,
    description: video.description,
    url: video.url,
    thumbnail_url: video.getThumbnailUrl(
      VIDEO_THUMBNAIL.WIDTH,
      VIDEO_THUMBNAIL.HEIGHT,
    ),
    duration_seconds: video.durationInSeconds,
    language: video.language,
    created_at: video.creationDate,
    published_at: video.publishDate,
  };
};
