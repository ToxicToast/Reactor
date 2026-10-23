import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TagSchema } from './tag.schema.js';

export class TagResponseDto extends createZodDto(
  z.object({ tag: TagSchema }),
) {}
