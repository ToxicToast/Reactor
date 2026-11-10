import { EntitySchema } from 'typeorm';
import { primaryColumn } from '../functions/index.js';
import type { ChatterDayRow } from '../interfaces/index.js';
import { dayColumn, twitchIdColumn } from './twitch.columns.js';

export const TwitchChatterDaySchema = new EntitySchema<ChatterDayRow>({
  name: 'TwitchChatterDay',
  tableName: 'twitch_chatter_days',
  columns: {
    channel_id: primaryColumn(twitchIdColumn),
    day: primaryColumn(dayColumn),
    user_id: primaryColumn(twitchIdColumn),
  },
});
