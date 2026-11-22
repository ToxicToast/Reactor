import { EntitySchema } from 'typeorm';
import type { PublicMediaRow } from '../interfaces/index.js';

export const PublicMediaSchema = new EntitySchema<PublicMediaRow>({
  name: 'PublicMedia',
  tableName: 'public_media',
  columns: {
    media_id: { type: 'uuid', primary: true },
    published_at: { type: 'timestamptz' },
  },
});
