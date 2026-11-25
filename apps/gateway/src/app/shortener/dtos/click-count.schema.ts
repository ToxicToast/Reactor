import { z } from 'zod';

export const ClickCountSchema = z.object({
  key: z.string(),
  clicks: z.number().int(),
});
