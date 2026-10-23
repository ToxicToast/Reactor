import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateTagDto extends createZodDto(
  z.object({
    title: z.string().trim().min(1).max(100),
  }),
) {}
