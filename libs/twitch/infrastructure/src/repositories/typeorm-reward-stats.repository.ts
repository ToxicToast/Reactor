import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type {
  DayRange,
  RewardRef,
  RewardStat,
  RewardStatsRepository,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import { incrementCounters, whereWithin } from '../functions/index.js';
import type { RewardDayRow } from '../interfaces/index.js';
import { TwitchRewardDaySchema, TwitchRewardSchema } from '../schemas/index.js';

interface RawRewardStat {
  reward_id: string;
  title: string;
  cost: number;
  redemptions: string;
  points_spent: string;
}

export class TypeOrmRewardStatsRepository
  extends TypeOrmTableRepository<RewardDayRow>
  implements RewardStatsRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchRewardDaySchema);
  }

  async increment(
    channelId: string,
    reward: RewardRef,
    day: string,
  ): Promise<void> {
    await this.repositoryOf(TwitchRewardSchema).upsert(
      {
        channel_id: channelId,
        reward_id: reward.reward_id,
        title: reward.title,
        cost: reward.cost,
      },
      ['channel_id', 'reward_id'],
    );
    await incrementCounters(
      this.repository(),
      { channel_id: channelId, reward_id: reward.reward_id, day },
      { redemptions: 1, points_spent: reward.cost },
    );
  }

  async list(channelId: string, range: DayRange): Promise<Array<RewardStat>> {
    const query = this.repository()
      .createQueryBuilder('d')
      .innerJoin(
        TwitchRewardSchema.options.name,
        'r',
        'r.channel_id = d.channel_id AND r.reward_id = d.reward_id',
      )
      .select('r.reward_id', 'reward_id')
      .addSelect('r.title', 'title')
      .addSelect('r.cost', 'cost')
      .addSelect('SUM(d.redemptions)', 'redemptions')
      .addSelect('SUM(d.points_spent)', 'points_spent')
      .where('d.channel_id = :channelId', { channelId })
      .groupBy('r.reward_id')
      .addGroupBy('r.title')
      .addGroupBy('r.cost')
      .orderBy('redemptions', 'DESC');

    const rows = await whereWithin(
      query,
      'd.day',
      range,
    ).getRawMany<RawRewardStat>();
    return rows.map((row) => {
      return {
        reward_id: row.reward_id,
        title: row.title,
        cost: row.cost,
        redemptions: Number(row.redemptions),
        points_spent: Number(row.points_spent),
      };
    });
  }
}
