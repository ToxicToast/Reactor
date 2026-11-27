import type { OAuthAuthorization } from '@toxictoast/shared-application';
import type { YouTubeChannelProfile } from './youtube-channel-profile.interface.js';

export interface YouTubeAuthorization extends OAuthAuthorization {
  readonly profile: YouTubeChannelProfile;
}
