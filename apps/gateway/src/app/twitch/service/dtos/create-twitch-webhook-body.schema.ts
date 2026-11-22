import { z } from 'zod';

/** Nur die Form – Grenzen und erlaubte Formate prüft die Webhook-Domain. */
export const CreateTwitchWebhookBodySchema = z.object({
  url: z.url(),
  events: z.array(z.string().trim().min(1)).min(1),
  description: z.string().trim().optional(),
  format: z.string().trim().min(1).optional(),
});
