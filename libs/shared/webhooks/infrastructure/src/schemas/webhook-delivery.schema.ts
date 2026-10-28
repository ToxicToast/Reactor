import { anemicColumns } from '@toxictoast/shared-persistence';
import {
  WEBHOOK_LIMITS,
  WebhookDeliveryStatus,
} from '@toxictoast/shared-webhooks-domain';
import { EntitySchema } from 'typeorm';
import { WEBHOOK_COLUMNS } from '../constants/index.js';
import type { WebhookDeliveryRow } from '../interfaces/index.js';

export const WebhookDeliverySchema = new EntitySchema<WebhookDeliveryRow>({
  name: 'WebhookDelivery',
  tableName: 'webhook_deliveries',
  columns: {
    ...anemicColumns,
    webhook_id: { type: 'uuid' },
    event_id: { type: 'varchar', length: WEBHOOK_COLUMNS.EVENT_ID_LENGTH },
    event_key: { type: 'varchar', length: WEBHOOK_LIMITS.EVENT_KEY_LENGTH },
    occurred_at: { type: 'timestamptz' },
    payload: { type: 'jsonb' },
    status: { type: 'varchar', length: WEBHOOK_COLUMNS.CODE_LENGTH },
    attempts: { type: 'int' },
    last_status_code: { type: 'int', nullable: true },
    last_error: {
      type: 'varchar',
      length: WEBHOOK_LIMITS.ERROR_LENGTH,
      nullable: true,
    },
    next_attempt_at: { type: 'timestamptz', nullable: true },
    delivered_at: { type: 'timestamptz', nullable: true },
  },
  uniques: [
    {
      name: 'uq_webhook_deliveries_webhook_event',
      columns: ['webhook_id', 'event_id'],
    },
  ],
  indices: [
    {
      name: 'idx_webhook_deliveries_due',
      columns: ['next_attempt_at'],
      where: `status = '${WebhookDeliveryStatus.PENDING}'`,
    },
    {
      name: 'idx_webhook_deliveries_webhook',
      columns: ['webhook_id', 'created_at'],
    },
  ],
});
