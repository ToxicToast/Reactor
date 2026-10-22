import { anemicColumns } from '@toxictoast/shared-persistence';
import { EntitySchema } from 'typeorm';
import type { TagRow } from '../interfaces/index.js';

export const TagSchema = new EntitySchema<TagRow>({
  name: 'Tag',
  tableName: 'tags',
  columns: {
    ...anemicColumns,
    title: { type: 'text' },
    slug: { type: 'text', unique: true },
  },
});
