import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchVideoSchema } from './twitch-video.schema.js';

export class VideoListResponseDto extends createZodDto(
  z.object({ videos: z.array(TwitchVideoSchema) }),
) {}
