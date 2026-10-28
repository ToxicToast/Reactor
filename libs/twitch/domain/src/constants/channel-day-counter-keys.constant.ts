import { SESSION_COUNTER_KEYS } from './session-counter-keys.constant.js';

export const CHANNEL_DAY_COUNTER_KEYS = [
  ...SESSION_COUNTER_KEYS,
  'stream_seconds',
  'unique_chatters',
] as const;
