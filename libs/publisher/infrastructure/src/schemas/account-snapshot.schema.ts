import { EntitySchema } from 'typeorm';
import type { AccountSnapshotRow } from '../interfaces/index.js';
import { accountMetricColumns, refColumns } from './publisher.columns.js';

export const AccountSnapshotSchema = new EntitySchema<AccountSnapshotRow>({
  name: 'AccountSnapshot',
  tableName: 'account_snapshots',
  columns: {
    ...refColumns,
    observed_at: { type: 'timestamptz', primary: true },
    ...accountMetricColumns,
  },
});
