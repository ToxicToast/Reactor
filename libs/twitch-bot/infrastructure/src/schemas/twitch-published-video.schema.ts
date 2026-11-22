import { EntitySchema } from 'typeorm';
import type { TwitchPublishedVideoRow } from '../interfaces/index.js';

export const TwitchPublishedVideoSchema =
  new EntitySchema<TwitchPublishedVideoRow>({
    name: 'TwitchPublishedVideo',
    tableName: 'twitch_published_videos',
    columns: {
      channel_id: { type: 'uuid', primary: true },
      video_id: { type: 'varchar', length: 64, primary: true },
      published_at: { type: 'timestamptz' },
    },
  });
