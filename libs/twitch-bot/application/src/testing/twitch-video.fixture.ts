import { TwitchVideoTypes } from '../constants/index.js';
import type { TwitchVideo } from '../interfaces/index.js';

export const twitchVideo = (
  id: string,
  overrides: Partial<TwitchVideo> = {},
): TwitchVideo => {
  return {
    video_id: id,
    stream_id: null,
    type: TwitchVideoTypes.HIGHLIGHT,
    title: `Video ${id}`,
    description: '',
    url: `https://www.twitch.tv/videos/${id}`,
    thumbnail_url: `https://static-cdn.jtvnw.net/${id}.jpg`,
    duration_seconds: 600,
    language: 'de',
    created_at: new Date('2026-10-26T19:30:00Z'),
    published_at: new Date('2026-10-26T19:30:00Z'),
    ...overrides,
  };
};
