export const CommentStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SPAM: 'spam',
  HATE: 'hate',
} as const;

export type CommentStatus = (typeof CommentStatus)[keyof typeof CommentStatus];
