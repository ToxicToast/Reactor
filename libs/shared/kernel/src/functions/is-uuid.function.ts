import { UUID_PATTERN } from '../constants/index.js';

export const isUuid = (value: unknown): value is string => {
  return typeof value === 'string' && UUID_PATTERN.test(value);
};
