import { z } from 'zod';

export const TwitchWebhookSchema = z.object({
  id: z.uuid(),
  url: z.string(),
  events: z.array(z.string()),
  description: z.string().optional(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
