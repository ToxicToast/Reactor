import type { Nullable } from '@toxictoast/shared-types';
import type { CommentModerator, CommentStatus } from '../enums/index.js';
import type { AuthorId, CommentId, PostId } from '../types/index.js';

export interface CommentEventPayload {
  readonly id: CommentId;
  readonly post_id: PostId;
  readonly parent_id: Nullable<CommentId>;
  readonly author_id: AuthorId;
  readonly content: string;
  readonly status: CommentStatus;
  readonly moderation_note: Nullable<string>;
  readonly moderated_by: Nullable<CommentModerator>;
  readonly moderated_at: Nullable<Date>;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
