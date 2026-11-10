import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TimelinePointSchema } from './timeline-point.schema.js';

export class TimelineResponseDto extends createZodDto(
  z.object({ points: z.array(TimelinePointSchema) }),
) {}
