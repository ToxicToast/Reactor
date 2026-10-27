import { EntitySchema } from 'typeorm';
import type { TwitchChatterRow } from '../interfaces/index.js';

export const TwitchChatterSchema = new EntitySchema<TwitchChatterRow>({
  name: 'TwitchChatter',
  tableName: 'twitch_chatters',
  columns: {
    channel_id: { type: 'uuid', primary: true },
    user_id: { type: 'varchar', length: 32, primary: true },
    user_login: { type: 'varchar', length: 25 },
    user_name: { type: 'varchar', length: 64 },
  },
});
