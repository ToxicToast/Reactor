import {
  Result,
  type DomainContext,
  type Factory,
} from '@toxictoast/shared-kernel';
import type { YouTubeChannelAnemic } from '../anemics/index.js';
import type { YouTubeChannelData } from '../data/index.js';
import { YouTubeChannelDomain } from '../domains/index.js';
import { normalizeYouTubeChannelData } from '../functions/index.js';

export class YouTubeChannelFactory implements Factory<
  YouTubeChannelAnemic,
  YouTubeChannelDomain,
  YouTubeChannelData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: YouTubeChannelAnemic): YouTubeChannelDomain {
    return new YouTubeChannelDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: YouTubeChannelDomain): YouTubeChannelAnemic {
    return domain.toAnemic();
  }

  createDomain(data: YouTubeChannelData): Result<YouTubeChannelDomain> {
    const normalized = normalizeYouTubeChannelData(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }

    const domain = new YouTubeChannelDomain(
      {
        id: this.ctx.id.generate<'YouTubeChannel'>(),
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
