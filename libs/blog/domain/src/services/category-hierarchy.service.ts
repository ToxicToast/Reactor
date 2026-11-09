import {
  ConflictError,
  NotFoundError,
  Result,
} from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { CategoryAnemic } from '../anemics/index.js';
import type { CategoryRepository } from '../repositories/index.js';
import type { CategoryId } from '../types/index.js';

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

  async validateRestore(category: CategoryAnemic): Promise<Result<void>> {
    if (category.parent_id === null) {
      return Result.ok();
    }

    const parent = await this.repository.findById(category.parent_id);
    if (!parent) {
      return Result.fail(
        new ConflictError('Parent category is deleted, restore it first'),
      );
    }

    return Result.ok();
  }

  async validateDelete(categoryId: CategoryId): Promise<Result<void>> {
    const children = await this.repository.findChildren(categoryId);
    if (children.length > 0) {
      return Result.fail(
        new ConflictError(
          `Category has ${children.length} child categories and cannot be deleted`,
        ),
      );
    }

    return Result.ok();
  }
}
