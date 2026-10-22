import { anemicColumns } from '@toxictoast/shared-persistence';
import { EntitySchema } from 'typeorm';
import type { MediaRow } from '../interfaces/index.js';

export const MediaSchema = new EntitySchema<MediaRow>({
  name: 'Media',
  tableName: 'media',
  columns: {
    ...anemicColumns,
    object_key: { type: 'text', unique: true },
    filename: { type: 'text' },
    mime_type: { type: 'varchar', length: 100 },
    size: { type: 'int' },
    alt_text: { type: 'text', nullable: true },
    status: { type: 'varchar', length: 20 },
  },
  indices: [
    { name: 'idx_media_status_created', columns: ['status', 'created_at'] },
  ],
});
