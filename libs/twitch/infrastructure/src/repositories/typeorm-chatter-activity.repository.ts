import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type {
  ChatterActivityRepository,
  StreamSessionId,
} from '@toxictoast/twitch-domain';
import type { DataSource } from 'typeorm';
import { insertOnce } from '../functions/index.js';
import type { ChatterDayRow } from '../interfaces/index.js';
import {
  TwitchChatterDaySchema,
  TwitchSessionChatterSchema,
} from '../schemas/index.js';

export class TypeOrmChatterActivityRepository
  extends TypeOrmTableRepository<ChatterDayRow>
  implements ChatterActivityRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchChatterDaySchema);
  }

  markDaily(channelId: string, day: string, userId: string): Promise<boolean> {
    return insertOnce(this.repository(), {
      channel_id: channelId,
      day,
      user_id: userId,
    });
  }

  markSession(sessionId: StreamSessionId, userId: string): Promise<boolean> {
    return insertOnce(this.repositoryOf(TwitchSessionChatterSchema), {
      session_id: sessionId,
      user_id: userId,
    });
  }
}
