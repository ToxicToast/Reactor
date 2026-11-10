import { z } from 'zod';
import { WEBHOOK_FORMATS } from '../constants/index.js';

export const CreateTwitchWebhookBodySchema = z.object({
  url: z.url(),
  events: z.array(z.string().trim().min(1).max(200)).min(1),
  description: z.string().trim().max(500).optional(),
  format: z.enum(WEBHOOK_FORMATS).optional(),
});
