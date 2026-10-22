import { EntitySchema } from 'typeorm';
import type { PostCategoryRow } from '../interfaces/index.js';

export const PostCategorySchema = new EntitySchema<PostCategoryRow>({
  name: 'PostCategory',
  tableName: 'post_categories',
  columns: {
    post_id: { type: 'uuid', primary: true },
    category_id: { type: 'uuid', primary: true },
    position: { type: 'int' },
  },
  indices: [{ name: 'idx_post_categories_category', columns: ['category_id'] }],
});
