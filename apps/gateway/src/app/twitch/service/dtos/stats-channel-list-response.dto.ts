import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { StatsChannelSchema } from './stats-channel.schema.js';

export class StatsChannelListResponseDto extends createZodDto(
  z.object({ channels: z.array(StatsChannelSchema) }),
) {}
