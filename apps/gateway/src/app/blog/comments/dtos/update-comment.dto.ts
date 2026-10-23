import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateCommentDto extends createZodDto(
  z.object({
    content: z.string().trim().min(1).max(5000),
  }),
) {}
