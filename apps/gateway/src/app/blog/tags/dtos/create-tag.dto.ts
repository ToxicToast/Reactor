import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CreateTagDto extends createZodDto(
  z.object({
    title: z.string().trim().min(1).max(100),
  }),
) {}
