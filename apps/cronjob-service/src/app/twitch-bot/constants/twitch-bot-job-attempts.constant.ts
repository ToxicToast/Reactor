/** Sync-Jobs laufen minütlich bzw. alle 5 Minuten, ein Retry bringt da nichts */
export const TWITCH_BOT_JOB_ATTEMPTS = {
  SYNC: 1,
} as const;
