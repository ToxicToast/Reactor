import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class WithDeletedQueryDto extends createZodDto(
  z.object({
    with_deleted: z.stringbool().default(false),
  }),
) {}
