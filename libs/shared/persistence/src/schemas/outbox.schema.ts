import { EntitySchema } from 'typeorm';
import type { OutboxRow } from '../interfaces/index.js';

export const OutboxSchema = new EntitySchema<OutboxRow>({
  name: 'Outbox',
  tableName: 'outbox',
  columns: {
    event_id: { type: 'uuid', primary: true },
    event_namespace: { type: 'varchar', length: 100 },
    event_name: { type: 'varchar', length: 100 },
    event_version: { type: 'int' },
    aggregate_id: { type: 'varchar', length: 64 },
    actor_type: { type: 'varchar', length: 20 },
    actor_id: { type: 'varchar', length: 64, nullable: true },
    actor_ip: { type: 'varchar', length: 45, nullable: true },
    payload: { type: 'jsonb' },
    occurred_at: { type: 'timestamptz' },
    published_at: { type: 'timestamptz', nullable: true },
    attempts: { type: 'int', default: 0 },
  },
  indices: [
    {
      name: 'idx_outbox_unpublished',
      columns: ['occurred_at'],
      where: 'published_at IS NULL',
    },
  ],
});
