import { createZodDto } from 'nestjs-zod';
import { RangeSchema } from '../../../common/dtos/index.js';

export class TwitchRangeQueryDto extends createZodDto(RangeSchema) {}
