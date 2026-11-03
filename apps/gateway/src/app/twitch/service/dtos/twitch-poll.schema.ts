import { z } from 'zod';

export const TwitchPollSchema = z.object({
  poll_id: z.string(),
  channel_id: z.string(),
  title: z.string(),
  choices: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      votes: z.number().int(),
    }),
  ),
  status: z.string(),
  started_at: z.string(),
  ends_at: z.string().optional(),
  ended_at: z.string().optional(),
});
