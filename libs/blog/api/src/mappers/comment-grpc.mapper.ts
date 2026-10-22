import type { CommentAnemic } from '@toxictoast/blog-domain';
import type {
  Comment,
  CommentModerator as GrpcCommentModerator,
} from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';
import type { Optional } from '@toxictoast/shared-types';
import {
  COMMENT_MODERATOR_TO_GRPC,
  COMMENT_STATUS_TO_GRPC,
} from '../mappings/index.js';

export class CommentGrpcMapper {
  toProto(anemic: CommentAnemic): Comment {
    return {
      id: anemic.id,
      post_id: anemic.post_id,
      parent_id: anemic.parent_id ?? undefined,
      author_id: anemic.author_id,
      content: anemic.content,
      status: COMMENT_STATUS_TO_GRPC[anemic.status],
      moderation_note: anemic.moderation_note ?? undefined,
      moderated_by: this.moderator(anemic),
      moderated_at: toIso(anemic.moderated_at),
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
      deleted_at: toIso(anemic.deleted_at),
    };
  }

  private moderator(anemic: CommentAnemic): Optional<GrpcCommentModerator> {
    if (anemic.moderated_by === null) {
      return undefined;
    }
    return COMMENT_MODERATOR_TO_GRPC[anemic.moderated_by];
  }
}
