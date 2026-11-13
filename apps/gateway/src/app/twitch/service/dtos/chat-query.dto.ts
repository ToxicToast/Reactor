import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema, RangeSchema } from '../../../common/dtos/index.js';

export class ChatQueryDto extends createZodDto(
  PagingSchema.extend(RangeSchema.shape).extend({
    user_id: z.string().trim().min(1).optional(),
    session_id: z.uuid().optional(),
    q: z.string().trim().min(1).max(200).optional(),
    include_deleted: z.stringbool().default(false),
  }),
) {}
