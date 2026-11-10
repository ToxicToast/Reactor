import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Optional } from '@toxictoast/shared-types';
import type {
  PollRepository,
  PollSnapshot,
  StatsRange,
  StoredPoll,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import { whereWithin } from '../functions/index.js';
import { TwitchPollSchema } from '../schemas/index.js';

export class TypeOrmPollRepository
  extends TypeOrmTableRepository<StoredPoll>
  implements PollRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchPollSchema);
  }

  async save(channelId: string, poll: PollSnapshot): Promise<void> {
    await this.repository().upsert(
      { ...poll, choices: [...poll.choices], channel_id: channelId },
      ['poll_id'],
    );
  }

  list(
    channelId: string,
    range: StatsRange,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<StoredPoll>> {
    const query = this.repository()
      .createQueryBuilder('p')
      .where('p.channel_id = :channelId', { channelId });
    return whereWithin(query, 'p.started_at', range)
      .orderBy('p.started_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }
}
