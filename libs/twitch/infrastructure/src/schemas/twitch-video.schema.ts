import type { Video } from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { primaryColumn } from '@toxictoast/shared-persistence';
import {
  codeColumn,
  externalIdColumn,
  titleColumn,
  twitchIdColumn,
} from './twitch.columns.js';

export const TwitchVideoSchema = new EntitySchema<Video>({
  name: 'TwitchVideo',
  tableName: 'twitch_videos',
  columns: {
    video_id: primaryColumn(externalIdColumn),
    channel_id: twitchIdColumn,
    stream_id: { ...externalIdColumn, nullable: true },
    type: { ...codeColumn, nullable: false },
    title: titleColumn,
    description: { type: 'text' },
    url: { type: 'text' },
    thumbnail_url: { type: 'text' },
    duration_seconds: { type: 'int' },
    language: { ...codeColumn, nullable: false },
    created_at: { type: 'timestamptz' },
    published_at: { type: 'timestamptz' },
  },
  indices: [
    {
      name: 'idx_twitch_videos_channel',
      columns: ['channel_id', 'created_at'],
    },
    { name: 'idx_twitch_videos_stream', columns: ['stream_id'] },
  ],
});
