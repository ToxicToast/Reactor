import { EntitySchema } from 'typeorm';
import type { TwitchLiveStreamRow } from '../interfaces/index.js';

export const TwitchLiveStreamSchema = new EntitySchema<TwitchLiveStreamRow>({
  name: 'TwitchLiveStream',
  tableName: 'twitch_live_streams',
  columns: {
    channel_id: { type: 'uuid', primary: true },
    stream_id: { type: 'varchar', length: 64 },
    started_at: { type: 'timestamptz' },
  },
});
