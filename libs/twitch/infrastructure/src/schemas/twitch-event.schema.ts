import type { RecordedTwitchEvent } from '@toxictoast/twitch-application';
import { EntitySchema } from 'typeorm';
import { TWITCH_COLUMNS } from '../constants/index.js';
import { primaryColumn } from '../functions/index.js';
import { externalIdColumn, twitchIdColumn } from './twitch.columns.js';

const keyPart = {
  type: 'varchar',
  length: TWITCH_COLUMNS.KEY_PART_LENGTH,
} as const;

export const TwitchEventSchema = new EntitySchema<RecordedTwitchEvent>({
  name: 'TwitchEvent',
  tableName: 'twitch_events',
  columns: {
    event_id: primaryColumn(externalIdColumn),
    topic: keyPart,
    name: keyPart,
    channel_id: twitchIdColumn,
    occurred_at: { type: 'timestamptz' },
    payload: { type: 'jsonb' },
  },
  indices: [
    {
      name: 'idx_twitch_events_channel',
      columns: ['channel_id', 'occurred_at'],
    },
  ],
});
