import { z } from 'zod';

export const BanSchema = z.object({
  id: z.uuid(),
  ip: z.string(),
  level: z.number().int(),
  failed_attempts: z.number().int(),
  banned_until: z.string(),
  lifted_at: z.string().optional(),
  lifted_by: z.uuid().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
