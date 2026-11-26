import {
  Platforms,
  PostOrigins,
  type Post,
} from '@toxictoast/publisher-domain';
import { TEST_NOW } from './test-domain-context.js';

export const post = (remoteId: string, overrides: Partial<Post> = {}): Post => {
  return {
    platform: Platforms.YOUTUBE,
    remote_id: remoteId,
    account_remote_id: 'channel-1',
    url: `https://www.youtube.com/shorts/${remoteId}`,
    title: 'Der Flamer war vielleicht eine dumme Idee',
    published_at: TEST_NOW,
    duration_seconds: 42,
    origin: PostOrigins.IMPORTED,
    ...overrides,
  };
};
