import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { StreamSessionSchema } from './stream-session.schema.js';

export class StreamSessionListResponseDto extends createZodDto(
  z.object({ sessions: z.array(StreamSessionSchema) }),
) {}
