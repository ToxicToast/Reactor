import { BlogModerationDecision } from '@toxictoast/contracts-events';

export const DECISIONS: ReadonlySet<string> = new Set(
  Object.values(BlogModerationDecision),
);
