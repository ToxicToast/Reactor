import { z } from 'zod';
import { ClickCountSchema } from './click-count.schema.js';
import { DailyClicksSchema } from './daily-clicks.schema.js';

export const LinkStatsSchema = z.object({
  total: z.number().int(),
  days: z.array(DailyClicksSchema),
  referrers: z.array(ClickCountSchema),
  devices: z.array(ClickCountSchema),
  browsers: z.array(ClickCountSchema),
  countries: z.array(ClickCountSchema),
});
