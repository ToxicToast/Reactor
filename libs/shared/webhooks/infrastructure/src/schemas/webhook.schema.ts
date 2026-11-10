import { anemicColumns } from '@toxictoast/shared-persistence';
import { WEBHOOK_LIMITS } from '@toxictoast/shared-webhooks-domain';
import { EntitySchema } from 'typeorm';
import { WEBHOOK_COLUMNS } from '../constants/index.js';
import type { WebhookRow } from '../interfaces/index.js';

export const WebhookSchema = new EntitySchema<WebhookRow>({
  name: 'Webhook',
  tableName: 'webhooks',
  columns: {
    ...anemicColumns,
    url: { type: 'varchar', length: WEBHOOK_LIMITS.URL_LENGTH },
    events: { type: 'text', array: true },
    description: {
      type: 'varchar',
      length: WEBHOOK_LIMITS.DESCRIPTION_LENGTH,
      nullable: true,
    },
    active: { type: 'boolean' },
    format: { type: 'varchar', length: WEBHOOK_COLUMNS.CODE_LENGTH },
    secret: { type: 'text' },
  },
});
