import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  TwitchChannelAnemic,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import type { DataSource } from 'typeorm';
import type { TwitchChannelRow } from '../interfaces/index.js';
import { TwitchChannelMapper } from '../mappers/index.js';
import { TwitchChannelSchema } from '../schemas/index.js';

export class TypeOrmTwitchChannelRepository
  extends TypeOrmRepository<TwitchChannelAnemic, TwitchChannelRow>
  implements TwitchChannelRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchChannelSchema, new TwitchChannelMapper());
  }

  findByTwitchId(twitchId: string): Promise<Nullable<TwitchChannelAnemic>> {
    return this.one(
      this.query().andWhere('e.twitch_id = :twitchId', { twitchId }),
    );
  }

  findConnected(): Promise<Array<TwitchChannelAnemic>> {
    return this.many(
      this.query()
        .andWhere('e.connected = true')
        .orderBy('e.created_at', 'ASC'),
    );
  }
}
