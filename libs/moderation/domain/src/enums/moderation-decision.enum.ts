export const ModerationDecision = {
  APPROVED: 'approved',
  SPAM: 'spam',
  HATE: 'hate',
  PENDING: 'pending',
} as const;

export type ModerationDecision =
  (typeof ModerationDecision)[keyof typeof ModerationDecision];
