import {
  DomainContext,
  Factory,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type { TagAnemic } from '../anemics/index.js';
import { TagDomain } from '../domains/index.js';
import type { TagData } from '../data/index.js';
import { Slug } from '../valueObjects/index.js';

export class TagFactory implements Factory<TagAnemic, TagDomain, TagData> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: TagAnemic): TagDomain {
    return new TagDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: TagDomain): TagAnemic {
    return domain.toAnemic();
  }

  createDomain(data: TagData): Result<TagDomain> {
    const trimmed = data.title.trim();
    if (!trimmed) {
      return Result.fail(new ValidationError('Title must not be empty'));
    }
    const slug = Slug.fromTitle(trimmed);
    if (slug.isFailure) {
      return Result.fail(slug.error);
    }

    const domain = new TagDomain(
      {
        id: this.ctx.id.generate<'Tag'>(),
        title: trimmed,
        slug: slug.value.value,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.createTag();
    return Result.ok(domain);
  }
}
