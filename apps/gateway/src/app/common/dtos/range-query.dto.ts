import { createZodDto } from 'nestjs-zod';
import { RangeSchema } from './range.schema.js';

export class RangeQueryDto extends createZodDto(RangeSchema) {}
