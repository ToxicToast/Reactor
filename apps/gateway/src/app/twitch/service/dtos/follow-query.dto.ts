import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../../common/dtos/index.js';
import { enumQuery } from '../../../common/functions/index.js';
import { FOLLOW_STATE_QUERY } from '../constants/index.js';

export class FollowQueryDto extends createZodDto(
  PagingSchema.extend({
    user_id: z.string().trim().min(1).optional(),
    state: enumQuery(FOLLOW_STATE_QUERY).optional(),
  }),
) {}
