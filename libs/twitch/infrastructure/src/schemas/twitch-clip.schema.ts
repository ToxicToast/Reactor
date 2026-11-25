import type { Clip } from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { primaryColumn } from '@toxictoast/shared-persistence';
import {
  externalIdColumn,
  nameColumn,
  titleColumn,
  twitchIdColumn,
} from './twitch.columns.js';

export const TwitchClipSchema = new EntitySchema<Clip>({
  name: 'TwitchClip',
  tableName: 'twitch_clips',
  columns: {
    clip_id: primaryColumn(externalIdColumn),
    channel_id: twitchIdColumn,
    url: { type: 'text' },
    title: titleColumn,
    creator_id: twitchIdColumn,
    creator_name: nameColumn,
    duration_seconds: { type: 'real' },
    thumbnail_url: { type: 'text' },
    vod_id: { ...externalIdColumn, nullable: true },
    vod_offset: { type: 'int', nullable: true },
    created_at: { type: 'timestamptz' },
  },
  indices: [
    {
      name: 'idx_twitch_clips_channel',
      columns: ['channel_id', 'created_at'],
    },
    { name: 'idx_twitch_clips_vod', columns: ['vod_id'] },
  ],
});
