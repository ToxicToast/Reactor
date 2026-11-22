import type { RecordedTwitchEvent } from '@toxictoast/twitch-application';
import { EntitySchema } from 'typeorm';
import { primaryColumn } from '../functions/index.js';
import {
  externalIdColumn,
  keyPartColumn,
  twitchIdColumn,
} from './twitch.columns.js';

export const TwitchEventSchema = new EntitySchema<RecordedTwitchEvent>({
  name: 'TwitchEvent',
  tableName: 'twitch_events',
  columns: {
    event_id: primaryColumn(externalIdColumn),
    topic: keyPartColumn,
    name: keyPartColumn,
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
