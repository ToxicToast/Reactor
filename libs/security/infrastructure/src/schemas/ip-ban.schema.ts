import { anemicColumns } from '@toxictoast/shared-persistence';
import { EntitySchema } from 'typeorm';
import type { IpBanRow } from '../interfaces/index.js';

export const IpBanSchema = new EntitySchema<IpBanRow>({
  name: 'IpBan',
  tableName: 'ip_bans',
  columns: {
    ...anemicColumns,
    ip: { type: 'varchar', length: 45 },
    level: { type: 'int' },
    failed_attempts: { type: 'int' },
    banned_until: { type: 'timestamptz' },
    lifted_at: { type: 'timestamptz', nullable: true },
    lifted_by: { type: 'varchar', length: 64, nullable: true },
  },
  indices: [
    {
      name: 'idx_ip_bans_ip_created',
      columns: ['ip', 'created_at'],
    },
  ],
});
