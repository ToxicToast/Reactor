import type { HelixChannelFollower } from '@twurple/api';
import type { Follower } from '@toxictoast/twitch-bot-domain';

export const followerFromHelix = (follower: HelixChannelFollower): Follower => {
  return {
    user_id: follower.userId,
    user_login: follower.userName,
    user_name: follower.userDisplayName,
    followed_at: follower.followDate,
  };
};
