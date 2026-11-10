import type { StoredPoll } from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { TWITCH_COLUMNS } from '../constants/index.js';
import { primaryColumn } from '../functions/index.js';
import {
  externalIdColumn,
  titleColumn,
  twitchIdColumn,
} from './twitch.columns.js';

export const TwitchPollSchema = new EntitySchema<StoredPoll>({
  name: 'TwitchPoll',
  tableName: 'twitch_polls',
  columns: {
    poll_id: primaryColumn(externalIdColumn),
    channel_id: twitchIdColumn,
    title: titleColumn,
    choices: { type: 'jsonb' },
    status: { type: 'varchar', length: TWITCH_COLUMNS.CODE_LENGTH },
    started_at: { type: 'timestamptz' },
    ends_at: { type: 'timestamptz', nullable: true },
    ended_at: { type: 'timestamptz', nullable: true },
  },
  indices: [
    { name: 'idx_twitch_polls_channel', columns: ['channel_id', 'started_at'] },
  ],
});
