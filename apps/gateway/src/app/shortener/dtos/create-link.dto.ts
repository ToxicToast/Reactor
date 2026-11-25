import { createZodDto } from 'nestjs-zod';
import { CreateLinkBodySchema } from './create-link-body.schema.js';

export class CreateLinkDto extends createZodDto(CreateLinkBodySchema) {}
