import { EntitySchema } from 'typeorm';
import { counterColumns, primaryColumn } from '../functions/index.js';
import type { RewardDayRow } from '../interfaces/index.js';
import {
  dayColumn,
  externalIdColumn,
  twitchIdColumn,
} from './twitch.columns.js';

export const TwitchRewardDaySchema = new EntitySchema<RewardDayRow>({
  name: 'TwitchRewardDay',
  tableName: 'twitch_reward_days',
  columns: {
    channel_id: primaryColumn(twitchIdColumn),
    reward_id: primaryColumn(externalIdColumn),
    day: primaryColumn(dayColumn),
    ...counterColumns(['redemptions', 'points_spent']),
  },
});
