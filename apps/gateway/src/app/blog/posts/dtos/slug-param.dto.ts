import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class SlugParamDto extends createZodDto(
  z.object({
    slug: z.string().trim().min(1).max(200),
  }),
) {}
