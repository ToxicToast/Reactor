import {
  columnOf,
  incrementCounters,
  raiseCounter,
  TypeOrmTableRepository,
  whereWithin,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import {
  GAUGE_METRICS,
  PEAK_CHATTERS_METRIC,
  type ChannelDayCounters,
  type ChannelStatsRepository,
  type ClosedDayRange,
  type FollowerTotal,
  type StatsIntervalValue,
  type TimelineMetric,
  type TimelinePoint,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import type { ChannelDayRow } from '../interfaces/index.js';
import { TwitchChannelDaySchema } from '../schemas/index.js';

export class TypeOrmChannelStatsRepository
  extends TypeOrmTableRepository<ChannelDayRow>
  implements ChannelStatsRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchChannelDaySchema);
  }

  increment(
    channelId: string,
    day: string,
    deltas: Partial<ChannelDayCounters>,
  ): Promise<void> {
    return incrementCounters(
      this.repository(),
      { channel_id: channelId, day },
      deltas,
    );
  }

  raisePeak(channelId: string, day: string, chatters: number): Promise<void> {
    return raiseCounter(
      this.repository(),
      { channel_id: channelId, day },
      PEAK_CHATTERS_METRIC,
      chatters,
    );
  }

  /** upsert nur auf follower_total; die Zähler des Tages bleiben unangetastet */
  async recordFollowerTotal(
    channelId: string,
    day: string,
    total: number,
  ): Promise<void> {
    await this.repository().upsert(
      { channel_id: channelId, day, follower_total: total },
      ['channel_id', 'day'],
    );
  }

  async latestFollowerTotal(
    channelId: string,
  ): Promise<Nullable<FollowerTotal>> {
    const row = await this.repository()
      .createQueryBuilder('d')
      .where('d.channel_id = :channelId', { channelId })
      .andWhere('d.follower_total IS NOT NULL')
      .orderBy('d.day', 'DESC')
      .getOne();
    if (!row || row.follower_total === null) {
      return null;
    }
    return { day: row.day, total: row.follower_total };
  }

  async timeline(
    channelId: string,
    metric: TimelineMetric,
    interval: StatsIntervalValue,
    range: ClosedDayRange,
  ): Promise<Array<TimelinePoint>> {
    const repository = this.repository();
    const column = `d.${columnOf(repository, metric)}`;
    const aggregate = GAUGE_METRICS.has(metric)
      ? `MAX(${column})`
      : `SUM(${column})`;

    const query = repository
      .createQueryBuilder('d')
      .select(
        `to_char(date_trunc(:interval, CAST(d.day AS timestamp)), 'YYYY-MM-DD')`,
        'bucket_start',
      )
      .addSelect(aggregate, 'value')
      .where('d.channel_id = :channelId', { channelId })
      .groupBy('bucket_start')
      .orderBy('bucket_start', 'ASC')
      .setParameter('interval', interval);

    const rows = await whereWithin(query, 'd.day', range).getRawMany<{
      bucket_start: string;
      value: string;
    }>();
    return rows.map((row) => {
      return { bucket_start: row.bucket_start, value: Number(row.value) };
    });
  }
}
