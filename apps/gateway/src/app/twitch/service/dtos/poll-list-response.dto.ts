import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchPollSchema } from './twitch-poll.schema.js';

export class PollListResponseDto extends createZodDto(
  z.object({ polls: z.array(TwitchPollSchema) }),
) {}
