import { ADMIN_PATHS } from '../constants/index.js';

const ALLOWED_PREFIXES: ReadonlyArray<string> = [
  ADMIN_PATHS.QUEUES,
  ADMIN_PATHS.TWITCH,
];

export const safeReturnTo = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ADMIN_PATHS.QUEUES;
  }
  if (!ALLOWED_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return ADMIN_PATHS.QUEUES;
  }
  return value;
};
