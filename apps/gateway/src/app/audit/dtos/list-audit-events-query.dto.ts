import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../common/dtos/index.js';

export class ListAuditEventsQueryDto extends createZodDto(
  PagingSchema.extend({
    correlation_id: z.uuid().optional(),
    actor_id: z.string().trim().min(1).max(64).optional(),
    actor_type: z
      .enum(['user', 'ai', 'system', 'anonymous', 'unknown'])
      .optional(),
    aggregate_id: z.string().trim().min(1).max(64).optional(),
    namespace: z.string().trim().min(1).max(100).optional(),
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
  }),
) {}
