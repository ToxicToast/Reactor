import type {
  AuthorId,
  CommentAnemic,
  CommentId,
  CommentModerator,
  CommentStatus,
  PostId,
} from '@toxictoast/blog-domain';
import type { Nullable } from '@toxictoast/shared-types';
import type { Mapper } from '@toxictoast/shared-persistence';
import type { CommentRow } from '../interfaces/index.js';

export class CommentMapper implements Mapper<CommentAnemic, CommentRow> {
  toAnemic(row: CommentRow): CommentAnemic {
    return {
      id: row.id as CommentId,
      post_id: row.post_id as PostId,
      parent_id: row.parent_id as Nullable<CommentId>,
      author_id: row.author_id as AuthorId,
      content: row.content,
      status: row.status as CommentStatus,
      moderation_note: row.moderation_note,
      moderated_by: row.moderated_by as Nullable<CommentModerator>,
      moderated_at: row.moderated_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: CommentAnemic): CommentRow {
    return {
      id: anemic.id,
      post_id: anemic.post_id,
      parent_id: anemic.parent_id,
      author_id: anemic.author_id,
      content: anemic.content,
      status: anemic.status,
      moderation_note: anemic.moderation_note,
      moderated_by: anemic.moderated_by,
      moderated_at: anemic.moderated_at,
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
