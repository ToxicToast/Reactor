import { z } from 'zod';

export const LeaderboardEntrySchema = z.object({
  user_id: z.string(),
  user_login: z.string(),
  user_name: z.string(),
  value: z.number().int(),
});
