import { z } from 'zod';

export const StatsChannelSchema = z.object({
  channel_id: z.string(),
  login: z.string(),
  display_name: z.string(),
  live: z.boolean(),
  current_session_id: z.uuid().optional(),
  last_session_at: z.string().optional(),
});
