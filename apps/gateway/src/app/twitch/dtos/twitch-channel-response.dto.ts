import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchChannelSchema } from './twitch-channel.schema.js';

export class TwitchChannelResponseDto extends createZodDto(
  z.object({ channel: TwitchChannelSchema }),
) {}
