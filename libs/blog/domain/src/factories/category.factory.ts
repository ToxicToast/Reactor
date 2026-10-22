import {
  type DomainContext,
  type Factory,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type { CategoryAnemic } from '../anemics/index.js';
import type { CategoryData } from '../data/index.js';
import { CategoryDomain } from '../domains/index.js';
import { Slug } from '../valueObjects/index.js';

export class CategoryFactory implements Factory<
  CategoryAnemic,
  CategoryDomain,
  CategoryData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: CategoryAnemic): CategoryDomain {
    return new CategoryDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: CategoryDomain): CategoryAnemic {
    return domain.toAnemic();
  }

  createDomain(data: CategoryData): Result<CategoryDomain> {
    const trimmed = data.title.trim();
    if (!trimmed) {
      return Result.fail(new ValidationError('Title must not be empty'));
    }

    const slug = Slug.fromTitle(trimmed);
    if (slug.isFailure) {
      return Result.fail(slug.error);
    }

    const domain = new CategoryDomain(
      {
        id: this.ctx.id.generate<'Category'>(),
        title: trimmed,
        slug: slug.value.value,
        description: data.description?.trim() || null,
        parent_id: data.parent_id,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.createCategory();
    return Result.ok(domain);
  }
}
