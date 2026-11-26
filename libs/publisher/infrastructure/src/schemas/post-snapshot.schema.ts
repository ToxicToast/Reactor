import { EntitySchema } from 'typeorm';
import type { PostSnapshotRow } from '../interfaces/index.js';
import { postMetricColumns, refColumns } from './publisher.columns.js';

export const PostSnapshotSchema = new EntitySchema<PostSnapshotRow>({
  name: 'PostSnapshot',
  tableName: 'post_snapshots',
  columns: {
    ...refColumns,
    observed_at: { type: 'timestamptz', primary: true },
    ...postMetricColumns,
  },
});
