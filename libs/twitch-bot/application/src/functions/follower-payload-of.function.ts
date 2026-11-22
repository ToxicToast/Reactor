import type { Follower } from '@toxictoast/twitch-bot-domain';
import type { FollowerPayload } from '../interfaces/index.js';

export const followerPayloadOf = (follower: Follower): FollowerPayload => {
  return {
    user_id: follower.user_id,
    user_login: follower.user_login,
    user_name: follower.user_name,
    followed_at: follower.followed_at.toISOString(),
  };
};
