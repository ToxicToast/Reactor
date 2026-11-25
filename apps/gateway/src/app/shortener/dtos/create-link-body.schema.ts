import { z } from 'zod';

export const CreateLinkBodySchema = z.object({
  target_url: z.string().trim().min(1),
  description: z.string().trim().optional(),
});
