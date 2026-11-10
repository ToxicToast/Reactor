import { EntitySchema } from 'typeorm';
import { primaryColumn } from '../functions/index.js';
import type { PresenceRow } from '../interfaces/index.js';
import { twitchIdColumn } from './twitch.columns.js';

export const TwitchPresenceSchema = new EntitySchema<PresenceRow>({
  name: 'TwitchPresence',
  tableName: 'twitch_presence',
  columns: {
    channel_id: primaryColumn(twitchIdColumn),
    user_id: primaryColumn(twitchIdColumn),
    joined_at: { type: 'timestamptz' },
  },
});
