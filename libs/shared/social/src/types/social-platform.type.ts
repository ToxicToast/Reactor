import type { SocialPlatforms } from '../constants/index.js';

export type SocialPlatform =
  (typeof SocialPlatforms)[keyof typeof SocialPlatforms];
