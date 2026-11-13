import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class EventsStreamQueryDto extends createZodDto(
  z.object({
    channel_id: z.string().trim().min(1).optional(),
    topics: z
      .string()
      .optional()
      .transform((value) => {
        return (value ?? '')
          .split(',')
          .map((topic) => topic.trim())
          .filter((topic) => topic.length > 0);
      }),
  }),
) {}
