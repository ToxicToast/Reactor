import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CreateLinkBodySchema } from './create-link-body.schema.js';

export class UpdateLinkDto extends createZodDto(
  CreateLinkBodySchema.extend({ active: z.boolean() }),
) {}
