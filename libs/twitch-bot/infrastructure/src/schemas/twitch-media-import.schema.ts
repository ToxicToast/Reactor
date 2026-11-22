import { EntitySchema } from 'typeorm';
import type { TwitchMediaImportRow } from '../interfaces/index.js';

export const TwitchMediaImportSchema = new EntitySchema<TwitchMediaImportRow>({
  name: 'TwitchMediaImport',
  tableName: 'twitch_media_imports',
  columns: {
    channel_id: { type: 'uuid', primary: true },
    imported_at: { type: 'timestamptz' },
  },
});
