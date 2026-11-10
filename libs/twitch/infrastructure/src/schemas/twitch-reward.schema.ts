import { EntitySchema } from 'typeorm';
import { primaryColumn } from '../functions/index.js';
import type { RewardRow } from '../interfaces/index.js';
import {
  externalIdColumn,
  titleColumn,
  twitchIdColumn,
} from './twitch.columns.js';

export const TwitchRewardSchema = new EntitySchema<RewardRow>({
  name: 'TwitchReward',
  tableName: 'twitch_rewards',
  columns: {
    channel_id: primaryColumn(twitchIdColumn),
    reward_id: primaryColumn(externalIdColumn),
    title: titleColumn,
    cost: { type: 'int' },
  },
});
