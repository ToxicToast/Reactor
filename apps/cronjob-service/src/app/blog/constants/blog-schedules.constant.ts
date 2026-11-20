export const BLOG_SCHEDULES = {
  MEDIA_CLEANUP: {
    PATTERN_ENV: 'BLOG_MEDIA_CLEANUP_CRON',
    DEFAULT_PATTERN: '0 3 * * *',
  },
} as const;
