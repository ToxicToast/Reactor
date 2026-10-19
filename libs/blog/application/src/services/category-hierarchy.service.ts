import {
  ConflictError,
  type Nullable,
  NotFoundError,
  Result,
} from '@toxictoast/shared-kernel';
import type { CategoryId, CategoryRepository } from '@toxictoast/blog-domain';

export class CategoryHierarchyService {
  constructor(
    private readonly repository: CategoryRepository,
    private readonly maxDepth = 50,
  ) {}

  async validateParent(
    parentId: Nullable<CategoryId>,
    categoryId: Nullable<CategoryId> = null,
  ): Promise<Result<void>> {
    if (parentId === null) {
      return Result.ok();
    }

    const parent = await this.repository.findById(parentId);
    if (!parent) {
      return Result.fail(new NotFoundError('Category', parentId));
    }

    if (categoryId === null) {
      return Result.ok();
    }

    let current: Nullable<CategoryId> = parentId;
    for (let depth = 0; current !== null; depth++) {
      if (current === categoryId) {
        return Result.fail(
          new ConflictError('Category cannot be moved below itself'),
        );
      }
      if (depth >= this.maxDepth) {
        return Result.fail(
          new ConflictError(
            `Category hierarchy exceeds ${this.maxDepth} levels`,
          ),
        );
      }

      const ancestor = await this.repository.findById(current, true);
      current = ancestor?.parent_id ?? null;
    }

    return Result.ok();
  }
}
