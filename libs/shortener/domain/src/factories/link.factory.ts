import {
  Result,
  type DomainContext,
  type Factory,
} from '@toxictoast/shared-kernel';
import type { LinkAnemic } from '../anemics/index.js';
import type { LinkData } from '../data/index.js';
import { LinkDomain } from '../domains/index.js';
import { normalizeLinkData } from '../functions/index.js';

export class LinkFactory implements Factory<LinkAnemic, LinkDomain, LinkData> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: LinkAnemic): LinkDomain {
    return new LinkDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: LinkDomain): LinkAnemic {
    return domain.toAnemic();
  }

  createDomain(data: LinkData): Result<LinkDomain> {
    const normalized = normalizeLinkData(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }

    const domain = new LinkDomain(
      {
        id: this.ctx.id.generate<'Link'>(),
        ...normalized.value,
        active: true,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.create();
    return Result.ok(domain);
  }
}
