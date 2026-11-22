export const CommentModerator = {
  AI: 'ai',
  ADMIN: 'admin',
} as const;

export type CommentModerator =
  (typeof CommentModerator)[keyof typeof CommentModerator];
