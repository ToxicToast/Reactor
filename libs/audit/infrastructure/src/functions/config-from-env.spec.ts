import { auditRetentionConfigFromEnv } from './audit-retention-config-from-env.function.js';

describe('auditRetentionConfigFromEnv', () => {
  it('keeps events for a year, denied requests for 30 and chat for 7 days by default', () => {
    expect(auditRetentionConfigFromEnv({})).toEqual({
      retentionDays: 365,
      overrides: {
        'security.access': 30,
        'twitch.chat': 7,
        'twitch.presence': 7,
      },
    });
  });

  it('reads all retentions from the environment', () => {
    expect(
      auditRetentionConfigFromEnv({
        AUDIT_RETENTION_DAYS: '730',
        AUDIT_ACCESS_RETENTION_DAYS: '14',
        AUDIT_CHAT_RETENTION_DAYS: '3',
      }),
    ).toEqual({
      retentionDays: 730,
      overrides: {
        'security.access': 14,
        'twitch.chat': 3,
        'twitch.presence': 3,
      },
    });
  });
});
