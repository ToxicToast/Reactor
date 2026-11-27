import type { SocialPlatform } from '../types/index.js';

export interface SocialPostFailure {
  readonly platform: SocialPlatform;
  readonly remote_id: string;
  readonly error: string;
}
