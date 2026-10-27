import {
  Result,
  type DomainContext,
  type Factory,
} from '@toxictoast/shared-kernel';
import type { TwitchChannelAnemic } from '../anemics/index.js';
import type { TwitchChannelData } from '../data/index.js';
import { TwitchChannelDomain } from '../domains/index.js';
import { normalizeTwitchChannelData } from '../functions/index.js';

export class TwitchChannelFactory implements Factory<
  TwitchChannelAnemic,
  TwitchChannelDomain,
  TwitchChannelData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: TwitchChannelAnemic): TwitchChannelDomain {
    return new TwitchChannelDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: TwitchChannelDomain): TwitchChannelAnemic {
    return domain.toAnemic();
  }

  createDomain(data: TwitchChannelData): Result<TwitchChannelDomain> {
    const normalized = normalizeTwitchChannelData(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }

    const domain = new TwitchChannelDomain(
      {
        id: this.ctx.id.generate<'TwitchChannel'>(),
        ...normalized.value,
        connected: true,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.connect();
    return Result.ok(domain);
  }
}
