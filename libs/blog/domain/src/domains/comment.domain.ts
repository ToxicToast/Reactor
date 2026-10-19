import {
  BaseDomain,
  ConflictError,
  type DomainEventClass,
  type Nullable,
  Result,
} from '@toxictoast/shared-kernel';
import type { CommentAnemic } from '../anemics/index.js';
import { type CommentModerator, CommentStatus } from '../enums/index.js';
import {
  ApproveCommentEvent,
  CreateCommentEvent,
  DeleteCommentEvent,
  HateCommentEvent,
  RestoreCommentEvent,
  SpamCommentEvent,
  UpdateCommentEvent,
} from '../events/index.js';
import { ValidateCommentContent } from '../validations/index.js';

export class CommentDomain extends BaseDomain<CommentAnemic> {
  get isApproved(): boolean {
    return this.state.status === CommentStatus.APPROVED;
  }

  get isPending(): boolean {
    return this.state.status === CommentStatus.PENDING;
  }

  createComment(): void {
    this.raise(CreateCommentEvent);
  }

  updateContent(content: string): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Comment is deleted'));
    }

    const trimmed = content.trim();
    const validation = new ValidateCommentContent(trimmed).validate();
    if (validation.isFailure) {
      return Result.fail(validation.error);
    }
    if (trimmed === this.state.content) {
      return Result.ok();
    }

    this.state.content = trimmed;
    this.touch();
    this.raise(UpdateCommentEvent);
    return Result.ok();
  }

  approveComment(
    moderator: CommentModerator,
    note: Nullable<string> = null,
  ): Result<void> {
    return this.changeStatus(
      CommentStatus.APPROVED,
      moderator,
      ApproveCommentEvent,
      note,
    );
  }

  markAsSpam(
    moderator: CommentModerator,
    note: Nullable<string> = null,
  ): Result<void> {
    return this.changeStatus(
      CommentStatus.SPAM,
      moderator,
      SpamCommentEvent,
      note,
    );
  }

  markAsHate(
    moderator: CommentModerator,
    note: Nullable<string> = null,
  ): Result<void> {
    return this.changeStatus(
      CommentStatus.HATE,
      moderator,
      HateCommentEvent,
      note,
    );
  }

  deleteComment(): void {
    this.markDeleted(DeleteCommentEvent);
  }

  restoreComment(): void {
    this.markRestored(RestoreCommentEvent);
  }

  private changeStatus(
    status: CommentStatus,
    moderator: CommentModerator,
    EventClass: DomainEventClass<CommentAnemic>,
    note: Nullable<string>,
  ): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Comment is deleted'));
    }
    if (this.state.status === status) {
      return Result.fail(new ConflictError(`Comment is already ${status}`));
    }

    this.state.status = status;
    this.state.moderation_note = note?.trim() || null;
    this.state.moderated_by = moderator;
    this.state.moderated_at = this.ctx.date.now();
    this.touch();
    this.raise(EventClass);
    return Result.ok();
  }
}
