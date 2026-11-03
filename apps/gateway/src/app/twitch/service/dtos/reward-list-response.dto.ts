import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { RewardStatSchema } from './reward-stat.schema.js';

export class RewardListResponseDto extends createZodDto(
  z.object({ rewards: z.array(RewardStatSchema) }),
) {}
