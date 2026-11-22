import {
  BaseDomain,
  ConflictError,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type { TagAnemic } from '../anemics/index.js';
import { TagEvents, type TagEventPayload } from '../events/index.js';

export class TagDomain extends BaseDomain<TagAnemic, TagEventPayload> {
  create(): void {
    this.raise(TagEvents.CREATED);
  }

  updateTitle(title: string): Result<void> {
    const trimmed = title.trim();
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Tag is deleted'));
    }
    if (!trimmed) {
      return Result.fail(new ValidationError('Title must not be empty'));
    }
    if (trimmed === this.state.title) {
      return Result.ok();
    }

    this.state.title = trimmed;
    this.touch();
    this.raise(TagEvents.UPDATED);
    return Result.ok();
  }

  delete(): void {
    this.markDeleted(TagEvents.DELETED);
  }

  restore(): void {
    this.markRestored(TagEvents.RESTORED);
  }

  protected override toEventPayload(): TagEventPayload {
    return {
      id: this.state.id,
      title: this.state.title,
      slug: this.state.slug,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
