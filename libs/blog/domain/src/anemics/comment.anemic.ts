import type { Anemic } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { CommentModerator, CommentStatus } from '../enums/index.js';
import type { AuthorId, CommentId, PostId } from '../types/index.js';

export interface CommentAnemic extends Anemic<CommentId> {
  readonly post_id: PostId;
  readonly parent_id: Nullable<CommentId>;
  readonly author_id: AuthorId;
  readonly content: string;
  readonly status: CommentStatus;
  readonly moderation_note: Nullable<string>;
  readonly moderated_by: Nullable<CommentModerator>;
  readonly moderated_at: Nullable<Date>;
}
