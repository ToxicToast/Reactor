import { WEBHOOK_LIMITS } from '../constants/index.js';

export const truncateWebhookError = (error: string): string => {
  return error.slice(0, WEBHOOK_LIMITS.ERROR_LENGTH);
};
