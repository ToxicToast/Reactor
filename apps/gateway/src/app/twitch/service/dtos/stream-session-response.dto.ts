import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { StreamSessionSchema } from './stream-session.schema.js';

export class StreamSessionResponseDto extends createZodDto(
  z.object({ session: StreamSessionSchema }),
) {}
