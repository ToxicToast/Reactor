import type { Follow } from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { primaryColumn } from '@toxictoast/shared-persistence';
import { twitchIdColumn, viewerColumns } from './twitch.columns.js';

export const TwitchFollowSchema = new EntitySchema<Follow>({
  name: 'TwitchFollow',
  tableName: 'twitch_follows',
  columns: {
    channel_id: primaryColumn(twitchIdColumn),
    ...viewerColumns,
    user_id: primaryColumn(twitchIdColumn),
    followed_at: { type: 'timestamptz', primary: true },
    unfollowed_at: { type: 'timestamptz', nullable: true },
  },
  indices: [
    {
      name: 'uq_twitch_follows_open',
      columns: ['channel_id', 'user_id'],
      unique: true,
      where: '"unfollowed_at" IS NULL',
    },
    {
      name: 'idx_twitch_follows_channel',
      columns: ['channel_id', 'followed_at'],
    },
  ],
});
