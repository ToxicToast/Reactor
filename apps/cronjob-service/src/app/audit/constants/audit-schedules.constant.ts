export const AUDIT_SCHEDULES = {
  PURGE_EXPIRED: {
    PATTERN_ENV: 'AUDIT_PURGE_CRON',
    DEFAULT_PATTERN: '30 3 * * *',
  },
} as const;
