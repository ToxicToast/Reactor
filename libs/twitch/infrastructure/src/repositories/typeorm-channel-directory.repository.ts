import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  ChannelDirectoryRepository,
  ChannelRef,
  KnownChannel,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import { TwitchKnownChannelSchema } from '../schemas/index.js';

export class TypeOrmChannelDirectoryRepository
  extends TypeOrmTableRepository<KnownChannel>
  implements ChannelDirectoryRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchKnownChannelSchema);
  }

  async remember(channel: ChannelRef, seenAt: Date): Promise<void> {
    await this.repository().upsert(
      {
        channel_id: channel.channel_id,
        channel_login: channel.channel_login,
        channel_name: channel.channel_name,
        last_seen_at: seenAt,
      },
      ['channel_id'],
    );
  }

  find(channelId: string): Promise<Nullable<KnownChannel>> {
    return this.repository().findOneBy({ channel_id: channelId });
  }

  list(): Promise<Array<KnownChannel>> {
    return this.repository().find({ order: { channel_login: 'ASC' } });
  }
}
