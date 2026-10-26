import { anemicColumns } from '@toxictoast/shared-persistence';
import { EntitySchema } from 'typeorm';
import type { TwitchChannelRow } from '../interfaces/index.js';

export const TwitchChannelSchema = new EntitySchema<TwitchChannelRow>({
  name: 'TwitchChannel',
  tableName: 'twitch_channels',
  columns: {
    ...anemicColumns,
    twitch_id: { type: 'varchar', length: 32 },
    login: { type: 'varchar', length: 25 },
    display_name: { type: 'varchar', length: 64 },
    scopes: { type: 'text', array: true },
    connected: { type: 'boolean' },
  },
  uniques: [
    {
      name: 'uq_twitch_channels_twitch_id',
      columns: ['twitch_id'],
    },
  ],
});
