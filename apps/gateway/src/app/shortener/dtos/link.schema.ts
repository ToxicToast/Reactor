import { z } from 'zod';

export const LinkSchema = z.object({
  id: z.uuid(),
  target_url: z.string(),
  description: z.string().optional(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});
