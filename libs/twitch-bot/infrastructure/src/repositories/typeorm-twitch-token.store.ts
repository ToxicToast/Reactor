import type { TransactionContext } from '@toxictoast/shared-persistence';
import type { Clock } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  TwitchToken,
  TwitchTokenStore,
} from '@toxictoast/twitch-bot-application';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { DataSource, Repository } from 'typeorm';
import type { TwitchTokenRow } from '../interfaces/index.js';
import { TwitchTokenMapper } from '../mappers/index.js';
import { TwitchTokenSchema } from '../schemas/index.js';
import type { TokenCipher } from '../services/token-cipher.service.js';

export class TypeOrmTwitchTokenStore implements TwitchTokenStore {
  private readonly mapper: TwitchTokenMapper;

  constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
    cipher: TokenCipher,
    private readonly clock: Clock,
  ) {
    this.mapper = new TwitchTokenMapper(cipher);
  }

  async save(channelId: TwitchChannelId, token: TwitchToken): Promise<void> {
    await this.repository().upsert(
      this.mapper.toRow(channelId, token, this.clock.now()),
      ['channel_id'],
    );
  }

  async find(channelId: TwitchChannelId): Promise<Nullable<TwitchToken>> {
    const row = await this.repository().findOneBy({ channel_id: channelId });
    if (!row) {
      return null;
    }
    return this.mapper.toToken(row);
  }

  async remove(channelId: TwitchChannelId): Promise<void> {
    await this.repository().delete({ channel_id: channelId });
  }

  private repository(): Repository<TwitchTokenRow> {
    return this.context
      .manager(this.dataSource)
      .getRepository(TwitchTokenSchema);
  }
}
