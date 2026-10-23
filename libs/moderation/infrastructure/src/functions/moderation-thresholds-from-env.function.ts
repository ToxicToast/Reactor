import type { ModerationThresholds } from '@toxictoast/moderation-domain';
import { decimalEnv } from '@toxictoast/shared-system';

const threshold = (
  name: string,
  fallback: number,
  source: NodeJS.ProcessEnv,
): number => {
  const value = decimalEnv(name, fallback, source);
  if (value <= 0 || value > 1) {
    throw new Error(`Environment variable ${name} must be in (0, 1]`);
  }
  return value;
};

export const moderationThresholdsFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): ModerationThresholds => {
  return {
    approve: threshold('MODERATION_APPROVE_THRESHOLD', 0.95, source),
    spam: threshold('MODERATION_SPAM_THRESHOLD', 0.85, source),
    hate: threshold('MODERATION_HATE_THRESHOLD', 0.85, source),
  };
};
