import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class RequestMediaUploadDto extends createZodDto(
  z.object({
    filename: z.string().trim().min(1).max(255),
    mime_type: z.string().trim().min(1).max(100),
    size: z.number().int().positive(),
    alt_text: z.string().trim().max(500).optional(),
  }),
) {}
