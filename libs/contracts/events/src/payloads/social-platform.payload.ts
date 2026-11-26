import type { SocialPlatforms } from '../constants/index.js';

export type SocialPlatformV1 =
  (typeof SocialPlatforms)[keyof typeof SocialPlatforms];
