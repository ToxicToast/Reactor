import { anemicColumns } from '@toxictoast/shared-persistence';
import { EntitySchema } from 'typeorm';
import type { TwitchFriendRow } from '../interfaces/index.js';

export const TwitchFriendSchema = new EntitySchema<TwitchFriendRow>({
  name: 'TwitchFriend',
  tableName: 'twitch_friends',
  columns: {
    ...anemicColumns,
    twitch_id: { type: 'varchar', length: 32 },
    login: { type: 'varchar', length: 25 },
    display_name: { type: 'varchar', length: 64 },
  },
  uniques: [
    {
      name: 'uq_twitch_friends_twitch_id',
      columns: ['twitch_id'],
    },
  ],
});
