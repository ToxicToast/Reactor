import { z } from 'zod';

export const TagSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});
