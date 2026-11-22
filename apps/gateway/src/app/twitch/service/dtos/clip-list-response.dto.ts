import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchClipSchema } from './twitch-clip.schema.js';

export class ClipListResponseDto extends createZodDto(
  z.object({ clips: z.array(TwitchClipSchema) }),
) {}
