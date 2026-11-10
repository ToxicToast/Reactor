import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type {
  RecordedTwitchEvent,
  TwitchEventLog,
} from '@toxictoast/twitch-application';
import type { DataSource } from 'typeorm';
import { insertOnce } from '../functions/index.js';
import { TwitchEventSchema } from '../schemas/index.js';

export class TypeOrmTwitchEventLog
  extends TypeOrmTableRepository<RecordedTwitchEvent>
  implements TwitchEventLog
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, TwitchEventSchema);
  }

  record(event: RecordedTwitchEvent): Promise<boolean> {
    return insertOnce(this.repository(), { ...event });
  }
}
