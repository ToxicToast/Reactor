import type { TransactionContext } from '@toxictoast/shared-persistence';
import type {
  Chatter,
  ChatterRepository,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import type { DataSource, Repository } from 'typeorm';
import { CHATTER_INSERT_CHUNK } from '../constants/index.js';
import type { TwitchChatterRow } from '../interfaces/index.js';
import { TwitchChatterSchema } from '../schemas/index.js';

export class TypeOrmChatterRepository implements ChatterRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
  ) {}

  async findByChannel(channelId: TwitchChannelId): Promise<Array<Chatter>> {
    const rows = await this.repository().find({
      where: { channel_id: channelId },
      order: { user_login: 'ASC' },
    });
    return rows.map((row) => {
      return {
        user_id: row.user_id,
        user_login: row.user_login,
        user_name: row.user_name,
      };
    });
  }

  async replace(
    channelId: TwitchChannelId,
    chatters: ReadonlyArray<Chatter>,
  ): Promise<void> {
    const repository = this.repository();
    await repository.delete({ channel_id: channelId });

    const rows = chatters.map((chatter) => {
      return { channel_id: channelId, ...chatter };
    });
    for (let start = 0; start < rows.length; start += CHATTER_INSERT_CHUNK) {
      await repository.insert(rows.slice(start, start + CHATTER_INSERT_CHUNK));
    }
  }

  private repository(): Repository<TwitchChatterRow> {
    return this.context
      .manager(this.dataSource)
      .getRepository(TwitchChatterSchema);
  }
}
