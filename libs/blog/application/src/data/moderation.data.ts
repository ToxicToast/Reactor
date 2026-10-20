export interface ModerationRequestedPayload {
  readonly subject_type: 'blog.comment';
  readonly subject_id: string;
  readonly author_id: string;
  readonly content: string;
}
