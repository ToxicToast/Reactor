import type { AuditRetentionConfig } from '@toxictoast/audit-domain';
import { SecurityTopics, TwitchTopics } from '@toxictoast/contracts-events';
import { numberEnv } from '@toxictoast/shared-system';

export const auditRetentionConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): AuditRetentionConfig => {
  const chatDays = numberEnv('AUDIT_CHAT_RETENTION_DAYS', 7, source);
  return {
    retentionDays: numberEnv('AUDIT_RETENTION_DAYS', 365, source),
    overrides: {
      [SecurityTopics.ACCESS]: numberEnv(
        'AUDIT_ACCESS_RETENTION_DAYS',
        30,
        source,
      ),
      [TwitchTopics.CHAT]: chatDays,
      [TwitchTopics.PRESENCE]: chatDays,
    },
  };
};
