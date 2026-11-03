import { createZodDto } from 'nestjs-zod';
import { PagingSchema, RangeSchema } from '../../../common/dtos/index.js';
import { enumQuery } from '../../../common/functions/index.js';
import { LEADERBOARD_METRIC_QUERY } from '../constants/index.js';

export class LeaderboardQueryDto extends createZodDto(
  RangeSchema.extend({
    metric: enumQuery(LEADERBOARD_METRIC_QUERY),
    limit: PagingSchema.shape.limit,
  }),
) {}
