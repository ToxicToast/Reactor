import type { Nullable } from '@toxictoast/shared-types';
import {
  BaseDomain,
  ConflictError,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type { CategoryAnemic } from '../anemics/index.js';
import type { CategoryId } from '../types/index.js';
import { CategoryEvents, type CategoryEventPayload } from '../events/index.js';

export class CategoryDomain extends BaseDomain<
  CategoryAnemic,
  CategoryEventPayload
> {
  create(): void {
    this.raise(CategoryEvents.CREATED);
  }

  updateCategory(title: string, description: Nullable<string>): Result<void> {
    if (this.isDeleted) {
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
    this.raise(CategoryEvents.UPDATED);
    return Result.ok();
  }

  changeParent(parentId: Nullable<CategoryId>): Result<void> {
    if (this.isDeleted) {
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
    this.raise(CategoryEvents.UPDATED);
    return Result.ok();
  }

  delete(): void {
    this.markDeleted(CategoryEvents.DELETED);
  }

  restore(): void {
    this.markRestored(CategoryEvents.RESTORED);
  }

  protected override toEventPayload(): CategoryEventPayload {
    return {
      id: this.state.id,
      title: this.state.title,
      slug: this.state.slug,
      description: this.state.description,
      parent_id: this.state.parent_id,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
