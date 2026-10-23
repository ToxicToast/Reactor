import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class PublishPostDto extends createZodDto(
  z.object({
    published_at: z.iso.datetime().optional(),
  }),
) {}
