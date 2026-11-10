import type { Nullable } from '@toxictoast/shared-types';
import {
  BaseDomain,
  ConflictError,
  ForbiddenError,
  type DomainEventDefinition,
  Result,
} from '@toxictoast/shared-kernel';
import type { CommentAnemic } from '../anemics/index.js';
import { type CommentModerator, CommentStatus } from '../enums/index.js';
import {
  CommentEvents,
  CommentModerationEvents,
  type CommentEventPayload,
} from '../events/index.js';
import { ValidateCommentContent } from '../validations/index.js';
import type { AuthorId, ModerationStatus } from '../types/index.js';

export class CommentDomain extends BaseDomain<
  CommentAnemic,
  CommentEventPayload
> {
  get isApproved(): boolean {
    return this.state.status === CommentStatus.APPROVED;
  }

  get isPending(): boolean {
    return this.state.status === CommentStatus.PENDING;
  }

  createComment(): void {
    this.raise(CommentEvents.CREATED);
    this.raise(CommentModerationEvents.REQUESTED);
  }

  updateContent(content: string, editor: AuthorId): Result<void> {
    if (this.state.author_id !== editor) {
      return Result.fail(
        new ForbiddenError('Only the author can edit the comment'),
      );
    }
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
    this.resetModeration();
    this.touch();
    this.raise(CommentEvents.UPDATED);
    this.raise(CommentModerationEvents.REQUESTED);
    return Result.ok();
  }

  approveComment(
    moderator: CommentModerator,
    note: Nullable<string> = null,
  ): Result<void> {
    return this.changeStatus(
      CommentStatus.APPROVED,
      moderator,
      CommentEvents.APPROVED,
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
      CommentEvents.MARKED_AS_SPAM,
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
      CommentEvents.MARKED_AS_HATE,
      note,
    );
  }

  markForReview(
    moderator: CommentModerator,
    note: Nullable<string> = null,
  ): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Comment is deleted'));
    }
    if (!this.isPending) {
      return Result.fail(
        new ConflictError('Only pending comments can be marked for review'),
      );
    }

    this.recordModeration(moderator, note);
    this.raise(CommentEvents.MARKED_FOR_REVIEW);
    return Result.ok();
  }

  moderate(
    status: ModerationStatus,
    moderator: CommentModerator,
    note: Nullable<string> = null,
  ): Result<void> {
    switch (status) {
      case CommentStatus.APPROVED:
        return this.approveComment(moderator, note);
      case CommentStatus.SPAM:
        return this.markAsSpam(moderator, note);
      case CommentStatus.HATE:
        return this.markAsHate(moderator, note);
    }
  }

  /**
   * Applies an automated moderation decision. Decisions for comments that are
   * deleted or no longer pending are ignored: decision events can arrive twice
   * or after an admin has already moderated the comment.
   */
  applyDecision(
    decision: CommentStatus,
    moderator: CommentModerator,
    note: Nullable<string> = null,
  ): Result<void> {
    if (this.isDeleted || !this.isPending) {
      return Result.ok();
    }
    if (decision === CommentStatus.PENDING) {
      return this.markForReview(moderator, note);
    }
    return this.moderate(decision, moderator, note);
  }

  deleteComment(): void {
    this.markDeleted(CommentEvents.DELETED);
  }

  restoreComment(): void {
    this.markRestored(CommentEvents.RESTORED);
  }

  protected override toEventPayload(): CommentEventPayload {
    return {
      id: this.state.id,
      post_id: this.state.post_id,
      parent_id: this.state.parent_id,
      author_id: this.state.author_id,
      content: this.state.content,
      status: this.state.status,
      moderation_note: this.state.moderation_note,
      moderated_by: this.state.moderated_by,
      moderated_at: this.state.moderated_at,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }

  private changeStatus(
    status: CommentStatus,
    moderator: CommentModerator,
    event: DomainEventDefinition,
    note: Nullable<string>,
  ): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Comment is deleted'));
    }
    if (this.state.status === status) {
      return Result.fail(new ConflictError(`Comment is already ${status}`));
    }

    this.state.status = status;
    this.recordModeration(moderator, note);
    this.raise(event);
    return Result.ok();
  }

  private recordModeration(
    moderator: CommentModerator,
    note: Nullable<string>,
  ): void {
    this.state.moderation_note = note?.trim() || null;
    this.state.moderated_by = moderator;
    this.state.moderated_at = this.ctx.date.now();
    this.touch();
  }

  private resetModeration(): void {
    this.state.status = CommentStatus.PENDING;
    this.state.moderation_note = null;
    this.state.moderated_by = null;
    this.state.moderated_at = null;
  }
}
