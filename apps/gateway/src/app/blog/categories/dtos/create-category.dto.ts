import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CreateCategoryDto extends createZodDto(
  z.object({
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional(),
    parent_id: z.uuid().optional(),
  }),
) {}
