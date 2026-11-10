import { createZodDto } from 'nestjs-zod';
import { PagingSchema, RangeSchema } from '../../../common/dtos/index.js';

export class TwitchPagedRangeQueryDto extends createZodDto(
  PagingSchema.extend(RangeSchema.shape),
) {}
