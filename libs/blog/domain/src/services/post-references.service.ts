import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { Optional } from '@toxictoast/shared-types';
import type { PostReferences } from '../data/index.js';
import type {
  CategoryRepository,
  MediaRepository,
  TagRepository,
} from '../repositories/index.js';
import type { MediaId } from '../types/index.js';

export class PostReferencesService {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly tags: TagRepository,
    private readonly media: MediaRepository,
  ) {}

  async validate(references: PostReferences): Promise<Result<void>> {
    const checks = [
      () =>
        this.ensureExist('Category', references.category_ids, (ids) =>
          this.categories.findByIds(ids),
        ),
      () =>
        this.ensureExist('Tag', references.tag_ids, (ids) =>
          this.tags.findByIds(ids),
        ),
      () =>
        this.ensureExist('Media', this.imageIds(references), (ids) =>
          this.media.findByIds(ids),
        ),
    ];

    for (const check of checks) {
      const result = await check();
      if (result.isFailure) {
        return result;
      }
    }

    return Result.ok();
  }

  private async ensureExist<TId extends string>(
    entity: string,
    requested: Optional<ReadonlyArray<TId>>,
    find: (
      ids: ReadonlyArray<TId>,
    ) => Promise<ReadonlyArray<{ readonly id: TId }>>,
  ): Promise<Result<void>> {
    if (!requested || requested.length === 0) {
      return Result.ok();
    }

    const ids = [...new Set(requested)];
    const found = new Set((await find(ids)).map((item) => item.id));
    const missing = ids.filter((id) => !found.has(id));
    if (missing.length > 0) {
      return Result.fail(new NotFoundError(entity, missing.join(', ')));
    }

    return Result.ok();
  }

  private imageIds(references: PostReferences): Array<MediaId> {
    return [references.blog_image_id, references.hero_image_id].filter(
      (id): id is MediaId => id !== undefined && id !== null,
    );
  }
}
