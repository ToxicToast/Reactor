export const TWITCH_SCHEDULES = {
  CHAT_PURGE: {
    PATTERN_ENV: 'TWITCH_CHAT_PURGE_CRON',
    DEFAULT_PATTERN: '45 3 * * *',
  },
} as const;
