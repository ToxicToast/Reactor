import type { TwitchClip } from '../interfaces/index.js';

export const twitchClip = (
  id: string,
  overrides: Partial<TwitchClip> = {},
): TwitchClip => {
  return {
    clip_id: id,
    url: `https://clips.twitch.tv/${id}`,
    title: `Clip ${id}`,
    creator_id: '777',
    creator_name: 'Clipper',
    duration_seconds: 30,
    view_count: 1,
    thumbnail_url: `https://clips-media.twitch.tv/${id}.jpg`,
    vod_id: null,
    created_at: new Date('2026-10-26T19:30:00Z'),
    ...overrides,
  };
};
