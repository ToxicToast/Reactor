import {
  BaseDomain,
  ConflictError,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type { TagAnemic } from '../anemics/index.js';
import {
  CreateTagEvent,
  UpdateTagEvent,
  DeleteTagEvent,
  RestoreTagEvent,
} from '../events/index.js';

export class TagDomain extends BaseDomain<TagAnemic> {
  createTag(): void {
    this.raise(CreateTagEvent);
  }

  updateTitle(title: string): Result<void> {
    const trimmed = title.trim();
    if (this.state.deleted_at) {
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
    this.raise(UpdateTagEvent);
    return Result.ok();
  }

  deleteTag(): void {
    if (this.state.deleted_at === null) {
      this.state.deleted_at = this.ctx.date.now();
      this.touch();
      this.raise(DeleteTagEvent);
    }
  }

  restoreTag(): void {
    if (this.state.deleted_at !== null) {
      this.state.deleted_at = null;
      this.touch();
      this.raise(RestoreTagEvent);
    }
  }
}
