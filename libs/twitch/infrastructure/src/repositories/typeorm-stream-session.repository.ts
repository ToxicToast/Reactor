import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  StatsRange,
  StreamSessionAnemic,
  StreamSessionRepository,
} from '@toxictoast/twitch-domain';
import type { DataSource, SelectQueryBuilder } from 'typeorm';
import { whereWithin } from '../functions/index.js';
import type { StreamSessionRow } from '../interfaces/index.js';
import { StreamSessionMapper } from '../mappers/index.js';
import { TwitchStreamSessionSchema } from '../schemas/index.js';

export class TypeOrmStreamSessionRepository
  extends TypeOrmRepository<StreamSessionAnemic, StreamSessionRow>
  implements StreamSessionRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(
      dataSource,
      context,
      TwitchStreamSessionSchema,
      new StreamSessionMapper(),
    );
  }

  findLive(channelId: string): Promise<Nullable<StreamSessionAnemic>> {
    return this.one(this.ofChannel(channelId).andWhere('e.ended_at IS NULL'));
  }

  findLatest(channelId: string): Promise<Nullable<StreamSessionAnemic>> {
    return this.one(
      this.ofChannel(channelId).orderBy('e.started_at', 'DESC').take(1),
    );
  }

  findByChannel(
    channelId: string,
    range: StatsRange,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<StreamSessionAnemic>> {
    return this.many(
      whereWithin(this.ofChannel(channelId), 'e.started_at', range)
        .orderBy('e.started_at', 'DESC')
        .take(limit)
        .skip(offset),
    );
  }

  private ofChannel(channelId: string): SelectQueryBuilder<StreamSessionRow> {
    return this.query().andWhere('e.channel_id = :channelId', { channelId });
  }
}
