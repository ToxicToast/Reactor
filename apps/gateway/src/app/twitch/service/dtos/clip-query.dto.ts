import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../../common/dtos/index.js';

export class ClipQueryDto extends createZodDto(
  PagingSchema.extend({
    vod_id: z.string().trim().min(1).optional(),
  }),
) {}
