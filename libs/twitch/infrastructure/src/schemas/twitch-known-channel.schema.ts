import type { KnownChannel } from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { primaryColumn } from '../functions/index.js';
import { channelColumns } from './twitch.columns.js';

export const TwitchKnownChannelSchema = new EntitySchema<KnownChannel>({
  name: 'TwitchKnownChannel',
  tableName: 'twitch_known_channels',
  columns: {
    ...channelColumns,
    channel_id: primaryColumn(channelColumns.channel_id),
    last_seen_at: { type: 'timestamptz' },
  },
});
