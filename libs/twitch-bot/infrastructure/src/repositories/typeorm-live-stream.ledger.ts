import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type {
  LiveStreamEntry,
  LiveStreamLedger,
} from '@toxictoast/twitch-bot-application';
import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';
import type { DataSource } from 'typeorm';
import type { TwitchLiveStreamRow } from '../interfaces/index.js';
import { TwitchLiveStreamSchema } from '../schemas/index.js';

export class TypeOrmLiveStreamLedger
  extends TypeOrmTableRepository<TwitchLiveStreamRow>
  implements LiveStreamLedger
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchLiveStreamSchema);
  }

  async list(): Promise<Array<LiveStreamEntry>> {
    const rows = await this.repository().find();
    return rows.map((row) => {
      return {
        channel_id: row.channel_id as TrackedChannelId,
        stream_id: row.stream_id,
        started_at: row.started_at,
      };
    });
  }

  async start(entry: LiveStreamEntry): Promise<void> {
    await this.repository().upsert(
      {
        channel_id: entry.channel_id,
        stream_id: entry.stream_id,
        started_at: entry.started_at,
      },
      ['channel_id'],
    );
  }

  async end(channelId: TrackedChannelId): Promise<void> {
    await this.repository().delete({ channel_id: channelId });
  }
}
