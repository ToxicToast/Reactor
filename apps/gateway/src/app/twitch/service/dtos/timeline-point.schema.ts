import { z } from 'zod';

export const TimelinePointSchema = z.object({
  bucket_start: z.string(),
  value: z.number().int(),
});
