import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CreateCommentDto extends createZodDto(
  z.object({
    content: z.string().trim().min(1).max(5000),
    parent_id: z.uuid().optional(),
  }),
) {}
