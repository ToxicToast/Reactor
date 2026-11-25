import {
  insertOnce,
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Optional } from '@toxictoast/shared-types';
import {
  FollowStates,
  type Follow,
  type FollowFilter,
  type FollowRepository,
  type ViewerRef,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import { TwitchFollowSchema } from '../schemas/index.js';

export class TypeOrmFollowRepository
  extends TypeOrmTableRepository<Follow>
  implements FollowRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchFollowSchema);
  }

  /** ON CONFLICT DO NOTHING greift auch beim partiellen Index auf den offenen Follow */
  follow(
    channelId: string,
    viewer: ViewerRef,
    followedAt: Date,
  ): Promise<boolean> {
    return insertOnce(this.repository(), {
      channel_id: channelId,
      user_id: viewer.user_id,
      user_login: viewer.user_login,
      user_name: viewer.user_name,
      followed_at: followedAt,
      unfollowed_at: null,
    });
  }

  async unfollow(
    channelId: string,
    userId: string,
    at: Date,
  ): Promise<boolean> {
    const result = await this.repository()
      .createQueryBuilder()
      .update()
      .set({ unfollowed_at: at })
      .where(
        'channel_id = :channelId AND user_id = :userId AND unfollowed_at IS NULL',
        { channelId, userId },
      )
      .execute();
    return (result.affected ?? 0) > 0;
  }

  list(
    filter: FollowFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Follow>> {
    const query = this.repository()
      .createQueryBuilder('f')
      .where('f.channel_id = :channelId', { channelId: filter.channel_id });
    if (filter.user_id !== null) {
      query.andWhere('f.user_id = :userId', { userId: filter.user_id });
    }
    if (filter.state === FollowStates.ACTIVE) {
      query.andWhere('f.unfollowed_at IS NULL');
    }
    if (filter.state === FollowStates.ENDED) {
      query.andWhere('f.unfollowed_at IS NOT NULL');
    }
    return query
      .orderBy('f.followed_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }
}
