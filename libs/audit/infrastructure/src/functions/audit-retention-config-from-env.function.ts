import type { AuditRetentionConfig } from '@toxictoast/audit-domain';
import { SecurityTopics } from '@toxictoast/contracts-events';
import { numberEnv } from '@toxictoast/shared-system';

export const auditRetentionConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): AuditRetentionConfig => {
  return {
    retentionDays: numberEnv('AUDIT_RETENTION_DAYS', 365, source),
    overrides: {
      [SecurityTopics.ACCESS]: numberEnv(
        'AUDIT_ACCESS_RETENTION_DAYS',
        30,
        source,
      ),
    },
  };
};
