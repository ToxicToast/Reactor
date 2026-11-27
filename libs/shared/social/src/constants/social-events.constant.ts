/** muss zu SocialTopics, SocialAccountEvents und SocialPostEvents im Contract passen; geprüft in contracts.spec */
export const SOCIAL_EVENTS = {
  ACCOUNT_TOPIC: 'social.account',
  POST_TOPIC: 'social.post',
  OBSERVED: 'observed',
  CHECK_FAILED: 'check_failed',
} as const;
