import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class MediaUrlResponseDto extends createZodDto(
  z.object({
    url: z.url(),
    expires_in: z.number().int(),
  }),
) {}
