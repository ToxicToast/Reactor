import { EntitySchema } from 'typeorm';
import type { TwitchPublishedClipRow } from '../interfaces/index.js';

export const TwitchPublishedClipSchema =
  new EntitySchema<TwitchPublishedClipRow>({
    name: 'TwitchPublishedClip',
    tableName: 'twitch_published_clips',
    columns: {
      channel_id: { type: 'uuid', primary: true },
      clip_id: { type: 'varchar', length: 128, primary: true },
      published_at: { type: 'timestamptz' },
    },
  });
