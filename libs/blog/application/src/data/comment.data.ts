import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  AuthorId,
  CommentId,
  CommentStatus,
  ModerationStatus,
  PostId,
} from '@toxictoast/blog-domain';

export interface UpdateCommentInput {
  readonly id: CommentId;
  readonly content: string;
  readonly author_id: AuthorId;
}

export interface ModerateCommentInput {
  readonly id: CommentId;
  readonly status: ModerationStatus;
  readonly note?: Optional<Nullable<string>>;
}

export interface ApplyModerationDecisionInput {
  readonly id: CommentId;
  readonly decision: CommentStatus;
  readonly note?: Optional<Nullable<string>>;
}

export interface CommentIdInput {
  readonly id: CommentId;
  readonly withDeleted?: Optional<boolean>;
  readonly approvedOnly?: Optional<boolean>;
}

export interface PostCommentsInput {
  readonly post_id: PostId;
}

export interface ListCommentsByStatusInput {
  readonly status: CommentStatus;
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
}
