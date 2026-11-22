import { z } from 'zod';

export const TwitchFollowSchema = z.object({
  channel_id: z.string(),
  user_id: z.string(),
  user_login: z.string(),
  user_name: z.string(),
  followed_at: z.string(),
  unfollowed_at: z.string().optional(),
});
