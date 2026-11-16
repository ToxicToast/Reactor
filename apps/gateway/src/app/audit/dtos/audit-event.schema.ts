import { z } from 'zod';
import { enumKeys } from '../../common/functions/index.js';
import { AUDIT_ACTOR_TYPE_QUERY } from '../constants/index.js';

export const AuditEventSchema = z.object({
  event_id: z.uuid(),
  event_namespace: z.string(),
  event_name: z.string(),
  event_version: z.number().int(),
  aggregate_id: z.string(),
  occurred_at: z.string(),
  actor: z.object({
    type: z.enum(enumKeys(AUDIT_ACTOR_TYPE_QUERY)),
    id: z.string().optional(),
    ip: z.string().optional(),
  }),
  correlation_id: z.uuid().optional(),
  payload: z.unknown(),
  recorded_at: z.string(),
});
