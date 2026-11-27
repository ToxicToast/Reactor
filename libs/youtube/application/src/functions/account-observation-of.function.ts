import {
  SocialPlatforms,
  type SocialAccountObservation,
} from '@toxictoast/shared-social';
import type { YouTubeChannelProfile } from '../interfaces/index.js';
import { channelUrlOf } from './channel-url-of.function.js';

export const accountObservationOf = (
  profile: YouTubeChannelProfile,
): SocialAccountObservation => {
  return {
    platform: SocialPlatforms.YOUTUBE,
    remote_id: profile.youtube_id,
    handle: profile.handle ?? profile.youtube_id,
    display_name: profile.title,
    url: channelUrlOf(profile),
    followers: profile.subscribers,
    media_count: profile.video_count,
  };
};
