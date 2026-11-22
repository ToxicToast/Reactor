import type { PayloadReader } from '@toxictoast/shared-kernel';
import { VideoTypes, type Video } from '@toxictoast/twitch-domain';

export const videoOf = (payload: PayloadReader): Video => {
  return {
    video_id: payload.string('video_id'),
    channel_id: payload.string('channel_id'),
    stream_id: payload.nullableString('stream_id'),
    type: payload.oneOf('type', Object.values(VideoTypes)),
    title: payload.string('title'),
    description: payload.string('description'),
    url: payload.string('url'),
    thumbnail_url: payload.string('thumbnail_url'),
    duration_seconds: payload.integer('duration_seconds'),
    language: payload.string('language'),
    created_at: payload.date('created_at'),
    published_at: payload.date('published_at'),
  };
};
