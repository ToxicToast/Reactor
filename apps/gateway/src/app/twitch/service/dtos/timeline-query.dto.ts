import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { enumQuery } from '../../../common/functions/index.js';
import {
  TIMELINE_INTERVAL_QUERY,
  TIMELINE_METRIC_QUERY,
} from '../constants/index.js';

export class TimelineQueryDto extends createZodDto(
  z.object({
    metric: enumQuery(TIMELINE_METRIC_QUERY),
    interval: enumQuery(TIMELINE_INTERVAL_QUERY),
    from: z.iso.datetime(),
    to: z.iso.datetime(),
  }),
) {}
