import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { CommentId, CommentStatus, PostId } from '@toxictoast/blog-domain';
import type { ModerationStatus } from '../types/index.js';

export interface UpdateCommentInput {
  readonly id: CommentId;
  readonly content: string;
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
}

export interface PostCommentsInput {
  readonly post_id: PostId;
}

export interface ListCommentsByStatusInput {
  readonly status: CommentStatus;
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
}
