import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MediaSchema } from './media.schema.js';

export class MediaListResponseDto extends createZodDto(
  z.object({ media: z.array(MediaSchema) }),
) {}
