import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MediaSchema } from './media.schema.js';

export class MediaResponseDto extends createZodDto(
  z.object({ media: MediaSchema }),
) {}
