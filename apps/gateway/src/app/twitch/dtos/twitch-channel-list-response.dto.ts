import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchChannelSchema } from './twitch-channel.schema.js';

export class TwitchChannelListResponseDto extends createZodDto(
  z.object({ channels: z.array(TwitchChannelSchema) }),
) {}
