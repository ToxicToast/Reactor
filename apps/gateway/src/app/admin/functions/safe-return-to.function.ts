import { ADMIN_PATHS } from '../constants/index.js';

export const safeReturnTo = (value: unknown): string => {
  if (typeof value !== 'string' || !value.startsWith(ADMIN_PATHS.QUEUES)) {
    return ADMIN_PATHS.QUEUES;
  }
  return value;
};
