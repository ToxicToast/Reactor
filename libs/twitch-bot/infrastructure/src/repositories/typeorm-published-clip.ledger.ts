import type { TransactionContext } from '@toxictoast/shared-persistence';
import type { Clock } from '@toxictoast/shared-kernel';
import type { PublishedClipLedger } from '@toxictoast/twitch-bot-application';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { DataSource, Repository } from 'typeorm';
import type { TwitchPublishedClipRow } from '../interfaces/index.js';
import { TwitchPublishedClipSchema } from '../schemas/index.js';

export class TypeOrmPublishedClipLedger implements PublishedClipLedger {
  constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
    private readonly clock: Clock,
  ) {}

  async markPublished(
    channelId: TwitchChannelId,
    clipIds: ReadonlyArray<string>,
  ): Promise<Array<string>> {
    const unique = [...new Set(clipIds)];
    if (unique.length === 0) {
      return [];
    }

    const publishedAt = this.clock.now();
    const result = await this.repository()
      .createQueryBuilder()
      .insert()
      .into(TwitchPublishedClipSchema)
      .values(
        unique.map((clipId) => {
          return {
            channel_id: channelId,
            clip_id: clipId,
            published_at: publishedAt,
          };
        }),
      )
      .orIgnore()
      .returning(['clip_id'])
      .execute();

    const rows = result.raw as Array<{ clip_id: string }>;
    return rows.map((row) => row.clip_id);
  }

  private repository(): Repository<TwitchPublishedClipRow> {
    return this.context
      .manager(this.dataSource)
      .getRepository(TwitchPublishedClipSchema);
  }
}
