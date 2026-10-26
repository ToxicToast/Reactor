import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../../common/dtos/index.js';

export class ListBansQueryDto extends createZodDto(
  PagingSchema.extend({
    active_only: z.stringbool().default(true),
  }),
) {}
