import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LinkStatsSchema } from './link-stats.schema.js';

export class LinkStatsResponseDto extends createZodDto(
  z.object({ stats: LinkStatsSchema }),
) {}
