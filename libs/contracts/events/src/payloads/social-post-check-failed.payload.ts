import type { SocialPlatformV1 } from './social-platform.payload.js';

export interface SocialPostCheckFailedPayloadV1 {
  readonly platform: SocialPlatformV1;
  readonly remote_id: string;
  readonly error: string;
}
