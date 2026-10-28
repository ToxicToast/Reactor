import type { Mapper } from '@toxictoast/shared-persistence';
import type {
  StreamSessionAnemic,
  StreamSessionId,
} from '@toxictoast/twitch-domain';
import type { StreamSessionRow } from '../interfaces/index.js';

export class StreamSessionMapper implements Mapper<
  StreamSessionAnemic,
  StreamSessionRow
> {
  toAnemic(row: StreamSessionRow): StreamSessionAnemic {
    return { ...row, id: row.id as StreamSessionId };
  }

  toRow(anemic: StreamSessionAnemic): StreamSessionRow {
    return { ...anemic };
  }
}
