import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LinkSchema } from './link.schema.js';

export class LinkListResponseDto extends createZodDto(
  z.object({ links: z.array(LinkSchema) }),
) {}
