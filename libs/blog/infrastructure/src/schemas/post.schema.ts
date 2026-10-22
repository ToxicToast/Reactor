import { anemicColumns } from '@toxictoast/shared-persistence';
import { EntitySchema } from 'typeorm';
import type { PostRow } from '../interfaces/index.js';

export const PostSchema = new EntitySchema<PostRow>({
  name: 'Post',
  tableName: 'posts',
  columns: {
    ...anemicColumns,
    author_id: { type: 'uuid' },
    title: { type: 'text' },
    slug: { type: 'text', unique: true },
    excerpt: { type: 'text', nullable: true },
    content: { type: 'text' },
    status: { type: 'varchar', length: 20 },
    featured: { type: 'boolean', default: false },
    reading_time: { type: 'int' },
    blog_image_id: { type: 'uuid', nullable: true },
    hero_image_id: { type: 'uuid', nullable: true },
    published_at: { type: 'timestamptz', nullable: true },
  },
  indices: [
    {
      name: 'idx_posts_status_published',
      columns: ['status', 'published_at'],
    },
  ],
});
