import type { SocialPlatform } from '../types/index.js';

/** eine remote_id ist nur innerhalb ihrer Plattform eindeutig */
export const socialAggregateId = (
  platform: SocialPlatform,
  remoteId: string,
): string => {
  return `${platform}:${remoteId}`;
};
