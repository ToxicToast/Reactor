import { auditRetentionConfigFromEnv } from './audit-retention-config-from-env.function.js';

describe('auditRetentionConfigFromEnv', () => {
  it('keeps events for a year and denied requests for 30 days by default', () => {
    expect(auditRetentionConfigFromEnv({})).toEqual({
      retentionDays: 365,
      overrides: { 'security.access': 30 },
    });
  });

  it('reads both retentions from the environment', () => {
    expect(
      auditRetentionConfigFromEnv({
        AUDIT_RETENTION_DAYS: '730',
        AUDIT_ACCESS_RETENTION_DAYS: '7',
      }),
    ).toEqual({
      retentionDays: 730,
      overrides: { 'security.access': 7 },
    });
  });
});
