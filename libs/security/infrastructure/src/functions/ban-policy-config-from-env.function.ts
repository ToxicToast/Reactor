import type { BanPolicyConfig } from '@toxictoast/security-domain';
import { listEnv, numberEnv } from '@toxictoast/shared-system';
import { BAN_POLICY_DEFAULTS } from '../constants/index.js';

const durations = (source: NodeJS.ProcessEnv): ReadonlyArray<number> => {
  const minutes = listEnv(
    'SECURITY_BAN_DURATIONS_MINUTES',
    [...BAN_POLICY_DEFAULTS.DURATIONS_MINUTES],
    source,
  ).map(Number);
  if (minutes.some((value) => !Number.isInteger(value) || value <= 0)) {
    throw new Error(
      'SECURITY_BAN_DURATIONS_MINUTES must be positive whole minutes',
    );
  }
  return minutes;
};

export const banPolicyConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): BanPolicyConfig => {
  return {
    threshold: numberEnv(
      'SECURITY_BAN_THRESHOLD',
      BAN_POLICY_DEFAULTS.THRESHOLD,
      source,
    ),
    windowSeconds: numberEnv(
      'SECURITY_BAN_WINDOW_SECONDS',
      BAN_POLICY_DEFAULTS.WINDOW_SECONDS,
      source,
    ),
    durationsMinutes: durations(source),
    strikeWindowDays: numberEnv(
      'SECURITY_BAN_STRIKE_WINDOW_DAYS',
      BAN_POLICY_DEFAULTS.STRIKE_WINDOW_DAYS,
      source,
    ),
    allowlist: listEnv(
      'SECURITY_ALLOWLIST',
      [...BAN_POLICY_DEFAULTS.ALLOWLIST],
      source,
    ),
  };
};
