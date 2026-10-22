import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  CategoryRepository,
  MediaId,
  MediaRepository,
  TagRepository,
} from '@toxictoast/blog-domain';
import type { PostReferences } from '../data/index.js';

export class PostReferencesService {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly tags: TagRepository,
    private readonly media: MediaRepository,
  ) {}

  async validate(references: PostReferences): Promise<Result<void>> {
    if (references.category_ids) {
      const ids = [...new Set(references.category_ids)];
      const found = await this.categories.findByIds(ids);
      const missing = this.missing(
        ids,
        found.map((item) => item.id),
      );
      if (missing.length > 0) {
        return Result.fail(new NotFoundError('Category', missing.join(', ')));
      }
    }

    if (references.tag_ids) {
      const ids = [...new Set(references.tag_ids)];
      const found = await this.tags.findByIds(ids);
      const missing = this.missing(
        ids,
        found.map((item) => item.id),
      );
      if (missing.length > 0) {
        return Result.fail(new NotFoundError('Tag', missing.join(', ')));
      }
    }

    const mediaIds = [
      references.blog_image_id,
      references.hero_image_id,
    ].filter((id): id is MediaId => id !== undefined && id !== null);
    if (mediaIds.length > 0) {
      const ids = [...new Set(mediaIds)];
      const found = await this.media.findByIds(ids);
      const missing = this.missing(
        ids,
        found.map((item) => item.id),
      );
      if (missing.length > 0) {
        return Result.fail(new NotFoundError('Media', missing.join(', ')));
      }
    }

    return Result.ok();
  }

  private missing<TId extends string>(
    requested: ReadonlyArray<TId>,
    found: ReadonlyArray<TId>,
  ): Array<TId> {
    return requested.filter((id) => !found.includes(id));
  }
}
