import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateMediaAltTextDto extends createZodDto(
  z.object({
    alt_text: z.string().trim().max(500).nullable(),
  }),
) {}
