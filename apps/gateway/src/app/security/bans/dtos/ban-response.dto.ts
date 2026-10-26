import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { BanSchema } from './ban.schema.js';

export class BanResponseDto extends createZodDto(
  z.object({ ban: BanSchema }),
) {}
