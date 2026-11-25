import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LinkSchema } from './link.schema.js';

export class LinkResponseDto extends createZodDto(
  z.object({ link: LinkSchema }),
) {}
