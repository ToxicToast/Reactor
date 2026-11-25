import {
  CHANNEL_DAY_COUNTER_KEYS,
  FOLLOWER_TOTAL_METRIC,
  PEAK_CHATTERS_METRIC,
} from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { counterColumns, primaryColumn } from '@toxictoast/shared-persistence';
import type { ChannelDayRow } from '../interfaces/index.js';
import { dayColumn, twitchIdColumn } from './twitch.columns.js';

export const TwitchChannelDaySchema = new EntitySchema<ChannelDayRow>({
  name: 'TwitchChannelDay',
  tableName: 'twitch_channel_days',
  columns: {
    channel_id: primaryColumn(twitchIdColumn),
    day: primaryColumn(dayColumn),
    ...counterColumns([...CHANNEL_DAY_COUNTER_KEYS, PEAK_CHATTERS_METRIC]),
    /** null = an dem Tag nicht gemessen; 0 wäre ein echter Wert */
    [FOLLOWER_TOTAL_METRIC]: { type: 'int', nullable: true },
  },
});
