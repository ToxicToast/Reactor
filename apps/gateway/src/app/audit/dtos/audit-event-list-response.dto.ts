import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AuditEventSchema } from './audit-event.schema.js';

export class AuditEventListResponseDto extends createZodDto(
  z.object({ events: z.array(AuditEventSchema) }),
) {}
