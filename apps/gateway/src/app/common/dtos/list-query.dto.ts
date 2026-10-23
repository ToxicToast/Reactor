import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class ListQueryDto extends createZodDto(
  z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    with_deleted: z.stringbool().default(false),
  }),
) {}
