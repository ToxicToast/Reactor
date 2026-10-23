import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TagSchema } from './tag.schema.js';

export class TagListResponseDto extends createZodDto(
  z.object({ tags: z.array(TagSchema) }),
) {}
