import type { Account } from '@toxictoast/publisher-domain';
import { EntitySchema } from 'typeorm';
import { PUBLISHER_COLUMNS } from '../constants/index.js';
import { refColumns } from './publisher.columns.js';

export const AccountSchema = new EntitySchema<Account>({
  name: 'Account',
  tableName: 'accounts',
  columns: {
    ...refColumns,
    handle: { type: 'varchar', length: PUBLISHER_COLUMNS.HANDLE_LENGTH },
    display_name: {
      type: 'varchar',
      length: PUBLISHER_COLUMNS.NAME_LENGTH,
      nullable: true,
    },
    url: { type: 'text', nullable: true },
  },
});
