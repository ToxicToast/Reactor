export const Verdict = {
  APPROVED: 'approved',
  SPAM: 'spam',
  HATE: 'hate',
  UNCERTAIN: 'uncertain',
} as const;

export type Verdict = (typeof Verdict)[keyof typeof Verdict];
