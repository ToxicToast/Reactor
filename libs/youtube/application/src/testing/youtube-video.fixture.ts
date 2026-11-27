import type { YouTubeVideo } from '../interfaces/index.js';

export const youtubeVideo = (
  id: string,
  overrides: Partial<YouTubeVideo> = {},
): YouTubeVideo => {
  return {
    video_id: id,
    title: 'Der Flamer war vielleicht eine dumme Idee',
    published_at: new Date('2026-11-20T18:00:00Z'),
    duration_seconds: 42,
    views: 100,
    likes: 5,
    comments: 1,
    ...overrides,
  };
};
