import type { AuditRetentionConfig } from '@toxictoast/audit-domain';
import { SecurityTopics, TwitchTopics } from '@toxictoast/contracts-events';
import { numberEnv } from '@toxictoast/shared-system';
import { AUDIT_DEFAULTS, AUDIT_ENV } from '../constants/index.js';

export const auditRetentionConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): AuditRetentionConfig => {
  const chatDays = numberEnv(
    AUDIT_ENV.CHAT_RETENTION_DAYS,
    AUDIT_DEFAULTS.CHAT_RETENTION_DAYS,
    source,
  );
  return {
    retentionDays: numberEnv(
      AUDIT_ENV.RETENTION_DAYS,
      AUDIT_DEFAULTS.RETENTION_DAYS,
      source,
    ),
    overrides: {
      [SecurityTopics.ACCESS]: numberEnv(
        AUDIT_ENV.ACCESS_RETENTION_DAYS,
        AUDIT_DEFAULTS.ACCESS_RETENTION_DAYS,
        source,
      ),
      [TwitchTopics.CHAT]: chatDays,
      [TwitchTopics.PRESENCE]: chatDays,
    },
  };
};
