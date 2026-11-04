import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TWITCH_ID_PATTERN } from '../constants/index.js';

export class ChannelIdParamDto extends createZodDto(
  z.object({
    channel_id: z.string().regex(TWITCH_ID_PATTERN, 'must be a twitch id'),
  }),
) {}
