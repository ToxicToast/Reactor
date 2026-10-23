import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MediaSchema } from './media.schema.js';

export class MediaUploadResponseDto extends createZodDto(
  z.object({
    media: MediaSchema,
    upload_url: z.url(),
  }),
) {}
