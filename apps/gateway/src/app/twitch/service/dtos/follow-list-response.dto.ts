import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchFollowSchema } from './twitch-follow.schema.js';

export class FollowListResponseDto extends createZodDto(
  z.object({ follows: z.array(TwitchFollowSchema) }),
) {}
