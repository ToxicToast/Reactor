import type { EntitySchemaColumnOptions } from 'typeorm';
import type { AnemicRow } from '../interfaces/index.js';

export const anemicColumns = {
  id: { type: 'uuid', primary: true },
  created_at: { type: 'timestamptz' },
  updated_at: { type: 'timestamptz', nullable: true },
  deleted_at: { type: 'timestamptz', nullable: true },
} satisfies Record<keyof AnemicRow, EntitySchemaColumnOptions>;
