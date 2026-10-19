import type { Nullable, Result } from '@toxictoast/shared-kernel';
import {
  CommentStatus,
  type CommentDomain,
  type CommentModerator,
} from '@toxictoast/blog-domain';
import type { ModerationStatus } from '../types/index.js';

export class CommentModerationService {
  moderate(
    comment: CommentDomain,
    status: ModerationStatus,
    moderator: CommentModerator,
    note: Nullable<string>,
  ): Result<void> {
    switch (status) {
      case CommentStatus.APPROVED:
        return comment.approveComment(moderator, note);
      case CommentStatus.SPAM:
        return comment.markAsSpam(moderator, note);
      case CommentStatus.HATE:
        return comment.markAsHate(moderator, note);
    }
  }
}
