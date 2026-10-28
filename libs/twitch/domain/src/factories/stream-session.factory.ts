import {
  Result,
  ValidationError,
  type DomainContext,
  type Factory,
} from '@toxictoast/shared-kernel';
import type { StreamSessionAnemic } from '../anemics/index.js';
import { SESSION_COUNTER_KEYS } from '../constants/index.js';
import type { StreamSessionData } from '../data/index.js';
import { StreamSessionDomain } from '../domains/index.js';
import { zeroCounters } from '../functions/index.js';

export class StreamSessionFactory implements Factory<
  StreamSessionAnemic,
  StreamSessionDomain,
  StreamSessionData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: StreamSessionAnemic): StreamSessionDomain {
    return new StreamSessionDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: StreamSessionDomain): StreamSessionAnemic {
    return domain.toAnemic();
  }

  createDomain(data: StreamSessionData): Result<StreamSessionDomain> {
    if (data.stream_id.trim().length === 0) {
      return Result.fail(new ValidationError('Stream id must not be empty'));
    }

    const session = new StreamSessionDomain(
      {
        id: this.ctx.id.generate<'StreamSession'>(),
        ...data.channel,
        stream_id: data.stream_id,
        started_at: data.started_at,
        ended_at: null,
        duration_seconds: null,
        ...zeroCounters(SESSION_COUNTER_KEYS),
        peak_chatters: 0,
        unique_chatters: 0,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    session.start();
    return Result.ok(session);
  }
}
