import {
  insertMissing,
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Clock } from '@toxictoast/shared-kernel';
import type { PublishedClipLedger } from '@toxictoast/twitch-bot-application';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { DataSource } from 'typeorm';
import type { TwitchPublishedClipRow } from '../interfaces/index.js';
import { TwitchPublishedClipSchema } from '../schemas/index.js';

export class TypeOrmPublishedClipLedger
  extends TypeOrmTableRepository<TwitchPublishedClipRow>
  implements PublishedClipLedger
{
  constructor(
    dataSource: DataSource,
    context: TransactionContext,
    private readonly clock: Clock,
  ) {
    super(dataSource, context, TwitchPublishedClipSchema);
  }

  async markPublished(
    channelId: TwitchChannelId,
    clipIds: ReadonlyArray<string>,
  ): Promise<Array<string>> {
    const publishedAt = this.clock.now();
    const rows = await insertMissing(
      this.repository(),
      [...new Set(clipIds)].map((clipId) => {
        return {
          channel_id: channelId,
          clip_id: clipId,
          published_at: publishedAt,
        };
      }),
    );
    return rows.map((row) => row.clip_id);
  }
}
