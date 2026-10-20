import type { Nullable } from '@toxictoast/shared-types';
import type { AnemicRow } from '@toxictoast/shared-persistence';

export interface CommentRow extends AnemicRow {
  post_id: string;
  parent_id: Nullable<string>;
  author_id: string;
  content: string;
  status: string;
  moderation_note: Nullable<string>;
  moderated_by: Nullable<string>;
  moderated_at: Nullable<Date>;
}
