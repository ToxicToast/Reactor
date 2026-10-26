import type { HelixClip } from '@twurple/api';
import type { TwitchClip } from '@toxictoast/twitch-bot-application';

export const clipFromHelix = (clip: HelixClip): TwitchClip => {
  return {
    clip_id: clip.id,
    url: clip.url,
    title: clip.title,
    creator_id: clip.creatorId,
    creator_name: clip.creatorDisplayName,
    duration_seconds: clip.duration,
    view_count: clip.views,
    thumbnail_url: clip.thumbnailUrl,
    vod_id: clip.videoId === '' ? null : clip.videoId,
    created_at: clip.creationDate,
  };
};
