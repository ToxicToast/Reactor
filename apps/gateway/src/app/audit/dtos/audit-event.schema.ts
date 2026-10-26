import { z } from 'zod';

export const AuditEventSchema = z.object({
  event_id: z.uuid(),
  event_namespace: z.string(),
  event_name: z.string(),
  event_version: z.number().int(),
  aggregate_id: z.string(),
  occurred_at: z.string(),
  actor: z.object({
    type: z.string(),
    id: z.string().optional(),
    ip: z.string().optional(),
  }),
  correlation_id: z.uuid().optional(),
  payload: z.unknown(),
  recorded_at: z.string(),
});
