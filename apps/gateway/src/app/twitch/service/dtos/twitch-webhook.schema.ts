import { z } from 'zod';
import { WEBHOOK_FORMATS } from '../constants/index.js';

export const TwitchWebhookSchema = z.object({
  id: z.uuid(),
  url: z.string(),
  events: z.array(z.string()),
  description: z.string().optional(),
  active: z.boolean(),
  format: z.enum(WEBHOOK_FORMATS),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
