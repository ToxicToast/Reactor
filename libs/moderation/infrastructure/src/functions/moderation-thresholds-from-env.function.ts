import type { ModerationThresholds } from '@toxictoast/moderation-domain';
import { decimalEnv } from '@toxictoast/shared-system';
import { MODERATION_DEFAULTS, MODERATION_ENV } from '../constants/index.js';

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
    approve: threshold(
      MODERATION_ENV.APPROVE_THRESHOLD,
      MODERATION_DEFAULTS.APPROVE_THRESHOLD,
      source,
    ),
    spam: threshold(
      MODERATION_ENV.SPAM_THRESHOLD,
      MODERATION_DEFAULTS.SPAM_THRESHOLD,
      source,
    ),
    hate: threshold(
      MODERATION_ENV.HATE_THRESHOLD,
      MODERATION_DEFAULTS.HATE_THRESHOLD,
      source,
    ),
  };
};
