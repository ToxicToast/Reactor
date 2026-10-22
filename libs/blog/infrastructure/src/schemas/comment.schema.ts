import { anemicColumns } from '@toxictoast/shared-persistence';
import { EntitySchema } from 'typeorm';
import type { CommentRow } from '../interfaces/index.js';

export const CommentSchema = new EntitySchema<CommentRow>({
  name: 'Comment',
  tableName: 'comments',
  columns: {
    ...anemicColumns,
    post_id: { type: 'uuid' },
    parent_id: { type: 'uuid', nullable: true },
    author_id: { type: 'uuid' },
    content: { type: 'text' },
    status: { type: 'varchar', length: 20 },
    moderation_note: { type: 'text', nullable: true },
    moderated_by: { type: 'varchar', length: 20, nullable: true },
    moderated_at: { type: 'timestamptz', nullable: true },
  },
  indices: [
    { name: 'idx_comments_post_status', columns: ['post_id', 'status'] },
    { name: 'idx_comments_status_created', columns: ['status', 'created_at'] },
  ],
});
