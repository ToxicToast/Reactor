import type { BanPolicyConfig } from '@toxictoast/security-domain';
import { listEnv, numberEnv } from '@toxictoast/shared-system';

const DEFAULT_DURATIONS = ['30', '120', '720', '10080'];
const DEFAULT_ALLOWLIST = ['127.0.0.1', '::1'];

const durations = (source: NodeJS.ProcessEnv): ReadonlyArray<number> => {
  const minutes = listEnv(
    'SECURITY_BAN_DURATIONS_MINUTES',
    DEFAULT_DURATIONS,
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
    threshold: numberEnv('SECURITY_BAN_THRESHOLD', 20, source),
    windowSeconds: numberEnv('SECURITY_BAN_WINDOW_SECONDS', 300, source),
    durationsMinutes: durations(source),
    strikeWindowDays: numberEnv('SECURITY_BAN_STRIKE_WINDOW_DAYS', 30, source),
    allowlist: listEnv('SECURITY_ALLOWLIST', DEFAULT_ALLOWLIST, source),
  };
};
