import { truncateText } from '@toxictoast/shared-kernel';
import { WEBHOOK_LIMITS } from '../constants/index.js';

export const truncateWebhookError = (error: string): string => {
  return truncateText(error, WEBHOOK_LIMITS.ERROR_LENGTH);
};
