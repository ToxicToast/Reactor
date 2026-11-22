import { EntitySchema } from 'typeorm';
import type { TwitchFollowerRow } from '../interfaces/index.js';

export const TwitchFollowerSchema = new EntitySchema<TwitchFollowerRow>({
  name: 'TwitchFollower',
  tableName: 'twitch_followers',
  columns: {
    channel_id: { type: 'uuid', primary: true },
    user_id: { type: 'varchar', length: 32, primary: true },
    user_login: { type: 'varchar', length: 25 },
    user_name: { type: 'varchar', length: 64 },
    followed_at: { type: 'timestamptz' },
  },
});
