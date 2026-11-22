import type { PayloadReader } from '@toxictoast/shared-kernel';
import type { Clip } from '@toxictoast/twitch-domain';

export const clipOf = (payload: PayloadReader): Clip => {
  return {
    clip_id: payload.string('clip_id'),
    channel_id: payload.string('channel_id'),
    url: payload.string('url'),
    title: payload.string('title'),
    creator_id: payload.string('creator_id'),
    creator_name: payload.string('creator_name'),
    duration_seconds: payload.number('duration_seconds'),
    thumbnail_url: payload.string('thumbnail_url'),
    vod_id: payload.nullableString('vod_id'),
    vod_offset: payload.nullableNumber('vod_offset'),
    created_at: payload.date('created_at'),
  };
};
