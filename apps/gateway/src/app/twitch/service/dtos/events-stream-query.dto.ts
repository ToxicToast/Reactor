import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TWITCH_ID_PATTERN } from '../constants/index.js';

export class EventsStreamQueryDto extends createZodDto(
  z.object({
    channel_id: z
      .string()
      .regex(TWITCH_ID_PATTERN, 'must be a twitch id')
      .optional(),
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
