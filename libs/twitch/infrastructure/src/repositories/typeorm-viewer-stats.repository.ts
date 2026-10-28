import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type {
  DayRange,
  LeaderboardEntry,
  LeaderboardMetric,
  ViewerCounters,
  ViewerRef,
  ViewerStatsRepository,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import {
  columnOf,
  incrementCounters,
  whereWithin,
} from '../functions/index.js';
import type { ViewerDayRow } from '../interfaces/index.js';
import { TwitchViewerDaySchema, TwitchViewerSchema } from '../schemas/index.js';

export class TypeOrmViewerStatsRepository
  extends TypeOrmTableRepository<ViewerDayRow>
  implements ViewerStatsRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchViewerDaySchema);
  }

  async remember(
    channelId: string,
    viewer: ViewerRef,
    seenAt: Date,
  ): Promise<void> {
    await this.repositoryOf(TwitchViewerSchema).upsert(
      {
        channel_id: channelId,
        user_id: viewer.user_id,
        user_login: viewer.user_login,
        user_name: viewer.user_name,
        last_seen_at: seenAt,
      },
      ['channel_id', 'user_id'],
    );
  }

  increment(
    channelId: string,
    userId: string,
    day: string,
    deltas: Partial<ViewerCounters>,
  ): Promise<void> {
    return incrementCounters(
      this.repository(),
      { channel_id: channelId, user_id: userId, day },
      deltas,
    );
  }

  async leaderboard(
    channelId: string,
    metric: LeaderboardMetric,
    range: DayRange,
    limit: number,
  ): Promise<Array<LeaderboardEntry>> {
    const repository = this.repository();
    const total = `SUM(d.${columnOf(repository, metric)})`;

    const query = repository
      .createQueryBuilder('d')
      .innerJoin(
        TwitchViewerSchema.options.name,
        'v',
        'v.channel_id = d.channel_id AND v.user_id = d.user_id',
      )
      .select('d.user_id', 'user_id')
      .addSelect('v.user_login', 'user_login')
      .addSelect('v.user_name', 'user_name')
      .addSelect(total, 'value')
      .where('d.channel_id = :channelId', { channelId })
      .groupBy('d.user_id')
      .addGroupBy('v.user_login')
      .addGroupBy('v.user_name')
      .having(`${total} > 0`)
      .orderBy('value', 'DESC')
      .addOrderBy('v.user_login', 'ASC')
      .limit(limit);

    const rows = await whereWithin(query, 'd.day', range).getRawMany<
      Omit<LeaderboardEntry, 'value'> & { value: string }
    >();
    return rows.map((row) => {
      return { ...row, value: Number(row.value) };
    });
  }
}
