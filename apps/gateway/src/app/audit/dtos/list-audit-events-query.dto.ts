import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../common/dtos/index.js';
import { enumQuery } from '../../common/functions/index.js';
import { AUDIT_ACTOR_TYPE_QUERY } from '../constants/index.js';

export class ListAuditEventsQueryDto extends createZodDto(
  PagingSchema.extend({
    correlation_id: z.uuid().optional(),
    actor_id: z.string().trim().min(1).max(64).optional(),
    actor_type: enumQuery(AUDIT_ACTOR_TYPE_QUERY).optional(),
    aggregate_id: z.string().trim().min(1).max(64).optional(),
    namespace: z.string().trim().min(1).max(100).optional(),
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
  }),
) {}
