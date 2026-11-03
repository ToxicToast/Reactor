import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class ChannelIdParamDto extends createZodDto(
  z.object({
    channel_id: z.string().regex(/^\d+$/, 'must be a twitch id'),
  }),
) {}
