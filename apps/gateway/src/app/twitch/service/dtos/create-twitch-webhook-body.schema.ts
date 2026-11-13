import { z } from 'zod';
import { WEBHOOK_FORMATS } from '../constants/index.js';

/** Nur die Form – Grenzen wie Längen und Anzahl prüft die Webhook-Domain. */
export const CreateTwitchWebhookBodySchema = z.object({
  url: z.url(),
  events: z.array(z.string().trim().min(1)).min(1),
  description: z.string().trim().optional(),
  format: z.enum(WEBHOOK_FORMATS).optional(),
});
