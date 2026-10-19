import {
  BaseDomain,
  ConflictError,
  type Nullable,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type { CategoryAnemic } from '../anemics/index.js';
import type { CategoryId } from '../types/index.js';
import {
  CreateCategoryEvent,
  DeleteCategoryEvent,
  RestoreCategoryEvent,
  UpdateCategoryEvent,
} from '../events/index.js';

export class CategoryDomain extends BaseDomain<CategoryAnemic> {
  createCategory(): void {
    this.raise(CreateCategoryEvent);
  }

  updateCategory(title: string, description: Nullable<string>): Result<void> {
    if (this.state.deleted_at) {
      return Result.fail(new ConflictError('Category is deleted'));
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return Result.fail(new ValidationError('Title must not be empty'));
    }

    const trimmedDescription = description?.trim() || null;
    if (
      trimmedTitle === this.state.title &&
      trimmedDescription === this.state.description
    ) {
      return Result.ok();
    }

    this.state.title = trimmedTitle;
    this.state.description = trimmedDescription;
    this.touch();
    this.raise(UpdateCategoryEvent);
    return Result.ok();
  }

  changeParent(parentId: Nullable<CategoryId>): Result<void> {
    if (this.state.deleted_at) {
      return Result.fail(new ConflictError('Category is deleted'));
    }
    if (parentId === this.state.id) {
      return Result.fail(
        new ValidationError('Category cannot be its own parent'),
      );
    }
    if (parentId === this.state.parent_id) {
      return Result.ok();
    }

    this.state.parent_id = parentId;
    this.touch();
    this.raise(UpdateCategoryEvent);
    return Result.ok();
  }

  deleteCategory(): void {
    if (this.state.deleted_at === null) {
      this.state.deleted_at = this.ctx.date.now();
      this.touch();
      this.raise(DeleteCategoryEvent);
    }
  }

  restoreCategory(): void {
    if (this.state.deleted_at !== null) {
      this.state.deleted_at = null;
      this.touch();
      this.raise(RestoreCategoryEvent);
    }
  }
}
