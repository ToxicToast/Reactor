import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type {
  Follower,
  FollowerRepository,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import type { DataSource } from 'typeorm';
import { CHATTER_INSERT_CHUNK } from '../constants/index.js';
import type { TwitchFollowerRow } from '../interfaces/index.js';
import { TwitchFollowerSchema } from '../schemas/index.js';

export class TypeOrmFollowerRepository
  extends TypeOrmTableRepository<TwitchFollowerRow>
  implements FollowerRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchFollowerSchema);
  }

  async findByChannel(channelId: TwitchChannelId): Promise<Array<Follower>> {
    const rows = await this.repository().find({
      where: { channel_id: channelId },
      order: { followed_at: 'ASC' },
    });
    return rows.map((row) => {
      return {
        user_id: row.user_id,
        user_login: row.user_login,
        user_name: row.user_name,
        followed_at: row.followed_at,
      };
    });
  }

  async replace(
    channelId: TwitchChannelId,
    followers: ReadonlyArray<Follower>,
  ): Promise<void> {
    const repository = this.repository();
    await repository.delete({ channel_id: channelId });

    const rows = followers.map((follower) => {
      return { channel_id: channelId, ...follower };
    });
    for (let start = 0; start < rows.length; start += CHATTER_INSERT_CHUNK) {
      await repository.insert(rows.slice(start, start + CHATTER_INSERT_CHUNK));
    }
  }
}
