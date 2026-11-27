import type { PostMetrics } from '@toxictoast/publisher-domain';

export const postMetrics = (
  overrides: Partial<PostMetrics> = {},
): PostMetrics => {
  return {
    views: 100,
    likes: 5,
    comments: 1,
    shares: null,
    saves: null,
    reach: null,
    avg_watch_time_ms: null,
    total_watch_time_ms: null,
    avg_view_percentage: null,
    followers_gained: null,
    ...overrides,
  };
};
