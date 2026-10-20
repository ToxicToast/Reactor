export interface BlogCommentPayloadV1 {
  readonly id: string;
  readonly post_id: string;
  readonly parent_id: string | null;
  readonly author_id: string;
  readonly content: string;
  readonly status: 'pending' | 'approved' | 'spam' | 'hate';
  readonly moderation_note: string | null;
  readonly moderated_by: 'ai' | 'admin' | null;
  readonly moderated_at: string | null;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
}
