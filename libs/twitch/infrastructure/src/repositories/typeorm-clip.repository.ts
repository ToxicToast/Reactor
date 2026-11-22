import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Optional } from '@toxictoast/shared-types';
import type {
  Clip,
  ClipFilter,
  ClipRepository,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import { TwitchClipSchema } from '../schemas/index.js';

export class TypeOrmClipRepository
  extends TypeOrmTableRepository<Clip>
  implements ClipRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchClipSchema);
  }

  async save(clip: Clip): Promise<void> {
    await this.repository().upsert(clip, ['clip_id']);
  }

  list(
    filter: ClipFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Clip>> {
    const query = this.repository()
      .createQueryBuilder('c')
      .where('c.channel_id = :channelId', { channelId: filter.channel_id });
    if (filter.vod_id !== null) {
      query.andWhere('c.vod_id = :vodId', { vodId: filter.vod_id });
    }
    return query
      .orderBy('c.created_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }
}
