import { anemicColumns } from '@toxictoast/shared-persistence';
import { EntitySchema } from 'typeorm';
import type { CategoryRow } from '../interfaces/index.js';

export const CategorySchema = new EntitySchema<CategoryRow>({
  name: 'Category',
  tableName: 'categories',
  columns: {
    ...anemicColumns,
    title: { type: 'text' },
    slug: { type: 'text', unique: true },
    description: { type: 'text', nullable: true },
    parent_id: { type: 'uuid', nullable: true },
  },
  indices: [{ name: 'idx_categories_parent', columns: ['parent_id'] }],
});
