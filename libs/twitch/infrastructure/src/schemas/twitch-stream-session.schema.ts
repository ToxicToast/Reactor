import { anemicColumns } from '@toxictoast/shared-persistence';
import { SESSION_COUNTER_KEYS } from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { counterColumns } from '../functions/index.js';
import type { StreamSessionRow } from '../interfaces/index.js';
import { channelColumns, externalIdColumn } from './twitch.columns.js';

export const TwitchStreamSessionSchema = new EntitySchema<StreamSessionRow>({
  name: 'TwitchStreamSession',
  tableName: 'twitch_stream_sessions',
  columns: {
    ...anemicColumns,
    ...channelColumns,
    stream_id: externalIdColumn,
    started_at: { type: 'timestamptz' },
    ended_at: { type: 'timestamptz', nullable: true },
    duration_seconds: { type: 'int', nullable: true },
    ...counterColumns([
      ...SESSION_COUNTER_KEYS,
      'peak_chatters',
      'unique_chatters',
    ]),
  },
  uniques: [
    {
      name: 'uq_twitch_stream_sessions_stream',
      columns: ['channel_id', 'stream_id'],
    },
  ],
  indices: [
    {
      name: 'uq_twitch_stream_sessions_live',
      columns: ['channel_id'],
      unique: true,
      where: 'ended_at IS NULL',
    },
    {
      name: 'idx_twitch_stream_sessions_channel',
      columns: ['channel_id', 'started_at'],
    },
  ],
});
