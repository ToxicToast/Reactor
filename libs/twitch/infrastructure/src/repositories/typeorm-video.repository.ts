import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Optional } from '@toxictoast/shared-types';
import type {
  Video,
  VideoFilter,
  VideoRepository,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import { TwitchVideoSchema } from '../schemas/index.js';

export class TypeOrmVideoRepository
  extends TypeOrmTableRepository<Video>
  implements VideoRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchVideoSchema);
  }

  async save(video: Video): Promise<void> {
    await this.repository().upsert(video, ['video_id']);
  }

  list(
    filter: VideoFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Video>> {
    const query = this.repository()
      .createQueryBuilder('v')
      .where('v.channel_id = :channelId', { channelId: filter.channel_id });
    if (filter.type !== null) {
      query.andWhere('v.type = :type', { type: filter.type });
    }
    if (filter.stream_id !== null) {
      query.andWhere('v.stream_id = :streamId', { streamId: filter.stream_id });
    }
    return query
      .orderBy('v.created_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }
}
