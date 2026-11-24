import { z } from 'zod';

export const TwitchFriendSchema = z.object({
  id: z.uuid(),
  twitch_id: z.string(),
  login: z.string(),
  display_name: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
