import { z } from 'zod';

export const TwitchChannelSchema = z.object({
  id: z.uuid(),
  twitch_id: z.string(),
  login: z.string(),
  display_name: z.string(),
  scopes: z.array(z.string()),
  connected: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
