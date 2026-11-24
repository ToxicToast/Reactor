import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  TwitchFriendAnemic,
  TwitchFriendRepository,
} from '@toxictoast/twitch-bot-domain';
import type { DataSource } from 'typeorm';
import type { TwitchFriendRow } from '../interfaces/index.js';
import { TwitchFriendMapper } from '../mappers/index.js';
import { TwitchFriendSchema } from '../schemas/index.js';

export class TypeOrmTwitchFriendRepository
  extends TypeOrmRepository<TwitchFriendAnemic, TwitchFriendRow>
  implements TwitchFriendRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchFriendSchema, new TwitchFriendMapper());
  }

  findByTwitchId(
    twitchId: string,
    withDeleted = false,
  ): Promise<Nullable<TwitchFriendAnemic>> {
    return this.one(
      this.query(withDeleted).andWhere('e.twitch_id = :twitchId', {
        twitchId,
      }),
    );
  }
}
