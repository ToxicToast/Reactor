import { VIEWER_COUNTER_KEYS } from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { counterColumns, primaryColumn } from '../functions/index.js';
import type { ViewerDayRow } from '../interfaces/index.js';
import { dayColumn, twitchIdColumn } from './twitch.columns.js';

export const TwitchViewerDaySchema = new EntitySchema<ViewerDayRow>({
  name: 'TwitchViewerDay',
  tableName: 'twitch_viewer_days',
  columns: {
    channel_id: primaryColumn(twitchIdColumn),
    user_id: primaryColumn(twitchIdColumn),
    day: primaryColumn(dayColumn),
    ...counterColumns(VIEWER_COUNTER_KEYS),
  },
  indices: [
    { name: 'idx_twitch_viewer_days_channel', columns: ['channel_id', 'day'] },
  ],
});
