import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { MediaImportLog } from '@toxictoast/twitch-bot-application';
import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';
import type { DataSource } from 'typeorm';
import type { TwitchMediaImportRow } from '../interfaces/index.js';
import { TwitchMediaImportSchema } from '../schemas/index.js';

export class TypeOrmMediaImportLog
  extends TypeOrmTableRepository<TwitchMediaImportRow>
  implements MediaImportLog
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchMediaImportSchema);
  }

  isImported(channelId: TrackedChannelId): Promise<boolean> {
    return this.repository().existsBy({ channel_id: channelId });
  }

  async markImported(channelId: TrackedChannelId, at: Date): Promise<void> {
    await this.repository().upsert({ channel_id: channelId, imported_at: at }, [
      'channel_id',
    ]);
  }
}
