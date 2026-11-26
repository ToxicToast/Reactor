import { POST_CHECK_LIMITS } from '@toxictoast/publisher-domain';
import { EntitySchema } from 'typeorm';
import type { PostCheckRow } from '../interfaces/index.js';
import { refColumns } from './publisher.columns.js';

export const PostCheckSchema = new EntitySchema<PostCheckRow>({
  name: 'PostCheck',
  tableName: 'post_checks',
  columns: {
    ...refColumns,
    checked_at: { type: 'timestamptz' },
    failures: { type: 'int' },
    last_error: {
      type: 'varchar',
      length: POST_CHECK_LIMITS.ERROR_MAX,
      nullable: true,
    },
  },
});
