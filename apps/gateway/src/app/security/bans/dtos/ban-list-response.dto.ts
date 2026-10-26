import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { BanSchema } from './ban.schema.js';

export class BanListResponseDto extends createZodDto(
  z.object({ bans: z.array(BanSchema) }),
) {}
