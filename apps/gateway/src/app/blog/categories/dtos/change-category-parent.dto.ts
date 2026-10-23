import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class ChangeCategoryParentDto extends createZodDto(
  z.object({
    parent_id: z.uuid().nullable(),
  }),
) {}
