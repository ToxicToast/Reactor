import { EntitySchema } from 'typeorm';
import type { AuditEventRow } from '../interfaces/index.js';

export const AuditEventSchema = new EntitySchema<AuditEventRow>({
  name: 'AuditEvent',
  tableName: 'audit_events',
  columns: {
    event_id: { type: 'uuid', primary: true },
    event_namespace: { type: 'varchar', length: 100 },
    event_name: { type: 'varchar', length: 100 },
    event_version: { type: 'int' },
    aggregate_id: { type: 'varchar', length: 64 },
    occurred_at: { type: 'timestamptz' },
    actor_type: { type: 'varchar', length: 20 },
    actor_id: { type: 'varchar', length: 64, nullable: true },
    actor_ip: { type: 'varchar', length: 45, nullable: true },
    correlation_id: { type: 'uuid', nullable: true },
    payload: { type: 'jsonb' },
    recorded_at: { type: 'timestamptz' },
  },
  indices: [
    { name: 'idx_audit_events_occurred', columns: ['occurred_at'] },
    { name: 'idx_audit_events_correlation', columns: ['correlation_id'] },
    { name: 'idx_audit_events_actor', columns: ['actor_id', 'occurred_at'] },
    {
      name: 'idx_audit_events_aggregate',
      columns: ['aggregate_id', 'occurred_at'],
    },
    {
      name: 'idx_audit_events_namespace',
      columns: ['event_namespace', 'occurred_at'],
    },
  ],
});
