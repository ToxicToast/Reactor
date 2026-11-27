import { POST_LIMITS, type Post } from '@toxictoast/publisher-domain';
import { EntitySchema } from 'typeorm';
import { PUBLISHER_COLUMNS } from '../constants/index.js';
import { refColumns, remoteIdColumn } from './publisher.columns.js';

export const PostSchema = new EntitySchema<Post>({
  name: 'Post',
  tableName: 'posts',
  columns: {
    ...refColumns,
    account_remote_id: remoteIdColumn,
    url: { type: 'text' },
    title: {
      type: 'varchar',
      length: POST_LIMITS.TITLE_MAX,
      nullable: true,
    },
    published_at: { type: 'timestamptz' },
    duration_seconds: { type: 'double precision', nullable: true },
    origin: { type: 'varchar', length: PUBLISHER_COLUMNS.ORIGIN_LENGTH },
  },
  indices: [
    {
      name: 'idx_posts_account',
      columns: ['platform', 'account_remote_id', 'published_at'],
    },
  ],
});
