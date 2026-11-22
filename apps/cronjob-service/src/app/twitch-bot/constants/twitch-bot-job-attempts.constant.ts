/** Sync-Jobs laufen regelmäßig (1, 5 bzw. 30 Minuten), ein Retry bringt da nichts */
export const TWITCH_BOT_JOB_ATTEMPTS = {
  SYNC: 1,
} as const;
