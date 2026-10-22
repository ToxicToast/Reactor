import { EntitySchema } from 'typeorm';
import type { PostTagRow } from '../interfaces/index.js';

export const PostTagSchema = new EntitySchema<PostTagRow>({
  name: 'PostTag',
  tableName: 'post_tags',
  columns: {
    post_id: { type: 'uuid', primary: true },
    tag_id: { type: 'uuid', primary: true },
    position: { type: 'int' },
  },
  indices: [{ name: 'idx_post_tags_tag', columns: ['tag_id'] }],
});
