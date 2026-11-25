import { z } from 'zod';

export const DailyClicksSchema = z.object({
  day: z.string(),
  clicks: z.number().int(),
});
