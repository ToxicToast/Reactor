import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from './paging.schema.js';

export class ListQueryDto extends createZodDto(
  PagingSchema.extend({
    with_deleted: z.stringbool().default(false),
  }),
) {}
