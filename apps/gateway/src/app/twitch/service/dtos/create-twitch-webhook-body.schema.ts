import { z } from 'zod';

export const CreateTwitchWebhookBodySchema = z.object({
  url: z.url(),
  events: z.array(z.string().trim().min(1).max(200)).min(1),
  description: z.string().trim().max(500).optional(),
});
