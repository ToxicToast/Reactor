import type { Nullable } from '@toxictoast/shared-types';

export interface BlogCommentPayloadV1 {
  readonly id: string;
  readonly post_id: string;
  readonly parent_id: Nullable<string>;
  readonly author_id: string;
  readonly content: string;
  readonly status: 'pending' | 'approved' | 'spam' | 'hate';
  readonly moderation_note: Nullable<string>;
  readonly moderated_by: Nullable<'ai' | 'admin'>;
  readonly moderated_at: Nullable<string>;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
